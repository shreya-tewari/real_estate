import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  BedDouble,
  MapPin,
  Eye,
  ArrowDown,
  Zap,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(num) {
  if (num === null || num === undefined || num === '') return '';
  const n = Number(num);
  if (Number.isNaN(n)) return String(num);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
  return `₹${n.toLocaleString('en-IN')}`;
}

/** Very lightweight markdown → JSX (bold, bullets, blockquotes). */
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let listBuffer = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-4 space-y-1 my-1.5">
          {listBuffer.map((li, i) => (
            <li key={i}>{formatInline(li)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const formatInline = (line) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return <strong key={i} className="font-bold">{p.slice(2, -2)}</strong>;
      }
      return p;
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Bullet points
    if (/^[-•*]\s/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^[-•*]\s/, ''));
      return;
    }

    flushList();

    // Blockquote
    if (trimmed.startsWith('>')) {
      elements.push(
        <blockquote
          key={idx}
          className="border-l-2 border-brand-300 pl-3 text-slate-500 italic my-1.5"
        >
          {formatInline(trimmed.replace(/^>\s?/, ''))}
        </blockquote>
      );
      return;
    }

    // Heading (###)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <div key={idx} className="font-bold text-slate-800 mt-2 mb-1">
          {formatInline(trimmed.replace(/^###\s/, ''))}
        </div>
      );
      return;
    }

    // Empty line
    if (!trimmed) {
      elements.push(<div key={idx} className="h-1.5" />);
      return;
    }

    // Normal paragraph
    elements.push(
      <p key={idx} className="leading-relaxed">
        {formatInline(trimmed)}
      </p>
    );
  });

  flushList();
  return elements;
}

// ---------------------------------------------------------------------------
// Quick Suggestion Chips
// ---------------------------------------------------------------------------

const SUGGESTIONS = [
  '2BHK flats in Bangalore under 80 Lakh',
  'Houses for rent in Mumbai',
  'Best areas in Hyderabad for investment',
  '3BHK with pool in Chennai',
  'Compare rent vs buy in Bangalore',
  'Family-friendly localities in Mumbai',
];

// ---------------------------------------------------------------------------
// Inline Property Card (mini card for chat)
// ---------------------------------------------------------------------------

function ChatPropertyCard({ property, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(property)}
      className="chat-property-card flex-shrink-0 w-[220px] rounded-2xl border border-slate-100 bg-white overflow-hidden text-left group cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-28 w-full overflow-hidden bg-slate-100">
        <img
          src={property.image_url || `/images/${property.image_filename}`}
          alt={property.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80';
          }}
        />
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase text-white ${
            property.type === 'rent' ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}
        >
          {property.type === 'rent' ? 'Rent' : 'Sale'}
        </span>
      </div>

      {/* Details */}
      <div className="p-2.5">
        <div className="text-[11px] font-bold text-slate-900 line-clamp-1">
          {property.title}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{property.locality}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-extrabold text-brand-600">
            {formatINR(property.price)}
            {property.type === 'rent' ? '/mo' : ''}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <BedDouble className="h-3 w-3" />
            {property.bhk} BHK
          </span>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Typing Indicator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 chat-msg-enter">
      <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
        <Bot className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="rounded-2xl rounded-tl-md bg-slate-50 border border-slate-100 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Welcome Message
// ---------------------------------------------------------------------------

function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8 chat-msg-enter">
      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center mb-4 shadow-lg shadow-brand-200/50">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-base font-extrabold text-slate-900 mb-1">
        Property AI Assistant
      </h3>
      <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed">
        Ask me anything about properties! I can search listings, suggest the best
        options for your needs, and help you make informed decisions.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ChatPanel Component
// ---------------------------------------------------------------------------

