/**
 * Normaliza los datos SCAT para asegurar consistencia en la generación de PDFs
 * @param {Object} rawData - Datos en bruto del proyecto o contexto
 * @returns {Object} - Datos normalizados para PDF
 */
export const normalizePDFData = (rawData) => {
  // Estructura base normalizada
  const normalizedData = {
    project: {
      evento: '',
      involucrado: '',
      area: '',
      fechaHora: '',
      investigador: '',
      otrosDatos: ''
    },
    evaluacion: {
      severity: null,
      probability: null,
      frequency: null
    },
    contacto: {
      selectedIncidents: [],
      image: null,
      observation: ''
    },
    causasInmediatas: {
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
    causasBasicas: {
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
    necesidadesControl: {
      selectedItems: [],
      detailedData: {},
      globalImage: null,
      globalObservation: '',
      medidasCorrectivas: ''
    }
  };

  // Normalizar datos del proyecto
  if (rawData.project || rawData.formData) {
    const projectData = rawData.project || rawData.formData || {};
    normalizedData.project = {
      evento: projectData.evento || '',
      involucrado: projectData.involucrado || '',
      area: projectData.area || '',
      fechaHora: projectData.fechaHora || '',
      investigador: projectData.investigador || '',
      otrosDatos: projectData.otrosDatos || ''
    };
  }

  // Normalizar datos de evaluación
  if (rawData.evaluacion) {
    normalizedData.evaluacion = {
      severity: rawData.evaluacion.severity || null,
      probability: rawData.evaluacion.probability || null,
      frequency: rawData.evaluacion.frequency || null
    };
  }

  // Normalizar datos de contacto
  if (rawData.contacto) {
    normalizedData.contacto = {
      selectedIncidents: Array.isArray(rawData.contacto.selectedIncidents) 
        ? [...rawData.contacto.selectedIncidents] 
        : [],
      image: rawData.contacto.image || null,
      observation: rawData.contacto.observation || ''
    };
  }

  // Normalizar causas inmediatas
  if (rawData.causasInmediatas) {
    // Actos
    if (rawData.causasInmediatas.actos) {
      normalizedData.causasInmediatas.actos = {
        selectedItems: Array.isArray(rawData.causasInmediatas.actos.selectedItems)
          ? [...rawData.causasInmediatas.actos.selectedItems]
          : [],
        image: rawData.causasInmediatas.actos.image || null,
        observation: rawData.causasInmediatas.actos.observation || ''
      };
    }

    // Condiciones
    if (rawData.causasInmediatas.condiciones) {
      normalizedData.causasInmediatas.condiciones = {
        selectedItems: Array.isArray(rawData.causasInmediatas.condiciones.selectedItems)
          ? [...rawData.causasInmediatas.condiciones.selectedItems]
          : [],
        image: rawData.causasInmediatas.condiciones.image || null,
        observation: rawData.causasInmediatas.condiciones.observation || ''
      };
    }
  }

  // Normalizar causas básicas
  if (rawData.causasBasicas) {
    // Personales
    if (rawData.causasBasicas.personales) {
      normalizedData.causasBasicas.personales = {
        selectedItems: Array.isArray(rawData.causasBasicas.personales.selectedItems)
          ? [...rawData.causasBasicas.personales.selectedItems]
          : [],
        detailedSelections: rawData.causasBasicas.personales.detailedSelections 
          ? { ...rawData.causasBasicas.personales.detailedSelections }
          : {},
        image: rawData.causasBasicas.personales.image || null,
        observation: rawData.causasBasicas.personales.observation || ''
      };
    }

    // Laborales
    if (rawData.causasBasicas.laborales) {
      normalizedData.causasBasicas.laborales = {
        selectedItems: Array.isArray(rawData.causasBasicas.laborales.selectedItems)
          ? [...rawData.causasBasicas.laborales.selectedItems]
          : [],
        detailedSelections: rawData.causasBasicas.laborales.detailedSelections 
          ? { ...rawData.causasBasicas.laborales.detailedSelections }
          : {},
        image: rawData.causasBasicas.laborales.image || null,
        observation: rawData.causasBasicas.laborales.observation || ''
      };
    }
  }

  // Normalizar necesidades de control
  if (rawData.necesidadesControl) {
    normalizedData.necesidadesControl = {
      selectedItems: Array.isArray(rawData.necesidadesControl.selectedItems)
        ? [...rawData.necesidadesControl.selectedItems]
        : [],
      detailedData: rawData.necesidadesControl.detailedData 
        ? { ...rawData.necesidadesControl.detailedData }
        : {},
      globalImage: rawData.necesidadesControl.globalImage || null,
      globalObservation: rawData.necesidadesControl.globalObservation || '',
      medidasCorrectivas: rawData.necesidadesControl.medidasCorrectivas || ''
    };
  }

  return normalizedData;
};

/**
 * Genera datos PDF desde un proyecto guardado
 * @param {Object} project - Proyecto guardado con formData y scatData
 * @param {Object} currentFormData - Datos actuales del formulario (opcional)
 * @returns {Object} - Datos normalizados para PDF
 */
export const generatePDFDataFromProject = (project, currentFormData = null) => {
  const rawData = {
    // Usar datos actuales del formulario si se proporcionan, sino usar los guardados
    project: currentFormData || project.formData || {},
    evaluacion: project.scatData?.evaluacion || {},
    contacto: project.scatData?.contacto || {},
    causasInmediatas: project.scatData?.causasInmediatas || {},
    causasBasicas: project.scatData?.causasBasicas || {},
    necesidadesControl: project.scatData?.necesidadesControl || {}
  };

  return normalizePDFData(rawData);
};

/**
 * Genera datos PDF desde el contexto SCAT
 * @param {Object} scatSummary - Resumen completo del contexto SCAT
 * @returns {Object} - Datos normalizados para PDF
 */
export const generatePDFDataFromContext = (scatSummary) => {
  const rawData = {
    project: scatSummary.project || {},
    evaluacion: scatSummary.evaluacion || {},
    contacto: scatSummary.contacto || {},
    causasInmediatas: scatSummary.causasInmediatas || {},
    causasBasicas: scatSummary.causasBasicas || {},
    necesidadesControl: scatSummary.necesidadesControl || {}
  };

  return normalizePDFData(rawData);
};
