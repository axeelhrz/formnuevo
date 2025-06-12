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
  currentProjectId: null
};

// Función para crear copia profunda MEJORADA
const deepClone = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

// Función para obtener estado inicial limpio
const getCleanInitialState = () => deepClone(initialState);

// Función COMPLETAMENTE NUEVA para fusionar datos PRESERVANDO TODO
const preserveAndMergeData = (baseStructure, incomingData) => {
  console.log('=== PRESERVANDO Y FUSIONANDO DATOS ===');
  console.log('Estructura base:', baseStructure);
  console.log('Datos entrantes:', incomingData);
  
  // Si no hay datos entrantes, usar la estructura base
  if (!incomingData || typeof incomingData !== 'object') {
    console.log('No hay datos entrantes válidos, usando estructura base');
    return deepClone(baseStructure);
  }
  
  // Crear resultado fusionado
  const result = deepClone(baseStructure);
  
  // Fusionar cada propiedad de manera inteligente
  Object.keys(baseStructure).forEach(key => {
    if (incomingData.hasOwnProperty(key)) {
      const baseValue = baseStructure[key];
      const incomingValue = incomingData[key];
      
      if (incomingValue === null || incomingValue === undefined) {
        // Mantener valor base si el entrante es null/undefined
        result[key] = baseValue;
      } else if (Array.isArray(baseValue)) {
        // Para arrays, usar el entrante si es válido
        result[key] = Array.isArray(incomingValue) ? deepClone(incomingValue) : baseValue;
      } else if (typeof baseValue === 'object' && baseValue !== null) {
        // Para objetos, fusionar recursivamente
        result[key] = preserveAndMergeData(baseValue, incomingValue);
      } else {
        // Para primitivos, usar el valor entrante
        result[key] = incomingValue;
      }
    }
  });
  
  console.log('Resultado fusionado:', result);
  return result;
};

// Reducer COMPLETAMENTE REESCRITO
function scatDataReducer(state, action) {
  console.log('=== REDUCER ACTION ===', action.type, action.payload);
  
  switch (action.type) {
    case ACTIONS.SET_PROJECT_DATA:
      return {
        ...state,
        projectData: { ...state.projectData, ...action.payload },
        lastModified: new Date().toISOString()
      };
    
    case ACTIONS.SET_EVALUACION_DATA:
      return {
        ...state,
        evaluacionData: { ...state.evaluacionData, ...action.payload },
        lastModified: new Date().toISOString()
      };
    
    case ACTIONS.SET_CONTACTO_DATA:
      return {
        ...state,
        contactoData: { ...state.contactoData, ...action.payload },
        lastModified: new Date().toISOString()
      };
    
    case ACTIONS.SET_CAUSAS_INMEDIATAS_DATA:
      return {
        ...state,
        causasInmediatasData: {
          ...state.causasInmediatasData,
          [action.section]: {
            ...state.causasInmediatasData[action.section],
            ...action.payload
          }
        },
        lastModified: new Date().toISOString()
      };
    
    case ACTIONS.SET_CAUSAS_BASICAS_DATA:
      return {
        ...state,
        causasBasicasData: {
          ...state.causasBasicasData,
          [action.section]: {
            ...state.causasBasicasData[action.section],
            ...action.payload
          }
        },
        lastModified: new Date().toISOString()
      };
    
    case ACTIONS.SET_NECESIDADES_CONTROL_DATA:
      return {
        ...state,
        necesidadesControlData: { ...state.necesidadesControlData, ...action.payload },
        lastModified: new Date().toISOString()
      };
    
    case ACTIONS.LOAD_DATA:
      console.log('=== CARGANDO DATOS COMPLETOS EN REDUCER ===');
      console.log('Payload completo:', action.payload);
      
      // CRÍTICO: Cargar EXACTAMENTE los datos que vienen, sin modificaciones
      const loadedState = {
        ...action.payload,
        dataVersion: (action.payload.dataVersion || 0) + 1,
        lastModified: new Date().toISOString()
      };
      
      console.log('Estado cargado en reducer:', loadedState);
      return loadedState;
    
    case ACTIONS.SET_EDITING_MODE:
      return {
        ...state,
        isEditing: action.payload.isEditing,
        editingProjectId: action.payload.projectId,
        currentProjectId: action.payload.projectId,
        lastModified: new Date().toISOString()
      };
    
    case ACTIONS.SET_CURRENT_PROJECT:
      return {
        ...state,
        currentProjectId: action.payload,
        lastModified: new Date().toISOString()
      };
    
    case ACTIONS.RESET_DATA:
      console.log('=== RESETEANDO DATOS ===');
      return getCleanInitialState();
    
    default:
      return state;
  }
}

