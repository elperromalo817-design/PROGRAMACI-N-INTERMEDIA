import React, { useState } from 'react';
import {
  X,
  Users,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Phone,
  Briefcase,
  UserCheck,
  Building2,
} from 'lucide-react';
import { useLeanData } from '../context/LeanDataContext';
import { Responsable } from '../types';

interface ManageResponsablesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageResponsablesModal: React.FC<ManageResponsablesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeObra,
    responsables,
    addResponsable,
    updateResponsable,
    deleteResponsable,
  } = useLeanData();

  const [showAddForm, setShowAddForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cargoRol, setCargoRol] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [colorTheme, setColorTheme] = useState<'indigo' | 'emerald' | 'blue' | 'orange' | 'purple'>('indigo');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCargo, setEditCargo] = useState('');

  if (!isOpen) return null;

  const colorMap = {
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-800' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !cargoRol.trim()) return;

    const theme = colorMap[colorTheme];

    addResponsable({
      nombre: nombre.trim(),
      cargo_rol: cargoRol.trim(),
      email_contacto: email.trim() || undefined,
      telefono: telefono.trim() || undefined,
      badge_bg: theme.bg,
      badge_text: theme.text,
    });

    setNombre('');
    setCargoRol('');
    setEmail('');
    setTelefono('');
    setShowAddForm(false);
  };

  const handleSaveEdit = (id: string) => {
    if (!editNombre.trim() || !editCargo.trim()) return;
    updateResponsable(id, {
      nombre: editNombre.trim(),
      cargo_rol: editCargo.trim(),
    });
    setEditingId(null);
  };

  return (
    <div
      id="modal-manage-responsables-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-manage-responsables-container"
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Equipo de Responsables por Obra
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Obra actual: <strong>{activeObra.nombre_obra}</strong>
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
              Responsables Asignados ({responsables.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancelar' : '+ Añadir Responsable'}</span>
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreate}
              className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3 text-xs"
            >
              <div className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Nuevo Responsable para {activeObra.nombre_obra}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ing. Mario Gómez, Arq. Sandra..."
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Cargo / Rol en Obra *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Residente de Acabados, Coordinador SST..."
                    value={cargoRol}
                    onChange={(e) => setCargoRol(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@constructora.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Teléfono / Celular</label>
                  <input
                    type="text"
                    placeholder="+57 300 000 0000"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Color de Distintivo</label>
                <div className="flex gap-2">
                  {(['indigo', 'emerald', 'blue', 'orange', 'purple'] as const).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setColorTheme(color)}
                      className={`px-3 py-1 rounded text-xs font-bold border transition-all ${
                        colorTheme === color
                          ? 'border-slate-900 ring-2 ring-slate-900'
                          : 'border-slate-300 opacity-70'
                      } ${colorMap[color].bg} ${colorMap[color].text}`}
                    >
                      {color.toUpperCase()}
                    </button>
                  ))}
                </div>
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
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Guardar Responsable
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="space-y-2">
            {responsables.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-xs font-bold text-slate-700">No hay responsables específicos aún</p>
                <p className="text-[11px] text-slate-500">Agrega los integrantes de esta obra arriba.</p>
              </div>
            ) : (
              responsables.map((resp) => {
                return (
                  <div
                    key={resp.id_responsable}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    {editingId === resp.id_responsable ? (
                      <div className="space-y-2 flex-1">
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Nombre</label>
                          <input
                            type="text"
                            value={editNombre}
                            onChange={(e) => setEditNombre(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Cargo / Rol</label>
                          <input
                            type="text"
                            value={editCargo}
                            onChange={(e) => setEditCargo(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-slate-500 font-medium"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEdit(resp.id_responsable)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              resp.badge_bg || 'bg-slate-100'
                            } ${resp.badge_text || 'text-slate-800'}`}
                          >
                            {resp.nombre}
                          </span>
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            {resp.cargo_rol}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500">
                          {resp.email_contacto && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {resp.email_contacto}
                            </span>
                          )}
                          {resp.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {resp.telefono}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {editingId !== resp.id_responsable && (
                      <div className="flex items-center gap-1 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setEditingId(resp.id_responsable);
                            setEditNombre(resp.nombre);
                            setEditCargo(resp.cargo_rol);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                          title="Editar responsable"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteResponsable(resp.id_responsable)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="Eliminar responsable"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
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
