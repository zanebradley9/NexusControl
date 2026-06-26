import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Sidebar from '@/components/code-assistant/Sidebar';
import WelcomeScreen from '@/components/code-assistant/WelcomeScreen';
import MessageBubble from '@/components/code-assistant/MessageBubble';
import ChatInput from '@/components/code-assistant/ChatInput';
import TypingIndicator from '@/components/code-assistant/TypingIndicator';

const SYSTEM_PROMPT = `You are CodeForge AI, an expert coding assistant. You can:
- Generate production-quality code in ANY programming language or framework
- Guide users through complete project builds step-by-step
- Explain concepts clearly with examples
- Debug code and suggest improvements
- Offer best practices and design patterns

Rules:
- Always use markdown with proper code blocks and language tags (e.g. \`\`\`python)
- Be concise but thorough
- When generating code, include comments explaining key parts
- If a request is ambiguous, ask clarifying questions
- Suggest next steps after providing code
- Adapt your response style to the user's skill level`;

export default function Home() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const messagesEndRef = useRef(null);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoadingConvs(true);
    const convs = await base44.entities.Conversation.list('-updated_date');
    setConversations(convs);
    setLoadingConvs(false);
  };

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  const loadMessages = async (convId) => {
    const msgs = await base44.entities.Message.filter({ conversation_id: convId }, 'created_date', 200);
    setMessages(msgs);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const createConversation = async (title, category) => {
    const conv = await base44.entities.Conversation.create({
      title: title.slice(0, 60),
      category: category || 'general',
    });
    setConversations(prev => [conv, ...prev]);
    setActiveConvId(conv.id);
    return conv;
  };

  const detectCategory = (text) => {
    const lower = text.toLowerCase();
    if (/react|vue|angular|html|css|next\.?js|django|flask|express|api|rest|graphql|web|frontend|backend|tailwind/.test(lower)) return 'web';
    if (/unity|unreal|godot|game|pygame|phaser|sprite|platformer/.test(lower)) return 'game';
    if (/pandas|numpy|tensorflow|pytorch|ml|machine learning|data|csv|jupyter|scikit|model training/.test(lower)) return 'data';
    if (/flutter|react native|swift|kotlin|ios|android|mobile/.test(lower)) return 'mobile';
    if (/docker|kubernetes|ci\/cd|deploy|aws|azure|terraform|nginx|devops/.test(lower)) return 'devops';
    return 'general';
  };

  const sendMessage = useCallback(async (content) => {
    let convId = activeConvId;
    
    if (!convId) {
      const category = detectCategory(content);
      const titlePrompt = content.slice(0, 50);
      const conv = await createConversation(titlePrompt, category);
      convId = conv.id;
    }

    const userMsg = await base44.entities.Message.create({
      conversation_id: convId,
      role: 'user',
      content,
    });
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const history = [...messages, userMsg]
      .slice(-10)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation history:\n${history}\n\nUser: ${content}\n\nAssistant:`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: 'claude_sonnet_4_6',
    });

    const assistantMsg = await base44.entities.Message.create({
      conversation_id: convId,
      role: 'assistant',
      content: response,
    });

    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);

    // Update conversation title if it's the first message
    if (messages.length === 0) {
      const titleResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a very short title (max 6 words) for a coding conversation that starts with: "${content.slice(0, 200)}". Return ONLY the title, nothing else.`,
      });
      const cleanTitle = titleResponse.replace(/["']/g, '').trim();
      await base44.entities.Conversation.update(convId, { title: cleanTitle });
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: cleanTitle } : c));
    }
  }, [activeConvId, messages]);

  const handleSelectTemplate = (template) => {
    sendMessage(template.prompt);
  };

  const handleDeleteConversation = async (id) => {
    const msgs = await base44.entities.Message.filter({ conversation_id: id });
    for (const m of msgs) {
      await base44.entities.Message.delete(m.id);
    }
    await base44.entities.Conversation.delete(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(null);
      setMessages([]);
    }
  };

  const handleNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-background dark">
      <Sidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelect={setActiveConvId}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate">
              {activeConvId
                ? conversations.find(c => c.id === activeConvId)?.title || 'Conversation'
                : 'CodeForge AI'}
            </h2>
          </div>
        </header>

        {/* Messages or Welcome */}
        {!activeConvId && messages.length === 0 ? (
          <ScrollArea className="flex-1">
            <WelcomeScreen
              onSelectTemplate={handleSelectTemplate}
              onSendMessage={sendMessage}
            />
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 max-w-3xl mx-auto w-full">
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}