import React, { useState } from 'react';
import {
  X,
  Building2,
  Plus,
  Trash2,
  Edit2,
  Check,
  MapPin,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useLeanData } from '../context/LeanDataContext';
import { Obra } from '../types';

interface ManageObrasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageObrasModal: React.FC<ManageObrasModalProps> = ({ isOpen, onClose }) => {
  const { obras, activeObraId, setActiveObraId, addObra, updateObra, deleteObra } = useLeanData();

  const [showAddForm, setShowAddForm] = useState(false);
  const [nombreObra, setNombreObra] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [estado, setEstado] = useState<'Activa' | 'Completada' | 'Pausada'>('Activa');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editUbicacion, setEditUbicacion] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreObra.trim()) return;

    addObra({
      nombre_obra: nombreObra.trim(),
      descripcion: descripcion.trim() || 'Proyecto de Construcción Lean',
      ubicacion: ubicacion.trim() || 'En sitio',
      estado,
    });

    setNombreObra('');
    setDescripcion('');
    setUbicacion('');
    setShowAddForm(false);
  };

  const handleSaveEdit = (id: string) => {
    if (!editNombre.trim()) return;
    updateObra(id, {
      nombre_obra: editNombre.trim(),
      ubicacion: editUbicacion.trim(),
    });
    setEditingId(null);
  };

  return (
    <div
      id="modal-manage-obras-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-manage-obras-container"
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Gestión de Obras y Proyectos
              </h2>
              <p className="text-xs text-slate-400">
                Administra múltiples frentes de obra independientes con sus propios equipos.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Proyectos Registrados ({obras.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancelar' : '+ Nueva Obra'}</span>
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreate}
              className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 text-xs"
            >
              <div className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Nueva Obra / Proyecto</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre de la Obra *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Conjunto Residencial Las Palmas, Torre B..."
                  value={nombreObra}
                  onChange={(e) => setNombreObra(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-600/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ubicación / Sector</label>
                  <input
                    type="text"
                    placeholder="Ej. Sector Norte, Calle 100 #15-30..."
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Estado</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as 'Activa' | 'Completada' | 'Pausada')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-600/30"
                  >
                    <option value="Activa">Activa</option>
                    <option value="Pausada">Pausada</option>
                    <option value="Completada">Completada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Descripción / Alcance</label>
                <input
                  type="text"
                  placeholder="Ej. 80 Viviendas unifamiliares en serie, 3 Manzanas..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-600/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-xs"
                >
                  Guardar Obra
                </button>
              </div>
            </form>
          )}

          {/* Obras List */}
          <div className="space-y-2.5">
            {obras.map((obra) => {
              const isActive = obra.id_obra === activeObraId;

              return (
                <div
                  key={obra.id_obra}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-blue-50/50 border-blue-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {editingId === obra.id_obra ? (
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-slate-600 font-bold mb-1">Nombre</label>
                        <input
                          type="text"
                          value={editNombre}
                          onChange={(e) => setEditNombre(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-bold mb-1">Ubicación</label>
                        <input
                          type="text"
                          value={editUbicacion}
                          onChange={(e) => setEditUbicacion(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 text-slate-500 font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveEdit(obra.id_obra)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-xs"
                        >
                          Guardar Cambios
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {obra.id_obra}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{obra.nombre_obra}</h4>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              ACTIVA AHORA
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {obra.estado}
                          </span>
                        </div>

                        {obra.descripcion && (
                          <p className="text-xs text-slate-600">{obra.descripcion}</p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          {obra.ubicacion && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {obra.ubicacion}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Creada: {obra.fecha_creacion}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!isActive && (
                          <button
                            onClick={() => {
                              setActiveObraId(obra.id_obra);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                          >
                            Seleccionar
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingId(obra.id_obra);
                            setEditNombre(obra.nombre_obra);
                            setEditUbicacion(obra.ubicacion || '');
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                          title="Editar información de la obra"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {obras.length > 1 && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `¿Estás seguro de eliminar la obra "${obra.nombre_obra}" y todos sus datos asociados?`
                                )
                              ) {
                                deleteObra(obra.id_obra);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            title="Eliminar obra"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
