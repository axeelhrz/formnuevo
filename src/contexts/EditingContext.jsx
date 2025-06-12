import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';

// Contexto de edición
const EditingContext = createContext();

// Estados de edición
const EDITING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error'
};

// Acciones del reducer
const EDITING_ACTIONS = {
  SET_EDITING_MODE: 'SET_EDITING_MODE',
  SET_PROJECT_DATA: 'SET_PROJECT_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_SAVING: 'SET_SAVING',
  SET_SAVED: 'SET_SAVED',
  SET_ERROR: 'SET_ERROR',
  RESET: 'RESET'
};

// Estado inicial
const initialState = {
  isEditing: false,
  projectId: null,
  projectData: null,
  status: EDITING_STATES.IDLE,
  error: null,
  lastSaved: null,
  hasUnsavedChanges: false
};

// Reducer
function editingReducer(state, action) {
  switch (action.type) {
    case EDITING_ACTIONS.SET_EDITING_MODE:
      return {
        ...state,
        isEditing: action.payload.isEditing,
        projectId: action.payload.projectId,
        projectData: action.payload.projectData,
        status: EDITING_STATES.IDLE,
        error: null,
        hasUnsavedChanges: false
      };
    
    case EDITING_ACTIONS.SET_PROJECT_DATA:
      return {
        ...state,
        projectData: action.payload,
        hasUnsavedChanges: true
      };
    
    case EDITING_ACTIONS.SET_LOADING:
      return {
        ...state,
        status: EDITING_STATES.LOADING,
        error: null
      };
    
    case EDITING_ACTIONS.SET_SAVING:
      return {
        ...state,
        status: EDITING_STATES.SAVING,
        error: null
      };
    
    case EDITING_ACTIONS.SET_SAVED:
      return {
        ...state,
        status: EDITING_STATES.SAVED,
        lastSaved: new Date().toISOString(),
        hasUnsavedChanges: false,
        error: null
      };
    
    case EDITING_ACTIONS.SET_ERROR:
      return {
        ...state,
        status: EDITING_STATES.ERROR,
        error: action.payload
      };
    
    case EDITING_ACTIONS.RESET:
      return initialState;
    
    default:
      return state;
  }
}

// Provider
export function EditingProvider({ children }) {
  const [state, dispatch] = useReducer(editingReducer, initialState);
  const autoSaveTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Auto-guardado cada 30 segundos si hay cambios
  useEffect(() => {
    if (state.isEditing && state.hasUnsavedChanges && state.status !== EDITING_STATES.SAVING) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveProject(true); // Auto-save silencioso
      }, 30000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.hasUnsavedChanges, state.isEditing, state.status]);

  // Función para iniciar modo edición
  const startEditing = useCallback((projectData) => {
    console.log('=== INICIANDO MODO EDICIÓN ===');
    console.log('Proyecto:', projectData);
    
    dispatch({
      type: EDITING_ACTIONS.SET_EDITING_MODE,
      payload: {
        isEditing: true,
        projectId: projectData.id,
        projectData: projectData
      }
    });
  }, []);

  // Función para salir del modo edición
  const stopEditing = useCallback(() => {
    console.log('=== SALIENDO DEL MODO EDICIÓN ===');
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    dispatch({ type: EDITING_ACTIONS.RESET });
  }, []);

  // Función para actualizar datos del proyecto
  const updateProjectData = useCallback((newData) => {
    if (state.isEditing) {
      const updatedProject = {
        ...state.projectData,
        ...newData,
        lastModified: new Date().toISOString()
      };
      
      dispatch({
        type: EDITING_ACTIONS.SET_PROJECT_DATA,
        payload: updatedProject
      });
    }
  }, [state.isEditing, state.projectData]);

  // Función para guardar proyecto
  const saveProject = useCallback(async (silent = false) => {
    if (!state.isEditing || !state.projectData || state.status === EDITING_STATES.SAVING) {
      return false;
    }

    try {
      dispatch({ type: EDITING_ACTIONS.SET_SAVING });
      
      console.log('=== GUARDANDO PROYECTO ===');
      console.log('Datos a guardar:', state.projectData);

      // Obtener proyectos del localStorage
      const savedProjects = localStorage.getItem('scatProjects');
      if (!savedProjects) {
        throw new Error('No se encontraron proyectos en localStorage');
      }

      const projects = JSON.parse(savedProjects);
      const projectIndex = projects.findIndex(p => p.id === state.projectId);
      
      if (projectIndex === -1) {
        throw new Error('Proyecto no encontrado');
      }

      // Actualizar proyecto
      const updatedProject = {
        ...projects[projectIndex],
        ...state.projectData,
        version: (projects[projectIndex].version || 1) + 1
      };

      projects[projectIndex] = updatedProject;
      
      // Guardar en localStorage
      localStorage.setItem('scatProjects', JSON.stringify(projects));
      
      dispatch({ type: EDITING_ACTIONS.SET_SAVED });
      
      if (!silent) {
        console.log('Proyecto guardado exitosamente');
      }
      
      return true;
    } catch (error) {
      console.error('Error guardando proyecto:', error);
      dispatch({
        type: EDITING_ACTIONS.SET_ERROR,
        payload: error.message
      });
      return false;
    }
  }, [state.isEditing, state.projectData, state.projectId, state.status]);

  // Función para verificar si hay cambios sin guardar
  const hasUnsavedChanges = useCallback(() => {
    return state.hasUnsavedChanges;
  }, [state.hasUnsavedChanges]);

  // Función para obtener el estado actual
  const getEditingStatus = useCallback(() => {
    return {
      isEditing: state.isEditing,
      status: state.status,
      error: state.error,
      lastSaved: state.lastSaved,
      hasUnsavedChanges: state.hasUnsavedChanges,
      projectData: state.projectData
    };
  }, [state]);

  const value = {
    // Estado
    ...state,
    
    // Funciones
    startEditing,
    stopEditing,
    updateProjectData,
    saveProject,
    hasUnsavedChanges,
    getEditingStatus,
    
    // Estados
    EDITING_STATES
  };

  return (
    <EditingContext.Provider value={value}>
      {children}
    </EditingContext.Provider>
  );
}

// Hook personalizado
export function useEditing() {
  const context = useContext(EditingContext);
  if (!context) {
    throw new Error('useEditing must be used within an EditingProvider');
  }
  return context;
}
