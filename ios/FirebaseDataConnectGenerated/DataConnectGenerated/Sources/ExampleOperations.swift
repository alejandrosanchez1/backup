import Foundation

import FirebaseCore
import FirebaseDataConnect




















// MARK: Common Enums

public enum OrderDirection: String, Codable, Sendable {
  case ASC = "ASC"
  case DESC = "DESC"
  }

public enum SearchQueryFormat: String, Codable, Sendable {
  case QUERY = "QUERY"
  case PLAIN = "PLAIN"
  case PHRASE = "PHRASE"
  case ADVANCED = "ADVANCED"
  }


// MARK: Connector Enums

// End enum definitions









public class ListAllExercisesQuery{

  let dataConnect: DataConnect

  init(dataConnect: DataConnect) {
    self.dataConnect = dataConnect
  }

  public static let OperationName = "ListAllExercises"

  public typealias Ref = QueryRefObservation<ListAllExercisesQuery.Data,ListAllExercisesQuery.Variables>

  public struct Variables: OperationVariable {

    
    
  }

  public struct Data: Decodable, Sendable {




public struct Exercise: Decodable, Sendable ,Hashable, Equatable, Identifiable {
  


public var 
id: UUID



public var 
name: String



public var 
category: String



public var 
description: String?


  
  public var exerciseKey: ExerciseKey {
    return ExerciseKey(
      
      id: id
    )
  }

  
public func hash(into hasher: inout Hasher) {
  
  hasher.combine(id)
  
}
public static func == (lhs: Exercise, rhs: Exercise) -> Bool {
    
    return lhs.id == rhs.id 
        
  }

  

  
  enum CodingKeys: String, CodingKey {
    
    case id
    
    case name
    
    case category
    
    case description
    
  }

  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
    
    
    self.name = try codecHelper.decode(String.self, forKey: .name, container: &container)
    
    
    
    self.category = try codecHelper.decode(String.self, forKey: .category, container: &container)
    
    
    
    self.description = try codecHelper.decode(String?.self, forKey: .description, container: &container)
    
    
  }
}
public var 
exercises: [Exercise]

  }

  public func ref(
        
        ) -> QueryRefObservation<ListAllExercisesQuery.Data,ListAllExercisesQuery.Variables>  {
        var variables = ListAllExercisesQuery.Variables()
        

        let ref = dataConnect.query(name: "ListAllExercises", variables: variables, resultsDataType:ListAllExercisesQuery.Data.self, publisher: .observableMacro)
        return ref as! QueryRefObservation<ListAllExercisesQuery.Data,ListAllExercisesQuery.Variables>
   }

  @MainActor
   public func execute(
        
        ) async throws -> OperationResult<ListAllExercisesQuery.Data> {
        var variables = ListAllExercisesQuery.Variables()
        
        
        let ref = dataConnect.query(name: "ListAllExercises", variables: variables, resultsDataType:ListAllExercisesQuery.Data.self, publisher: .observableMacro)
        
        let refCast = ref as! QueryRefObservation<ListAllExercisesQuery.Data,ListAllExercisesQuery.Variables>
        return try await refCast.execute()
        
   }
}






public class CreateNewWorkoutMutation{

  let dataConnect: DataConnect

  init(dataConnect: DataConnect) {
    self.dataConnect = dataConnect
  }

  public static let OperationName = "CreateNewWorkout"

  public typealias Ref = MutationRef<CreateNewWorkoutMutation.Data,CreateNewWorkoutMutation.Variables>

  public struct Variables: OperationVariable {
  
        
        public var
workoutDate: LocalDate

  
        
        public var
workoutType: String

  
        
        public var
durationMinutes: Int

  
        @OptionalVariable
        public var
notes: String?


    
    
    
    public init (
        
workoutDate: LocalDate
,
        
workoutType: String
,
        
durationMinutes: Int

        
        
        ,
        _ optionalVars: ((inout Variables)->())? = nil
        ) {
        self.workoutDate = workoutDate
        self.workoutType = workoutType
        self.durationMinutes = durationMinutes
        

        
        if let optionalVars {
            optionalVars(&self)
        }
        
    }

    public static func == (lhs: Variables, rhs: Variables) -> Bool {
      
        return lhs.workoutDate == rhs.workoutDate && 
              lhs.workoutType == rhs.workoutType && 
              lhs.durationMinutes == rhs.durationMinutes && 
              lhs.notes == rhs.notes
              
    }

    
public func hash(into hasher: inout Hasher) {
  
  hasher.combine(workoutDate)
  
  hasher.combine(workoutType)
  
  hasher.combine(durationMinutes)
  
  hasher.combine(notes)
  
}

    enum CodingKeys: String, CodingKey {
      
      case workoutDate
      
      case workoutType
      
      case durationMinutes
      
      case notes
      
    }

    public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(workoutDate, forKey: .workoutDate, container: &container)
      
      
      
      try codecHelper.encode(workoutType, forKey: .workoutType, container: &container)
      
      
      
