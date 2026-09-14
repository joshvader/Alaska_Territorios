'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Save, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Calendar, 
  UserCheck, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  FileSpreadsheet
} from 'lucide-react';
import { 
  Territory, 
  Assignment, 
  parseS13Buffer, 
  exportS13ToExcel, 
  upsertTerritoriesInSupabase 
} from '@/lib/territories';

interface S13EditorProps {
  initialTerritories: Territory[];
  onRefreshData?: () => void;
}

export default function S13Editor({ initialTerritories, onRefreshData }: S13EditorProps) {
  const [territories, setTerritories] = useState<Territory[]>(initialTerritories);
  const [expandedTerritories, setExpandedTerritories] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'available'>('all');
  
  // Storage & Async states
  const [isSaving, setIsSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit/Add Assignment Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    territoryNumber: number | null;
    assignmentIndex: number | null; // null si es nuevo
    name: string;
    assignedDate: string;
    completedDate: string;
  }>({
    isOpen: false,
    territoryNumber: null,
    assignmentIndex: null,
    name: '',
    assignedDate: '',
    completedDate: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Actualizar el estado si vienen nuevos territorios desde props
  React.useEffect(() => {
    if (initialTerritories.length > 0) {
      setTerritories(initialTerritories);
    }
  }, [initialTerritories]);

  // Mensajes temporales
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // 1. Manejo de Importación de Archivos Excel/CSV S-13
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseS13Buffer(buffer);

      if (parsed.length === 0) {
        showMessage('error', 'No se pudieron extraer datos S-13 válidos del archivo.');
        return;
      }

      // Convertir a formato de Territory local
      const updatedList: Territory[] = parsed.map((p) => {
        const existing = territories.find((t) => t.number === p.number);
        return {
          id: existing?.id ?? `temp-${p.number}`,
          number: p.number,
          last_completed: p.last_completed,
          completed_count: p.completed_count,
          assignments: p.assignments,
        };
      });

      setTerritories(updatedList);
      showMessage('success', `¡Éxito! Se importaron ${parsed.length} territorios desde ${file.name}. Recuerda guardar los cambios.`);
    } catch (err) {
      console.error('Error al procesar archivo:', err);
      showMessage('error', 'Error al leer el archivo. Asegúrate de importar un archivo Excel (.xlsx/.xls) o CSV válido.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 2. Exportación a Excel
  const handleExport = () => {
    try {
      exportS13ToExcel(territories, `REGISTRO_S13_EDITADO_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showMessage('success', 'Archivo Excel de S-13 exportado correctamente.');
    } catch (err) {
      console.error('Error exportando Excel:', err);
      showMessage('error', 'No se pudo exportar la tabla a Excel.');
    }
  };

  // 3. Sincronización con Supabase
  const handleSyncSupabase = async () => {
    setIsSaving(true);
    try {
      const payload = territories.map((t) => ({
        number: t.number,
        last_completed: t.last_completed,
        completed_count: t.assignments?.filter((a) => a.completedDate).length ?? t.completed_count ?? 0,
        assignments: t.assignments ?? [],
      }));

      await upsertTerritoriesInSupabase(payload);
      showMessage('success', '¡Datos S-13 guardados exitosamente en la base de datos de Supabase!');
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      console.error('Error guardando en Supabase:', err);
      showMessage('error', `Error al sincronizar con Supabase: ${err.message || 'Verifica la conexión'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Toggle expansión de filas
  const toggleExpand = (tNum: number) => {
    setExpandedTerritories((prev) => ({ ...prev, [tNum]: !prev[tNum] }));
  };

  const expandAll = () => {
    const allExpanded: Record<number, boolean> = {};
    territories.forEach((t) => (allExpanded[t.number] = true));
    setExpandedTerritories(allExpanded);
  };

  const collapseAll = () => {
    setExpandedTerritories({});
  };

  // 5. Gestión de Asignaciones (Agregar, Editar, Eliminar)
  const openAddModal = (tNum: number) => {
    setModalState({
      isOpen: true,
      territoryNumber: tNum,
      assignmentIndex: null,
      name: '',
      assignedDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      completedDate: '',
    });
  };

  const openEditModal = (tNum: number, index: number, a: Assignment) => {
    setModalState({
      isOpen: true,
      territoryNumber: tNum,
      assignmentIndex: index,
      name: a.name,
      assignedDate: a.assignedDate ?? '',
      completedDate: a.completedDate ?? '',
    });
  };

  const handleSaveModal = () => {
    if (!modalState.territoryNumber || !modalState.name.trim()) return;

    setTerritories((prev) =>
      prev.map((t) => {
        if (t.number !== modalState.territoryNumber) return t;

        const updatedAssignments = [...(t.assignments ?? [])];
        const newEntry: Assignment = {
          name: modalState.name.trim(),
          assignedDate: modalState.assignedDate.trim() || null,
          completedDate: modalState.completedDate.trim() || null,
        };

        if (modalState.assignmentIndex !== null) {
          updatedAssignments[modalState.assignmentIndex] = newEntry;
        } else {
          updatedAssignments.push(newEntry);
        }

        // Calcular última fecha completada y conteo
        const completedOnly = updatedAssignments.filter((a) => a.completedDate);
        const lastCompleted = completedOnly.length > 0 
          ? completedOnly[completedOnly.length - 1].completedDate 
          : t.last_completed;

        return {
          ...t,
          last_completed: lastCompleted,
          completed_count: completedOnly.length,
          assignments: updatedAssignments,
        };
      })
    );

    setModalState({ isOpen: false, territoryNumber: null, assignmentIndex: null, name: '', assignedDate: '', completedDate: '' });
    showMessage('success', 'Registro de asignación actualizado localmente.');
  };

  const handleDeleteAssignment = (tNum: number, index: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro de asignación S-13?')) return;

    setTerritories((prev) =>
      prev.map((t) => {
        if (t.number !== tNum) return t;
        const updatedAssignments = [...(t.assignments ?? [])];
        updatedAssignments.splice(index, 1);
        
        const completedOnly = updatedAssignments.filter((a) => a.completedDate);
        return {
          ...t,
          completed_count: completedOnly.length,
          assignments: updatedAssignments,
        };
      })
    );
    showMessage('success', 'Asignación eliminada.');
  };

  // 6. Filtrado y Búsqueda
  const filteredTerritories = useMemo(() => {
    return territories.filter((t) => {
      // Determinar si tiene asignación activa (última sin fecha completada)
      const lastAssign = t.assignments && t.assignments.length > 0 ? t.assignments[t.assignments.length - 1] : null;
      const isCurrentlyAssigned = lastAssign && !lastAssign.completedDate;

      if (filterStatus === 'assigned' && !isCurrentlyAssigned) return false;
      if (filterStatus === 'available' && isCurrentlyAssigned) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchNum = `t-${t.number}`.includes(q) || String(t.number).includes(q);
      const matchAssignee = t.assignments?.some(
        (a) => a.name.toLowerCase().includes(q) || (a.assignedDate && a.assignedDate.toLowerCase().includes(q))
      );
      const matchLast = t.last_completed?.toLowerCase().includes(q);

      return matchNum || matchAssignee || matchLast;
    });
  }, [territories, searchQuery, filterStatus]);

  // Cálculos estadísticos para el encabezado
  const stats = useMemo(() => {
    let assignedCount = 0;
    let totalAssignments = 0;

    territories.forEach((t) => {
      totalAssignments += t.assignments?.length ?? 0;
      const last = t.assignments && t.assignments.length > 0 ? t.assignments[t.assignments.length - 1] : null;
      if (last && !last.completedDate) {
        assignedCount++;
      }
    });

    return {
      totalTerritories: territories.length,
      assignedTerritories: assignedCount,
      availableTerritories: Math.max(0, territories.length - assignedCount),
      totalHistoryRecords: totalAssignments,
    };
  }, [territories]);

  return (
    <div className="space-y-6">
      {/* Mensaje flotante de notificación */}
      {message && (
        <div
          className={`p-4 rounded-xl shadow-md text-sm font-bold flex items-center justify-between transition-all animate-in fade-in slide-in-from-top-4 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-60 hover:opacity-100 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Header & Acciones Principales */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center font-bold text-xl">
              📋
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Editor de Tarjetas S-13</h2>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                Carga, importa y edita el Registro de Asignación de Territorios de la congregación.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de Acción de Archivos y BD */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-2xs disabled:opacity-50"
            title="Importar desde archivo Excel o CSV S-13"
          >
            <Upload className={`w-4 h-4 text-burgundy ${isParsing ? 'animate-bounce' : ''}`} />
            <span>{isParsing ? 'Procesando...' : 'Importar S-13 (.xlsx)'}</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-2xs"
            title="Exportar archivo de Excel"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={handleSyncSupabase}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-burgundy hover:bg-burgundy-hover text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Guardando...' : 'Guardar en Supabase'}</span>
          </button>
        </div>
      </div>

      {/* Tarjetas Estadísticas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{stats.totalTerritories}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Territorios Totales</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{stats.assignedTerritories}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">En Asignación Activa</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{stats.availableTerritories}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Disponibles / Libres</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{stats.totalHistoryRecords}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Historiales Registrados</p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Expansión */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por territorio, publicador o fecha..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-burgundy focus:outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-burgundy"
          >
            <option value="all">Todos los estados</option>
            <option value="assigned">Solo en trabajo (Asignados)</option>
            <option value="available">Solo disponibles</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-semibold transition"
          >
            Expandir todo
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-semibold transition"
          >
            Colapsar todo
          </button>
        </div>
      </div>

      {/* Data Table de Territorios e Historial S-13 */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider select-none">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center"></th>
                <th className="py-3.5 px-4">Territorio</th>
                <th className="py-3.5 px-4">Estado Actual</th>
                <th className="py-3.5 px-4">Último Publicador</th>
                <th className="py-3.5 px-4">Última Fecha Completado</th>
                <th className="py-3.5 px-4 text-center">Total Completados</th>
                <th className="py-3.5 px-4 text-right">Acciones S-13</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredTerritories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-semibold">
                    No se encontraron registros de territorios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredTerritories.map((t) => {
                  const isExpanded = expandedTerritories[t.number];
                  const assignments = t.assignments ?? [];
                  const lastAssign = assignments.length > 0 ? assignments[assignments.length - 1] : null;
                  const isCurrentlyAssigned = lastAssign && !lastAssign.completedDate;

                  return (
                    <React.Fragment key={t.number}>
                      <tr className={`hover:bg-gray-50/80 transition-colors ${isExpanded ? 'bg-gray-50/50' : ''}`}>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleExpand(t.number)}
                            className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-burgundy font-bold" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-burgundy/10 text-burgundy">
                            T-{t.number}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {isCurrentlyAssigned ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-extrabold bg-amber-100 text-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              En Trabajo ({lastAssign.name})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-extrabold bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Disponible
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-bold text-gray-800">
                          {lastAssign ? lastAssign.name : <span className="text-gray-400 italic">Sin registros</span>}
                        </td>

                        <td className="py-3 px-4">
                          {t.last_completed ? (
                            <span className="inline-flex items-center gap-1 text-gray-600 font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {t.last_completed}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Nunca</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center font-extrabold text-gray-700">
                          {t.completed_count ?? assignments.filter((a) => a.completedDate).length}
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => openAddModal(t.number)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-burgundy/10 hover:bg-burgundy/20 text-burgundy font-bold rounded-lg text-xs transition"
                            title="Agregar nueva asignación a este territorio"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Asignar</span>
                          </button>
                        </td>
                      </tr>

                      {/* Fila expandida con el historial S-13 completo del territorio */}
                      {isExpanded && (
                        <tr className="bg-gray-50/80 border-b border-gray-200">
                          <td colSpan={7} className="p-4 pl-12">
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <h4 className="font-extrabold text-xs text-gray-800 flex items-center gap-2 uppercase tracking-wider">
                                  <span>Historial Tarjeta S-13 — Territorio T-{t.number}</span>
                                  <span className="text-2xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                    {assignments.length} registros
                                  </span>
                                </h4>
                                <button
                                  onClick={() => openAddModal(t.number)}
                                  className="text-xs font-bold text-burgundy hover:underline flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Nueva fila de registro
                                </button>
                              </div>

                              {assignments.length === 0 ? (
                                <p className="text-2xs text-gray-400 italic py-2">
                                  No hay asignaciones registradas aún en la tarjeta S-13 de este territorio.
                                </p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-2xs">
                                    <thead className="bg-gray-100/70 text-gray-500 font-bold uppercase">
                                      <tr>
                                        <th className="py-2 px-3">#</th>
                                        <th className="py-2 px-3">Publicador Asignado</th>
                                        <th className="py-2 px-3">Fecha Asignación</th>
                                        <th className="py-2 px-3">Fecha Devolución / Completado</th>
                                        <th className="py-2 px-3 text-right">Acciones</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-medium">
                                      {assignments.map((a, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                          <td className="py-2 px-3 font-bold text-gray-400">{idx + 1}</td>
                                          <td className="py-2 px-3 font-bold text-gray-900">{a.name}</td>
                                          <td className="py-2 px-3 text-gray-600">{a.assignedDate ?? '—'}</td>
                                          <td className="py-2 px-3">
                                            {a.completedDate ? (
                                              <span className="font-bold text-emerald-700">{a.completedDate}</span>
                                            ) : (
                                              <span className="inline-block px-2 py-0.5 rounded text-3xs font-extrabold bg-amber-100 text-amber-800">
                                                En curso (Pendiente)
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 px-3 text-right space-x-1">
                                            <button
                                              onClick={() => openEditModal(t.number, idx, a)}
                                              className="p-1 text-gray-500 hover:text-burgundy hover:bg-burgundy/10 rounded transition"
                                              title="Editar fila"
                                            >
                                              <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteAssignment(t.number, idx)}
                                              className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                              title="Eliminar fila"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Agregar/Editar Asignación S-13 */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-extrabold text-gray-900">
              {modalState.assignmentIndex !== null ? 'Editar Fila S-13' : 'Nueva Asignación S-13'} — Territorio T-
              {modalState.territoryNumber}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Publicador *</label>
                <input
                  type="text"
                  value={modalState.name}
                  onChange={(e) => setModalState({ ...modalState, name: e.target.value })}
                  placeholder="Ej: Sergio Rios"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Asignación</label>
                <input
                  type="text"
                  value={modalState.assignedDate}
                  onChange={(e) => setModalState({ ...modalState, assignedDate: e.target.value })}
                  placeholder="Ej: 19-Mar o 2026-03-19"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Devolución / Completado</label>
                <input
                  type="text"
                  value={modalState.completedDate}
                  onChange={(e) => setModalState({ ...modalState, completedDate: e.target.value })}
                  placeholder="Dejar vacío si aún está en trabajo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-burgundy focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() =>
                  setModalState({ isOpen: false, territoryNumber: null, assignmentIndex: null, name: '', assignedDate: '', completedDate: '' })
                }
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveModal}
                disabled={!modalState.name.trim()}
                className="px-4 py-2 text-xs font-bold bg-burgundy hover:bg-burgundy-hover text-white rounded-lg transition disabled:opacity-50"
              >
                Guardar Fila
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
