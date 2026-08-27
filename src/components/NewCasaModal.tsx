import React, { useState } from 'react';
import { X, Layers, Plus, Building2 } from 'lucide-react';
import { useLeanData } from '../context/LeanDataContext';
import { EstadoGeneralCasa, TipoUnidad } from '../types';

interface NewCasaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCasaModal: React.FC<NewCasaModalProps> = ({ isOpen, onClose }) => {
  const { activeObra, addCasa } = useLeanData();
  const [tipoUnidad, setTipoUnidad] = useState<TipoUnidad>('Manzana');
  const [sectorEtapa, setSectorEtapa] = useState('Etapa 1');
  const [codigoNombre, setCodigoNombre] = useState('');
  const [estadoGeneral, setEstadoGeneral] = useState<EstadoGeneralCasa>('En proceso');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoNombre.trim()) return;

    addCasa({
      manzana_sector: sectorEtapa.trim(),
      numero_casa: codigoNombre.trim(),
      estado_general: estadoGeneral,
    });

    setCodigoNombre('');
    onClose();
  };

  return (
    <div
      id="modal-new-casa-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="modal-new-casa-container"
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-700 text-white rounded-lg flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Registrar Etapa / Manzana / Frente
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-600" />
                {activeObra.nombre_obra}
              </p>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Tipo de Agrupación
              </label>
              <select
                value={tipoUnidad}
                onChange={(e) => setTipoUnidad(e.target.value as TipoUnidad)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30"
              >
                <option value="Manzana">Manzana</option>
                <option value="Etapa">Etapa</option>
                <option value="Frente">Frente de Trabajo</option>
                <option value="Sector">Sector / Lote</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Etapa o Macrosector *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Etapa 1, Sector Norte..."
                value={sectorEtapa}
                onChange={(e) => setSectorEtapa(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600/30 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Nombre / Código del Frente o Manzana *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Manzana A (Estructura), Frente Cimentación..."
              value={codigoNombre}
              onChange={(e) => setCodigoNombre(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600/30 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Estado General
            </label>
            <select
              value={estadoGeneral}
              onChange={(e) => setEstadoGeneral(e.target.value as EstadoGeneralCasa)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/30"
            >
              <option value="En proceso">En proceso</option>
              <option value="Pausado">Pausado</option>
              <option value="Entregado">Entregado / Concluido</option>
            </select>
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
              Guardar Etapa / Frente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
