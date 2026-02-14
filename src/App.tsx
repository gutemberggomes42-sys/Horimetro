import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { ReportData, EquipmentGroup, Equipment } from './types';
import { EquipmentGroupTable } from './components/EquipmentGroupTable';
import { PLANTS, Plant } from './constants/plants';
import { Wifi, WifiOff, LogOut } from 'lucide-react';
import { reportService } from './services/reportService';
import { auth } from './firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Login } from './components/Login';

// Helper function to calculate new state
const calculateNewData = (prevData: ReportData, groupId: string, equipmentId: string, field: string, value: any): ReportData => {
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
};

function App() {
  const [isAndroid, setIsAndroid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const ADMIN_EMAIL = 'gutemberggg10@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsAndroid(Capacitor.getPlatform() === 'android');
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

  const [data, setData] = useState<ReportData | null>(null);

  const REQUIRED_GROUPS: { id: string; name: string }[] = [
    { id: 'plantadora', name: 'Trator Plantadora' },
    { id: 'distribuidora', name: 'Distribuidora' },
    { id: 'caminhoes', name: 'Caminhões' },
    { id: 'reboques', name: 'Reboques' },
    { id: 'apoio', name: 'Apoio' },
  ];

  const ensureRequiredGroups = (incoming: ReportData): ReportData => {
    const existingIds = new Set(incoming.groups.map(g => g.id));
    const missing: EquipmentGroup[] = REQUIRED_GROUPS
      .filter(g => !existingIds.has(g.id))
      .map(g => ({ id: g.id, name: g.name, items: [] }));
    if (missing.length === 0) return incoming;
    return { ...incoming, groups: [...incoming.groups, ...missing] };
  };

  // Subscribe to Firestore data
  useEffect(() => {
    if (!user) return; // Don't subscribe if not logged in

    setIsLoading(true);
    // Use a fixed ID for now, or could be dynamic based on date
    const reportId = 'daily-report'; 
    
    const unsubscribe = reportService.subscribeToReport(reportId, (newData) => {
      const ensured = ensureRequiredGroups(newData);
      setData(ensured);
      if (isAdmin && ensured !== newData) {
        reportService.updateReport(reportId, ensured).catch(error => {
          console.error("Error ensuring required groups:", error);
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const updateEquipment = (groupId: string, equipmentId: string, field: string, value: any) => {
    if (!data) return;
    if (!isAdmin) return; // Prevent updates if not admin

    const newData = calculateNewData(data, groupId, equipmentId, field, value);
    
    // Send to Firestore (fire and forget to support offline mode without blocking)
    reportService.updateReport('daily-report', newData).catch(error => {
      console.error("Error updating report:", error);
    });
  };

  const addEquipment = (groupId: string) => {
    if (!data) return;
    if (!isAdmin) return;
    const newItemId = `${Date.now()}`;
    const defaultObs = groupId === 'apoio' ? 'Apoio' : '';
    const newItem: Equipment = {
      id: newItemId,
      frota: newItemId,
      shiftA: { initial: null, final: null, worked: 0 },
      shiftB: { initial: null, final: null, worked: 0 },
      totalAB: 0,
      status: 'ok',
      obs: defaultObs
    };
    const newGroups = data.groups.map(g => g.id === groupId ? { ...g, items: [...g.items, newItem] } : g);
    const newData = { ...data, groups: newGroups };
    setData(newData);
    reportService.updateReport('daily-report', newData).catch(error => {
      console.error("Error adding equipment:", error);
    });
  };

  const handleReset = () => {
    if (!isAdmin) return;
    if (confirm('Tem certeza que deseja resetar todos os dados para o padrão?')) {
      reportService.resetReport('daily-report').catch(error => {
        console.error("Error resetting report:", error);
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const buildWhatsAppReport = (): string => {
    if (!data) return '';
    const lines: string[] = [];
    lines.push(`*Usina ${selectedPlant.name}*`);
    lines.push(`*Frente ${data.id}*`);
    lines.push('');
    data.groups.forEach(group => {
      const total = group.items.length;
      const okCount = group.items.filter(i => i.status === 'ok').length;
      const issueCount = group.items.filter(i => i.status === 'issue').length;
      const okPct = total > 0 ? Math.round((okCount / total) * 100) : 0;
      const issuePct = total > 0 ? Math.round((issueCount / total) * 100) : 0;
      lines.push(`*${group.name}* (✅ ${okPct}% | ❌ ${issuePct}%)`);
      const baseIssues = group.items.filter(i => i.status === 'issue');
      if (baseIssues.length > 0) {
        lines.push(`📍 *BASE*`);
        baseIssues.forEach(i => {
          const obs = i.obs && i.obs.trim() !== '' ? i.obs : 'Sem observação';
          lines.push(`❌ ${i.frota} -> ${obs}`);
        });
      }
      const campoOk = group.items.filter(i => i.status === 'ok');
      if (campoOk.length > 0) {
        lines.push(`📍 *CAMPO*`);
        campoOk.forEach(i => {
          lines.push(`✅ ${i.frota}`);
        });
      }
      lines.push('');
    });
    return lines.join('\n');
  };
  
  const handleCopyWhatsApp = () => {
    const text = buildWhatsAppReport();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert('Relatório copiado para a área de transferência');
    }).catch(() => {
      alert('Não foi possível copiar o relatório');
    });
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white p-4 font-sans ${isAndroid ? 'pt-12' : ''}`}>
      {isAndroid && (
        <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white p-2 text-center text-sm font-bold z-50 shadow-md flex justify-between items-center px-4">
          <span>Modo App Android</span>
          <div className="flex items-center gap-3">
             {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
             <button onClick={handleLogout} className="text-white hover:text-gray-200">
                <LogOut size={16} />
             </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Plant Selector - Hidden on Print, Visible only on Desktop */}
        <div className="hidden md:flex justify-end mb-2 print:hidden items-center gap-4">
          <div className="flex items-center gap-2">
             <span className="text-xs text-gray-500">Logado como: {user.email} {isAdmin && '(Admin)'}</span>
             <button onClick={handleLogout} className="text-gray-500 hover:text-red-500" title="Sair">
                <LogOut size={16} />
             </button>
          </div>
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
          <button
            onClick={handleCopyWhatsApp}
            className="text-xs font-bold px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            title="Copiar relatório (WhatsApp/Word)"
          >
            Copiar Relatório
          </button>
        </div>

        {/* Header Section */}
        <div className="bg-white mb-4">
          
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col pb-4 border-b border-gray-100 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className={`text-2xl font-black ${selectedPlant.color} tracking-tighter`}>
                  {selectedPlant.name}
                </div>
                <div className="text-xs font-bold text-gray-500">
                  {data.date}
                </div>
              </div>
              <select 
                value={selectedPlant.id}
                onChange={(e) => {
                  const plant = PLANTS.find(p => p.id === e.target.value);
                  if (plant) setSelectedPlant(plant);
                }}
                className="text-sm border border-gray-300 rounded p-1 bg-white"
              >
                {PLANTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-2">
              <button
                onClick={handleCopyWhatsApp}
                className="w-full text-xs font-bold px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                title="Copiar relatório (WhatsApp/Word)"
              >
                Copiar Relatório
              </button>
            </div>
            {!isAdmin && (
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded text-center">
                Modo Leitura (Apenas Admin pode editar)
              </div>
            )}
          </div>

          {/* Desktop Header Content */}
          <div className="hidden md:block">
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
                {!isAdmin && <div className="text-sm text-red-500 font-bold mt-1">MODO LEITURA</div>}
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
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-4">
          {data.groups.map(group => (
            <EquipmentGroupTable 
              key={group.id} 
              group={group} 
              onUpdateEquipment={updateEquipment}
              onAddEquipment={addEquipment}
              readOnly={!isAdmin}
            />
          ))}
        </div>
        
        {/* Footer / Instructions */}
        <div className="mt-8 text-gray-500 text-xs text-center pb-8">
          <p>Sistema Avançado de Gestão de Horimetro - Cambuí v1.0</p>
          {isAdmin && (
            <button 
              onClick={handleReset}
              className="mt-2 text-red-500 hover:underline"
            >
              Resetar Dados para Padrão
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
