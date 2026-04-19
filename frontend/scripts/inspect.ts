import { PrismaClient, Project, Organization, Team, User } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany();
  const orgs = await prisma.organization.findMany();
  const teams = await prisma.team.findMany();
  const users = await prisma.user.findMany();

  console.log("PROJECTS:", projects.length);
  projects.forEach((p: Project) => console.log(`- ${p.id}: ${p.name} (Org: ${p.organizationId})`));
  
  console.log("ORGS:", orgs.length);
  orgs.forEach((o: Organization) => console.log(`- ${o.id}: ${o.name}`));

  console.log("TEAMS:", teams.length);
  teams.forEach((t: Team) => console.log(`- ${t.id}: ${t.name}`));

  console.log("USERS:", users.length);
  users.forEach((u: User) => console.log(`- ${u.id}: ${u.name} (${u.email}) Org: ${u.organizationId}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());