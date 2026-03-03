import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'app-similar-to-hevy',
  location: 'us-east4'
};

export const listAllExercisesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllExercises');
}
listAllExercisesRef.operationName = 'ListAllExercises';

export function listAllExercises(dc) {
  return executeQuery(listAllExercisesRef(dc));
}

export const createNewWorkoutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewWorkout', inputVars);
}
createNewWorkoutRef.operationName = 'CreateNewWorkout';

export function createNewWorkout(dcOrVars, vars) {
  return executeMutation(createNewWorkoutRef(dcOrVars, vars));
}

export const getMyGoalsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyGoals');
}
getMyGoalsRef.operationName = 'GetMyGoals';

export function getMyGoals(dc) {
  return executeQuery(getMyGoalsRef(dc));
}

export const recordWorkoutExerciseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RecordWorkoutExercise', inputVars);
}
recordWorkoutExerciseRef.operationName = 'RecordWorkoutExercise';

export function recordWorkoutExercise(dcOrVars, vars) {
  return executeMutation(recordWorkoutExerciseRef(dcOrVars, vars));
}

