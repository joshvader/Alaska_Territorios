'use client';

import React from 'react';
import { Assignment } from './EditAssignmentModal';

interface Props {
  assignments?: Assignment[];
  monthTitle?: string;
}

export type MonthlyRow = {
  diaNum: number;
  diaNombre: string;
  isRedDay?: boolean; // Viernes 18 highlight
  isSabado?: boolean;
  isDomingo?: boolean;
  specialTopBanner?: string; // e.g. "Aseo general del Salon del Reino"
  left: {
    hora?: string;
    capitan?: string;
    salida?: string;
    territorios?: string;
    customText?: string;
  };
  right: {
    hora?: string;
    capitan?: string;
    salida?: string;
    territorios?: string;
    customText?: string;
  };
};

// Default 30-day layout data modeled directly from the user's reference image
export const DEFAULT_SEPTEMBER_ROWS: MonthlyRow[] = [
  {
    diaNum: 1,
    diaNombre: 'Martes 01',
    left: { hora: '10:00', capitan: 'Dionisio Castillo', salida: 'Bonaire 3844', territorios: '26' },
    right: { hora: '19:00', capitan: 'Fernando Veas', salida: 'Predicacion por Zoom', territorios: '' },
  },
  {
    diaNum: 2,
    diaNombre: 'Miercoles 02',
    left: { hora: '10:00', capitan: 'Marco Valenzuela', salida: 'Los Poemas 3847', territorios: '50, 51 y 53' },
    right: { hora: '20:00', customText: 'Reunión entre semana' },
  },
  {
    diaNum: 3,
    diaNombre: 'Jueves 03',
    left: { hora: '10:00', capitan: 'David Guajardo', salida: 'Ferrocarril 7543', territorios: '2 y 4' },
    right: { hora: '19:00', capitan: 'Cristian Espinoza', salida: 'Predicacion por Zoom', territorios: '' },
  },
  {
    diaNum: 4,
    diaNombre: 'Viernes 04',
    left: { hora: '10:00', capitan: 'Pablo Saavedra', salida: 'Primo de Rivera 1498', territorios: '47 y 55' },
    right: { hora: '19:00', capitan: 'Josué Valenzuela', salida: 'Predicacion por Zoom', territorios: '' },
  },
  {
    diaNum: 5,
    diaNombre: 'Sabado 05',
    isSabado: true,
    specialTopBanner: 'Aseo general del Salon del Reino',
    left: { hora: '10:00', capitan: 'Abner Epple', salida: 'El Pesebre 3657', territorios: '18 y 19' },
    right: { hora: '18:00', customText: 'Reunión de fin de semana' },
  },
  {
    diaNum: 6,
    diaNombre: 'Domingo 06',
    isDomingo: true,
    left: { customText: 'Arreglo por grupo de predicación' },
    right: { customText: 'Arreglo por grupo de predicación' },
  },
  {
    diaNum: 7,
    diaNombre: 'Lunes 07',
    left: { hora: '10:00', capitan: 'Max Pérez Campos', salida: 'Los Chilenos 4011', territorios: '56' },
    right: { hora: '18:00', capitan: 'Alexis Figueredo', salida: 'El Pesebre 3657', territorios: '43' },
  },
  {
    diaNum: 8,
    diaNombre: 'Martes 08',
    left: { hora: '10:00', capitan: 'Dionisio Castillo', salida: 'Bonaire 3844', territorios: '46 y 55' },
    right: { hora: '20:00', customText: 'Reunion de entre semana' },
  },
  {
    diaNum: 9,
    diaNombre: 'Miercoles 09',
    left: { hora: '10:00', capitan: 'Claudio Baeza', salida: 'Marchigue 1389', territorios: '10,12,14,15,16' },
    right: { customText: 'Revisitas y Estudios' },
  },
  {
    diaNum: 10,
    diaNombre: 'Jueves 10',
    left: { hora: '10:00', capitan: 'Claudio Baeza', salida: 'Ferrocarril 7543', territorios: '1,3,5,6 y 9' },
    right: { customText: 'Revisitas y Estudios' },
  },
  {
    diaNum: 11,
    diaNombre: 'Viernes 11',
    left: { hora: '10:00', capitan: 'Claudio Baeza', salida: 'Primo de Rivera 1498', territorios: '44,45,46,47,48' },
    right: { customText: 'Revisitas y Estudios' },
  },
  {
    diaNum: 12,
    diaNombre: 'Sabado 12',
    isSabado: true,
    left: { hora: '10:00', capitan: 'Claudio Baeza', salida: 'Moscú 4266', territorios: '59,60,62,63,64,65' },
    right: { customText: 'Arreglo por grupo de predicacion' },
  },
  {
    diaNum: 13,
    diaNombre: 'Domingo 13',
    isDomingo: true,
    left: { hora: '10:00', capitan: 'Claudio Baeza', salida: 'Primo de Rivera 1498', territorios: '28,29,30,31,32,33' },
    right: { customText: 'Arreglo por grupo de predicacion' },
  },
  {
    diaNum: 14,
    diaNombre: 'Lunes 14',
    left: { hora: '10:00', capitan: 'Max Pérez Campos', salida: 'Los Chilenos 4011', territorios: '49 y 52' },
    right: { hora: '18:00', capitan: 'Alexis Figueredo', salida: 'El Pesebre 3657', territorios: '17 y 20' },
  },
  {
    diaNum: 15,
    diaNombre: 'Martes 15',
    left: { hora: '10:00', capitan: 'Dionisio Castillo', salida: 'Bonaire 3844', territorios: '42' },
    right: { hora: '18:00', capitan: 'Fernando Veas', salida: 'Lanco 3724', territorios: '13' },
  },
  {
    diaNum: 16,
    diaNombre: 'Miercoles 16',
    left: { hora: '10:00', capitan: 'Marco Valenzuela', salida: 'Los Poemas 3847', territorios: '34, 35 y 36' },
    right: { hora: '20:00', customText: 'Reunión entre semana' },
  },
  {
    diaNum: 17,
    diaNombre: 'Jueves 17',
    left: { hora: '10:00', capitan: 'David Guajardo', salida: 'Ferrocarril 7543', territorios: '21 y 22' },
    right: { hora: '18:00', capitan: 'Misael Berrios', salida: 'Los Chilenos 4011', territorios: '41' },
  },
  {
    diaNum: 18,
    diaNombre: 'Viernes 18',
    isRedDay: true,
    left: { hora: '10:00', capitan: 'Pablo Saavedra', salida: 'Primo de Rivera 1498', territorios: '24 y 25' },
    right: { hora: '19:00', capitan: 'Josué Valenzuela', salida: 'Predicacion por Zoom', territorios: '-' },
  },
  {
    diaNum: 19,
    diaNombre: 'Sabado 19',
    isSabado: true,
    left: { customText: 'Arreglo por grupo de predicacion' },
    right: { hora: '18:00', customText: 'Reunión de fin de semana' },
  },
  {
    diaNum: 20,
    diaNombre: 'Domingo 20',
    isDomingo: true,
    left: { customText: 'Arreglo por grupo de predicacion' },
    right: { customText: 'Arreglo por grupo de predicacion' },
  },
  {
    diaNum: 21,
    diaNombre: 'Lunes 21',
    left: { hora: '10:00', capitan: 'Max Pérez Campos', salida: 'Los Chilenos 4011', territorios: '56' },
    right: { hora: '18:00', capitan: 'Alexis Figueredo', salida: 'El Pesebre 3657', territorios: '16' },
  },
  {
    diaNum: 22,
    diaNombre: 'Martes 22',
    left: { hora: '10:00', capitan: 'Dioniso Castillo', salida: 'Bonaire 3844', territorios: '27' },
    right: { hora: '18:00', capitan: 'Fernando Veas', salida: 'Lanco 3724', territorios: '15' },
  },
  {
    diaNum: 23,
    diaNombre: 'Miercoles 23',
    left: { hora: '10:00', capitan: 'Marco Valenzuela', salida: 'Marchigue 1389', territorios: '10 y 11' },
    right: { hora: '20:00', customText: 'Reunión entre semana' },
  },
  {
    diaNum: 24,
    diaNombre: 'Jueves 24',
    left: { hora: '10:00', capitan: 'David Guajardo', salida: 'Ferrocarril 7543', territorios: '7 y 8' },
    right: { hora: '18:00', capitan: 'Misael Berrios', salida: 'Los Chilenos 4011', territorios: '46' },
  },
  {
    diaNum: 25,
    diaNombre: 'Viernes 25',
    left: { hora: '10:00', capitan: 'Pablo Saavedra', salida: 'Primo de Rivera 1498', territorios: '29' },
    right: { hora: '18:00', capitan: 'Max Pérez Arjona', salida: 'Illapel 1397', territorios: '39 y 40' },
  },
  {
    diaNum: 26,
    diaNombre: 'Sabado 26',
    isSabado: true,
    left: { customText: 'Arreglo por grupo de predicacion' },
    right: { customText: 'Arreglo por grupo de predicacion' },
  },
  {
    diaNum: 27,
    diaNombre: 'Domingo 27',
    isDomingo: true,
    left: { customText: 'Arreglo por grupo de predicación' },
    right: { customText: 'Arreglo por grupo de predicacion' },
  },
  {
    diaNum: 28,
    diaNombre: 'Lunes 28',
    left: { hora: '10:00', capitan: 'Max Pérez Campos', salida: 'Los Chilenos 4011', territorios: '32' },
    right: { hora: '18:00', capitan: 'Alexis Figueredo', salida: 'El Pesebre 3657', territorios: '14' },
  },
  {
    diaNum: 29,
    diaNombre: 'Martes 29',
    left: { hora: '10:00', capitan: 'Dionisio Castillo', salida: 'Bonaire 3844', territorios: '44 y 45' },
    right: { hora: '18:00', capitan: 'Fernando Veas', salida: 'Lanco 3724', territorios: '31' },
  },
  {
    diaNum: 30,
    diaNombre: 'Miercoles 30',
    left: { hora: '10:00', capitan: 'Marco Valenzuela', salida: 'Los Poemas 3847', territorios: '37 y 38' },
    right: { hora: '20:00', customText: 'Reunión entre semana' },
  },
];

