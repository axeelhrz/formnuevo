import { useReducer, useEffect, useRef, useCallback } from 'react';
import { ACTIONS } from './useScatData';
import { ScatDataContext } from './ScatContext';

// Estado inicial limpio
const initialState = {
  projectData: {
    evento: '',
    involucrado: '',
    area: '',
    fechaHora: '',
    investigador: '',
    otrosDatos: ''
  },
  evaluacionData: {
    severity: null,
    probability: null,
    frequency: null
  },
  contactoData: {
    selectedIncidents: [],
    image: null,
    observation: ''
  },
  causasInmediatasData: {
    actos: {
      selectedItems: [],
      image: null,
      observation: ''
    },
    condiciones: {
      selectedItems: [],
      image: null,
      observation: ''
    }
  },
  causasBasicasData: {
    personales: {
      selectedItems: [],
      detailedSelections: {},
      image: null,
      observation: ''
    },
    laborales: {
      selectedItems: [],
      detailedSelections: {},
      image: null,
      observation: ''
    }
  },
  necesidadesControlData: {
    selectedItems: [],
    detailedData: {},
    globalImage: null,
    globalObservation: '',
    medidasCorrectivas: ''
  },
  // Metadatos
  lastModified: null,
  dataVersion: 1,
  isEditing: false,
  editingProjectId: null,
  currentProjectId: null // Para rastrear el proyecto actual
};

// Función para crear copia profunda
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Función para obtener estado inicial limpio
const getCleanInitialState = () => deepClone(initialState);

// Función para fusionar datos de manera segura
const safeDataMerge = (defaultData, loadedData) => {
  if (!loadedData || typeof loadedData !== 'object') {
    return defaultData;
  }
  
  const merged = { ...defaultData };
  
  Object.keys(defaultData).forEach(key => {
    if (loadedData.hasOwnProperty(key)) {
      if (typeof defaultData[key] === 'object' && defaultData[key] !== null && !Array.isArray(defaultData[key])) {
        merged[key] = safeDataMerge(defaultData[key], loadedData[key]);
      } else {
        merged[key] = loadedData[key];
      }
    }
  });
  
  return merged;
};

// Reducer mejorado
function scatDataReducer(state, action) {
  const newState = { ...state, lastModified: new Date().toISOString() };
  
  switch (action.type) {
    case ACTIONS.SET_PROJECT_DATA:
      return {
        ...newState,
        projectData: { ...state.projectData, ...action.payload }
      };
    
    case ACTIONS.SET_EVALUACION_DATA:
      return {
        ...newState,
        evaluacionData: { ...state.evaluacionData, ...action.payload }
      };
    
    case ACTIONS.SET_CONTACTO_DATA:
      return {
        ...newState,
        contactoData: { ...state.contactoData, ...action.payload }
      };
    
    case ACTIONS.SET_CAUSAS_INMEDIATAS_DATA:
      return {
        ...newState,
        causasInmediatasData: {
          ...state.causasInmediatasData,
          [action.section]: {
            ...state.causasInmediatasData[action.section],
            ...action.payload
          }
        }
      };
    
    case ACTIONS.SET_CAUSAS_BASICAS_DATA:
      return {
        ...newState,
        causasBasicasData: {
          ...state.causasBasicasData,
          [action.section]: {
            ...state.causasBasicasData[action.section],
            ...action.payload
          }
        }
      };
    
    case ACTIONS.SET_NECESIDADES_CONTROL_DATA:
      return {
        ...newState,
        necesidadesControlData: { ...state.necesidadesControlData, ...action.payload }
      };
    
    case ACTIONS.LOAD_DATA:
      console.log('=== CARGANDO DATOS COMPLETOS EN REDUCER ===');
      console.log('Datos a cargar:', action.payload);
      return {
        ...action.payload,
        dataVersion: (action.payload.dataVersion || 0) + 1,
        lastModified: new Date().toISOString()
      };
    
    case ACTIONS.SET_EDITING_MODE:
      return {
        ...newState,
        isEditing: action.payload.isEditing,
        editingProjectId: action.payload.projectId,
        currentProjectId: action.payload.projectId
      };
    
    case ACTIONS.SET_CURRENT_PROJECT:
      return {
        ...newState,
        currentProjectId: action.payload
      };
    
    case ACTIONS.RESET_DATA:
      return getCleanInitialState();
    
    default:
      return state;
  }
}

