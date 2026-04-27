/**
 * aiService.ts
 * Servicio para conectarse a un modelo de IA y desglosar tareas.
 *
 * NOTA: Para el prototipo inicial usamos un "Mock" realista que simula
 * el retraso de la red y devuelve subtareas pre-generadas basadas en heurísticas
 * sencillas o un fallback genérico.
 *
 * Para conectar OpenAI/Gemini real, simplemente reemplaza `generateSubtasksMock`
 * con una llamada a fetch() a tu endpoint o API directa.
 */

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateSubtasks(taskTitle: string): Promise<string[]> {
  // Aquí puedes conectar tu API real en el futuro.
  // Ejemplo:
  // const response = await fetch('https://api.openai.com/v1/chat/completions', { ... });
  // const data = await response.json();
  // return JSON.parse(data.choices[0].message.content);

  return generateSubtasksMock(taskTitle);
}

async function generateSubtasksMock(taskTitle: string): Promise<string[]> {
  // Simulamos el tiempo de respuesta de una IA (2 a 3 segundos)
  await delay(1500 + Math.random() * 1500);

  const titleLower = taskTitle.toLowerCase();

  // Diccionario de heurísticas para respuestas "mágicas" realistas
  if (titleLower.includes('viaje') || titleLower.includes('vacaciones')) {
    return [
      'Definir el presupuesto total y fechas estimadas',
      'Buscar y comparar vuelos/transporte',
      'Reservar alojamiento principal',
      'Hacer una lista de lugares turísticos a visitar',
      'Preparar la lista de equipaje'
    ];
  }
  
  if (titleLower.includes('compras') || titleLower.includes('super')) {
    return [
      'Revisar la despensa y anotar faltantes',
      'Hacer la lista de compras por categorías',
      'Llevar bolsas ecológicas',
      'Comprar productos perecederos (frutas/verduras)',
      'Comprar productos de limpieza e higiene'
    ];
  }

  if (titleLower.includes('estudiar') || titleLower.includes('examen')) {
    return [
      'Recopilar todo el material de estudio (libros, notas)',
      'Crear un cronograma de estudio por temas',
      'Leer y subrayar los conceptos clave',
      'Hacer un resumen o mapa mental',
      'Realizar un examen de práctica o cuestionario'
    ];
  }

  if (titleLower.includes('reunión') || titleLower.includes('presentación')) {
    return [
      'Definir el objetivo principal de la reunión',
      'Crear la estructura básica de los temas a tratar',
      'Diseñar o preparar las diapositivas de apoyo',
      'Revisar el material y ensayar los tiempos',
      'Enviar la agenda o invitación a los participantes'
    ];
  }

  // Fallback genérico para tareas no categorizadas
  return [
    'Definir el objetivo específico y el resultado esperado',
    'Reunir los materiales o información necesaria',
    'Establecer un límite de tiempo para trabajar sin distracciones',
    'Ejecutar el primer paso accionable inmediatamente',
    'Revisar el trabajo realizado y hacer ajustes'
  ];
}
