import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET ?token=xxx — validate token, return invitation details
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (token) {
      const inv = await prisma.invitation.findUnique({
        where: { token },
        include: { organization: true, project: true, team: true }
      });
      if (!inv) return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
      if (inv.usedAt) return NextResponse.json({ error: 'Este link ya fue utilizado' }, { status: 400 });
      if (inv.expiresAt && new Date() > inv.expiresAt) return NextResponse.json({ error: 'Link expirado' }, { status: 400 });

      return NextResponse.json({
        orgId: inv.organizationId,
        orgName: inv.organization.name,
        projectId: inv.projectId,
        projectName: inv.project?.name ?? null,
        teamId: inv.teamId,
        teamName: inv.team?.name ?? null,
        role: inv.role,
        projectRole: inv.projectRole
      });
    }

    // GET without token — list invitations for org admin
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    if (!authToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(authToken);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const invitations = await prisma.invitation.findMany({
      where: { organizationId: payload.orgId as number },
      include: { project: true, team: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(invitations);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — create an invitation
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    if (!authToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(authToken);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { email, projectId, teamId, role, projectRole } = await request.json();

    const invitation = await prisma.invitation.create({
      data: {
        organizationId: payload.orgId as number,
        projectId: projectId || null,
        teamId: teamId || null,
        email: email || null,
        role: role || 'member',
        projectRole: projectRole || 'Developer',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return NextResponse.json({ success: true, token: invitation.token });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
