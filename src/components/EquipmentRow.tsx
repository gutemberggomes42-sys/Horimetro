import React from 'react';
import { Equipment } from '../types';
import { Check, X } from 'lucide-react';
import { clsx } from 'clsx';

interface EquipmentRowProps {
  equipment: Equipment;
  onChange: (id: string, field: keyof Equipment | string, value: any) => void;
  isLast?: boolean;
  readOnly?: boolean;
}

export const EquipmentRow: React.FC<EquipmentRowProps> = ({ equipment, onChange, isLast, readOnly = false }) => {
  const handleChange = (field: string, value: any) => {
    if (readOnly) return;
    onChange(equipment.id, field, value);
  };

  const renderNumberInput = (value: number | null, fieldPath: string, isError: boolean = false) => (
    <input
      type="number"
      step="0.1"
      className={clsx(
        "w-full h-full bg-transparent text-center focus:outline-none",
        isError ? "bg-red-100 text-red-600 font-bold" : "focus:bg-white/50",
        readOnly && "cursor-not-allowed opacity-80"
      )}
      value={value ?? ''}
      onChange={(e) => handleChange(fieldPath, e.target.value === '' ? null : parseFloat(e.target.value))}
      disabled={readOnly}
    />
  );

  const isShiftAError = equipment.shiftA.initial !== null && equipment.shiftA.final !== null && equipment.shiftA.final < equipment.shiftA.initial;
  const isShiftBError = equipment.shiftB.initial !== null && equipment.shiftB.final !== null && equipment.shiftB.final < equipment.shiftB.initial;

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
      <td className={clsx("border-r border-gray-300", isShiftAError ? "bg-red-50" : "bg-white")}>
        {renderNumberInput(equipment.shiftA.final, 'shiftA.final', isShiftAError)}
      </td>
      <td className={clsx("border-r border-gray-400 font-bold text-center", 
        equipment.shiftA.worked < 0 ? "bg-red-200 text-red-700" : "bg-gray-200")}>
        {equipment.shiftA.worked.toFixed(1)}
      </td>

      {/* Turno B */}
      <td className="border-r border-gray-300 bg-white">
        {renderNumberInput(equipment.shiftB.initial, 'shiftB.initial')}
      </td>
      <td className={clsx("border-r border-gray-300", isShiftBError ? "bg-red-50" : "bg-white")}>
        {renderNumberInput(equipment.shiftB.final, 'shiftB.final', isShiftBError)}
      </td>
      <td className={clsx("border-r border-gray-400 font-bold text-center",
        equipment.shiftB.worked < 0 ? "bg-red-200 text-red-700" : "bg-gray-200")}>
        {equipment.shiftB.worked.toFixed(1)}
      </td>

      {/* Total A-B */}
      <td className="border-r border-gray-400 bg-gray-200 font-bold text-center">
        {equipment.totalAB.toFixed(1)}
      </td>

      {/* Status */}
      <td className="border-r border-gray-400 text-center cursor-pointer"
          onClick={() => !readOnly && handleChange('status', equipment.status === 'ok' ? 'issue' : 'ok')}>
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
          className={clsx("w-full h-full bg-transparent text-center text-white placeholder-white/70 focus:outline-none", readOnly && "cursor-not-allowed")}
          value={equipment.obs}
          onChange={(e) => handleChange('obs', e.target.value)}
          disabled={readOnly}
          list={`obs-options-${equipment.id}`}
        />
        <datalist id={`obs-options-${equipment.id}`}>
          <option value="Campo" />
          <option value="Oficina" />
          <option value="Base" />
          <option value="Apoio" />
        </datalist>
      </td>
    </tr>
  );
};
