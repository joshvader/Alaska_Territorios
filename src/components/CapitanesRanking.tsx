'use client';

import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface Capitan {
  name: string;
  count: number;
}

interface Props {
  ranking: Capitan[];
  limit?: number;
}

export default function CapitanesRanking({ ranking, limit = 10 }: Props) {
  const max = Math.max(...ranking.map((r) => r.count), 1);
  const top = ranking.slice(0, limit);

  const podiumIcon = (i: number) => {
    if (i === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (i === 1) return <Medal className="w-4 h-4 text-gray-400" />;
    if (i === 2) return <Award className="w-4 h-4 text-amber-600" />;
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 font-sans select-none">
      <div className="flex items-center gap-2 mb-5">
        <Trophy className="w-5 h-5 text-burgundy" />
        <h3 className="text-lg font-bold text-gray-800">Ranking de Capitanes</h3>
        <span className="ml-auto text-xs font-semibold text-gray-500">
          Por territorios completados
        </span>
      </div>

      <div className="space-y-3">
        {top.length === 0 ? (
          <p className="text-sm font-semibold text-gray-400 text-center py-6">
            Sin datos de capitanes todavía.
          </p>
        ) : (
          top.map((c, i) => {
            const pct = (c.count / max) * 100;
            return (
              <div key={c.name + i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-extrabold text-gray-600">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800 truncate">{c.name}</span>
                    {podiumIcon(i)}
                  </div>
                  <div className="mt-1 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-burgundy rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-extrabold text-burgundy w-8 text-right">
                  {c.count}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
