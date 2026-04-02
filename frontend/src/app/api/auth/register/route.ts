import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { companyName, name, email, password } = await request.json();

    if (!companyName || !name || !email || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    // Step 1: Create the Organization
    const org = await prisma.organization.create({ data: { name: companyName } });

    // Step 2: Create the default Team
    const team = await prisma.team.create({
      data: { name: "Default Team", organizationId: org.id }
    });

    // Step 3: Create the default Project (now organizationId is known)
    const project = await prisma.project.create({
      data: {
        name: "Main Project",
        organizationId: org.id,
        teamId: team.id,
        sprints: { create: [{ name: "Sprint 1" }] },
        projectTeams: { create: [{ teamId: team.id }] }
      }
    });

    // Step 4: Create the admin user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "org_admin",
        organizationId: org.id
      }
    });

    // Step 5: Create initial membership
    await prisma.userProject.create({
      data: {
        userId: user.id,
        projectId: project.id,
        teamId: team.id,
        role: "Project Manager"
      }
    });

    const token = await signToken({ userId: user.id, email, orgId: org.id });
    const response = NextResponse.json({
      success: true,
      orgId: org.id,
      userId: user.id,
      orgName: companyName,
      defaultTeamId: team.id,
      defaultProjectId: project.id
    });
    response.cookies.set({ name: 'auth_token', value: token, httpOnly: true, path: '/', maxAge: 60 * 60 * 24 });

    return response;
  } catch (error: any) {
    console.error("Register Error:", error?.message, error);
    return NextResponse.json({ error: `Error: ${error?.message || "Registration failed"}` }, { status: 500 });
  }
}
