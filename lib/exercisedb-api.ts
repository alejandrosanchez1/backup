const API_HOST = 'exercisedb-api.vercel.app';
const BASE_URL = `https://${API_HOST}/api/v1`;

export interface ExerciseDBExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipments: string[];
  instructions: string[];
}

export interface ExerciseForUI {
  id: string;
  name: string;
  target: string;
  bodyPart: string;
  equipment: string;
  gif_url: string;
  secondaryMuscles: string[];
  instructions: string[];
}

interface ExerciseDBResponse {
  success: boolean;
  data: ExerciseDBExercise[];
  metadata?: {
    totalExercises: number;
  };
}

function getHeaders() {
  return {};
}

export async function fetchExercises(params?: {
  limit?: number;
  offset?: number;
  bodyPart?: string;
  equipment?: string;
  search?: string;
}): Promise<ExerciseDBResponse> {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));

  let url: string;
  
  if (params?.search) {
    url = `${BASE_URL}/exercises/search?q=${encodeURIComponent(params.search)}`;
  } else if (params?.bodyPart) {
    url = `${BASE_URL}/bodyparts/${encodeURIComponent(params.bodyPart)}/exercises`;
  } else if (params?.equipment) {
    url = `${BASE_URL}/equipments/${encodeURIComponent(params.equipment)}/exercises`;
  } else {
    url = `${BASE_URL}/exercises`;
  }

  const res = await fetch(url, { 
    headers: getHeaders(),
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    throw new Error(`ExerciseDB API error: ${res.status}`);
  }

  const json = await res.json();
  // The search endpoint wraps results in { exercises: [...] } while other endpoints return arrays directly
  const data: ExerciseDBExercise[] = Array.isArray(json) ? json : json?.exercises || json?.data || []
  return {
    success: true,
    data,
    metadata: { totalExercises: data.length }
  };
}

export async function fetchBodyParts(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/bodyparts`, { 
    headers: getHeaders(),
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error(`ExerciseDB API error: ${res.status}`);
  return res.json();
}

export async function fetchEquipments(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/equipments`, { 
    headers: getHeaders(),
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error(`ExerciseDB API error: ${res.status}`);
  return res.json();
}

export async function fetchMuscles(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/muscles`, { 
    headers: getHeaders(),
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error(`ExerciseDB API error: ${res.status}`);
  return res.json();
}

export async function fetchExerciseById(exerciseId: string): Promise<ExerciseDBExercise> {
  const res = await fetch(`${BASE_URL}/exercises/${exerciseId}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error(`ExerciseDB API error: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}
