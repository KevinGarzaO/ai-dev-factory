import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const sprints = await prisma.sprint.findMany({
      where: { projectId: parseInt(projectId) },
      orderBy: { startDate: "asc" },
      include: { children: true }
    });

    return NextResponse.json(sprints);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, startDate, endDate, location, projectId, parentId } = body;

    if (!name || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sprint = await prisma.sprint.create({
      data: {
        name,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location,
        projectId: parseInt(projectId),
        parentId: parentId ? parseInt(parentId) : null
      }
    });

    return NextResponse.json(sprint);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, startDate, endDate, location, parentId } = body;

    const sprint = await prisma.sprint.update({
      where: { id: parseInt(id) },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location,
        parentId: parentId ? parseInt(parentId) : null
      }
    });

    return NextResponse.json(sprint);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Note: In a real app we'd handle cascading children or reassigning work items.
    // For now, we'll just delete the sprint.
    await prisma.sprint.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
