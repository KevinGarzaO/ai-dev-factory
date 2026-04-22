import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Step 1: Create Organization
  const org = await prisma.organization.create({
    data: { name: "Transformateck" }
  });

  // Step 2: Create Team
  const team = await prisma.team.create({
    data: {
      name: "Cargalo Team APP",
      organizationId: org.id
    }
  });

  // Step 3: Create Project
  const project = await prisma.project.create({
    data: {
      name: "Cárgalo",
      organizationId: org.id,
      teamId: team.id,
      sprints: {
        create: [
          { name: "Sprint 19" }
        ]
      }
    },
    include: {
      sprints: true
    }
  });

  const sprintId = project.sprints[0].id;
  const projectId = project.id;

  // Create Parent User Story
  const story = await prisma.workItem.create({
    data: {
      type: "story",
      title: "Sistema Integrado de Autenticación",
      state: "Active",
      assignee: "Unassigned",
      projectId: projectId,
      sprintId: sprintId,
      children: {
        create: [
          {
            type: "task",
            title: "Configurar Prisma ORM y Base de Datos",
            state: "Done",
            assignee: "Claude 4",
            projectId: projectId,
            sprintId: sprintId
          },
          {
            type: "task",
            title: "Crear Endpoint de IA Generativa",
            state: "In Progress",
            assignee: "Claude 4",
            projectId: projectId,
            sprintId: sprintId
          }
        ]
      }
    }
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
