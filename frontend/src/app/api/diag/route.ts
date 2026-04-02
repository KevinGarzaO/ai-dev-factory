import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    let payload = null;
    if (token) payload = await verifyToken(token);

    const stats = {
      users: await prisma.user.count(),
      orgs: await prisma.organization.count(),
      projects: await prisma.project.count(),
      teams: await prisma.team.count(),
      memberships: await prisma.userProject.count(),
      workItems: await prisma.workItem.count()
    };

    let currentUser = null;
    if (payload?.userId) {
      currentUser = await prisma.user.findUnique({
        where: { id: Number(payload.userId) },
        include: { organization: true, memberships: { include: { project: true } } }
      });
    }

    return NextResponse.json({
      success: true,
      session: payload,
      dbStats: stats,
      currentUser
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
