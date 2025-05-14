# TaskFlow

A minimal full-stack task and project management app with drag-and-drop Kanban boards, deadline tracking, and team assignment — built with Next.js and a PostgreSQL backend.

## What It Does

TaskFlow lets teams organize work into Kanban-style boards with customizable columns (e.g., To Do, In Progress, Done). Tasks can be assigned to users, tagged, given due dates, and moved between columns via drag-and-drop. A real-time activity feed tracks changes. Built as a lightweight self-hosted alternative to Jira or Trello, focusing on simplicity and fast setup.

## Tech Stack

- **Next.js (App Router)** — full-stack React framework
- **TypeScript** — type-safe frontend and API routes
- **PostgreSQL** — relational database for tasks and users
- **Prisma** — ORM for schema management and migrations
- **NextAuth.js** — authentication (email + OAuth)
- **Tailwind CSS** — utility-first styling
- **dnd-kit** — drag-and-drop Kanban interactions

## Features

- Kanban board with drag-and-drop task reordering across columns
- Task assignment, tagging, priority levels, and due dates
- User authentication via NextAuth (email + GitHub OAuth)
- Activity log — tracks who moved or edited each task
- Board-level search and filter by assignee, tag, or status
- Responsive layout — works on desktop and tablet

## Project Structure

```
taskflow/
├── app/
│   ├── (auth)/
│   │   └── login/           # Auth pages
│   ├── board/
│   │   └── [boardId]/       # Dynamic board view
│   └── api/
│       └── tasks/           # REST API routes
├── components/
│   ├── Board.tsx
│   ├── TaskCard.tsx
│   └── Column.tsx
├── lib/
│   ├── prisma.ts
│   └── auth.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

## Getting Started

```bash
git clone https://github.com/Izhamza23/TaskFlow.git
cd TaskFlow
npm install
cp .env.example .env.local   # add PostgreSQL URL and auth secrets
npx prisma migrate dev
npm run dev
```

## Status

🚧 Work in progress — Kanban board and task CRUD working, activity feed and team invite flow in development.
