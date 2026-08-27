import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Obra,
  Responsable,
  Casa,
  ActividadLookahead,
  RestriccionMakeReady,
  EstadoActividad,
  EstadoRestriccion,
  EstadoGeneralCasa,
} from '../types';
import {
  INITIAL_OBRAS,
  INITIAL_RESPONSABLES,
  INITIAL_CASAS,
  INITIAL_ACTIVIDADES,
  INITIAL_RESTRICCIONES,
} from '../data/initialData';
import { supabase, SUPABASE_URL } from '../lib/supabase';

export interface BlockedActivityReportItem {
  actividad: ActividadLookahead;
  casa: Casa;
  restriccionesBloqueantes: RestriccionMakeReady[];
  totalRestricciones: number;
  liberadas: number;
  porcentajeLiberacion: number;
}

export type SupabaseSyncStatus = 'connected' | 'syncing' | 'error' | 'initial_load';

interface LeanDataContextType {
  // Supabase Connection Status
  supabaseStatus: SupabaseSyncStatus;
  supabaseUrl: string;
  supabaseError: string | null;
  isLoading: boolean;
  refreshFromSupabase: () => Promise<void>;
  seedSupabaseIfEmpty: () => Promise<void>;

  // Multi-Obra State
  obras: Obra[];
  activeObraId: string;
  activeObra: Obra;
  setActiveObraId: (id: string) => void;
  addObra: (obra: Omit<Obra, 'id_obra' | 'fecha_creacion'>) => Promise<Obra>;
  updateObra: (id: string, data: Partial<Obra>) => Promise<void>;
  deleteObra: (id: string) => Promise<void>;

  // Responsables Management
  allResponsables: Responsable[];
  responsables: Responsable[];
  addResponsable: (resp: Omit<Responsable, 'id_responsable' | 'id_obra'>) => Promise<Responsable>;
  updateResponsable: (id: string, data: Partial<Responsable>) => Promise<void>;
  deleteResponsable: (id: string) => Promise<void>;

  // Etapas / Manzanas / Frentes (Casas)
  casas: (Casa & { id_obra: string })[];
  allCasas: (Casa & { id_obra: string })[];
  addCasa: (casa: Omit<Casa, 'id_casa'>) => Promise<void>;
  updateCasa: (id_casa: string, data: Partial<Casa>) => Promise<void>;
  deleteCasa: (id_casa: string) => Promise<void>;

  // Actividades Lookahead
  actividades: ActividadLookahead[];
  allActividades: (Omit<ActividadLookahead, 'estado_actividad'> & { id_obra: string })[];
  selectedActividadId: string | null;
  setSelectedActividadId: (id: string | null) => void;
  addActividad: (
    actividad: Omit<ActividadLookahead, 'id_actividad' | 'estado_actividad'>
  ) => Promise<void>;
  updateActividad: (
    id_actividad: string,
    data: Partial<Omit<ActividadLookahead, 'estado_actividad'>>
  ) => Promise<void>;
  deleteActividad: (id_actividad: string) => Promise<void>;

  // Restricciones Make-Ready
  restricciones: RestriccionMakeReady[];
  allRestricciones: RestriccionMakeReady[];
  addRestriccion: (restriccion: Omit<RestriccionMakeReady, 'id_restriccion'>) => Promise<void>;
  updateRestriccion: (id_restriccion: string, data: Partial<RestriccionMakeReady>) => Promise<void>;
  deleteRestriccion: (id_restriccion: string) => Promise<void>;
  setEstadoRestriccion: (id_restriccion: string, estado: EstadoRestriccion) => Promise<void>;
  liberarTodasRestriccionesActividad: (id_actividad: string) => Promise<void>;

  // Dedicated Blocked Report Data
  blockedActivitiesReport: BlockedActivityReportItem[];

  // Global Metrics (for active Obra)
  metrics: {
    totalCasas: number;
    casasEnProceso: number;
    casasEntregadas: number;
    totalActividades: number;
    actividadesBloqueadas: number;
    actividadesListas: number;
    porcentajeListas: number;
    totalRestricciones: number;
    restriccionesPendientes: number;
    restriccionesEnGestion: number;
    restriccionesLiberadas: number;
    porcentajeLiberadas: number;
    porcentajeMakeReady: number;
    ppcEstimado: number;
  };

  // Reset Data to Defaults in Supabase
  resetToInitialData: () => Promise<void>;
}

