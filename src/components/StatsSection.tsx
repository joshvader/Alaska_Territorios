'use client';

import React from 'react';
import { Calendar, Map, Users, AlertCircle } from 'lucide-react';

interface StatsProps {
  salidasHoy: number;
  territoriosActivos: number;
  asistenciaProm: number;
  pendientes: number;
}

export default function StatsSection({
  salidasHoy,
  territoriosActivos,
  asistenciaProm,
  pendientes,
}: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
      {/* Salidas Hoy */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start transition-all duration-200 hover:shadow-md">
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">Salidas Hoy</p>
          <p className="text-4xl font-extrabold text-foreground">{salidasHoy.toString().padStart(2, '0')}</p>
          <p className="text-xs font-bold text-green-600 flex items-center gap-1">
            <span>+2 vs Ayer</span>
          </p>
        </div>
        <div className="p-3 bg-burgundy-light rounded-xl text-burgundy">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {/* Territorios Activos */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start transition-all duration-200 hover:shadow-md">
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">Territorios Activos</p>
          <p className="text-4xl font-extrabold text-foreground">{territoriosActivos.toString().padStart(2, '0')}</p>
          <p className="text-xs font-semibold text-gray-500">85% Cobertura</p>
        </div>
        <div className="p-3 bg-gray-100 rounded-xl text-gray-500">
          <Map className="w-6 h-6" />
        </div>
      </div>

      {/* Asistencia Prom. */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start transition-all duration-200 hover:shadow-md">
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">Asistencia Prom.</p>
          <p className="text-4xl font-extrabold text-foreground">{asistenciaProm}</p>
          <p className="text-xs font-semibold text-gray-500">Semana Actual</p>
        </div>
        <div className="p-3 bg-gray-100 rounded-xl text-gray-500">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Pendientes */}
      <div className="bg-burgundy p-6 rounded-2xl border border-burgundy shadow-md flex justify-between items-start transition-all duration-200 hover:shadow-lg text-white">
        <div className="space-y-2">
          <p className="text-xs font-bold text-burgundy-light/75 tracking-wider uppercase">Pendientes</p>
          <p className="text-4xl font-extrabold">{pendientes.toString().padStart(2, '0')}</p>
        </div>
        <div className="p-3 bg-white/10 rounded-xl text-white">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
