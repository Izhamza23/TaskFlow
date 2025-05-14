"use client";

import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "@/components/TaskCard";
import { ColumnWithTasks } from "@/types";

interface ColumnProps {
  column: ColumnWithTasks;
  onTaskCreate?: (columnId: string, title: string) => Promise<void>;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  onTaskCreate,
}) => {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsLoading(true);
    try {
      if (onTaskCreate) {
        await onTaskCreate(column.id, newTaskTitle);
      } else {
        // Default API call
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTaskTitle,
            columnId: column.id,
          }),
        });

        if (response.ok) {
          setNewTaskTitle("");
          setIsAdding(false);
        }
      }
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className="bg-white rounded-lg shadow-sm min-w-72 flex flex-col max-h-screen"
    >
      {/* Column Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{column.name}</h2>
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
            {column.tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <SortableContext
        items={taskIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      {/* Add Task Input */}
      <div className="border-t border-gray-200 p-4">
        {isAdding ? (
          <form onSubmit={handleAddTask} className="space-y-2">
            <input
              type="text"
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !newTaskTitle.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                {isLoading ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskTitle("");
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full text-left px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
};
