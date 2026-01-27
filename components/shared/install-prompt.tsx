"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if dismissed
    if (localStorage.getItem("ecuacasa-pwa-dismissed")) return;
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Track visits
    const visits = parseInt(localStorage.getItem("ecuacasa-visits") || "0", 10) + 1;
    localStorage.setItem("ecuacasa-visits", String(visits));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after 2+ visits or 30s on page
      if (visits >= 2) {
        setShow(true);
      } else {
        setTimeout(() => setShow(true), 30000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("ecuacasa-pwa-dismissed", "1");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 rounded-2xl border border-purple-500/20 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 text-sm font-extrabold text-white">
          EC
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Install EcuaCasa</p>
          <p className="text-xs text-gray-400">Quick access to home services</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 rounded-xl bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-500 transition-colors"
        >
          <Download className="h-4 w-4" />
        </button>
        <button onClick={handleDismiss} className="shrink-0 text-gray-500 hover:text-gray-300">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
