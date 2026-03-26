'use client';

import { useEffect, useState } from 'react';
import ExerciseList from '@/src/features/exercises/components/ExerciseList';

const API_URL = 'https://exercisedb-api.vercel.app/api/v1';

interface Exercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipments: string[];
  instructions: string[];
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [equipments, setEquipments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(100);

  useEffect(() => {
    async function fetchData() {
      try {
        const [exercisesRes, bpRes, eqRes] = await Promise.all([
          fetch(`${API_URL}/exercises?limit=100`),
          fetch(`${API_URL}/bodyparts`),
          fetch(`${API_URL}/equipments`)
        ]);

        const exercisesData = await exercisesRes.json();
        const bpData = await bpRes.json();
        const eqData = await eqRes.json();

        setExercises(exercisesData.data || []);
        setBodyParts(bpData.data?.map((b: any) => b.name) || bpData.data || []);
        setEquipments(eqData.data?.map((e: any) => e.name) || eqData.data || []);
      } catch (err) {
        setError('Error cargando ejercicios');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const loadMore = async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    try {
      const res = await fetch(`${API_URL}/exercises?limit=100&offset=${offset}`);
      const data = await res.json();
      
      if (data.data && data.data.length > 0) {
        setExercises(prev => [...prev, ...data.data]);
        setOffset(prev => prev + 100);
      }
    } catch (err) {
      console.error('Error cargando más ejercicios:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMore = offset < 1500;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Ejercicios</h1>
          <p className="text-gray-500">Explora la biblioteca de movimientos</p>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Ejercicios</h1>
          <p className="text-gray-500">Explora la biblioteca de movimientos</p>
        </header>
        <div className="text-center py-10 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Ejercicios</h1>
        <p className="text-gray-500">Explora la biblioteca de movimientos</p>
      </header>

      <ExerciseList 
        initialExercises={exercises} 
        bodyParts={bodyParts}
        equipments={equipments}
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={loadingMore}
      />
    </div>
  );
}
