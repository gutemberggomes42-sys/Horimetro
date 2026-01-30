import React from 'react';
import { EquipmentGroup, Equipment } from '../types';
import { EquipmentRow } from './EquipmentRow';

interface EquipmentGroupTableProps {
  group: EquipmentGroup;
  onUpdateEquipment: (groupId: string, equipmentId: string, field: string, value: any) => void;
}

export const EquipmentGroupTable: React.FC<EquipmentGroupTableProps> = ({ group, onUpdateEquipment }) => {
  const handleRowChange = (equipmentId: string, field: string, value: any) => {
    onUpdateEquipment(group.id, equipmentId, field, value);
  };

  // Calculate totals
  const totalShiftA = group.items.reduce((acc, item) => acc + (item.shiftA.worked || 0), 0);
  const totalShiftB = group.items.reduce((acc, item) => acc + (item.shiftB.worked || 0), 0);
  const totalAB = totalShiftA + totalShiftB;

  // Calculate averages (count items that have data or just all items?)
  // Assuming average per machine in the list
  const count = group.items.length;
  const avgShiftA = count > 0 ? totalShiftA / count : 0;
  const avgShiftB = count > 0 ? totalShiftB / count : 0;
  const avgTotal = avgShiftA + avgShiftB;

  return (
    <div className="mb-6 border-2 border-orange-500">
      {/* Group Header */}
      <div className="bg-header-bg text-center font-bold border-b border-black py-1">
        {group.name}
      </div>

      <div className="flex">
        <div className="flex-grow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-cambui-header text-white text-xs">
                <th className="border border-gray-400 p-1 w-16">Frota</th>
                <th className="border border-gray-400 p-1 w-20">Hor.Inicial</th>
                <th className="border border-gray-400 p-1 w-20">Hor.Final</th>
                <th className="border border-gray-400 p-1 w-16">H.Trab.(A)</th>
                <th className="border border-gray-400 p-1 w-20">Hor.Inicial</th>
                <th className="border border-gray-400 p-1 w-20">Hor.Final</th>
                <th className="border border-gray-400 p-1 w-16">H.Trab.(B)</th>
                <th className="border border-gray-400 p-1 w-16">Total A-B</th>
                <th className="border border-gray-400 p-1 w-10">Status</th>
                <th className="border border-gray-400 p-1">Obs.</th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item, index) => (
                <EquipmentRow 
                  key={item.id} 
                  equipment={item} 
                  onChange={handleRowChange}
                  isLast={index === group.items.length - 1}
                />
              ))}
              
              {/* Totals Row */}
              <tr className="bg-row-orange font-bold text-xs border-t-2 border-orange-500">
                <td colSpan={3} className="text-right pr-2 border-r border-gray-400 py-1">
                  TOTAL HRS GERAL TURNO A
                </td>
                <td className="text-center border-r border-gray-400 bg-white">
                  {totalShiftA.toFixed(1).replace('.', ',')}
                </td>
                <td colSpan={2} className="text-right pr-2 border-r border-gray-400">
                  TOTAL HRS GERAL TURNO B
                </td>
                <td className="text-center border-r border-gray-400 bg-white">
                  {totalShiftB.toFixed(1).replace('.', ',')}
                </td>
                <td className="text-center border-r border-gray-400 bg-white">
                  {totalAB.toFixed(1).replace('.', ',')}
                </td>
                <td colSpan={2} className="bg-green-600"></td>
              </tr>

              {/* Averages Row */}
              <tr className="bg-total-yellow font-bold text-xs border-t border-orange-500">
                <td colSpan={3} className="text-center py-1 border-r border-gray-400">
                  SOMA MÉDIA "A"
                </td>
                <td className="text-center border-r border-gray-400">
                  {avgShiftA.toFixed(1).replace('.', ',')}
                </td>
                <td colSpan={2} className="text-center border-r border-gray-400">
                  SOMA MÉDIA "B"
                </td>
                <td className="text-center border-r border-gray-400">
                  {avgShiftB.toFixed(1).replace('.', ',')}
                </td>
                <td className="text-center border-r border-gray-400">
                  {avgTotal.toFixed(1).replace('.', ',')}
                </td>
                <td colSpan={2} className="bg-green-600"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Side Panel (Yield/Performance) */}
        {group.yield !== undefined && (
          <div className="w-32 bg-green-600 border-l border-black flex flex-col items-center justify-center text-center p-2">
            <div className="text-white text-xs font-bold mb-2">
              {group.yieldLabel || 'Rendimento'}
            </div>
            <div className="text-4xl font-bold text-black">
              {group.yield.toString().replace('.', ',')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