const LeanDataContext = createContext<LeanDataContextType | undefined>(undefined);

// Local fallback keys for offline persistence/caching
const STORAGE_KEYS = {
  ACTIVE_OBRA: 'lean_construction_active_obra_v2',
};

export const LeanDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseSyncStatus>('initial_load');
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // States
  const [obras, setObras] = useState<Obra[]>(INITIAL_OBRAS);
  const [activeObraId, setActiveObraIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_OBRA) || INITIAL_OBRAS[0].id_obra;
    } catch {
      return INITIAL_OBRAS[0].id_obra;
    }
  });

  const [selectedActividadId, setSelectedActividadId] = useState<string | null>(null);
  const [allResponsables, setAllResponsables] = useState<Responsable[]>(INITIAL_RESPONSABLES);
  const [allCasas, setAllCasas] = useState<(Casa & { id_obra: string })[]>(INITIAL_CASAS);
  const [allActividades, setAllActividades] = useState<
    (Omit<ActividadLookahead, 'estado_actividad'> & { id_obra: string })[]
  >(INITIAL_ACTIVIDADES);
  const [allRestricciones, setAllRestricciones] = useState<RestriccionMakeReady[]>(INITIAL_RESTRICCIONES);

  const setActiveObraId = (id: string) => {
    setActiveObraIdState(id);
    setSelectedActividadId(null);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_OBRA, id);
    } catch {
      // Ignored
    }
  };

  // Helper to map DB row of etapas_manzanas to Casa
  const mapDbToCasa = (row: any): Casa & { id_obra: string } => {
    return {
      id_casa: row.id_etapa || row.id_casa,
      id_obra: row.id_obra || 'OBRA-01',
      manzana_sector: row.manzana_sector || row.tipo || 'Etapa',
      numero_casa: row.numero_casa || row.codigo_nombre || 'Frente General',
      estado_general: (row.estado_general as EstadoGeneralCasa) || 'En proceso',
    };
  };

  // Seed Initial Data to Supabase (Used when tables exist but are empty)
  const seedSupabaseIfEmpty = useCallback(async () => {
    try {
      setSupabaseStatus('syncing');

      // 1. Seed Obras
      const { error: errObras } = await supabase.from('obras').upsert(
        INITIAL_OBRAS.map((o) => ({
          id_obra: o.id_obra,
          nombre_obra: o.nombre_obra,
          descripcion: o.descripcion,
          ubicacion: o.ubicacion,
          estado: o.estado,
          fecha_creacion: o.fecha_creacion,
        }))
      );
      if (errObras) console.warn('Seed obras warning:', errObras.message);

      // 2. Seed Responsables
      const { error: errResp } = await supabase.from('responsables').upsert(
        INITIAL_RESPONSABLES.map((r) => ({
          id_responsable: r.id_responsable,
          id_obra: r.id_obra,
          nombre: r.nombre,
          cargo_rol: r.cargo_rol,
          email_contacto: r.email_contacto,
          telefono: r.telefono,
          badge_bg: r.badge_bg,
          badge_text: r.badge_text,
        }))
      );
      if (errResp) console.warn('Seed responsables warning:', errResp.message);

      // 3. Seed Etapas
      const { error: errEtapas } = await supabase.from('etapas_manzanas').upsert(
        INITIAL_CASAS.map((c) => ({
          id_etapa: c.id_casa,
          id_obra: c.id_obra,
          tipo: c.manzana_sector.includes('Manzana')
            ? 'Manzana'
            : c.manzana_sector.includes('Etapa')
            ? 'Etapa'
            : 'Frente',
          codigo_nombre: `${c.manzana_sector} • ${c.numero_casa}`,
          manzana_sector: c.manzana_sector,
          numero_casa: c.numero_casa,
          estado_general: c.estado_general,
        }))
      );
      if (errEtapas) console.warn('Seed etapas warning:', errEtapas.message);

      // 4. Seed Actividades
      const { error: errActs } = await supabase.from('actividades_lookahead').upsert(
        INITIAL_ACTIVIDADES.map((a) => ({
          id_actividad: a.id_actividad,
          id_obra: a.id_obra,
          id_etapa: a.id_casa,
          nombre_actividad: a.nombre_actividad,
          semana_programada: a.semana_programada,
          fecha_inicio_plan: a.fecha_inicio_plan,
        }))
      );
      if (errActs) console.warn('Seed actividades warning:', errActs.message);

      // 5. Seed Restricciones
      const { error: errRes } = await supabase.from('restricciones_makeready').upsert(
        INITIAL_RESTRICCIONES.map((r) => ({
          id_restriccion: r.id_restriccion,
          id_actividad: r.id_actividad,
          categoria: r.categoria,
          descripcion_requisito: r.descripcion_requisito,
          responsable: r.responsable,
          fecha_limite_liberacion: r.fecha_limite_liberacion,
          estado_restriccion: r.estado_restriccion,
          notas_observaciones: r.notas_observaciones,
        }))
      );
      if (errRes) console.warn('Seed restricciones warning:', errRes.message);

      setSupabaseStatus('connected');
    } catch (err: any) {
      console.error('Error seeding Supabase:', err);
    }
  }, []);

  // Fetch all data directly from Supabase
  const refreshFromSupabase = useCallback(async () => {
    try {
      setSupabaseStatus('syncing');
      setSupabaseError(null);

      // Query all 5 core tables in parallel
      const [
        resObras,
        resResponsables,
        resEtapas,
        resActividades,
        resRestricciones,
      ] = await Promise.all([
        supabase.from('obras').select('*').order('id_obra', { ascending: true }),
        supabase.from('responsables').select('*').order('id_responsable', { ascending: true }),
        supabase.from('etapas_manzanas').select('*').order('id_etapa', { ascending: true }),
        supabase.from('actividades_lookahead').select('*').order('id_actividad', { ascending: true }),
        supabase.from('restricciones_makeready').select('*').order('id_restriccion', { ascending: true }),
      ]);

      // Check if any critical table query failed (e.g., table does not exist in Supabase yet)
      if (resObras.error || resResponsables.error || resEtapas.error || resActividades.error || resRestricciones.error) {
        const firstError =
          resObras.error?.message ||
          resResponsables.error?.message ||
          resEtapas.error?.message ||
          resActividades.error?.message ||
          resRestricciones.error?.message ||
          'Error al consultar Supabase';

        console.warn('Supabase query warning / Tables might need creation:', firstError);
        setSupabaseError(firstError);
        setSupabaseStatus('error');
        setIsLoading(false);
        return;
      }

      // If database is completely empty (0 obras), trigger auto-seed
      if (resObras.data && resObras.data.length === 0) {
        console.log('Supabase tables are empty. Seeding initial Lean data...');
        await seedSupabaseIfEmpty();
        // Re-fetch after seeding
        const [o2, r2, e2, a2, res2] = await Promise.all([
          supabase.from('obras').select('*'),
          supabase.from('responsables').select('*'),
          supabase.from('etapas_manzanas').select('*'),
          supabase.from('actividades_lookahead').select('*'),
          supabase.from('restricciones_makeready').select('*'),
        ]);
        if (o2.data && o2.data.length > 0) setObras(o2.data as Obra[]);
        if (r2.data) setAllResponsables(r2.data as Responsable[]);
        if (e2.data) setAllCasas(e2.data.map(mapDbToCasa));
        if (a2.data) {
          setAllActividades(
            a2.data.map((a: any) => ({
              id_actividad: a.id_actividad,
              id_obra: a.id_obra,
              id_casa: a.id_etapa || a.id_casa,
              nombre_actividad: a.nombre_actividad,
              semana_programada: Number(a.semana_programada) as 1 | 2 | 3 | 4,
              fecha_inicio_plan: a.fecha_inicio_plan,
            }))
          );
        }
        if (res2.data) setAllRestricciones(res2.data as RestriccionMakeReady[]);
        setSupabaseStatus('connected');
        setIsLoading(false);
        return;
      }

      // Apply fetched data
      if (resObras.data && resObras.data.length > 0) {
        setObras(resObras.data as Obra[]);
        setActiveObraIdState((prev) => {
          const exists = resObras.data?.some((o: any) => o.id_obra === prev);
          return exists ? prev : resObras.data![0].id_obra;
        });
      }

      if (resResponsables.data) {
        setAllResponsables(resResponsables.data as Responsable[]);
      }

      if (resEtapas.data) {
        setAllCasas(resEtapas.data.map(mapDbToCasa));
      }

      if (resActividades.data) {
        setAllActividades(
          resActividades.data.map((a: any) => ({
            id_actividad: a.id_actividad,
            id_obra: a.id_obra,
            id_casa: a.id_etapa || a.id_casa,
            nombre_actividad: a.nombre_actividad,
            semana_programada: Number(a.semana_programada) as 1 | 2 | 3 | 4,
            fecha_inicio_plan: a.fecha_inicio_plan,
          }))
        );
      }

      if (resRestricciones.data) {
        setAllRestricciones(resRestricciones.data as RestriccionMakeReady[]);
      }

      setSupabaseStatus('connected');
      setSupabaseError(null);
    } catch (err: any) {
      console.error('Fatal fetch error from Supabase:', err);
      setSupabaseError(err.message || 'Error de conexión con Supabase');
      setSupabaseStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [seedSupabaseIfEmpty]);

  // Initial load and Realtime Subscription
  useEffect(() => {
    refreshFromSupabase();

    // Subscribe to all changes on the 5 tables
    const channel = supabase
      .channel('lean-construction-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'obras' },
        () => refreshFromSupabase()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'responsables' },
        () => refreshFromSupabase()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'etapas_manzanas' },
        () => refreshFromSupabase()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'actividades_lookahead' },
        () => refreshFromSupabase()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restricciones_makeready' },
        () => refreshFromSupabase()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshFromSupabase]);

  // Current Active Obra
  const activeObra = useMemo(() => {
    return obras.find((o) => o.id_obra === activeObraId) || obras[0] || INITIAL_OBRAS[0];
  }, [obras, activeObraId]);

  // Filtered Responsables for Active Obra
  const responsables = useMemo(() => {
    return allResponsables.filter((r) => r.id_obra === activeObra.id_obra);
  }, [allResponsables, activeObra.id_obra]);

  // Filtered Casas / Etapas for Active Obra
  const casas = useMemo(() => {
    return allCasas.filter((c) => c.id_obra === activeObra.id_obra);
  }, [allCasas, activeObra.id_obra]);

  // Function to calculate automatic activity state (100% liberated = 'Lista para Ejecutar', otherwise 'Bloqueada')
  const calculateEstadoActividad = (
    id_actividad: string,
    currentRestricciones: RestriccionMakeReady[]
  ): EstadoActividad => {
    const actRestricciones = currentRestricciones.filter((r) => r.id_actividad === id_actividad);
    if (actRestricciones.length === 0) return 'Lista para Ejecutar';
    const allLiberated = actRestricciones.every((r) => r.estado_restriccion === 'Liberado');
    return allLiberated ? 'Lista para Ejecutar' : 'Bloqueada';
  };

  // Filtered Activities with computed status
  const actividades: ActividadLookahead[] = useMemo(() => {
    return allActividades
      .filter((a) => a.id_obra === activeObra.id_obra)
      .map((act) => ({
        ...act,
        estado_actividad: calculateEstadoActividad(act.id_actividad, allRestricciones),
      }));
  }, [allActividades, allRestricciones, activeObra.id_obra]);

  // Filtered Restrictions for the active Obra's activities
  const restricciones = useMemo(() => {
    const activeActIds = new Set(actividades.map((a) => a.id_actividad));
    return allRestricciones.filter((r) => activeActIds.has(r.id_actividad));
  }, [allRestricciones, actividades]);

  // Dedicated Blocked Activities Report List
  const blockedActivitiesReport: BlockedActivityReportItem[] = useMemo(() => {
    return actividades
      .filter((a) => a.estado_actividad === 'Bloqueada')
      .map((act) => {
        const casa = casas.find((c) => c.id_casa === act.id_casa) || {
          id_casa: act.id_casa,
          manzana_sector: 'Sector General',
          numero_casa: act.id_casa,
          estado_general: 'En proceso' as EstadoGeneralCasa,
        };
        const actRestricciones = allRestricciones.filter((r) => r.id_actividad === act.id_actividad);
        const restriccionesBloqueantes = actRestricciones.filter(
          (r) => r.estado_restriccion === 'Pendiente' || r.estado_restriccion === 'En Gestión'
        );
        const liberadas = actRestricciones.filter((r) => r.estado_restriccion === 'Liberado').length;
        const total = actRestricciones.length;
        const porcentaje = total > 0 ? Math.round((liberadas / total) * 100) : 0;

        return {
          actividad: act,
          casa,
          restriccionesBloqueantes,
          totalRestricciones: total,
          liberadas,
          porcentajeLiberacion: porcentaje,
        };
      });
  }, [actividades, casas, allRestricciones]);

  // Metrics for Active Obra
  const metrics = useMemo(() => {
    const totalCasas = casas.length;
    const casasEnProceso = casas.filter((c) => c.estado_general === 'En proceso').length;
    const casasEntregadas = casas.filter((c) => c.estado_general === 'Entregado').length;

    const totalActividades = actividades.length;
    const actividadesListas = actividades.filter((a) => a.estado_actividad === 'Lista para Ejecutar').length;
    const actividadesBloqueadas = totalActividades - actividadesListas;
    const porcentajeListas =
      totalActividades > 0 ? Math.round((actividadesListas / totalActividades) * 100) : 100;

    const totalRestricciones = restricciones.length;
    const restriccionesPendientes = restricciones.filter((r) => r.estado_restriccion === 'Pendiente').length;
    const restriccionesEnGestion = restricciones.filter((r) => r.estado_restriccion === 'En Gestión').length;
    const restriccionesLiberadas = restricciones.filter((r) => r.estado_restriccion === 'Liberado').length;
    const porcentajeLiberadas =
      totalRestricciones > 0 ? Math.round((restriccionesLiberadas / totalRestricciones) * 100) : 100;
    const porcentajeMakeReady = porcentajeLiberadas;

    const s1Acts = actividades.filter((a) => a.semana_programada === 1);
    const s1Listas = s1Acts.filter((a) => a.estado_actividad === 'Lista para Ejecutar').length;
    const ppcEstimado = s1Acts.length > 0 ? Math.round((s1Listas / s1Acts.length) * 100) : 100;

    return {
      totalCasas,
      casasEnProceso,
      casasEntregadas,
      totalActividades,
      actividadesBloqueadas,
      actividadesListas,
      porcentajeListas,
      totalRestricciones,
      restriccionesPendientes,
      restriccionesEnGestion,
      restriccionesLiberadas,
      porcentajeLiberadas,
      porcentajeMakeReady,
      ppcEstimado,
    };
  }, [casas, actividades, restricciones]);

  // ==============================================================================
  // CRUD ACTIONS (Optimistic local update + Direct Supabase persistence)
  // ==============================================================================

  // 1. Obra Handlers
  const addObra = async (data: Omit<Obra, 'id_obra' | 'fecha_creacion'>): Promise<Obra> => {
    const newId = `OBRA-${String(obras.length + 1).padStart(2, '0')}`;
    const newObra: Obra = {
      ...data,
      id_obra: newId,
      fecha_creacion: new Date().toISOString().slice(0, 10),
    };

    setObras((prev) => [...prev, newObra]);

    // Initial default responsables for new obra
    const defaultRespNames = [
      { name: 'Directora de Obra', role: 'Gestión General y Trámites', bg: 'bg-indigo-100', text: 'text-indigo-800' },
      { name: 'Residente de Obra', role: 'Frente Técnico y Calidad', bg: 'bg-blue-100', text: 'text-blue-800' },
      { name: 'Encargada de Compras', role: 'Abastecimiento y Suministros', bg: 'bg-emerald-100', text: 'text-emerald-800' },
      { name: 'SST', role: 'Seguridad y Salud en el Trabajo', bg: 'bg-orange-100', text: 'text-orange-800' },
    ];

    const newResps: Responsable[] = defaultRespNames.map((r, idx) => ({
      id_responsable: `RESP-${newId}-${idx + 1}`,
      id_obra: newId,
      nombre: r.name,
      cargo_rol: r.role,
      badge_bg: r.bg,
      badge_text: r.text,
    }));
    setAllResponsables((prev) => [...prev, ...newResps]);

    const defaultEtapa: Casa & { id_obra: string } = {
      id_casa: `ETP-${newId}-01`,
      id_obra: newId,
      manzana_sector: 'Etapa 1',
      numero_casa: 'Frente Principal',
      estado_general: 'En proceso',
    };
    setAllCasas((prev) => [...prev, defaultEtapa]);
    setActiveObraId(newId);

    // Save to Supabase
    try {
      await supabase.from('obras').insert([{
        id_obra: newObra.id_obra,
        nombre_obra: newObra.nombre_obra,
        descripcion: newObra.descripcion,
        ubicacion: newObra.ubicacion,
        estado: newObra.estado,
        fecha_creacion: newObra.fecha_creacion,
      }]);

      await supabase.from('responsables').insert(
        newResps.map((r) => ({
          id_responsable: r.id_responsable,
          id_obra: r.id_obra,
          nombre: r.nombre,
          cargo_rol: r.cargo_rol,
          badge_bg: r.badge_bg,
          badge_text: r.badge_text,
        }))
      );

      await supabase.from('etapas_manzanas').insert([{
        id_etapa: defaultEtapa.id_casa,
        id_obra: defaultEtapa.id_obra,
        tipo: 'Etapa',
        codigo_nombre: `${defaultEtapa.manzana_sector} • ${defaultEtapa.numero_casa}`,
        manzana_sector: defaultEtapa.manzana_sector,
        numero_casa: defaultEtapa.numero_casa,
        estado_general: defaultEtapa.estado_general,
      }]);
    } catch (err) {
      console.error('Error inserting obra in Supabase:', err);
    }

    return newObra;
  };

  const updateObra = async (id: string, data: Partial<Obra>) => {
    setObras((prev) => prev.map((o) => (o.id_obra === id ? { ...o, ...data } : o)));
    try {
      await supabase.from('obras').update(data).eq('id_obra', id);
    } catch (err) {
      console.error('Error updating obra in Supabase:', err);
    }
  };

  const deleteObra = async (id: string) => {
    if (obras.length <= 1) return;
    setObras((prev) => prev.filter((o) => o.id_obra !== id));
    if (activeObraId === id) {
      const remaining = obras.filter((o) => o.id_obra !== id);
      if (remaining[0]) setActiveObraId(remaining[0].id_obra);
    }
    try {
      await supabase.from('obras').delete().eq('id_obra', id);
    } catch (err) {
      console.error('Error deleting obra in Supabase:', err);
    }
  };

  // 2. Responsables Handlers
  const addResponsable = async (data: Omit<Responsable, 'id_responsable' | 'id_obra'>): Promise<Responsable> => {
    const newId = `RESP-${Date.now().toString(36).toUpperCase()}`;
    const newResp: Responsable = {
      ...data,
      id_responsable: newId,
      id_obra: activeObra.id_obra,
      badge_bg: data.badge_bg || 'bg-slate-100',
      badge_text: data.badge_text || 'text-slate-800',
    };
    setAllResponsables((prev) => [...prev, newResp]);

    try {
      await supabase.from('responsables').insert([{
        id_responsable: newResp.id_responsable,
        id_obra: newResp.id_obra,
        nombre: newResp.nombre,
        cargo_rol: newResp.cargo_rol,
        email_contacto: newResp.email_contacto,
        telefono: newResp.telefono,
        badge_bg: newResp.badge_bg,
        badge_text: newResp.badge_text,
      }]);
    } catch (err) {
      console.error('Error inserting responsable in Supabase:', err);
    }

    return newResp;
  };

  const updateResponsable = async (id: string, data: Partial<Responsable>) => {
    setAllResponsables((prev) => prev.map((r) => (r.id_responsable === id ? { ...r, ...data } : r)));
    try {
      await supabase.from('responsables').update(data).eq('id_responsable', id);
    } catch (err) {
      console.error('Error updating responsable in Supabase:', err);
    }
  };

  const deleteResponsable = async (id: string) => {
    setAllResponsables((prev) => prev.filter((r) => r.id_responsable !== id));
    try {
      await supabase.from('responsables').delete().eq('id_responsable', id);
    } catch (err) {
      console.error('Error deleting responsable in Supabase:', err);
    }
  };

  // 3. Casas / Etapas Handlers
  const addCasa = async (casaData: Omit<Casa, 'id_casa'>) => {
    const id = `ETP-${Date.now().toString(36).toUpperCase()}`;
    const newCasa: Casa & { id_obra: string } = {
      ...casaData,
      id_casa: id,
      id_obra: activeObra.id_obra,
    };
    setAllCasas((prev) => [...prev, newCasa]);

    try {
      await supabase.from('etapas_manzanas').insert([{
        id_etapa: id,
        id_obra: activeObra.id_obra,
        tipo: newCasa.manzana_sector.includes('Manzana')
          ? 'Manzana'
          : newCasa.manzana_sector.includes('Etapa')
          ? 'Etapa'
          : 'Frente',
        codigo_nombre: `${newCasa.manzana_sector} • ${newCasa.numero_casa}`,
        manzana_sector: newCasa.manzana_sector,
        numero_casa: newCasa.numero_casa,
        estado_general: newCasa.estado_general,
      }]);
    } catch (err) {
      console.error('Error inserting etapa in Supabase:', err);
    }
  };

  const updateCasa = async (id_casa: string, data: Partial<Casa>) => {
    setAllCasas((prev) => prev.map((c) => (c.id_casa === id_casa ? { ...c, ...data } : c)));
    try {
      const updatePayload: any = {};
      if (data.estado_general) updatePayload.estado_general = data.estado_general;
      if (data.manzana_sector) updatePayload.manzana_sector = data.manzana_sector;
      if (data.numero_casa) updatePayload.numero_casa = data.numero_casa;
      if (data.manzana_sector || data.numero_casa) {
        updatePayload.codigo_nombre = `${data.manzana_sector || ''} • ${data.numero_casa || ''}`;
      }
      await supabase.from('etapas_manzanas').update(updatePayload).eq('id_etapa', id_casa);
    } catch (err) {
      console.error('Error updating etapa in Supabase:', err);
    }
  };

  const deleteCasa = async (id_casa: string) => {
    setAllCasas((prev) => prev.filter((c) => c.id_casa !== id_casa));
    const actsToDelete = allActividades.filter((a) => a.id_casa === id_casa).map((a) => a.id_actividad);
    setAllActividades((prev) => prev.filter((a) => a.id_casa !== id_casa));
    setAllRestricciones((prev) => prev.filter((r) => !actsToDelete.includes(r.id_actividad)));

    try {
      await supabase.from('etapas_manzanas').delete().eq('id_etapa', id_casa);
    } catch (err) {
      console.error('Error deleting etapa in Supabase:', err);
    }
  };

  // 4. Actividades Handlers
  const addActividad = async (
    actData: Omit<ActividadLookahead, 'id_actividad' | 'estado_actividad'>
  ) => {
    const id = `ACT-${Date.now().toString(36).toUpperCase()}`;
    const newAct = {
      ...actData,
      id_actividad: id,
      id_obra: activeObra.id_obra,
    };
    setAllActividades((prev) => [...prev, newAct]);

    try {
      await supabase.from('actividades_lookahead').insert([{
        id_actividad: id,
        id_obra: activeObra.id_obra,
        id_etapa: newAct.id_casa,
        nombre_actividad: newAct.nombre_actividad,
        semana_programada: newAct.semana_programada,
        fecha_inicio_plan: newAct.fecha_inicio_plan,
        estado_actividad: 'Lista para Ejecutar',
      }]);
    } catch (err) {
      console.error('Error inserting actividad in Supabase:', err);
    }
  };

  const updateActividad = async (
    id_actividad: string,
    data: Partial<Omit<ActividadLookahead, 'estado_actividad'>>
  ) => {
    setAllActividades((prev) =>
      prev.map((act) => (act.id_actividad === id_actividad ? { ...act, ...data } : act))
    );

    try {
      const payload: any = {};
      if (data.nombre_actividad) payload.nombre_actividad = data.nombre_actividad;
      if (data.semana_programada) payload.semana_programada = data.semana_programada;
      if (data.fecha_inicio_plan) payload.fecha_inicio_plan = data.fecha_inicio_plan;
      if (data.id_casa) payload.id_etapa = data.id_casa;
      await supabase.from('actividades_lookahead').update(payload).eq('id_actividad', id_actividad);
    } catch (err) {
      console.error('Error updating actividad in Supabase:', err);
    }
  };

  const deleteActividad = async (id_actividad: string) => {
    setAllActividades((prev) => prev.filter((a) => a.id_actividad !== id_actividad));
    setAllRestricciones((prev) => prev.filter((r) => r.id_actividad !== id_actividad));
    try {
      await supabase.from('actividades_lookahead').delete().eq('id_actividad', id_actividad);
    } catch (err) {
      console.error('Error deleting actividad in Supabase:', err);
    }
  };

  // 5. Restricciones Handlers
  const addRestriccion = async (resData: Omit<RestriccionMakeReady, 'id_restriccion'>) => {
    const id = `RES-${Date.now().toString(36).toUpperCase()}`;
    const newRes: RestriccionMakeReady = {
      ...resData,
      id_restriccion: id,
    };
    setAllRestricciones((prev) => [...prev, newRes]);

    try {
      await supabase.from('restricciones_makeready').insert([{
        id_restriccion: id,
        id_actividad: newRes.id_actividad,
        categoria: newRes.categoria,
        descripcion_requisito: newRes.descripcion_requisito,
        responsable: newRes.responsable,
        fecha_limite_liberacion: newRes.fecha_limite_liberacion,
        estado_restriccion: newRes.estado_restriccion,
        notas_observaciones: newRes.notas_observaciones,
      }]);
    } catch (err) {
      console.error('Error inserting restriccion in Supabase:', err);
    }
  };

  const updateRestriccion = async (id_restriccion: string, data: Partial<RestriccionMakeReady>) => {
    setAllRestricciones((prev) =>
      prev.map((res) => (res.id_restriccion === id_restriccion ? { ...res, ...data } : res))
    );

    try {
      await supabase
        .from('restricciones_makeready')
        .update({
          ...data,
          fecha_actualizacion: new Date().toISOString(),
        })
        .eq('id_restriccion', id_restriccion);
    } catch (err) {
      console.error('Error updating restriccion in Supabase:', err);
    }
  };

  const deleteRestriccion = async (id_restriccion: string) => {
    setAllRestricciones((prev) => prev.filter((r) => r.id_restriccion !== id_restriccion));
    try {
      await supabase.from('restricciones_makeready').delete().eq('id_restriccion', id_restriccion);
    } catch (err) {
      console.error('Error deleting restriccion in Supabase:', err);
    }
  };

  const setEstadoRestriccion = async (id_restriccion: string, estado: EstadoRestriccion) => {
    setAllRestricciones((prev) =>
      prev.map((res) =>
        res.id_restriccion === id_restriccion ? { ...res, estado_restriccion: estado } : res
      )
    );

    try {
      await supabase
        .from('restricciones_makeready')
        .update({
          estado_restriccion: estado,
          fecha_actualizacion: new Date().toISOString(),
        })
        .eq('id_restriccion', id_restriccion);
    } catch (err) {
      console.error('Error updating estado_restriccion in Supabase:', err);
    }
  };

  const liberarTodasRestriccionesActividad = async (id_actividad: string) => {
    setAllRestricciones((prev) =>
      prev.map((res) =>
        res.id_actividad === id_actividad ? { ...res, estado_restriccion: 'Liberado' } : res
      )
    );

    try {
      await supabase
        .from('restricciones_makeready')
        .update({
          estado_restriccion: 'Liberado',
          fecha_actualizacion: new Date().toISOString(),
        })
        .eq('id_actividad', id_actividad);
    } catch (err) {
      console.error('Error liberating all restricciones in Supabase:', err);
    }
  };

  const resetToInitialData = async () => {
    setObras(INITIAL_OBRAS);
    setActiveObraIdState(INITIAL_OBRAS[0].id_obra);
    setAllResponsables(INITIAL_RESPONSABLES);
    setAllCasas(INITIAL_CASAS);
    setAllActividades(INITIAL_ACTIVIDADES);
    setAllRestricciones(INITIAL_RESTRICCIONES);
    await seedSupabaseIfEmpty();
  };

  return (
    <LeanDataContext.Provider
      value={{
        supabaseStatus,
        supabaseUrl: SUPABASE_URL,
        supabaseError,
        isLoading,
        refreshFromSupabase,
        seedSupabaseIfEmpty,

        obras,
        activeObraId,
        activeObra,
        setActiveObraId,
        addObra,
        updateObra,
        deleteObra,

        allResponsables,
        responsables,
        addResponsable,
        updateResponsable,
        deleteResponsable,

        casas,
        allCasas,
        addCasa,
        updateCasa,
        deleteCasa,

        actividades,
        allActividades,
        selectedActividadId,
        setSelectedActividadId,
        addActividad,
        updateActividad,
        deleteActividad,

        restricciones,
        allRestricciones,
        addRestriccion,
        updateRestriccion,
        deleteRestriccion,
        setEstadoRestriccion,
        liberarTodasRestriccionesActividad,

        blockedActivitiesReport,
        metrics,
        resetToInitialData,
      }}
    >
      {children}
    </LeanDataContext.Provider>
  );
};

export const useLeanData = (): LeanDataContextType => {
  const context = useContext(LeanDataContext);
  if (!context) {
    throw new Error('useLeanData must be used within a LeanDataProvider');
  }
  return context;
};
