import { ReportData } from './types';

export const initialData: ReportData = {
  id: 'F4001',
  title: 'Horas Trabalhadas por Equipamentos. F4001',
  date: '11/04/2025',
  groups: [
    {
      id: 'colhedoras',
      name: 'Colhedoras',
      yield: 6,
      yieldLabel: 'Rendimento Plantio turno "A"',
      items: [
        {
          id: '6603',
          frota: '6603',
          shiftA: { initial: null, final: null, worked: 0 },
          shiftB: { initial: null, final: null, worked: 0 },
          totalAB: 0,
          status: 'ok',
          obs: 'Campo'
        },
        {
          id: '6604',
          frota: '6604',
          shiftA: { initial: 6584.2, final: 6588.6, worked: 4.4 },
          shiftB: { initial: 6588.6, final: 6588.6, worked: 0 },
          totalAB: 4.4,
          status: 'issue', // Red block in image
          obs: ''
        },
        {
          id: '6722',
          frota: '6722',
          shiftA: { initial: 3900.7, final: 3906.2, worked: 5.5 },
          shiftB: { initial: 3906.2, final: 3911.1, worked: 4.9 },
          totalAB: 10.4,
          status: 'ok',
          obs: 'Campo'
        }
      ]
    },
    {
      id: 'transbordo',
      name: 'Trator Transbordo',
      yield: 2,
      yieldLabel: 'Rendimento Plantio turno "B"',
      items: [
        {
          id: '6458',
          frota: '6458',
          shiftA: { initial: 6794.3, final: 6794.3, worked: 0 },
          shiftB: { initial: 6794.3, final: 6796.8, worked: 2.5 },
          totalAB: 2.5,
          status: 'ok',
          obs: 'Campo'
        },
        {
          id: '9382',
          frota: '9382',
          shiftA: { initial: null, final: null, worked: 0 },
          shiftB: { initial: null, final: null, worked: 0 },
          totalAB: 0,
          status: 'issue',
          obs: 'Oficina'
        },
        {
          id: '6522',
          frota: '6522',
          shiftA: { initial: null, final: null, worked: 0 },
          shiftB: { initial: null, final: null, worked: 0 },
          totalAB: 0, // "BASE" in image
          status: 'ok',
          obs: 'Campo'
        },
        {
          id: '6526',
          frota: '6526',
          shiftA: { initial: 20670, final: 20675, worked: 5 },
          shiftB: { initial: 20675, final: 20681, worked: 6 }, 
          totalAB: 11,
          status: 'ok',
          obs: 'Campo'
        }
      ]
    },
    {
        id: 'plantadora',
        name: 'Trator Plantadora',
        yield: 6.15,
        yieldLabel: 'Velocidade Trabalhada',
        items: [
            {
                id: '6671',
                frota: '6671',
                shiftA: { initial: 7614, final: 7614, worked: 0 },
                shiftB: { initial: 7614, final: 7614, worked: 0 },
                totalAB: 0,
                status: 'ok',
                obs: 'Campo'
            },
            {
                id: '6685',
                frota: '6685',
                shiftA: { initial: 6643.6, final: 6650.1, worked: 6.5 },
                shiftB: { initial: 6650.1, final: 6655.1, worked: 5 },
                totalAB: 11.5,
                status: 'ok',
                obs: 'Campo'
            }
        ]
    }
  ]
};
