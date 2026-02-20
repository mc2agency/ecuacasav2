export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface RelatedService {
  slug: string;
  label: string;
}

export interface ServiceSEOContent {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  faqs: ServiceFAQ[];
  relatedServices: RelatedService[];
}

export const SERVICE_CONTENT: Record<string, ServiceSEOContent> = {
  plomeria: {
    h1: 'Plomeros en Cuenca — Servicio a Domicilio',
    metaTitle: 'Plomeros en Cuenca Ecuador | Plomería a Domicilio Verificada',
    metaDescription:
      'Encuentra plomeros verificados en Cuenca. Reparaciones, instalaciones, emergencias 24h. Servicio a domicilio con respuesta en 2 horas. Presupuesto sin compromiso.',
    content: `
Encontrar un plomero confiable en Cuenca puede ser complicado, especialmente si acabas de mudarte a la ciudad. En EcuaCasa conectamos a residentes y expatriados con plomeros verificados que ofrecen servicio a domicilio en toda la ciudad, incluyendo el Centro Histórico, El Vergel, Yanuncay, Misicata y Totoracocha.

Cuenca tiene desafíos de plomería únicos. Muchas viviendas en el Centro Histórico cuentan con tuberías antiguas que requieren atención especializada. Los cambios de presión de agua son frecuentes en barrios de altura como Turi y Baños. Nuestros plomeros conocen estas particularidades y están preparados para resolverlas.

Los servicios más solicitados incluyen: reparación de fugas y goteras, instalación de calefones y sistemas de agua caliente, destape de tuberías y desagües, instalación de grifería y sanitarios, y mantenimiento preventivo de sistemas hidráulicos. También atendemos emergencias de plomería disponibles las 24 horas del día.

Todos los profesionales en nuestra plataforma pasan por un proceso de verificación que incluye revisión de identidad, experiencia comprobada y referencias de clientes anteriores. Puedes ver las calificaciones y reseñas de cada plomero antes de contactarlo.

¿Cómo funciona? Simplemente solicita el servicio, describe tu problema y te conectamos con un plomero verificado en menos de 2 horas. Recibes un presupuesto sin compromiso y tú decides si continúas. Sin intermediarios, sin costos ocultos.
    `.trim(),
    faqs: [
      {
        question: '¿Cuánto cobra un plomero en Cuenca?',
        answer:
          'El costo de un plomero en Cuenca varía según el trabajo. Una reparación sencilla como arreglar una fuga puede costar entre $15 y $40 USD. Instalaciones más complejas como calefones o sistemas completos de agua van desde $50 hasta $200 USD. En EcuaCasa puedes solicitar un presupuesto sin compromiso antes de contratar.',
      },
      {
        question: '¿Cómo encontrar un plomero confiable en Cuenca?',
        answer:
          'La mejor forma de encontrar un plomero confiable es a través de una plataforma que verifique a sus profesionales. En EcuaCasa cada plomero pasa por un proceso de verificación de identidad y experiencia. Además, puedes ver las calificaciones y reseñas de otros clientes antes de contactar al profesional.',
      },
      {
        question: '¿Hay plomeros de emergencia disponibles 24 horas en Cuenca?',
        answer:
          'Sí, en EcuaCasa contamos con plomeros disponibles para emergencias en Cuenca. Puedes solicitar servicio de plomería urgente a cualquier hora y te conectamos con un profesional verificado lo antes posible. El tiempo promedio de respuesta es de menos de 2 horas.',
      },
      {
        question: '¿Qué problemas de plomería son comunes en casas de Cuenca?',
        answer:
          'Los problemas más comunes en Cuenca incluyen fugas por tuberías antiguas (especialmente en el Centro Histórico), baja presión de agua en barrios elevados, problemas con calefones de gas, desagües tapados y humedad en paredes por filtraciones. Nuestros plomeros conocen estos problemas locales y saben cómo resolverlos eficientemente.',
      },
    ],
    relatedServices: [
      { slug: 'electricidad', label: 'Electricistas' },
      { slug: 'handyman', label: 'Handyman' },
    ],
  },

  carpinteria: {
    h1: 'Carpinteros en Cuenca — Muebles a Medida y Reparaciones',
    metaTitle: 'Carpinteros en Cuenca Ecuador | Carpintería a Domicilio Verificada',
    metaDescription:
      'Carpinteros verificados en Cuenca. Muebles a medida, closets, puertas, cocinas, reparaciones de madera. Servicio a domicilio con presupuesto sin compromiso.',
    content: `
La carpintería en Cuenca tiene una tradición artesanal que se refleja en cada hogar de la ciudad. Ya sea que necesites muebles a medida, reparación de puertas en casas del Centro Histórico o un closet nuevo para tu departamento en El Vergel, en EcuaCasa te conectamos con carpinteros verificados que trabajan con calidad y compromiso.

Nuestros carpinteros ofrecen servicios en toda la ciudad: desde Yanuncay y Misicata hasta Totoracocha, Monay y barrios residenciales como Puertas del Sol. Conocen los materiales disponibles en el mercado local y trabajan con maderas como laurel, seike, chanul y MDF según las necesidades de cada proyecto.

Los servicios de carpintería más solicitados en Cuenca incluyen: fabricación de muebles a medida (closets, repisas, libreros), instalación y reparación de puertas, diseño e instalación de cocinas integrales, restauración de muebles antiguos y trabajos especiales en madera para casas patrimoniales.

Si vives en una casa antigua del Centro Histórico de Cuenca, sabemos que mantener las puertas, ventanas y molduras originales requiere manos expertas. Nuestros carpinteros tienen experiencia en restauración y conservación de elementos de madera en edificaciones patrimoniales.

Todos los carpinteros en EcuaCasa están verificados. Puedes revisar sus calificaciones, ver fotos de trabajos anteriores y solicitar un presupuesto sin compromiso. Te conectamos con el profesional ideal en menos de 2 horas.
    `.trim(),
    faqs: [
      {
        question: '¿Cuánto cobra un carpintero en Cuenca?',
        answer:
          'Los precios de carpintería en Cuenca dependen del proyecto. Un trabajo sencillo como reparar una puerta puede costar entre $20 y $50 USD. Un closet a medida va desde $200 hasta $800 USD dependiendo del tamaño y material. Una cocina integral puede costar entre $500 y $2,000 USD. Solicita un presupuesto sin compromiso en EcuaCasa.',
      },
      {
        question: '¿Cuánto tiempo tarda un carpintero en hacer muebles a medida?',
        answer:
          'El tiempo varía según la complejidad del proyecto. Un mueble sencillo como una repisa puede estar listo en 2-3 días. Un closet a medida generalmente toma entre 1 y 2 semanas. Una cocina integral puede tardar de 2 a 4 semanas. Tu carpintero te dará un cronograma exacto al presentar el presupuesto.',
      },
      {
        question: '¿Qué tipos de madera usan los carpinteros en Cuenca?',
        answer:
          'Los carpinteros en Cuenca trabajan con varias maderas disponibles en el mercado local. Las más populares son laurel (buena relación calidad-precio), seike y chanul (mayor durabilidad), MDF y melamínico (opción económica para closets y cocinas). Tu carpintero te recomendará el mejor material según tu presupuesto y necesidades.',
      },
      {
        question: '¿Cómo encontrar un buen carpintero a domicilio en Cuenca?',
        answer:
          'En EcuaCasa verificamos la identidad y experiencia de cada carpintero antes de que pueda ofrecer sus servicios. Puedes ver calificaciones de otros clientes, fotos de trabajos anteriores y solicitar presupuestos sin compromiso. Te conectamos con el carpintero ideal para tu proyecto en menos de 2 horas.',
      },
    ],
    relatedServices: [
      { slug: 'pintura', label: 'Pintores' },
      { slug: 'handyman', label: 'Handyman' },
    ],
  },

  pintura: {
    h1: 'Pintores en Cuenca — Pintura de Casas y Fachadas',
    metaTitle: 'Pintores en Cuenca Ecuador | Pintura de Casas y Fachadas Verificada',
    metaDescription:
      'Pintores verificados en Cuenca. Pintura interior, exterior, fachadas, impermeabilización. Servicio profesional a domicilio. Presupuesto sin compromiso.',
    content: `
¿Necesitas pintar tu casa o departamento en Cuenca? En EcuaCasa te conectamos con pintores profesionales verificados que ofrecen servicio a domicilio en toda la ciudad. Desde el Centro Histórico hasta El Vergel, Yanuncay, Misicata y Totoracocha, nuestros pintores conocen las particularidades del clima cuencano y los mejores productos para cada superficie.

El clima de Cuenca presenta desafíos específicos para la pintura. La humedad frecuente, las lluvias y los cambios de temperatura pueden afectar la durabilidad de la pintura si no se usan los productos adecuados. Nuestros pintores recomiendan pinturas con protección anti-humedad para interiores y pinturas elastomérica o impermeabilizante para fachadas exteriores.

Los servicios de pintura más solicitados incluyen: pintura interior de casas y departamentos, pintura exterior y de fachadas, impermeabilización de techos y paredes, pintura decorativa y acabados especiales, preparación de superficies (empastado, lijado, sellado) y pintura para casas patrimoniales del Centro Histórico con colores aprobados por el municipio.

Si tu propiedad está en el Centro Histórico de Cuenca, es importante trabajar con pintores que conozcan las regulaciones municipales sobre colores y acabados permitidos en fachadas patrimoniales. Nuestros profesionales tienen experiencia con estos requerimientos.

Todos los pintores en EcuaCasa están verificados y puedes ver sus calificaciones antes de contratarlos. Solicita el servicio, recibe un presupuesto sin compromiso y un profesional se pone en contacto contigo en menos de 2 horas.
    `.trim(),
    faqs: [
      {
        question: '¿Cuánto cuesta pintar una casa en Cuenca?',
        answer:
          'El costo de pintar una casa en Cuenca depende del tamaño y tipo de trabajo. Como referencia: pintar una habitación estándar cuesta entre $40 y $80 USD (solo mano de obra), un departamento completo entre $150 y $400 USD, y una casa completa (interior y exterior) entre $400 y $1,200 USD. El precio incluye mano de obra; la pintura generalmente se cotiza aparte.',
      },
      {
        question: '¿Cuál es la mejor época para pintar una casa en Cuenca?',
        answer:
          'La mejor época para pintar exteriores en Cuenca es durante la temporada seca, entre junio y noviembre, cuando las lluvias son menos frecuentes. Para interiores puedes pintar en cualquier época del año, aunque es recomendable mantener buena ventilación. Tu pintor te asesorará sobre el mejor momento según tu proyecto.',
      },
      {
        question: '¿Cuánto tiempo toma pintar un departamento en Cuenca?',
        answer:
          'Un departamento estándar de 2-3 habitaciones generalmente toma entre 2 y 4 días para pintura interior completa, incluyendo preparación de superficies. Si necesitas empastado o reparaciones previas, puede tomar 1-2 días adicionales. Para pintura exterior o de fachadas, el tiempo depende del acceso y las condiciones climáticas.',
      },
      {
        question: '¿Cómo encontrar pintores confiables en Cuenca?',
        answer:
          'En EcuaCasa todos los pintores pasan por un proceso de verificación de identidad y experiencia. Puedes ver las calificaciones y reseñas de otros clientes, comparar perfiles y solicitar presupuestos sin compromiso. Te conectamos con un pintor verificado en menos de 2 horas, sin intermediarios ni costos ocultos.',
      },
    ],
    relatedServices: [
      { slug: 'carpinteria', label: 'Carpinteros' },
      { slug: 'handyman', label: 'Handyman' },
    ],
  },
};

/** Get SEO content for a service, or null if none exists */
export function getServiceContent(slug: string): ServiceSEOContent | null {
  return SERVICE_CONTENT[slug] ?? null;
}
