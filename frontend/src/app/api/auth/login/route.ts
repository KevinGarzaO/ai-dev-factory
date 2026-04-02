import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          include: {
            teams: {
              include: { projects: true }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Recover Enterprise topology references directly from relations
    const orgName = user.organization?.name || "Unknown";
    let teamName = "Unknown";
    let projectName = "Unknown";

    if (user.organization?.teams.length) {
      teamName = user.organization.teams[0].name;
      if (user.organization.teams[0].projects.length) {
        projectName = user.organization.teams[0].projects[0].name;
      }
    }

    const token = await signToken({ userId: user.id, email: user.email, orgId: user.organizationId });
    
    const response = NextResponse.json({ success: true, user: { name: user.name, email: user.email }, orgId: user.organizationId, orgName, teamName, projectName });
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
