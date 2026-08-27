/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ViewTab } from './types';
import { LeanDataProvider, useLeanData } from './context/LeanDataContext';
import { Header } from './components/Header';
import { LookaheadBoard } from './components/LookaheadBoard';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { ResponsiblesMeetingView } from './components/ResponsiblesMeetingView';
import { MetricsDashboard } from './components/MetricsDashboard';
import { NewCasaModal } from './components/NewCasaModal';
import { NewActividadModal } from './components/NewActividadModal';
import { NewRestriccionModal } from './components/NewRestriccionModal';
import { MeetingReportModal } from './components/MeetingReportModal';
import { BlockedActivitiesReportModal } from './components/BlockedActivitiesReportModal';
import { ManageObrasModal } from './components/ManageObrasModal';
import { ManageResponsablesModal } from './components/ManageResponsablesModal';
import { SupabaseSqlModal } from './components/SupabaseSqlModal';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('lookahead');
  const { selectedActividadId, setSelectedActividadId, activeObra } = useLeanData();

  // Modal States
  const [isNewCasaOpen, setIsNewCasaOpen] = useState(false);
  const [isNewActividadOpen, setIsNewActividadOpen] = useState(false);
  const [isNewRestriccionOpen, setIsNewRestriccionOpen] = useState(false);
  const [isMeetingReportOpen, setIsMeetingReportOpen] = useState(false);
  const [isBlockedReportOpen, setIsBlockedReportOpen] = useState(false);
  const [isManageObrasOpen, setIsManageObrasOpen] = useState(false);
  const [isManageResponsablesOpen, setIsManageResponsablesOpen] = useState(false);
  const [isSupabaseSqlOpen, setIsSupabaseSqlOpen] = useState(false);

  // Preselected parameters for new activity
  const [newActCasaId, setNewActCasaId] = useState<string | undefined>(undefined);
  const [newActSemana, setNewActSemana] = useState<1 | 2 | 3 | 4 | undefined>(undefined);

  const handleOpenNewActividadForCasa = (id_casa: string, semana: 1 | 2 | 3 | 4) => {
    setNewActCasaId(id_casa);
    setNewActSemana(semana);
    setIsNewActividadOpen(true);
  };

  const handleOpenGeneralNewActividad = () => {
    setNewActCasaId(undefined);
    setNewActSemana(undefined);
    setIsNewActividadOpen(true);
  };

  const handleTabChange = (tab: ViewTab) => {
    if (tab === 'blocked_report') {
      setIsBlockedReportOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* App Header & Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenNewCasa={() => setIsNewCasaOpen(true)}
        onOpenNewActividad={handleOpenGeneralNewActividad}
        onOpenNewRestriccion={() => setIsNewRestriccionOpen(true)}
        onOpenMeetingReport={() => setIsMeetingReportOpen(true)}
        onOpenBlockedReport={() => setIsBlockedReportOpen(true)}
        onOpenManageObras={() => setIsManageObrasOpen(true)}
        onOpenManageResponsables={() => setIsManageResponsablesOpen(true)}
        onOpenSupabaseSql={() => setIsSupabaseSqlOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {currentTab === 'lookahead' && (
          <LookaheadBoard
            onSelectActividad={(id) => setSelectedActividadId(id)}
            onOpenNewActividadForCasa={handleOpenNewActividadForCasa}
            onOpenNewCasa={() => setIsNewCasaOpen(true)}
          />
        )}

        {currentTab === 'responsibles' && (
          <ResponsiblesMeetingView
            onSelectActividad={(id) => setSelectedActividadId(id)}
            onOpenManageResponsables={() => setIsManageResponsablesOpen(true)}
          />
        )}

        {currentTab === 'metrics' && <MetricsDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-100 py-2.5 px-6 text-[11px] font-semibold text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Obra Activa: {activeObra.nombre_obra} ({activeObra.id_obra})</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>Sistema Last Planner / Lean Construction (Lookahead 4S)</span>
          </div>
          <div className="font-mono text-[10px] tracking-wider uppercase text-slate-500">
            Regla: 100% Restricciones Liberadas ➔ Lista para Ejecutar
          </div>
        </div>
      </footer>

      {/* Activity Detail Modal (Make-Ready Analysis) */}
      {selectedActividadId && (
        <ActivityDetailModal
          actividadId={selectedActividadId}
          onClose={() => setSelectedActividadId(null)}
        />
      )}

      {/* Modals */}
      <NewCasaModal
        isOpen={isNewCasaOpen}
        onClose={() => setIsNewCasaOpen(false)}
      />

      <NewActividadModal
        isOpen={isNewActividadOpen}
        onClose={() => setIsNewActividadOpen(false)}
        defaultCasaId={newActCasaId}
        defaultSemana={newActSemana}
      />

      <NewRestriccionModal
        isOpen={isNewRestriccionOpen}
        onClose={() => setIsNewRestriccionOpen(false)}
        onOpenManageResponsables={() => {
          setIsNewRestriccionOpen(false);
          setIsManageResponsablesOpen(true);
        }}
      />

      <MeetingReportModal
        isOpen={isMeetingReportOpen}
        onClose={() => setIsMeetingReportOpen(false)}
      />

      <BlockedActivitiesReportModal
        isOpen={isBlockedReportOpen}
        onClose={() => setIsBlockedReportOpen(false)}
        onSelectActividad={(id) => {
          setIsBlockedReportOpen(false);
          setSelectedActividadId(id);
        }}
      />

      <ManageObrasModal
        isOpen={isManageObrasOpen}
        onClose={() => setIsManageObrasOpen(false)}
      />

      <ManageResponsablesModal
        isOpen={isManageResponsablesOpen}
        onClose={() => setIsManageResponsablesOpen(false)}
      />

      <SupabaseSqlModal
        isOpen={isSupabaseSqlOpen}
        onClose={() => setIsSupabaseSqlOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LeanDataProvider>
      <MainAppContent />
    </LeanDataProvider>
  );
}
