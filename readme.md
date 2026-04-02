# 🏗️ AI Dev Factory (Transformateck Edition)

¡Bienvenidos a **AI Dev Factory**! Este es un proyecto **Open Source** creado para la comunidad de **Transformateck**. Es una plataforma de automatización de desarrollo de software que utiliza agentes inteligentes basados en la API de Anthropic (Claude-3.5) para gestionar tareas, generar código y administrar sprints de forma autónoma.

Este proyecto está diseñado para ser una herramienta de colaboración masiva. **Cualquier persona que quiera colaborar, proponer mejoras o realizar modificaciones es bienvenida**, siempre que se sigan las reglas de arquitectura y diseño del proyecto.

---

## 🚀 Características Principales

- **Dashboard Estilo Enterprise**: Interfaz inspirada en Azure DevOps/GitHub con Backlog manejable y Tablero de Sprint (Sprint Board).
- **Agente Autónomo Integrado**: Un agente (Claude-3.5 Haiku) que vive en el sistema, lee tus tareas y ejecuta cambios directamente en el código.
- **Terminal "Always-On"**: Consola persistente en tiempo real para monitorear cada paso que da la IA.
- **Instrucciones Técnicas para IA**: Campo dedicado en cada tarea para guiar al agente con precisión quirúrgica.
- **Diseño Premium**: UI moderna con efectos de cristal (glassmorphism), animaciones fluidas y una experiencia de usuario de alto nivel.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [Next.js 14/15](https://nextjs.org/) (App Router), React 19, TailwindCSS, FontAwesome.
- **Backend**: Node.js, Express, TSX.
- **Base de Datos**: PostgreSQL alojado en [Supabase](https://supabase.com/).
- **ORM**: [Prisma](https://www.prisma.io/).
- **AI Engine**: [Anthropic SDK](https://www.anthropic.com/api) (Claude-3.5 Haiku).

---

## 📦 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/ai-dev-factory.git
cd ai-dev-factory
```

### 2. Configurar variables de entorno
Copia el archivo `.env.example` a `.env` tanto en la raíz como en la carpeta `frontend/` y rellena los valores:
```bash
cp .env.example .env
cp .env.example frontend/.env
```

### 3. Instalar dependencias
```bash
# En la raíz
npm install

# En la carpeta frontend
cd frontend && npm install && cd ..
```

### 4. Preparar la Base de Datos
Asegúrate de tener tus credenciales de Supabase en el `.env` y ejecuta:
```bash
npx prisma generate
npx prisma db push
```

---

## 🚦 Cómo Ejecutar el Proyecto

El proyecto requiere que tanto el backend como el frontend estén corriendo simultáneamente.

### Ejecutar Backend (Agente y Servidor API)
```bash
npm run dev
```

### Ejecutar Frontend (Dashboard Next.js)
```bash
cd frontend
npm run dev
```

---

## 🤝 Cómo Colaborar

¡Nos encanta recibir ayuda de la comunidad! Si quieres mejorar el proyecto, sigue estos pasos:

1. **Haz un Fork** del proyecto.
2. **Crea una Rama** para tu feature (`git checkout -b feature/NuevaMejora`).
3. **Sigue las Reglas de Diseño**: El proyecto utiliza un estilo "Standard IDE". Mantén la consistencia visual y el uso de componentes globales como `.glass-panel`, `.action-btn` y `.breadcrumbs`.
4. **Valida con la IA**: Si añades lógica de agente, pruébala en la terminal integrada.
5. **Envía un Pull Request**.

---

## ⚖️ Licencia y Comunidad

Este es un proyecto impulsado por la comunidad de **Transformateck**. El uso, modificación y distribución están permitidos bajo el espíritu de colaboración abierta.

**¡Hagamos que la IA construya el futuro con nosotros!** 🚀🤖✨