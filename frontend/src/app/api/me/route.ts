import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const userId = payload.userId as number;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        memberships: {
          include: {
            project: true,
            team: true
          }
        }
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const membership = user.memberships[0] ?? null;

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      orgId: user.organizationId,
      orgName: user.organization?.name ?? "",
      role: membership?.role ?? user.role,
      projectId: membership?.projectId ?? null,
      projectName: membership?.project.name ?? "",
      teamId: membership?.teamId ?? null,
      teamName: membership?.team.name ?? "",
      organization: user.organization
    });
  } catch (e: any) {
    console.error("ME error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
