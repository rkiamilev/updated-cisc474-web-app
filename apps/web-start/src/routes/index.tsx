import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to My App</h1>
      <p className="text-gray-600 mb-8">
        Select a section below to explore the app.
      </p>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Link
          to="/app/dashboard"
          className="bg-blue-500 text-white rounded-xl px-4 py-3 hover:bg-blue-600"
        >
          Dashboard
        </Link>

        <Link
          to="/app/reading-list"
          className="bg-green-500 text-white rounded-xl px-4 py-3 hover:bg-green-600"
        >
          Reading List
        </Link>

        <Link
          to="/app/profile"
          className="bg-purple-500 text-white rounded-xl px-4 py-3 hover:bg-purple-600"
        >
          Profile
        </Link>

        <Link
          to="/app/vocabulary"
          className="bg-orange-500 text-white rounded-xl px-4 py-3 hover:bg-orange-600"
        >
          Vocabulary
        </Link>
      </div>
    </div>
  );
}