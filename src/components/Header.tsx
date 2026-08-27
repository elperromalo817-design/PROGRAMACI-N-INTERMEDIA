import React, { useState } from 'react';
import {
  Calendar,
  Users,
  BarChart3,
  Plus,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Database,
  AlertOctagon,
  ChevronDown,
  UserPlus,
} from 'lucide-react';
import { ViewTab } from '../types';
import { useLeanData } from '../context/LeanDataContext';

interface HeaderProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  onOpenNewCasa: () => void;
  onOpenNewActividad: () => void;
  onOpenNewRestriccion: () => void;
  onOpenMeetingReport: () => void;
  onOpenBlockedReport: () => void;
  onOpenManageObras: () => void;
  onOpenManageResponsables: () => void;
  onOpenSupabaseSql: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewCasa,
  onOpenNewActividad,
  onOpenNewRestriccion,
  onOpenMeetingReport,
  onOpenBlockedReport,
  onOpenManageObras,
  onOpenManageResponsables,
  onOpenSupabaseSql,
}) => {
  const {
    obras,
    activeObraId,
    activeObra,
    setActiveObraId,
    metrics,
    resetToInitialData,
    supabaseStatus,
    supabaseUrl,
  } = useLeanData();

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showObraDropdown, setShowObraDropdown] = useState(false);

  return (
    <header
      id="lean-header"
      className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-xs"
    >
      {/* TOP ROW: BRANDING, OBRA SELECTOR & GLOBAL KPIS */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Brand & Multi-Obra Switcher */}
          <div className="flex items-center flex-wrap gap-3">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-xs shrink-0">
              L
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold leading-none tracking-tight text-slate-900">
                  LeanLookahead <span className="text-blue-600">Pro</span>
                </h1>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  4 Semanas Make-Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Programación Intermedia & Análisis de Restricciones
              </p>
            </div>

            {/* Obra Switcher Dropdown */}
            <div className="relative ml-1 sm:ml-3">
              <button
                id="btn-select-active-obra"
                onClick={() => setShowObraDropdown(!showObraDropdown)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-xs font-bold text-slate-900 transition-colors shadow-2xs"
                title="Cambiar obra o proyecto activo"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="max-w-[180px] sm:max-w-[240px] truncate text-left">
                  {activeObra.nombre_obra}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
              </button>

              {showObraDropdown && (
                <div
                  className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                  onClick={() => setShowObraDropdown(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Seleccionar Obra de Construcción
                  </div>
                  {obras.map((o) => (
                    <button
                      key={o.id_obra}
                      onClick={() => setActiveObraId(o.id_obra)}
                      className={`w-full text-left px-3 py-2 flex items-start justify-between gap-2 hover:bg-slate-50 transition-colors ${
                        o.id_obra === activeObraId
                          ? 'bg-blue-50/70 font-bold text-blue-900'
                          : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate font-semibold">{o.nombre_obra}</div>
                        <div className="text-[10px] text-slate-400 truncate">{o.ubicacion || 'En sitio'}</div>
                      </div>
                      {o.id_obra === activeObraId && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                    <button
                      onClick={onOpenManageObras}
                      className="w-full text-center py-1.5 px-2 text-blue-700 hover:bg-blue-50 rounded-lg font-bold flex items-center justify-center gap-1 text-[11px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Gestionar / Añadir Obras</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar & Special Actions */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* PPC Make-Ready Indicator */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-2 shadow-2xs">
              <div className="flex flex-col">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">
                  Make-Ready (PPC)
                </span>
                <span className="text-xs font-black text-blue-700">
                  {metrics.ppcEstimado}% Sem. 1
                </span>
              </div>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.ppcEstimado}%` }}
                />
              </div>
            </div>

            {/* Listas vs Bloqueadas Counter */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-2.5 shadow-2xs">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold text-emerald-700">{metrics.actividadesListas} Listas</span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-bold text-rose-700">{metrics.actividadesBloqueadas} Bloqueadas</span>
              </div>
            </div>

            {/* Blocked Report Button */}
            <button
              id="btn-open-blocked-report-header"
              onClick={onOpenBlockedReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              title="Ver Reporte de Actividades Bloqueadas Make-Ready"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Reporte Bloqueadas</span>
              {metrics.actividadesBloqueadas > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-rose-700 rounded-full font-black text-[10px]">
                  {metrics.actividadesBloqueadas}
                </span>
              )}
            </button>

            {/* Meeting Report Button */}
            <button
              id="btn-reporte-reunion"
              onClick={onOpenMeetingReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              title="Generar Acta / Informe para Reunión Intermedia"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Acta Intermedia</span>
            </button>

            {/* Supabase Live DB Button */}
            <button
              id="btn-open-supabase-sql"
              onClick={onOpenSupabaseSql}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                supabaseStatus === 'connected'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : supabaseStatus === 'syncing'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
              title={`Base de datos Supabase: ${supabaseUrl}`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Supabase DB</span>
              {supabaseStatus === 'connected' ? (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              ) : supabaseStatus === 'syncing' ? (
                <RefreshCw className="w-3 h-3 animate-spin text-white" />
              ) : null}
            </button>

            {/* Reset Data Button */}
            <div className="relative inline-block">
              <button
                id="btn-reset-data"
                onClick={() => setShowConfirmReset(true)}
                className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors shadow-2xs"
                title="Restablecer datos de ejemplo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              {showConfirmReset && (
                <div className="absolute right-0 mt-2 w-64 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-50 text-xs">
                  <p className="text-slate-800 font-semibold mb-2">
                    ¿Restablecer datos de obras y actividades?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowConfirmReset(false)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        resetToInitialData();
                        setShowConfirmReset(false);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded shadow-xs"
                    >
                      Restablecer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: NAVIGATION TABS & CREATION BUTTONS */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Main Navigation Segmented Control */}
          <nav
            className="flex items-center bg-slate-100 rounded-lg p-1 overflow-x-auto scrollbar-none text-xs"
            aria-label="Tabs"
          >
            <button
              id="tab-lookahead"
              onClick={() => setCurrentTab('lookahead')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                currentTab === 'lookahead'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Matriz Lookahead 4S</span>
            </button>

            <button
              id="tab-blocked-report"
              onClick={() => setCurrentTab('blocked_report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                currentTab === 'blocked_report'
                  ? 'bg-white text-rose-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>Actividades Bloqueadas</span>
              {metrics.actividadesBloqueadas > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  {metrics.actividadesBloqueadas}
                </span>
              )}
            </button>

            <button
              id="tab-responsibles"
              onClick={() => setCurrentTab('responsibles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                currentTab === 'responsibles'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Seguimiento por Responsable</span>
              {metrics.restriccionesPendientes > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {metrics.restriccionesPendientes}
                </span>
              )}
            </button>

            <button
              id="tab-metrics"
              onClick={() => setCurrentTab('metrics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                currentTab === 'metrics'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Indicadores (PPC)</span>
            </button>
          </nav>

          {/* Creation & Management Triggers */}
          <div className="flex items-center flex-wrap gap-2 self-end sm:self-auto text-xs">
            <button
              id="btn-manage-responsables-header"
              onClick={onOpenManageResponsables}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors shadow-2xs"
              title="Añadir y gestionar nombres de responsables para esta obra"
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Responsable</span>
            </button>

            <button
              id="btn-nueva-restriccion-header"
              onClick={onOpenNewRestriccion}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Restricción</span>
            </button>

            <button
              id="btn-nueva-actividad-header"
              onClick={onOpenNewActividad}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>+ Actividad</span>
            </button>

            <button
              id="btn-nueva-casa-header"
              onClick={onOpenNewCasa}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>+ Etapa / Manzana</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
