export interface Plant {
  id: string;
  name: string;
  subtitle: string;
  color: string; // Tailwind text color class
  borderClass: string; // Tailwind border color class
  bgClass: string; // Tailwind bg color for title highlight
}

export const PLANTS: Plant[] = [
  {
    id: 'cambui',
    name: 'Cambuí',
    subtitle: 'Açúcar e Álcool',
    color: 'text-orange-500',
    borderClass: 'border-orange-500',
    bgClass: 'bg-orange-200/50'
  },
  {
    id: 'panorama',
    name: 'Panorama',
    subtitle: 'Açúcar e Álcool',
    color: 'text-blue-600',
    borderClass: 'border-blue-600',
    bgClass: 'bg-blue-200/50'
  },
  {
    id: 'vale-verdao',
    name: 'Vale do Verdão',
    subtitle: 'Açúcar e Álcool',
    color: 'text-green-600',
    borderClass: 'border-green-600',
    bgClass: 'bg-green-200/50'
  },
  {
    id: 'floresta',
    name: 'Floresta',
    subtitle: 'Açúcar e Álcool',
    color: 'text-emerald-700',
    borderClass: 'border-emerald-700',
    bgClass: 'bg-emerald-200/50'
  }
];
