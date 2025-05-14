"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { Column } from "@/components/Column";
import { TaskCard } from "@/components/TaskCard";
import { BoardWithColumns, TaskWithRelations } from "@/types";
import type { UniqueIdentifier } from "@dnd-kit/core";

interface BoardProps {
  board: BoardWithColumns;
}

export const Board: React.FC<BoardProps> = ({ board }) => {
  const [columns, setColumns] = useState(board.columns);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Prevent no-op transactions
    if (activeId === overId) return;

    // Find the active task and column
    let activeTask: TaskWithRelations | null = null;
    let activeColumnId: string | null = null;

    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === activeId);
      if (task) {
        activeTask = task;
        activeColumnId = column.id;
        break;
      }
    }

    if (!activeTask) return;

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== activeId),
      }));

      // Find the target column
      const overColumn = newColumns.find(
        (col) => col.id === overId || col.tasks.some((t) => t.id === overId)
      );

      if (overColumn) {
        // Calculate new order
        const overIndex = overColumn.tasks.findIndex((t) => t.id === overId);
        const newOrder =
          overIndex >= 0 ? overIndex : overColumn.tasks.length;

        // Create updated task
        const updatedTask = {
          ...activeTask,
          columnId: overColumn.id,
          order: newOrder,
        };

        // Insert task at new position
        overColumn.tasks.splice(newOrder, 0, updatedTask);

        // Reorder tasks in the column
        overColumn.tasks = overColumn.tasks.map((task, index) => ({
          ...task,
          order: index,
        }));
      }

      return newColumns;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;

    if (!over) return;

    // Find the task and its new position
    let movedTask: TaskWithRelations | null = null;
    let newColumnId: string | null = null;
    let newOrder: number = 0;

    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === active.id);
      if (task) {
        movedTask = task;
        newColumnId = column.id;
        newOrder = task.order;
        break;
      }
    }

    if (!movedTask || !newColumnId) return;

    try {
      // Persist to database
      const response = await fetch(`/api/tasks/${movedTask.id}/move`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newColumnId,
          newOrder,
        }),
      });

      if (!response.ok) {
        // Revert on error
        setColumns(board.columns);
      }
    } catch (error) {
      console.error("Error moving task:", error);
      // Revert on error
      setColumns(board.columns);
    }
  };

  const activeTask = activeId
    ? columns
        .flatMap((col) => col.tasks)
        .find((task) => task.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto p-6 bg-gray-50 min-h-screen">
        {columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
};
