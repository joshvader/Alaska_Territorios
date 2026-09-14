'use client';

import React, { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Search, ChevronDown, Edit3, ChevronLeft, ChevronRight, MapPinned, Loader2, FileDown } from 'lucide-react';
import EditAssignmentModal, { Assignment } from './EditAssignmentModal';
import {
  type Territory,
  type Programacion,
  DEFAULT_TIMES,
  DEFAULT_SALIDAS,
  DEFAULT_TERRITORY_TYPES,
  derivarCapitanDeTerritorio,
  insertProgramaciones,
  updateProgramacion,
} from '@/lib/territories';

interface Props {
  territories: Territory[];
  programaciones: Programacion[];
  onReload: () => void;
}

const programacionToAssignment = (p: Programacion): Assignment => ({
  id: p.id,
  dia: p.dia,
  hora: p.hora,
  capitan: p.capitan,
  salida: p.salida ?? '',
  territorio: `T-${p.territory_number}`,
  territorioTipo: p.territorio_tipo ?? '',
});

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const AVATAR_COLORS = [
  'bg-slate-700 text-white',
  'bg-emerald-700 text-white',
  'bg-blue-700 text-white',
  'bg-orange-700 text-white',
  'bg-violet-700 text-white',
  'bg-indigo-700 text-white',
];

