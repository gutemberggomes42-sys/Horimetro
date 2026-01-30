export interface ShiftData {
  initial: number | null;
  final: number | null;
  worked: number; // Calculated: final - initial (if both exist)
}

export interface Equipment {
  id: string;
  frota: string;
  shiftA: ShiftData;
  shiftB: ShiftData;
  totalAB: number; // Calculated: shiftA.worked + shiftB.worked
  status: 'ok' | 'issue'; // green check or red warning
  obs: string;
}

export interface EquipmentGroup {
  id: string;
  name: string;
  items: Equipment[];
  yield?: number; // Rendimento Plantio if applicable
  yieldLabel?: string; // "Rendimento Plantio turno A" etc.
}

export interface ReportData {
  id: string;
  title: string;
  date: string;
  groups: EquipmentGroup[];
}
