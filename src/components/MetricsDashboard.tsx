import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Users,
  Home,
  Clock,
  TrendingUp,
  PieChart,
  ShieldAlert,
} from 'lucide-react';
import { useLeanData } from '../context/LeanDataContext';
import { CATEGORIAS_RESTRICCION, RESPONSABLES_PRINCIPALES } from '../types';

export const MetricsDashboard: React.FC = () => {
  const { metrics, actividades, restricciones, casas } = useLeanData();

  // Weekly breakdown
  const weeksData = [1, 2, 3, 4].map((w) => {
    const acts = actividades.filter((a) => a.semana_programada === w);
    const ready = acts.filter((a) => a.estado_actividad === 'Lista para Ejecutar').length;
    const blocked = acts.filter((a) => a.estado_actividad === 'Bloqueada').length;
    const total = acts.length;
    const percent = total > 0 ? Math.round((ready / total) * 100) : 0;
    return { week: w, total, ready, blocked, percent };
  });

  // Categories breakdown
  const categoryStats = CATEGORIAS_RESTRICCION.map((cat) => {
    const list = restricciones.filter((r) => r.categoria === cat.value);
    const liberadas = list.filter((r) => r.estado_restriccion === 'Liberado').length;
    const pendientes = list.filter((r) => r.estado_restriccion === 'Pendiente').length;
    const enGestion = list.filter((r) => r.estado_restriccion === 'En Gestión').length;
    const total = list.length;
    const percent = total > 0 ? Math.round((liberadas / total) * 100) : 100;
    return { ...cat, total, liberadas, pendientes, enGestion, percent };
  });

  // Responsible breakdown
  const respStats = RESPONSABLES_PRINCIPALES.map((resp) => {
    const list = restricciones.filter((r) => r.responsable === resp.name);
    const liberadas = list.filter((r) => r.estado_restriccion === 'Liberado').length;
    const pendientes = list.filter((r) => r.estado_restriccion === 'Pendiente').length;
    const enGestion = list.filter((r) => r.estado_restriccion === 'En Gestión').length;
    const total = list.length;
    const percent = total > 0 ? Math.round((liberadas / total) * 100) : 100;
    return { ...resp, total, liberadas, pendientes, enGestion, percent };
  });

  return (
    <div id="metrics-dashboard-view" className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-xl p-5 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold">Métricas & Indicadores Lean Construction</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Evaluación del flujo de trabajo continuo, liberación de restricciones Make-Ready y confiabilidad de la programación semanal.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Make-Ready Global (PPC)
              </span>
              <span className="text-2xl font-extrabold text-amber-400">
                {metrics.porcentajeMakeReady}%
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Total Restricciones
              </span>
              <span className="text-xl font-bold text-white">
                {metrics.restriccionesLiberadas}/{metrics.totalRestricciones}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Casas en Proceso */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Viviendas en Serie</span>
            <Home className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {metrics.totalCasas}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
            <span className="text-blue-600 font-semibold">{metrics.casasEnProceso} En proceso</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">{metrics.casasEntregadas} Entregadas</span>
          </div>
        </div>

        {/* Actividades Programadas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Actividades Lookahead</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {metrics.totalActividades}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Distribuidas en horizonte 4 semanas
          </div>
        </div>

        {/* Actividades Listas vs Bloqueadas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Actividades Listas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.actividadesListas}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.actividadesBloqueadas} bloqueadas por Make-Ready
          </div>
        </div>

        {/* Restricciones Pendientes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Restricciones Activas</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {metrics.restriccionesPendientes + metrics.restriccionesEnGestion}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.restriccionesPendientes} pendientes / {metrics.restriccionesEnGestion} en gestión
          </div>
        </div>
      </div>

      {/* TWO COLUMN CHARTS & BREAKDOWNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LOOKAHEAD 4 WEEKS PROGRESSION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Progreso Make-Ready por Semana (Lookahead 4S)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Regla 100% Liberado</span>
          </div>

          <div className="space-y-3">
            {weeksData.map((item) => (
              <div key={item.week} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Semana {item.week}
                  </span>
                  <span className="text-slate-500">
                    {item.ready} de {item.total} actividades listas ({item.percent}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${item.percent}%` }}
                    title={`${item.ready} listas`}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${100 - item.percent}%` }}
                    title={`${item.blocked} bloqueadas`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="text-emerald-600 font-semibold">{item.ready} Listas</span>
                  <span className="text-rose-600 font-semibold">{item.blocked} Bloqueadas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RESTRICTIONS BY CATEGORY */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Restricciones por Categoría Make-Ready
              </h3>
            </div>
            <span className="text-xs text-slate-400">5 Categorías Estándar</span>
          </div>

          <div className="space-y-2.5">
            {categoryStats.map((cat) => (
              <div key={cat.value} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {cat.label}
                  </span>
                  <span className="font-mono text-slate-500">
                    {cat.liberadas}/{cat.total} liberadas ({cat.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TEAM RESPONSIBILITY MATRIX */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Matriz de Responsabilidades & Cumplimiento Lean
            </h3>
          </div>
          <span className="text-xs text-slate-400">Para Revisión en Comité Semanal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {respStats.map((resp) => (
            <div
              key={resp.name}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  {resp.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {resp.percent}%
                </span>
              </div>
              <div className="text-[11px] text-slate-500">{resp.role}</div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-semibold">{resp.liberadas} Liberadas</span>
                <span className="text-rose-600 font-semibold">{resp.pendientes + resp.enGestion} Pendientes</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
