'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function VoiceNotesPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  // Auto-open and scroll to section if URL has #hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#privacy') {
      setPrivacyOpen(true);
      setTimeout(() => document.getElementById('privacy')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else if (hash === '#support') {
      setSupportOpen(true);
      setTimeout(() => document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else if (hash === '#terms') {
      setTermsOpen(true);
      setTimeout(() => document.getElementById('terms')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else if (hash === '#faq') {
      setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, []);

  const toggleFaq = (i: number) => setFaqOpen(faqOpen === i ? null : i);

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Hero */}
      <header className="flex flex-col items-center justify-center px-6 pt-20 pb-12 text-center">
        <Image
          src="/icons/airsticky.png"
          alt="AirSticky app icon"
          width={128}
          height={128}
          className="rounded-[28px] shadow-2xl mb-6"
          priority
        />

        <h1 className="text-4xl font-bold tracking-tight mb-2">AirSticky</h1>
        <p className="text-zinc-400 text-lg mb-6">Spatial Sticky Notes for Apple Vision Pro</p>
        <p className="text-2xl font-light text-zinc-300 max-w-md">
          Speak. It stays.
        </p>

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
          <p className="text-zinc-500 text-sm mt-3">$2.99 &middot; visionOS 26.0+ &middot; No subscriptions</p>
        </div>
      </header>

      {/* Description */}
      <section className="px-6 py-12 max-w-2xl mx-auto text-center">
        <p className="text-zinc-300 text-lg leading-relaxed">
          Tap anywhere in your space. Speak. Your words appear as a floating note right where you&apos;re looking.
          Come back tomorrow &mdash; it&apos;s still there. On-device transcription. Zero data collection.
          Your thoughts stay yours.
        </p>
      </section>

      {/* Features */}
      <section className="px-6 py-12 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-semibold text-center mb-10">Everything you need. Nothing you don&apos;t.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🎙️', title: 'One Tap Voice Capture', desc: 'Tap record, speak naturally. Your words appear instantly as text on a floating note.' },
            { icon: '📌', title: 'Notes Stay Put', desc: 'Every note stays exactly where you left it. Close the app, come back tomorrow. Still there.' },
            { icon: '📋', title: 'Copy. Share. Edit.', desc: 'One tap to copy text, share with any app, or edit your note. Paste links from anywhere.' },
            { icon: '🎨', title: 'Color Coded', desc: 'Seven colors for instant visual organization. No folders needed. Your space is your system.' },
            { icon: '🔒', title: 'Fully Private', desc: 'On-device transcription via Apple Speech. Zero data collection. Nothing leaves your headset.' },
            { icon: '👨‍👩‍👧‍👦', title: 'Family Sharing', desc: 'One purchase covers up to 6 family members. $2.99 total. No subscriptions, no ads.' },
          ].map((f, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-10">How it works</h2>
        <div className="space-y-8">
          {[
            'Launch AirSticky. Your spatial canvas is ready.',
            'Tap record. Speak your thought. Text appears instantly.',
            'Your note floats right where you were looking.',
            'Create more notes. Color-code them. Spread them in your space.',
            'Close the app. Come back anytime. Every note is still there.',
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-mono text-zinc-400 flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-zinc-300 text-left">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-12 max-w-2xl mx-auto w-full" id="faq">
        <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: 'Do I need an internet connection?', a: 'No. All voice transcription happens on-device using Apple\'s Speech framework. AirSticky works completely offline.' },
            { q: 'Does AirSticky collect any data?', a: 'No. Zero data collection. No analytics, no telemetry, no network calls. Everything stays on your Apple Vision Pro.' },
            { q: 'How many notes can I create?', a: 'There is no hard limit. Create as many notes as you need. Each one floats in your space independently.' },
            { q: 'Do notes persist when I close the app?', a: 'Yes. Your notes are saved automatically and will be in the same position when you reopen the app.' },
            { q: 'Can I share notes with other apps?', a: 'Yes. Tap any note to access copy, share, and edit options. You can also paste text and links from other apps into your notes.' },
            { q: 'Does Family Sharing work?', a: 'Yes. One $2.99 purchase covers up to 6 family members through Apple\'s Family Sharing. No additional purchases needed.' },
            { q: 'What devices does AirSticky support?', a: 'AirSticky is designed exclusively for Apple Vision Pro running visionOS 26.0 or later.' },
            { q: 'Is there a subscription?', a: 'No. AirSticky is a one-time purchase of $2.99. No subscriptions, no in-app purchases, no ads. Ever.' },
          ].map((item, i) => (
            <div key={i} className="border border-zinc-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-zinc-900 transition-colors"
              >
                <span className="text-sm font-medium">{item.q}</span>
                <span className="text-zinc-500 text-lg">{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && (
                <div className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Policy (inline, expandable) */}
      <section className="px-6 py-12 max-w-2xl mx-auto w-full" id="privacy">
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setPrivacyOpen(!privacyOpen)}
            className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-zinc-900 transition-colors"
          >
            <h2 className="text-xl font-semibold">Privacy Policy</h2>
            <span className="text-zinc-500 text-lg">{privacyOpen ? '−' : '+'}</span>
          </button>
          {privacyOpen && (
            <div className="px-6 pb-6 text-sm text-zinc-400 leading-relaxed space-y-4">
              <p><strong className="text-zinc-300">Last updated:</strong> March 15, 2026</p>
              <p>AirSticky (&quot;the App&quot;) is developed and published by Unshackled Pursuit. This privacy policy describes how the App handles your data.</p>
              <p><strong className="text-zinc-300">Data Collection:</strong> AirSticky does not collect, store, transmit, or share any personal data. The App makes zero network calls. No analytics, telemetry, crash reporting, or usage tracking of any kind is implemented.</p>
              <p><strong className="text-zinc-300">Voice & Speech Data:</strong> All voice transcription is performed entirely on-device using Apple&apos;s built-in Speech framework. Audio is processed locally and never recorded, stored, or transmitted. No audio data leaves your device.</p>
              <p><strong className="text-zinc-300">Note Content:</strong> Notes you create are stored locally on your Apple Vision Pro. Note content is never transmitted to any server. If you delete the app, your notes are permanently removed.</p>
              <p><strong className="text-zinc-300">Third-Party Services:</strong> AirSticky does not integrate with any third-party services, SDKs, analytics platforms, or advertising networks.</p>
              <p><strong className="text-zinc-300">Children&apos;s Privacy:</strong> AirSticky does not collect data from any users, including children. The App is rated 4+ and is safe for all ages.</p>
              <p><strong className="text-zinc-300">Changes:</strong> If this policy changes, the updated version will be posted on this page with a new date.</p>
              <p><strong className="text-zinc-300">Contact:</strong> For privacy questions, email info@unshackledpursuit.com.</p>
            </div>
          )}
        </div>
      </section>

      {/* Support (inline, expandable) */}
      <section className="px-6 py-6 max-w-2xl mx-auto w-full" id="support">
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setSupportOpen(!supportOpen)}
            className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-zinc-900 transition-colors"
          >
            <h2 className="text-xl font-semibold">Support</h2>
            <span className="text-zinc-500 text-lg">{supportOpen ? '−' : '+'}</span>
          </button>
          {supportOpen && (
            <div className="px-6 pb-6 text-sm text-zinc-400 leading-relaxed space-y-4">
              {/* Feedback + Support buttons — auto-tagged with app name */}
              <div className="flex gap-3 pb-2">
                <a
                  href="mailto:info@unshackledpursuit.com?subject=AirSticky%20Feedback&body=App%3A%20AirSticky%0AVersion%3A%201.0%0A%0A"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  💬 Send Feedback
                </a>
                <a
                  href="mailto:info@unshackledpursuit.com?subject=AirSticky%20Support%20Request&body=App%3A%20AirSticky%0AVersion%3A%201.0%0A%0ADescribe%20your%20issue%3A%0A"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  ✉️ Email Support
                </a>
              </div>
              <p>Having trouble with AirSticky? Here are common solutions:</p>
              <p><strong className="text-zinc-300">Microphone not working:</strong> Make sure you&apos;ve granted microphone permission to AirSticky in Settings &gt; Privacy &amp; Security &gt; Microphone.</p>
              <p><strong className="text-zinc-300">Notes not saving:</strong> Notes save automatically. If you&apos;re experiencing issues, try closing and reopening the app. Notes are stored locally on your device.</p>
              <p><strong className="text-zinc-300">Transcription accuracy:</strong> AirSticky uses Apple&apos;s on-device Speech framework. Speak clearly and at a normal pace for best results. Background noise may affect accuracy.</p>
              <p><strong className="text-zinc-300">Family Sharing:</strong> Family Sharing is automatic with paid apps. All family members in your Apple Family group can download AirSticky at no additional cost.</p>
              <p><strong className="text-zinc-300">Still need help?</strong> Email us at <span className="text-zinc-300">info@unshackledpursuit.com</span> and we&apos;ll get back to you within 48 hours.</p>
            </div>
          )}
        </div>
      </section>

      {/* Terms of Use (inline, expandable) */}
      <section className="px-6 py-6 max-w-2xl mx-auto w-full" id="terms">
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setTermsOpen(!termsOpen)}
            className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-zinc-900 transition-colors"
          >
            <h2 className="text-xl font-semibold">Terms of Use</h2>
            <span className="text-zinc-500 text-lg">{termsOpen ? '−' : '+'}</span>
          </button>
          {termsOpen && (
            <div className="px-6 pb-6 text-sm text-zinc-400 leading-relaxed space-y-4">
              <p><strong className="text-zinc-300">Last updated:</strong> March 15, 2026</p>
              <p>By downloading or using AirSticky (&quot;the App&quot;), you agree to these terms.</p>
              <p><strong className="text-zinc-300">License:</strong> Unshackled Pursuit grants you a limited, non-exclusive, non-transferable license to use the App on any Apple device that you own or control, subject to the Apple Media Services Terms and Conditions.</p>
              <p><strong className="text-zinc-300">Acceptable Use:</strong> You may use the App for any lawful personal or commercial purpose. You may not reverse engineer, decompile, or disassemble the App.</p>
              <p><strong className="text-zinc-300">Content:</strong> You retain ownership of all notes and content you create within the App. Unshackled Pursuit does not access, collect, or claim any rights to your content.</p>
              <p><strong className="text-zinc-300">Purchases:</strong> AirSticky is a one-time paid purchase. No subscriptions or recurring charges. Refunds are handled through Apple per their standard refund policy.</p>
              <p><strong className="text-zinc-300">Family Sharing:</strong> Purchases are shareable with up to 6 family members through Apple&apos;s Family Sharing feature at no additional cost.</p>
              <p><strong className="text-zinc-300">Disclaimer:</strong> The App is provided &quot;as is&quot; without warranty of any kind. Unshackled Pursuit is not liable for any loss of data or content created within the App.</p>
              <p><strong className="text-zinc-300">Apple EULA:</strong> This App is also subject to Apple&apos;s standard End User License Agreement (EULA) available at <span className="text-zinc-300">apple.com/legal/internet-services/itunes/dev/stdeula</span>.</p>
              <p><strong className="text-zinc-300">Contact:</strong> For questions about these terms, email info@unshackledpursuit.com.</p>
            </div>
          )}
        </div>
      </section>

      {/* Also From Us */}
      <section className="px-6 py-12 max-w-4xl mx-auto w-full">
        <h2 className="text-xl font-semibold text-center mb-8 text-zinc-400">Also from Unshackled Pursuit</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Spatialis', desc: '3D spatial canvas', color: '#E8725C', price: '$14.99' },
            { name: 'Baoding Orbs', desc: 'Meditation in motion', color: '#7B5EA7', price: '$5.99' },
            { name: 'WaypointHub', desc: 'Spatial portal launcher', color: '#2D7D6B', price: 'Free' },
            { name: 'UtterFlow', desc: 'Live spatial captions', color: '#1A3A5C', price: '$6.99' },
          ].map((app) => (
            <div key={app.name} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center hover:border-zinc-700 transition-colors cursor-pointer">
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-3"
                style={{ background: app.color }}
              />
              <p className="text-sm font-medium">{app.name}</p>
              <p className="text-xs text-zinc-500">{app.desc}</p>
              <p className="text-xs text-zinc-600 mt-1">{app.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 text-center border-t border-zinc-800 mt-auto">
        <p className="text-zinc-600 text-xs">
          &copy; 2026 Unshackled Pursuit. All rights reserved.
        </p>
        <p className="text-zinc-700 text-xs mt-2">
          Apple Vision Pro and visionOS are trademarks of Apple Inc., registered in the U.S. and other countries.
        </p>
      </footer>
    </div>
  );
}
