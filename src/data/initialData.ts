import {
  Obra,
  Responsable,
  Casa,
  ActividadLookahead,
  RestriccionMakeReady,
} from '../types';

export const INITIAL_OBRAS: Obra[] = [
  {
    id_obra: 'OBRA-01',
    nombre_obra: 'Conjunto Residencial Los Robles',
    descripcion: 'Proyecto de Viviendas en Serie • 120 Casas pareadas y aisladas',
    ubicacion: 'Sector Norte, La Calera',
    estado: 'Activa',
    fecha_creacion: '2026-06-15',
  },
  {
    id_obra: 'OBRA-02',
    nombre_obra: 'Torres del Parque (Edificaciones)',
    descripcion: 'Construcción en altura • 2 Torres de 18 Pisos + Sótanos y Club House',
    ubicacion: 'Avenida Principal #45-12',
    estado: 'Activa',
    fecha_creacion: '2026-07-01',
  },
];

export const INITIAL_RESPONSABLES: Responsable[] = [
  // Obra 1 Responsables
  {
    id_responsable: 'RESP-01',
    id_obra: 'OBRA-01',
    nombre: 'Directora de Obra',
    cargo_rol: 'Gestión General y Trámites',
    email_contacto: 'directora.losrobles@constructora.com',
    telefono: '+57 310 456 7890',
    badge_bg: 'bg-indigo-100',
    badge_text: 'text-indigo-800',
  },
  {
    id_responsable: 'RESP-02',
    id_obra: 'OBRA-01',
    nombre: 'Encargada de Compras',
    cargo_rol: 'Abastecimiento y Suministros',
    email_contacto: 'compras.losrobles@constructora.com',
    telefono: '+57 311 234 5678',
    badge_bg: 'bg-emerald-100',
    badge_text: 'text-emerald-800',
  },
  {
    id_responsable: 'RESP-03',
    id_obra: 'OBRA-01',
    nombre: 'Residente de Obra',
    cargo_rol: 'Frente Técnico y Calidad',
    email_contacto: 'residente.losrobles@constructora.com',
    telefono: '+57 315 789 0123',
    badge_bg: 'bg-blue-100',
    badge_text: 'text-blue-800',
  },
  {
    id_responsable: 'RESP-04',
    id_obra: 'OBRA-01',
    nombre: 'SST',
    cargo_rol: 'Seguridad y Salud en el Trabajo',
    email_contacto: 'sst.losrobles@constructora.com',
    telefono: '+57 318 901 2345',
    badge_bg: 'bg-orange-100',
    badge_text: 'text-orange-800',
  },

  // Obra 2 Responsables
  {
    id_responsable: 'RESP-05',
    id_obra: 'OBRA-02',
    nombre: 'Ing. Patricia Cruz',
    cargo_rol: 'Directora de Proyecto',
    email_contacto: 'pcruz@torresdelparque.com',
    telefono: '+57 300 111 2233',
    badge_bg: 'bg-indigo-100',
    badge_text: 'text-indigo-800',
  },
  {
    id_responsable: 'RESP-06',
    id_obra: 'OBRA-02',
    nombre: 'Ing. Andrés Gómez',
    cargo_rol: 'Residente de Estructura',
    email_contacto: 'agomez@torresdelparque.com',
    telefono: '+57 301 222 3344',
    badge_bg: 'bg-blue-100',
    badge_text: 'text-blue-800',
  },
  {
    id_responsable: 'RESP-07',
    id_obra: 'OBRA-02',
    nombre: 'Sofía Rivas',
    cargo_rol: 'Coordinadora de Compras',
    email_contacto: 'srivas@torresdelparque.com',
    telefono: '+57 302 333 4455',
    badge_bg: 'bg-emerald-100',
    badge_text: 'text-emerald-800',
  },
  {
    id_responsable: 'RESP-08',
    id_obra: 'OBRA-02',
    nombre: 'Jorge Herrera',
    cargo_rol: 'Inspector SST y Medio Ambiente',
    email_contacto: 'jherrera@torresdelparque.com',
    telefono: '+57 303 444 5566',
    badge_bg: 'bg-orange-100',
    badge_text: 'text-orange-800',
  },
];

