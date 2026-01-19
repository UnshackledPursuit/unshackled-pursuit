"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun } from "lucide-react";

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
      {/* Hero Section with Beach Background */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        {/* Background Image */}
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

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Unshackled Pursuit
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300 sm:text-xl">
            Building software that breaks boundaries. From web applications to immersive visionOS experiences.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-200" asChild>
              <a href="#projects">View Projects</a>
            </Button>
            <Button size="lg" variant="outline" className="border-zinc-400 dark:border-zinc-500 text-zinc-900 dark:text-zinc-50 bg-white/80 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700" asChild>
              <a href="#contact">Get in Touch</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="px-6 py-24 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">Projects</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* WaypointHub Card */}
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src="/screenshot-orbs-beach.png"
                  alt="WaypointHub spatial interface"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Image
                    src="/waypoint-logo.png"
                    alt="WaypointHub logo"
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <CardTitle className="text-zinc-900 dark:text-zinc-50 text-2xl">WaypointHub</CardTitle>
                </div>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                  Spatial link launcher for visionOS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-zinc-600 dark:text-zinc-300">
                  A native visionOS app that transforms how you access your digital world. Save links, organize them into constellation workflows, and launch everything with a single tap. Portals appear as glowing orbs floating in your space—hover to preview, tap to open.
                </p>
                <ul className="mb-6 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <li>• Drag & drop from Safari, Notes, Files</li>
                  <li>• Group links into constellation workflows</li>
                  <li>• Launch any workflow instantly</li>
                  <li>• Free to try, $9.99 lifetime unlock</li>
                </ul>
                <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-200" asChild>
                  <a href="https://waypointhub.app" target="_blank" rel="noopener noreferrer">
                    Visit Site
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Future Projects Card */}
            <Card className="bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-800 border-dashed flex flex-col justify-center">
              <CardHeader>
                <CardTitle className="text-zinc-400 dark:text-zinc-500 text-2xl">Future Projects</CardTitle>
                <CardDescription className="text-zinc-400 dark:text-zinc-600">
                  Coming soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 dark:text-zinc-500">
                  More projects in development. Building tools that simplify workflows and push spatial computing forward.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-zinc-100 dark:bg-zinc-900 px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Services</h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            I build custom software solutions tailored to your needs. Whether you need a web application,
            mobile app, or cutting-edge visionOS experience, I can help bring your ideas to life.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="mb-2 text-xl font-semibold">Web Development</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Modern, responsive web applications built with Next.js and React.</p>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold">visionOS Apps</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Immersive spatial computing experiences for Apple Vision Pro.</p>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold">Custom Solutions</h3>
              <p className="text-zinc-600 dark:text-zinc-400">End-to-end development from concept to deployment.</p>
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
          <Button size="lg" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-200" asChild>
            <a href="https://x.com/Dylan_Russell_X" target="_blank" rel="noopener noreferrer">
              Contact on X
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-8 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Unshackled Pursuit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
