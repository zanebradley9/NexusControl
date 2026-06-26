import React from 'react';
import { Plus, MessageSquare, Pin, Trash2, Code2, Globe, Gamepad2, Database, Smartphone, Server, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { base44 } from '@/api/base44Client';

const categoryIcons = {
  web: Globe,
  game: Gamepad2,
  data: Database,
  mobile: Smartphone,
  devops: Server,
  general: Code2,
};

export default function Sidebar({ 
  conversations, 
  activeId, 
  onSelect, 
  onNew, 
  onDelete,
  isOpen,
  onClose 
}) {
  const pinned = conversations.filter(c => c.is_pinned);
  const recent = conversations.filter(c => !c.is_pinned);

  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}
      <aside className={`fixed md:relative z-50 md:z-auto top-0 left-0 h-full w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-sm text-sidebar-foreground">CodeForge AI</h1>
              <p className="text-[10px] text-muted-foreground">Your coding companion</p>
            </div>
          </div>
          <Button 
            onClick={() => { onNew(); onClose(); }}
            className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-0"
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 custom-scrollbar">
          <div className="p-3">
            {pinned.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 mb-2 flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Pinned
                </p>
                <div className="space-y-0.5">
                  {pinned.map(conv => (
                    <ConvItem key={conv.id} conv={conv} isActive={activeId === conv.id} onSelect={() => { onSelect(conv.id); onClose(); }} onDelete={onDelete} />
                  ))}
                </div>
              </div>
            )}
            
            {recent.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 mb-2">
                  Recent
                </p>
                <div className="space-y-0.5">
                  {recent.map(conv => (
                    <ConvItem key={conv.id} conv={conv} isActive={activeId === conv.id} onSelect={() => { onSelect(conv.id); onClose(); }} onDelete={onDelete} />
                  ))}
                </div>
              </div>
            )}

            {conversations.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground/50">No conversations yet</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}

function ConvItem({ conv, isActive, onSelect, onDelete }) {
  const Icon = categoryIcons[conv.category] || Code2;
  return (
    <button
      onClick={onSelect}
      className={`w-full group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
        isActive 
          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      }`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
      <span className="text-xs truncate flex-1">{conv.title}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </button>
  );
}