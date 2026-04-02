import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "Transformateck",
      teams: {
        create: [
          {
            name: "Cargalo Team APP",
            projects: {
              create: [
                {
                  name: "Cárgalo",
                  sprints: {
                    create: [
                      { name: "Sprint 19" }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    include: {
      teams: {
        include: {
          projects: {
            include: {
              sprints: true
            }
          }
        }
      }
    }
  });

  const sprintId = org.teams[0].projects[0].sprints[0].id;
  const projectId = org.teams[0].projects[0].id;

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
