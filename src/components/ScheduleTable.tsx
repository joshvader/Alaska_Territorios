'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Assignment } from './EditAssignmentModal';

interface TableProps {
  assignments: Assignment[];
  onEditClick: (assignment: Assignment) => void;
}

export default function ScheduleTable({ assignments, onEditClick }: TableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter list
  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch = item.capitan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = dayFilter === 'All' || item.dia.toLowerCase().includes(dayFilter.toLowerCase());
    return matchesSearch && matchesDay;
  });

  // Pagination calculation
  const totalEntries = filteredAssignments.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const currentItems = filteredAssignments.slice(startIndex, endIndex);

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Helper to color initials dynamically based on capitan
  const getAvatarBg = (name: string) => {
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-slate-700 text-white',
      'bg-emerald-700 text-white',
      'bg-blue-700 text-white',
      'bg-orange-700 text-white',
      'bg-violet-700 text-white',
      'bg-indigo-700 text-white',
    ];
    return colors[sum % colors.length];
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden font-sans select-none" id="schedule-table-section">
      {/* Top filter section */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title and Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold text-gray-800">Programación Semanal</h3>
          <span className="px-3 py-1 bg-burgundy-light text-burgundy text-xs font-bold rounded-full">
            Semana 14-20 Oct
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">
            Activo
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Filtrar por capitán..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-56 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
            />
          </div>

          {/* Day dropdown */}
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
              <option value="Lunes">Lunes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-burgundy text-white text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Día</th>
              <th className="px-6 py-4">Hora</th>
              <th className="px-6 py-4">Capitán</th>
              <th className="px-6 py-4">Salida</th>
              <th className="px-6 py-4">Territorio</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150">
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/35'} hover:bg-gray-50/80 transition-all duration-150`}>
                  {/* Dia */}
                  <td className="px-6 py-4.5">
                    <span className="text-sm font-bold text-gray-800">{item.dia}</span>
                  </td>
                  {/* Hora */}
                  <td className="px-6 py-4.5">
                    <span className="text-sm font-medium text-gray-700">{item.hora}</span>
                  </td>
                  {/* Capitan */}
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm ${getAvatarBg(item.capitan)}`}>
                        {getInitials(item.capitan)}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{item.capitan}</span>
                    </div>
                  </td>
                  {/* Salida */}
                  <td className="px-6 py-4.5">
                    <span className="text-sm font-medium text-gray-600">{item.salida}</span>
                  </td>
                  {/* Territorio Badge */}
                  <td className="px-6 py-4.5">
                    <span className="px-3 py-1 bg-burgundy-light border border-burgundy/10 text-burgundy text-xs font-bold rounded-md">
                      {item.territorio} ({item.territorioTipo})
                    </span>
                  </td>
                  {/* Acciones */}
                  <td className="px-6 py-4.5 text-center">
                    <button
                      onClick={() => onEditClick(item)}
                      className="p-2 text-gray-400 hover:text-burgundy hover:bg-burgundy-light rounded-lg transition-all"
                      title="Editar asignación"
                    >
                      <Edit3 className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm font-semibold">
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="px-6 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Count */}
        <p className="text-xs font-semibold text-gray-500">
          {totalEntries > 0 
            ? `Mostrando ${startIndex + 1} a ${endIndex} de ${totalEntries} entradas semanales`
            : 'Mostrando 0 de 0 entradas semanales'
          }
        </p>

        {/* Buttons */}
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
  );
}
