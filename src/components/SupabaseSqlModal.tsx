import React, { useState } from 'react';
import { X, Copy, Check, Download, Database, Server, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLeanData } from '../context/LeanDataContext';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const { supabaseStatus, supabaseUrl, supabaseError, refreshFromSupabase, seedSupabaseIfEmpty } = useLeanData();

  if (!isOpen) return null;

  const sqlScript = `-- ==============================================================================
-- SCRIPT SQL PARA SUPABASE (POSTGRESQL) - LEAN CONSTRUCTION LOOKAHEAD & MAKE-READY
-- Estructura de Datos para Programación Intermedia (4 Semanas) por Obras y Etapas/Manzanas
-- ==============================================================================

-- 1. TABLA: OBRAS / PROYECTOS
CREATE TABLE IF NOT EXISTS public.obras (
    id_obra VARCHAR(50) PRIMARY KEY,
    nombre_obra VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Completada', 'Pausada')),
    fecha_creacion DATE DEFAULT CURRENT_DATE
);

COMMENT ON TABLE public.obras IS 'Proyectos u obras de construcción independientes con sus propios equipos.';

-- 2. TABLA: RESPONSABLES POR OBRA
CREATE TABLE IF NOT EXISTS public.responsables (
    id_responsable VARCHAR(50) PRIMARY KEY,
    id_obra VARCHAR(50) NOT NULL REFERENCES public.obras(id_obra) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    cargo_rol VARCHAR(150) NOT NULL,
    email_contacto VARCHAR(150),
    telefono VARCHAR(50),
    badge_bg VARCHAR(50) DEFAULT 'bg-slate-100',
    badge_text VARCHAR(50) DEFAULT 'text-slate-800'
);

COMMENT ON TABLE public.responsables IS 'Integrantes del equipo de obra asignables como responsables de restricciones Make-Ready.';

-- 3. TABLA: ETAPAS / MANZANAS / FRENTES DE TRABAJO (Unidades de Programación Intermedia)
CREATE TABLE IF NOT EXISTS public.etapas_manzanas (
    id_etapa VARCHAR(50) PRIMARY KEY,
    id_obra VARCHAR(50) NOT NULL REFERENCES public.obras(id_obra) ON DELETE CASCADE,
    tipo VARCHAR(50) DEFAULT 'Etapa' CHECK (tipo IN ('Etapa', 'Manzana', 'Frente', 'Sector')),
    codigo_nombre VARCHAR(150) NOT NULL,
    manzana_sector VARCHAR(150),
    numero_casa VARCHAR(150),
    descripcion TEXT,
    estado_general VARCHAR(50) DEFAULT 'En proceso' CHECK (estado_general IN ('En proceso', 'Pausado', 'Entregado'))
);

COMMENT ON TABLE public.etapas_manzanas IS 'Frentes o etapas de trabajo para programación intermedia ágil.';

-- 4. TABLA: ACTIVIDADES LOOKAHEAD (Programación Intermedia 4 Semanas)
CREATE TABLE IF NOT EXISTS public.actividades_lookahead (
    id_actividad VARCHAR(50) PRIMARY KEY,
    id_obra VARCHAR(50) NOT NULL REFERENCES public.obras(id_obra) ON DELETE CASCADE,
    id_etapa VARCHAR(50) NOT NULL REFERENCES public.etapas_manzanas(id_etapa) ON DELETE CASCADE,
    nombre_actividad VARCHAR(255) NOT NULL,
    semana_programada INT NOT NULL CHECK (semana_programada BETWEEN 1 AND 4),
    fecha_inicio_plan DATE NOT NULL,
    estado_actividad VARCHAR(50) DEFAULT 'Bloqueada' CHECK (estado_actividad IN ('Bloqueada', 'Lista para Ejecutar'))
);

COMMENT ON TABLE public.actividades_lookahead IS 'Actividades planificadas en el horizonte de 4 semanas.';

-- 5. TABLA: RESTRICCIONES MAKE-READY
CREATE TABLE IF NOT EXISTS public.restricciones_makeready (
    id_restriccion VARCHAR(50) PRIMARY KEY,
    id_actividad VARCHAR(50) NOT NULL REFERENCES public.actividades_lookahead(id_actividad) ON DELETE CASCADE,
    categoria VARCHAR(100) NOT NULL CHECK (categoria IN (
        'Compras/Insumos',
        'Contratos/Subcontratos',
        'Equipos/Formaleta',
        'Prerrequisito/Calidad',
        'Permisos/Trámites'
    )),
    descripcion_requisito TEXT NOT NULL,
    responsable VARCHAR(150) NOT NULL,
    fecha_limite_liberacion DATE NOT NULL,
    estado_restriccion VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado_restriccion IN ('Pendiente', 'En Gestión', 'Liberado')),
    notas_observaciones TEXT,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.restricciones_makeready IS 'Prerrequisitos e insumos que deben liberarse antes de ejecutar la actividad.';

-- ==============================================================================
-- 6. TRIGGER AUTOMÁTICO EN SUPABASE PARA CALCULAR 'Estado_Actividad'
-- Regla Lean: 'Lista para Ejecutar' si y solo si el 100% de restricciones están 'Liberado'
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.fn_actualizar_estado_actividad()
RETURNS TRIGGER AS $$
DECLARE
    v_id_actividad VARCHAR(50);
    v_total_restricciones INT;
    v_restricciones_liberadas INT;
    v_nuevo_estado VARCHAR(50);
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_id_actividad := OLD.id_actividad;
    ELSE
        v_id_actividad := NEW.id_actividad;
    END IF;

    -- Contar restricciones asociadas
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE estado_restriccion = 'Liberado')
    INTO 
        v_total_restricciones,
        v_restricciones_liberadas
    FROM public.restricciones_makeready
    WHERE id_actividad = v_id_actividad;

    -- Si no tiene restricciones o todas están liberadas -> 'Lista para Ejecutar'
    IF (v_total_restricciones = 0 OR v_total_restricciones = v_restricciones_liberadas) THEN
        v_nuevo_estado := 'Lista para Ejecutar';
    ELSE
        v_nuevo_estado := 'Bloqueada';
    END IF;

    UPDATE public.actividades_lookahead
    SET estado_actividad = v_nuevo_estado
    WHERE id_actividad = v_id_actividad;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear el Trigger sobre restricciones_makeready
DROP TRIGGER IF EXISTS trg_actualizar_estado_actividad ON public.restricciones_makeready;
CREATE TRIGGER trg_actualizar_estado_actividad
AFTER INSERT OR UPDATE OR DELETE ON public.restricciones_makeready
FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_estado_actividad();

-- ==============================================================================
-- 7. ÍNDICES DE ALTO RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_actividades_obra_etapa ON public.actividades_lookahead(id_obra, id_etapa);
CREATE INDEX IF NOT EXISTS idx_actividades_semana ON public.actividades_lookahead(semana_programada);
CREATE INDEX IF NOT EXISTS idx_restricciones_actividad ON public.restricciones_makeready(id_actividad);
CREATE INDEX IF NOT EXISTS idx_restricciones_responsable ON public.restricciones_makeready(responsable);
CREATE INDEX IF NOT EXISTS idx_restricciones_estado ON public.restricciones_makeready(estado_restriccion);

-- ==============================================================================
-- 8. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS) EN SUPABASE
-- ==============================================================================
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responsables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapas_manzanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades_lookahead ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restricciones_makeready ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso lectura completo obras" ON public.obras FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion obras" ON public.obras FOR ALL USING (true);

CREATE POLICY "Permitir lectura responsables" ON public.responsables FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion responsables" ON public.responsables FOR ALL USING (true);

CREATE POLICY "Permitir lectura etapas" ON public.etapas_manzanas FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion etapas" ON public.etapas_manzanas FOR ALL USING (true);

CREATE POLICY "Permitir lectura actividades" ON public.actividades_lookahead FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion actividades" ON public.actividades_lookahead FOR ALL USING (true);

CREATE POLICY "Permitir lectura restricciones" ON public.restricciones_makeready FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion restricciones" ON public.restricciones_makeready FOR ALL USING (true);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlScript], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'supabase_lean_construction_schema.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedSupabaseIfEmpty();
      await refreshFromSupabase();
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div
      id="modal-supabase-sql-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-supabase-sql-container"
        className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1">
                <Database className="w-3 h-3" />
                Supabase PostgreSQL
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {supabaseUrl.replace('https://', '')}
              </span>
              {supabaseStatus === 'connected' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conectado y Sincronizado
                </span>
              ) : supabaseStatus === 'syncing' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-700 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Sincronizando...
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Pendiente Ejecución SQL
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Estructura SQL & Base de Datos Supabase
            </h2>
            <p className="text-xs text-slate-300">
              Todas las operaciones de obras, etapas, actividades, responsables y restricciones se guardan en tu base de datos Supabase en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar SQL'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors border border-slate-700 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .sql</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INFO NOTICE & ACTIONS */}
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2">
            <Server className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong>Paso único para tu proyecto en Supabase:</strong> Abre tu panel de Supabase &gt; <strong>SQL Editor</strong> &gt; Pega este script y haz clic en <strong>Run</strong>. Las 5 tablas, triggers y políticas de seguridad quedarán configuradas de inmediato.
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Sincronizando...' : 'Cargar Datos a Supabase'}</span>
            </button>
          </div>
        </div>

        {supabaseError && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Aviso de inicialización:</strong> Las tablas aún no están creadas en tu Supabase. Ejecuta el script SQL en el SQL Editor de tu proyecto Supabase ({supabaseUrl}) para completar la estructura.
            </span>
          </div>
        )}

        {/* CODE VIEWER */}
        <div className="p-4 bg-slate-950 flex-1 overflow-y-auto">
          <pre className="text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto p-2">
            <code>{sqlScript}</code>
          </pre>
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span>URL: {supabaseUrl} • Protocolo Supabase JS v2</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
