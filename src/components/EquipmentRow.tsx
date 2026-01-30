import React from 'react';
import { Equipment } from '../types';
import { Check, X } from 'lucide-react';
import { clsx } from 'clsx';

interface EquipmentRowProps {
  equipment: Equipment;
  onChange: (id: string, field: keyof Equipment | string, value: any) => void;
  isLast?: boolean;
}

export const EquipmentRow: React.FC<EquipmentRowProps> = ({ equipment, onChange, isLast }) => {
  const handleChange = (field: string, value: any) => {
    onChange(equipment.id, field, value);
  };

  const renderNumberInput = (value: number | null, fieldPath: string) => (
    <input
      type="number"
      step="0.1"
      className="w-full h-full bg-transparent text-center focus:outline-none focus:bg-white/50"
      value={value ?? ''}
      onChange={(e) => handleChange(fieldPath, e.target.value === '' ? null : parseFloat(e.target.value))}
    />
  );

  return (
    <tr className={clsx("text-sm border-b border-gray-300", isLast ? "" : "border-b")}>
      {/* Frota */}
      <td className={clsx("border-r border-gray-400 font-bold text-center", 
        equipment.status === 'issue' ? 'bg-red-500 text-white' : 'bg-cambui-header text-white')}>
        {equipment.frota}
      </td>

      {/* Turno A */}
      <td className="border-r border-gray-300 bg-white">
        {renderNumberInput(equipment.shiftA.initial, 'shiftA.initial')}
      </td>
      <td className="border-r border-gray-300 bg-white">
        {renderNumberInput(equipment.shiftA.final, 'shiftA.final')}
      </td>
      <td className="border-r border-gray-400 bg-gray-200 font-bold text-center">
        {equipment.shiftA.worked.toFixed(1)}
      </td>

      {/* Turno B */}
      <td className="border-r border-gray-300 bg-white">
        {renderNumberInput(equipment.shiftB.initial, 'shiftB.initial')}
      </td>
      <td className="border-r border-gray-300 bg-white">
        {renderNumberInput(equipment.shiftB.final, 'shiftB.final')}
      </td>
      <td className="border-r border-gray-400 bg-gray-200 font-bold text-center">
        {equipment.shiftB.worked.toFixed(1)}
      </td>

      {/* Total A-B */}
      <td className="border-r border-gray-400 bg-gray-200 font-bold text-center">
        {equipment.totalAB.toFixed(1)}
      </td>

      {/* Status */}
      <td className="border-r border-gray-400 text-center cursor-pointer"
          onClick={() => handleChange('status', equipment.status === 'ok' ? 'issue' : 'ok')}>
        <div className={clsx("flex items-center justify-center h-full w-full", 
          equipment.status === 'ok' ? 'text-green-600' : 'bg-red-600 text-white')}>
          {equipment.status === 'ok' ? <Check size={16} /> : <X size={16} />}
        </div>
      </td>

      {/* Obs */}
      <td className={clsx("text-center p-0 relative", 
        equipment.obs.toLowerCase().includes('oficina') ? 'bg-red-500 text-white' : 'bg-green-600 text-white')}>
        <input
          type="text"
          className="w-full h-full bg-transparent text-center text-white placeholder-white/70 focus:outline-none"
          value={equipment.obs}
          onChange={(e) => handleChange('obs', e.target.value)}
        />
      </td>
    </tr>
  );
};
