const API_HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/api/v1`;

export interface ExerciseDBExercise {
  exerciseId: string;
  name: string;
  imageUrl: string;
  bodyParts: string[];
  equipments: string[];
  exerciseType: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
  keywords: string[];
}

interface ExerciseDBResponse {
  success: boolean;
  meta: {
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
  };
  data: ExerciseDBExercise[];
}

function getHeaders() {
  return {
    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_X_RAPIDAPI_KEY!,
    'X-RapidAPI-Host': API_HOST,
  };
}

export async function fetchExercises(params?: {
  limit?: number;
  cursor?: string;
  bodyPart?: string;
  equipment?: string;
  search?: string;
}): Promise<ExerciseDBResponse> {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.bodyPart) query.set('bodyPart', params.bodyPart);
  if (params?.equipment) query.set('equipment', params.equipment);
  if (params?.search) query.set('search', params.search);

  const url = `${BASE_URL}/exercises${query.toString() ? `?${query}` : ''}`;

  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) {
    throw new Error(`ExerciseDB API error: ${res.status}`);
  }

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
