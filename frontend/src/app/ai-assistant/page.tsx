'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Send,
  Square,
  RotateCcw,
  ShieldCheck,
  Brain,
  User,
  Compass,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { refreshAccessToken } from '../../lib/api';
import { ChatMessage, TripCitation } from '../../types';

function getChatErrorMessage(status: number): string {
  switch (status) {
    case 401:
      return '🔐 Please log in to use the AI Travel Assistant.';
    case 403:
      return "You don't have permission to use the AI Travel Assistant.";
    case 404:
      return 'The AI Assistant service could not be found. Please try again later.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Something went wrong while processing your request. Please try again.';
    case 502:
    case 503:
    case 504:
      return 'The AI service is temporarily unavailable. Please try again shortly.';
    default:
      return 'Something went wrong while processing your request. Please try again.';
  }
}

function AiAssistantContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams?.get('prompt');
  const { user, isLoading } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `👋 Hello ${user?.name || 'traveler'}! I'm TravelPlanner AI, your autonomous travel planner and intelligence assistant.

I can help you:
- **Plan customized multi-day itineraries** with cost and weather breakdowns
- **Find destinations matching your budget & dietary preferences**
- **Optimize walking distances and pacing** for relaxing journeys
- **Recommend next adventures** based on your trip history

What destination or travel style are you exploring today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState(initialPrompt || '');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeCitations, setActiveCitations] = useState<TripCitation[]>([]);
  const [lastExtractedMemory, setLastExtractedMemory] = useState<Record<string, any> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedPrompts = [
    'Plan a 5 day trip to Japan.',
    'Which destination fits my budget?',
    'Based on my previous trips, where should I go next?',
    'Make day 3 less tiring with shorter walking distances.',
  ];

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Update welcome greeting when user name becomes available
  useEffect(() => {
    if (user?.name) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === 'welcome-msg' && msg.content.includes('Hello traveler!')
            ? {
                ...msg,
                content: msg.content.replace('Hello traveler!', `Hello ${user.name}!`),
              }
            : msg,
        ),
      );
    }
  }, [user?.name]);

  const executeStreamChat = async (
    messagesPayload: { role: string; content: string }[],
    assistantMsgId: string,
    isRetry = false,
  ): Promise<void> => {
    let token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    // If access token missing, attempt refresh once before giving up
    if (!token) {
      token = await refreshAccessToken();
      if (!token) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: '🔐 Please log in to use the AI Travel Assistant.' }
              : msg,
          ),
        );
        return;
      }
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      const response = await fetch(`${apiBase}/api/v1/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: messagesPayload,
          useRag: true,
        }),
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        // If 401 received and not already retrying, attempt token refresh and retry once
        if (response.status === 401 && !isRetry) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            return await executeStreamChat(messagesPayload, assistantMsgId, true);
          }
        }

        const errorMessage = getChatErrorMessage(response.status);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: errorMessage }
              : msg,
          ),
        );
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let receivedCitations: TripCitation[] = [];

      if (reader) {
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const payloadStr = trimmed.slice(6);
              if (payloadStr === '[DONE]') break;

              try {
                const parsed = JSON.parse(payloadStr);

                if (parsed.type === 'content') {
                  assistantContent += parsed.token;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? { ...msg, content: assistantContent }
                        : msg,
                    ),
                  );
                } else if (parsed.type === 'citations') {
                  receivedCitations = parsed.citations || [];
                  setActiveCitations(receivedCitations);
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? { ...msg, citations: receivedCitations }
                        : msg,
                    ),
                  );
                } else if (parsed.type === 'memory_saved') {
                  setLastExtractedMemory(parsed.preferences);
                }
              } catch {
                // ignore SSE malformed chunk
              }
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: msg.content + ' *(Generation stopped)*' }
              : msg,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content:
                    'Unable to connect to the backend. Please check your connection and try again.',
                }
              : msg,
          ),
        );
      }
    }
  };

  const handleSend = async (textToSend?: string) => {
    // Authentication guard
    if (!user) return;

    const query = (textToSend || inputPrompt).trim();
    if (!query || isStreaming) return;

    setInputPrompt('');
    setLastExtractedMemory(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `asst-${Date.now()}`;
    const newMessages = [...messages, userMessage];

    // Optimistically add assistant placeholder
    setMessages([
      ...newMessages,
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const messagesPayload = newMessages.map((m) => ({ role: m.role, content: m.content }));
      await executeStreamChat(messagesPayload, assistantMsgId);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerate = () => {
    if (!user) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant') {
          return prev.slice(0, -1);
        }
        return prev;
      });
      handleSend(lastUserMsg.content);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Loading State while checking auth
  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Connecting to TravelPlanner AI Assistant...</p>
      </div>
    );
  }

  // 2. Unauthenticated State (Login Required UX)
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-4 flex flex-col h-[85vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                TravelPlanner AI Intelligence
                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 text-[10px] font-mono border border-teal-500/20">
                  SSE Stream • RAG Grounded
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Personalized assistant connected to ai-platform vector store.
              </p>
            </div>
          </div>
        </div>

        {/* Login Required Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 mx-auto flex items-center justify-center shadow-lg shadow-teal-500/10">
              <ShieldCheck className="w-8 h-8 text-teal-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Login Required</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                Please log in to use the TravelPlanner AI Assistant. Your personalized travel history, preferences, and saved memories will be used to create better recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm hover:opacity-95 shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Log In</span>
              </Link>
              <Link
                href="/register"
                className="w-full py-3 px-4 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-semibold text-sm hover:border-teal-500/40 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Get Started</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Chat View
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 flex flex-col h-[85vh]">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              TravelPlanner AI Intelligence
              <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 text-[10px] font-mono border border-teal-500/20">
                SSE Stream • RAG Grounded
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Personalized assistant connected to ai-platform vector store.
            </p>
          </div>
        </div>

        {lastExtractedMemory && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs animate-fade-in">
            <Brain className="w-3.5 h-3.5 text-teal-400" />
            <span>Learned Preference Synced to Memory</span>
          </div>
        )}
      </div>

      {/* Messages Chat Box */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isAssistant
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                }`}
              >
                {isAssistant ? <Compass className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`space-y-3 max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isAssistant
                    ? 'glass-panel border border-slate-800/90 text-slate-200'
                    : 'bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 font-medium shadow-md shadow-teal-500/10'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed">
                  {msg.content || (
                    <span className="flex items-center gap-2 text-slate-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                      <span>Synthesizing travel response...</span>
                    </span>
                  )}
                </div>

                {isAssistant && msg.citations && msg.citations.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Sources Used (Verified Citations)</span>
                    </div>
                    <div className="space-y-1">
                      {msg.citations.map((cit, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300"
                        >
                          <span className="font-semibold text-teal-300">• {cit.title}</span>
                          {cit.snippet && <p className="text-[10px] text-slate-400 pl-2 mt-0.5">{cit.snippet}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`flex items-center justify-between text-[10px] pt-1 ${
                    isAssistant ? 'text-slate-500' : 'text-teal-950/70'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isAssistant && msg.content && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-teal-400 flex items-center gap-1"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-teal-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length < 4 && !isStreaming && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-teal-500/40 hover:text-white transition-all whitespace-nowrap"
            >
              💡 &quot;{prompt}&quot;
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="glass-panel p-3 sm:p-4 rounded-3xl border border-slate-800/90 space-y-2 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask anything: 'Plan 4 days in Rome', 'Adjust day 2 for vegetarian meals'..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-400 disabled:opacity-60"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={handleStop}
              className="p-3 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all"
              title="Stop Generation"
            >
              <Square className="w-4 h-4 fill-rose-300" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputPrompt.trim()}
              className="p-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold hover:opacity-95 shadow-md shadow-teal-500/20 disabled:opacity-40 transition-all"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}

          {!isStreaming && messages.length > 2 && (
            <button
              type="button"
              onClick={handleRegenerate}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
              title="Regenerate Last Response"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default function AiAssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Connecting to TravelPlanner AI Assistant...</p>
        </div>
      }
    >
      <AiAssistantContent />
    </Suspense>
  );
}
