import { Prisma } from "@prisma/client";
import { UniqueIdentifier } from "@dnd-kit/core";

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

// Get the types that include all relations
export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    assignee: true;
    column: true;
    tags: true;
  };
}>;

export type ColumnWithTasks = Prisma.ColumnGetPayload<{
  include: {
    tasks: {
      include: {
        assignee: true;
        tags: true;
      };
    };
  };
}>;

export type BoardWithColumns = Prisma.BoardGetPayload<{
  include: {
    columns: {
      include: {
        tasks: {
          include: {
            assignee: true;
            tags: true;
          };
        };
      };
    };
  };
}>;

// DND Kit specific types
export type ColumnId = UniqueIdentifier;
export type TaskId = UniqueIdentifier;

export interface DndTask {
  id: TaskId;
  columnId: ColumnId;
  title: string;
}

export interface DndColumn {
  id: ColumnId;
  title: string;
  taskIds: TaskId[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface TaskMoveRequest {
  newColumnId: string;
  newOrder: number;
}

export interface TaskCreateRequest {
  title: string;
  columnId: string;
  priority?: Priority;
  description?: string;
}

export interface ColumnCreateRequest {
  name: string;
  boardId: string;
}
