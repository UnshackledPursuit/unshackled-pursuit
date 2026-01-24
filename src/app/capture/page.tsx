'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Check, X, Loader2, LogIn, Link, FileText, Mic, ChevronDown, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function CapturePage() {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [captureCount, setCaptureCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 300) + 'px';
    }
  }, [content]);

  // Focus on load
  useEffect(() => {
    if (user && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [user]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/capture`,
      },
    });
  };

  const detectContentType = (text: string): { type: 'text' | 'link', isMarkdown: boolean } => {
    const isUrl = /^https?:\/\/\S+$/.test(text.trim());
    const isMarkdown = /^#|\*\*|```|^-\s|\n##/.test(text);
    return { type: isUrl ? 'link' : 'text', isMarkdown };
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    setStatus('sending');
    setErrorMsg('');

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    try {
      const { type } = detectContentType(content);

      const { error } = await supabase
        .from('fleeting_thoughts')
        .insert({
          content: content.trim(),
          user_id: user.id,
          content_type: type,
          source: 'mobile',
          status: 'inbox',
          url: type === 'link' ? content.trim() : null,
        });

      if (error) {
        setErrorMsg(error.message);
        setStatus('error');
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      } else {
        setStatus('success');
        setCaptureCount(prev => prev + 1);

        // Success haptic
        if (navigator.vibrate) navigator.vibrate([10, 50, 10]);

        // Reset after brief pause
        setTimeout(() => {
          setContent('');
          setStatus('idle');
          textareaRef.current?.focus();
        }, 800);
      }
    } catch (err) {
      setErrorMsg('Network error');
      setStatus('error');
    }
  };

  // Handle keyboard submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const { type: contentType, isMarkdown } = detectContentType(content);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <span className="text-zinc-500 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
          <Zap size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Fleeting Thoughts</h1>
        <p className="text-zinc-500 mb-8 text-center">Capture ideas before they disappear</p>
        <button
          onClick={handleLogin}
          className="py-4 px-8 rounded-xl bg-white text-zinc-900 font-semibold text-lg flex items-center gap-3 active:scale-95 transition-transform"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-safe-top">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-semibold">Capture</span>
          </div>
          {captureCount > 0 && (
            <div className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">
              {captureCount} captured
            </div>
          )}
        </div>
      </div>

      {/* Main input area */}
      <div className="flex-1 px-4 pb-4 flex flex-col">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            className="w-full min-h-[120px] max-h-[300px] p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-zinc-50 text-lg focus:outline-none focus:border-blue-500 resize-none transition-colors placeholder:text-zinc-600"
            disabled={status === 'sending'}
            autoFocus
            autoComplete="off"
            autoCorrect="on"
            spellCheck="true"
          />

          {/* Content type indicator */}
          {content.trim() && (
            <div className="absolute bottom-3 left-3 flex gap-2">
              {contentType === 'link' && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full flex items-center gap-1">
                  <Link size={12} />
                  URL
                </span>
              )}
              {isMarkdown && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full flex items-center gap-1">
                  <FileText size={12} />
                  Markdown
                </span>
              )}
            </div>
          )}

          {/* Character count */}
          {content.length > 100 && (
            <div className="absolute bottom-3 right-3 text-xs text-zinc-600">
              {content.length}
            </div>
          )}
        </div>

        {/* Quick templates */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {['idea:', 'todo:', 'note:', 'question:'].map((template) => (
            <button
              key={template}
              onClick={() => {
                setContent(template + ' ');
                textareaRef.current?.focus();
              }}
              className="flex-shrink-0 px-3 py-2 rounded-full bg-zinc-900 text-zinc-400 text-sm border border-zinc-800 active:bg-zinc-800 transition-colors"
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      {/* Status messages */}
      <div className="px-4">
        {status === 'success' && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check size={20} className="text-green-400" />
            </div>
            <div>
              <div className="font-medium text-green-400">Captured!</div>
              <div className="text-sm text-green-400/70">Added to your inbox</div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <X size={20} className="text-red-400" />
            </div>
            <div>
              <div className="font-medium text-red-400">Error</div>
              <div className="text-sm text-red-400/70">{errorMsg}</div>
            </div>
          </div>
        )}
      </div>

      {/* Submit button */}
      <div className="flex-shrink-0 p-4 pb-safe-bottom border-t border-zinc-900">
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || status === 'sending'}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 font-semibold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:active:scale-100"
        >
          {status === 'sending' ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <Send size={22} />
              Capture
              <span className="text-blue-300 text-sm ml-1">(⌘↵)</span>
            </>
          )}
        </button>

        {/* Link to full app */}
        <a
          href="/fleeting"
          className="block text-center mt-3 text-zinc-500 text-sm py-2 active:text-zinc-400"
        >
          Open full inbox →
        </a>
      </div>
    </div>
  );
}
