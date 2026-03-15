'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DepthPadPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

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
          src="/icons/depthpad.png"
          alt="DepthPad app icon"
          width={128}
          height={128}
          className="rounded-[28px] shadow-2xl mb-6"
          priority
        />

        <h1 className="text-4xl font-bold tracking-tight mb-2">DepthPad</h1>
        <p className="text-zinc-400 text-lg mb-6">Spatial Canvas for Apple Vision Pro</p>
        <p className="text-2xl font-light text-zinc-300 max-w-md">
          Look. Pinch. Draw.
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
          <p className="text-zinc-500 text-sm mt-3">$4.99 &middot; visionOS 2.0+ &middot; No subscriptions</p>
        </div>
      </header>

      {/* Description */}
      <section className="px-6 py-12 max-w-2xl mx-auto text-center">
        <p className="text-zinc-300 text-lg leading-relaxed">
          DepthPad turns your Apple Vision Pro into a spatial canvas. Look where you want to draw, pinch to create.
          Layer drawings at different depths, rotate your creation from every angle, and bask in what you&apos;ve made.
          From the makers of Spatialis.
        </p>
      </section>

      {/* Features */}
      <section className="px-6 py-12 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-semibold text-center mb-10">Simple. Spatial. Satisfying.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '👁️', title: 'Gaze + Pinch Drawing', desc: 'Look at any point in the volume, pinch to draw. Strokes appear exactly where you look. Natural and intuitive.' },
            { icon: '📐', title: 'Depth Layering', desc: 'Two drawing planes — vertical and flat. Depth slider moves your canvas forward and back. Layer compositions in space.' },
            { icon: '🎨', title: '4 Brush Types', desc: 'Line, Orb, Calligraphy, Ink Pen. Each renders as real 3D geometry. Four sizes from Fine to Bold.' },
            { icon: '🔄', title: '90° View Rotation', desc: 'Rotate your creation to draw from every side. Front, Right, Back, Left — plus tilt up, down, and flip.' },
            { icon: '📑', title: '5-Layer System', desc: 'Hide, show, lock, rename, duplicate, merge, solo focus. Full layer management for precise compositions.' },
            { icon: '👨‍👩‍👧‍👦', title: 'Family Sharing', desc: 'One purchase covers up to 6 family members. $4.99 total. No subscriptions, no ads, no in-app purchases.' },
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
            'Launch DepthPad. Your spatial canvas appears in front of you.',
            'Pick a brush and color. Look where you want to draw. Pinch to create.',
            'Switch between vertical and flat planes. Adjust depth to layer drawings.',
            'Rotate your creation to draw from every angle. Use grid lines as guides.',
            'Save your work. Come back anytime. Five slots, always ready.',
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
            { q: 'How is DepthPad different from Spatialis?', a: 'DepthPad is the lightweight companion — 2D planes with depth layering, gaze + pinch input, clean grid canvas. Spatialis is the full studio with true 3D omnidirectional drawing, 17 brushes, 8 materials, USDZ export, and image import. Think of DepthPad as the sketchpad, Spatialis as the studio.' },
            { q: 'Can I export my drawings?', a: 'Export is not available in v1.0. We\'re working on an export-to-Spatialis feature that will let you send your layered compositions to Spatialis for full 3D editing and USDZ export.' },
            { q: 'How many drawings can I save?', a: 'DepthPad supports 5 save slots. Each slot preserves your full canvas — all layers, colors, and depth positions.' },
            { q: 'Does DepthPad work alongside other apps?', a: 'Yes. DepthPad uses a volumetric window, so it works alongside any other visionOS app. Draw while watching a movie, reading a document, or brainstorming with sticky notes.' },
            { q: 'What brushes are available?', a: 'Four brush types: Line (smooth strokes), Orb (dotted points), Calligraphy (pressure-sensitive style), and Ink Pen (fine detail). Each has four sizes: Fine, Medium, Thick, and Bold.' },
            { q: 'Does Family Sharing work?', a: 'Yes. One $4.99 purchase covers up to 6 family members through Apple\'s Family Sharing. No additional purchases needed.' },
            { q: 'Is there a subscription?', a: 'No. DepthPad is a one-time purchase. No subscriptions, no in-app purchases, no ads. Ever.' },
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

      {/* Privacy Policy */}
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
              <p>DepthPad (&quot;the App&quot;) is developed and published by Unshackled Pursuit. This privacy policy describes how the App handles your data.</p>
              <p><strong className="text-zinc-300">Data Collection:</strong> DepthPad does not collect, store, transmit, or share any personal data. The App makes zero network calls. No analytics, telemetry, crash reporting, or usage tracking of any kind is implemented.</p>
              <p><strong className="text-zinc-300">Drawing Data:</strong> All drawings and saved designs are stored locally on your Apple Vision Pro. Drawing data is never transmitted to any server. If you delete the app, your saved designs are permanently removed.</p>
              <p><strong className="text-zinc-300">Third-Party Services:</strong> DepthPad does not integrate with any third-party services, SDKs, analytics platforms, or advertising networks.</p>
              <p><strong className="text-zinc-300">Children&apos;s Privacy:</strong> DepthPad does not collect data from any users, including children. The App is rated 4+ and is safe for all ages.</p>
              <p><strong className="text-zinc-300">Changes:</strong> If this policy changes, the updated version will be posted on this page with a new date.</p>
              <p><strong className="text-zinc-300">Contact:</strong> For privacy questions, email info@unshackledpursuit.com.</p>
            </div>
          )}
        </div>
      </section>

      {/* Support */}
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
              <div className="flex gap-3 pb-2">
                <a
                  href="mailto:info@unshackledpursuit.com?subject=DepthPad%20Feedback&body=App%3A%20DepthPad%0A%0AWe'd%20love%20to%20hear%20from%20you!%20Any%20features%20you'd%20love%20to%20have%2C%20or%20anything%20on%20your%20mind%3A%0A%0A"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  💬 Send Feedback
                </a>
                <a
                  href="mailto:info@unshackledpursuit.com?subject=DepthPad%20Support&body=App%3A%20DepthPad%0A%0AHow%20can%20we%20help%3F%20Let%20us%20know%20what's%20going%20on%20and%20we'll%20get%20back%20to%20you%3A%0A%0A"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  ✉️ Email Support
                </a>
              </div>
              <p>Having trouble with DepthPad? Here are common solutions:</p>
              <p><strong className="text-zinc-300">Drawing not responding:</strong> Make sure you&apos;re looking at the canvas area and using a pinch gesture. DepthPad uses gaze-based input — look where you want to draw, then pinch.</p>
              <p><strong className="text-zinc-300">Designs not saving:</strong> DepthPad supports 5 save slots. Use the Save button on the right panel. Designs are stored locally on your device.</p>
              <p><strong className="text-zinc-300">Canvas not visible:</strong> Try Reset View on the right panel. This returns the canvas to its default position and rotation.</p>
              <p><strong className="text-zinc-300">Family Sharing:</strong> Family Sharing is automatic with paid apps. All family members in your Apple Family group can download DepthPad at no additional cost.</p>
              <p><strong className="text-zinc-300">Still need help?</strong> Email us at <span className="text-zinc-300">info@unshackledpursuit.com</span> and we&apos;ll get back to you within 48 hours.</p>
            </div>
          )}
        </div>
      </section>

      {/* Terms of Use */}
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
              <p>By downloading or using DepthPad (&quot;the App&quot;), you agree to these terms.</p>
              <p><strong className="text-zinc-300">License:</strong> Unshackled Pursuit grants you a limited, non-exclusive, non-transferable license to use the App on any Apple device that you own or control, subject to the Apple Media Services Terms and Conditions.</p>
              <p><strong className="text-zinc-300">Acceptable Use:</strong> You may use the App for any lawful personal or commercial purpose. You may not reverse engineer, decompile, or disassemble the App.</p>
              <p><strong className="text-zinc-300">Content:</strong> You retain ownership of all drawings and designs you create within the App. Unshackled Pursuit does not access, collect, or claim any rights to your content.</p>
              <p><strong className="text-zinc-300">Purchases:</strong> DepthPad is a one-time paid purchase. No subscriptions or recurring charges. Refunds are handled through Apple per their standard refund policy.</p>
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
            { name: 'Spatialis', desc: 'Full 3D spatial studio', color: '#E8725C', price: '$14.99' },
            { name: 'AirSticky', desc: 'Spatial sticky notes', color: '#5AC8FA', price: '$2.99' },
            { name: 'WaypointHub', desc: 'Spatial portal launcher', color: '#2D7D6B', price: 'Free' },
            { name: 'UtterFlow', desc: 'Live spatial captions', color: '#1A3A5C', price: '$6.99' },
            { name: 'Baoding Orbs', desc: 'Meditation in motion', color: '#7B5EA7', price: '$5.99' },
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
