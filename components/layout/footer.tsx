'use client';

import Link from 'next/link';
import { Facebook, MessageCircle, Mail, MapPin } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function Footer() {
  const { t, locale } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { href: '/services', label: t('nav.services') },
      { href: '/providers', label: t('nav.providers') },
    ],
    company: [
      { href: '/how-it-works', label: t('nav.how_it_works') },
      { href: '/for-providers', label: t('nav.for_providers') },
    ],
    legal: [
      { href: '/privacy', label: locale === 'en' ? 'Privacy Policy' : 'Política de Privacidad' },
      { href: '/terms', label: locale === 'en' ? 'Terms of Service' : 'Términos de Servicio' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">EC</span>
              </div>
              <span className="text-xl font-black text-white">EcuaCasa</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              {t('hero.subtitle')}
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
                href="https://wa.me/593939451457"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-green-600 hover:text-white transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
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

            {/* Trust Badge */}
            <div className="mt-6 p-4 bg-gray-800 rounded-xl">
              <p className="text-sm font-medium text-white">
                {locale === 'en' ? '50+ Verified Professionals' : '50+ Profesionales Verificados'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {locale === 'en' ? 'Trusted by expats in Cuenca' : 'Confiado por expatriados en Cuenca'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {currentYear} MC2Agency LLC. {locale === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
