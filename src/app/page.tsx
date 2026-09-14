'use client';

import React, { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsSection from '@/components/StatsSection';
import ScheduleTable from '@/components/ScheduleTable';
import EditAssignmentModal, { Assignment } from '@/components/EditAssignmentModal';
import Login from '@/components/Login';
import TerritoriesList from '@/components/TerritoriesList';
import CapitanesRanking from '@/components/CapitanesRanking';
import ScheduleGenerator from '@/components/ScheduleGenerator';
import PreachingProgramEditor from '@/components/PreachingProgramEditor';
import MonthlyPdfTemplate from '@/components/MonthlyPdfTemplate';
import S13Editor from '@/components/S13Editor';
import { createClient } from '@/lib/supabase/client';
import type { AppUser } from '@/lib/supabase/types';
import {
  fetchTerritories,
  fetchProgramaciones,
  insertProgramaciones,
  updateProgramacion,
  buildCapitanRanking,
  generateWeeklyProgram,
  type Territory,
  type Programacion,
} from '@/lib/territories';
import { SlidersHorizontal, FileDown, RefreshCw } from 'lucide-react';

const programacionToAssignment = (p: Programacion): Assignment => ({
  id: p.id,
  dia: p.dia,
  hora: p.hora,
  capitan: p.capitan,
  salida: p.salida ?? '',
  territorio: `T-${p.territory_number}`,
  territorioTipo: p.territorio_tipo ?? '',
});

export default function Page() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // PDF Exporting State
  const [isExporting, setIsExporting] = useState(false);
  // Loading state for territories/programaciones
  const [isLoadingData, setIsLoadingData] = useState(false);

  const supabase = createClient();

  // Verificar sesión de Supabase al montar y suscribirse a cambios
  useEffect(() => {
    let mounted = true;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const finishLoading = () => {
      if (mounted) setIsCheckingAuth(false);
    };

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!mounted) return;
        if (error) {
          console.warn('[auth] getUser() devolvió error:', error.message);
        } else if (data.user) {
          setUser({ id: data.user.id, email: data.user.email ?? null });
        }
      } catch (err) {
        console.error('[auth] Excepción verificando sesión:', err);
      } finally {
        finishLoading();
      }
    };

    init();

    // Timeout de seguridad: si Supabase no responde, no dejar la app colgada.
    safetyTimer = setTimeout(() => {
      if (mounted) {
        console.warn('[auth] Timeout verificando sesión, mostrando login.');
        setIsCheckingAuth(false);
      }
    }, 3000);

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? null });
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      if (safetyTimer) clearTimeout(safetyTimer);
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // Cargar territories y programaciones
  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [t, p] = await Promise.all([fetchTerritories(), fetchProgramaciones()]);
      setTerritories(t);
      setProgramaciones(p);
      setAssignments(p.map(programacionToAssignment));
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const handleLoginSuccess = () => {};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAssignments([]);
    setTerritories([]);
  };

  const ranking = buildCapitanRanking(territories);

  // Calculate dynamic stats
  const activeTerritories = assignments.length > 0
    ? new Set(assignments.map((a) => a.territorio)).size
    : territories.length;
  const pendientes = Math.max(0, territories.length - activeTerritories);

  const handleEditClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleSaveAssignment = async (updated: Assignment) => {
    // Actualización optimista
    setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    try {
      const territoryNumber = Number(updated.territorio.replace(/^T-/, '')) || 0;
      await updateProgramacion(updated.id, {
        dia: updated.dia,
        hora: updated.hora,
        capitan: updated.capitan,
        salida: updated.salida,
        territorio_tipo: updated.territorioTipo,
        territory_number: territoryNumber,
      });
    } catch (err) {
      console.error('Error actualizando programación:', err);
      // Revertir recargando
      loadData();
    }
  };

  const handleGenerateProgram = async (
    rows: ReturnType<typeof generateWeeklyProgram>
  ) => {
    if (rows.length === 0) return;
    try {
      await insertProgramaciones(rows);
      await loadData();
    } catch (err) {
      console.error('Error generando programa:', err);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('monthly-pdf-template');
    if (!element) return;

    setIsExporting(true);

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1250,
          width: 1200,
          onclone: (clonedDoc) => {
            // Reemplazar funciones de color lab() u oklch() no soportadas por html2canvas
            const styleElements = clonedDoc.querySelectorAll('style');
            styleElements.forEach((styleEl) => {
              if (styleEl.textContent) {
                styleEl.textContent = styleEl.textContent
                  .replace(/lab\([^)]+\)/g, '#111827')
                  .replace(/oklch\([^)]+\)/g, '#111827');
              }
            });
          },
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));

        pdf.save('Programa_de_Predicacion_Septiembre_2026.pdf');
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans">
        <span className="w-10 h-10 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-500 mt-4 tracking-wide">Cargando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header userEmail={user.email} />

        {activeTab === 'dashboard' ? (
          <main className="flex-1 p-8 space-y-8 overflow-y-auto" id="dashboard-content">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Programa de Predicación</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">
                  Gestión centralizada de salidas y asignaciones de territorios.
                </p>
              </div>

              <div className={`flex items-center gap-3 self-end md:self-auto transition-all ${isExporting ? 'opacity-0 pointer-events-none' : ''}`}>
                <button
                  onClick={loadData}
                  disabled={isLoadingData}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-250 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-xs disabled:opacity-55"
                  title="Recargar datos"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoadingData ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
                <button 
                  onClick={() => alert('Filtros avanzados en desarrollo')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-250 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-xs"
                >
                  <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                  <span>Filtros Avanzados</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-burgundy hover:bg-burgundy-hover text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-55 transition"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isExporting ? 'Exportando...' : 'Exportar a PDF'}</span>
                </button>
              </div>
            </div>

            <StatsSection
              salidasHoy={assignments.length}
              territoriosActivos={activeTerritories}
              asistenciaProm={ranking.length}
              pendientes={pendientes}
            />

            <ScheduleGenerator
              territories={territories}
              ranking={ranking}
              onGenerate={handleGenerateProgram}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <ScheduleTable
                  assignments={assignments}
                  onEditClick={handleEditClick}
                />
              </div>
              <div className="xl:col-span-1">
                <CapitanesRanking ranking={ranking} />
              </div>
            </div>

            <TerritoriesList territories={territories} />
          </main>
        ) : activeTab === 'datatables' ? (
          <main className="flex-1 p-8 overflow-y-auto">
            <S13Editor initialTerritories={territories} onRefreshData={loadData} />
          </main>
        ) : activeTab === 'programa' ? (
          <main className="flex-1 p-8 overflow-y-auto">
            <PreachingProgramEditor
              territories={territories}
              programaciones={programaciones}
              onReload={loadData}
            />
          </main>
        ) : (
          <main className="flex-1 p-8 flex flex-col items-center justify-center text-center font-sans">
            <div className="max-w-md space-y-4">
              <div className="w-16 h-16 rounded-full bg-burgundy-light text-burgundy flex items-center justify-center text-2xl font-bold mx-auto">
                ⚙️
              </div>
              <h3 className="text-xl font-extrabold text-gray-800 capitalize">Sección: {activeTab}</h3>
              <p className="text-sm text-gray-500 font-semibold">
                Esta sección está actualmente en desarrollo y se conectará con la Base de Datos en la siguiente etapa del proyecto.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-burgundy text-white text-xs font-bold rounded-lg hover:bg-burgundy-hover transition shadow-sm"
              >
                Volver al Dashboard
              </button>
            </div>
          </main>
        )}
      </div>

      <EditAssignmentModal
        isOpen={isModalOpen}
        assignment={selectedAssignment}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAssignment(null);
        }}
        onSave={handleSaveAssignment}
      />

      {/* Template oculto para la generación limpia de PDF de 30 días */}
      <div style={{ position: 'fixed', left: '-9999px', top: '0', pointerEvents: 'none' }}>
        <MonthlyPdfTemplate assignments={assignments} />
      </div>
    </div>
  );
}
