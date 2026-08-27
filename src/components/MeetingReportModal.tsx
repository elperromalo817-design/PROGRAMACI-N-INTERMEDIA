import React from 'react';
import { X, Printer, Download, FileText, AlertTriangle, Building2 } from 'lucide-react';
import { useLeanData } from '../context/LeanDataContext';
import { printReportDocument, downloadHtmlReport } from '../utils/printReport';

interface MeetingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeetingReportModal: React.FC<MeetingReportModalProps> = ({ isOpen, onClose }) => {
  const { activeObra, metrics, actividades, restricciones, casas, responsables } = useLeanData();

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const pendingRestrictions = restricciones.filter((r) => r.estado_restriccion !== 'Liberado');

  const generateReportHtml = () => {
    const pendingRowsHtml = pendingRestrictions
      .map((r) => {
        const act = actividades.find((a) => a.id_actividad === r.id_actividad);
        const casa = act ? casas.find((c) => c.id_casa === act.id_casa) : null;
        const casaLabel = casa ? `${casa.manzana_sector} - ${casa.numero_casa}` : '';

        return `
        <tr>
          <td>
            <strong>${casaLabel}</strong>
            <div style="font-size: 10px; color: #64748b;">${act?.nombre_actividad || ''}</div>
          </td>
          <td>
            <strong>[${r.categoria}]</strong> ${r.descripcion_requisito}
            ${r.notas_observaciones ? `<div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">Obs: ${r.notas_observaciones}</div>` : ''}
          </td>
          <td style="font-weight: 700;">${r.responsable}</td>
          <td style="font-family: monospace; font-weight: 700; color: #b91c1c;">${r.fecha_limite_liberacion}</td>
          <td style="text-align: center;">
            <span class="status-badge ${r.estado_restriccion === 'Pendiente' ? 'status-pending' : 'status-gestion'}">
              ${r.estado_restriccion}
            </span>
          </td>
        </tr>
      `;
      })
      .join('');

    const signaturesHtml = responsables
      .slice(0, 4)
      .map(
        (resp) => `
      <div>
        <div class="sig-line"></div>
        <div class="sig-name">${resp.nombre}</div>
        <div class="sig-role">${resp.cargo_rol}</div>
      </div>
    `
      )
      .join('');

    return `
      <div class="report-header">
        <div>
          <span class="badge-category">SISTEMA LAST PLANNER • LEAN CONSTRUCTION</span>
          <h1>Acta de Programación Intermedia y Restricciones Make-Ready</h1>
          <div class="project-name"><strong>Proyecto / Obra:</strong> ${activeObra.nombre_obra} (${activeObra.id_obra})</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;"><strong>Ubicación:</strong> ${activeObra.ubicacion || 'En sitio'} • <strong>Fecha Emisión:</strong> ${todayStr}</div>
        </div>
        <div style="text-align: right;">
          <div style="background: #1e293b; color: #ffffff; padding: 6px 12px; border-radius: 6px; font-weight: 800; font-size: 12px;">
            PPC MAKE-READY: ${metrics.ppcEstimado}%
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-box">
          <span class="kpi-label">PPC Programado (Semana 1)</span>
          <span class="kpi-val" style="color: #1d4ed8;">${metrics.ppcEstimado}%</span>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">Actividades Listas</span>
          <span class="kpi-val" style="color: #166534;">${metrics.actividadesListas} de ${metrics.totalActividades}</span>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">Actividades Bloqueadas</span>
          <span class="kpi-val" style="color: #be123c;">${metrics.actividadesBloqueadas}</span>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">Restricciones Pendientes</span>
          <span class="kpi-val" style="color: #b45309;">${pendingRestrictions.length}</span>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 13px; text-transform: uppercase; color: #0f172a; border-left: 4px solid #1d4ed8; padding-left: 8px; margin-bottom: 12px;">
          Matriz de Compromisos y Restricciones Make-Ready
        </h3>
        ${
          pendingRestrictions.length === 0
            ? '<p style="padding: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; color: #065f46; font-weight: bold; text-align: center;">¡Excelente! No hay restricciones pendientes. El 100% de insumos y trámites están liberados.</p>'
            : `
          <table>
            <thead>
              <tr>
                <th style="width: 25%;">Etapa / Manzana & Actividad</th>
                <th style="width: 35%;">Requisito Make-Ready</th>
                <th style="width: 20%;">Responsable</th>
                <th style="width: 10%;">Fecha Límite</th>
                <th style="width: 10%; text-align: center;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${pendingRowsHtml}
            </tbody>
          </table>
        `
        }
      </div>

      <div class="signatures">
        ${signaturesHtml}
      </div>
    `;
  };

  const handlePrint = () => {
    printReportDocument(
      `Acta_Programacion_Intermedia_${activeObra.id_obra}`,
      generateReportHtml()
    );
  };

  const handleDownload = () => {
    downloadHtmlReport(
      `Acta_Programacion_Intermedia_${activeObra.id_obra}`,
      generateReportHtml()
    );
  };

  return (
    <div
      id="modal-meeting-report-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-meeting-report-container"
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-6 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-700 text-white rounded-lg flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Acta de Reunión de Programación Intermedia (Lookahead)
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Obra: <strong>{activeObra.nombre_obra}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              title="Abrir vista de impresión y guardar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              title="Descargar archivo del acta"
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PREVIEW OF DOCUMENT */}
        <div className="space-y-5 text-slate-900 text-xs">
          {/* Document Title Header */}
          <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                SISTEMA LAST PLANNER / LEAN CONSTRUCTION
              </span>
              <h1 className="text-lg font-black text-slate-950 tracking-tight">
                INFORME DE PROGRAMACIÓN INTERMEDIA Y RESTRICCIONES
              </h1>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Proyecto: {activeObra.nombre_obra} • {activeObra.descripcion || 'Viviendas en Serie'}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <p className="font-bold text-slate-800">Fecha de Emisión:</p>
              <p className="capitalize font-medium">{todayStr}</p>
            </div>
          </div>

          {/* KPI Summary Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Make-Ready (PPC)
              </span>
              <span className="text-xl font-black text-blue-700">
                {metrics.ppcEstimado}%
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Actividades Listas
              </span>
              <span className="text-xl font-black text-emerald-700">
                {metrics.actividadesListas} / {metrics.totalActividades}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Actividades Bloqueadas
              </span>
              <span className="text-xl font-black text-rose-700">
                {metrics.actividadesBloqueadas}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Restricciones Pendientes
              </span>
              <span className="text-xl font-black text-slate-900">
                {pendingRestrictions.length}
              </span>
            </div>
          </div>

          {/* Pending Commitments for next week */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Matriz de Compromisos Pendientes y en Gestión ({pendingRestrictions.length})</span>
            </h4>

            {pendingRestrictions.length === 0 ? (
              <p className="text-slate-600 font-medium italic p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                No hay restricciones pendientes. ¡El 100% de los insumos y permisos están liberados!
              </p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Etapa / Manzana & Actividad</th>
                      <th className="p-2.5">Requisito Make-Ready</th>
                      <th className="p-2.5">Responsable</th>
                      <th className="p-2.5">Fecha Límite</th>
                      <th className="p-2.5">Estado</th>
                      <th className="p-2.5">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pendingRestrictions.map((r) => {
                      const act = actividades.find((a) => a.id_actividad === r.id_actividad);
                      const casa = act ? casas.find((c) => c.id_casa === act.id_casa) : null;
                      return (
                        <tr key={r.id_restriccion} className="hover:bg-slate-50/50">
                          <td className="p-2.5 align-top font-bold text-slate-900">
                            {casa ? `${casa.manzana_sector} - ${casa.numero_casa}` : ''}
                            <div className="text-[10.5px] text-slate-500 font-medium">
                              {act?.nombre_actividad}
                            </div>
                          </td>
                          <td className="p-2.5 align-top font-bold text-slate-800">
                            <span className="text-[10px] text-slate-500 block font-semibold">
                              [{r.categoria}]
                            </span>
                            {r.descripcion_requisito}
                          </td>
                          <td className="p-2.5 align-top font-bold text-slate-900">
                            {r.responsable}
                          </td>
                          <td className="p-2.5 align-top font-mono font-semibold text-slate-600">
                            {r.fecha_limite_liberacion}
                          </td>
                          <td className="p-2.5 align-top">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.estado_restriccion === 'En Gestión'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {r.estado_restriccion}
                            </span>
                          </td>
                          <td className="p-2.5 align-top text-slate-600 font-medium">
                            {r.notas_observaciones || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Signatures section for Lean Meeting */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs">
            {responsables.slice(0, 4).map((resp) => (
              <div key={resp.id_responsable} className="space-y-6">
                <div className="border-b border-slate-400 w-full h-8" />
                <div>
                  <p className="font-bold text-slate-900">{resp.nombre}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{resp.cargo_rol}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};
