This Swift package contains the generated Swift code for the connector `example`.

You can use this package by adding it as a local Swift package dependency in your project.

# Accessing the connector

Add the necessary imports

```
import FirebaseDataConnect
import DataConnectGenerated

```

The connector can be accessed using the following code:

```
let connector = DataConnect.exampleConnector

```


## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code, which can be called from the `init` function of your SwiftUI app

```
connector.useEmulator()
```

# Queries

## ListAllExercisesQuery


### Using the Query Reference
```
struct MyView: View {
   var listAllExercisesQueryRef = DataConnect.exampleConnector.listAllExercisesQuery.ref(...)

  var body: some View {
    VStack {
      if let data = listAllExercisesQueryRef.data {
        // use data in View
      }
      else {
        Text("Loading...")
      }
    }
    .task {
        do {
          let _ = try await listAllExercisesQueryRef.execute()
        } catch {
        }
      }
  }
}
```

### One-shot execute
```
DataConnect.exampleConnector.listAllExercisesQuery.execute(...)
```


## GetMyGoalsQuery


### Using the Query Reference
```
struct MyView: View {
   var getMyGoalsQueryRef = DataConnect.exampleConnector.getMyGoalsQuery.ref(...)

  var body: some View {
    VStack {
      if let data = getMyGoalsQueryRef.data {
        // use data in View
      }
      else {
        Text("Loading...")
      }
    }
    .task {
        do {
          let _ = try await getMyGoalsQueryRef.execute()
        } catch {
        }
      }
  }
}
```

### One-shot execute
```
DataConnect.exampleConnector.getMyGoalsQuery.execute(...)
```


# Mutations
## CreateNewWorkoutMutation

### Variables

#### Required
```swift

let workoutDate: LocalDate = ...
let workoutType: String = ...
let durationMinutes: Int = ...
```
 

#### Optional
```swift

let notes: String = ...
```

### One-shot execute
```
DataConnect.exampleConnector.createNewWorkoutMutation.execute(...)
```

## RecordWorkoutExerciseMutation

### Variables

#### Required
```swift

let workoutId: UUID = ...
let exerciseId: UUID = ...
```
 

#### Optional
```swift

let sets: Int = ...
let reps: Int = ...
let weightKg: Double = ...
let distanceKm: Double = ...
let durationMinutes: Int = ...
let notes: String = ...
```

### One-shot execute
```
DataConnect.exampleConnector.recordWorkoutExerciseMutation.execute(...)
```