export default function MonthlyPdfTemplate({
  assignments = [],
  monthTitle = 'Septiembre de 2026',
}: Props) {
  // If assignments are passed dynamically, map them into the 30-day rows
  const rows: MonthlyRow[] = React.useMemo(() => {
    if (!assignments || assignments.length === 0) {
      return DEFAULT_SEPTEMBER_ROWS;
    }

    // Clone base rows and overwrite with dynamic assignments
    return DEFAULT_SEPTEMBER_ROWS.map((baseRow, idx) => {
      const match = assignments[idx];
      if (!match) return baseRow;

      return {
        ...baseRow,
        left: {
          ...baseRow.left,
          capitan: match.capitan || baseRow.left.capitan,
          salida: match.salida || baseRow.left.salida,
          territorios: match.territorio ? match.territorio.replace(/^T-/, '') : baseRow.left.territorios,
          hora: match.hora || baseRow.left.hora,
        },
      };
    });
  }, [assignments]);

  return (
    <div
      id="monthly-pdf-template"
      style={{
        width: '1200px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#111827',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        margin: '0 auto',
      }}
    >
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h1
          style={{
            fontSize: '20px',
            fontWeight: '800',
            letterSpacing: '-0.025em',
            color: '#111827',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Programa de Predicación Congregación Alaska
        </h1>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937', marginTop: '2px', marginBottom: 0 }}>
          {monthTitle}
        </h2>
      </div>

      {/* Main Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #000000',
          fontSize: '11px',
          textAlign: 'center',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#D9534F', color: '#ffffff', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}>
            <th style={{ border: '1px solid #000000', padding: '6px 8px', width: '9%' }}>Día</th>
            <th style={{ border: '1px solid #000000', padding: '6px 4px', width: '6%' }}>Hora</th>
            <th style={{ border: '1px solid #000000', padding: '6px 8px', width: '16%' }}>Capitan</th>
            <th style={{ border: '1px solid #000000', padding: '6px 8px', width: '17%' }}>Salida</th>
            <th style={{ border: '1px solid #000000', padding: '6px 8px', width: '10%' }}>Territorio (s)</th>

            <th style={{ border: '1px solid #000000', padding: '6px 8px', width: '9%' }}>Día</th>
            <th style={{ border: '1px solid #000000', padding: '6px 4px', width: '6%' }}>Hora</th>
            <th style={{ border: '1px solid #000000', padding: '6px 8px', width: '16%' }}>Capitan</th>
            <th style={{ border: '1px solid #000000', padding: '6px 8px', width: '17%' }}>Salida</th>
            <th style={{ border: '1px solid #000000', padding: '6px 8px', width: '10%' }}>Territorio (s)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSabado = row.isSabado;
            const isDomingo = row.isDomingo;
            const isRedDay = row.isRedDay;

            // Row styling
            let rowBgStyle: React.CSSProperties = { backgroundColor: '#ffffff', color: '#111827' };
            if (isSabado) rowBgStyle = { backgroundColor: '#E87373', color: '#ffffff', fontWeight: 'bold' };
            if (isDomingo) rowBgStyle = { backgroundColor: '#D1D5DB', color: '#1f2937', fontWeight: 'bold' };

            const cellBorderStyle: React.CSSProperties = { border: '1px solid #000000', padding: '4px 6px' };

            return (
              <React.Fragment key={row.diaNum}>
                {/* Special Top Banner (e.g. Sabado 05 Aseo General) */}
                {row.specialTopBanner && (
                  <tr style={{ backgroundColor: '#D1D5DB', color: '#111827', fontWeight: 'bold' }}>
                    <td style={cellBorderStyle} colSpan={2}></td>
                    <td style={{ ...cellBorderStyle, textAlign: 'center', fontStyle: 'italic' }} colSpan={2}>
                      {row.specialTopBanner}
                    </td>
                    <td style={cellBorderStyle} colSpan={6}></td>
                  </tr>
                )}

                <tr style={rowBgStyle}>
                  {/* Left Día */}
                  <td
                    style={{
                      ...cellBorderStyle,
                      fontWeight: 'bold',
                      color: isRedDay ? '#D9534F' : isSabado ? '#ffffff' : '#111827',
                      backgroundColor: isSabado ? '#D9534F' : undefined,
                    }}
                  >
                    {row.diaNombre}
                  </td>

                  {/* Domingo Spanning Row logic */}
                  {isDomingo ? (
                    <td
                      style={{ ...cellBorderStyle, textAlign: 'center', fontWeight: 'bold', fontStyle: 'italic', color: '#111827' }}
                      colSpan={4}
                    >
                      {row.left.customText || 'Arreglo por grupo de predicación'}
                    </td>
                  ) : row.left.customText ? (
                    <td
                      style={{ ...cellBorderStyle, textAlign: 'center', fontWeight: 'bold', fontStyle: 'italic', color: '#111827' }}
                      colSpan={4}
                    >
                      {row.left.customText}
                    </td>
                  ) : (
                    <>
                      <td style={{ ...cellBorderStyle, fontWeight: 'bold', color: '#111827' }}>{row.left.hora}</td>
                      <td style={{ ...cellBorderStyle, fontWeight: 'bold', color: '#111827' }}>
                        {row.left.capitan}
                      </td>
                      <td style={{ ...cellBorderStyle, fontWeight: 'bold', color: '#111827' }}>
                        {row.left.salida}
                      </td>
                      <td style={{ ...cellBorderStyle, fontWeight: '800', color: '#111827' }}>
                        {row.left.territorios}
                      </td>
                    </>
                  )}

                  {/* Right Día */}
                  <td
                    style={{
                      ...cellBorderStyle,
                      fontWeight: 'bold',
                      color: isRedDay ? '#D9534F' : isSabado ? '#ffffff' : '#111827',
                      backgroundColor: isSabado ? '#D9534F' : undefined,
                    }}
                  >
                    {row.diaNombre}
                  </td>

                  {/* Right Column Content */}
                  {isDomingo ? (
                    <td
                      style={{ ...cellBorderStyle, textAlign: 'center', fontWeight: 'bold', fontStyle: 'italic', color: '#111827' }}
                      colSpan={4}
                    >
                      {row.right.customText || 'Arreglo por grupo de predicación'}
                    </td>
                  ) : row.right.customText ? (
                    <td
                      style={{
                        ...cellBorderStyle,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontStyle: 'italic',
                        backgroundColor: isSabado ? '#E87373' : undefined,
                        color: isSabado ? '#ffffff' : '#111827',
                      }}
                      colSpan={4}
                    >
                      {row.right.hora && <span style={{ marginRight: '12px', fontWeight: 'normal' }}>{row.right.hora}</span>}
                      {row.right.customText}
                    </td>
                  ) : (
                    <>
                      <td style={{ ...cellBorderStyle, fontWeight: 'bold', color: '#111827' }}>{row.right.hora}</td>
                      <td style={{ ...cellBorderStyle, fontWeight: 'bold', color: '#111827' }}>
                        {row.right.capitan}
                      </td>
                      <td style={{ ...cellBorderStyle, fontWeight: 'bold', color: '#111827' }}>
                        {row.right.salida}
                      </td>
                      <td style={{ ...cellBorderStyle, fontWeight: '800', color: '#111827' }}>
                        {row.right.territorios}
                      </td>
                    </>
                  )}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Footer Banner Quote */}
      <div
        style={{
          marginTop: '16px',
          backgroundColor: '#D9534F',
          color: '#ffffff',
          textAlign: 'center',
          padding: '8px 16px',
          border: '1px solid #000000',
        }}
      >
        <p style={{ fontSize: '13px', fontWeight: 'bold', fontStyle: 'italic', margin: 0 }}>
          &quot;Denle a Jehova la gloria que su nombre merece&quot; (Salmo 96:8).
        </p>
      </div>
    </div>
  );
}
