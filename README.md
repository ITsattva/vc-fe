# Task Tracker — Frontend

A minimal React + Vite admin UI for the Task Tracker Spring Boot backend.
It manages **Tasks**, **Projects**, and **Users** with full CRUD plus the
assign actions (assign user/project to a task, assign an owner to a project).

## Prerequisites

- Node.js 18+ and npm
- The Task Tracker backend running at **http://localhost:8080**

## Running

1. **Start the backend first** on port 8080 (from the `task-tracker` folder):

   ```bash
   ./mvnw spring-boot:run
   ```

2. **Start the frontend** (from this `frontend` folder):

   ```bash
   npm install
   npm run dev
   ```

3. Open the URL Vite prints (default http://localhost:5173).

## How it talks to the backend

The backend exposes endpoints at the root (no `/api` prefix) and has no CORS
configuration, so this app uses a **Vite dev proxy** instead of calling the
backend directly. The browser calls relative paths (`/tasks`, `/projects`,
`/users`) and Vite forwards them to `http://localhost:8080` — see
[`vite.config.js`](./vite.config.js). All requests/responses are JSON.

Because the backend has no global exception handler, "not found" and
validation errors can come back as HTTP 400/500. The API layer
([`src/api.js`](./src/api.js)) normalizes any non-2xx response into a readable
message, and each page shows it in an error banner.

## Project layout

```
src/
  api.js                 Centralized API layer (axios) for tasks/projects/users
  constants.js           Status/priority/role enums + helpers
  App.jsx                Top nav + routes
  components/Badge.jsx   Color-coded status/priority labels
  pages/
    TasksPage.jsx        Task list, create/edit form, assign user & project
    ProjectsPage.jsx     Project list, create/edit form, assign owner
    UsersPage.jsx        User list, create/edit form (password only on create)
```

## Notes on the data model

- **Tasks:** `assigneeId` and `projectId` are read-only in create/edit and are
  set via the dedicated assign endpoints (the dropdowns in the table rows).
- **Users:** `password` is write-only — the API never returns it. It is only
  collected when creating a user (or optionally to change it on edit) and is
  never displayed for existing users.
- Lists are refreshed automatically after every create/edit/delete/assign.
