
import Foundation

import FirebaseCore
import FirebaseDataConnect
public extension DataConnect {

  static let exampleConnector: ExampleConnector = {
    let dc = DataConnect.dataConnect(connectorConfig: ExampleConnector.connectorConfig, callerSDKType: .generated)
    return ExampleConnector(dataConnect: dc)
  }()

}

public class ExampleConnector {

  let dataConnect: DataConnect

  public static let connectorConfig = ConnectorConfig(serviceId: "app-similar-to-hevy", location: "us-east4", connector: "example")

  init(dataConnect: DataConnect) {
    self.dataConnect = dataConnect

    // init operations 
    self.listAllExercisesQuery = ListAllExercisesQuery(dataConnect: dataConnect)
    self.createNewWorkoutMutation = CreateNewWorkoutMutation(dataConnect: dataConnect)
    self.getMyGoalsQuery = GetMyGoalsQuery(dataConnect: dataConnect)
    self.recordWorkoutExerciseMutation = RecordWorkoutExerciseMutation(dataConnect: dataConnect)
    
  }

  public func useEmulator(host: String = DataConnect.EmulatorDefaults.host, port: Int = DataConnect.EmulatorDefaults.port) {
    self.dataConnect.useEmulator(host: host, port: port)
  }

  // MARK: Operations
public let listAllExercisesQuery: ListAllExercisesQuery
public let createNewWorkoutMutation: CreateNewWorkoutMutation
public let getMyGoalsQuery: GetMyGoalsQuery
public let recordWorkoutExerciseMutation: RecordWorkoutExerciseMutation


}
