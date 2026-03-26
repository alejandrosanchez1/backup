import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const rapidApiKey = process.env.NEXT_PUBLIC_X_RAPIDAPI_KEY;

console.log("🔍 Verificando variables de entorno...");
console.log("Supabase URL:", supabaseUrl ? "✅ SI" : "❌ NO");
console.log("Supabase KEY:", supabaseKey ? "✅ SI" : "❌ NO");
console.log("RapidAPI KEY:", rapidApiKey ? "✅ SI" : "❌ NO");

if (!supabaseUrl || !supabaseKey || !rapidApiKey) {
  console.error("\n🚨 ERROR: Faltan variables de entorno.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const API_HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/api/v1/exercises`;
const LIMIT = 100;

// Traducción de bodyParts al español
const BODY_PART_TRANSLATIONS = {
  'WAIST': 'Abdominales',
  'BACK': 'Espalda',
  'CHEST': 'Pecho',
  'SHOULDERS': 'Hombros',
  'UPPER ARMS': 'Brazos',
  'LOWER ARMS': 'Antebrazos',
  'UPPER LEGS': 'Piernas',
  'LOWER LEGS': 'Gemelos',
  'CARDIO': 'Cardio',
  'NECK': 'Cuello',
};

// Normalizar equipo al español
const EQUIPMENT_TRANSLATIONS = {
  'BODY WEIGHT': 'Peso corporal',
  'BARBELL': 'Barra',
  'DUMBBELL': 'Mancuerna',
  'CABLE': 'Cable',
  'MACHINE': 'Máquina',
  'KETTLEBELL': 'Kettlebell',
  'BAND': 'Banda elástica',
  'MEDICINE BALL': 'Balón medicinal',
  'STABILITY BALL': 'Balón de estabilidad',
  'SMITH MACHINE': 'Máquina Smith',
  'ASSISTED': 'Asistido',
  'WEIGHTED': 'Con peso',
};

function translateBodyPart(bodyPart) {
  return BODY_PART_TRANSLATIONS[bodyPart?.toUpperCase()] || bodyPart?.toLowerCase() || 'General';
}

function translateEquipment(equipment) {
  return EQUIPMENT_TRANSLATIONS[equipment?.toUpperCase()] || equipment?.toLowerCase() || 'Sin equipo';
}

async function fetchPage(cursor = null) {
  const url = cursor
    ? `${BASE_URL}?limit=${LIMIT}&cursor=${cursor}`
    : `${BASE_URL}?limit=${LIMIT}`;

  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': API_HOST,
    },
  });

  if (!res.ok) {
    throw new Error(`Error HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

async function importExercises() {
  console.log('\n🚀 Iniciando importación desde EDB with Videos & Images API...\n');

  let cursor = null;
  let page = 1;
  let totalInserted = 0;

  while (true) {
    console.log(`📄 Descargando e insertando página ${page}...`);

    const response = await fetchPage(cursor);

    if (!response.success || !response.data?.length) {
      console.log('No hay más datos.');
      break;
    }

    const batch = response.data.map(ex => {
      const bodyPart = ex.bodyParts?.[0] || 'GENERAL';
      const equipment = ex.equipments?.[0] || 'BODY WEIGHT';
      return {
        name: ex.name?.trim(),
        target: translateBodyPart(bodyPart),
        bodyPart: bodyPart.toLowerCase(),
        gifUrl: ex.imageUrl || null,
        equipment: translateEquipment(equipment),
        instructions: ex.instructions || [],
        secondary_muscles: ex.secondaryMuscles || [],
      };
    });

    const { error } = await supabase.from('exercises_library').insert(batch);

    if (error) {
      console.error(`❌ Error insertando página ${page}:`, error.message);
    } else {
      totalInserted += batch.length;
      console.log(`✅ Página ${page} insertada (${totalInserted}/${response.meta.total})`);
    }

    if (!response.meta.hasNextPage) break;
    cursor = response.meta.nextCursor;
    page++;

    // Esperar 1.2s entre páginas para no exceder el rate limit
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\n🎉 Importación completada: ${totalInserted} ejercicios insertados.`);
}

importExercises().catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});
