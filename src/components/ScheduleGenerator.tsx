'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Calendar } from 'lucide-react';
import { generateWeeklyProgram, type Territory } from '@/lib/territories';

interface Props {
  territories: Territory[];
  ranking: { name: string; count: number }[];
  onGenerate: (rows: ReturnType<typeof generateWeeklyProgram>) => Promise<void> | void;
  daysCount?: number;
}

export default function ScheduleGenerator({ territories, ranking, onGenerate, daysCount = 5 }: Props) {
  const [days, setDays] = useState(daysCount);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<ReturnType<typeof generateWeeklyProgram> | null>(null);

  const handlePreview = () => {
    setPreview(generateWeeklyProgram(territories, ranking, days));
  };

  const handleGenerate = async () => {
    const rows = preview ?? generateWeeklyProgram(territories, ranking, days);
    setIsLoading(true);
    try {
      await onGenerate(rows);
      setPreview(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 font-sans select-none">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-burgundy" />
        <h3 className="text-lg font-bold text-gray-800">Generador de Programa Semanal</h3>
      </div>
      <p className="text-xs font-semibold text-gray-500 mb-4">
        Asigna automáticamente los territorios con cobertura más antigua a los capitanes con menor
        cantidad de territorios completados. Luego puedes editar antes de exportar a PDF.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Salidas a generar
        </label>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy cursor-pointer"
        >
          {[3, 5, 7].map((n) => (
            <option key={n} value={n}>
              {n} días
            </option>
          ))}
        </select>

        <button
          onClick={handlePreview}
          className="ml-auto px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
        >
          Vista previa
        </button>

        <button
          onClick={handleGenerate}
          disabled={isLoading || territories.length === 0 || ranking.length === 0}
          className="px-4 py-2 bg-burgundy hover:bg-burgundy-hover text-white rounded-lg text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-55"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calendar className="w-4 h-4" />
          )}
          Generar y guardar
        </button>
      </div>

      {preview && preview.length > 0 && (
        <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2">Día</th>
                <th className="px-3 py-2">Hora</th>
                <th className="px-3 py-2">Territorio</th>
                <th className="px-3 py-2">Capitán</th>
                <th className="px-3 py-2">Salida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {preview.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-bold text-gray-800">{r.dia}</td>
                  <td className="px-3 py-2 font-semibold text-gray-700">{r.hora}</td>
                  <td className="px-3 py-2 font-bold text-burgundy">T-{r.territory_number}</td>
                  <td className="px-3 py-2 font-semibold text-gray-700">{r.capitan}</td>
                  <td className="px-3 py-2 text-gray-600">{r.salida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
