import { NextRequest, NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface MoveTaskRequest {
  newColumnId: string;
  newOrder: number;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: MoveTaskRequest = await request.json();
    const { newColumnId, newOrder } = body;
    const taskId = params.id;

    // Verify task exists and user has access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: { include: { board: true } } },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const board = task.column.board;
    const isOwner = board.ownerId === session.user.id;
    const isMember = board.members.some((m) => m.id === session.user.id);

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Verify target column exists
    const targetColumn = await prisma.column.findUnique({
      where: { id: newColumnId },
      include: { board: true },
    });

    if (!targetColumn || targetColumn.board.id !== board.id) {
      return NextResponse.json(
        { error: "Invalid target column" },
        { status: 400 }
      );
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: newColumnId,
        order: newOrder,
      },
      include: {
        assignee: true,
        tags: true,
        column: true,
      },
    });

    // Reorder other tasks in both the old and new columns
    if (task.columnId !== newColumnId) {
      // Reorder tasks in old column
      const oldColumnTasks = await prisma.task.findMany({
        where: { columnId: task.columnId },
        orderBy: { order: "asc" },
      });

      for (let i = 0; i < oldColumnTasks.length; i++) {
        if (oldColumnTasks[i].id !== taskId) {
          await prisma.task.update({
            where: { id: oldColumnTasks[i].id },
            data: { order: i },
          });
        }
      }
    }

    // Reorder tasks in new column
    const newColumnTasks = await prisma.task.findMany({
      where: { columnId: newColumnId },
      orderBy: { order: "asc" },
    });

    for (let i = 0; i < newColumnTasks.length; i++) {
      if (newColumnTasks[i].id !== taskId) {
        await prisma.task.update({
          where: { id: newColumnTasks[i].id },
          data: { order: i },
        });
      }
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error moving task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
