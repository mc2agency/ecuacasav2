'use client';

import { MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/utils/whatsapp';
import { useTranslation } from '@/hooks/use-translation';
import { trackWhatsAppClick } from '@/lib/analytics';

interface WhatsAppButtonProps {
  providerName: string;
  phoneNumber: string;
  serviceName?: string;
  providerId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function WhatsAppButton({
  providerName,
  phoneNumber,
  serviceName,
  providerId,
  className = '',
  size = 'md',
}: WhatsAppButtonProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const url = generateWhatsAppLink(phoneNumber, providerName, serviceName);

  const handleClick = async () => {
    // Track analytics
    trackWhatsAppClick(providerName);
    // Log contact click (fire and forget - don't wait for response)
    if (providerId) {
      try {
        fetch('/api/contact-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider_id: providerId,
            service_type: serviceName,
            referrer: window.location.pathname,
          }),
        }).catch(() => {
          // Silently fail - don't interrupt user experience
        });
      } catch {
        // Silently fail
      }
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center gap-2
        bg-[#25D366] hover:bg-[#128C7E]
        text-white font-medium rounded-lg
        transition-all duration-200
        shadow-md hover:shadow-lg
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <MessageCircle className="w-5 h-5" />
      <span>{t('providers.contact')}</span>
    </a>
  );
}
