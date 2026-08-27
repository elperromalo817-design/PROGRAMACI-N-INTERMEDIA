import React, { useState } from 'react';
import { X, Plus, AlertTriangle, UserPlus } from 'lucide-react';
import { useLeanData } from '../context/LeanDataContext';
import {
  CategoriaRestriccion,
  CATEGORIAS_RESTRICCION,
  EstadoRestriccion,
} from '../types';

interface NewRestriccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultActividadId?: string;
  onOpenManageResponsables?: () => void;
}

export const NewRestriccionModal: React.FC<NewRestriccionModalProps> = ({
  isOpen,
  onClose,
  defaultActividadId,
  onOpenManageResponsables,
}) => {
  const { actividades, casas, responsables, addRestriccion } = useLeanData();

  const [idActividad, setIdActividad] = useState(
    defaultActividadId || (actividades[0] ? actividades[0].id_actividad : '')
  );
  const [categoria, setCategoria] = useState<CategoriaRestriccion>('Compras/Insumos');
  const [descripcion, setDescripcion] = useState('');
  const [responsable, setResponsable] = useState(
    responsables[0] ? responsables[0].nombre : 'Residente de Obra'
  );
  const [fechaLimite, setFechaLimite] = useState(new Date().toISOString().slice(0, 10));
  const [estado, setEstado] = useState<EstadoRestriccion>('Pendiente');
  const [notas, setNotas] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !idActividad) return;

    addRestriccion({
      id_actividad: idActividad,
      categoria,
      descripcion_requisito: descripcion.trim(),
      responsable,
      fecha_limite_liberacion: fechaLimite,
      estado_restriccion: estado,
      notas_observaciones: notas.trim(),
    });

    setDescripcion('');
    setNotas('');
    onClose();
  };

  return (
    <div
      id="modal-new-restriccion-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-new-restriccion-container"
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-500 text-slate-950 rounded-lg flex items-center justify-center font-bold shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nueva Restricción Make-Ready
              </h3>
              <p className="text-xs text-slate-500 font-medium">Asignar prerrequisito o insumo a actividad</p>
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
          {/* Target Activity */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Actividad del Lookahead *
            </label>
            <select
              value={idActividad}
              onChange={(e) => setIdActividad(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            >
              {actividades.map((act) => {
                const casa = casas.find((c) => c.id_casa === act.id_casa);
                const casaLabel = casa ? `${casa.manzana_sector} - ${casa.numero_casa}` : act.id_casa;
                return (
                  <option key={act.id_actividad} value={act.id_actividad}>
                    [S{act.semana_programada}] {casaLabel} • {act.nombre_actividad}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Category & Responsible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Categoría *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaRestriccion)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              >
                {CATEGORIAS_RESTRICCION.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold">
                  Responsable Asignado *
                </label>
                {onOpenManageResponsables && (
                  <button
                    type="button"
                    onClick={onOpenManageResponsables}
                    className="text-[10px] text-blue-600 hover:underline font-bold flex items-center gap-0.5"
                  >
                    <UserPlus className="w-3 h-3" />
                    + Nuevo
                  </button>
                )}
              </div>
              <select
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              >
                {responsables.map((r) => (
                  <option key={r.id_responsable} value={r.nombre}>
                    {r.nombre} ({r.cargo_rol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Descripción del Requisito / Insumo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Concreto bombeado 3000 PSI en obra, formaleta de muros limpia..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            />
          </div>

          {/* Date & Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Fecha Límite Liberación *
              </label>
              <input
                type="date"
                required
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Estado Inicial
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoRestriccion)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              >
                <option value="Pendiente">Pendiente (No iniciado)</option>
                <option value="En Gestión">En Gestión (En proceso)</option>
                <option value="Liberado">Liberado (100% resuelto)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Notas / Observaciones
            </label>
            <textarea
              rows={2}
              placeholder="Detalles sobre proveedores, acuerdos, fechas compromiso..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            />
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
              Guardar Restricción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
