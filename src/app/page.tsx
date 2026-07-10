'use client';

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsSection from '@/components/StatsSection';
import ScheduleTable from '@/components/ScheduleTable';
import EditAssignmentModal, { Assignment } from '@/components/EditAssignmentModal';
import Login from '@/components/Login';
import { createClient } from '@/lib/supabase/client';
import type { AppUser } from '@/lib/supabase/types';
import { SlidersHorizontal, FileDown } from 'lucide-react';

const initialAssignments: Assignment[] = [
  { id: '1', dia: 'Lunes 14', hora: '09:30 AM', capitan: 'Juan Rodriguez', salida: 'Parque Central', territorio: 'T-182', territorioTipo: 'Zona Norte' },
  { id: '2', dia: 'Miércoles 16', hora: '16:00 PM', capitan: 'Mateo Lopez', salida: 'Calle 45 esq. 10', territorio: 'T-045', territorioTipo: 'Comercial' },
  { id: '3', dia: 'Viernes 18', hora: '09:30 AM', capitan: 'Carlos Perez', salida: 'Estación Metro Sur', territorio: 'T-210', territorioTipo: 'Residencial' },
  { id: '4', dia: 'Sábado 19', hora: '09:00 AM', capitan: 'David Garcia', salida: 'Centro Cultural', territorio: 'T-089', territorioTipo: 'Casco Viejo' },
  { id: '5', dia: 'Domingo 20', hora: '10:30 AM', capitan: 'Samuel Mendez', salida: 'Plaza de la Libertad', territorio: 'T-115', territorioTipo: 'Periferia' },
  { id: '6', dia: 'Lunes 14', hora: '10:30 AM', capitan: 'Laura Gomez', salida: 'Terminal de Buses', territorio: 'T-023', territorioTipo: 'Zona Este' },
  { id: '7', dia: 'Miércoles 16', hora: '09:30 AM', capitan: 'Andres Torres', salida: 'Plaza Italia', territorio: 'T-154', territorioTipo: 'Residencial' },
  { id: '8', dia: 'Viernes 18', hora: '16:00 PM', capitan: 'Sofia Hernandez', salida: 'Parque de las Flores', territorio: 'T-202', territorioTipo: 'Industrial' },
  { id: '9', dia: 'Sábado 19', hora: '10:30 AM', capitan: 'Manuel Silva', salida: 'Calle del Sol', territorio: 'T-078', territorioTipo: 'Zona Sur' },
  { id: '10', dia: 'Domingo 20', hora: '08:00 AM', capitan: 'Gabriel Ruiz', salida: 'Iglesia Central', territorio: 'T-012', territorioTipo: 'Comercial' },
  { id: '11', dia: 'Lunes 14', hora: '16:00 PM', capitan: 'Elena Diaz', salida: 'Paseo del Prado', territorio: 'T-110', territorioTipo: 'Zona Oeste' },
  { id: '12', dia: 'Miércoles 16', hora: '11:00 AM', capitan: 'Pedro Morales', salida: 'Avenida Bolivar', territorio: 'T-099', territorioTipo: 'Residencial' },
];

export default function Page() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // PDF Exporting State
  const [isExporting, setIsExporting] = useState(false);

  const supabase = createClient();

  // Verificar sesión de Supabase al montar y suscribirse a cambios
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? null });
      }
      setIsCheckingAuth(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? null });
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLoginSuccess = () => {
    // El estado de user se actualizará automáticamente vía onAuthStateChange
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Calculate dynamic stats
  const totalAssignments = assignments.length;
  const activeTerritories = Array.from(new Set(assignments.map(a => a.territorio))).length;
  const pendingCount = totalAssignments - activeTerritories > 0 ? totalAssignments - activeTerritories : 5;

  const handleEditClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleSaveAssignment = (updatedAssignment: Assignment) => {
    setAssignments((prev) =>
      prev.map((item) => (item.id === updatedAssignment.id ? updatedAssignment : item))
    );
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;

    setIsExporting(true);
    
    // Add brief timeout to allow DOM/state updates
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(element, {
          scale: 2, // Retain high resolution quality
          useCORS: true,
          logging: false,
          backgroundColor: '#f4f5f6',
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width
        const pageHeight = 297; // A4 height
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('Programa_de_Predicacion_Territorios.pdf');
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
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header userEmail={user.email} />

        {/* Content Body */}
        {activeTab === 'dashboard' ? (
          <main className="flex-1 p-8 space-y-8 overflow-y-auto" id="dashboard-content">
            {/* Top Section / Title and Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Programa de Predicación</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">
                  Gestión centralizada de salidas y asignaciones de territorios.
                </p>
              </div>

              {/* Action Buttons */}
              <div className={`flex items-center gap-3 self-end md:self-auto transition-all ${isExporting ? 'opacity-0 pointer-events-none' : ''}`}>
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

            {/* Stats Cards Section */}
            <StatsSection
              salidasHoy={12}
              territoriosActivos={activeTerritories}
              asistenciaProm={124}
              pendientes={pendingCount}
            />

            {/* Interactive Schedule Table */}
            <ScheduleTable 
              assignments={assignments} 
              onEditClick={handleEditClick} 
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

      {/* Edit Assignment Modal */}
      <EditAssignmentModal
        isOpen={isModalOpen}
        assignment={selectedAssignment}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAssignment(null);
        }}
        onSave={handleSaveAssignment}
      />
    </div>
  );
}
