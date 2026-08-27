import React, { useState, useMemo } from 'react';
import {
  Calendar,
  AlertOctagon,
  CheckCircle2,
  Filter,
  Search,
  Home,
  ChevronRight,
  Plus,
  Zap,
  Info,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useLeanData } from '../context/LeanDataContext';
import { ActividadLookahead, Casa, EstadoActividad } from '../types';

interface LookaheadBoardProps {
  onSelectActividad: (id_actividad: string) => void;
  onOpenNewActividadForCasa?: (id_casa: string, semana: 1 | 2 | 3 | 4) => void;
  onOpenNewCasa: () => void;
}

export const LookaheadBoard: React.FC<LookaheadBoardProps> = ({
  onSelectActividad,
  onOpenNewActividadForCasa,
  onOpenNewCasa,
}) => {
  const {
    casas,
    actividades,
    restricciones,
    liberarTodasRestriccionesActividad,
  } = useLeanData();

  // Filters State
  const [selectedManzana, setSelectedManzana] = useState<string>('all');
  const [selectedEstadoCasa, setSelectedEstadoCasa] = useState<string>('all');
  const [selectedEstadoActividad, setSelectedEstadoActividad] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'matrix' | 'weekly_cards'>('matrix');

  // Extract unique manzanas
  const manzanas = useMemo(() => {
    const set = new Set(casas.map((c) => c.manzana_sector));
    return Array.from(set).sort();
  }, [casas]);

  // Filtered Casas
  const filteredCasas = useMemo(() => {
    return casas.filter((casa) => {
      if (selectedManzana !== 'all' && casa.manzana_sector !== selectedManzana) {
        return false;
      }
      if (selectedEstadoCasa !== 'all' && casa.estado_general !== selectedEstadoCasa) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesCasa =
          casa.numero_casa.toLowerCase().includes(term) ||
          casa.manzana_sector.toLowerCase().includes(term) ||
          casa.id_casa.toLowerCase().includes(term);

        // Or if any of its activities match
        const hasMatchingActivity = actividades.some(
          (a) => a.id_casa === casa.id_casa && a.nombre_actividad.toLowerCase().includes(term)
        );

        if (!matchesCasa && !hasMatchingActivity) return false;
      }
      return true;
    });
  }, [casas, selectedManzana, selectedEstadoCasa, searchTerm, actividades]);

  // Helper to get activities for a specific house and week
  const getActividadesForCasaAndWeek = (id_casa: string, semana: 1 | 2 | 3 | 4) => {
    return actividades.filter((act) => {
      if (act.id_casa !== id_casa || act.semana_programada !== semana) return false;
      if (selectedEstadoActividad !== 'all' && act.estado_actividad !== selectedEstadoActividad) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const casa = casas.find((c) => c.id_casa === id_casa);
        const matchesName = act.nombre_actividad.toLowerCase().includes(term);
        const matchesCasa =
          casa &&
          (casa.numero_casa.toLowerCase().includes(term) ||
            casa.manzana_sector.toLowerCase().includes(term));
        if (!matchesName && !matchesCasa) return false;
      }
      return true;
    });
  };

  // Week metadata
  const WEEKS: { num: 1 | 2 | 3 | 4; label: string; subtitle: string; dates: string }[] = [
    { num: 1, label: 'Semana 1', subtitle: 'Próxima a Ejecutar (Compromiso)', dates: '31 Ago - 06 Sep' },
    { num: 2, label: 'Semana 2', subtitle: 'Make-Ready Activo (Liberación)', dates: '07 Sep - 13 Sep' },
    { num: 3, label: 'Semana 3', subtitle: 'Medio Plazo (Gestión Temprana)', dates: '14 Sep - 20 Sep' },
    { num: 4, label: 'Semana 4', subtitle: 'Horizonte Lookahead', dates: '21 Sep - 27 Sep' },
  ];

  return (
    <div id="lookahead-board-container" className="space-y-4">
      {/* Top Banner / Explanation of Rule */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Programación Intermedia Lookahead (4 Semanas)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700 uppercase">
                  Last Planner System
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Regla Lean: La actividad pasa a <span className="text-emerald-400 font-bold">Lista para Ejecutar (Verde)</span> automáticamente solo cuando el <strong>100%</strong> de sus restricciones Make-Ready están liberadas. Si tiene pendientes, permanece <span className="text-rose-400 font-bold">Bloqueada (Rojo)</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 text-xs">
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 px-3 py-1.5 rounded-lg shadow-2xs font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span>Lista para Ejecutar</span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-700/80 text-rose-300 px-3 py-1.5 rounded-lg shadow-2xs font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)]" />
              <span>Bloqueada (Make-Ready)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-lookahead"
              type="text"
              placeholder="Buscar por casa, manzana o actividad (ej. Vaciado, Casa 01, Losa)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter Manzana */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-semibold text-[11px]">Sector:</span>
              <select
                id="select-filter-manzana"
                value={selectedManzana}
                onChange={(e) => setSelectedManzana(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Todos ({casas.length})</option>
                {manzanas.map((m) => (
                  <option key={m} value={m}>
                    {m} ({casas.filter((c) => c.manzana_sector === m).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Estado Actividad */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-semibold text-[11px]">Estado:</span>
              <select
                id="select-filter-estado-actividad"
                value={selectedEstadoActividad}
                onChange={(e) => setSelectedEstadoActividad(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Todas</option>
                <option value="Bloqueada">🔴 Bloqueadas</option>
                <option value="Lista para Ejecutar">🟢 Listas</option>
              </select>
            </div>

            {/* Filter Estado Casa */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="select-filter-estado-casa"
                value={selectedEstadoCasa}
                onChange={(e) => setSelectedEstadoCasa(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Todas las Casas</option>
                <option value="En proceso">En proceso</option>
                <option value="Pausado">Pausado</option>
                <option value="Entregado">Entregado</option>
              </select>
            </div>

            {/* View Mode Toggle (Matrix vs Weekly Columns) */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-100 shadow-2xs">
              <button
                id="btn-view-matrix"
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Matriz Casas
              </button>
              <button
                id="btn-view-weekly"
                onClick={() => setViewMode('weekly_cards')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  viewMode === 'weekly_cards'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Semana
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MATRIX VIEW (Rows = Casas, Columns = Semanas 1 to 4) */}
      {viewMode === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs min-w-[900px]">
              {/* Table Header */}
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold text-slate-800 w-52 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="uppercase text-[11px] tracking-wider text-slate-600">Unidad / Casa</span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        ({filteredCasas.length})
                      </span>
                    </div>
                  </th>
                  {WEEKS.map((w) => (
                    <th key={w.num} className="py-3 px-3.5 font-bold text-slate-800 border-l border-slate-200 w-1/4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-xs font-bold text-slate-900">{w.label}</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shadow-2xs">
                          {w.dates}
                        </span>
                      </div>
                      <div className="text-[10.5px] font-medium text-slate-500 mt-0.5">
                        {w.subtitle}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-200">
                {filteredCasas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <Home className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                      <p className="font-semibold text-sm">No se encontraron casas con los filtros seleccionados</p>
                      <p className="text-xs mt-1">Prueba cambiando el sector, estado o término de búsqueda</p>
                      <button
                        onClick={onOpenNewCasa}
                        className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Registrar Nueva Casa
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredCasas.map((casa) => {
                    const casaStatusBadge =
                      casa.estado_general === 'En proceso'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : casa.estado_general === 'Pausado'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                    return (
                      <tr
                        key={casa.id_casa}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Casa Column */}
                        <td className="py-3 px-4 font-medium sticky left-0 bg-white z-10 border-r border-slate-200 align-top">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-sm">
                                {casa.numero_casa}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${casaStatusBadge}`}
                              >
                                {casa.estado_general}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <span className="font-semibold text-slate-700">
                                {casa.manzana_sector}
                              </span>
                              <span>•</span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {casa.id_casa}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Weeks 1 to 4 Cells */}
                        {WEEKS.map((w) => {
                          const acts = getActividadesForCasaAndWeek(casa.id_casa, w.num);

                          return (
                            <td
                              key={w.num}
                              className="py-2.5 px-3 border-l border-slate-200 align-top bg-white"
                            >
                              <div className="space-y-2 min-h-[70px] flex flex-col justify-start">
                                {acts.length === 0 ? (
                                  <div className="h-full flex items-center justify-center p-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 text-slate-400 group">
                                    {onOpenNewActividadForCasa ? (
                                      <button
                                        onClick={() =>
                                          onOpenNewActividadForCasa(casa.id_casa, w.num)
                                        }
                                        className="text-[11px] text-slate-400 group-hover:text-blue-600 flex items-center gap-1 transition-colors font-medium"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Programar actividad</span>
                                      </button>
                                    ) : (
                                      <span className="text-[11px] italic">Sin actividad</span>
                                    )}
                                  </div>
                                ) : (
                                  acts.map((act) => (
                                    <ActivityLookaheadCard
                                      key={act.id_actividad}
                                      actividad={act}
                                      casa={casa}
                                      restricciones={restricciones.filter(
                                        (r) => r.id_actividad === act.id_actividad
                                      )}
                                      onSelect={() => onSelectActividad(act.id_actividad)}
                                      onLiberateAll={() =>
                                        liberarTodasRestriccionesActividad(act.id_actividad)
                                      }
                                    />
                                  ))
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WEEKLY COLUMNS / CARDS VIEW */}
      {viewMode === 'weekly_cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {WEEKS.map((w) => {
            const weekActs = actividades.filter((act) => {
              if (act.semana_programada !== w.num) return false;
              if (selectedEstadoActividad !== 'all' && act.estado_actividad !== selectedEstadoActividad) {
                return false;
              }
              const casa = casas.find((c) => c.id_casa === act.id_casa);
              if (!casa) return false;
              if (selectedManzana !== 'all' && casa.manzana_sector !== selectedManzana) return false;
              if (selectedEstadoCasa !== 'all' && casa.estado_general !== selectedEstadoCasa) return false;
              if (searchTerm.trim() !== '') {
                const term = searchTerm.toLowerCase();
                const matchesAct = act.nombre_actividad.toLowerCase().includes(term);
                const matchesCasa =
                  casa.numero_casa.toLowerCase().includes(term) ||
                  casa.manzana_sector.toLowerCase().includes(term);
                if (!matchesAct && !matchesCasa) return false;
              }
              return true;
            });

            const readyCount = weekActs.filter((a) => a.estado_actividad === 'Lista para Ejecutar').length;
            const blockedCount = weekActs.filter((a) => a.estado_actividad === 'Bloqueada').length;

            return (
              <div
                key={w.num}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col h-full"
              >
                {/* Column Header */}
                <div className="pb-3 border-b border-slate-200 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{w.label}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {w.dates}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">
                    {w.subtitle}
                  </div>

                  {/* Column Stats */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500 font-semibold">Total: {weekActs.length}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> {readyCount}
                      </span>
                      <span className="text-rose-700 font-bold flex items-center gap-0.5">
                        <AlertOctagon className="w-3 h-3" /> {blockedCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {weekActs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No hay actividades para esta semana con los filtros actuales
                    </div>
                  ) : (
                    weekActs.map((act) => {
                      const casa = casas.find((c) => c.id_casa === act.id_casa);
                      if (!casa) return null;
                      return (
                        <ActivityLookaheadCard
                          key={act.id_actividad}
                          actividad={act}
                          casa={casa}
                          restricciones={restricciones.filter(
                            (r) => r.id_actividad === act.id_actividad
                          )}
                          onSelect={() => onSelectActividad(act.id_actividad)}
                          onLiberateAll={() =>
                            liberarTodasRestriccionesActividad(act.id_actividad)
                          }
                          showCasaBadge
                        />
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Activity Card Component within Matrix / Weekly Board
interface ActivityLookaheadCardProps {
  actividad: ActividadLookahead;
  casa: Casa;
  restricciones: {
    id_restriccion: string;
    categoria: string;
    estado_restriccion: string;
    responsable: string;
  }[];
  onSelect: () => void;
  onLiberateAll: () => void;
  showCasaBadge?: boolean;
}

const ActivityLookaheadCard: React.FC<ActivityLookaheadCardProps> = ({
  actividad,
  casa,
  restricciones,
  onSelect,
  onLiberateAll,
  showCasaBadge = false,
}) => {
  const isReady = actividad.estado_actividad === 'Lista para Ejecutar';
  const totalRes = restricciones.length;
  const liberatedRes = restricciones.filter((r) => r.estado_restriccion === 'Liberado').length;
  const pendingRes = restricciones.filter((r) => r.estado_restriccion === 'Pendiente').length;
  const inProgressRes = restricciones.filter((r) => r.estado_restriccion === 'En Gestión').length;

  return (
    <div
      id={`card-actividad-${actividad.id_actividad}`}
      onClick={onSelect}
      className={`group relative text-left rounded-xl p-3 border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md ${
        isReady
          ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20'
          : 'bg-rose-50 text-rose-950 border-rose-300 hover:border-rose-500 hover:ring-2 hover:ring-rose-500/20'
      }`}
    >
      {/* Top Status & Date */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        {showCasaBadge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-white">
            {casa.manzana_sector} • {casa.numero_casa}
          </span>
        )}
        <div
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isReady
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}
        >
          {isReady ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>Lista para Ejecutar</span>
            </>
          ) : (
            <>
              <AlertOctagon className="w-3 h-3 text-rose-700" />
              <span>Bloqueada</span>
            </>
          )}
        </div>

        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-0.5 font-semibold">
          <Clock className="w-3 h-3" />
          {actividad.fecha_inicio_plan.slice(5)}
        </span>
      </div>

      {/* Activity Name */}
      <h3 className="font-bold text-xs leading-snug text-slate-900 group-hover:text-blue-700 transition-colors">
        {actividad.nombre_actividad}
      </h3>

      {/* Constraints Summary / Make-Ready Status */}
      <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10.5px]">
        <div className="flex items-center gap-1.5">
          {totalRes === 0 ? (
            <span className="text-slate-500 italic text-[10px]">Sin restricciones</span>
          ) : (
            <span className="font-medium text-slate-700">
              Restricciones: <strong className={isReady ? 'text-emerald-700 font-bold' : 'text-slate-900 font-bold'}>{liberatedRes}/{totalRes}</strong>
            </span>
          )}
        </div>

        {/* Quick Constraint Pills */}
        <div className="flex items-center gap-1">
          {pendingRes > 0 && (
            <span
              title={`${pendingRes} restricción(es) pendiente(s)`}
              className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-200 text-rose-900"
            >
              {pendingRes} P
            </span>
          )}
          {inProgressRes > 0 && (
            <span
              title={`${inProgressRes} restricción(es) en gestión`}
              className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900"
            >
              {inProgressRes} G
            </span>
          )}
          {liberatedRes > 0 && (
            <span
              title={`${liberatedRes} restricción(es) liberada(s)`}
              className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900"
            >
              {liberatedRes} L
            </span>
          )}
        </div>
      </div>

      {/* Hover Action Strip */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 opacity-90 group-hover:opacity-100">
        <span className="flex items-center gap-0.5 text-blue-700 font-bold group-hover:underline">
          <span>Ver Ficha Make-Ready</span>
          <ChevronRight className="w-3 h-3" />
        </span>

        {!isReady && totalRes > 0 && (
          <button
            id={`btn-liberar-rapido-${actividad.id_actividad}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLiberateAll();
            }}
            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors shadow-xs"
            title="Liberar todas las restricciones para desbloquear la actividad automáticamente"
          >
            <Zap className="w-2.5 h-2.5" />
            <span>Liberar 100%</span>
          </button>
        )}
      </div>
    </div>
  );
};
