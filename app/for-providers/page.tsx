import Link from 'next/link';
import { CheckCircle, Users, MessageCircle, Star, TrendingUp, Shield, Clock } from 'lucide-react';

export const metadata = {
  title: 'Únete a EcuaCasa | Recibe Clientes en Cuenca Ecuador',
  description: 'Recibe solicitudes de clientes expatriados y locales en Cuenca. Únete gratis a la red de profesionales verificados de EcuaCasa.',
  openGraph: {
    title: 'Únete a EcuaCasa | Recibe Clientes en Cuenca Ecuador',
    description: 'Recibe solicitudes de clientes expatriados y locales en Cuenca. Únete gratis a la red de profesionales verificados de EcuaCasa.',
    url: 'https://ecuacasa.com/for-providers',
  },
  alternates: {
    canonical: '/for-providers',
  },
};

export default function ForProvidersPage() {
  const benefits = [
    {
      icon: Users,
      title: 'Acceso a más clientes',
      description: 'Conecta con la comunidad de expatriados en Cuenca que buscan servicios confiables',
    },
    {
      icon: MessageCircle,
      title: 'Contacto directo por WhatsApp',
      description: 'Los clientes te contactan directamente, sin intermediarios ni comisiones',
    },
    {
      icon: Star,
      title: 'Construye tu reputación',
      description: 'Recibe reseñas y calificaciones que destacan tu trabajo profesional',
    },
    {
      icon: Shield,
      title: 'Perfil verificado',
      description: 'Obtén la insignia de verificado y genera más confianza con los clientes',
    },
    {
      icon: TrendingUp,
      title: 'Mayor visibilidad',
      description: 'Tu perfil aparece en búsquedas relevantes y en la página principal',
    },
    {
      icon: Clock,
      title: 'Responde cuando puedas',
      description: 'Tú decides cuándo y cómo responder a las solicitudes de los clientes',
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Regístrate',
      description: 'Completa el formulario con tu información y servicios que ofreces',
    },
    {
      number: 2,
      title: 'Te verificamos',
      description: 'Nuestro equipo revisa tu información y te contacta para verificar',
    },
    {
      number: 3,
      title: 'Empieza a recibir clientes',
      description: 'Tu perfil aparece en la plataforma y los clientes te contactan por WhatsApp',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Haz crecer tu negocio con EcuaCasa
            </h1>
            <p className="text-xl text-primary-100 mb-10">
              Únete a nuestra red de profesionales verificados y conecta con clientes que valoran
              la calidad y la confianza
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 text-lg"
            >
              Registrarme gratis
            </Link>
            <p className="mt-4 text-primary-200 text-sm">
              Sin comisiones • Sin cuotas mensuales • 100% gratis
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué unirte a EcuaCasa?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Beneficios exclusivos para profesionales que quieren destacar en Cuenca
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-blue-100 rounded-xl flex items-center justify-center mb-5 group-hover:from-accent-100 group-hover:to-accent-200 transition-colors">
                    <Icon className="w-7 h-7 text-primary-600 group-hover:text-accent-600 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tres simples pasos para empezar a recibir clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-1">
              <div className="relative max-w-[70%] mx-auto h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200 rounded-full" />
              </div>
            </div>

            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center font-bold text-4xl mx-auto mb-6 shadow-lg relative z-10">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It's Free Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              100% Gratis — Sin Letra Pequeña
            </h2>
            <p className="text-xl text-primary-100 mb-10">
              Estamos construyendo la mejor red de profesionales en Cuenca. 
              Por eso el registro es completamente gratis — sin comisiones, sin cuotas, sin sorpresas.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-bold mb-2">$0</div>
                <div className="text-primary-200">Para registrarte</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold mb-2">0%</div>
                <div className="text-primary-200">Comisiones</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold mb-2">100%</div>
                <div className="text-primary-200">Contacto directo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-accent-500 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            ¿Listo para crecer tu negocio?
          </h2>
          <p className="text-xl text-accent-100 mb-10 max-w-2xl mx-auto">
            Únete a EcuaCasa hoy y empieza a conectar con clientes que buscan
            exactamente lo que ofreces
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-white text-accent-600 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 text-lg"
          >
            Registrarme ahora
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: '¿Cuánto cuesta registrarse?',
                a: 'El registro es completamente gratis. No cobramos comisiones ni cuotas mensuales.',
              },
              {
                q: '¿Cómo me contactan los clientes?',
                a: 'Los clientes te contactan directamente por WhatsApp. Tú decides si aceptas el trabajo.',
              },
              {
                q: '¿Qué significa ser "verificado"?',
                a: 'Los profesionales verificados han pasado nuestro proceso de revisión, lo que genera más confianza con los clientes.',
              },
              {
                q: '¿Necesito hablar inglés?',
                a: 'No es obligatorio, pero si hablas inglés tendrás acceso a más clientes expatriados.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
