import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import { Board } from "@/components/Board";

interface BoardPageProps {
  params: {
    boardId: string;
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const session = await getServerAuth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Fetch board with all relations
  const board = await prisma.board.findUnique({
    where: { id: params.boardId },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
            include: {
              assignee: true,
              tags: true,
            },
          },
        },
      },
    },
  });

  if (!board) {
    redirect("/boards");
  }

  // Check authorization
  const isOwner = board.ownerId === session.user.id;
  const isMember = board.members.some((m) => m.id === session.user.id);

  if (!isOwner && !isMember) {
    redirect("/boards");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
        <p className="text-gray-600 text-sm mt-1">
          {board.columns.length} columns · {board.columns.reduce((sum, col) => sum + col.tasks.length, 0)} tasks
        </p>
      </div>

      <Board board={board} />
    </main>
  );
}
