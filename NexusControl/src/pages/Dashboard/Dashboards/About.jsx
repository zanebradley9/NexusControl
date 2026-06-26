import { Cpu } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

        <div className="mb-6 flex items-center gap-3">
          <Cpu className="h-8 w-8 text-cyan-400" />
          <h1 className="text-3xl font-bold">About NexusControl</h1>
        </div>

        <p className="leading-8 text-zinc-300">
          NexusControl is an advanced futuristic platform focused on AI,
          automation, smart systems, and modern digital experiences. The project
          is designed to connect powerful tools into one control center for users,
          developers, and future technology systems.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-zinc-800 p-5">
            <h2 className="mb-2 text-lg font-semibold">AI Systems</h2>
            <p className="text-zinc-400">
              Integrated AI tools and automation.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-800 p-5">
            <h2 className="mb-2 text-lg font-semibold">Smart Control</h2>
            <p className="text-zinc-400">
              Manage apps, systems, and services.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-800 p-5">
            <h2 className="mb-2 text-lg font-semibold">Future Tech</h2>
            <p className="text-zinc-400">
              Built for futuristic experiences.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}