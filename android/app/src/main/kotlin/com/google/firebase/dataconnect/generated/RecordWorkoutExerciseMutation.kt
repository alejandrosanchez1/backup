
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



public interface RecordWorkoutExerciseMutation :
    com.google.firebase.dataconnect.generated.GeneratedMutation<
      ExampleConnector,
      RecordWorkoutExerciseMutation.Data,
      RecordWorkoutExerciseMutation.Variables
    >
{
  
    @kotlinx.serialization.Serializable
  public data class Variables(
  
    val workoutId: @kotlinx.serialization.Serializable(with = com.google.firebase.dataconnect.serializers.UUIDSerializer::class) java.util.UUID,
    val exerciseId: @kotlinx.serialization.Serializable(with = com.google.firebase.dataconnect.serializers.UUIDSerializer::class) java.util.UUID,
    val sets: com.google.firebase.dataconnect.OptionalVariable<Int?>,
    val reps: com.google.firebase.dataconnect.OptionalVariable<Int?>,
    val weightKg: com.google.firebase.dataconnect.OptionalVariable<Double?>,
    val distanceKm: com.google.firebase.dataconnect.OptionalVariable<Double?>,
    val durationMinutes: com.google.firebase.dataconnect.OptionalVariable<Int?>,
    val notes: com.google.firebase.dataconnect.OptionalVariable<String?>
  ) {
    
    
      
      @kotlin.DslMarker public annotation class BuilderDsl

      @BuilderDsl
      public interface Builder {
        public var workoutId: java.util.UUID
        public var exerciseId: java.util.UUID
        public var sets: Int?
        public var reps: Int?
        public var weightKg: Double?
        public var distanceKm: Double?
        public var durationMinutes: Int?
        public var notes: String?
        
      }

      public companion object {
        @Suppress("NAME_SHADOWING")
        public fun build(
          workoutId: java.util.UUID,exerciseId: java.util.UUID,
          block_: Builder.() -> Unit
        ): Variables {
          var workoutId= workoutId
            var exerciseId= exerciseId
            var sets: com.google.firebase.dataconnect.OptionalVariable<Int?> =
                com.google.firebase.dataconnect.OptionalVariable.Undefined
            var reps: com.google.firebase.dataconnect.OptionalVariable<Int?> =
                com.google.firebase.dataconnect.OptionalVariable.Undefined
            var weightKg: com.google.firebase.dataconnect.OptionalVariable<Double?> =
                com.google.firebase.dataconnect.OptionalVariable.Undefined
            var distanceKm: com.google.firebase.dataconnect.OptionalVariable<Double?> =
                com.google.firebase.dataconnect.OptionalVariable.Undefined
            var durationMinutes: com.google.firebase.dataconnect.OptionalVariable<Int?> =
                com.google.firebase.dataconnect.OptionalVariable.Undefined
            var notes: com.google.firebase.dataconnect.OptionalVariable<String?> =
                com.google.firebase.dataconnect.OptionalVariable.Undefined
            

          return object : Builder {
            override var workoutId: java.util.UUID
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { workoutId = value_ }
              
            override var exerciseId: java.util.UUID
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { exerciseId = value_ }
              
            override var sets: Int?
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { sets = com.google.firebase.dataconnect.OptionalVariable.Value(value_) }
              
            override var reps: Int?
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { reps = com.google.firebase.dataconnect.OptionalVariable.Value(value_) }
              
            override var weightKg: Double?
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { weightKg = com.google.firebase.dataconnect.OptionalVariable.Value(value_) }
              
            override var distanceKm: Double?
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { distanceKm = com.google.firebase.dataconnect.OptionalVariable.Value(value_) }
              
            override var durationMinutes: Int?
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { durationMinutes = com.google.firebase.dataconnect.OptionalVariable.Value(value_) }
              
            override var notes: String?
              get() = throw UnsupportedOperationException("getting builder values is not supported")
              set(value_) { notes = com.google.firebase.dataconnect.OptionalVariable.Value(value_) }
              
            
          }.apply(block_)
          .let {
            Variables(
              workoutId=workoutId,exerciseId=exerciseId,sets=sets,reps=reps,weightKg=weightKg,distanceKm=distanceKm,durationMinutes=durationMinutes,notes=notes,
            )
          }
        }
      }
    
  }
  

  
    @kotlinx.serialization.Serializable
  public data class Data(
  
    val workoutExercise_insert: WorkoutExerciseKey
  ) {
    
    
  }
  

  public companion object {
    public val operationName: String = "RecordWorkoutExercise"

    public val dataDeserializer: kotlinx.serialization.DeserializationStrategy<Data> =
      kotlinx.serialization.serializer()

    public val variablesSerializer: kotlinx.serialization.SerializationStrategy<Variables> =
      kotlinx.serialization.serializer()
  }
}

public fun RecordWorkoutExerciseMutation.ref(
  
    workoutId: java.util.UUID,exerciseId: java.util.UUID,
  
    block_: RecordWorkoutExerciseMutation.Variables.Builder.() -> Unit = {}
  
): com.google.firebase.dataconnect.MutationRef<
    RecordWorkoutExerciseMutation.Data,
    RecordWorkoutExerciseMutation.Variables
  > =
  ref(
    
      RecordWorkoutExerciseMutation.Variables.build(
        workoutId=workoutId,exerciseId=exerciseId,
  
    block_
      )
    
  )

public suspend fun RecordWorkoutExerciseMutation.execute(
  
    workoutId: java.util.UUID,exerciseId: java.util.UUID,
  
    block_: RecordWorkoutExerciseMutation.Variables.Builder.() -> Unit = {}
  
  ): com.google.firebase.dataconnect.MutationResult<
    RecordWorkoutExerciseMutation.Data,
    RecordWorkoutExerciseMutation.Variables
  > =
  ref(
    
      workoutId=workoutId,exerciseId=exerciseId,
  
    block_
    
  ).execute()


