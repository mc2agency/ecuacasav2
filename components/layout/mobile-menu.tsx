'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/shared/language-toggle';
import { useTranslation } from '@/hooks/use-translation';
import { useEffect, useRef } from 'react';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navLinks: { href: string; label: string }[];
}

export function MobileMenu({ open, onClose, navLinks }: MobileMenuProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const prevPathname = useRef(pathname);

  // Close menu on route change (only when pathname actually changes)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Menu */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 md:hidden shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2" onClick={onClose}>
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EcuaCasa</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                      pathname === link.href
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Solicitar CTA */}
            <div className="mt-4">
              <Link
                href="/solicitar"
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                {t('nav.request_service')}
              </Link>
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="px-4 py-6 border-t border-gray-200 space-y-3">
            {/* Language Toggle */}
            <LanguageToggle variant="button" className="w-full justify-center" />

            {/* Admin Link - Always accessible since /admin has its own login gate */}
            <Link href="/admin">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