// Provider COMPLETAMENTE REESCRITO
export function ScatDataProvider({ children }) {
  const [state, dispatch] = useReducer(scatDataReducer, getCleanInitialState());
  const isInitializedRef = useRef(false);
  const lastSavedStateRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Función para auto-guardar datos SCAT en proyecto existente - MEJORADA PARA SER MÁS INMEDIATA
  const autoSaveToProject = useCallback(() => {
    if (!state.currentProjectId) {
      console.log('No hay proyecto actual para auto-guardar');
      return;
    }

    try {
      console.log('=== AUTO-GUARDANDO DATOS SCAT EN PROYECTO EXISTENTE (INMEDIATO) ===');
      console.log('Project ID:', state.currentProjectId);

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

      // SIEMPRE actualizar, incluso si no hay datos SCAT nuevos
      const updatedProject = {
        ...projects[projectIndex],
        // PRESERVAR formData existente y actualizar con datos del contexto
        formData: {
          ...projects[projectIndex].formData,
          ...state.projectData
        },
        scatData: scatData,
        lastModified: new Date().toISOString(),
        version: (projects[projectIndex].version || 1) + 1,
        // Actualizar nombre si hay datos del evento
        name: state.projectData.evento?.trim() || projects[projectIndex].name || "Proyecto",
        description: state.projectData.otrosDatos?.trim() || 
          (state.projectData.involucrado?.trim() ? 
            `Involucrado: ${state.projectData.involucrado} - Área: ${state.projectData.area}` : 
            projects[projectIndex].description)
      };

      projects[projectIndex] = updatedProject;
      localStorage.setItem('scatProjects', JSON.stringify(projects));
      
      console.log('=== DATOS AUTO-GUARDADOS EXITOSAMENTE (INMEDIATO) ===');
      console.log('Proyecto actualizado:', updatedProject);
      
    } catch (error) {
      console.error('Error en auto-guardado:', error);
    }
  }, [state]);

  // Inicialización
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log('=== INICIALIZANDO SCAT DATA CONTEXT ===');
      isInitializedRef.current = true;
    }
  }, []);

  // Auto-guardado INMEDIATO con debounce MÁS CORTO
  useEffect(() => {
    if (isInitializedRef.current) {
      const currentStateString = JSON.stringify(state);
      
      if (lastSavedStateRef.current !== currentStateString) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        // REDUCIR TIEMPO DE DEBOUNCE A 300ms PARA GUARDADO MÁS INMEDIATO
        autoSaveTimeoutRef.current = setTimeout(() => {
          if (state.currentProjectId) {
            autoSaveToProject();
          } else {
            console.log('Auto-guardando datos temporales');
            localStorage.setItem('scatData', currentStateString);
          }
        }, 300); // Reducido de 1000ms a 300ms

        lastSavedStateRef.current = currentStateString;
      }
    }
  }, [state, autoSaveToProject]);

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
    console.log('=== ESTABLECIENDO DATOS DEL PROYECTO ===', data);
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
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    dispatch({ type: ACTIONS.RESET_DATA });
    localStorage.removeItem('scatData');
    lastSavedStateRef.current = null;
  }, []);

  // FUNCIÓN CRÍTICA: Cargar proyecto PRESERVANDO ABSOLUTAMENTE TODO
  const loadProjectData = useCallback((projectData) => {
    console.log('=== CARGANDO DATOS DE PROYECTO (PRESERVACIÓN TOTAL) ===');
    console.log('Proyecto completo recibido:', projectData);

    try {
      if (!projectData || !projectData.id) {
        console.error('Datos del proyecto inválidos');
        return false;
      }

      // CONSTRUIR ESTADO COMPLETO PRESERVANDO ABSOLUTAMENTE TODO
      const completeState = {
        // PRESERVAR DATOS DEL PROYECTO COMPLETAMENTE
        projectData: preserveAndMergeData(initialState.projectData, projectData.formData || {}),
        
        // PRESERVAR DATOS SCAT COMPLETAMENTE
        evaluacionData: preserveAndMergeData(initialState.evaluacionData, projectData.scatData?.evaluacion || {}),
        contactoData: preserveAndMergeData(initialState.contactoData, projectData.scatData?.contacto || {}),
        causasInmediatasData: preserveAndMergeData(initialState.causasInmediatasData, projectData.scatData?.causasInmediatas || {}),
        causasBasicasData: preserveAndMergeData(initialState.causasBasicasData, projectData.scatData?.causasBasicas || {}),
        necesidadesControlData: preserveAndMergeData(initialState.necesidadesControlData, projectData.scatData?.necesidadesControl || {}),
        
        // Metadatos
        lastModified: projectData.lastModified || new Date().toISOString(),
        dataVersion: (projectData.version || 1),
        isEditing: false,
        editingProjectId: null,
        currentProjectId: projectData.id
      };

      console.log('=== ESTADO COMPLETO CONSTRUIDO (PRESERVACIÓN TOTAL) ===');
      console.log('Estado completo a cargar:', completeState);

      // VERIFICACIÓN CRÍTICA: Mostrar que los datos se preservaron
      console.log('=== VERIFICACIÓN DE PRESERVACIÓN DE DATOS ===');
      console.log('Datos del formulario preservados:', completeState.projectData);
      console.log('Datos SCAT preservados:');
      console.log('- Evaluación:', completeState.evaluacionData);
      console.log('- Contacto:', completeState.contactoData);
      console.log('- Causas Inmediatas:', completeState.causasInmediatasData);
      console.log('- Causas Básicas:', completeState.causasBasicasData);
      console.log('- Necesidades Control:', completeState.necesidadesControlData);

      // Cargar estado completo en el reducer
      dispatch({ type: ACTIONS.LOAD_DATA, payload: completeState });
      
      console.log('=== PROYECTO CARGADO EXITOSAMENTE (TODOS LOS DATOS PRESERVADOS) ===');
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

  // Verificar si hay datos - MODIFICADA PARA SER MENOS RESTRICTIVA
  const hasData = useCallback(() => {
    const { projectData, evaluacionData, contactoData, causasInmediatasData, causasBasicasData, necesidadesControlData } = state;
    
    return (
      // Cualquier dato del proyecto cuenta
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

  // Función para forzar guardado inmediato
  const forceSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveToProject();
  }, [autoSaveToProject]);

  // Valor del contexto
  const value = {
    // Estado completo
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
