
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


public interface GetMyGoalsQuery :
    com.google.firebase.dataconnect.generated.GeneratedQuery<
      ExampleConnector,
      GetMyGoalsQuery.Data,
      Unit
    >
{
  

  
    @kotlinx.serialization.Serializable
  public data class Data(
  
    val goals: List<GoalsItem>
  ) {
    
      
        @kotlinx.serialization.Serializable
  public data class GoalsItem(
  
    val id: @kotlinx.serialization.Serializable(with = com.google.firebase.dataconnect.serializers.UUIDSerializer::class) java.util.UUID,
    val description: String,
    val goalType: String,
    val targetDate: com.google.firebase.dataconnect.LocalDate,
    val targetValue: Double,
    val unit: String,
    val achievedDate: com.google.firebase.dataconnect.LocalDate?
  ) {
    
    
  }
      
    
    
  }
  

  public companion object {
    public val operationName: String = "GetMyGoals"

    public val dataDeserializer: kotlinx.serialization.DeserializationStrategy<Data> =
      kotlinx.serialization.serializer()

    public val variablesSerializer: kotlinx.serialization.SerializationStrategy<Unit> =
      kotlinx.serialization.serializer()
  }
}

public fun GetMyGoalsQuery.ref(
  
): com.google.firebase.dataconnect.QueryRef<
    GetMyGoalsQuery.Data,
    Unit
  > =
  ref(
    
      Unit
    
  )

public suspend fun GetMyGoalsQuery.execute(
  
  ): com.google.firebase.dataconnect.QueryResult<
    GetMyGoalsQuery.Data,
    Unit
  > =
  ref(
    
  ).execute()


  public fun GetMyGoalsQuery.flow(
    
    ): kotlinx.coroutines.flow.Flow<GetMyGoalsQuery.Data> =
    ref(
        
      ).subscribe()
      .flow
      ._flow_map { querySubscriptionResult -> querySubscriptionResult.result.getOrNull() }
      ._flow_filterNotNull()
      ._flow_map { it.data }

