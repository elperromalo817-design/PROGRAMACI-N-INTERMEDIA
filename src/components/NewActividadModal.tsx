import React, { useState } from 'react';
import { X, Layers, Plus, Calendar, Home } from 'lucide-react';
import { useLeanData } from '../context/LeanDataContext';
import { ACTIVIDADES_ESTANDAR } from '../types';

interface NewActividadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCasaId?: string;
  defaultSemana?: 1 | 2 | 3 | 4;
}

export const NewActividadModal: React.FC<NewActividadModalProps> = ({
  isOpen,
  onClose,
  defaultCasaId,
  defaultSemana = 1,
}) => {
  const { casas, addActividad } = useLeanData();

  const [idCasa, setIdCasa] = useState(defaultCasaId || (casas[0] ? casas[0].id_casa : ''));
  const [nombreActividad, setNombreActividad] = useState(ACTIVIDADES_ESTANDAR[0]);
  const [isCustomActivity, setIsCustomActivity] = useState(false);
  const [customNombre, setCustomNombre] = useState('');
  const [semana, setSemana] = useState<1 | 2 | 3 | 4>(defaultSemana);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = isCustomActivity ? customNombre.trim() : nombreActividad;
    if (!finalName || !idCasa) return;

    addActividad({
      id_casa: idCasa,
      nombre_actividad: finalName,
      semana_programada: semana,
      fecha_inicio_plan: fechaInicio,
    });

    onClose();
  };

  return (
    <div
      id="modal-new-actividad-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-new-actividad-container"
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-700 text-white rounded-lg flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Programar Actividad en Lookahead
              </h3>
              <p className="text-xs text-slate-500 font-medium">Horizonte de 4 Semanas Make-Ready</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Casa Selection */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Casa / Unidad Destino *
            </label>
            <select
              value={idCasa}
              onChange={(e) => setIdCasa(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-medium"
            >
              {casas.map((c) => (
                <option key={c.id_casa} value={c.id_casa}>
                  {c.manzana_sector} - {c.numero_casa} ({c.id_casa}) [{c.estado_general}]
                </option>
              ))}
            </select>
          </div>

          {/* Activity Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-bold">
                Actividad Estándar Lean *
              </label>
              <button
                type="button"
                onClick={() => setIsCustomActivity(!isCustomActivity)}
                className="text-[11px] text-blue-700 hover:underline font-bold"
              >
                {isCustomActivity ? 'Usar estándar (16)' : 'Personalizada'}
              </button>
            </div>

            {isCustomActivity ? (
              <input
                type="text"
                required
                placeholder="Nombre de la actividad personalizada..."
                value={customNombre}
                onChange={(e) => setCustomNombre(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            ) : (
              <select
                value={nombreActividad}
                onChange={(e) => setNombreActividad(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              >
                {ACTIVIDADES_ESTANDAR.map((act, index) => (
                  <option key={act} value={act}>
                    {index + 1}. {act}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Week & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Semana Programada (1 a 4) *
              </label>
              <select
                value={semana}
                onChange={(e) => setSemana(Number(e.target.value) as 1 | 2 | 3 | 4)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              >
                <option value={1}>Semana 1 (Inmediata / Compromiso)</option>
                <option value={2}>Semana 2 (Make-Ready Activo)</option>
                <option value={3}>Semana 3 (Medio Plazo)</option>
                <option value={4}>Semana 4 (Horizonte Lookahead)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Fecha Inicio Planificada *
              </label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Programar Actividad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
