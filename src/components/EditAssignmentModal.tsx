'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface Assignment {
  id: string;
  dia: string;
  hora: string;
  capitan: string;
  salida: string;
  territorio: string;
  territorioTipo: string;
}

interface EditModalProps {
  isOpen: boolean;
  assignment: Assignment | null;
  onClose: () => void;
  onSave: (updatedAssignment: Assignment) => void;
}

export default function EditAssignmentModal({
  isOpen,
  assignment,
  onClose,
  onSave,
}: EditModalProps) {
  const [dia, setDia] = useState('');
  const [hora, setHora] = useState('');
  const [capitan, setCapitan] = useState('');
  const [salida, setSalida] = useState('');
  const [territorio, setTerritorio] = useState('');
  const [territorioTipo, setTerritorioTipo] = useState('');

  useEffect(() => {
    if (assignment) {
      setDia(assignment.dia);
      setHora(assignment.hora);
      setCapitan(assignment.capitan);
      setSalida(assignment.salida);
      setTerritorio(assignment.territorio);
      setTerritorioTipo(assignment.territorioTipo);
    }
  }, [assignment]);

  if (!isOpen || !assignment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: assignment.id,
      dia,
      hora,
      capitan,
      salida,
      territorio,
      territorioTipo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in font-sans p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="px-6 py-4 bg-burgundy text-white flex justify-between items-center">
          <h3 className="text-lg font-bold">Editar Asignación</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Día</label>
              <input
                type="text"
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                placeholder="Ej. Lunes 14"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hora</label>
              <input
                type="text"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                placeholder="Ej. 09:30 AM"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Capitán</label>
            <input
              type="text"
              value={capitan}
              onChange={(e) => setCapitan(e.target.value)}
              placeholder="Nombre del capitán"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Punto de Salida</label>
            <input
              type="text"
              value={salida}
              onChange={(e) => setSalida(e.target.value)}
              placeholder="Dirección o punto de salida"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Territorio</label>
              <input
                type="text"
                value={territorio}
                onChange={(e) => setTerritorio(e.target.value)}
                placeholder="Ej. T-182"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo de Zona</label>
              <input
                type="text"
                value={territorioTipo}
                onChange={(e) => setTerritorioTipo(e.target.value)}
                placeholder="Ej. Zona Norte"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-burgundy hover:bg-burgundy-hover text-white rounded-lg text-sm font-semibold shadow-md transition"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
