import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import {
  MessageSquare, Send, Plus, Shield, Zap, Trash2,
  User, Bot, ChevronRight, Loader2, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import moment from 'moment';

const SUGGESTED_PROMPTS = [
  'What are the most common signs of a phishing attack?',
  'How should I respond if I suspect unauthorized account access?',
  'Summarize the current open incidents and their risk levels.',
  'What are best practices for insider threat prevention?',
];

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const renderToolCall = (tc, idx) => {
    const dp = tc.display_projection || {};
    const isPending = ['pending', 'running', 'in_progress'].includes(tc.status);
    const isFailed = ['failed', 'error'].includes(tc.status);

    if (dp.hide_details && dp.details_redacted) {
      const label = isPending ? dp.active_label : isFailed ? dp.error_label : dp.label;
      return (
        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5 px-3 py-2 bg-muted/50 rounded-lg border border-border">
          {isPending && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          <span>{label || tc.name}</span>
        </div>
      );
    }

    return (
      <details key={idx} className="mt-1.5 text-xs">
        <summary className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border cursor-pointer hover:bg-muted transition-colors select-none">
          {isPending && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          {isFailed && <span className="text-destructive">✕</span>}
          {!isPending && !isFailed && <span className="text-green-400">✓</span>}
          <span className="font-mono text-muted-foreground">{tc.name}</span>
          <span className={`ml-auto font-mono text-[10px] ${isPending ? 'text-primary' : isFailed ? 'text-destructive' : 'text-green-400'}`}>
            {tc.status}
          </span>
        </summary>
        <div className="mt-1 px-3 py-2 bg-muted/30 rounded-lg border border-border space-y-2">
          {tc.arguments_string && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground mb-1">PARAMETERS</p>
              <pre className="text-[10px] font-mono text-foreground whitespace-pre-wrap break-all">
                {(() => { try { return JSON.stringify(JSON.parse(tc.arguments_string), null, 2); } catch { return tc.arguments_string; } })()}
              </pre>
            </div>
          )}
          {tc.results && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground mb-1">RESULT</p>
              <pre className="text-[10px] font-mono text-foreground whitespace-pre-wrap break-all">
                {(() => { try { return JSON.stringify(typeof tc.results === 'string' ? JSON.parse(tc.results) : tc.results, null, 2); } catch { return String(tc.results); } })()}
              </pre>
            </div>
          )}
        </div>
      </details>
    );
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isUser ? 'bg-primary/20' : 'bg-muted border border-border'}`}>
        {isUser ? <User className="w-3.5 h-3.5 text-primary" /> : <Shield className="w-3.5 h-3.5 text-primary" />}
      </div>
      <div className={`max-w-[82%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {message.content && (
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-card border border-border text-foreground rounded-tl-sm'
          }`}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {message.tool_calls?.map((tc, idx) => renderToolCall(tc, idx))}
      </div>
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!activeConv?.id) return;
    const unsub = base44.agents.subscribeToConversation(activeConv.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsub();
  }, [activeConv?.id]);

  const loadConversations = async () => {
    setLoadingConvs(true);
    const data = await base44.agents.listConversations({ agent_name: 'security_agent' });
    setConversations(data);
    setLoadingConvs(false);
  };

  const createConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: 'security_agent',
      metadata: { name: `Security Chat — ${moment().format('MMM D, HH:mm')}` },
    });
    setConversations(prev => [conv, ...prev]);
    setActiveConv(conv);
    setMessages([]);
    setSidebarOpen(false);
  };

  const openConversation = async (conv) => {
    const full = await base44.agents.getConversation(conv.id);
    setActiveConv(full);
    setMessages(full.messages || []);
    setSidebarOpen(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    let conv = activeConv;
    if (!conv) {
      conv = await base44.agents.createConversation({
        agent_name: 'security_agent',
        metadata: { name: text.slice(0, 40) },
      });
      setConversations(prev => [conv, ...prev]);
      setActiveConv(conv);
    }

    setInput('');
    setSending(true);
    await base44.agents.addMessage(conv, { role: 'user', content: text });
    setSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isStreaming = messages.some(m => m.role === 'assistant' && m.tool_calls?.some(tc => ['pending', 'running', 'in_progress'].includes(tc.status)));

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversations sidebar */}
      <div className={`fixed inset-y-0 left-0 z-20 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} mt-14 lg:mt-0`}>
        <div className="p-3 border-b border-border">
          <Button className="w-full gap-2 h-9 text-sm" onClick={createConversation}>
            <Plus className="w-4 h-4" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConvs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-center text-muted-foreground py-8">No conversations yet</p>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all group ${
                  activeConv?.id === conv.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate text-xs font-medium">{conv.metadata?.name || 'Chat'}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 pl-5 font-mono">
                  {moment(conv.created_date).fromNow()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-10 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-12 flex items-center gap-3 px-4 border-b border-border bg-card/50 shrink-0">
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
            <MessageSquare className="w-4 h-4" />
          </button>
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">AI Security Assistant</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-muted-foreground font-mono">ONLINE</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeConv && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-bold font-heading mb-1">AI Security Assistant</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Ask me about security threats, incident analysis, best practices, or anything related to your security operations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); textareaRef.current?.focus(); }}
                    className="text-left p-3 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{prompt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {(sending || isStreaming) && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-card border border-border rounded-tl-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card/50 shrink-0">
          <div className="flex gap-2 items-end max-w-4xl mx-auto">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the security AI anything... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none min-h-[40px] max-h-32 text-sm py-2.5 overflow-y-auto"
              style={{ height: 'auto' }}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              size="sm"
              className="h-10 px-4 shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2 font-mono">
            SENTINEL AI · Powered by advanced security intelligence
          </p>
        </div>
      </div>
    </div>
  );
}