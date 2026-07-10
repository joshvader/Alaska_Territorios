'use client';

import React, { useState } from 'react';
import { Search, Map, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Territory } from '@/lib/territories';

interface Props {
  territories: Territory[];
}

export default function TerritoriesList({ territories }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = territories.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(t.number).includes(q) ||
      (t.last_completed ?? '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const start = (page - 1) * perPage;
  const slice = filtered.slice(start, start + perPage);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden font-sans select-none">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold text-gray-800">Territorios Registrados</h3>
          <span className="px-3 py-1 bg-burgundy-light text-burgundy text-xs font-bold rounded-full">
            {territories.length} en sistema
          </span>
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por # o fecha..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-burgundy text-white text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Territorio</th>
              <th className="px-6 py-4">Última cobertura</th>
              <th className="px-6 py-4 text-center">Completados</th>
              <th className="px-6 py-4">Capitanes asignados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150">
            {slice.length > 0 ? (
              slice.map((t, idx) => (
                <tr key={t.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/35'} hover:bg-gray-50/80 transition`}>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-extrabold text-gray-800">T-{t.number}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-burgundy-light rounded-md text-burgundy">
                        <Map className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Territorio {t.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    {t.last_completed ? (
                      <span className="text-sm font-semibold text-gray-700">{t.last_completed}</span>
                    ) : (
                      <span className="text-xs font-bold text-burgundy bg-burgundy-light px-2 py-0.5 rounded">
                        Sin registro
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-extrabold rounded-md">
                      {t.completed_count}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {(t.assignments ?? []).slice(0, 3).map((a, i) => (
                        <span key={i} className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                          {a.name}
                        </span>
                      ))}
                      {(t.assignments?.length ?? 0) > 3 && (
                        <span className="text-xs font-bold text-gray-400">
                          +{(t.assignments?.length ?? 0) - 3}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm font-semibold">
                  No se encontraron territorios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs font-semibold text-gray-500">
          {filtered.length > 0
            ? `Mostrando ${start + 1} a ${Math.min(start + perPage, filtered.length)} de ${filtered.length} territorios`
            : 'Mostrando 0 de 0 territorios'}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 border rounded-lg text-sm font-bold transition ${
                  page === p
                    ? 'bg-burgundy border-burgundy text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
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
