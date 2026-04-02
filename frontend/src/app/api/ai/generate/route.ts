import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, projectId, sprintId } = body;

    let generatedTasks = [];

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-key-here') {
       // MOCK MODE: Return simulated tasks if no key
       console.warn("Using MOCK AI MODE - No API Key found");
       
       const p = prompt.toLowerCase();
        if (p.includes('autenticacion') || p.includes('auth') || p.includes('login')) {
          generatedTasks = [
            { title: "Configurar Provider de Autenticación (JWT/NextAuth)", desc: "Establecer la infraestructura base.", aiInstructions: "1. Instalar next-auth y prisma-adapter. 2. Configurar el endpoint /api/auth/[...nextauth] con JWT. 3. Definir la sesión en el layout global.", type: "task" },
            { title: "Crear Pantalla de Login (UI)", desc: "Formulario con estilos glassmorphism.", aiInstructions: "1. Usar un form con onSubmit. 2. Implementar estados de carga. 3. Aplicar backdrop-filter: blur(16px) al contenedor.", type: "task" },
            { title: "API Endpoint de Registro de Usuarios", desc: "Ruta POST con hashing bcrypt.", aiInstructions: "1. Recibir email/password. 2. Validar si el usuario existe. 3. Hashear password antes de guardar en la DB.", type: "task" }
          ];
        } else {
          generatedTasks = [
            { title: `Analizar requerimientos de ${prompt}`, desc: "Investigar requisitos técnicos.", aiInstructions: "1. Revisar la arquitectura actual. 2. Identificar dependencias necesarias. 3. Crear documento de diseño técnico.", type: "task" },
            { title: `Implementar componente core de ${prompt}`, desc: "Programar la lógica principal.", aiInstructions: "1. Seguir patrones de Atomic Design. 2. Asegurar que los componentes sean stateless si es posible. 3. Implementar tests unitarios.", type: "task" }
          ];
        }
    } else {
      const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1500,
        system: `You are an Agile Product Owner AI. Return ONLY a pure JSON array of tasks based on the user's prompt. 
        Schema: [{"title": "Short action", "desc": "Context text", "type": "task", "aiInstructions": "Step by step technical guide for a developer agent to follow"}]`,
        messages: [{ role: "user", content: prompt }]
      });

      const block = response.content[0];
      if (block.type === 'text') {
        generatedTasks = JSON.parse(block.text);
      }
    }

    if (generatedTasks.length > 0) {

      // Create a Parent Story automatically representing the generated feature
      const story = await prisma.workItem.create({
        data: {
          type: "story",
          title: "Generado por IA: " + prompt.substring(0, 100),
          state: "New",
          assignee: "Claude 4",
          projectId: parseInt(projectId) || 1,
          sprintId: sprintId ? parseInt(sprintId) : null,
          children: {
            create: generatedTasks.map((t: any) => ({
              type: "task",
              title: t.title,
              desc: t.desc || '',
              aiInstructions: t.aiInstructions || '',
              state: "New",
              assignee: "Unassigned",
              projectId: parseInt(projectId) || 1,
              sprintId: sprintId ? parseInt(sprintId) : null
            }))
          }
        }
      });

      return NextResponse.json({ success: true, storyId: story.id });
    }
  } catch (error: any) {
    console.error("AI Generation Error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
