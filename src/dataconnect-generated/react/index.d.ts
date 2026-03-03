import { ListAllExercisesData, CreateNewWorkoutData, CreateNewWorkoutVariables, GetMyGoalsData, RecordWorkoutExerciseData, RecordWorkoutExerciseVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListAllExercises(options?: useDataConnectQueryOptions<ListAllExercisesData>): UseDataConnectQueryResult<ListAllExercisesData, undefined>;
export function useListAllExercises(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllExercisesData>): UseDataConnectQueryResult<ListAllExercisesData, undefined>;

export function useCreateNewWorkout(options?: useDataConnectMutationOptions<CreateNewWorkoutData, FirebaseError, CreateNewWorkoutVariables>): UseDataConnectMutationResult<CreateNewWorkoutData, CreateNewWorkoutVariables>;
export function useCreateNewWorkout(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewWorkoutData, FirebaseError, CreateNewWorkoutVariables>): UseDataConnectMutationResult<CreateNewWorkoutData, CreateNewWorkoutVariables>;

export function useGetMyGoals(options?: useDataConnectQueryOptions<GetMyGoalsData>): UseDataConnectQueryResult<GetMyGoalsData, undefined>;
export function useGetMyGoals(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyGoalsData>): UseDataConnectQueryResult<GetMyGoalsData, undefined>;

export function useRecordWorkoutExercise(options?: useDataConnectMutationOptions<RecordWorkoutExerciseData, FirebaseError, RecordWorkoutExerciseVariables>): UseDataConnectMutationResult<RecordWorkoutExerciseData, RecordWorkoutExerciseVariables>;
export function useRecordWorkoutExercise(dc: DataConnect, options?: useDataConnectMutationOptions<RecordWorkoutExerciseData, FirebaseError, RecordWorkoutExerciseVariables>): UseDataConnectMutationResult<RecordWorkoutExerciseData, RecordWorkoutExerciseVariables>;