      try codecHelper.encode(durationMinutes, forKey: .durationMinutes, container: &container)
      
      
      if $notes.isSet { 
      try codecHelper.encode(notes, forKey: .notes, container: &container)
      }
      
    }

  }

  public struct Data: Decodable, Sendable {



public var 
workout_insert: WorkoutKey

  }

  public func ref(
        
workoutDate: LocalDate
,
workoutType: String
,
durationMinutes: Int

        
        ,
        _ optionalVars: ((inout CreateNewWorkoutMutation.Variables)->())? = nil
        ) -> MutationRef<CreateNewWorkoutMutation.Data,CreateNewWorkoutMutation.Variables>  {
        var variables = CreateNewWorkoutMutation.Variables(workoutDate:workoutDate,workoutType:workoutType,durationMinutes:durationMinutes)
        
        if let optionalVars {
            optionalVars(&variables)
        }
        

        let ref = dataConnect.mutation(name: "CreateNewWorkout", variables: variables, resultsDataType:CreateNewWorkoutMutation.Data.self)
        return ref as MutationRef<CreateNewWorkoutMutation.Data,CreateNewWorkoutMutation.Variables>
   }

  @MainActor
   public func execute(
        
workoutDate: LocalDate
,
workoutType: String
,
durationMinutes: Int

        
        ,
        _ optionalVars: (@MainActor (inout CreateNewWorkoutMutation.Variables)->())? = nil
        ) async throws -> OperationResult<CreateNewWorkoutMutation.Data> {
        var variables = CreateNewWorkoutMutation.Variables(workoutDate:workoutDate,workoutType:workoutType,durationMinutes:durationMinutes)
        
        if let optionalVars {
            optionalVars(&variables)
        }
        
        
        let ref = dataConnect.mutation(name: "CreateNewWorkout", variables: variables, resultsDataType:CreateNewWorkoutMutation.Data.self)
        
        return try await ref.execute()
        
   }
}






public class GetMyGoalsQuery{

  let dataConnect: DataConnect

  init(dataConnect: DataConnect) {
    self.dataConnect = dataConnect
  }

  public static let OperationName = "GetMyGoals"

  public typealias Ref = QueryRefObservation<GetMyGoalsQuery.Data,GetMyGoalsQuery.Variables>

  public struct Variables: OperationVariable {

    
    
  }

  public struct Data: Decodable, Sendable {




public struct Goal: Decodable, Sendable ,Hashable, Equatable, Identifiable {
  


public var 
id: UUID



public var 
description: String



public var 
goalType: String



public var 
targetDate: LocalDate



public var 
targetValue: Double



public var 
unit: String



public var 
achievedDate: LocalDate?


  
  public var goalKey: GoalKey {
    return GoalKey(
      
      id: id
    )
  }

  
public func hash(into hasher: inout Hasher) {
  
  hasher.combine(id)
  
}
public static func == (lhs: Goal, rhs: Goal) -> Bool {
    
    return lhs.id == rhs.id 
        
  }

  

  
  enum CodingKeys: String, CodingKey {
    
    case id
    
    case description
    
    case goalType
    
    case targetDate
    
    case targetValue
    
    case unit
    
    case achievedDate
    
  }

  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
    
    
    self.description = try codecHelper.decode(String.self, forKey: .description, container: &container)
    
    
    
    self.goalType = try codecHelper.decode(String.self, forKey: .goalType, container: &container)
    
    
    
    self.targetDate = try codecHelper.decode(LocalDate.self, forKey: .targetDate, container: &container)
    
    
    
    self.targetValue = try codecHelper.decode(Double.self, forKey: .targetValue, container: &container)
    
    
    
    self.unit = try codecHelper.decode(String.self, forKey: .unit, container: &container)
    
    
    
    self.achievedDate = try codecHelper.decode(LocalDate?.self, forKey: .achievedDate, container: &container)
    
    
  }
}
public var 
goals: [Goal]

  }

  public func ref(
        
        ) -> QueryRefObservation<GetMyGoalsQuery.Data,GetMyGoalsQuery.Variables>  {
        var variables = GetMyGoalsQuery.Variables()
        

        let ref = dataConnect.query(name: "GetMyGoals", variables: variables, resultsDataType:GetMyGoalsQuery.Data.self, publisher: .observableMacro)
        return ref as! QueryRefObservation<GetMyGoalsQuery.Data,GetMyGoalsQuery.Variables>
   }

  @MainActor
   public func execute(
        
        ) async throws -> OperationResult<GetMyGoalsQuery.Data> {
        var variables = GetMyGoalsQuery.Variables()
        
        
        let ref = dataConnect.query(name: "GetMyGoals", variables: variables, resultsDataType:GetMyGoalsQuery.Data.self, publisher: .observableMacro)
        
        let refCast = ref as! QueryRefObservation<GetMyGoalsQuery.Data,GetMyGoalsQuery.Variables>
        return try await refCast.execute()
        
   }
}






