import { Cpu } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
        
        <div className="flex items-center gap-3 mb-6">
          <Cpu className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold">
            About NexusControl
          </h1>
        </div>

        <p className="text-zinc-300 leading-8">
          NexusControl is an advanced futuristic platform focused on AI,
          automation, smart systems, and modern digital experiences. The project
          is designed to connect powerful tools into one control center for
          users, developers, and future technology systems.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-8">

          <div className="bg-zinc-800 p-5 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">
              AI Systems
            </h2>
            <p className="text-zinc-400">
              Integrated AI tools and automation.
            </p>
          </div>

          <div className="bg-zinc-800 p-5 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">
              Smart Control
            </h2>
            <p className="text-zinc-400">
              Manage apps, systems, and services.
            </p>
          </div>

          <div className="bg-zinc-800 p-5 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">
              Future Tech
            </h2>
            <p className="text-zinc-400">
              Built for futuristic experiences.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}