export const INITIAL_CASAS: (Casa & { id_obra: string })[] = [
  // Obra 1 (Agrupado por Etapa / Manzana / Frente)
  {
    id_casa: 'ETP-MZA',
    id_obra: 'OBRA-01',
    manzana_sector: 'Etapa 1',
    numero_casa: 'Manzana A (Estructura y Muros)',
    estado_general: 'En proceso',
  },
  {
    id_casa: 'ETP-MZB',
    id_obra: 'OBRA-01',
    manzana_sector: 'Etapa 1',
    numero_casa: 'Manzana B (Cimentación y Redes)',
    estado_general: 'En proceso',
  },
  {
    id_casa: 'ETP-MZC',
    id_obra: 'OBRA-01',
    manzana_sector: 'Etapa 2',
    numero_casa: 'Manzana C (Acabados e Instalaciones)',
    estado_general: 'En proceso',
  },
  {
    id_casa: 'ETP-URB',
    id_obra: 'OBRA-01',
    manzana_sector: 'Urbanismo',
    numero_casa: 'Frente Vías y Redes Matriz',
    estado_general: 'En proceso',
  },

  // Obra 2 (Torres del Parque - Frentes)
  {
    id_casa: 'FRT-T1',
    id_obra: 'OBRA-02',
    manzana_sector: 'Torre 1',
    numero_casa: 'Frente Estructura Pisos 5-8',
    estado_general: 'En proceso',
  },
  {
    id_casa: 'FRT-T2',
    id_obra: 'OBRA-02',
    manzana_sector: 'Torre 2',
    numero_casa: 'Frente Cimentación Profunda y Muros Milán',
    estado_general: 'En proceso',
  },
  {
    id_casa: 'FRT-SOT',
    id_obra: 'OBRA-02',
    manzana_sector: 'Sótanos',
    numero_casa: 'Frente Redes Hidráulicas y Bombas',
    estado_general: 'En proceso',
  },
];

export const INITIAL_ACTIVIDADES: (Omit<ActividadLookahead, 'estado_actividad'> & { id_obra: string })[] = [
  // --- OBRA 1: LOS ROBLES ---
  // Manzana A (Estructura)
  {
    id_actividad: 'ACT-001',
    id_obra: 'OBRA-01',
    id_casa: 'ETP-MZA',
    nombre_actividad: 'Losa de entrepiso (formaleta, acero y vaciado)',
    semana_programada: 1,
    fecha_inicio_plan: '2026-08-31',
  },
  {
    id_actividad: 'ACT-002',
    id_obra: 'OBRA-01',
    id_casa: 'ETP-MZA',
    nombre_actividad: 'Muros Piso 2 (armado, formaleta y vaciado)',
    semana_programada: 2,
    fecha_inicio_plan: '2026-09-07',
  },
  {
    id_actividad: 'ACT-003',
    id_obra: 'OBRA-01',
    id_casa: 'ETP-MZA',
    nombre_actividad: 'Alfajías, perfilería metálica y cubierta',
    semana_programada: 3,
    fecha_inicio_plan: '2026-09-14',
  },
  {
    id_actividad: 'ACT-004',
    id_obra: 'OBRA-01',
    id_casa: 'ETP-MZA',
    nombre_actividad: 'Revoques (pañetes) y morteros de piso',
    semana_programada: 4,
    fecha_inicio_plan: '2026-09-21',
  },

  // Manzana B (Cimentación y Redes)
  {
    id_actividad: 'ACT-005',
    id_obra: 'OBRA-01',
    id_casa: 'ETP-MZB',
    nombre_actividad: 'Armado de acero, formaleta e instalaciones H&E embebidas',
    semana_programada: 1,
    fecha_inicio_plan: '2026-08-31',
  },
  {
    id_actividad: 'ACT-006',
    id_obra: 'OBRA-01',
    id_casa: 'ETP-MZB',
    nombre_actividad: 'Vaciado de cimentación',
    semana_programada: 2,
    fecha_inicio_plan: '2026-09-07',
  },
  {
    id_actividad: 'ACT-007',
    id_obra: 'OBRA-01',
    id_casa: 'ETP-MZB',
    nombre_actividad: 'Muros Piso 1 (armado, formaleta y vaciado)',
    semana_programada: 3,
    fecha_inicio_plan: '2026-09-14',
  },

  // Manzana C (Acabados e Instalaciones)
  {
    id_actividad: 'ACT-008',
    id_obra: 'OBRA-01',
    id_casa: 'ETP-MZC',
    nombre_actividad: 'Enchapes de pisos y muros',
    semana_programada: 1,
    fecha_inicio_plan: '2026-08-31',
  },
  {
    id_actividad: 'ACT-009',
    id_obra: 'OBRA-01',
    id_casa: 'ETP-MZC',
    nombre_actividad: 'Carpintería y ventanas (puertas, cocinas, ventanería)',
    semana_programada: 2,
    fecha_inicio_plan: '2026-09-07',
  },
  {
    id_actividad: 'ACT-010',
    id_obra: 'OBRA-01',
    id_casa: 'ETP-MZC',
    nombre_actividad: 'Aparatos sanitarios y accesorios eléctricos',
    semana_programada: 3,
    fecha_inicio_plan: '2026-09-14',
  },

  // Urbanismo
  {
    id_actividad: 'ACT-011',
    id_obra: 'OBRA-01',
    id_casa: 'ETP-URB',
    nombre_actividad: 'Aprobaciones y trámites de servicios (Luz, Agua, Gas)',
    semana_programada: 1,
    fecha_inicio_plan: '2026-08-31',
  },
  {
    id_actividad: 'ACT-012',
    id_obra: 'OBRA-01',
    id_casa: 'ETP-URB',
    nombre_actividad: 'Urbanismo (Alcantarillado negras/lluvias, domiciliarias, acueducto, cámaras, accesos y vías en concreto)',
    semana_programada: 2,
    fecha_inicio_plan: '2026-09-07',
  },

  // --- OBRA 2: TORRES DEL PARQUE ---
  {
    id_actividad: 'ACT-020',
    id_obra: 'OBRA-02',
    id_casa: 'FRT-T1',
    nombre_actividad: 'Losa de entrepiso Piso 6 (acero postensado y vaciado)',
    semana_programada: 1,
    fecha_inicio_plan: '2026-09-01',
  },
  {
    id_actividad: 'ACT-021',
    id_obra: 'OBRA-02',
    id_casa: 'FRT-T1',
    nombre_actividad: 'Muros y columnas Piso 7',
    semana_programada: 2,
    fecha_inicio_plan: '2026-09-08',
  },
  {
    id_actividad: 'ACT-022',
    id_obra: 'OBRA-02',
    id_casa: 'FRT-T2',
    nombre_actividad: 'Vaciado de pilotes y pantallas de contención',
    semana_programada: 1,
    fecha_inicio_plan: '2026-09-02',
  },
];

