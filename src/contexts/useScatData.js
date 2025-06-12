// Acciones disponibles para el reducer
export const ACTIONS = {
  SET_PROJECT_DATA: 'SET_PROJECT_DATA',
  SET_EVALUACION_DATA: 'SET_EVALUACION_DATA',
  SET_CONTACTO_DATA: 'SET_CONTACTO_DATA',
  SET_CAUSAS_INMEDIATAS_DATA: 'SET_CAUSAS_INMEDIATAS_DATA',
  SET_CAUSAS_BASICAS_DATA: 'SET_CAUSAS_BASICAS_DATA',
  SET_NECESIDADES_CONTROL_DATA: 'SET_NECESIDADES_CONTROL_DATA',
  LOAD_DATA: 'LOAD_DATA',
  SET_EDITING_MODE: 'SET_EDITING_MODE',
  SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
  RESET_DATA: 'RESET_DATA'
};

// Hook personalizado para usar el contexto SCAT
import { useContext } from 'react';
import { ScatDataContext } from './ScatContext';

export function useScatData() {
  const context = useContext(ScatDataContext);
  if (!context) {
    throw new Error('useScatData must be used within a ScatDataProvider');
  }
  return context;
}