export default function ChatPanel({ onSelectProperty }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !isClosing) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, isClosing]);

  // Detect scroll position for "scroll to bottom" button
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 80;
    setShowScrollBtn(!atBottom);
  };

  // Open / close panel
  const openPanel = () => {
    setIsOpen(true);
    setIsClosing(false);
  };

  const closePanel = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 250);
  };

  // Send a message
  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed, properties: null };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Build payload with full conversation history (text only)
      const historyPayload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyPayload }),
      });

      if (!resp.ok) {
        throw new Error('Chat request failed');
      }

      const data = await resp.json();

      const assistantMsg = {
        role: 'assistant',
        content: data.reply,
        properties: data.properties || null,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        role: 'assistant',
        content:
          '⚠️ Sorry, I couldn\'t process that right now. Please make sure the backend server is running and the OpenAI API key is configured.',
        properties: null,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleSuggestionClick = (suggestion) => {
    // Strip leading emoji + space
    const clean = suggestion.replace(/^[^\w]*\s/, '');
    sendMessage(clean);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ─── Floating Action Button ─── */}
      {!isOpen && (
        <button
          id="chat-fab"
          onClick={openPanel}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-xl shadow-brand-300/40 hover:shadow-brand-300/60 hover:scale-105 transition-all duration-300 chat-fab-pulse"
          aria-label="Open AI Chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* ─── Chat Panel ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 pointer-events-none">
          {/* Overlay (mobile) */}
          <div
            className="absolute inset-0 chat-overlay pointer-events-auto sm:pointer-events-none"
            onClick={closePanel}
          />

          {/* Panel */}
          <div
            className={`relative pointer-events-auto w-full sm:w-[420px] h-[calc(100vh-2rem)] sm:h-[600px] max-h-[700px] rounded-3xl glass-chat-panel shadow-2xl shadow-slate-900/10 flex flex-col overflow-hidden ${
              isClosing ? 'chat-slide-down' : 'chat-slide-up'
            }`}
          >
            {/* ─── Header ─── */}
            <div className="flex-shrink-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Property AI</h3>
                    <p className="text-[10px] text-white/70 font-medium">
                      Search • Suggest • Advise
                    </p>
                  </div>
                </div>
                <button
                  onClick={closePanel}
                  className="h-8 w-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* ─── Messages Area ─── */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chat-messages-scroll relative"
            >
              {messages.length === 0 && !loading && <WelcomeMessage />}

              {messages.map((msg, idx) => (
                <div key={idx} className="chat-msg-enter">
                  {msg.role === 'user' ? (
                    /* ── User Bubble ── */
                    <div className="flex items-start gap-2.5 justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-brand-600 text-white px-4 py-2.5">
                        <p className="text-[13px] leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="flex-shrink-0 h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-slate-600" />
                      </div>
                    </div>
                  ) : (
                    /* ── Assistant Bubble ── */
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="max-w-[85%] space-y-2.5">
                        {/* Text reply */}
                        <div className="rounded-2xl rounded-tl-md bg-slate-50 border border-slate-100 px-4 py-3 text-[13px] text-slate-700">
                          {renderMarkdown(msg.content)}
                        </div>

                        {/* Inline property cards */}
                        {msg.properties && msg.properties.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2 px-1">
                              <Zap className="h-3 w-3 text-brand-500" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                {msg.properties.length} Properties Found
                              </span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2 chat-property-scroll">
                              {msg.properties.map((p) => (
                                <ChatPropertyCard
                                  key={p.id}
                                  property={p}
                                  onSelect={onSelectProperty}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll-to-bottom button */}
            {showScrollBtn && (
              <button
                onClick={() => scrollToBottom()}
                className="absolute bottom-[140px] left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
              >
                <ArrowDown className="h-4 w-4 text-slate-600" />
              </button>
            )}

            {/* ─── Quick Suggestions (only when no messages) ─── */}
            {messages.length === 0 && (
              <div className="flex-shrink-0 px-4 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-100 hover:border-brand-200 rounded-xl px-3 py-1.5 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Input Area ─── */}
            <div className="flex-shrink-0 border-t border-slate-100 bg-white/80 backdrop-blur-sm px-4 py-3">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about properties..."
                  disabled={loading}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex-shrink-0 h-10 w-10 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all shadow-sm"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p className="text-[9px] text-slate-400 text-center mt-2 font-medium">
                Powered by AI • Searches from MagicProperty database
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