const getAvatarBg = (name: string) => {
  const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

export default function PreachingProgramEditor({ territories, programaciones, onReload }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const itemsPerPage = 10;

  const rows = useMemo(
    () =>
      [...programaciones].sort((a, b) =>
        a.territory_number !== b.territory_number
          ? a.territory_number - b.territory_number
          : a.dia.localeCompare(b.dia)
      ),
    [programaciones]
  );

  const territoriosCubiertos = new Set(rows.map((r) => r.territory_number));
  const pendientes = territories.filter((t) => !territoriosCubiertos.has(t.number));

  const filtered = useMemo(
    () =>
      rows.filter((item) => {
        const capitan = item.capitan.toLowerCase();
        const territorio = `t-${item.territory_number}`;
        const matchesSearch =
          capitan.includes(searchTerm.toLowerCase()) || territorio.includes(searchTerm.toLowerCase());
        const matchesDay = dayFilter === 'All' || item.dia.toLowerCase().includes(dayFilter.toLowerCase());
        return matchesSearch && matchesDay;
      }),
    [rows, searchTerm, dayFilter]
  );

  const totalEntries = filtered.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const currentItems = filtered.slice(startIndex, endIndex);

  const handleEditClick = (p: Programacion) => {
    setSelected(programacionToAssignment(p));
    setIsModalOpen(true);
  };

  const handleSave = async (updated: Assignment) => {
    const territoryNumber = Number(updated.territorio.replace(/^T-/, '')) || 0;
    try {
      await updateProgramacion(updated.id, {
        dia: updated.dia,
        hora: updated.hora,
        capitan: updated.capitan,
        salida: updated.salida,
        territorio_tipo: updated.territorioTipo,
        territory_number: territoryNumber,
      });
      await onReload();
    } catch (err) {
      console.error('Error actualizando salida:', err);
      setInfo('No se pudo guardar la salida. Revisa tu conexión.');
    }
  };

  const handleGenerate = async () => {
    if (pendientes.length === 0) return;
    setIsGenerating(true);
    setInfo(null);
    try {
      // El capitán viene fijo de la tarjeta S-13 (punto fijo): no se asigna al azar.
      const newRows = pendientes.map((t, idx) => ({
        territory_number: t.number,
        dia: `Día ${String(idx + 1).padStart(2, '0')}`,
        hora: DEFAULT_TIMES[idx % DEFAULT_TIMES.length],
        capitan: derivarCapitanDeTerritorio(t),
        salida: DEFAULT_SALIDAS[idx % DEFAULT_SALIDAS.length],
        territorio_tipo: DEFAULT_TERRITORY_TYPES[idx % DEFAULT_TERRITORY_TYPES.length],
      }));
      await insertProgramaciones(newRows);
      await onReload();
      setInfo(`${newRows.length} salidas generadas desde S-13. Edita día, hora y salida según convenga.`);
    } catch (err) {
      console.error('Error generando salidas:', err);
      setInfo('No se pudieron generar las salidas. Revisa tu conexión.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (rows.length === 0) return;
    setIsExporting(true);
    setTimeout(() => {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 14;
        const bottomLimit = pageHeight - margin;
        const rowH = 8;
        const colX = [margin, margin + 27, margin + 47, margin + 95, margin + 152];
        const headers = ['Día', 'Hora', 'Capitán', 'Salida', 'Territorio'];

        pdf.setTextColor(139, 38, 53);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text('Programa de Predicación', pageWidth / 2, margin, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(90, 90, 90);
        const fecha = new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        pdf.text(`Generado el ${fecha}`, pageWidth / 2, margin + 6, { align: 'center' });

        let y = margin + 14;
        const drawHeaderRow = () => {
          pdf.setFillColor(139, 38, 53);
          pdf.rect(margin, y, pageWidth - margin * 2, rowH, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          headers.forEach((h, i) => pdf.text(h, colX[i] + 2, y + 5.5));
          y += rowH;
        };

        drawHeaderRow();
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        rows.forEach((item, idx) => {
          if (y + rowH > bottomLimit) {
            pdf.addPage();
            y = margin;
            drawHeaderRow();
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
          }
          const shade = idx % 2 === 1 ? '244, 244, 245' : '255, 255, 255';
          pdf.setFillColor(...(shade.split(',').map(Number) as [number, number, number]));
          pdf.rect(margin, y, pageWidth - margin * 2, rowH, 'F');
          pdf.setTextColor(40, 40, 40);
          const territorio = `T-${item.territory_number}${item.territorio_tipo ? ` (${item.territorio_tipo})` : ''}`;
          const values = [item.dia, item.hora, item.capitan, item.salida ?? '—', territorio];
          values.forEach((v, i) => pdf.text(v, colX[i] + 2, y + 5.5));
          y += rowH;
        });

        pdf.save('Programa_de_Predicacion.pdf');
      } catch (error) {
        console.error('Error generando PDF del programa:', error);
        setInfo('No se pudo exportar el PDF. Intenta nuevamente.');
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  return (
    <div className="space-y-6 font-sans select-none">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-burgundy-light text-burgundy flex items-center justify-center">
            <MapPinned className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Programa de Predicación</h2>
            <p className="text-sm font-semibold text-gray-500 mt-1">
              Un capitán fijo por territorio, tomado de las tarjetas S-13.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleExportPDF}
            disabled={isExporting || rows.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-250 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-xs disabled:opacity-55"
            title={rows.length === 0 ? 'Aún no hay salidas para exportar' : 'Exportar el programa a PDF'}
          >
            <FileDown className="w-4 h-4 text-gray-500" />
            <span>{isExporting ? 'Exportando...' : 'Exportar a PDF'}</span>
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || pendientes.length === 0 || territories.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy hover:bg-burgundy-hover text-white rounded-lg text-sm font-bold shadow-md transition disabled:opacity-55 self-start md:self-auto"
          title={
            pendientes.length === 0
              ? 'Todos los territorios ya tienen salida programada'
              : `Generar ${pendientes.length} salidas faltantes`
          }
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPinned className="w-4 h-4" />}
          <span>{isGenerating ? 'Generando...' : `Generar faltantes (${pendientes.length})`}</span>
          </button>
        </div>
      </div>

      {info && (
        <div className="px-4 py-3 bg-burgundy-light/60 border border-burgundy/15 text-burgundy rounded-xl text-sm font-semibold">
          {info}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Territorios S-13</p>
          <p className="text-2xl font-extrabold text-gray-800 mt-1">{territories.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Salidas programadas</p>
          <p className="text-2xl font-extrabold text-gray-800 mt-1">{rows.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sin salida</p>
          <p className={`text-2xl font-extrabold mt-1 ${pendientes.length > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
            {pendientes.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-800">Salidas programadas</h3>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Filtrar por capitán o territorio..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-56 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
              />
            </div>

            <div className="relative">
              <select
                value={dayFilter}
                onChange={(e) => {
                  setDayFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition cursor-pointer"
              >
                <option value="All">Todos los días</option>
                {['Lunes', 'Miércoles', 'Viernes', 'Sábado', 'Domingo'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-burgundy text-white text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Día</th>
                <th className="px-6 py-4">Hora</th>
                <th className="px-6 py-4">Capitán (S-13)</th>
                <th className="px-6 py-4">Salida</th>
                <th className="px-6 py-4">Territorio</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/35'} hover:bg-gray-50/80 transition-all duration-150`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-800">{item.dia}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">{item.hora}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm ${getAvatarBg(item.capitan)}`}
                        >
                          {getInitials(item.capitan)}
                        </div>
                        <span className="text-sm font-bold text-gray-800">{item.capitan}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-600">{item.salida ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-burgundy-light border border-burgundy/10 text-burgundy text-xs font-bold rounded-md">
                        T-{item.territory_number}
                        {item.territorio_tipo ? ` (${item.territorio_tipo})` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-2 text-gray-400 hover:text-burgundy hover:bg-burgundy-light rounded-lg transition-all"
                        title="Editar salida"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm font-semibold">
                    {rows.length === 0
                      ? 'Aún no hay salidas. Usa "Generar faltantes" para crearlas a partir de S-13.'
                      : 'No se encontraron registros con ese filtro.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs font-semibold text-gray-500">
            {totalEntries > 0
              ? `Mostrando ${startIndex + 1} a ${endIndex} de ${totalEntries} salidas`
              : 'Mostrando 0 de 0 salidas'}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 border rounded-lg text-sm font-bold transition ${
                    currentPage === page
                      ? 'bg-burgundy border-burgundy text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <EditAssignmentModal
        isOpen={isModalOpen}
        assignment={selected}
        onClose={() => {
          setIsModalOpen(false);
          setSelected(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}