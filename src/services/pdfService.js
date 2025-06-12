import jsPDF from 'jspdf';

class PDFService {
  constructor() {
    this.doc = null;
    this.currentY = 20;
    this.pageHeight = 297; // A4 height in mm
    this.margin = 20;
    this.lineHeight = 7;
    this.maxImageWidth = 150; // Ancho máximo para imágenes
    this.maxImageHeight = 100; // Alto máximo para imágenes
  }

  // Inicializar documento PDF
  initDocument() {
    this.doc = new jsPDF();
    this.currentY = 20;
    
    // Configurar fuente
    this.doc.setFont('helvetica');
  }

  // Verificar si necesita nueva página
  checkPageBreak(requiredSpace = 20) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = 20;
      return true;
    }
    return false;
  }

  // Agregar título principal
  addMainTitle(title) {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 15;
  }

  // Agregar subtítulo
  addSubtitle(subtitle) {
    this.checkPageBreak(15);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(subtitle, this.margin, this.currentY);
    this.currentY += 10;
  }

  // Agregar texto normal
  addText(text, indent = 0) {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const maxWidth = 170 - indent;
    const lines = this.doc.splitTextToSize(text, maxWidth);
    
    lines.forEach(line => {
      this.checkPageBreak();
      this.doc.text(line, this.margin + indent, this.currentY);
      this.currentY += this.lineHeight;
    });
  }

  // Agregar lista con viñetas
  addBulletList(items, indent = 5) {
    items.forEach(item => {
      this.checkPageBreak();
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('•', this.margin + indent, this.currentY);
      
      const maxWidth = 165 - indent;
      const lines = this.doc.splitTextToSize(item, maxWidth);
      
      lines.forEach((line, index) => {
        if (index > 0) {
          this.checkPageBreak();
        }
        this.doc.text(line, this.margin + indent + 5, this.currentY);
        if (index < lines.length - 1) {
          this.currentY += this.lineHeight;
        }
      });
      
      this.currentY += this.lineHeight + 2;
    });
  }

  // Agregar imagen al PDF
  addImage(imageData, title = null) {
    if (!imageData) return;

    try {
      // Verificar si hay espacio suficiente para la imagen
      this.checkPageBreak(this.maxImageHeight + 20);

      if (title) {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, this.margin, this.currentY);
        this.currentY += 8;
      }

      // Crear una imagen temporal para obtener dimensiones
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        let imgWidth = this.maxImageWidth;
        let imgHeight = this.maxImageWidth / aspectRatio;

        // Ajustar si la altura es mayor al máximo
        if (imgHeight > this.maxImageHeight) {
          imgHeight = this.maxImageHeight;
          imgWidth = this.maxImageHeight * aspectRatio;
        }

        // Centrar la imagen
        const xPosition = this.margin + (170 - imgWidth) / 2;

        this.doc.addImage(imageData, 'JPEG', xPosition, this.currentY, imgWidth, imgHeight);
        this.currentY += imgHeight + 10;
      };
      
      // Para procesamiento síncrono, usar dimensiones por defecto
      const imgWidth = this.maxImageWidth;
      const imgHeight = this.maxImageHeight;
      const xPosition = this.margin + (170 - imgWidth) / 2;

      this.doc.addImage(imageData, 'JPEG', xPosition, this.currentY, imgWidth, imgHeight);
      this.currentY += imgHeight + 10;

    } catch (error) {
      console.error('Error adding image to PDF:', error);
      this.addText('Error: No se pudo cargar la imagen', 5);
    }
  }

  // Agregar línea separadora
  addSeparator() {
    this.checkPageBreak();
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, 190, this.currentY);
    this.currentY += 10;
  }

  // Agregar información del proyecto
  addProjectInfo(projectData) {
    this.addSubtitle('INFORMACIÓN DEL PROYECTO');
    
    const fields = [
      { label: 'Evento', value: projectData.evento },
      { label: 'Involucrado', value: projectData.involucrado },
      { label: 'Área', value: projectData.area },
      { label: 'Fecha y Hora', value: projectData.fechaHora },
      { label: 'Investigador', value: projectData.investigador },
      { label: 'Otros Datos', value: projectData.otrosDatos }
    ];

    fields.forEach(field => {
      if (field.value && field.value.trim() !== '') {
        this.addText(`${field.label}: ${field.value}`);
      }
    });

    this.addSeparator();
  }

  // Agregar datos de evaluación
  addEvaluacionData(evaluacionData) {
    if (!evaluacionData.severity && !evaluacionData.probability && !evaluacionData.frequency) {
      return;
    }

    this.addSubtitle('EVALUACIÓN POTENCIAL DE PÉRDIDA');

    const evaluationMap = {
      severity: {
        title: 'Potencial de Severidad de Pérdida',
        values: { A: 'Mayor', B: 'Grave', C: 'Menor' }
      },
      probability: {
        title: 'Probabilidad de Ocurrencia',
        values: { A: 'Alta', B: 'Moderada', C: 'Rara' }
      },
      frequency: {
        title: 'Frecuencia de Exposición',
        values: { A: 'Grande', B: 'Moderada', C: 'Baja' }
      }
    };

    Object.entries(evaluationMap).forEach(([key, config]) => {
      if (evaluacionData[key]) {
        this.addText(`${config.title}: ${evaluacionData[key]} - ${config.values[evaluacionData[key]]}`);
      }
    });

    this.addSeparator();
  }

  // Agregar datos de contacto
  addContactoData(contactoData, incidentsData) {
    if (contactoData.selectedIncidents.length === 0 && !contactoData.image && !contactoData.observation) {
      return;
    }

    this.addSubtitle('TIPO DE CONTACTO O CUASI CONTACTO');

    if (contactoData.selectedIncidents.length > 0) {
      const selectedIncidentTexts = contactoData.selectedIncidents.map(id => {
        const incident = incidentsData.find(inc => inc.id === id);
        return incident ? `${id}. ${incident.title}` : `${id}. Incidente no encontrado`;
      });

      this.addBulletList(selectedIncidentTexts);
    }

    // Agregar imagen si existe
    if (contactoData.image) {
      this.addImage(contactoData.image, 'Imagen de Contacto:');
    }

    // Agregar observaciones si existen
    if (contactoData.observation && contactoData.observation.trim() !== '') {
      this.addText('Observaciones:', 0);
      this.addText(contactoData.observation, 5);
    }

    this.addSeparator();
  }

  // Agregar datos de causas inmediatas
  addCausasInmediatasData(causasInmediatasData, actosData, condicionesData) {
    let hasData = false;

    if (causasInmediatasData.actos.selectedItems.length > 0 || 
        causasInmediatasData.actos.image || 
        causasInmediatasData.actos.observation) {
      hasData = true;
      this.addSubtitle('CAUSAS INMEDIATAS - ACTOS SUBESTÁNDAR');
      
      if (causasInmediatasData.actos.selectedItems.length > 0) {
        const selectedActos = causasInmediatasData.actos.selectedItems.map(id => {
          const acto = actosData.find(item => item.id === id);
          return acto ? `${id}. ${acto.text}` : `${id}. Acto no encontrado`;
        });

        this.addBulletList(selectedActos);
      }

      // Agregar imagen si existe
      if (causasInmediatasData.actos.image) {
        this.addImage(causasInmediatasData.actos.image, 'Imagen de Actos Subestándar:');
      }

      // Agregar observaciones si existen
      if (causasInmediatasData.actos.observation && causasInmediatasData.actos.observation.trim() !== '') {
        this.addText('Observaciones:', 0);
        this.addText(causasInmediatasData.actos.observation, 5);
      }
    }

    if (causasInmediatasData.condiciones.selectedItems.length > 0 || 
        causasInmediatasData.condiciones.image || 
        causasInmediatasData.condiciones.observation) {
      hasData = true;
      if (causasInmediatasData.actos.selectedItems.length > 0 || 
          causasInmediatasData.actos.image || 
          causasInmediatasData.actos.observation) {
        this.currentY += 5;
      }
      
      this.addSubtitle('CAUSAS INMEDIATAS - CONDICIONES SUBESTÁNDAR');
      
      if (causasInmediatasData.condiciones.selectedItems.length > 0) {
        const selectedCondiciones = causasInmediatasData.condiciones.selectedItems.map(id => {
          const condicion = condicionesData.find(item => item.id === id);
          return condicion ? `${id}. ${condicion.text}` : `${id}. Condición no encontrada`;
        });

        this.addBulletList(selectedCondiciones);
      }

      // Agregar imagen si existe
      if (causasInmediatasData.condiciones.image) {
        this.addImage(causasInmediatasData.condiciones.image, 'Imagen de Condiciones Subestándar:');
      }

      // Agregar observaciones si existen
      if (causasInmediatasData.condiciones.observation && causasInmediatasData.condiciones.observation.trim() !== '') {
        this.addText('Observaciones:', 0);
        this.addText(causasInmediatasData.condiciones.observation, 5);
      }
    }

    if (hasData) {
      this.addSeparator();
    }
  }

  // Agregar datos de causas básicas
  addCausasBasicasData(causasBasicasData, personalesData, laboralesData) {
    let hasData = false;

    if (causasBasicasData.personales.selectedItems.length > 0 || 
        causasBasicasData.personales.image || 
        causasBasicasData.personales.observation) {
      hasData = true;
      this.addSubtitle('CAUSAS BÁSICAS - FACTORES PERSONALES');
      
      if (causasBasicasData.personales.selectedItems.length > 0) {
        const selectedPersonales = causasBasicasData.personales.selectedItems.map(id => {
          const factor = personalesData.find(item => item.id === id);
          let text = factor ? `${id}. ${factor.text}` : `${id}. Factor no encontrado`;
          
          // Agregar detalles si existen
          if (causasBasicasData.personales.detailedSelections && 
              causasBasicasData.personales.detailedSelections[id] && 
              causasBasicasData.personales.detailedSelections[id].length > 0) {
            const details = causasBasicasData.personales.detailedSelections[id];
            text += ` (${details.length} detalles seleccionados)`;
          }
          
          return text;
        });

        this.addBulletList(selectedPersonales);

        // Agregar detalles específicos si existen
        causasBasicasData.personales.selectedItems.forEach(id => {
          const factor = personalesData.find(item => item.id === id);
          const details = causasBasicasData.personales.detailedSelections?.[id];
          
          if (details && details.length > 0 && factor && factor.options) {
            this.addText(`Detalles de "${factor.text}":`, 5);
            const detailTexts = details.map(detailIndex => 
              factor.options[detailIndex] || `Detalle ${detailIndex + 1}`
            );
            this.addBulletList(detailTexts, 10);
          }
        });
      }

      // Agregar imagen si existe
      if (causasBasicasData.personales.image) {
        this.addImage(causasBasicasData.personales.image, 'Imagen de Factores Personales:');
      }

      // Agregar observaciones si existen
      if (causasBasicasData.personales.observation && causasBasicasData.personales.observation.trim() !== '') {
        this.addText('Observaciones:', 0);
        this.addText(causasBasicasData.personales.observation, 5);
      }
    }

    if (causasBasicasData.laborales.selectedItems.length > 0 || 
        causasBasicasData.laborales.image || 
        causasBasicasData.laborales.observation) {
      hasData = true;
      if (causasBasicasData.personales.selectedItems.length > 0 || 
          causasBasicasData.personales.image || 
          causasBasicasData.personales.observation) {
        this.currentY += 5;
      }
      
      this.addSubtitle('CAUSAS BÁSICAS - FACTORES LABORALES');
      
      if (causasBasicasData.laborales.selectedItems.length > 0) {
        const selectedLaborales = causasBasicasData.laborales.selectedItems.map(id => {
          const factor = laboralesData.find(item => item.id === id);
          let text = factor ? `${id}. ${factor.text}` : `${id}. Factor no encontrado`;
          
          // Agregar detalles si existen
          if (causasBasicasData.laborales.detailedSelections && 
              causasBasicasData.laborales.detailedSelections[id] && 
              causasBasicasData.laborales.detailedSelections[id].length > 0) {
            const details = causasBasicasData.laborales.detailedSelections[id];
            text += ` (${details.length} detalles seleccionados)`;
          }
          
          return text;
        });

        this.addBulletList(selectedLaborales);

        // Agregar detalles específicos si existen
        causasBasicasData.laborales.selectedItems.forEach(id => {
          const factor = laboralesData.find(item => item.id === id);
          const details = causasBasicasData.laborales.detailedSelections?.[id];
          
          if (details && details.length > 0 && factor && factor.options) {
            this.addText(`Detalles de "${factor.text}":`, 5);
            const detailTexts = details.map(detailIndex => 
              factor.options[detailIndex] || `Detalle ${detailIndex + 1}`
            );
            this.addBulletList(detailTexts, 10);
          }
        });
      }

      // Agregar imagen si existe
      if (causasBasicasData.laborales.image) {
        this.addImage(causasBasicasData.laborales.image, 'Imagen de Factores Laborales:');
      }

      // Agregar observaciones si existen
      if (causasBasicasData.laborales.observation && causasBasicasData.laborales.observation.trim() !== '') {
        this.addText('Observaciones:', 0);
        this.addText(causasBasicasData.laborales.observation, 5);
      }
    }

    if (hasData) {
      this.addSeparator();
    }
  }

  // Agregar datos de necesidades de control
  addNecesidadesControlData(necesidadesControlData, categoriesData) {
    if (necesidadesControlData.selectedItems.length === 0 && 
        !necesidadesControlData.globalImage && 
        !necesidadesControlData.globalObservation &&
        (!necesidadesControlData.medidasCorrectivas || necesidadesControlData.medidasCorrectivas.trim() === '')) {
      return;
    }

    this.addSubtitle('NECESIDADES DE ACCIÓN DE CONTROL (NAC)');

    if (necesidadesControlData.selectedItems.length > 0) {
      // Agrupar por categoría
      const groupedItems = {};
      
      necesidadesControlData.selectedItems.forEach(itemId => {
        categoriesData.forEach(category => {
          const item = category.items.find(item => item.id === itemId);
          if (item) {
            if (!groupedItems[category.title]) {
              groupedItems[category.title] = [];
            }
            
            let itemText = `${item.id}. ${item.text}`;
            
            // Agregar datos detallados si existen
            const detailedData = necesidadesControlData.detailedData?.[itemId];
            if (detailedData) {
              const details = [];
              if (detailedData.selectedOptions && detailedData.selectedOptions.length > 0) {
                details.push(`${detailedData.selectedOptions.length} opciones seleccionadas`);
              }
              if (detailedData.selectedPEC) {
                details.push(`Clasificación: ${detailedData.selectedPEC}`);
              }
              if (details.length > 0) {
                itemText += ` (${details.join(', ')})`;
              }
            }
            
            groupedItems[category.title].push(itemText);
          }
        });
      });

      Object.entries(groupedItems).forEach(([categoryTitle, items]) => {
        this.addText(categoryTitle + ':', 0);
        this.addBulletList(items, 10);
        this.currentY += 3;
      });

      // Agregar detalles específicos de cada item
      necesidadesControlData.selectedItems.forEach(itemId => {
        const detailedData = necesidadesControlData.detailedData?.[itemId];
        if (detailedData) {
          // Encontrar el item para obtener su título
          let itemTitle = `Item ${itemId}`;
          categoriesData.forEach(category => {
            const item = category.items.find(item => item.id === itemId);
            if (item) {
              itemTitle = `${item.id}. ${item.text}`;
            }
          });

          this.addText(`Detalles de "${itemTitle}":`, 0);

          // Agregar opciones seleccionadas
          if (detailedData.selectedOptions && detailedData.selectedOptions.length > 0) {
            categoriesData.forEach(category => {
              const item = category.items.find(item => item.id === itemId);
              if (item && item.options) {
                const selectedOptionTexts = detailedData.selectedOptions.map(optionIndex => 
                  item.options[optionIndex] || `Opción ${optionIndex + 1}`
                );
                this.addText('Opciones seleccionadas:', 5);
                this.addBulletList(selectedOptionTexts, 10);
              }
            });
          }

          // Agregar clasificación PEC
          if (detailedData.selectedPEC) {
            this.addText(`Clasificación P-E-C: ${detailedData.selectedPEC}`, 5);
          }

          // Agregar imagen específica del item
          if (detailedData.image) {
            this.addImage(detailedData.image, `Imagen de ${itemTitle}:`);
          }

          // Agregar comentarios específicos del item
          if (detailedData.comments && detailedData.comments.trim() !== '') {
            this.addText('Comentarios:', 5);
            this.addText(detailedData.comments, 10);
          }

          this.currentY += 5;
        }
      });
    }

    // Agregar imagen global si existe
    if (necesidadesControlData.globalImage) {
      this.addImage(necesidadesControlData.globalImage, 'Imagen General de Necesidades de Control:');
    }

    // Agregar observaciones generales si existen
    if (necesidadesControlData.globalObservation && necesidadesControlData.globalObservation.trim() !== '') {
      this.addText('Observaciones Generales:', 0);
      this.addText(necesidadesControlData.globalObservation, 5);
    }

    // NUEVA SECCIÓN: Agregar medidas correctivas si existen
    if (necesidadesControlData.medidasCorrectivas && necesidadesControlData.medidasCorrectivas.trim() !== '') {
      this.currentY += 5; // Espacio adicional antes de la nueva sección
      this.addSubtitle('MEDIDAS CORRECTIVAS');
      this.addText(necesidadesControlData.medidasCorrectivas, 0);
    }

    this.addSeparator();
  }

  // Agregar pie de página
  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      
      // Fecha de generación
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES') + ' ' + now.toLocaleTimeString('es-ES');
      this.doc.text(`Generado el: ${dateStr}`, this.margin, this.pageHeight - 10);
      
      // Número de página
      this.doc.text(`Página ${i} de ${pageCount}`, 190 - this.margin, this.pageHeight - 10, { align: 'right' });
    }
  }

  // Función principal para generar el PDF
  generatePDF(scatData) {
    this.initDocument();

    // Título principal
    this.addMainTitle('REPORTE SCAT - ANÁLISIS SISTEMÁTICO DE CAUSAS');
    this.currentY += 5;

    // Información del proyecto
    this.addProjectInfo(scatData.project);

    // Evaluación potencial de pérdida
    this.addEvaluacionData(scatData.evaluacion);

    // Datos de contacto
    const incidentsData = [
      { id: 1, title: "Golpeada Contra (chocar contra algo)" },
      { id: 2, title: "Golpeado por (Impactado por objeto en movimiento)" },
      { id: 3, title: "Caída a un nivel más bajo" },
      { id: 4, title: "Caída en el mismo nivel (Resbalar y caer, tropezar)" },
      { id: 5, title: "Atrapado (Puntos de Pellizco y Mordida)" },
      { id: 6, title: "Cogido (Enganchado, Colgado)" },
      { id: 7, title: "Atrapado entre o debajo (Chancado, Amputado)" },
      { id: 8, title: "Contacto con (Electricidad, Calor, Frío, Radiación, Causticos, Tóxicos, Ruido)" },
      { id: 9, title: "Golpeado por (Impactado por objeto en movimiento)" }
    ];
    this.addContactoData(scatData.contacto, incidentsData);

    // Datos de causas inmediatas
    const actosData = [
      { id: 1, text: "Operar equipos sin autorización" },
      { id: 2, text: "Omitir el uso de equipos de seguridad personal" },
      { id: 3, text: "Omitir el uso de dispositivos de seguridad" },
      { id: 4, text: "Operar a velocidad inadecuada" },
      { id: 5, text: "Poner fuera de servicio los dispositivos de seguridad" },
      { id: 6, text: "Usar equipos defectuosos" },
      { id: 7, text: "No usar o usar inadecuadamente el equipo de protección personal" },
      { id: 8, text: "Cargar incorrectamente" },
      { id: 9, text: "Colocar, mezclar, combinar, etc., de manera insegura" },
      { id: 10, text: "Levantar objetos en forma incorrecta" },
      { id: 11, text: "Adoptar una posición insegura para hacer el trabajo" },
      { id: 12, text: "Trabajar en equipos en movimiento o peligrosos" },
      { id: 13, text: "Distraerse, bromear, jugar, etc." },
      { id: 14, text: "Omitir el uso de equipos de protección personal disponibles" },
      { id: 15, text: "Usar equipos inseguros o usarlos inseguramente" }
    ];

    const condicionesData = [
      { id: 16, text: "Guardas inadecuadas" },
      { id: 17, text: "Equipos de protección inadecuados o insuficientes" },
      { id: 18, text: "Herramientas, equipos o materiales defectuosos" },
      { id: 19, text: "Espacio limitado para desenvolverse" },
      { id: 20, text: "Sistemas de advertencia inadecuados" },
      { id: 21, text: "Peligros de incendio y explosión" },
      { id: 22, text: "Orden y limpieza deficientes en el lugar de trabajo" },
      { id: 23, text: "Condiciones ambientales peligrosas" },
      { id: 24, text: "Iluminación deficiente" },
      { id: 25, text: "Ventilación deficiente" },
      { id: 26, text: "Ropa o vestimenta insegura" },
      { id: 27, text: "Congestión o acción restringida" },
      { id: 28, text: "Ubicación peligrosa de equipos y materiales" }
    ];

    this.addCausasInmediatasData(scatData.causasInmediatas, actosData, condicionesData);

    // Datos de causas básicas
    const personalesData = [
      { 
        id: 1, 
        text: 'Capacidad Física / Fisiológica Inadecuada',
        options: [
          "Altura, peso, talla, fuerza, alcance, etc. inadecuados",
          "Capacidad de movimiento corporal limitada",
          "Capacidad limitada para mantenerse en determinadas posiciones corporales",
          "Limitaciones sensoriales (vista, oído, tacto, gusto, olfato, equilibrio)",
          "Incapacidad respiratoria o circulatoria",
          "Otras deficiencias físicas permanentes",
          "Deficiencias temporales"
        ]
      },
      { 
        id: 2, 
        text: 'Capacidad Mental / Psicológica Inadecuada',
        options: [
          "Temores y fobias",
          "Problemas emocionales",
          "Enfermedad mental",
          "Nivel de inteligencia",
          "Incapacidad de comprensión",
          "Falta de juicio",
          "Deficiencias de coordinación",
          "Tiempo de reacción lento",
          "Aptitud mecánica deficiente",
          "Baja aptitud de aprendizaje"
        ]
      },
      { 
        id: 3, 
        text: 'Tensión Física o Fisiológica',
        options: [
          "Lesión o enfermedad",
          "Fatiga debido a la carga o duración de las tareas",
          "Fatiga debido a la falta de descanso",
          "Fatiga debido a sobrecarga sensorial",
          "Exposición a riesgos contra la salud",
          "Exposición a temperaturas extremas",
          "Insuficiencia de oxígeno",
          "Variaciones en la presión atmosférica",
          "Vibración",
          "Movimiento restringido",
          "Insuficiencia de azúcar en la sangre"
        ]
      },
      { 
        id: 4, 
        text: 'Tensión Mental o Psicológica',
        options: [
          "Sobrecarga emocional",
          "Fatiga debido a la carga o las exigencias mentales de la tarea",
          "Preocupaciones debido a problemas",
          "Frustración",
          "Enfermedad mental",
          "Sobrecarga sensorial"
        ]
      },
      { 
        id: 5, 
        text: 'Falta de Conocimiento',
        options: [
          "Falta de experiencia",
          "Orientación deficiente",
          "Entrenamiento inicial inadecuado",
          "Reentrenamiento insuficiente",
          "Órdenes mal interpretadas"
        ]
      },
      { 
        id: 6, 
        text: 'Falta de Habilidad',
        options: [
          "Instrucción inicial inadecuada",
          "Práctica insuficiente",
          "Operación esporádica",
          "Falta de preparación"
        ]
      },
      { 
        id: 7, 
        text: 'Motivación Incorrecta',
        options: [
          "El desempeño subestándar es más gratificante",
          "El desempeño estándar causa desagrado",
          "Falta de incentivos",
          "Demasiadas frustraciones",
          "Falta de desafío",
          "No existe intención de ahorro de tiempo y esfuerzo",
          "Presión indebida de los compañeros",
          "Ejemplo deficiente por parte de la supervisión",
          "Retroalimentación deficiente con respecto al desempeño",
          "Falta de refuerzo positivo para el comportamiento correcto",
          "Incentivos de producción inadecuados"
        ]
      }
    ];

    const laboralesData = [
      { 
        id: 8, 
        text: 'Liderazgo y/o Supervisión Deficiente',
        options: [
          "Relaciones jerárquicas poco claras o conflictivas",
          "Asignación de responsabilidades poco clara o conflictiva",
          "Delegación inadecuada o insuficiente",
          "Definición inadecuada de políticas, procedimientos, prácticas o líneas de acción",
          "Formulación inadecuada de objetivos, metas o normas",
          "Programación o planificación inadecuada del trabajo",
          "Instrucción, orientación y/o entrenamiento inadecuados",
          "Provisión inadecuada de referencia, instrucción y orientación",
          "Identificación y evaluación inadecuadas de exposiciones a pérdidas",
          "Falta de conocimiento en el trabajo de supervisión/administración"
        ]
      },
      { 
        id: 9, 
        text: 'Ingeniería Inadecuada',
        options: [
          "Evaluación inadecuada de exposiciones a pérdidas",
          "Preocupación inadecuada por los factores humanos/ergonómicos",
          "Normas, especificaciones o criterios de diseño inadecuados",
          "Control e inspección inadecuados de las construcciones",
          "Evaluación inadecuada para el uso operacional",
          "Evaluación inadecuada de la condición para el uso operacional",
          "Análisis inadecuado de tareas"
        ]
      },
      { 
        id: 10, 
        text: 'Adquisiciones Deficientes',
        options: [
          "Especificaciones deficientes en cuanto a los requerimientos",
          "Investigación inadecuada acerca de materiales y equipos",
          "Especificaciones deficientes para los vendedores",
          "Modalidad o ruta de embarque inadecuada",
          "Inspecciones de recepción y aceptación inadecuadas",
          "Comunicación inadecuada de las informaciones sobre aspectos de seguridad y salud",
          "Manejo inadecuado de los materiales"
        ]
      },
      { 
        id: 11, 
        text: 'Mantenimiento Deficiente',
        options: [
          "Aspectos preventivos inadecuados para evaluación de necesidades",
          "Aspectos preventivos inadecuados para lubricación y servicio",
          "Aspectos preventivos inadecuados para ajuste/ensamblaje",
          "Aspectos preventivos inadecuados para limpieza o pulimento",
          "Aspectos correctivos inadecuados para comunicación de necesidades",
          "Aspectos correctivos inadecuados para programación del trabajo",
          "Aspectos correctivos inadecuados para revisión de las piezas",
          "Aspectos correctivos inadecuados para procedimientos de reparación"
        ]
      },
      { 
        id: 12, 
        text: 'Herramientas y Equipos Inadecuados',
        options: [
          "Evaluación inadecuada de necesidades y riesgos",
          "Preocupación inadecuada por los factores humanos/ergonómicos",
          "Normas o especificaciones inadecuadas",
          "Disponibilidad inadecuada",
          "Ajustes/reparación/mantenimiento deficientes",
          "Sistema inadecuado de reparación y recuperación",
          "Remoción y reemplazo inadecuados"
        ]
      },
      { 
        id: 13, 
        text: 'Estándares de Trabajo Inadecuados',
        options: [
          "Desarrollo inadecuado de normas para inventarios y evaluación de exposiciones y necesidades",
          "Desarrollo inadecuado de normas para coordinación con quienes diseñan el proceso",
          "Desarrollo inadecuado de normas para compromiso del trabajador",
          "Desarrollo inadecuado de normas para estándares/procedimientos/reglas inconsistentes",
          "Comunicación inadecuada de las normas",
          "Mantenimiento inadecuado de las normas"
        ]
      },
      { 
        id: 14, 
        text: 'Uso y Desgaste',
        options: [
          "Planificación inadecuada del uso",
          "Prolongación excesiva de la vida útil de elementos",
          "Inspección y/o control inadecuados",
          "Sobrecarga o sobreutilización",
          "Mantenimiento inadecuado",
          "Empleo del elemento por personas no calificadas o sin preparación"
        ]
      },
      { 
        id: 15, 
        text: 'Abuso o Mal Uso',
        options: [
          "Uso por personas no calificadas o sin preparación",
          "Uso inadecuado para otros propósitos",
          "Uso inadecuado como herramienta",
          "Operación inadecuada",
          "Mantenimiento inadecuado",
          "Uso a sabiendas de que está defectuoso"
        ]
      }
    ];

    this.addCausasBasicasData(scatData.causasBasicas, personalesData, laboralesData);

    // Datos de necesidades de control
    const categoriesData = [
      {
        title: 'EVALUACIÓN POTENCIAL DE PÉRDIDA SIN CONTROLES',
        items: [
          { 
            id: 1, 
            text: 'Capacidad Física / Fisiológica Inadecuada',
            options: [
              "Altura, peso, talla, fuerza, alcance, etc. inadecuados",
              "Capacidad de movimiento corporal limitada",
              "Capacidad limitada para mantenerse en determinadas posiciones corporales",
              "Limitaciones sensoriales (vista, oído, tacto, gusto, olfato, equilibrio)",
              "Incapacidad respiratoria o circulatoria",
              "Otras deficiencias físicas permanentes",
              "Deficiencias temporales"
            ]
          },
          { 
            id: 2, 
            text: 'Capacidad Mental / Psicológica Inadecuada',
            options: [
              "Temores y fobias",
              "Problemas emocionales",
              "Enfermedad mental",
              "Nivel de inteligencia",
              "Incapacidad de comprensión",
              "Falta de juicio",
              "Deficiencias de coordinación"
            ]
          },
          { 
            id: 3, 
            text: 'Tensión Física o Fisiológica',
            options: [
              "Lesión o enfermedad",
              "Fatiga debido a la carga o duración de las tareas",
              "Fatiga debido a la falta de descanso",
              "Fatiga debido a sobrecarga sensorial",
              "Exposición a riesgos contra la salud"
            ]
          },
          { 
            id: 4, 
            text: 'Tensión Mental o Psicológica',
            options: [
              "Sobrecarga emocional",
              "Fatiga debido a la carga o las exigencias mentales de la tarea",
              "Preocupaciones debido a problemas",
              "Frustración",
              "Enfermedad mental"
            ]
          },
          { 
            id: 5, 
            text: 'Falta de Conocimiento',
            options: [
              "Falta de experiencia",
              "Orientación deficiente",
              "Entrenamiento inicial inadecuado",
              "Reentrenamiento insuficiente",
              "Órdenes mal interpretadas"
            ]
          }
        ]
      },
      {
        title: 'Tipo de Contacto o Qué Contactó con Energía o Sustancia',
        items: [
          { 
            id: 6, 
            text: 'Golpeada Contra (chocar contra algo)',
            options: [
              "Golpeado contra objeto estacionario",
              "Golpeado contra objeto en movimiento",
              "Golpeado contra superficie áspera",
              "Golpeado contra objeto punzante",
              "Golpeado contra objeto caliente"
            ]
          },
          { 
            id: 7, 
            text: 'Golpeado por (Impactado por objeto en movimiento)',
            options: [
              "Objeto volador",
              "Objeto que cae",
              "Objeto lanzado",
              "Partícula en el ojo",
              "Objeto oscilante"
            ]
          },
          { 
            id: 8, 
            text: 'Caída a un nivel más bajo',
            options: [
              "Caída desde escalera",
              "Caída desde andamio",
              "Caída desde techo",
              "Caída en excavación",
              "Caída desde vehículo"
            ]
          },
          { 
            id: 9, 
            text: 'Caída en el mismo nivel',
            options: [
              "Resbalón y caída",
              "Tropezón y caída",
              "Caída por pérdida de equilibrio",
              "Caída por superficie irregular",
              "Caída por obstáculo"
            ]
          },
          { 
            id: 10, 
            text: 'Atrapado (Puntos de Pellizco y Mordida)',
            options: [
              "Atrapado entre objetos",
              "Atrapado bajo objeto",
              "Atrapado en maquinaria",
              "Pellizco en punto de operación",
              "Mordida de equipo"
            ]
          }
        ]
      },
      {
        title: '(CI) Causas Inmediatas / Directas',
        items: [
          { 
            id: 11, 
            text: 'Operar equipos sin autorización',
            options: [
              "Operar sin permiso",
              "Operar sin capacitación",
              "Operar fuera del horario autorizado",
              "Operar equipo restringido",
              "Operar sin supervisión requerida"
            ]
          },
          { 
            id: 12, 
            text: 'Omitir el uso de equipos de seguridad personal',
            options: [
              "No usar casco",
              "No usar guantes",
              "No usar gafas de seguridad",
              "No usar calzado de seguridad",
              "No usar arnés de seguridad"
            ]
          },
          { 
            id: 13, 
            text: 'Omitir el uso de dispositivos de seguridad',
            options: [
              "Remover guardas de seguridad",
              "Desactivar sistemas de seguridad",
              "No usar dispositivos de bloqueo",
              "Omitir procedimientos de seguridad",
              "No usar señalización requerida"
            ]
          },
          { 
            id: 14, 
            text: 'Operar a velocidad inadecuada',
            options: [
              "Operar muy rápido",
              "Operar muy lento",
              "No respetar límites de velocidad",
              "Acelerar inadecuadamente",
              "Frenar inadecuadamente"
            ]
          },
          { 
            id: 15, 
            text: 'Poner fuera de servicio los dispositivos de seguridad',
            options: [
              "Desconectar alarmas",
              "Anular sistemas de protección",
              "Remover etiquetas de seguridad",
              "Desactivar interruptores de emergencia",
              "Modificar dispositivos de seguridad"
            ]
          }
        ]
      },
      {
        title: '(CB) Causas Básicas / Subyacentes',
        items: [
          { 
            id: 16, 
            text: 'Liderazgo y/o Supervisión Deficiente',
            options: [
              "Relaciones jerárquicas poco claras",
              "Asignación de responsabilidades poco clara",
              "Delegación inadecuada o insuficiente",
              "Definición inadecuada de políticas",
              "Programación inadecuada del trabajo"
            ]
          },
          { 
            id: 17, 
            text: 'Ingeniería Inadecuada',
            options: [
              "Evaluación inadecuada de exposiciones",
              "Preocupación inadecuada por factores humanos",
              "Normas de diseño inadecuadas",
              "Control de construcciones inadecuado",
              "Evaluación inadecuada para uso operacional"
            ]
          },
          { 
            id: 18, 
            text: 'Adquisiciones Deficientes',
            options: [
              "Especificaciones deficientes de requerimientos",
              "Investigación inadecuada de materiales",
              "Especificaciones deficientes para vendedores",
              "Inspecciones de recepción inadecuadas",
              "Comunicación inadecuada de aspectos de seguridad"
            ]
          },
          { 
            id: 19, 
            text: 'Mantenimiento Deficiente',
            options: [
              "Aspectos preventivos inadecuados",
              "Lubricación y servicio inadecuados",
              "Ajuste/ensamblaje inadecuados",
              "Limpieza inadecuada",
              "Comunicación de necesidades inadecuada"
            ]
          },
          { 
            id: 20, 
            text: 'Herramientas y Equipos Inadecuados',
            options: [
              "Evaluación inadecuada de necesidades",
              "Preocupación inadecuada por factores humanos",
              "Normas o especificaciones inadecuadas",
              "Disponibilidad inadecuada",
              "Ajustes/reparación/mantenimiento deficientes"
            ]
          }
        ]
      },
      {
        title: '(NAC) Necesidades de Acción de Control (NAC)',
        items: [
          { 
            id: 21, 
            text: 'Programa inadecuado de mantenimiento preventivo',
            options: [
              "Falta de programa de mantenimiento",
              "Frecuencia inadecuada de mantenimiento",
              "Procedimientos de mantenimiento deficientes",
              "Personal no calificado para mantenimiento",
              "Falta de repuestos y herramientas"
            ]
          },
          { 
            id: 22, 
            text: 'Normas inadecuadas de trabajo',
            options: [
              "Procedimientos de trabajo inexistentes",
              "Procedimientos desactualizados",
              "Procedimientos no comunicados",
              "Falta de entrenamiento en procedimientos",
              "Procedimientos no aplicados"
            ]
          },
          { 
            id: 23, 
            text: 'Diseño o mantenimiento inadecuado de las instalaciones',
            options: [
              "Diseño deficiente de instalaciones",
              "Mantenimiento inadecuado de estructuras",
              "Falta de señalización",
              "Iluminación inadecuada",
              "Ventilación deficiente"
            ]
          },
          { 
            id: 24, 
            text: 'Compras inadecuadas',
            options: [
              "Especificaciones de compra deficientes",
              "Evaluación inadecuada de proveedores",
              "Control de calidad deficiente",
              "Recepción inadecuada de materiales",
              "Almacenamiento inadecuado"
            ]
          },
          { 
            id: 25, 
            text: 'Mantenimiento inadecuado',
            options: [
              "Mantenimiento correctivo deficiente",
              "Falta de personal de mantenimiento",
              "Herramientas de mantenimiento inadecuadas",
              "Repuestos de baja calidad",
              "Documentación de mantenimiento deficiente"
            ]
          }
        ]
      }
    ];

    this.addNecesidadesControlData(scatData.necesidadesControl, categoriesData);

    // Agregar pie de página
    this.addFooter();

    return this.doc;
  }

  // Función para descargar el PDF
  downloadPDF(scatData, filename = 'reporte-scat.pdf') {
    const doc = this.generatePDF(scatData);
    doc.save(filename);
  }

  // Función para obtener el PDF como blob
  getPDFBlob(scatData) {
    const doc = this.generatePDF(scatData);
    return doc.output('blob');
  }
}

export default new PDFService();