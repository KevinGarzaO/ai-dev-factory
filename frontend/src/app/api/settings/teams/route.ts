import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, projectId, description } = await request.json();

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const orgId = Number(payload.orgId);

    // 1. Create the team
    const team = await prisma.team.create({
      data: { 
        name, 
        description,
        organizationId: orgId 
      }
    });

    // 2. If projectId provided, link it via ProjectTeam join table
    if (projectId) {
      await prisma.projectTeam.create({
        data: {
          projectId: Number(projectId),
          teamId: team.id
        }
      });
    }

    return NextResponse.json({ success: true, team });
  } catch (e: any) {
    console.error("Team create error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const teams = await prisma.team.findMany({
      where: { organizationId: Number(payload.orgId) },
      include: { 
        projects: true,
        projectTeams: { include: { project: true } },
        memberships: { include: { user: true } }
      }
    });

    return NextResponse.json(teams);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