export const INITIAL_RESTRICCIONES: RestriccionMakeReady[] = [
  // --- OBRA 1: ACT-001 (Liberado 100% -> Lista para Ejecutar) ---
  {
    id_restriccion: 'RES-101',
    id_actividad: 'ACT-001',
    categoria: 'Compras/Insumos',
    descripcion_requisito: 'Hierro figurado para viguetas y malla electrosoldada en sitio',
    responsable: 'Encargada de Compras',
    fecha_limite_liberacion: '2026-08-28',
    estado_restriccion: 'Liberado',
    notas_observaciones: 'Entregado por Diaco el 27/08. Certificados de calidad archivados.',
  },
  {
    id_restriccion: 'RES-102',
    id_actividad: 'ACT-001',
    categoria: 'Equipos/Formaleta',
    descripcion_requisito: 'Juego de puntales metálicos y tableros fenólicos listos en frente',
    responsable: 'Residente de Obra',
    fecha_limite_liberacion: '2026-08-29',
    estado_restriccion: 'Liberado',
    notas_observaciones: 'Liberados tras desencofrado de casa vecina y limpieza de caras.',
  },
  {
    id_restriccion: 'RES-103',
    id_actividad: 'ACT-001',
    categoria: 'Prerrequisito/Calidad',
    descripcion_requisito: 'Visto bueno de tubería sanitaria/eléctrica embebida en losa',
    responsable: 'Residente de Obra',
    fecha_limite_liberacion: '2026-08-30',
    estado_restriccion: 'Liberado',
    notas_observaciones: 'Inspección técnica aprobada sin observaciones.',
  },

  // --- ACT-002: Muros Piso 2 (Bloqueada) ---
  {
    id_restriccion: 'RES-104',
    id_actividad: 'ACT-002',
    categoria: 'Equipos/Formaleta',
    descripcion_requisito: 'Rotación y disponibilidad de formaleta de aluminio para piso 2',
    responsable: 'Residente de Obra',
    fecha_limite_liberacion: '2026-09-04',
    estado_restriccion: 'En Gestión',
    notas_observaciones: 'Programada desmovilización desde Muro Piso 1 Manzana B.',
  },
  {
    id_restriccion: 'RES-105',
    id_actividad: 'ACT-002',
    categoria: 'Compras/Insumos',
    descripcion_requisito: 'Concreto premezclado 3000 PSI con aditivo acelerante',
    responsable: 'Encargada de Compras',
    fecha_limite_liberacion: '2026-09-05',
    estado_restriccion: 'Pendiente',
    notas_observaciones: 'Pendiente confirmar horario de mixer con Holcim/Argos.',
  },

  // --- ACT-005: Armado de acero Manzana B (Bloqueada) ---
  {
    id_restriccion: 'RES-106',
    id_actividad: 'ACT-005',
    categoria: 'Permisos/Trámites',
    descripcion_requisito: 'Permiso de trabajo en altura y revisión de líneas de vida perimetrales',
    responsable: 'SST',
    fecha_limite_liberacion: '2026-08-30',
    estado_restriccion: 'En Gestión',
    notas_observaciones: 'Charla técnica programada para la cuadrilla el lunes a primera hora.',
  },
  {
    id_restriccion: 'RES-107',
    id_actividad: 'ACT-005',
    categoria: 'Compras/Insumos',
    descripcion_requisito: 'Cajas de paso eléctricas PVC y conectores conduit embebidos',
    responsable: 'Encargada de Compras',
    fecha_limite_liberacion: '2026-08-29',
    estado_restriccion: 'Liberado',
    notas_observaciones: 'Stock completo en almacén principal.',
  },

  // --- ACT-006: Vaciado de cimentación (Bloqueada) ---
  {
    id_restriccion: 'RES-108',
    id_actividad: 'ACT-006',
    categoria: 'Contratos/Subcontratos',
    descripcion_requisito: 'Contrato firmado de bomba pluma estacionaria para vaciado masivo',
    responsable: 'Directora de Obra',
    fecha_limite_liberacion: '2026-09-04',
    estado_restriccion: 'Pendiente',
    notas_observaciones: 'Cotizaciones recibidas, en revisión de pólizas de seguro.',
  },

  // --- ACT-008: Enchapes (Bloqueada) ---
  {
    id_restriccion: 'RES-111',
    id_actividad: 'ACT-008',
    categoria: 'Compras/Insumos',
    descripcion_requisito: 'Cerámica 60x60 tipo madera y pegante impermeable en almacén',
    responsable: 'Encargada de Compras',
    fecha_limite_liberacion: '2026-08-29',
    estado_restriccion: 'Pendiente',
    notas_observaciones: 'Retraso de proveedor Corona. Promesa de despacho para el viernes.',
  },

  // --- ACT-011: Aprobaciones de servicios (Bloqueada) ---
  {
    id_restriccion: 'RES-116',
    id_actividad: 'ACT-011',
    categoria: 'Permisos/Trámites',
    descripcion_requisito: 'Inspección RETIE para certificación de instalaciones eléctricas',
    responsable: 'Directora de Obra',
    fecha_limite_liberacion: '2026-09-02',
    estado_restriccion: 'En Gestión',
    notas_observaciones: 'Visita del organismo certificador agendada para el miércoles.',
  },
  {
    id_restriccion: 'RES-117',
    id_actividad: 'ACT-011',
    categoria: 'Permisos/Trámites',
    descripcion_requisito: 'Prueba hidrostática de gas natural con empresa de servicios públicos',
    responsable: 'Directora de Obra',
    fecha_limite_liberacion: '2026-09-03',
    estado_restriccion: 'Pendiente',
    notas_observaciones: 'Falta radicación de planos as-built.',
  },

  // --- OBRA 2 RESTRICCIONES ---
  {
    id_restriccion: 'RES-201',
    id_actividad: 'ACT-020',
    categoria: 'Compras/Insumos',
    descripcion_requisito: 'Cables de postensado y anclajes certificados en torre',
    responsable: 'Sofía Rivas',
    fecha_limite_liberacion: '2026-08-31',
    estado_restriccion: 'Liberado',
    notas_observaciones: 'Entregado en patio con prueba de tensión.',
  },
  {
    id_restriccion: 'RES-202',
    id_actividad: 'ACT-020',
    categoria: 'Equipos/Formaleta',
    descripcion_requisito: 'Disponibilidad de grúa torre para izaje de canastillas',
    responsable: 'Ing. Andrés Gómez',
    fecha_limite_liberacion: '2026-08-31',
    estado_restriccion: 'Liberado',
    notas_observaciones: 'Mantenimiento preventivo completado.',
  },
  {
    id_restriccion: 'RES-203',
    id_actividad: 'ACT-022',
    categoria: 'Permisos/Trámites',
    descripcion_requisito: 'Plan de manejo de tráfico para camiones mixer en avenida principal',
    responsable: 'Jorge Herrera',
    fecha_limite_liberacion: '2026-09-01',
    estado_restriccion: 'En Gestión',
    notas_observaciones: 'En revisión por secretaría de movilidad.',
  },
];
