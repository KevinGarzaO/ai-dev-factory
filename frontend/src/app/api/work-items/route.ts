import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sprintIdStr = searchParams.get('sprintId');
    const projectIdStr = searchParams.get('projectId');

    let whereClause: any = {};
    if (sprintIdStr) whereClause.sprintId = parseInt(sprintIdStr);
    else if (projectIdStr) whereClause.projectId = parseInt(projectIdStr);
    
    const stories = await prisma.workItem.findMany({
      where: { ...whereClause, type: 'story', parentId: null },
      include: {
        children: { orderBy: { id: 'asc' } },
        sprint: true
      },
      orderBy: { id: 'asc' }
    });

    const backlogData = stories.map((st: any) => ({
      id: st.id,
      type: 'story',
      title: st.title,
      state: st.state,
      assignee: st.assignee || 'Unassigned',
      sprint: st.sprint?.name || 'Backlog',
      tasks: st.children.map((t: any) => ({
        id: t.id,
        type: t.type,
        title: t.title,
        desc: t.desc || '',
        aiInstructions: t.aiInstructions || '',
        state: t.state,
        assignee: t.assignee || 'Unassigned'
      }))
    }));

    return NextResponse.json(backlogData);
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: "Failed to load database" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { type, title, desc, aiInstructions, projectId, parentId, sprintId } = await request.json();

    const workItem = await prisma.workItem.create({
      data: {
        type: type.toLowerCase(),
        title,
        desc: desc || '',
        aiInstructions: aiInstructions || '',
        state: 'New',
        projectId: Number(projectId),
        parentId: parentId ? Number(parentId) : null,
        sprintId: sprintId ? Number(sprintId) : null,
        assignee: 'Unassigned'
      }
    });

    return NextResponse.json({ success: true, workItem });
  } catch (e: any) {
    console.error("WorkItem POST error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title, desc, aiInstructions, state, assignee, sprintId } = body;

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const workItem = await prisma.workItem.update({
      where: { id: Number(id) },
      data: {
        title,
        desc,
        aiInstructions,
        state,
        assignee,
        sprintId: sprintId ? Number(sprintId) : null
      }
    });

    return NextResponse.json({ success: true, workItem });
  } catch (e: any) {
    console.error("WorkItem PATCH error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const workItemId = parseInt(id);

    // In case of story, delete children first (manual cascade)
    await prisma.workItem.deleteMany({ where: { parentId: workItemId } });
    await prisma.workItem.delete({ where: { id: workItemId } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("WorkItem DELETE error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
