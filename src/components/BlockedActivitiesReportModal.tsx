import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  AlertOctagon,
  AlertTriangle,
  Clock,
  User,
  CheckCircle2,
  Calendar,
  Layers,
  Building2,
  Filter,
  Check,
  Zap,
} from 'lucide-react';
import { useLeanData } from '../context/LeanDataContext';
import { printReportDocument, downloadHtmlReport } from '../utils/printReport';
import { CATEGORIAS_RESTRICCION } from '../types';

interface BlockedActivitiesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlockedActivitiesReportModal: React.FC<BlockedActivitiesReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeObra,
    blockedActivitiesReport,
    responsables,
    setEstadoRestriccion,
    liberarTodasRestriccionesActividad,
  } = useLeanData();

  const [filterWeek, setFilterWeek] = useState<number | 'all'>('all');
  const [filterResponsable, setFilterResponsable] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter items based on user criteria
  const filteredReport = blockedActivitiesReport.filter((item) => {
    if (filterWeek !== 'all' && item.actividad.semana_programada !== filterWeek) return false;

    if (filterResponsable !== 'all') {
      const hasResp = item.restriccionesBloqueantes.some(
        (r) => r.responsable.toLowerCase() === filterResponsable.toLowerCase()
      );
      if (!hasResp) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.actividad.nombre_actividad.toLowerCase().includes(q);
      const matchCasa = `${item.casa.manzana_sector} ${item.casa.numero_casa}`.toLowerCase().includes(q);
      const matchRes = item.restriccionesBloqueantes.some((r) =>
        r.descripcion_requisito.toLowerCase().includes(q)
      );
      if (!matchName && !matchCasa && !matchRes) return false;
    }

    return true;
  });

  const totalBlocked = blockedActivitiesReport.length;
  const totalPendingConstraints = blockedActivitiesReport.reduce(
    (acc, curr) => acc + curr.restriccionesBloqueantes.length,
    0
  );

  // Generate printable HTML content for print / PDF download
  const generateReportHtml = () => {
    const todayStr = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const rowsHtml = filteredReport
      .map((item, idx) => {
        const restrictionsListHtml = item.restriccionesBloqueantes
          .map(
            (res) => `
          <tr style="background: ${res.estado_restriccion === 'Pendiente' ? '#fff1f2' : '#fefce8'}; border-bottom: 1px dashed #cbd5e1;">
            <td style="padding: 6px 10px; font-weight: 600; color: #0f172a;">
              <strong>[${res.categoria}]</strong> ${res.descripcion_requisito}
              ${res.notas_observaciones ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Obs: ${res.notas_observaciones}</div>` : ''}
            </td>
            <td style="padding: 6px 10px; font-weight: 700; color: #1e293b;">
              ${res.responsable}
            </td>
            <td style="padding: 6px 10px; font-family: monospace; font-weight: 700; color: #b91c1c;">
              ${res.fecha_limite_liberacion}
            </td>
            <td style="padding: 6px 10px; text-align: center;">
              <span class="status-badge ${res.estado_restriccion === 'Pendiente' ? 'status-pending' : 'status-gestion'}">
                ${res.estado_restriccion}
              </span>
            </td>
          </tr>`
          )
          .join('');

        return `
        <div style="margin-bottom: 20px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #ffffff;">
          <div style="background: #0f172a; color: #ffffff; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 800; font-size: 12px;">
              #${idx + 1}. [${item.casa.manzana_sector} - ${item.casa.numero_casa}] ${item.actividad.nombre_actividad}
            </span>
            <span style="background: #e11d48; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 900;">
              SEMANA ${item.actividad.semana_programada} • BLOQUEADA
            </span>
          </div>
          <div style="padding: 10px 12px; background: #f8fafc; font-size: 11px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 20px;">
            <div><strong>ID Actividad:</strong> ${item.actividad.id_actividad}</div>
            <div><strong>Fecha Inicio Plan:</strong> ${item.actividad.fecha_inicio_plan}</div>
            <div><strong>Restricciones Pendientes:</strong> ${item.restriccionesBloqueantes.length} de ${item.totalRestricciones}</div>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 6px 10px; text-align: left; width: 45%;">Restricción Make-Ready Pendiente</th>
                <th style="padding: 6px 10px; text-align: left; width: 25%;">Responsable</th>
                <th style="padding: 6px 10px; text-align: left; width: 15%;">Fecha Límite</th>
                <th style="padding: 6px 10px; text-align: center; width: 15%;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${restrictionsListHtml}
            </tbody>
          </table>
        </div>
      `;
      })
      .join('');

    return `
      <div class="report-header">
        <div>
          <span class="badge-category">LEAN CONSTRUCTION • MAKE-READY CONSTRAINT ANALYSIS</span>
          <h1>Reporte de Actividades Bloqueadas en Programación Intermedia</h1>
          <div class="project-name"><strong>Proyecto / Obra:</strong> ${activeObra.nombre_obra} (${activeObra.id_obra})</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;"><strong>Ubicación:</strong> ${activeObra.ubicacion || 'En sitio'} • <strong>Fecha Emisión:</strong> ${todayStr}</div>
        </div>
        <div style="text-align: right;">
          <div style="background: #ffe4e6; border: 1px solid #fda4af; color: #9f1239; padding: 6px 12px; border-radius: 6px; font-weight: 800; font-size: 12px;">
            ${filteredReport.length} ACTIVIDADES BLOQUEADAS
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-box">
          <span class="kpi-label">Actividades Bloqueadas</span>
          <span class="kpi-val" style="color: #be123c;">${filteredReport.length}</span>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">Restricciones Activas</span>
          <span class="kpi-val" style="color: #b45309;">${totalPendingConstraints}</span>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">Horizonte Lookahead</span>
          <span class="kpi-val">4 Semanas</span>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">Metodología</span>
          <span class="kpi-val" style="color: #1d4ed8; font-size: 14px; margin-top: 4px;">Last Planner / Lean</span>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 13px; text-transform: uppercase; color: #0f172a; border-left: 4px solid #e11d48; padding-left: 8px; margin-bottom: 12px;">
          Detalle de Actividades y Restricciones por Despejar (Make-Ready)
        </h3>
        ${
          filteredReport.length === 0
            ? '<p style="padding: 20px; text-align: center; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; color: #065f46; font-weight: bold;">Excelente: No hay actividades bloqueadas con los filtros seleccionados. Todas las actividades están 100% liberadas para ejecución.</p>'
            : rowsHtml
        }
      </div>

      <div class="signatures">
        <div>
          <div class="sig-line"></div>
          <div class="sig-name">Directora de Obra</div>
          <div class="sig-role">Gestión General y Trámites</div>
        </div>
        <div>
          <div class="sig-line"></div>
          <div class="sig-name">Residente de Obra</div>
          <div class="sig-role">Control Técnico de Frentes</div>
        </div>
        <div>
          <div class="sig-line"></div>
          <div class="sig-name">Encargada de Compras</div>
          <div class="sig-role">Abastecimiento e Insumos</div>
        </div>
        <div>
          <div class="sig-line"></div>
          <div class="sig-name">SST / Seguridad</div>
          <div class="sig-role">Prevención y Permisos</div>
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    printReportDocument(
      `Reporte_Actividades_Bloqueadas_${activeObra.id_obra}`,
      generateReportHtml()
    );
  };

  const handleDownload = () => {
    downloadHtmlReport(
      `Reporte_Actividades_Bloqueadas_${activeObra.id_obra}`,
      generateReportHtml()
    );
  };

  return (
    <div
      id="modal-blocked-report-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-blocked-report-container"
        className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white flex items-center gap-1">
                <AlertOctagon className="w-3 h-3" />
                Informe Make-Ready
              </span>
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                {activeObra.nombre_obra}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Reporte de Actividades Bloqueadas (Make-Ready)
            </h2>
            <p className="text-xs text-slate-300">
              Listado de actividades con restricciones en estado <strong>Pendiente</strong> o <strong>En Gestión</strong>, sus responsables y fechas límite de liberación.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="btn-print-blocked-report"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
              title="Imprimir o exportar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              id="btn-download-blocked-report"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors border border-slate-700 shadow-xs"
              title="Descargar documento HTML editable"
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTROLS & FILTERS BAR */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Week */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">Semana:</span>
              <select
                value={filterWeek}
                onChange={(e) =>
                  setFilterWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600/30"
              >
                <option value="all">Todas (S1 a S4)</option>
                <option value={1}>Semana 1 (Crítica / Inmediata)</option>
                <option value={2}>Semana 2</option>
                <option value={3}>Semana 3</option>
                <option value={4}>Semana 4</option>
              </select>
            </div>

            {/* Filter by Responsible */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">Responsable:</span>
              <select
                value={filterResponsable}
                onChange={(e) => setFilterResponsable(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600/30"
              >
                <option value="all">Todos los Responsables</option>
                {responsables.map((r) => (
                  <option key={r.id_responsable} value={r.nombre}>
                    {r.nombre} ({r.cargo_rol})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Buscar por actividad, etapa o restricción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium w-52 sm:w-64 focus:ring-2 focus:ring-blue-600/30"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 font-medium">Mostrando:</span>
            <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
              {filteredReport.length} de {totalBlocked} Bloqueadas
            </span>
          </div>
        </div>

        {/* REPORT CONTENT BODY */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {filteredReport.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                ¡No hay actividades bloqueadas con estos criterios!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Todas las restricciones asociadas han sido liberadas o no coinciden con los filtros aplicados.
              </p>
            </div>
          ) : (
            filteredReport.map((item, index) => {
              return (
                <div
                  key={item.actividad.id_actividad}
                  id={`report-item-${item.actividad.id_actividad}`}
                  className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden"
                >
                  {/* Activity Top Bar */}
                  <div className="bg-slate-900 text-white p-3 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {item.casa.manzana_sector} • {item.casa.numero_casa}
                      </span>
                      <span className="text-xs font-bold text-blue-400">
                        Semana {item.actividad.semana_programada}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white">
                        {item.actividad.nombre_actividad}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-300">
                        Inicio: {item.actividad.fecha_inicio_plan}
                      </span>
                      <button
                        onClick={() =>
                          liberarTodasRestriccionesActividad(item.actividad.id_actividad)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded shadow-2xs transition-colors"
                        title="Liberar todas las restricciones y desbloquear actividad"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Liberar Todo</span>
                      </button>
                    </div>
                  </div>

                  {/* Restricciones Table */}
                  <div className="p-3 sm:p-4 bg-slate-50/50">
                    <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        Restricciones Make-Ready que bloquean la ejecución ({item.restriccionesBloqueantes.length} pendientes):
                      </span>
                    </div>

                    <div className="space-y-2">
                      {item.restriccionesBloqueantes.map((res) => {
                        const catMeta = CATEGORIAS_RESTRICCION.find(
                          (c) => c.value === res.categoria
                        ) || {
                          label: res.categoria,
                          color: 'text-slate-700',
                          bg: 'bg-slate-100',
                          border: 'border-slate-200',
                        };

                        const isPendiente = res.estado_restriccion === 'Pendiente';

                        return (
                          <div
                            key={res.id_restriccion}
                            className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                              isPendiente
                                ? 'bg-rose-50/70 border-rose-200'
                                : 'bg-amber-50/70 border-amber-200'
                            }`}
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}
                                >
                                  {catMeta.label}
                                </span>

                                <span className="font-bold text-slate-900 flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-500" />
                                  {res.responsable}
                                </span>

                                <span className="font-mono text-rose-700 font-bold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-rose-500" />
                                  Límite: {res.fecha_limite_liberacion}
                                </span>
                              </div>

                              <p className="font-semibold text-slate-900 text-xs sm:text-[13px]">
                                {res.descripcion_requisito}
                              </p>

                              {res.notas_observaciones && (
                                <p className="text-[11px] text-slate-600 italic">
                                  Obs: {res.notas_observaciones}
                                </p>
                              )}
                            </div>

                            {/* Quick Action to Liberate */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  isPendiente
                                    ? 'bg-rose-200 text-rose-800'
                                    : 'bg-amber-200 text-amber-800'
                                }`}
                              >
                                {res.estado_restriccion}
                              </span>

                              <button
                                onClick={() =>
                                  setEstadoRestriccion(
                                    res.id_restriccion,
                                    isPendiente ? 'En Gestión' : 'Liberado'
                                  )
                                }
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-[11px] transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>{isPendiente ? 'Iniciar Gestión' : 'Marcar Liberado'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Resumen Make-Ready:</span>
            <span>
              Total {totalBlocked} actividades bloqueadas por {totalPendingConstraints} restricciones en curso.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors shadow-xs"
            >
              Cerrar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
