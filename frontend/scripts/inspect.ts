import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany();
  const orgs = await prisma.organization.findMany();
  const teams = await prisma.team.findMany();
  const users = await prisma.user.findMany();

  console.log("PROJECTS:", projects.length);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects.forEach((p: any) => console.log(`- ${p.id}: ${p.name} (Org: ${p.organizationId})`));
  
  console.log("ORGS:", orgs.length);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orgs.forEach((o: any) => console.log(`- ${o.id}: ${o.name}`));

  console.log("TEAMS:", teams.length);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  teams.forEach((t: any) => console.log(`- ${t.id}: ${t.name}`));

  console.log("USERS:", users.length);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users.forEach((u: any) => console.log(`- ${u.id}: ${u.name} (${u.email}) Org: ${u.organizationId}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());