import Foundation

import FirebaseCore
import FirebaseDataConnect




public struct ExerciseKey {
  
  public private(set) var id: UUID
  

  enum CodingKeys: String, CodingKey {
    
    case  id
    
  }
}

extension ExerciseKey : Codable {
  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
  }

  public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(id, forKey: .id, container: &container)
      
      
    }
}

extension ExerciseKey : Equatable {
  public static func == (lhs: ExerciseKey, rhs: ExerciseKey) -> Bool {
    
    if lhs.id != rhs.id {
      return false
    }
    
    return true
  }
}

extension ExerciseKey : Hashable {
  public func hash(into hasher: inout Hasher) {
    
    hasher.combine(self.id)
    
  }
}

extension ExerciseKey : Sendable {}



public struct GoalKey {
  
  public private(set) var id: UUID
  

  enum CodingKeys: String, CodingKey {
    
    case  id
    
  }
}

extension GoalKey : Codable {
  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
  }

  public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(id, forKey: .id, container: &container)
      
      
    }
}

extension GoalKey : Equatable {
  public static func == (lhs: GoalKey, rhs: GoalKey) -> Bool {
    
    if lhs.id != rhs.id {
      return false
    }
    
    return true
  }
}

extension GoalKey : Hashable {
  public func hash(into hasher: inout Hasher) {
    
    hasher.combine(self.id)
    
  }
}

extension GoalKey : Sendable {}



public struct UserKey {
  
  public private(set) var id: UUID
  

  enum CodingKeys: String, CodingKey {
    
    case  id
    
  }
}

extension UserKey : Codable {
  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
  }

  public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(id, forKey: .id, container: &container)
      
      
    }
}

extension UserKey : Equatable {
  public static func == (lhs: UserKey, rhs: UserKey) -> Bool {
    
    if lhs.id != rhs.id {
      return false
    }
    
    return true
  }
}

extension UserKey : Hashable {
  public func hash(into hasher: inout Hasher) {
    
    hasher.combine(self.id)
    
  }
}

extension UserKey : Sendable {}



public struct WorkoutExerciseKey {
  
  public private(set) var id: UUID
  

  enum CodingKeys: String, CodingKey {
    
    case  id
    
  }
}

extension WorkoutExerciseKey : Codable {
  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
  }

  public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(id, forKey: .id, container: &container)
      
      
    }
}

extension WorkoutExerciseKey : Equatable {
  public static func == (lhs: WorkoutExerciseKey, rhs: WorkoutExerciseKey) -> Bool {
    
    if lhs.id != rhs.id {
      return false
    }
    
    return true
  }
}

extension WorkoutExerciseKey : Hashable {
  public func hash(into hasher: inout Hasher) {
    
    hasher.combine(self.id)
    
  }
}

extension WorkoutExerciseKey : Sendable {}



public struct WorkoutKey {
  
  public private(set) var id: UUID
  

  enum CodingKeys: String, CodingKey {
    
    case  id
    
  }
}

extension WorkoutKey : Codable {
  public init(from decoder: any Decoder) throws {
    var container = try decoder.container(keyedBy: CodingKeys.self)
    let codecHelper = CodecHelper<CodingKeys>()

    
    self.id = try codecHelper.decode(UUID.self, forKey: .id, container: &container)
    
  }

  public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      let codecHelper = CodecHelper<CodingKeys>()
      
      
      try codecHelper.encode(id, forKey: .id, container: &container)
      
      
    }
}

extension WorkoutKey : Equatable {
  public static func == (lhs: WorkoutKey, rhs: WorkoutKey) -> Bool {
    
    if lhs.id != rhs.id {
      return false
    }
    
    return true
  }
}

extension WorkoutKey : Hashable {
  public func hash(into hasher: inout Hasher) {
    
    hasher.combine(self.id)
    
  }
}

extension WorkoutKey : Sendable {}


