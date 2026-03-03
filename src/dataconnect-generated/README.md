# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllExercises*](#listallexercises)
  - [*GetMyGoals*](#getmygoals)
- [**Mutations**](#mutations)
  - [*CreateNewWorkout*](#createnewworkout)
  - [*RecordWorkoutExercise*](#recordworkoutexercise)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllExercises
You can execute the `ListAllExercises` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllExercises(): QueryPromise<ListAllExercisesData, undefined>;

interface ListAllExercisesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllExercisesData, undefined>;
}
export const listAllExercisesRef: ListAllExercisesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllExercises(dc: DataConnect): QueryPromise<ListAllExercisesData, undefined>;

interface ListAllExercisesRef {
  ...
  (dc: DataConnect): QueryRef<ListAllExercisesData, undefined>;
}
export const listAllExercisesRef: ListAllExercisesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllExercisesRef:
```typescript
const name = listAllExercisesRef.operationName;
console.log(name);
```

### Variables
The `ListAllExercises` query has no variables.
### Return Type
Recall that executing the `ListAllExercises` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllExercisesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllExercisesData {
  exercises: ({
    id: UUIDString;
    name: string;
    category: string;
    description?: string | null;
  } & Exercise_Key)[];
}
```
### Using `ListAllExercises`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllExercises } from '@dataconnect/generated';


// Call the `listAllExercises()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllExercises();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllExercises(dataConnect);

console.log(data.exercises);

// Or, you can use the `Promise` API.
listAllExercises().then((response) => {
  const data = response.data;
  console.log(data.exercises);
});
```

### Using `ListAllExercises`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllExercisesRef } from '@dataconnect/generated';


// Call the `listAllExercisesRef()` function to get a reference to the query.
const ref = listAllExercisesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllExercisesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.exercises);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.exercises);
});
```

## GetMyGoals
You can execute the `GetMyGoals` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyGoals(): QueryPromise<GetMyGoalsData, undefined>;

interface GetMyGoalsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyGoalsData, undefined>;
}
export const getMyGoalsRef: GetMyGoalsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyGoals(dc: DataConnect): QueryPromise<GetMyGoalsData, undefined>;

interface GetMyGoalsRef {
  ...
  (dc: DataConnect): QueryRef<GetMyGoalsData, undefined>;
}
export const getMyGoalsRef: GetMyGoalsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyGoalsRef:
```typescript
const name = getMyGoalsRef.operationName;
console.log(name);
```

### Variables
The `GetMyGoals` query has no variables.
### Return Type
Recall that executing the `GetMyGoals` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyGoalsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyGoals`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyGoals } from '@dataconnect/generated';


// Call the `getMyGoals()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyGoals();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyGoals(dataConnect);

console.log(data.goals);

// Or, you can use the `Promise` API.
getMyGoals().then((response) => {
  const data = response.data;
  console.log(data.goals);
});
```

### Using `GetMyGoals`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyGoalsRef } from '@dataconnect/generated';


// Call the `getMyGoalsRef()` function to get a reference to the query.
const ref = getMyGoalsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyGoalsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.goals);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.goals);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewWorkout
You can execute the `CreateNewWorkout` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewWorkout(vars: CreateNewWorkoutVariables): MutationPromise<CreateNewWorkoutData, CreateNewWorkoutVariables>;

interface CreateNewWorkoutRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewWorkoutVariables): MutationRef<CreateNewWorkoutData, CreateNewWorkoutVariables>;
}
export const createNewWorkoutRef: CreateNewWorkoutRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewWorkout(dc: DataConnect, vars: CreateNewWorkoutVariables): MutationPromise<CreateNewWorkoutData, CreateNewWorkoutVariables>;

interface CreateNewWorkoutRef {
  ...
  (dc: DataConnect, vars: CreateNewWorkoutVariables): MutationRef<CreateNewWorkoutData, CreateNewWorkoutVariables>;
}
export const createNewWorkoutRef: CreateNewWorkoutRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewWorkoutRef:
```typescript
const name = createNewWorkoutRef.operationName;
console.log(name);
```

### Variables
The `CreateNewWorkout` mutation requires an argument of type `CreateNewWorkoutVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewWorkoutVariables {
  workoutDate: DateString;
  workoutType: string;
  durationMinutes: number;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `CreateNewWorkout` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewWorkoutData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewWorkoutData {
  workout_insert: Workout_Key;
}
```
### Using `CreateNewWorkout`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewWorkout, CreateNewWorkoutVariables } from '@dataconnect/generated';

// The `CreateNewWorkout` mutation requires an argument of type `CreateNewWorkoutVariables`:
const createNewWorkoutVars: CreateNewWorkoutVariables = {
  workoutDate: ..., 
  workoutType: ..., 
  durationMinutes: ..., 
  notes: ..., // optional
};

// Call the `createNewWorkout()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewWorkout(createNewWorkoutVars);
// Variables can be defined inline as well.
const { data } = await createNewWorkout({ workoutDate: ..., workoutType: ..., durationMinutes: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewWorkout(dataConnect, createNewWorkoutVars);

console.log(data.workout_insert);

// Or, you can use the `Promise` API.
createNewWorkout(createNewWorkoutVars).then((response) => {
  const data = response.data;
  console.log(data.workout_insert);
});
```

### Using `CreateNewWorkout`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewWorkoutRef, CreateNewWorkoutVariables } from '@dataconnect/generated';

// The `CreateNewWorkout` mutation requires an argument of type `CreateNewWorkoutVariables`:
const createNewWorkoutVars: CreateNewWorkoutVariables = {
  workoutDate: ..., 
  workoutType: ..., 
  durationMinutes: ..., 
  notes: ..., // optional
};

// Call the `createNewWorkoutRef()` function to get a reference to the mutation.
const ref = createNewWorkoutRef(createNewWorkoutVars);
// Variables can be defined inline as well.
const ref = createNewWorkoutRef({ workoutDate: ..., workoutType: ..., durationMinutes: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewWorkoutRef(dataConnect, createNewWorkoutVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.workout_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.workout_insert);
});
```

## RecordWorkoutExercise
You can execute the `RecordWorkoutExercise` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
recordWorkoutExercise(vars: RecordWorkoutExerciseVariables): MutationPromise<RecordWorkoutExerciseData, RecordWorkoutExerciseVariables>;

interface RecordWorkoutExerciseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: RecordWorkoutExerciseVariables): MutationRef<RecordWorkoutExerciseData, RecordWorkoutExerciseVariables>;
}
export const recordWorkoutExerciseRef: RecordWorkoutExerciseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
recordWorkoutExercise(dc: DataConnect, vars: RecordWorkoutExerciseVariables): MutationPromise<RecordWorkoutExerciseData, RecordWorkoutExerciseVariables>;

interface RecordWorkoutExerciseRef {
  ...
  (dc: DataConnect, vars: RecordWorkoutExerciseVariables): MutationRef<RecordWorkoutExerciseData, RecordWorkoutExerciseVariables>;
}
export const recordWorkoutExerciseRef: RecordWorkoutExerciseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the recordWorkoutExerciseRef:
```typescript
const name = recordWorkoutExerciseRef.operationName;
console.log(name);
```

### Variables
The `RecordWorkoutExercise` mutation requires an argument of type `RecordWorkoutExerciseVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `RecordWorkoutExercise` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RecordWorkoutExerciseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RecordWorkoutExerciseData {
  workoutExercise_insert: WorkoutExercise_Key;
}
```
### Using `RecordWorkoutExercise`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, recordWorkoutExercise, RecordWorkoutExerciseVariables } from '@dataconnect/generated';

// The `RecordWorkoutExercise` mutation requires an argument of type `RecordWorkoutExerciseVariables`:
const recordWorkoutExerciseVars: RecordWorkoutExerciseVariables = {
  workoutId: ..., 
  exerciseId: ..., 
  sets: ..., // optional
  reps: ..., // optional
  weightKg: ..., // optional
  distanceKm: ..., // optional
  durationMinutes: ..., // optional
  notes: ..., // optional
};

// Call the `recordWorkoutExercise()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await recordWorkoutExercise(recordWorkoutExerciseVars);
// Variables can be defined inline as well.
const { data } = await recordWorkoutExercise({ workoutId: ..., exerciseId: ..., sets: ..., reps: ..., weightKg: ..., distanceKm: ..., durationMinutes: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await recordWorkoutExercise(dataConnect, recordWorkoutExerciseVars);

console.log(data.workoutExercise_insert);

// Or, you can use the `Promise` API.
recordWorkoutExercise(recordWorkoutExerciseVars).then((response) => {
  const data = response.data;
  console.log(data.workoutExercise_insert);
});
```

### Using `RecordWorkoutExercise`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, recordWorkoutExerciseRef, RecordWorkoutExerciseVariables } from '@dataconnect/generated';

// The `RecordWorkoutExercise` mutation requires an argument of type `RecordWorkoutExerciseVariables`:
const recordWorkoutExerciseVars: RecordWorkoutExerciseVariables = {
  workoutId: ..., 
  exerciseId: ..., 
  sets: ..., // optional
  reps: ..., // optional
  weightKg: ..., // optional
  distanceKm: ..., // optional
  durationMinutes: ..., // optional
  notes: ..., // optional
};

// Call the `recordWorkoutExerciseRef()` function to get a reference to the mutation.
const ref = recordWorkoutExerciseRef(recordWorkoutExerciseVars);
// Variables can be defined inline as well.
const ref = recordWorkoutExerciseRef({ workoutId: ..., exerciseId: ..., sets: ..., reps: ..., weightKg: ..., distanceKm: ..., durationMinutes: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = recordWorkoutExerciseRef(dataConnect, recordWorkoutExerciseVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.workoutExercise_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.workoutExercise_insert);
});
```

