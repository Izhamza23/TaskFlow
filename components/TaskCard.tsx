"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskWithRelations, Priority } from "@/types";
import { format, isPast } from "date-fns";

interface TaskCardProps {
  task: TaskWithRelations;
  isDragging?: boolean;
}

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  [Priority.LOW]: { bg: "bg-blue-100", text: "text-blue-700" },
  [Priority.MEDIUM]: { bg: "bg-yellow-100", text: "text-yellow-700" },
  [Priority.HIGH]: { bg: "bg-orange-100", text: "text-orange-700" },
  [Priority.URGENT]: { bg: "bg-red-100", text: "text-red-700" },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const [showDetails, setShowDetails] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const isOverdue =
    task.dueDate && isPast(new Date(task.dueDate));
  const priorityColor =
    PRIORITY_COLORS[task.priority as Priority] ||
    PRIORITY_COLORS[Priority.MEDIUM];

  const getInitials = (name?: string | null) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setShowDetails(true)}
        className={`
          p-3 bg-white border border-gray-200 rounded-lg cursor-move
          hover:shadow-md hover:border-gray-300 transition-all
          ${isSortableDragging ? "shadow-lg border-gray-400" : ""}
          ${isDragging ? "opacity-50" : ""}
        `}
      >
        {/* Title */}
        <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
          {task.title}
        </h3>

        {/* Metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Badge */}
            <span
              className={`
                text-xs font-semibold px-2 py-1 rounded
                ${priorityColor.bg} ${priorityColor.text}
              `}
            >
              {task.priority}
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <span
                className={`
                  text-xs font-medium px-2 py-1 rounded
                  ${
                    isOverdue
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }
                `}
              >
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
          </div>

          {/* Assignee Avatar */}
          {task.assignee && (
            <div
              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
              title={task.assignee.name || task.assignee.email || ""}
            >
              {getInitials(task.assignee.name)}
            </div>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  border: `1px solid ${tag.color}`,
                }}
              >
                {tag.name}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs px-2 py-1 rounded-full text-gray-500">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Task Detail Modal (Stub) */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{task.title}</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {task.description && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Priority</h3>
                <span
                  className={`
                    text-sm font-semibold px-3 py-1 rounded inline-block
                    ${priorityColor.bg} ${priorityColor.text}
                  `}
                >
                  {task.priority}
                </span>
              </div>

              {task.dueDate && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Due Date</h3>
                  <p className={isOverdue ? "text-red-600 font-semibold" : ""}>
                    {format(new Date(task.dueDate), "MMMM d, yyyy")}
                  </p>
                </div>
              )}

              {task.assignee && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Assigned To
                  </h3>
                  <p className="text-gray-700">
                    {task.assignee.name || task.assignee.email}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
