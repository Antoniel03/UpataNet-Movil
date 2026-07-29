export interface Category {
  id: 'salud' | 'insumos' | 'naturaleza' | 'alertas';
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES = [
  { id: 'salud', label: 'Salud', icon: 'water', color: '#C43B26' },
  { id: 'insumos', label: 'Insumos', icon: 'cube', color: '#1D4E89' },
  { id: 'naturaleza', label: 'Naturaleza', icon: 'leaf', color: '#3B6E4A' },
  { id: 'alertas', label: 'Alertas', icon: 'warning', color: '#E8A13C' },
] as const;
