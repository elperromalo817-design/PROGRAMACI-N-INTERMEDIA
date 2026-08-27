export type EstadoGeneralEtapa = 'En proceso' | 'Pausado' | 'Entregado';
export type EstadoGeneralCasa = EstadoGeneralEtapa;

export type TipoUnidad = 'Etapa' | 'Manzana' | 'Frente' | 'Sector';

export interface Obra {
  id_obra: string;
  nombre_obra: string;
  descripcion?: string;
  ubicacion?: string;
  estado: 'Activa' | 'Completada' | 'Pausada';
  fecha_creacion: string;
}

export interface Responsable {
  id_responsable: string;
  id_obra: string;
  nombre: string;
  cargo_rol: string;
  email_contacto?: string;
  telefono?: string;
  badge_bg?: string;
  badge_text?: string;
}

export interface EtapaManzana {
  id_etapa: string;
  id_obra: string;
  tipo: TipoUnidad;
  codigo_nombre: string; // Ej: "Etapa 1", "Manzana A", "Frente Urbanismo"
  descripcion?: string;
  estado_general: EstadoGeneralEtapa;
}

// Alias for compatibility
export interface Casa {
  id_casa: string;
  manzana_sector: string;
  numero_casa: string;
  estado_general: EstadoGeneralCasa;
}

export type EstadoActividad = 'Bloqueada' | 'Lista para Ejecutar';

export interface ActividadLookahead {
  id_actividad: string;
  id_obra?: string;
  id_casa: string; // Serves as id_etapa or id_casa
  nombre_actividad: string;
  semana_programada: 1 | 2 | 3 | 4;
  fecha_inicio_plan: string; // YYYY-MM-DD
  estado_actividad: EstadoActividad;
}

export type CategoriaRestriccion =
  | 'Compras/Insumos'
  | 'Contratos/Subcontratos'
  | 'Equipos/Formaleta'
  | 'Prerrequisito/Calidad'
  | 'Permisos/Trámites';

export type ResponsableRestriccion = string;

export type EstadoRestriccion = 'Pendiente' | 'En Gestión' | 'Liberado';

export interface RestriccionMakeReady {
  id_restriccion: string;
  id_actividad: string;
  categoria: CategoriaRestriccion;
  descripcion_requisito: string;
  responsable: ResponsableRestriccion;
  fecha_limite_liberacion: string; // YYYY-MM-DD
  estado_restriccion: EstadoRestriccion;
  notas_observaciones: string;
}

export const ACTIVIDADES_ESTANDAR: string[] = [
  'Movimiento de tierras e hiladeros',
  'Excavación y redes sanitarias subterráneas',
  'Excavación de vigas de cimentación',
  'Armado de acero, formaleta e instalaciones H&E embebidas',
  'Vaciado de cimentación',
  'Muros Piso 1 (armado, formaleta y vaciado)',
  'Losa de entrepiso (formaleta, acero y vaciado)',
  'Muros Piso 2 (armado, formaleta y vaciado)',
  'Alfajías, perfilería metálica y cubierta',
  'Revoques (pañetes) y morteros de piso',
  'Estructura liviana (drywall/superboard)',
  'Enchapes de pisos y muros',
  'Carpintería y ventanas (puertas, cocinas, ventanería)',
  'Aparatos sanitarios y accesorios eléctricos',
  'Aprobaciones y trámites de servicios (Luz, Agua, Gas)',
  'Urbanismo (Alcantarillado negras/lluvias, domiciliarias, acueducto, cámaras, accesos y vías en concreto)',
];

export const CATEGORIAS_RESTRICCION: {
  value: CategoriaRestriccion;
  label: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: 'Compras/Insumos',
    label: 'Compras / Insumos',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    value: 'Contratos/Subcontratos',
    label: 'Contratos / Subcontratos',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    value: 'Equipos/Formaleta',
    label: 'Equipos / Formaleta',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    value: 'Prerrequisito/Calidad',
    label: 'Prerrequisito / Calidad',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
  },
  {
    value: 'Permisos/Trámites',
    label: 'Permisos / Trámites',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
];

export const RESPONSABLES_PRINCIPALES: {
  name: string;
  role: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    name: 'Directora de Obra',
    role: 'Gestión General y Trámites',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
  },
  {
    name: 'Encargada de Compras',
    role: 'Abastecimiento y Suministros',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
  },
  {
    name: 'Residente de Obra',
    role: 'Frente Técnico y Calidad',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
  },
  {
    name: 'SST',
    role: 'Seguridad y Salud en el Trabajo',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
  },
];

export type ViewTab = 'lookahead' | 'blocked_report' | 'responsibles' | 'metrics';
