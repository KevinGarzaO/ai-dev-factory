import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId, projectId, teamId, role, teamName, projectName, renameDefaults } = await request.json();

    if (renameDefaults) {
      // Rename the default team and project to the user's chosen names
      if (teamName && teamId) {
        await prisma.team.update({ where: { id: teamId }, data: { name: teamName } });
      }
      if (projectName && projectId) {
        await prisma.project.update({ where: { id: projectId }, data: { name: projectName } });
      }
      // Update existing membership role
      const existing = await prisma.userProject.findFirst({ where: { userId, projectId } });
      if (existing) {
        await prisma.userProject.update({ where: { id: existing.id }, data: { role } });
      } else {
        await prisma.userProject.create({ data: { userId, projectId, teamId, role } });
      }
      return NextResponse.json({ success: true });
    }

    // Regular membership upsert
    const membership = await prisma.userProject.upsert({
      where: { userId_projectId: { userId, projectId } },
      update: { teamId, role },
      create: { userId, projectId, teamId, role }
    });
    return NextResponse.json({ success: true, membership });
  } catch (e: any) {
    console.error("Onboarding POST error", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
