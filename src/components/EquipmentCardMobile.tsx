import React from 'react';
import { Equipment } from '../types';
import { Check, X, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface EquipmentCardMobileProps {
  equipment: Equipment;
  onChange: (id: string, field: keyof Equipment | string, value: any) => void;
}

export const EquipmentCardMobile: React.FC<EquipmentCardMobileProps> = ({ equipment, onChange }) => {
  const handleChange = (field: string, value: any) => {
    onChange(equipment.id, field, value);
  };

  const renderNumberInput = (value: number | null, fieldPath: string, placeholder: string, isError: boolean = false) => (
    <div className="flex flex-col">
      <label className={clsx("text-xs mb-1", isError ? "text-red-500 font-bold" : "text-gray-500")}>
        {placeholder}
      </label>
      <input
        type="number"
        step="0.1"
        className={clsx(
          "w-full border rounded p-2 text-center focus:outline-none focus:ring-2",
          isError 
            ? "bg-red-50 border-red-300 text-red-700 focus:ring-red-500" 
            : "bg-gray-50 border-gray-200 focus:ring-orange-500 focus:border-transparent"
        )}
        value={value ?? ''}
        placeholder="0.0"
        onChange={(e) => handleChange(fieldPath, e.target.value === '' ? null : parseFloat(e.target.value))}
      />
    </div>
  );

  const isShiftAError = equipment.shiftA.initial !== null && equipment.shiftA.final !== null && equipment.shiftA.final < equipment.shiftA.initial;
  const isShiftBError = equipment.shiftB.initial !== null && equipment.shiftB.final !== null && equipment.shiftB.final < equipment.shiftB.initial;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
      {/* Header do Card - Frota e Status */}
      <div className={clsx("p-3 flex justify-between items-center", 
        equipment.status === 'issue' ? 'bg-red-50' : 'bg-gray-50')}>
        <div className="flex items-center space-x-2">
          <span className={clsx("font-bold text-lg px-2 py-0.5 rounded text-white",
             equipment.status === 'issue' ? 'bg-red-500' : 'bg-gray-700')}>
            {equipment.frota}
          </span>
          <span className="text-sm font-medium text-gray-600">
             Total: {equipment.totalAB.toFixed(1)}h
          </span>
        </div>
        <button 
          onClick={() => handleChange('status', equipment.status === 'ok' ? 'issue' : 'ok')}
          className={clsx("p-2 rounded-full transition-colors", 
            equipment.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}
        >
          {equipment.status === 'ok' ? <Check size={20} /> : <X size={20} />}
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* Turno A */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className={clsx("text-sm font-bold", isShiftAError ? "text-red-600" : "text-gray-700")}>
              Turno A {isShiftAError && "(Erro: Final < Inicial)"}
            </h4>
            <span className={clsx("text-xs font-bold px-2 py-1 rounded",
              equipment.shiftA.worked < 0 ? "bg-red-100 text-red-700" : "bg-gray-100")}>
              Trab: {equipment.shiftA.worked.toFixed(1)}h
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderNumberInput(equipment.shiftA.initial, 'shiftA.initial', 'Inicial')}
            {renderNumberInput(equipment.shiftA.final, 'shiftA.final', 'Final', isShiftAError)}
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Turno B */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className={clsx("text-sm font-bold", isShiftBError ? "text-red-600" : "text-gray-700")}>
              Turno B {isShiftBError && "(Erro: Final < Inicial)"}
            </h4>
            <span className={clsx("text-xs font-bold px-2 py-1 rounded",
               equipment.shiftB.worked < 0 ? "bg-red-100 text-red-700" : "bg-gray-100")}>
              Trab: {equipment.shiftB.worked.toFixed(1)}h
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderNumberInput(equipment.shiftB.initial, 'shiftB.initial', 'Inicial')}
            {renderNumberInput(equipment.shiftB.final, 'shiftB.final', 'Final', isShiftBError)}
          </div>
        </div>

        {/* Observação */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Observações</label>
          <div className="relative">
            <input
              type="text"
              className={clsx("w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-orange-500",
                equipment.obs.toLowerCase().includes('oficina') 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-white border-gray-200')}
              value={equipment.obs}
              onChange={(e) => handleChange('obs', e.target.value)}
              placeholder="Digite uma observação..."
            />
            {equipment.obs.toLowerCase().includes('oficina') && (
              <AlertCircle className="absolute right-2 top-2.5 text-red-500" size={16} />
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleChange('obs', 'Campo')}
              className={clsx("px-2 py-1 text-xs rounded border",
                equipment.obs === 'Campo' ? "bg-green-600 text-white border-green-700" : "bg-white text-gray-700 border-gray-300")}
            >
              Campo
            </button>
            <button
              type="button"
              onClick={() => handleChange('obs', 'Oficina')}
              className={clsx("px-2 py-1 text-xs rounded border",
                equipment.obs === 'Oficina' ? "bg-red-600 text-white border-red-700" : "bg-white text-gray-700 border-gray-300")}
            >
              Oficina
            </button>
            <button
              type="button"
              onClick={() => handleChange('obs', 'Base')}
              className={clsx("px-2 py-1 text-xs rounded border",
                equipment.obs === 'Base' ? "bg-gray-700 text-white border-gray-800" : "bg-white text-gray-700 border-gray-300")}
            >
              Base
            </button>
            <button
              type="button"
              onClick={() => handleChange('obs', 'Apoio')}
              className={clsx("px-2 py-1 text-xs rounded border",
                equipment.obs === 'Apoio' ? "bg-purple-700 text-white border-purple-800" : "bg-white text-gray-700 border-gray-300")}
            >
              Apoio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
