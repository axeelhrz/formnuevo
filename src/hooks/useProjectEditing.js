import { useCallback, useEffect, useRef } from 'react';
import { useScatData } from '../contexts/ScatContext';
import { useEditing } from '../contexts/EditingContext';

export function useProjectEditing() {
  const { 
    getCompleteSummary, 
    loadProjectForEditing, 
    resetAllData,
    setEditingState 
  } = useScatData();
  
  const {
    isEditing,
    projectId,
    projectData,
    status,
    error,
    hasUnsavedChanges,
    startEditing,
    stopEditing,
    updateProjectData,
    saveProject,
    EDITING_STATES
  } = useEditing();

  const lastSyncRef = useRef(null);
  const isLoadingRef = useRef(false);
  const initializationRef = useRef(false);

  // Sincronizar datos SCAT con el contexto de edición
  const syncScatData = useCallback(async () => {
    if (!isEditing || !projectId || isLoadingRef.current) return;

    try {
      const scatSummary = getCompleteSummary();
      const updatedData = {
        formData: scatSummary.project,
        scatData: {
          evaluacion: scatSummary.evaluacion,
          contacto: scatSummary.contacto,
          causasInmediatas: scatSummary.causasInmediatas,
          causasBasicas: scatSummary.causasBasicas,
          necesidadesControl: scatSummary.necesidadesControl
        }
      };

      // Solo actualizar si los datos han cambiado
      const currentDataString = JSON.stringify(updatedData);
      if (lastSyncRef.current !== currentDataString) {
        updateProjectData(updatedData);
        lastSyncRef.current = currentDataString;
      }
    } catch (error) {
      console.error('Error sincronizando datos SCAT:', error);
    }
  }, [isEditing, projectId, getCompleteSummary, updateProjectData]);

  // Iniciar edición de un proyecto - CORREGIDO
  const startProjectEditing = useCallback(async (project) => {
    if (initializationRef.current) {
      console.log('Ya se está inicializando, saltando...');
      return true;
    }

    try {
      console.log('=== INICIANDO EDICIÓN DE PROYECTO (HOOK) ===');
      console.log('Proyecto a editar:', project);

      initializationRef.current = true;
      isLoadingRef.current = true;

      // Verificar que el proyecto tiene los datos necesarios
      if (!project || !project.id) {
        throw new Error('Proyecto inválido o sin ID');
      }
      
      // Iniciar modo edición en el contexto de edición
      startEditing(project);
      
      console.log('=== EDICIÓN INICIADA EXITOSAMENTE (HOOK) ===');
      return true;
    } catch (error) {
      console.error('Error iniciando edición (hook):', error);
      return false;
    } finally {
      isLoadingRef.current = false;
      // Reset initialization flag after a delay
      setTimeout(() => {
        initializationRef.current = false;
      }, 1000);
    }
  }, [startEditing]);

  // Finalizar edición - CORREGIDO
  const finishProjectEditing = useCallback(async (saveChanges = true) => {
    try {
      console.log('=== FINALIZANDO EDICIÓN (HOOK) ===');
      
      if (saveChanges && hasUnsavedChanges()) {
        // Sincronizar datos finales
        await syncScatData();
        
        // Guardar proyecto
        const saved = await saveProject(false);
        if (!saved) {
          throw new Error('No se pudieron guardar los cambios');
        }
      }
      
      // Limpiar contextos
      stopEditing();
      setEditingState(false, null);
      
      // Reset refs
      lastSyncRef.current = null;
      initializationRef.current = false;
      
      console.log('Edición finalizada exitosamente (hook)');
      return true;
    } catch (error) {
      console.error('Error finalizando edición (hook):', error);
      return false;
    }
  }, [hasUnsavedChanges, syncScatData, saveProject, stopEditing, setEditingState]);

  // Guardar progreso actual
  const saveProgress = useCallback(async (silent = false) => {
    if (!isEditing || isLoadingRef.current) return false;
    
    try {
      // Sincronizar datos actuales
      await syncScatData();
      
      // Guardar
      return await saveProject(silent);
    } catch (error) {
      console.error('Error guardando progreso:', error);
      return false;
    }
  }, [isEditing, syncScatData, saveProject]);

  // Auto-sincronización periódica (reducida para evitar conflictos)
  useEffect(() => {
    if (isEditing && status !== EDITING_STATES.SAVING && !isLoadingRef.current && !initializationRef.current) {
      const interval = setInterval(syncScatData, 15000); // Cada 15 segundos
      return () => clearInterval(interval);
    }
  }, [isEditing, status, syncScatData, EDITING_STATES.SAVING]);

  // Verificar cambios antes de salir
  const canExit = useCallback(() => {
    if (!isEditing) return true;
    
    if (hasUnsavedChanges()) {
      return window.confirm(
        '¿Estás seguro de que quieres salir? Hay cambios sin guardar que se perderán.'
      );
    }
    
    return true;
  }, [isEditing, hasUnsavedChanges]);

  return {
    // Estado
    isEditing,
    projectId,
    projectData,
    status,
    error,
    hasUnsavedChanges: hasUnsavedChanges(),
    
    // Funciones
    startProjectEditing,
    finishProjectEditing,
    saveProgress,
    syncScatData,
    canExit,
    
    // Estados
    EDITING_STATES,
    
    // Helpers
    isLoading: status === EDITING_STATES.LOADING || isLoadingRef.current,
    isSaving: status === EDITING_STATES.SAVING,
    isSaved: status === EDITING_STATES.SAVED,
    hasError: status === EDITING_STATES.ERROR
  };
}