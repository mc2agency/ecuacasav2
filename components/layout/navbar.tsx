'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { useState, useCallback } from 'react';
import { MobileMenu } from './mobile-menu';

export function Navbar() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const navLinks = [
    { href: '/services', label: t('nav.services') },
    { href: '/propiedades', label: t('nav.properties') },
    { href: '/for-providers', label: t('nav.for_providers') },
    { href: '/blog', label: t('nav.blog') },
  ];

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'es' : 'en');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">EC</span>
              </div>
              <span className="text-xl font-black text-gray-900">EcuaCasa</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors hover:text-primary-600 ${
                    pathname === link.href
                      ? 'text-primary-600'
                      : 'text-gray-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/solicitar"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all text-sm"
              >
                {t('nav.request_service')}
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="hidden sm:flex font-medium text-gray-700 hover:text-primary-600"
              >
                {locale === 'en' ? 'ES' : 'EN'}
              </Button>

              {/* Admin Link - Desktop only; mobile uses hamburger menu */}
              <Link href="/admin" className="hidden md:inline-flex">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary-600">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        navLinks={navLinks}
      />
    </>
  );
}
