import Link from 'next/link';

export const metadata = {
  title: 'Términos de Servicio | EcuaCasa',
  description: 'Términos y condiciones de uso de EcuaCasa',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Términos de Servicio</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-600 mb-8">
            Última actualización: Febrero 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de términos</h2>
            <p className="text-gray-600">
              Al acceder y utilizar EcuaCasa, usted acepta estos términos de servicio. Si no está
              de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descripción del servicio</h2>
            <p className="text-gray-600">
              EcuaCasa es una plataforma que conecta a residentes de Cuenca, Ecuador con
              profesionales de servicios para el hogar. Actuamos únicamente como intermediarios
              y no somos parte de ningún contrato de servicios entre usuarios y profesionales.
            </p>
          </section>

          <section className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Descargo de responsabilidad inmobiliaria</h2>
            <p className="text-gray-600 mb-4">
              <strong>EcuaCasa es una plataforma de listados, NO una inmobiliaria ni corredora de bienes raíces.</strong>
            </p>
            <p className="text-gray-600 mb-4">
              EcuaCasa no negocia, vende, arrienda ni intermedia en transacciones de propiedades.
              Todas las transacciones inmobiliarias son realizadas directamente entre los propietarios
              de las propiedades y las partes interesadas.
            </p>
            <p className="text-gray-600 mb-4">
              EcuaCasa no verifica la titularidad legal, el estado de gravámenes, ni la exactitud
              de la información proporcionada por los propietarios o agentes. Los usuarios deben
              realizar su propia diligencia debida antes de cualquier transacción inmobiliaria.
            </p>
            <p className="text-gray-600">
              EcuaCasa no asume responsabilidad alguna por disputas, pérdidas o daños que surjan
              de transacciones inmobiliarias realizadas a través de contactos iniciados en nuestra plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Registro de profesionales</h2>
            <p className="text-gray-600 mb-4">
              Los profesionales que se registran en EcuaCasa deben:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Proporcionar información veraz y actualizada</li>
              <li>Mantener activo su número de WhatsApp</li>
              <li>Responder a las solicitudes de los clientes de manera profesional</li>
              <li>Cumplir con todas las leyes y regulaciones aplicables</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Uso aceptable</h2>
            <p className="text-gray-600 mb-4">
              Los usuarios de EcuaCasa se comprometen a:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>No usar la plataforma para actividades ilegales</li>
              <li>No publicar contenido falso, engañoso o difamatorio</li>
              <li>Respetar a otros usuarios y profesionales</li>
              <li>No intentar acceder a áreas restringidas del sistema</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitación de responsabilidad</h2>
            <p className="text-gray-600">
              EcuaCasa no es responsable por la calidad, puntualidad o resultados de los servicios
              prestados por los profesionales listados en nuestra plataforma. No garantizamos la
              disponibilidad, exactitud o integridad de la información proporcionada por terceros.
              Los usuarios contratan servicios bajo su propia responsabilidad.
            </p>
          </section>

          <section className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Relación entre usuario y profesional</h2>
            <p className="text-gray-600">
              Los profesionales listados en EcuaCasa son contratistas independientes y <strong>no son empleados,
              representantes ni agentes de EcuaCasa</strong>. No existe relación laboral, de agencia ni de
              sociedad entre EcuaCasa y los profesionales registrados en la plataforma. Cualquier acuerdo
              de servicios es celebrado exclusivamente entre el usuario y el profesional.
            </p>
          </section>

          <section className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Sin verificación de antecedentes penales</h2>
            <p className="text-gray-600">
              Como parte del proceso de registro, EcuaCasa recopila el número de cédula de identidad de los
              profesionales con fines de identificación. Sin embargo, <strong>EcuaCasa no realiza verificaciones
              de antecedentes penales, judiciales ni de ningún otro tipo</strong>. La recopilación del número
              de cédula no constituye garantía alguna sobre la idoneidad, confiabilidad o historial legal del
              profesional. Los usuarios deben realizar sus propias verificaciones antes de contratar cualquier servicio.
            </p>
          </section>

          <section className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Exoneración de responsabilidad</h2>
            <p className="text-gray-600 mb-4">
              EcuaCasa <strong>no será responsable por ningún daño, pérdida, robo, lesión personal o perjuicio</strong> que
              surja de la contratación o prestación de servicios entre usuarios y profesionales, incluyendo
              pero no limitado a:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Daños a la propiedad causados durante la prestación del servicio</li>
              <li>Robo o hurto de bienes del usuario</li>
              <li>Lesiones personales sufridas por el usuario, el profesional o terceros</li>
              <li>Incumplimiento de acuerdos entre el usuario y el profesional</li>
              <li>Disputas relacionadas con la calidad, precio o alcance del servicio</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Al utilizar EcuaCasa, el usuario acepta que asume la totalidad del riesgo asociado con la
              contratación de cualquier profesional listado en la plataforma.
            </p>
          </section>

          <section className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Resolución de disputas</h2>
            <p className="text-gray-600">
              Cualquier disputa, reclamo o controversia que surja entre un usuario y un profesional deberá
              ser resuelta <strong>directamente entre las partes involucradas</strong>. EcuaCasa no actúa como
              mediador, árbitro ni parte en ninguna disputa entre usuarios y profesionales. EcuaCasa no tiene
              obligación de intervenir, investigar ni resolver conflictos derivados de la prestación de servicios
              contratados a través de la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Propiedad intelectual</h2>
            <p className="text-gray-600">
              Todo el contenido de EcuaCasa, incluyendo textos, gráficos, logos, y software,
              es propiedad de EcuaCasa o sus licenciantes y está protegido por leyes de
              propiedad intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Suspensión y terminación</h2>
            <p className="text-gray-600">
              Nos reservamos el derecho de suspender o terminar el acceso de cualquier usuario
              que viole estos términos de servicio, sin previo aviso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modificaciones</h2>
            <p className="text-gray-600">
              Podemos modificar estos términos en cualquier momento. Los cambios serán efectivos
              inmediatamente después de su publicación. El uso continuado del servicio después
              de los cambios constituye aceptación de los nuevos términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Ley aplicable</h2>
            <p className="text-gray-600">
              Estos términos se rigen por las leyes de la República del Ecuador. Cualquier
              disputa será resuelta en los tribunales competentes de Cuenca, Ecuador.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contacto</h2>
            <p className="text-gray-600">
              Para preguntas sobre estos términos de servicio, puede contactarnos a través
              de nuestra plataforma.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
