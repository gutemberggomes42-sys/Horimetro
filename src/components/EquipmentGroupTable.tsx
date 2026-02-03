import React from 'react';
import { EquipmentGroup } from '../types';
import { EquipmentRow } from './EquipmentRow';
import { EquipmentCardMobile } from './EquipmentCardMobile';

interface EquipmentGroupTableProps {
  group: EquipmentGroup;
  onUpdateEquipment: (groupId: string, equipmentId: string, field: string, value: any) => void;
  readOnly?: boolean;
}

export const EquipmentGroupTable: React.FC<EquipmentGroupTableProps> = ({ group, onUpdateEquipment, readOnly = false }) => {
  const handleRowChange = (equipmentId: string, field: string, value: any) => {
    if (readOnly) return;
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
    <div className="mb-6 border-2 border-orange-500 rounded-lg overflow-hidden">
      {/* Group Header */}
      <div className="bg-header-bg text-center font-bold border-b border-black py-2 text-lg">
        {group.name}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:flex">
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
                  readOnly={readOnly}
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

        {/* Side Panel (Yield/Performance) - Desktop */}
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

      {/* Mobile Card View */}
      <div className="md:hidden bg-gray-100 p-2">
        {group.items.map((item) => (
          <EquipmentCardMobile 
            key={item.id} 
            equipment={item} 
            onChange={handleRowChange}
          />
        ))}

        {/* Totals Card Mobile */}
        <div className="bg-white rounded-lg shadow-sm border border-orange-500 p-4 mt-4">
          <h3 className="font-bold text-center text-orange-600 mb-3 border-b pb-2">Resumo do Grupo</h3>
          
          <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
             <div>
               <div className="text-gray-500 text-xs">Turno A</div>
               <div className="font-bold text-lg">{totalShiftA.toFixed(1)}h</div>
             </div>
             <div>
               <div className="text-gray-500 text-xs">Turno B</div>
               <div className="font-bold text-lg">{totalShiftB.toFixed(1)}h</div>
             </div>
             <div>
               <div className="text-gray-500 text-xs">Total</div>
               <div className="font-bold text-lg text-green-600">{totalAB.toFixed(1)}h</div>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-yellow-50 p-2 rounded">
             <div>
               <div className="text-gray-500">Média A</div>
               <div className="font-bold">{avgShiftA.toFixed(1)}h</div>
             </div>
             <div>
               <div className="text-gray-500">Média B</div>
               <div className="font-bold">{avgShiftB.toFixed(1)}h</div>
             </div>
             <div>
               <div className="text-gray-500">Média Total</div>
               <div className="font-bold">{avgTotal.toFixed(1)}h</div>
             </div>
          </div>
        </div>

        {/* Side Panel (Yield/Performance) - Mobile */}
        {group.yield !== undefined && (
          <div className="mt-4 bg-green-600 rounded-lg p-4 text-center shadow-sm">
            <div className="text-white text-sm font-bold mb-1">
              {group.yieldLabel || 'Rendimento'}
            </div>
            <div className="text-5xl font-bold text-white">
              {group.yield.toString().replace('.', ',')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