public class RecordWorkoutExerciseMutation{

  let dataConnect: DataConnect

  init(dataConnect: DataConnect) {
    self.dataConnect = dataConnect
  }

  public static let OperationName = "RecordWorkoutExercise"

  public typealias Ref = MutationRef<RecordWorkoutExerciseMutation.Data,RecordWorkoutExerciseMutation.Variables>

  public struct Variables: OperationVariable {
  
        
        public var
workoutId: UUID

  
        
        public var
exerciseId: UUID

  
        @OptionalVariable
        public var
sets: Int?

  
        @OptionalVariable
        public var
reps: Int?

  
        @OptionalVariable
        public var
weightKg: Double?

  
        @OptionalVariable
        public var
distanceKm: Double?

  
        @OptionalVariable
        public var
durationMinutes: Int?

  
        @OptionalVariable
        public var
notes: String?


    
    
    
    public init (
        
workoutId: UUID
,
        
exerciseId: UUID

        
        
        ,
        _ optionalVars: ((inout Variables)->())? = nil
        ) {
        self.workoutId = workoutId
        self.exerciseId = exerciseId
        

        
        if let optionalVars {
            optionalVars(&self)
        }
        
    }

    public static func == (lhs: Variables, rhs: Variables) -> Bool {
      
        return lhs.workoutId == rhs.workoutId && 
              lhs.exerciseId == rhs.exerciseId && 
              lhs.sets == rhs.sets && 
              lhs.reps == rhs.reps && 
              lhs.weightKg == rhs.weightKg && 
              lhs.distanceKm == rhs.distanceKm && 
              lhs.durationMinutes == rhs.durationMinutes && 
              lhs.notes == rhs.notes
              
    }

    
public func hash(into hasher: inout Hasher) {
  
  hasher.combine(workoutId)
  
  hasher.combine(exerciseId)
  
  hasher.combine(sets)
  
  hasher.combine(reps)
  
  hasher.combine(weightKg)
  
  hasher.combine(distanceKm)
  
  hasher.combine(durationMinutes)
  
  hasher.combine(notes)
  
}

    enum CodingKeys: String, CodingKey {
      
      case workoutId
      
      case exerciseId
      
      case sets
      
      case reps
      
      case weightKg
      
      case distanceKm
      
      case durationMinutes
      
      case notes
      
    }

    public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(workoutId, forKey: .workoutId, container: &container)
      
      
      
      try codecHelper.encode(exerciseId, forKey: .exerciseId, container: &container)
      
      
      if $sets.isSet { 
      try codecHelper.encode(sets, forKey: .sets, container: &container)
      }
      
      if $reps.isSet { 
      try codecHelper.encode(reps, forKey: .reps, container: &container)
      }
      
      if $weightKg.isSet { 
      try codecHelper.encode(weightKg, forKey: .weightKg, container: &container)
      }
      
      if $distanceKm.isSet { 
      try codecHelper.encode(distanceKm, forKey: .distanceKm, container: &container)
      }
      
      if $durationMinutes.isSet { 
      try codecHelper.encode(durationMinutes, forKey: .durationMinutes, container: &container)
      }
      
      if $notes.isSet { 
      try codecHelper.encode(notes, forKey: .notes, container: &container)
      }
      
    }

  }

  public struct Data: Decodable, Sendable {



public var 
workoutExercise_insert: WorkoutExerciseKey

  }

  public func ref(
        
workoutId: UUID
,
exerciseId: UUID

        
        ,
        _ optionalVars: ((inout RecordWorkoutExerciseMutation.Variables)->())? = nil
        ) -> MutationRef<RecordWorkoutExerciseMutation.Data,RecordWorkoutExerciseMutation.Variables>  {
        var variables = RecordWorkoutExerciseMutation.Variables(workoutId:workoutId,exerciseId:exerciseId)
        
        if let optionalVars {
            optionalVars(&variables)
        }
        

        let ref = dataConnect.mutation(name: "RecordWorkoutExercise", variables: variables, resultsDataType:RecordWorkoutExerciseMutation.Data.self)
        return ref as MutationRef<RecordWorkoutExerciseMutation.Data,RecordWorkoutExerciseMutation.Variables>
   }

  @MainActor
   public func execute(
        
workoutId: UUID
,
exerciseId: UUID

        
        ,
        _ optionalVars: (@MainActor (inout RecordWorkoutExerciseMutation.Variables)->())? = nil
        ) async throws -> OperationResult<RecordWorkoutExerciseMutation.Data> {
        var variables = RecordWorkoutExerciseMutation.Variables(workoutId:workoutId,exerciseId:exerciseId)
        
        if let optionalVars {
            optionalVars(&variables)
        }
        
        
        let ref = dataConnect.mutation(name: "RecordWorkoutExercise", variables: variables, resultsDataType:RecordWorkoutExerciseMutation.Data.self)
        
        return try await ref.execute()
        
   }
}


