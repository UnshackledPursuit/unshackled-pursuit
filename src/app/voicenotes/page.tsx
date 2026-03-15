'use client';

import { useState } from 'react';

export default function VoiceNotesPage() {
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Hero */}
      <header className="flex flex-col items-center justify-center px-6 pt-20 pb-12 text-center">
        {/* App Icon */}
        <div className="w-28 h-28 rounded-[28px] mb-6 flex items-center justify-center shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #5AC8FA 0%, #3478F6 50%, #5856D6 100%)',
          }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-2">Voice Notes</h1>
        <p className="text-zinc-400 text-lg mb-6">Spatial Sticky Notes for Vision Pro</p>
        <p className="text-2xl font-light text-zinc-300 max-w-md">
          Speak. It stays.
        </p>

        {/* App Store Badge */}
        <div className="mt-8">
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-medium text-sm hover:bg-zinc-200 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Download on the App Store
          </a>
          <p className="text-zinc-500 text-sm mt-3">$2.99 &middot; visionOS 2.0+ &middot; No subscriptions</p>
        </div>
      </header>

      {/* Hero Description */}
      <section className="px-6 py-12 max-w-2xl mx-auto text-center">
        <p className="text-zinc-300 text-lg leading-relaxed">
          Tap anywhere in your space. Speak. Your words appear as a floating note right where you&apos;re looking.
          Come back tomorrow &mdash; it&apos;s still there. On-device transcription. Zero data collection.
          Your thoughts stay yours.
        </p>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-12 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-semibold text-center mb-10">Everything you need. Nothing you don&apos;t.</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5AC8FA" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              ),
              title: 'One Tap Voice Capture',
              desc: 'Tap record, speak naturally. Your words appear instantly as text on a floating note.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ),
              title: 'Notes Stay Put',
              desc: 'Every note stays exactly where you left it. Close the app, come back tomorrow. Still there.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              ),
              title: 'Copy. Share. Edit.',
              desc: 'One tap to copy text, share with any app, or edit your note. Paste links from anywhere.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#AF52DE" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" fill="#AF52DE" />
                </svg>
              ),
              title: 'Color Coded',
              desc: 'Seven colors for instant visual organization. No folders needed. Your space is your system.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5856D6" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
              title: 'Fully Private',
              desc: 'On-device transcription via Apple Speech. Zero data collection. Nothing leaves your headset.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              ),
              title: 'Family Sharing',
              desc: 'One purchase covers up to 6 family members. $2.99 total. No subscriptions, no ads.',
            },
          ].map((feature, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-10">How it works</h2>
        <div className="space-y-8">
          {[
            { step: '1', text: 'Launch Voice Notes. Your spatial canvas is ready.' },
            { step: '2', text: 'Tap record. Speak your thought. Text appears instantly.' },
            { step: '3', text: 'Your note floats right where you were looking.' },
            { step: '4', text: 'Create more notes. Color-code them. Spread them in your space.' },
            { step: '5', text: 'Close the app. Come back anytime. Every note is still there.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-mono text-zinc-400 flex-shrink-0">
                {item.step}
              </div>
              <p className="text-zinc-300 text-left">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Also From Us */}
      <section className="px-6 py-12 max-w-4xl mx-auto w-full">
        <h2 className="text-xl font-semibold text-center mb-8 text-zinc-400">Also from Unshackled Pursuit</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Spatialis', desc: '3D spatial canvas', color: '#E8725C' },
            { name: 'Baoding Orbs', desc: 'Meditation orbs', color: '#7B5EA7' },
            { name: 'WaypointHub', desc: 'Portal launcher', color: '#2D7D6B' },
            { name: 'UtterFlow', desc: 'Live captions', color: '#1A3A5C' },
          ].map((app) => (
            <div key={app.name} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center hover:border-zinc-700 transition-colors">
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-3"
                style={{ background: app.color }}
              />
              <p className="text-sm font-medium">{app.name}</p>
              <p className="text-xs text-zinc-500">{app.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 text-center border-t border-zinc-800 mt-auto">
        <p className="text-zinc-500 text-xs">
          Unshackled Pursuit &middot;{' '}
          <a href="https://unshackledpursuit.com/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
          {' '}&middot;{' '}
          <a href="mailto:support@unshackledpursuit.com" className="hover:text-zinc-300 transition-colors">Support</a>
        </p>
        <p className="text-zinc-600 text-xs mt-2">
          Apple Vision Pro is a trademark of Apple Inc.
        </p>
      </footer>
    </div>
  );
}
