'use client';

import { useState, useEffect } from 'react';
import { Send, Check, X, Loader2, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function CapturePage() {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/capture`,
      },
    });
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    setStatus('sending');
    setErrorMsg('');

    try {
      // Detect if it's a URL
      const isUrl = /^https?:\/\//.test(content.trim());

      const { error } = await supabase
        .from('fleeting_thoughts')
        .insert({
          content: content.trim(),
          user_id: user.id,
          content_type: isUrl ? 'link' : 'text',
          source: 'mobile',
          status: 'inbox',
          url: isUrl ? content.trim() : null,
        });

      if (error) {
        setErrorMsg(error.message);
        setStatus('error');
      } else {
        setStatus('success');
        setContent('');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (err) {
      setErrorMsg('Network error');
      setStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-6">Capture Thought</h1>
        <button
          onClick={handleLogin}
          className="py-4 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-lg flex items-center gap-2"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-center">Capture Thought</h1>
      </div>

      {/* Main input area */}
      <div className="flex-1 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full h-64 p-4 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-50 text-lg focus:outline-none focus:border-zinc-500 resize-none"
          autoFocus
          disabled={status === 'sending'}
        />
      </div>

      {/* Status message */}
      {status === 'success' && (
        <div className="mx-4 mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg flex items-center gap-2">
          <Check size={20} className="text-green-400" />
          <span className="text-green-400">Captured!</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mx-4 mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-2">
          <X size={20} className="text-red-400" />
          <span className="text-red-400">{errorMsg}</span>
        </div>
      )}

      {/* Submit button */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || status === 'sending'}
          className="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 font-semibold text-lg flex items-center justify-center gap-2 transition-colors"
        >
          {status === 'sending' ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <Send size={20} />
              Capture
            </>
          )}
        </button>
      </div>
    </div>
  );
}
