
@file:kotlin.Suppress(
  "KotlinRedundantDiagnosticSuppress",
  "LocalVariableName",
  "MayBeConstant",
  "RedundantVisibilityModifier",
  "RemoveEmptyClassBody",
  "SpellCheckingInspection",
  "LocalVariableName",
  "unused",
)

package com.google.firebase.dataconnect.generated



public interface CreateNewWorkoutMutation :
    com.google.firebase.dataconnect.generated.GeneratedMutation<
      ExampleConnector,
      CreateNewWorkoutMutation.Data,
      CreateNewWorkoutMutation.Variables
    >
{
  
    @kotlinx.serialization.Serializable
  public data class Variables(
  
    val workoutDate: com.google.firebase.dataconnect.LocalDate,
    val workoutType: String,
    val durationMinutes: Int,
    val notes: com.google.firebase.dataconnect.OptionalVariable<String?>
  ) {
    
    
      
      @kotlin.DslMarker public annotation class BuilderDsl

      @BuilderDsl
      public interface Builder {
        public var workoutDate: com.google.firebase.dataconnect.LocalDate
        public var workoutType: String
        public var durationMinutes: Int
        public var notes: String?
        
      }

      public companion object {
        @Suppress("NAME_SHADOWING")
        public fun build(
          workoutDate: com.google.firebase.dataconnect.LocalDate,workoutType: String,durationMinutes: Int,
          block_: Builder.() -> Unit
        ): Variables {
          var workoutDate= workoutDate
            var workoutType= workoutType
            var durationMinutes= durationMinutes
            var notes: com.google.firebase.dataconnect.OptionalVariable<String?> =
                com.google.firebase.dataconnect.OptionalVariable.Undefined
            

          return object : Builder {
            override var workoutDate: com.google.firebase.dataconnect.LocalDate
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { workoutDate = value_ }
              
            override var workoutType: String
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { workoutType = value_ }
              
            override var durationMinutes: Int
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { durationMinutes = value_ }
              
            override var notes: String?
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { notes = com.google.firebase.dataconnect.OptionalVariable.Value(value_) }
              
            
          }.apply(block_)
          .let {
            Variables(
              workoutDate=workoutDate,workoutType=workoutType,durationMinutes=durationMinutes,notes=notes,
            )
          }
        }
      }
    
  }
  

  
    @kotlinx.serialization.Serializable
  public data class Data(
  
    val workout_insert: WorkoutKey
  ) {
    
    
  }
  

  public companion object {
    public val operationName: String = "CreateNewWorkout"

    public val dataDeserializer: kotlinx.serialization.DeserializationStrategy<Data> =
      kotlinx.serialization.serializer()

    public val variablesSerializer: kotlinx.serialization.SerializationStrategy<Variables> =
      kotlinx.serialization.serializer()
  }
}

public fun CreateNewWorkoutMutation.ref(
  
    workoutDate: com.google.firebase.dataconnect.LocalDate,workoutType: String,durationMinutes: Int,
  
    block_: CreateNewWorkoutMutation.Variables.Builder.() -> Unit = {}
  
): com.google.firebase.dataconnect.MutationRef<
    CreateNewWorkoutMutation.Data,
    CreateNewWorkoutMutation.Variables
  > =
  ref(
    
      CreateNewWorkoutMutation.Variables.build(
        workoutDate=workoutDate,workoutType=workoutType,durationMinutes=durationMinutes,
  
    block_
      )
    
  )

public suspend fun CreateNewWorkoutMutation.execute(
  
    workoutDate: com.google.firebase.dataconnect.LocalDate,workoutType: String,durationMinutes: Int,
  
    block_: CreateNewWorkoutMutation.Variables.Builder.() -> Unit = {}
  
  ): com.google.firebase.dataconnect.MutationResult<
    CreateNewWorkoutMutation.Data,
    CreateNewWorkoutMutation.Variables
  > =
  ref(
    
      workoutDate=workoutDate,workoutType=workoutType,durationMinutes=durationMinutes,
  
    block_
    
  ).execute()


