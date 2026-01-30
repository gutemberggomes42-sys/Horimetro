import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { ReportData, EquipmentGroup, Equipment } from './types';
import { initialData } from './initialData';
import { EquipmentGroupTable } from './components/EquipmentGroupTable';
import { PLANTS, Plant } from './constants/plants';

function App() {
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    setIsAndroid(Capacitor.getPlatform() === 'android');
  }, []);

  const [selectedPlant, setSelectedPlant] = useState<Plant>(() => {
    const saved = localStorage.getItem('horimetro-plant');
    if (saved) {
      const parsed = JSON.parse(saved);
      const found = PLANTS.find(p => p.id === parsed.id);
      if (found) return found;
    }
    return PLANTS[0];
  });

  useEffect(() => {
    localStorage.setItem('horimetro-plant', JSON.stringify(selectedPlant));
  }, [selectedPlant]);

  const [data, setData] = useState<ReportData>(() => {
    const saved = localStorage.getItem('horimetro-data');
    return saved ? JSON.parse(saved) : initialData;
  });

  React.useEffect(() => {
    localStorage.setItem('horimetro-data', JSON.stringify(data));
  }, [data]);

  const updateEquipment = (groupId: string, equipmentId: string, field: string, value: any) => {
    setData(prevData => {
      const newGroups = prevData.groups.map(group => {
        if (group.id !== groupId) return group;

        const newItems = group.items.map(item => {
          if (item.id !== equipmentId) return item;

          // Clone item
          const newItem = { ...item };

          // Helper to set nested property
          const setNested = (obj: any, path: string[], val: any) => {
            const last = path.pop();
            const target = path.reduce((o, key) => o[key], obj);
            if (last) target[last] = val;
          };

          const pathParts = field.split('.');
          if (pathParts.length === 1) {
            (newItem as any)[field] = value;
          } else {
            // Handle shiftA.initial etc.
            if (pathParts[0] === 'shiftA' || pathParts[0] === 'shiftB') {
               const shift = pathParts[0] as 'shiftA' | 'shiftB';
               const prop = pathParts[1] as 'initial' | 'final';
               
               newItem[shift] = { ...newItem[shift], [prop]: value };
               
               // Recalculate worked
               const init = newItem[shift].initial;
               const fin = newItem[shift].final;
               
               if (init !== null && fin !== null) {
                 newItem[shift].worked = fin - init;
               } else {
                 newItem[shift].worked = 0;
               }
            } else {
              setNested(newItem, pathParts, value);
            }
          }

          // Recalculate Total AB
          newItem.totalAB = (newItem.shiftA.worked || 0) + (newItem.shiftB.worked || 0);

          return newItem;
        });

        return { ...group, items: newItems };
      });

      return { ...prevData, groups: newGroups };
    });
  };

  return (
    <div className={`min-h-screen bg-white p-4 font-sans ${isAndroid ? 'pt-12' : ''}`}>
      {isAndroid && (
        <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white p-2 text-center text-sm font-bold z-50 shadow-md">
          Modo App Android
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Plant Selector - Hidden on Print */}
        <div className="flex justify-end mb-2 print:hidden">
          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded shadow-sm border">
            <label className="text-xs font-bold text-gray-500 uppercase">Unidade:</label>
            <select 
              value={selectedPlant.id}
              onChange={(e) => {
                const plant = PLANTS.find(p => p.id === e.target.value);
                if (plant) setSelectedPlant(plant);
              }}
              className="text-sm font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
            >
              {PLANTS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Header */}
        <div className="bg-white mb-4">
          <div className={`flex justify-between items-end border-b-2 ${selectedPlant.borderClass} pb-2 mb-2 transition-colors duration-300`}>
            <div className="w-48">
              <div className={`text-4xl font-black ${selectedPlant.color} tracking-tighter leading-none transition-colors duration-300`}>
                {selectedPlant.name}
              </div>
              <div className="text-sm font-bold text-black leading-none ml-1">
                {selectedPlant.subtitle}
              </div>
            </div>
            <div className="text-center flex-grow px-4">
              <h1 className={`text-2xl font-bold italic text-black ${selectedPlant.bgClass} rounded px-2 transition-colors duration-300`}>
                Horas Trabalhadas por Equipamentos. {data.id}
              </h1>
            </div>
            <div className="text-xl font-bold w-32 text-right">
              {data.date}
            </div>
          </div>
          
          {/* Sub Header */}
          <div className="flex border border-black text-xs font-bold text-center bg-gray-100">
            <div className="w-24 border-r border-black flex items-center justify-center p-1 bg-white">
              Turnos
            </div>
            <div className="flex-grow flex flex-col">
              <div className="border-b border-black p-1 bg-white">
                FECHAMENTO HORIMETRO
              </div>
              <div className="flex flex-grow">
                 <div className="w-1/2 border-r border-black p-1 bg-white">"A"</div>
                 <div className="w-1/2 p-1 bg-white">"B"</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-600 text-center font-bold text-xl border-x border-b border-black py-1 text-black mt-1 shadow-md">
            Horimetro das Colhedoras e Tratores
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-4">
          {data.groups.map(group => (
            <EquipmentGroupTable 
              key={group.id} 
              group={group} 
              onUpdateEquipment={updateEquipment}
            />
          ))}
        </div>
        
        {/* Footer / Instructions */}
        <div className="mt-8 text-gray-500 text-xs text-center pb-8">
          <p>Sistema Avançado de Gestão de Horimetro - Cambuí v1.0</p>
          <button 
            onClick={() => {
              if (confirm('Tem certeza que deseja resetar todos os dados para o padrão?')) {
                setData(initialData);
                localStorage.removeItem('horimetro-data');
              }
            }}
            className="mt-2 text-red-500 hover:underline"
          >
            Resetar Dados para Padrão
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
