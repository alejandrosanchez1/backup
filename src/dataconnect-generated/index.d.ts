import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateNewWorkoutData {
  workout_insert: Workout_Key;
}

export interface CreateNewWorkoutVariables {
  workoutDate: DateString;
  workoutType: string;
  durationMinutes: number;
  notes?: string | null;
}

export interface Exercise_Key {
  id: UUIDString;
  __typename?: 'Exercise_Key';
}

export interface GetMyGoalsData {
  goals: ({
    id: UUIDString;
    description: string;
    goalType: string;
    targetDate: DateString;
    targetValue: number;
    unit: string;
    achievedDate?: DateString | null;
  } & Goal_Key)[];
}

export interface Goal_Key {
  id: UUIDString;
  __typename?: 'Goal_Key';
}

export interface ListAllExercisesData {
  exercises: ({
    id: UUIDString;
    name: string;
    category: string;
    description?: string | null;
  } & Exercise_Key)[];
}

export interface RecordWorkoutExerciseData {
  workoutExercise_insert: WorkoutExercise_Key;
}

export interface RecordWorkoutExerciseVariables {
  workoutId: UUIDString;
  exerciseId: UUIDString;
  sets?: number | null;
  reps?: number | null;
  weightKg?: number | null;
  distanceKm?: number | null;
  durationMinutes?: number | null;
  notes?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface WorkoutExercise_Key {
  id: UUIDString;
  __typename?: 'WorkoutExercise_Key';
}

export interface Workout_Key {
  id: UUIDString;
  __typename?: 'Workout_Key';
}

interface ListAllExercisesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllExercisesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllExercisesData, undefined>;
  operationName: string;
}
export const listAllExercisesRef: ListAllExercisesRef;

export function listAllExercises(): QueryPromise<ListAllExercisesData, undefined>;
export function listAllExercises(dc: DataConnect): QueryPromise<ListAllExercisesData, undefined>;

interface CreateNewWorkoutRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewWorkoutVariables): MutationRef<CreateNewWorkoutData, CreateNewWorkoutVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewWorkoutVariables): MutationRef<CreateNewWorkoutData, CreateNewWorkoutVariables>;
  operationName: string;
}
export const createNewWorkoutRef: CreateNewWorkoutRef;

export function createNewWorkout(vars: CreateNewWorkoutVariables): MutationPromise<CreateNewWorkoutData, CreateNewWorkoutVariables>;
export function createNewWorkout(dc: DataConnect, vars: CreateNewWorkoutVariables): MutationPromise<CreateNewWorkoutData, CreateNewWorkoutVariables>;

interface GetMyGoalsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyGoalsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyGoalsData, undefined>;
  operationName: string;
}
export const getMyGoalsRef: GetMyGoalsRef;

export function getMyGoals(): QueryPromise<GetMyGoalsData, undefined>;
export function getMyGoals(dc: DataConnect): QueryPromise<GetMyGoalsData, undefined>;

interface RecordWorkoutExerciseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RecordWorkoutExerciseVariables): MutationRef<RecordWorkoutExerciseData, RecordWorkoutExerciseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RecordWorkoutExerciseVariables): MutationRef<RecordWorkoutExerciseData, RecordWorkoutExerciseVariables>;
  operationName: string;
}
export const recordWorkoutExerciseRef: RecordWorkoutExerciseRef;

export function recordWorkoutExercise(vars: RecordWorkoutExerciseVariables): MutationPromise<RecordWorkoutExerciseData, RecordWorkoutExerciseVariables>;
export function recordWorkoutExercise(dc: DataConnect, vars: RecordWorkoutExerciseVariables): MutationPromise<RecordWorkoutExerciseData, RecordWorkoutExerciseVariables>;

