import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/app")({
  component: () => (
    <div>
      <h1>App Layout</h1>
      <Outlet />
    </div>
  ),
});
