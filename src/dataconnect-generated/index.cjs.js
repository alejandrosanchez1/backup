const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'app-similar-to-hevy',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const listAllExercisesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllExercises');
}
listAllExercisesRef.operationName = 'ListAllExercises';
exports.listAllExercisesRef = listAllExercisesRef;

exports.listAllExercises = function listAllExercises(dc) {
  return executeQuery(listAllExercisesRef(dc));
};

const createNewWorkoutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewWorkout', inputVars);
}
createNewWorkoutRef.operationName = 'CreateNewWorkout';
exports.createNewWorkoutRef = createNewWorkoutRef;

exports.createNewWorkout = function createNewWorkout(dcOrVars, vars) {
  return executeMutation(createNewWorkoutRef(dcOrVars, vars));
};

const getMyGoalsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyGoals');
}
getMyGoalsRef.operationName = 'GetMyGoals';
exports.getMyGoalsRef = getMyGoalsRef;

exports.getMyGoals = function getMyGoals(dc) {
  return executeQuery(getMyGoalsRef(dc));
};

const recordWorkoutExerciseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RecordWorkoutExercise', inputVars);
}
recordWorkoutExerciseRef.operationName = 'RecordWorkoutExercise';
exports.recordWorkoutExerciseRef = recordWorkoutExerciseRef;

exports.recordWorkoutExercise = function recordWorkoutExercise(dcOrVars, vars) {
  return executeMutation(recordWorkoutExerciseRef(dcOrVars, vars));
};
