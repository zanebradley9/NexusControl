import React from 'react';
import { Globe, Gamepad2, Database, Smartphone, Server, Code2 } from 'lucide-react';

const categoryIcons = {
  web: Globe,
  game: Gamepad2,
  data: Database,
  mobile: Smartphone,
  devops: Server,
  general: Code2,
};

const categoryColors = {
  web: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  game: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  data: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  mobile: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  devops: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  general: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
};

export default function TemplateCard({ template, onSelect }) {
  const Icon = categoryIcons[template.category] || Code2;
  const colorClass = categoryColors[template.category] || categoryColors.general;

  return (
    <button
      onClick={() => onSelect(template)}
      className={`group text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${colorClass}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground mb-1">{template.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {template.tags.map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-background/50 text-muted-foreground font-mono">
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}