// Provider mejorado
export function ScatDataProvider({ children }) {
  const [state, dispatch] = useReducer(scatDataReducer, getCleanInitialState());
  const isInitializedRef = useRef(false);
  const lastSavedStateRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Función para auto-guardar datos SCAT en proyecto existente (SOLO ACTUALIZAR, NO CREAR)
  const autoSaveToProject = useCallback(() => {
    if (!state.currentProjectId) {
      console.log('No hay proyecto actual para auto-guardar');
      return;
    }

    try {
      console.log('=== AUTO-GUARDANDO DATOS SCAT EN PROYECTO EXISTENTE ===');
      console.log('Project ID:', state.currentProjectId);

      // Obtener proyectos del localStorage
      const savedProjects = localStorage.getItem('scatProjects');
      if (!savedProjects) {
        console.log('No hay proyectos guardados para auto-guardar');
        return;
      }

      const projects = JSON.parse(savedProjects);
      const projectIndex = projects.findIndex(p => p.id === state.currentProjectId);
      
      if (projectIndex === -1) {
        console.log('Proyecto no encontrado para auto-guardar');
        return;
      }

      // Construir datos SCAT actuales
      const scatData = {
        evaluacion: state.evaluacionData,
        contacto: state.contactoData,
        causasInmediatas: state.causasInmediatasData,
        causasBasicas: state.causasBasicasData,
        necesidadesControl: state.necesidadesControlData
      };

      // Verificar si hay datos SCAT reales para guardar
      const hasRealScatData = (
        Object.values(state.evaluacionData).some(v => v !== null && v !== undefined) ||
        state.contactoData.selectedIncidents.length > 0 ||
        state.contactoData.observation?.trim() ||
        state.contactoData.image ||
        state.causasInmediatasData.actos.selectedItems.length > 0 ||
        state.causasInmediatasData.condiciones.selectedItems.length > 0 ||
        state.causasInmediatasData.actos.observation?.trim() ||
        state.causasInmediatasData.condiciones.observation?.trim() ||
        state.causasInmediatasData.actos.image ||
        state.causasInmediatasData.condiciones.image ||
        state.causasBasicasData.personales.selectedItems.length > 0 ||
        state.causasBasicasData.laborales.selectedItems.length > 0 ||
        state.causasBasicasData.personales.observation?.trim() ||
        state.causasBasicasData.laborales.observation?.trim() ||
        state.causasBasicasData.personales.image ||
        state.causasBasicasData.laborales.image ||
        state.necesidadesControlData.selectedItems.length > 0 ||
        state.necesidadesControlData.globalObservation?.trim() ||
        state.necesidadesControlData.globalImage ||
        state.necesidadesControlData.medidasCorrectivas?.trim()
      );

      // Solo actualizar si hay datos SCAT reales
      if (hasRealScatData) {
        // SOLO ACTUALIZAR proyecto existente, NO CREAR NUEVO
        const updatedProject = {
          ...projects[projectIndex],
          scatData: scatData,
          lastModified: new Date().toISOString(),
          version: (projects[projectIndex].version || 1) + 1
        };

        projects[projectIndex] = updatedProject;
        
        // Guardar en localStorage
        localStorage.setItem('scatProjects', JSON.stringify(projects));
        
        console.log('=== DATOS SCAT AUTO-GUARDADOS EN PROYECTO EXISTENTE ===');
        console.log('Datos guardados:', scatData);
      } else {
        console.log('No hay datos SCAT reales para auto-guardar');
      }
      
    } catch (error) {
      console.error('Error en auto-guardado:', error);
    }
  }, [state]);

  // Inicialización única
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log('=== INICIALIZANDO SCAT DATA CONTEXT ===');
      
      // Solo cargar datos temporales si no estamos en modo edición
      if (!state.isEditing) {
        const savedData = localStorage.getItem('scatData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            console.log('Cargando datos temporales del localStorage');
            dispatch({ type: ACTIONS.LOAD_DATA, payload: parsedData });
          } catch (error) {
            console.error('Error cargando datos temporales:', error);
          }
        }
      }
      
      isInitializedRef.current = true;
    }
  }, [state.isEditing]);

  // Auto-guardado mejorado con debounce (SOLO ACTUALIZAR PROYECTOS EXISTENTES)
  useEffect(() => {
    if (isInitializedRef.current) {
      const currentStateString = JSON.stringify(state);
      
      // Solo proceder si el estado ha cambiado realmente
      if (lastSavedStateRef.current !== currentStateString) {
        
        // Limpiar timeout anterior
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        // Configurar nuevo timeout para auto-guardado
        autoSaveTimeoutRef.current = setTimeout(() => {
          if (state.currentProjectId) {
            // Si hay un proyecto actual, SOLO actualizar datos SCAT en él
            autoSaveToProject();
          } else {
            // Solo para datos temporales (NO CREAR PROYECTOS AUTOMÁTICAMENTE)
            console.log('Auto-guardando datos temporales (sin crear proyecto)');
            localStorage.setItem('scatData', currentStateString);
          }
        }, 1000); // Debounce de 1 segundo

        lastSavedStateRef.current = currentStateString;
      }
    }
  }, [state, isInitializedRef.current, autoSaveToProject]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Funciones de actualización
  const setProjectData = useCallback((data) => {
    dispatch({ type: ACTIONS.SET_PROJECT_DATA, payload: data });
  }, []);

  const setEvaluacionData = useCallback((data) => {
    dispatch({ type: ACTIONS.SET_EVALUACION_DATA, payload: data });
  }, []);

  const setContactoData = useCallback((data) => {
    dispatch({ type: ACTIONS.SET_CONTACTO_DATA, payload: data });
  }, []);

  const setCausasInmediatasData = useCallback((section, data) => {
    dispatch({ 
      type: ACTIONS.SET_CAUSAS_INMEDIATAS_DATA, 
      section, 
      payload: data 
    });
  }, []);

  const setCausasBasicasData = useCallback((section, data) => {
    dispatch({ 
      type: ACTIONS.SET_CAUSAS_BASICAS_DATA, 
      section, 
      payload: data 
    });
  }, []);

  const setNecesidadesControlData = useCallback((data) => {
    dispatch({ type: ACTIONS.SET_NECESIDADES_CONTROL_DATA, payload: data });
  }, []);

  // Función para establecer modo edición
  const setEditingMode = useCallback((isEditing, projectId = null) => {
    console.log('=== ESTABLECIENDO MODO EDICIÓN ===');
    console.log('isEditing:', isEditing, 'projectId:', projectId);
    
    dispatch({ 
      type: ACTIONS.SET_EDITING_MODE, 
      payload: { isEditing, projectId } 
    });
  }, []);

  // Función para establecer proyecto actual
  const setCurrentProject = useCallback((projectId) => {
    console.log('=== ESTABLECIENDO PROYECTO ACTUAL ===');
    console.log('projectId:', projectId);
    
    dispatch({ 
      type: ACTIONS.SET_CURRENT_PROJECT, 
      payload: projectId 
    });
  }, []);

  // Reset completo
  const resetAllData = useCallback(() => {
    console.log('=== RESET COMPLETO DE DATOS ===');
    
    // Limpiar timeout de auto-guardado
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    dispatch({ type: ACTIONS.RESET_DATA });
    localStorage.removeItem('scatData');
    lastSavedStateRef.current = null;
  }, []);

  // Cargar proyecto para visualización o edición
  const loadProjectData = useCallback((projectData) => {
    console.log('=== CARGANDO DATOS DE PROYECTO ===');
    console.log('Datos del proyecto:', projectData);

    try {
      // Construir estado completo con fusión segura de datos
      const completeState = {
        // Datos básicos del proyecto
        projectData: safeDataMerge(initialState.projectData, projectData.formData),
        
        // Datos SCAT con fusión segura
        evaluacionData: safeDataMerge(initialState.evaluacionData, projectData.scatData?.evaluacion),
        contactoData: safeDataMerge(initialState.contactoData, projectData.scatData?.contacto),
        causasInmediatasData: safeDataMerge(initialState.causasInmediatasData, projectData.scatData?.causasInmediatas),
        causasBasicasData: safeDataMerge(initialState.causasBasicasData, projectData.scatData?.causasBasicas),
        necesidadesControlData: safeDataMerge(initialState.necesidadesControlData, projectData.scatData?.necesidadesControl),
        
        // Metadatos
        lastModified: projectData.lastModified || new Date().toISOString(),
        dataVersion: (projectData.version || 1),
        isEditing: false, // Se establecerá por separado si es necesario
        editingProjectId: null,
        currentProjectId: projectData.id // Establecer proyecto actual
      };

      console.log('=== ESTADO COMPLETO CONSTRUIDO ===');
      console.log('Estado completo:', completeState);

      // Cargar estado completo
      dispatch({ type: ACTIONS.LOAD_DATA, payload: completeState });
      
      console.log('=== PROYECTO CARGADO EXITOSAMENTE ===');
      return true;
    } catch (error) {
      console.error('Error cargando proyecto:', error);
      return false;
    }
  }, []);

  // Obtener resumen completo
  const getCompleteSummary = useCallback(() => {
    return {
      project: state.projectData,
      evaluacion: state.evaluacionData,
      contacto: state.contactoData,
      causasInmediatas: state.causasInmediatasData,
      causasBasicas: state.causasBasicasData,
      necesidadesControl: state.necesidadesControlData,
      metadata: {
        lastModified: state.lastModified,
        dataVersion: state.dataVersion,
        isEditing: state.isEditing,
        editingProjectId: state.editingProjectId,
        currentProjectId: state.currentProjectId
      }
    };
  }, [state]);

  // Verificar si hay datos
  const hasData = useCallback(() => {
    const { projectData, evaluacionData, contactoData, causasInmediatasData, causasBasicasData, necesidadesControlData } = state;
    
    return (
      Object.values(projectData).some(value => value && value.toString().trim() !== '') ||
      Object.values(evaluacionData).some(value => value !== null && value !== undefined) ||
      contactoData.selectedIncidents.length > 0 ||
      contactoData.observation?.trim() ||
      contactoData.image ||
      causasInmediatasData.actos.selectedItems.length > 0 ||
      causasInmediatasData.condiciones.selectedItems.length > 0 ||
      causasInmediatasData.actos.observation?.trim() ||
      causasInmediatasData.condiciones.observation?.trim() ||
      causasInmediatasData.actos.image ||
      causasInmediatasData.condiciones.image ||
      causasBasicasData.personales.selectedItems.length > 0 ||
      causasBasicasData.laborales.selectedItems.length > 0 ||
      causasBasicasData.personales.observation?.trim() ||
      causasBasicasData.laborales.observation?.trim() ||
      causasBasicasData.personales.image ||
      causasBasicasData.laborales.image ||
      necesidadesControlData.selectedItems.length > 0 ||
      necesidadesControlData.globalObservation?.trim() ||
      necesidadesControlData.globalImage ||
      necesidadesControlData.medidasCorrectivas?.trim()
    );
  }, [state]);

  // Función para forzar guardado inmediato (SOLO ACTUALIZAR PROYECTO EXISTENTE)
  const forceSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveToProject();
  }, [autoSaveToProject]);

  // Valor del contexto
  const value = {
    // Estado
    ...state,
    
    // Funciones de actualización
    setProjectData,
    setEvaluacionData,
    setContactoData,
    setCausasInmediatasData,
    setCausasBasicasData,
    setNecesidadesControlData,
    setEditingMode,
    setCurrentProject,
    resetAllData,
    loadProjectData,
    forceSave,
    
    // Funciones de utilidad
    getCompleteSummary,
    hasData
  };

  return (
    <ScatDataContext.Provider value={value}>
      {children}
    </ScatDataContext.Provider>
  );
}