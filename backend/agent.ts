import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import dotenv from "dotenv";

dotenv.config();

const execAsync = promisify(exec);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 1. ECONOMÍA EN EL PROMPT: Las descripciones de las herramientas consumen tokens CADA VEZ. 
// Reducimos al mínimo necesario la semántica para que Haiku entienda qué hacer gastando los mínimos tokens.
const tools: Anthropic.Tool[] = [
  {
    name: "read_file",
    description: "Lee archivo.",
    input_schema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
  },
  {
    name: "write_file",
    description: "Escribe archivo.",
    input_schema: { type: "object", properties: { path: { type: "string" }, content: { type: "string" } }, required: ["path", "content"] },
  },
  {
    name: "run_command",
    description: "Ejecuta terminal.",
    input_schema: { type: "object", properties: { command: { type: "string" } }, required: ["command"] },
  },
  {
    name: "task_completed",
    description: "Fin tarea.",
    input_schema: { type: "object", properties: { summary: { type: "string" } }, required: ["summary"] },
  },
];

// 2. ECONOMÍA DE HISTORIAL (INPUT TOKENS): 
// El costo más alto de un agente iterativo es cuando lee respuestas inmensas miles de veces.
async function executeTool(name: string, input: any): Promise<string> {
  try {
    let result = "";
    switch (name) {
      case "read_file":
        result = fs.readFileSync(input.path, "utf-8");
        // Optimizador: Truncamos a 8000 caracteres. Si lee archivos masivos no tirará tu dinero.
        return result.length > 8000 ? result.substring(0, 8000) + "\n[TRUNCADO X ECONOMIA]" : result;
        
      case "write_file":
        fs.mkdirSync(path.dirname(input.path), { recursive: true });
        fs.writeFileSync(input.path, input.content);
        return "OK"; // Input de éxito cortísimo en lugar de frases largas.
        
      case "run_command":
        const { stdout, stderr } = await execAsync(input.command);
        result = stdout || stderr || "OK";
        // Comandos como 'npm install' devuelven un texto inmenso. Truncar a 2500 reduce costos masivamente.
        return result.length > 2500 ? result.substring(0, 2500) + "\n[TRUNCADO X ECONOMIA]" : result;
        
      case "task_completed":
        return "OK";
        
      default:
        return "ERR: Tool?";
    }
  } catch (error: any) {
    // Los errores también se limitan, Node arroja a veces volcados de memoria inmensos.
    return `ERR: ${error.message.substring(0, 500)}`;
  }
}

export async function runAgent(task: string, onEvent: (msg: string, type: 'agent' | 'sys' | 'user' | 'done') => void) {
  onEvent(`🚀 Tarea Recibida: "${task}"`, 'user');
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: task }];
  const MAX_STEPS = 15;

  for (let i = 0; i < MAX_STEPS; i++) {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192, // Volvemos a aumentarlo para permitir archivos HTML o código de gran tamaño sin que se trunque
      system: `Actúa como un ingeniero senior dentro de un proyecto de software YA EXISTENTE.

REGLA DE COMPORTAMIENTO:
Si la petición del usuario es una simple pregunta, un saludo (ej: 'hola', 'cómo estás') o algo que no requiere modificar código, SIMPLEMENTE RESPÓNDELE y llama a 'task_completed' inmediatamente. 
SOLO SI el usuario te pide implementar una FEATURE (funcionalidad), aplica el siguiente PIPELINE OBLIGATORIO.

Tu objetivo al implementar una FEATURE completa en el proyecto actual es respetar la arquitectura y el código existente sin romper funcionalidad previa. NO crees un proyecto nuevo. Trabaja sobre el código existente.

PIPELINE OBLIGATORIO (SOLO PARA FEATURES):
1. ANALYZE (Identifica tecnologías, carpetas y patrones)
2. PLAN (Define qué archivos crear/modificar y su integración)
3. IMPLEMENT (Implementa lógica/UI respetando patrones)
4. INTEGRATE (Conecta la feature con el sistema)
5. EXECUTE (Verifica que compile y funcione)
6. DEBUG & FIX (Detecta y corrige errores automáticamente)
7. POLISH (Mejora y asegura buena experiencia)

REGLAS GENERALES STRICTAS:
- TÚ ERES UN PROCESO HEADLESS. NO le hagas preguntas al usuario, él no puede responderte en medio del proceso. Usa tu mejor criterio para inferir lo que falta o asume los parámetros.
- UNA VEZ CUMPLIDA LA TAREA ORGINAL, LLAMA INMEDIATAMENTE a 'task_completed'. No inventes ni agregues features nuevas que no se te pidieron explícitamente.
- TODAS TUS RESPUESTAS textuales deben ser extremadamente cortas y simples. Ve directo al grano sin preámbulos, no escribas párrafos largos.
- ESTRICTAMENTE PROHIBIDO intentar programar toda la aplicación de un solo golpe. Construye cosas MUY BASICAS primero (esqueleto MVC, HTML vacío) e ITERA paso a paso repitiendo tool calls en el proceso, NO pidiendo permiso.
- ESTRICTAMENTE PROHIBIDO llamar a 'task_completed' sin haber creado/modificado los archivos necesarios de la Feature mediante 'write_file'.
- ESTRICTAMENTE PROHIBIDO llamar a 'task_completed' sin antes haber VALIDADO tu código usando la herramienta 'run_command' (ej. para probar que compile o corra el server/script).
- NO rompas funcionalidades existentes
- Respeta naming conventions y usa buenas prácticas.`,
      messages,
      tools,
    });

    messages.push({ role: "assistant", content: response.content });
    let isDone = false;
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === "tool_use") {
        onEvent(`🛠️ Ejecutando: ${block.name}(...)`, 'sys');
        if (block.name === "task_completed") isDone = true;
        const resultStr = await executeTool(block.name, block.input);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: resultStr });
      } else if (block.type === "text" && block.text.trim().length > 0) {
        onEvent(`🤖: ${block.text}`, 'agent');
      }
    }

    if (isDone) {
      onEvent(`🎯 Fin de Ejecución Exitosa.`, 'agent');
      onEvent('FIN', 'done');
      break;
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    } else {
      messages.push({ role: "user", content: "Sigue" }); // Un input "Sigue" gasta apenas 1 token.
    }
    
    // Si se queda atascado por el limite y no llama DONE
    if (i === MAX_STEPS - 1 && !isDone) {
       onEvent(`Límite máximo de iteraciones alcanzado.`, 'sys');
       onEvent('FIN', 'done');
    }
  }
}

if (require.main === module) {
  const task = process.argv.slice(2).join(" ") || "Haz un dir";
  runAgent(task, (m, t) => console.log(`[${t.toUpperCase()}]: ${m}`)).catch(console.error);
}
