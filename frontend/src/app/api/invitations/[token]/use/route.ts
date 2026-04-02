import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

const prisma = new PrismaClient();

// POST — register via invitation token
export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { name, email, password } = await request.json();
    const { token } = params;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: true, project: true, team: true }
    });

    if (!invitation) return NextResponse.json({ error: 'Invitación inválida' }, { status: 404 });
    if (invitation.usedAt) return NextResponse.json({ error: 'Esta invitación ya fue utilizada' }, { status: 400 });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 });

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: invitation.role,
        organizationId: invitation.organizationId
      }
    });

    // Create membership if project is assigned
    if (invitation.projectId && invitation.teamId) {
      await prisma.userProject.create({
        data: {
          userId: user.id,
          projectId: invitation.projectId,
          teamId: invitation.teamId,
          role: invitation.projectRole
        }
      });
    }

    // Mark token as used
    await prisma.invitation.update({
      where: { token },
      data: { usedAt: new Date() }
    });

    const jwtToken = await signToken({ userId: user.id, email, orgId: invitation.organizationId });
    const response = NextResponse.json({ success: true });
    response.cookies.set({ name: 'auth_token', value: jwtToken, httpOnly: true, path: '/', maxAge: 60 * 60 * 24 });
    return response;
  } catch (e: any) {
    console.error("Invite register error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
