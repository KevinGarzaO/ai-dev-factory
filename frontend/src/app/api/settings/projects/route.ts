import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET — all projects for this org with teams & members
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = Number(payload.userId);
    const orgId = Number(payload.orgId);

    // FETCH EVERYTHING (Super relaxed for debugging)
    const projects = await prisma.project.findMany({
      include: {
        team: true,
        projectTeams: { include: { team: { include: { memberships: { include: { user: true } } } } } },
        memberships: { include: { user: true, team: true } }
      }
    });

    return NextResponse.json({
      projects,
      debug: {
        userId,
        orgId,
        role: payload.role,
        count: projects.length,
        message: "FORCED GLOBAL LISTING"
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — create project
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, teamId } = await request.json();
    const orgId = Number(payload.orgId);

    let resolvedTeamId = teamId;
    let team;
    if (!teamId) {
      team = await prisma.team.create({ data: { name: `${name} Team`, organizationId: orgId } });
      resolvedTeamId = team.id;
    }

    const project = await prisma.project.create({
      data: {
        name,
        organizationId: orgId,
        teamId: resolvedTeamId,
        sprints: { create: [{ name: 'Sprint 1' }] },
        projectTeams: { create: [{ teamId: resolvedTeamId }] }
      }
    });

    return NextResponse.json({ success: true, project });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH — update project name/description
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId, name, description } = await request.json();
    const updated = await prisma.project.update({
      where: { id: projectId, organizationId: Number(payload.orgId) },
      data: { ...(name ? { name } : {}), ...(description !== undefined ? { description } : {}) }
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
