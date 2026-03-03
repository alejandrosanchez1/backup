import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Configuración ultra-precisa de la ruta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- DIAGNÓSTICO ---
console.log("🔍 Verificando variables de entorno...");
console.log("URL encontrada:", supabaseUrl ? "✅ SI" : "❌ NO");
console.log("KEY encontrada:", supabaseKey ? "✅ SI" : "❌ NO");

if (!supabaseUrl || !supabaseKey) {
  console.error("\n🚨 ERROR CRÍTICO: No se pudieron cargar las credenciales.");
  console.log("Asegúrate de que:");
  console.log("1. El archivo se llama exactamente: .env.local");
  console.log("2. El archivo está en la raíz: " + path.resolve(__dirname, '../'));
  console.log("3. Las variables se llaman: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("🚀 Conexión inicializada con éxito.\n");

// ... resto de tu función fetchExercises e importExercises


// Diccionario básico para traducir categorías al vuelo
const TRANSLATIONS = {
  'back': 'Espalda', 'cardio': 'Cardio', 'chest': 'Pecho', 'lower arms': 'Antebrazos',
  'lower legs': 'Gemelos', 'neck': 'Cuello', 'shoulders': 'Hombros', 'upper arms': 'Brazos',
  'upper legs': 'Piernas', 'waist': 'Abdominales'
};

async function importExercises() {
  console.log('🚀 Iniciando descarga de ejercicios desde ExerciseDB...');

  try {
    const res = await fetch('https://exercisedb.p.rapidapi.com/exercises?limit=1500', {
      headers: {
        'X-RapidAPI-Key': process.env.NEXT_PUBLIC_X_RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.NEXT_PUBLIC_X_RAPIDAPI_HOST
      }
    });

    const exercises = await res.json();
    console.log(`📦 Se encontraron ${exercises.length} ejercicios. Preparando inserción...`);

    // Procesar ejercicios en grupos de 100 para no saturar la base de datos
    const batchSize = 100;
    for (let i = 0; i < exercises.length; i += batchSize) {
      const batch = exercises.slice(i, i + batchSize).map(ex => ({
        name: ex.name,
        target: ex.target,
        user_id: null, // null significa que es un ejercicio público/global
        gif_url: ex.gifUrl,
        equipment: ex.equipment,
        description: `Ejercicio de nivel profesional para trabajar ${TRANSLATIONS[ex.target] || ex.target} utilizando ${ex.equipment}.`,
        instructions: ex.instructions ? ex.instructions.join('\n') : 'Sin instrucciones disponibles.',
        common_mistakes: '• No controlar la respiración.\n• Realizar el movimiento con impulso.\n• Mala alineación de la columna.'
      }));

      const { error } = await supabase.from('all_exercises').insert(batch);

      if (error) {
        console.error(`❌ Error en el lote ${i/batchSize + 1}:`, error.message);
      } else {
        console.log(`✅ Lote ${i/batchSize + 1} insertado correctamente (${i + batch.length}/${exercises.length})`);
      }
    }

    console.log('🎉 ¡Importación masiva completada con éxito!');

  } catch (error) {
    console.error('💥 Error fatal durante la importación:', error);
  }
}

importExercises();
