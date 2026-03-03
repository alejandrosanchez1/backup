
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


import kotlinx.coroutines.flow.filterNotNull as _flow_filterNotNull
import kotlinx.coroutines.flow.map as _flow_map


public interface ListAllExercisesQuery :
    com.google.firebase.dataconnect.generated.GeneratedQuery<
      ExampleConnector,
      ListAllExercisesQuery.Data,
      Unit
    >
{
  

  
    @kotlinx.serialization.Serializable
  public data class Data(
  
    val exercises: List<ExercisesItem>
  ) {
    
      
        @kotlinx.serialization.Serializable
  public data class ExercisesItem(
  
    val id: @kotlinx.serialization.Serializable(with = com.google.firebase.dataconnect.serializers.UUIDSerializer::class) java.util.UUID,
    val name: String,
    val category: String,
    val description: String?
  ) {
    
    
  }
      
    
    
  }
  

  public companion object {
    public val operationName: String = "ListAllExercises"

    public val dataDeserializer: kotlinx.serialization.DeserializationStrategy<Data> =
      kotlinx.serialization.serializer()

    public val variablesSerializer: kotlinx.serialization.SerializationStrategy<Unit> =
      kotlinx.serialization.serializer()
  }
}

public fun ListAllExercisesQuery.ref(
  
): com.google.firebase.dataconnect.QueryRef<
    ListAllExercisesQuery.Data,
    Unit
  > =
  ref(
    
      Unit
    
  )

public suspend fun ListAllExercisesQuery.execute(
  
  ): com.google.firebase.dataconnect.QueryResult<
    ListAllExercisesQuery.Data,
    Unit
  > =
  ref(
    
  ).execute()


  public fun ListAllExercisesQuery.flow(
    
    ): kotlinx.coroutines.flow.Flow<ListAllExercisesQuery.Data> =
    ref(
        
      ).subscribe()
      .flow
      ._flow_map { querySubscriptionResult -> querySubscriptionResult.result.getOrNull() }
      ._flow_filterNotNull()
      ._flow_map { it.data }

