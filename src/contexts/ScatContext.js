import { createContext, useContext } from 'react';

// Crear el contexto
export const ScatDataContext = createContext();

// Hook personalizado para usar el contexto
export const useScatData = () => {
  const context = useContext(ScatDataContext);
  if (!context) {
    throw new Error('useScatData must be used within a ScatDataProvider');
  }
  return context;
};
