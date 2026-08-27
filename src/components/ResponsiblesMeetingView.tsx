import React, { useState, useMemo } from 'react';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Search,
  Check,
  Edit3,
  Home,
  Building2,
} from 'lucide-react';
import { useLeanData } from '../context/LeanDataContext';
import {
  CATEGORIAS_RESTRICCION,
  RestriccionMakeReady,
} from '../types';

interface ResponsiblesMeetingViewProps {
  onSelectActividad: (id_actividad: string) => void;
  onOpenManageResponsables?: () => void;
}

export const ResponsiblesMeetingView: React.FC<ResponsiblesMeetingViewProps> = ({
  onSelectActividad,
  onOpenManageResponsables,
}) => {
  const {
    activeObra,
    responsables,
    restricciones,
    actividades,
    casas,
    setEstadoRestriccion,
    updateRestriccion,
  } = useLeanData();

  // Selected Responsible
  const [selectedResponsible, setSelectedResponsible] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Inline editing of commitment date and notes
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState<string>('');
  const [tempNotes, setTempNotes] = useState<string>('');

  // Enriched restrictions with activity and house info
  const enrichedRestrictions = useMemo(() => {
    return restricciones.map((res) => {
      const act = actividades.find((a) => a.id_actividad === res.id_actividad);
      const casa = act ? casas.find((c) => c.id_casa === act.id_casa) : null;
      return {
        ...res,
        actividad: act,
        casa: casa,
      };
    });
  }, [restricciones, actividades, casas]);

  // Filtered list
  const filteredRestrictions = useMemo(() => {
    return enrichedRestrictions.filter((item) => {
      if (selectedResponsible !== 'all' && item.responsable !== selectedResponsible) {
        return false;
      }
      if (
        selectedWeek !== 'all' &&
        item.actividad &&
        item.actividad.semana_programada !== Number(selectedWeek)
      ) {
        return false;
      }
      if (selectedStatus !== 'all' && item.estado_restriccion !== selectedStatus) {
        return false;
      }
      if (selectedCategory !== 'all' && item.categoria !== selectedCategory) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesDesc = item.descripcion_requisito.toLowerCase().includes(term);
        const matchesNotes = item.notas_observaciones.toLowerCase().includes(term);
        const matchesResp = item.responsable.toLowerCase().includes(term);
        const matchesAct = item.actividad?.nombre_actividad.toLowerCase().includes(term);
        const matchesCasa =
          item.casa &&
          (item.casa.numero_casa.toLowerCase().includes(term) ||
            item.casa.manzana_sector.toLowerCase().includes(term));
        if (!matchesDesc && !matchesNotes && !matchesResp && !matchesAct && !matchesCasa) {
          return false;
        }
      }
      return true;
    });
  }, [
    enrichedRestrictions,
    selectedResponsible,
    selectedWeek,
    selectedStatus,
    selectedCategory,
    searchTerm,
  ]);

  // Responsible Metrics
  const respMetrics = useMemo(() => {
    const subset =
      selectedResponsible === 'all'
        ? enrichedRestrictions
        : enrichedRestrictions.filter((r) => r.responsable === selectedResponsible);

    const total = subset.length;
    const liberadas = subset.filter((r) => r.estado_restriccion === 'Liberado').length;
    const enGestion = subset.filter((r) => r.estado_restriccion === 'En Gestión').length;
    const pendientes = subset.filter((r) => r.estado_restriccion === 'Pendiente').length;
    const porcentaje = total > 0 ? Math.round((liberadas / total) * 100) : 100;

    return { total, liberadas, enGestion, pendientes, porcentaje };
  }, [enrichedRestrictions, selectedResponsible]);

  const handleStartEdit = (res: RestriccionMakeReady) => {
    setEditingRowId(res.id_restriccion);
    setTempDate(res.fecha_limite_liberacion);
    setTempNotes(res.notas_observaciones);
  };

  const handleSaveEdit = (id_restriccion: string) => {
    updateRestriccion(id_restriccion, {
      fecha_limite_liberacion: tempDate,
      notas_observaciones: tempNotes,
    });
    setEditingRowId(null);
  };

  return (
    <div id="responsibles-meeting-view" className="space-y-4">
      {/* Banner: Lean Intermediate Meeting Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Comité de Seguimiento Make-Ready por Responsable
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700 uppercase">
                  Reunión de Programación
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Herramienta para coordinar compromisos del equipo técnico de{' '}
                <strong className="text-white">{activeObra.nombre_obra}</strong>. Modifica fechas y
                libera restricciones en un solo clic durante la sesión.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 text-xs">
            <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-300 font-semibold shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Obra: {activeObra.nombre_obra}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RESPONSIBLE SELECTOR BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Seleccionar Responsable de la Obra:</span>
          </div>

          {onOpenManageResponsables && (
            <button
              onClick={onOpenManageResponsables}
              className="text-xs text-blue-700 hover:underline font-bold"
            >
              + Gestionar Responsables
            </button>
          )}
        </div>

        {/* Responsible Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="filter-resp-all"
            onClick={() => setSelectedResponsible('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              selectedResponsible === 'all'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Todos los Responsables</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-white/20 text-white">
              {restricciones.length}
            </span>
          </button>

          {responsables.map((resp) => {
            const count = restricciones.filter((r) => r.responsable === resp.nombre).length;
            const pendingCount = restricciones.filter(
              (r) => r.responsable === resp.nombre && r.estado_restriccion !== 'Liberado'
            ).length;
            const isSelected = selectedResponsible === resp.nombre;

            return (
              <button
                key={resp.id_responsable}
                onClick={() => setSelectedResponsible(resp.nombre)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{resp.nombre}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : pendingCount > 0
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {pendingCount > 0 ? `${pendingCount} pend.` : `${count} OK`}
                </span>
              </button>
            );
          })}
        </div>

        {/* METRICS SUMMARY FOR SELECTED RESPONSIBLE */}
        <div className="pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
              Total Asignadas
            </span>
            <span className="text-lg font-black text-slate-900">{respMetrics.total}</span>
          </div>

          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
            <span className="text-[10px] text-emerald-800 block font-bold uppercase tracking-wider">
              Liberadas (100%)
            </span>
            <span className="text-lg font-black text-emerald-700">{respMetrics.liberadas}</span>
          </div>

          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 shadow-2xs">
            <span className="text-[10px] text-amber-800 block font-bold uppercase tracking-wider">
              En Gestión
            </span>
            <span className="text-lg font-black text-amber-700">{respMetrics.enGestion}</span>
          </div>

          <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 shadow-2xs">
            <span className="text-[10px] text-rose-800 block font-bold uppercase tracking-wider">
              Pendientes
            </span>
            <span className="text-lg font-black text-rose-700">{respMetrics.pendientes}</span>
          </div>

          <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 col-span-2 sm:col-span-1 shadow-2xs">
            <span className="text-[10px] text-blue-800 block font-bold uppercase tracking-wider">
              % Cumplimiento
            </span>
            <span className="text-lg font-black text-blue-700">{respMetrics.porcentaje}%</span>
          </div>
        </div>

        {/* Secondary Filters Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por insumo, requisito, etapa/manzana u observaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <Calendar className="w-3 h-3 text-slate-500" />
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="bg-transparent font-bold focus:outline-none cursor-pointer text-xs text-slate-900"
              >
                <option value="all">Todas las Semanas</option>
                <option value="1">Semana 1</option>
                <option value="2">Semana 2</option>
                <option value="3">Semana 3</option>
                <option value="4">Semana 4</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent font-bold focus:outline-none cursor-pointer text-xs text-slate-900"
              >
                <option value="all">Todos los Estados</option>
                <option value="Pendiente">Solo Pendientes</option>
                <option value="En Gestión">Solo En Gestión</option>
                <option value="Liberado">Solo Liberados</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-bold focus:outline-none cursor-pointer text-xs text-slate-900"
              >
                <option value="all">Todas las Categorías</option>
                {CATEGORIAS_RESTRICCION.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* RESTRICTIONS ACTIONS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[850px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                <th className="py-3 px-3.5 font-bold w-40 uppercase text-[10px] tracking-wider text-slate-600">
                  Etapa / Manzana & Actividad
                </th>
                <th className="py-3 px-3.5 font-bold w-36 uppercase text-[10px] tracking-wider text-slate-600">
                  Categoría & Responsable
                </th>
                <th className="py-3 px-4 font-bold uppercase text-[10px] tracking-wider text-slate-600">
                  Requisito / Restricción
                </th>
                <th className="py-3 px-3.5 font-bold w-32 uppercase text-[10px] tracking-wider text-slate-600">
                  Fecha Compromiso
                </th>
                <th className="py-3 px-3.5 font-bold w-48 text-center uppercase text-[10px] tracking-wider text-slate-600">
                  Estado Make-Ready
                </th>
                <th className="py-3 px-3.5 font-bold w-36 uppercase text-[10px] tracking-wider text-slate-600">
                  Observaciones Reunión
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredRestrictions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600 opacity-70" />
                    <p className="font-semibold text-sm text-slate-800">
                      No hay restricciones con los filtros seleccionados
                    </p>
                    <p className="text-xs mt-1 text-slate-500">
                      ¡Excelente avance o cambia los filtros de búsqueda!
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRestrictions.map((item) => {
                  const catMeta = CATEGORIAS_RESTRICCION.find(
                    (c) => c.value === item.categoria
                  ) || {
                    label: item.categoria,
                    color: 'text-slate-700',
                    bg: 'bg-slate-100',
                    border: 'border-slate-200',
                  };

                  const isLiberado = item.estado_restriccion === 'Liberado';
                  const isEnGestion = item.estado_restriccion === 'En Gestión';
                  const isPendiente = item.estado_restriccion === 'Pendiente';
                  const isEditingThis = editingRowId === item.id_restriccion;

                  return (
                    <tr
                      key={item.id_restriccion}
                      id={`meeting-row-${item.id_restriccion}`}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        isLiberado
                          ? 'opacity-85 bg-emerald-50/20'
                          : isPendiente
                          ? 'bg-rose-50/20'
                          : ''
                      }`}
                    >
                      {/* Casa & Actividad */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="space-y-1">
                          {item.casa && (
                            <div className="flex items-center gap-1 font-bold text-slate-900 text-xs">
                              <Home className="w-3 h-3 text-blue-600" />
                              <span>
                                {item.casa.manzana_sector} • {item.casa.numero_casa}
                              </span>
                            </div>
                          )}

                          {item.actividad && (
                            <button
                              onClick={() => onSelectActividad(item.actividad!.id_actividad)}
                              className="text-left font-semibold text-slate-800 hover:text-blue-700 transition-colors line-clamp-2"
                              title="Ver ficha completa de actividad"
                            >
                              {item.actividad.nombre_actividad}
                            </button>
                          )}

                          {item.actividad && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                              <span>Semana {item.actividad.semana_programada}</span>
                              <span>•</span>
                              <span
                                className={`font-bold ${
                                  item.actividad.estado_actividad === 'Lista para Ejecutar'
                                    ? 'text-emerald-700'
                                    : 'text-rose-700'
                                }`}
                              >
                                {item.actividad.estado_actividad === 'Lista para Ejecutar'
                                  ? '🟢 Lista'
                                  : '🔴 Bloqueada'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Categoría & Responsable */}
                      <td className="py-3 px-3.5 align-top space-y-1.5">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}
                        >
                          {catMeta.label}
                        </span>
                        <div className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{item.responsable}</span>
                        </div>
                      </td>

                      {/* Requisito / Descripción */}
                      <td className="py-3 px-4 align-top">
                        <p className="font-semibold text-slate-900 text-xs sm:text-[12.5px] leading-snug">
                          {item.descripcion_requisito}
                        </p>
                      </td>

                      {/* Fecha Compromiso */}
                      <td className="py-3 px-3.5 align-top">
                        {isEditingThis ? (
                          <input
                            type="date"
                            value={tempDate}
                            onChange={(e) => setTempDate(e.target.value)}
                            className="w-full text-xs p-1 rounded border border-slate-300 bg-white text-slate-900 font-medium"
                          />
                        ) : (
                          <div className="flex items-center gap-1 font-mono text-xs text-slate-700 font-semibold">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{item.fecha_limite_liberacion}</span>
                          </div>
                        )}
                      </td>

                      {/* Estado Make-Ready */}
                      <td className="py-3 px-3.5 align-top text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-2xs">
                          <button
                            id={`meeting-btn-pendiente-${item.id_restriccion}`}
                            onClick={() => setEstadoRestriccion(item.id_restriccion, 'Pendiente')}
                            className={`px-2.5 py-1 rounded font-bold text-[10px] transition-all ${
                              isPendiente
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-600'
                            }`}
                            title="Marcar como Pendiente"
                          >
                            Pendiente
                          </button>

                          <button
                            id={`meeting-btn-gestion-${item.id_restriccion}`}
                            onClick={() => setEstadoRestriccion(item.id_restriccion, 'En Gestión')}
                            className={`px-2.5 py-1 rounded font-bold text-[10px] transition-all ${
                              isEnGestion
                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                : 'text-slate-600 hover:text-amber-600'
                            }`}
                            title="Marcar como En Gestión"
                          >
                            En Gestión
                          </button>

                          <button
                            id={`meeting-btn-liberado-${item.id_restriccion}`}
                            onClick={() => setEstadoRestriccion(item.id_restriccion, 'Liberado')}
                            className={`px-2.5 py-1 rounded font-bold text-[10px] transition-all flex items-center gap-1 ${
                              isLiberado
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-600'
                            }`}
                            title="Marcar como Liberado (100% resuelto)"
                          >
                            <Check className="w-3 h-3" />
                            Liberado
                          </button>
                        </div>
                      </td>

                      {/* Observaciones */}
                      <td className="py-3 px-3.5 align-top">
                        {isEditingThis ? (
                          <div className="space-y-1">
                            <textarea
                              rows={2}
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              placeholder="Acuerdos o estado en la reunión..."
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white text-slate-900"
                            />
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => setEditingRowId(null)}
                                className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-700 font-medium"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleSaveEdit(item.id_restriccion)}
                                className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-xs"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEdit(item)}
                            className="cursor-pointer group flex items-start justify-between gap-1 p-1 rounded hover:bg-slate-100 transition-colors"
                            title="Hacer clic para editar notas o fecha compromiso"
                          >
                            <span className="text-[11px] text-slate-600 italic line-clamp-2">
                              {item.notas_observaciones || '+ Agregar acuerdo...'}
                            </span>
                            <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0 mt-0.5" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
