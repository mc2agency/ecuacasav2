'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS() {
  if (typeof window === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isInStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

// iOS share icon (square with arrow up)
function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // Already dismissed or running as installed PWA
    if (localStorage.getItem('ecuacasa-pwa-dismissed')) return;
    if (isInStandaloneMode()) return;

    // Track visits
    const visits =
      parseInt(localStorage.getItem('ecuacasa-visits') || '0', 10) + 1;
    localStorage.setItem('ecuacasa-visits', String(visits));

    const shouldShow = visits >= 2;
    const delay = shouldShow ? 0 : 30000;

    // iOS Safari: show custom instructions banner
    if (isIOS()) {
      const timer = setTimeout(() => setShowIOS(true), delay);
      return () => clearTimeout(timer);
    }

    // Android Chrome / Chromium: use native beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (shouldShow) {
        setShowAndroid(true);
      } else {
        setTimeout(() => setShowAndroid(true), delay);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowAndroid(false);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShowAndroid(false);
    setShowIOS(false);
    localStorage.setItem('ecuacasa-pwa-dismissed', '1');
  };

  if (!showAndroid && !showIOS) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="rounded-2xl border border-purple-500/20 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 text-sm font-extrabold text-white">
            EC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Instala EcuaCasa</p>
            {showIOS ? (
              <p className="text-xs text-gray-400 flex items-center flex-wrap gap-0.5">
                Toca
                <ShareIcon className="h-3.5 w-3.5 text-blue-400 mx-0.5 inline-block" />
                y luego &quot;Agregar a Inicio&quot;
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                Acceso rápido a servicios del hogar
              </p>
            )}
          </div>
          {showAndroid && (
            <button
              onClick={handleInstall}
              className="shrink-0 rounded-xl bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-500 transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="shrink-0 text-gray-500 hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
