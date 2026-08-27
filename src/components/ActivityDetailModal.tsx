import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Layers,
  User,
  Check,
  Zap,
  Info,
  Home,
  MessageSquare,
} from 'lucide-react';
import { useLeanData } from '../context/LeanDataContext';
import {
  CategoriaRestriccion,
  CATEGORIAS_RESTRICCION,
  EstadoRestriccion,
} from '../types';

interface ActivityDetailModalProps {
  actividadId: string | null;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  actividadId,
  onClose,
}) => {
  const {
    actividades,
    casas,
    restricciones,
    responsables,
    updateActividad,
    addRestriccion,
    updateRestriccion,
    deleteRestriccion,
    setEstadoRestriccion,
    liberarTodasRestriccionesActividad,
  } = useLeanData();

  // Find target activity & house
  const actividad = actividades.find((a) => a.id_actividad === actividadId);
  const casa = actividad ? casas.find((c) => c.id_casa === actividad.id_casa) : null;
  const actRestricciones = actividad
    ? restricciones.filter((r) => r.id_actividad === actividad.id_actividad)
    : [];

  // Form State for Adding New Constraint
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoria, setNewCategoria] = useState<CategoriaRestriccion>('Compras/Insumos');
  const [newDescripcion, setNewDescripcion] = useState('');
  const [newResponsable, setNewResponsable] = useState(
    responsables[0] ? responsables[0].nombre : 'Residente de Obra'
  );
  const [newFechaLimite, setNewFechaLimite] = useState(
    actividad ? actividad.fecha_inicio_plan : new Date().toISOString().slice(0, 10)
  );
  const [newEstado, setNewEstado] = useState<EstadoRestriccion>('Pendiente');
  const [newNotas, setNewNotas] = useState('');

  // Editing existing restriction
  const [editingResId, setEditingResId] = useState<string | null>(null);
  const [editNotesText, setEditNotesText] = useState('');

  if (!actividad || !casa) return null;

  const isReady = actividad.estado_actividad === 'Lista para Ejecutar';
  const totalRes = actRestricciones.length;
  const liberatedRes = actRestricciones.filter((r) => r.estado_restriccion === 'Liberado').length;
  const percentLiberated = totalRes > 0 ? Math.round((liberatedRes / totalRes) * 100) : 100;

  const handleCreateRestriccion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescripcion.trim()) return;

    addRestriccion({
      id_actividad: actividad.id_actividad,
      categoria: newCategoria,
      descripcion_requisito: newDescripcion.trim(),
      responsable: newResponsable,
      fecha_limite_liberacion: newFechaLimite,
      estado_restriccion: newEstado,
      notas_observaciones: newNotas.trim(),
    });

    // Reset Form
    setNewDescripcion('');
    setNewNotas('');
    setShowAddForm(false);
  };

  const handleSaveNotes = (id_restriccion: string) => {
    updateRestriccion(id_restriccion, { notas_observaciones: editNotesText });
    setEditingResId(null);
  };

  return (
    <div
      id="modal-activity-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-activity-detail-container"
        className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-800 text-white flex items-center gap-1">
                <Home className="w-3 h-3 text-blue-400" />
                {casa.manzana_sector} • {casa.numero_casa}
              </span>
              <span className="text-xs font-bold text-slate-600">
                Semana {actividad.semana_programada}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({actividad.id_actividad})
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {actividad.nombre_actividad}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Fecha inicio planificada:</span>
              <input
                type="date"
                value={actividad.fecha_inicio_plan}
                onChange={(e) =>
                  updateActividad(actividad.id_actividad, { fecha_inicio_plan: e.target.value })
                }
                className="font-bold text-blue-700 bg-transparent border-b border-dashed border-blue-400 hover:border-blue-700 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="btn-close-activity-modal"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STATUS BANNER & MAKE-READY PROGRESS */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Card Indicator */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                  isReady
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-rose-100 text-rose-700 border-rose-300'
                }`}
              >
                {isReady ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertOctagon className="w-7 h-7" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Estado Actual Actividad
                  </span>
                </div>
                <div
                  className={`text-base sm:text-lg font-black ${
                    isReady ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isReady ? 'LISTA PARA EJECUTAR' : 'BLOQUEADA (Make-Ready Incompleto)'}
                </div>
                <p className="text-xs text-slate-600">
                  {isReady
                    ? 'El 100% de las restricciones asociadas han sido liberadas satisfactoriamente.'
                    : 'Requiere que todas las restricciones pendientes o en gestión pasen a estado Liberado.'}
                </p>
              </div>
            </div>

            {/* Quick Liberate Button & Progress */}
            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-slate-500">Avance Make-Ready:</span>
                <span className="font-bold text-slate-900">
                  {liberatedRes} de {totalRes} Liberadas ({percentLiberated}%)
                </span>
              </div>
              <div className="w-48 sm:w-56 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isReady ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${percentLiberated}%` }}
                />
              </div>

              {!isReady && totalRes > 0 && (
                <button
                  id="btn-liberar-todas-modal"
                  onClick={() => liberarTodasRestriccionesActividad(actividad.id_actividad)}
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Liberar 100% Restricciones</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MODAL CONTENT: RESTRICTIONS LIST & ACTIONS */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Restricciones Make-Ready ({totalRes})
              </h3>
            </div>

            <button
              id="btn-toggle-add-restriccion"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancelar' : '+ Agregar Restricción'}</span>
            </button>
          </div>

          {/* ADD NEW RESTRICTION FORM */}
          {showAddForm && (
            <form
              id="form-add-restriccion-modal"
              onSubmit={handleCreateRestriccion}
              className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3"
            >
              <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Restricción para {actividad.nombre_actividad}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {/* Category */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Categoría Make-Ready *
                  </label>
                  <select
                    value={newCategoria}
                    onChange={(e) => setNewCategoria(e.target.value as CategoriaRestriccion)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-medium"
                  >
                    {CATEGORIAS_RESTRICCION.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Responsible */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Responsable de Liberación *
                  </label>
                  <select
                    value={newResponsable}
                    onChange={(e) => setNewResponsable(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-medium"
                  >
                    {responsables.map((resp) => (
                      <option key={resp.id_responsable} value={resp.nombre}>
                        {resp.nombre} ({resp.cargo_rol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deadline Date */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Fecha Límite Liberación *
                  </label>
                  <input
                    type="date"
                    required
                    value={newFechaLimite}
                    onChange={(e) => setNewFechaLimite(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              {/* Requirement Description */}
              <div className="text-xs">
                <label className="block text-slate-700 font-semibold mb-1">
                  Descripción del Requisito / Insumo / Trámite *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Compra y entrega de acero corrugado de 1/2 pulgada, prueba de resistencia previa..."
                  value={newDescripcion}
                  onChange={(e) => setNewDescripcion(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-medium"
                />
              </div>

              {/* Initial Status & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={newEstado}
                    onChange={(e) => setNewEstado(e.target.value as EstadoRestriccion)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
                  >
                    <option value="Pendiente">Pendiente (No iniciado)</option>
                    <option value="En Gestión">En Gestión (En proceso)</option>
                    <option value="Liberado">Liberado (Cumplido 100%)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Notas / Observaciones del Seguimiento
                  </label>
                  <input
                    type="text"
                    placeholder="Detalles sobre proveedor, número de orden, contacto..."
                    value={newNotas}
                    onChange={(e) => setNewNotas(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
                >
                  Guardar Restricción
                </button>
              </div>
            </form>
          )}

          {/* RESTRICTIONS TABLE / LIST */}
          {actRestricciones.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600 opacity-80" />
              <p className="font-bold text-sm text-slate-900">
                No hay restricciones registradas
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Esta actividad está lista para ejecutarse según el plan. Si requiere insumos o prerrequisitos, agrégalos arriba.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {actRestricciones.map((res) => {
                const catMeta = CATEGORIAS_RESTRICCION.find((c) => c.value === res.categoria) || {
                  label: res.categoria,
                  color: 'text-slate-700',
                  bg: 'bg-slate-100',
                  border: 'border-slate-200',
                };

                const isLiberado = res.estado_restriccion === 'Liberado';
                const isEnGestion = res.estado_restriccion === 'En Gestión';
                const isPendiente = res.estado_restriccion === 'Pendiente';

                return (
                  <div
                    key={res.id_restriccion}
                    id={`row-restriccion-${res.id_restriccion}`}
                    className={`rounded-xl border p-3.5 sm:p-4 transition-all duration-200 ${
                      isLiberado
                        ? 'bg-white border-slate-200 shadow-2xs'
                        : isEnGestion
                        ? 'bg-amber-50/60 border-amber-200 shadow-2xs'
                        : 'bg-rose-50/60 border-rose-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      {/* Left: Category, Title & Info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}
                          >
                            {catMeta.label}
                          </span>

                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                            <User className="w-3 h-3 text-slate-500" />
                            {res.responsable}
                          </span>

                          <span className="text-[10.5px] font-mono text-slate-500 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Límite: {res.fecha_limite_liberacion}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          {res.descripcion_requisito}
                        </div>

                        {/* Notes Section */}
                        {editingResId === res.id_restriccion ? (
                          <div className="pt-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={editNotesText}
                              onChange={(e) => setEditNotesText(e.target.value)}
                              placeholder="Observaciones de seguimiento..."
                              className="flex-1 text-xs px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-900"
                            />
                            <button
                              onClick={() => handleSaveNotes(res.id_restriccion)}
                              className="px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-xs"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingResId(null)}
                              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 font-medium"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          res.notas_observaciones && (
                            <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-start gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <span className="flex-1 font-medium">{res.notas_observaciones}</span>
                              <button
                                onClick={() => {
                                  setEditingResId(res.id_restriccion);
                                  setEditNotesText(res.notas_observaciones);
                                }}
                                className="text-slate-400 hover:text-slate-700 p-0.5"
                                title="Editar notas"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )
                        )}
                      </div>

                      {/* Right: Quick State Toggle Buttons */}
                      <div className="flex sm:flex-col items-end gap-2 shrink-0 pt-2 sm:pt-0">
                        {/* 1-Click State Buttons */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs shadow-2xs">
                          <button
                            id={`btn-state-pendiente-${res.id_restriccion}`}
                            onClick={() => setEstadoRestriccion(res.id_restriccion, 'Pendiente')}
                            className={`px-2.5 py-1 rounded font-bold text-[10px] transition-all ${
                              isPendiente
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-600'
                            }`}
                          >
                            Pendiente
                          </button>

                          <button
                            id={`btn-state-gestion-${res.id_restriccion}`}
                            onClick={() => setEstadoRestriccion(res.id_restriccion, 'En Gestión')}
                            className={`px-2.5 py-1 rounded font-bold text-[10px] transition-all ${
                              isEnGestion
                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                : 'text-slate-600 hover:text-amber-600'
                            }`}
                          >
                            En Gestión
                          </button>

                          <button
                            id={`btn-state-liberado-${res.id_restriccion}`}
                            onClick={() => setEstadoRestriccion(res.id_restriccion, 'Liberado')}
                            className={`px-2.5 py-1 rounded font-bold text-[10px] transition-all flex items-center gap-1 ${
                              isLiberado
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-600'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            Liberado
                          </button>
                        </div>

                        {/* Actions (Add notes, delete) */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          {!res.notas_observaciones && editingResId !== res.id_restriccion && (
                            <button
                              onClick={() => {
                                setEditingResId(res.id_restriccion);
                                setEditNotesText('');
                              }}
                              className="text-[10px] text-blue-600 hover:underline font-bold"
                            >
                              + Observación
                            </button>
                          )}
                          <button
                            id={`btn-delete-res-${res.id_restriccion}`}
                            onClick={() => deleteRestriccion(res.id_restriccion)}
                            className="p-1 hover:text-rose-600 transition-colors"
                            title="Eliminar restricción"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>
              Regla Lean: La actividad pasa a <strong>Lista para Ejecutar</strong> únicamente cuando todas las restricciones están en verde (Liberadas).
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors shadow-xs"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
