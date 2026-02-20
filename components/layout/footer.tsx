'use client';

import Link from 'next/link';
import { Facebook, Mail, MapPin } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function Footer() {
  const { t, locale } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { href: '/services', label: t('nav.services') },
      { href: '/providers', label: t('nav.providers') },
      { href: '/propiedades', label: t('nav.properties') },
      { href: '/solicitar', label: t('nav.request_service') },
    ],
    company: [
      { href: '/how-it-works', label: t('nav.how_it_works') },
      { href: '/for-providers', label: t('nav.for_providers') },
      { href: '/recomendar', label: t('nav.recommend') },
      { href: '/blog', label: t('nav.blog') },
    ],
    legal: [
      { href: '/privacy', label: locale === 'en' ? 'Privacy Policy' : 'Política de Privacidad' },
      { href: '/terms', label: locale === 'en' ? 'Terms of Service' : 'Términos de Servicio' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Mobile: Compact 2-column layout */}
        <div className="sm:hidden">
          {/* Social + Brand row */}
          <div className="flex items-center gap-3 mb-6">
            <a
              href="https://www.facebook.com/profile.php?id=651942891326268"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-gray-400"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="mailto:info@ecuacasa.com"
              className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-gray-400"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Links in 2 columns */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <h3 className="font-bold text-white mb-2 text-sm">{t('nav.services')}</h3>
              <ul className="space-y-1.5">
                {footerLinks.services.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2 text-sm">{locale === 'en' ? 'Company' : 'Empresa'}</h3>
              <ul className="space-y-1.5">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400">{link.label}</Link>
                  </li>
                ))}
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              <span>Cuenca, Ecuador</span>
              <span className="mx-2">•</span>
              <Mail className="w-3 h-3" />
              <span>info@ecuacasa.com</span>
            </div>
          </div>
        </div>

        {/* Desktop: Full 4-column layout */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">EC</span>
              </div>
              <span className="text-xl font-black text-white">EcuaCasa</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              {t('hero.new_subtitle')}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.facebook.com/profile.php?id=651942891326268"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@ecuacasa.com"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-bold text-white mb-4">
              {t('nav.services')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-white mb-4">
              {locale === 'en' ? 'Company' : 'Empresa'}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4">
              {locale === 'en' ? 'Contact' : 'Contacto'}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                Cuenca, Ecuador
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" />
                info@ecuacasa.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-gray-500">
            © {currentYear} EcuaCasa. {locale === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
