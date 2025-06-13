"use client";

interface DatabaseErrorProps {
  error: string;
}

export default function DatabaseError({ error }: DatabaseErrorProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-red-400 mb-4">Database Connection Error</h1>            <p className="text-gray-300 mb-6">
              Unable to connect to the database. This usually happens when the database hasn&apos;t been set up yet.
            </p>
            {isDevelopment && (
              <details className="text-left bg-gray-800/50 rounded p-4 mb-6">
                <summary className="text-red-400 cursor-pointer font-medium mb-2">Technical Details</summary>
                <code className="text-xs text-gray-400 break-all">{error}</code>
              </details>
            )}
          </div>

          <div className="space-y-6 text-left">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                Set up your database
              </h2>
              <div className="pl-9 space-y-3 text-gray-300">
                <div className="bg-gray-700/50 rounded p-3">
                  <h3 className="font-medium text-blue-400 mb-2">🐳 Quick Docker Setup (Recommended)</h3>
                  <code className="text-xs bg-gray-900 p-2 rounded block overflow-x-auto">
                    docker run --name modhub-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=modhub -p 5432:5432 -d postgres:15
                  </code>
                </div>
                <div className="bg-gray-700/50 rounded p-3">
                  <h3 className="font-medium text-green-400 mb-2">🌐 Cloud Database</h3>
                  <p className="text-sm">Create a PostgreSQL database on Supabase, Neon, Railway, or your preferred provider.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                Update your .env file
              </h2>
              <div className="pl-9 space-y-3 text-gray-300">
                <p className="text-sm">Update the DATABASE_URL in your environment variables:</p>
                <code className="text-xs bg-gray-900 p-2 rounded block">
                  DATABASE_URL=postgresql://postgres:password@localhost:5432/modhub
                </code>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                Run database setup
              </h2>
              <div className="pl-9 space-y-3 text-gray-300">
                <p className="text-sm">Run the setup script to create tables and seed data:</p>
                <code className="text-xs bg-gray-900 p-2 rounded block">
                  bun run db:setup
                </code>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                Start the application
              </h2>
              <div className="pl-9 space-y-3 text-gray-300">
                <p className="text-sm">Once setup is complete, restart the development server:</p>
                <code className="text-xs bg-gray-900 p-2 rounded block">
                  bun run dev
                </code>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Need help? Run <code className="bg-gray-800 px-2 py-1 rounded">bun run db:help</code> for more options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
