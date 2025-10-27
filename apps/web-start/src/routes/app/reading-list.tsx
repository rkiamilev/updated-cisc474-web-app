import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/reading-list')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/reading-list"!</div>
}