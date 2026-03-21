"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const apps = [
  {
    name: "WaypointHub",
    tagline: "Your spatial link launcher",
    description:
      "Save links, organize them into constellation workflows, and launch everything with a single tap. Portals appear as glowing orbs floating in your space.",
    features: [
      "Drag & drop from Safari, Notes, Files",
      "Group links into constellation workflows",
      "Launch any workflow instantly",
    ],
    price: "Free to try, $9.99 lifetime unlock",
    icon: "/waypoint-logo.png",
    poster: "/screenshots/waypoint-hero.png",
    video: "/videos/waypoint-clip.mp4",
    appStoreUrl: "https://apps.apple.com/us/app/waypointhub/id6757930450",
  },
  {
    name: "Spatialis",
    tagline: "Draw in three dimensions",
    description:
      "Create with spatial brushes, layers, and symmetry tools. Sketch, sculpt, and export your creations as 3D models — all with intuitive hand tracking.",
    features: [
      "Spatial brushes with hand tracking",
      "Layers, symmetry modes, materials",
      "Import images & 3D models",
    ],
    price: "Free to try, $14.99 lifetime unlock",
    icon: "/spatialis-icon.png",
    poster: "/screenshots/spatialis-hero.png",
    video: "/videos/spatialis-clip.mp4",
    appStoreUrl: "https://apps.apple.com/us/app/spatialis/id6758575588",
  },
  {
    name: "UtterFlow",
    tagline: "Live captions, beautifully styled",
    description:
      "Real-time speech-to-text with 12+ visual styles. Pop captions out into your space, switch styles on the fly, and save transcription projects.",
    features: [
      "12+ caption styles with live preview",
      "Pop-out spatial captions",
      "Project mode for saved transcriptions",
    ],
    price: "Free to try, $4.99 lifetime unlock",
    icon: "/icons/utterflow.png",
    poster: "/screenshots/utterflow-hero.png",
    video: "/videos/utterflow-clip.mp4",
    appStoreUrl: "https://apps.apple.com/us/app/utterflow/id6759876298",
  },
  {
    name: "Baoding Orbs",
    tagline: "Meditative spatial orbs",
    description:
      "Floating meditation balls with realistic physics and spatial audio. Rotate them with your hands for a calming, tactile experience in your space.",
    features: [
      "Realistic physics & hand tracking",
      "Spatial audio feedback",
      "Multiple environments & materials",
    ],
    price: "Free to try, $2.99 lifetime unlock",
    icon: "/icons/baoding.png",
    poster: "/screenshots/baoding-hero.png",
    video: "/videos/baoding-clip.mp4",
    appStoreUrl: "https://apps.apple.com/us/app/baoding-orbs/id6759583090",
  },
];

const moreApps = [
  {
    name: "AirSticky",
    tagline: "Spatial sticky notes with voice",
    appStoreUrl: "https://apps.apple.com/us/app/airsticky/id6742371928",
    icon: "/icons/airsticky.png",
  },
  {
    name: "DepthPad",
    tagline: "2D spatial canvas",
    appStoreUrl: "https://apps.apple.com/us/app/depthpad/id6741690498",
    icon: "/icons/depthpad.png",
  },
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors">
      {/* Dark/Light Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/screenshot-orbs-beach.png"
            alt=""
            fill
            className="object-cover opacity-10 dark:opacity-15"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/70 to-white dark:from-zinc-950/50 dark:via-zinc-950/70 dark:to-zinc-950" />
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Unshackled Pursuit
          </h1>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 font-medium tracking-wide uppercase">
            Spatial Computing Studio
          </p>
          <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300 sm:text-xl">
            Building immersive apps for Apple Vision Pro. From 3D drawing to live captions — experiences designed for the spatial era.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-200"
              asChild
            >
              <a href="#apps">View Apps</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-400 dark:border-zinc-500 text-zinc-900 dark:text-zinc-50 bg-white/80 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              asChild
            >
              <a href="#contact">Get in Touch</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Apps Section */}
      <section id="apps" className="px-6 py-24 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Apps for Apple Vision Pro
          </h2>
          <p className="mb-14 text-center text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            All available now on the App Store. Built natively for visionOS with hand tracking and spatial audio.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {apps.map((app) => (
              <div
                key={app.name}
                className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-shadow hover:shadow-lg dark:hover:shadow-zinc-800/50"
              >
                {/* Video Preview */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={app.poster}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  >
                    <source src={app.video} type="video/mp4" />
                  </video>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={app.icon}
                      alt={`${app.name} icon`}
                      width={48}
                      height={48}
                      className="rounded-xl"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{app.name}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {app.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="mb-4 text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
                    {app.description}
                  </p>

                  <ul className="mb-5 space-y-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {app.features.map((f) => (
                      <li key={f}>
                        <span className="text-zinc-400 dark:text-zinc-500 mr-2">
                          &bull;
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {app.price}
                    </span>
                    <a
                      href={app.appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-sm font-medium px-5 py-2.5 rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.89C10.1 6.87 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                      </svg>
                      App Store
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* More Apps */}
          <div className="mt-12">
            <h3 className="text-center text-lg font-semibold text-zinc-500 dark:text-zinc-400 mb-6">
              Also Available
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              {moreApps.map((app) => (
                <a
                  key={app.name}
                  href={app.appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors flex-1"
                >
                  <Image
                    src={app.icon}
                    alt={`${app.name} icon`}
                    width={44}
                    height={44}
                    className="rounded-xl"
                  />
                  <div>
                    <p className="font-semibold text-sm">{app.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {app.tagline}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-6 py-24 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Get in Touch</h2>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            Have a project in mind? Let&apos;s talk.
          </p>
          <Button
            size="lg"
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-200"
            asChild
          >
            <a
              href="https://x.com/Dylan_Russell_X"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact on X
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-8 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl text-center text-sm text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()} Unshackled Pursuit. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
