export interface ExerciseData {
  id: string
  name: string
  category: string
  muscle: string
  equipment: string
  description?: string
}

export const exercisesData: ExerciseData[] = [
  // Chest - Barbell
  { id: "1", name: "Bench Press (Barbell)", category: "Chest", muscle: "Chest", equipment: "Barbell" },
  { id: "2", name: "Incline Bench Press (Barbell)", category: "Chest", muscle: "Upper Chest", equipment: "Barbell" },
  { id: "3", name: "Decline Bench Press (Barbell)", category: "Chest", muscle: "Lower Chest", equipment: "Barbell" },
  { id: "4", name: "Close Grip Bench Press", category: "Chest", muscle: "Inner Chest", equipment: "Barbell" },
  // Chest - Dumbbell
  { id: "5", name: "Dumbbell Bench Press", category: "Chest", muscle: "Chest", equipment: "Dumbbell" },
  { id: "6", name: "Incline Dumbbell Press", category: "Chest", muscle: "Upper Chest", equipment: "Dumbbell" },
  { id: "7", name: "Decline Dumbbell Press", category: "Chest", muscle: "Lower Chest", equipment: "Dumbbell" },
  { id: "8", name: "Dumbbell Fly", category: "Chest", muscle: "Chest", equipment: "Dumbbell" },
  { id: "9", name: "Incline Dumbbell Fly", category: "Chest", muscle: "Upper Chest", equipment: "Dumbbell" },
  { id: "10", name: "Dumbbell Pullover", category: "Chest", muscle: "Chest", equipment: "Dumbbell" },
  // Chest - Cable/Machine
  { id: "11", name: "Cable Crossover", category: "Chest", muscle: "Chest", equipment: "Cable" },
  { id: "12", name: "Low Cable Crossover", category: "Chest", muscle: "Upper Chest", equipment: "Cable" },
  { id: "13", name: "High Cable Crossover", category: "Chest", muscle: "Lower Chest", equipment: "Cable" },
  { id: "14", name: "Chest Press Machine", category: "Chest", muscle: "Chest", equipment: "Machine" },
  { id: "15", name: "Pec Deck Machine", category: "Chest", muscle: "Chest", equipment: "Machine" },
  // Chest - Bodyweight
  { id: "16", name: "Push Up", category: "Chest", muscle: "Chest", equipment: "Bodyweight" },
  { id: "17", name: "Incline Push Up", category: "Chest", muscle: "Lower Chest", equipment: "Bodyweight" },
  { id: "18", name: "Decline Push Up", category: "Chest", muscle: "Upper Chest", equipment: "Bodyweight" },
  { id: "19", name: "Diamond Push Up", category: "Chest", muscle: "Inner Chest", equipment: "Bodyweight" },
  { id: "20", name: "Wide Push Up", category: "Chest", muscle: "Chest", equipment: "Bodyweight" },
  { id: "21", name: "Chest Dip", category: "Chest", muscle: "Lower Chest", equipment: "Bodyweight" },

  // Back - Barbell
  { id: "22", name: "Deadlift (Barbell)", category: "Back", muscle: "Lower Back", equipment: "Barbell" },
  { id: "23", name: "Bent Over Row (Barbell)", category: "Back", muscle: "Back", equipment: "Barbell" },
  { id: "24", name: "Pendlay Row", category: "Back", muscle: "Back", equipment: "Barbell" },
  { id: "25", name: "Rack Pull", category: "Back", muscle: "Upper Back", equipment: "Barbell" },
  { id: "26", name: "Good Morning", category: "Back", muscle: "Lower Back", equipment: "Barbell" },
  // Back - Dumbbell
  { id: "27", name: "Dumbbell Row (Single Arm)", category: "Back", muscle: "Lats", equipment: "Dumbbell" },
  { id: "28", name: "Dumbbell Row (Both Arms)", category: "Back", muscle: "Back", equipment: "Dumbbell" },
  { id: "29", name: "Dumbbell Pullover", category: "Back", muscle: "Lats", equipment: "Dumbbell" },
  { id: "30", name: "Renegade Row", category: "Back", muscle: "Back", equipment: "Dumbbell" },
  { id: "31", name: "Dumbbell Shrug", category: "Back", muscle: "Traps", equipment: "Dumbbell" },
  // Back - Cable/Machine
  { id: "32", name: "Lat Pulldown", category: "Back", muscle: "Lats", equipment: "Cable" },
  { id: "33", name: "Close Grip Lat Pulldown", category: "Back", muscle: "Lats", equipment: "Cable" },
  { id: "34", name: "Wide Grip Lat Pulldown", category: "Back", muscle: "Lats", equipment: "Cable" },
  { id: "35", name: "Behind Neck Lat Pulldown", category: "Back", muscle: "Lats", equipment: "Cable" },
  { id: "36", name: "Seated Cable Row", category: "Back", muscle: "Back", equipment: "Cable" },
  { id: "37", name: "Face Pull", category: "Back", muscle: "Rear Delts", equipment: "Cable" },
  { id: "38", name: "Straight Arm Pulldown", category: "Back", muscle: "Lats", equipment: "Cable" },
  { id: "39", name: "T-Bar Row", category: "Back", muscle: "Back", equipment: "Machine" },
  { id: "40", name: "Chest Supported Row Machine", category: "Back", muscle: "Back", equipment: "Machine" },
  { id: "41", name: "Hyperextension", category: "Back", muscle: "Lower Back", equipment: "Machine" },
  // Back - Bodyweight
  { id: "42", name: "Pull Up", category: "Back", muscle: "Lats", equipment: "Bodyweight" },
  { id: "43", name: "Chin Up", category: "Back", muscle: "Lats", equipment: "Bodyweight" },
  { id: "44", name: "Wide Grip Pull Up", category: "Back", muscle: "Lats", equipment: "Bodyweight" },
  { id: "45", name: "Inverted Row", category: "Back", muscle: "Back", equipment: "Bodyweight" },
  { id: "46", name: "Superman Hold", category: "Back", muscle: "Lower Back", equipment: "Bodyweight" },

  // Shoulders - Barbell
  { id: "47", name: "Overhead Press (Barbell)", category: "Shoulders", muscle: "Shoulders", equipment: "Barbell" },
  { id: "48", name: "Push Press", category: "Shoulders", muscle: "Shoulders", equipment: "Barbell" },
  { id: "49", name: "Behind Neck Press", category: "Shoulders", muscle: "Shoulders", equipment: "Barbell" },
  { id: "50", name: "Barbell Upright Row", category: "Shoulders", muscle: "Shoulders", equipment: "Barbell" },
  { id: "51", name: "Barbell Shrug", category: "Shoulders", muscle: "Traps", equipment: "Barbell" },
  // Shoulders - Dumbbell
  { id: "52", name: "Dumbbell Shoulder Press", category: "Shoulders", muscle: "Shoulders", equipment: "Dumbbell" },
  { id: "53", name: "Arnold Press", category: "Shoulders", muscle: "Shoulders", equipment: "Dumbbell" },
  { id: "54", name: "Lateral Raise (Dumbbell)", category: "Shoulders", muscle: "Side Delts", equipment: "Dumbbell" },
  { id: "55", name: "Front Raise", category: "Shoulders", muscle: "Front Delts", equipment: "Dumbbell" },
  { id: "56", name: "Reverse Fly", category: "Shoulders", muscle: "Rear Delts", equipment: "Dumbbell" },
  { id: "57", name: "Dumbbell Upright Row", category: "Shoulders", muscle: "Shoulders", equipment: "Dumbbell" },
  { id: "58", name: "Seated Dumbbell Press", category: "Shoulders", muscle: "Shoulders", equipment: "Dumbbell" },
  { id: "59", name: "Lu Raise", category: "Shoulders", muscle: "Front Delts", equipment: "Dumbbell" },
  // Shoulders - Cable/Machine
  { id: "60", name: "Cable Lateral Raise", category: "Shoulders", muscle: "Side Delts", equipment: "Cable" },
  { id: "61", name: "Cable Front Raise", category: "Shoulders", muscle: "Front Delts", equipment: "Cable" },
  { id: "62", name: "Cable Reverse Fly", category: "Shoulders", muscle: "Rear Delts", equipment: "Cable" },
  { id: "63", name: "Shoulder Press Machine", category: "Shoulders", muscle: "Shoulders", equipment: "Machine" },
  { id: "64", name: "Reverse Pec Deck", category: "Shoulders", muscle: "Rear Delts", equipment: "Machine" },
  // Shoulders - Bodyweight
  { id: "65", name: "Pike Push Up", category: "Shoulders", muscle: "Shoulders", equipment: "Bodyweight" },
  { id: "66", name: "Handstand Push Up", category: "Shoulders", muscle: "Shoulders", equipment: "Bodyweight" },

  // Arms - Biceps - Barbell
  { id: "67", name: "Bicep Curl (Barbell)", category: "Arms", muscle: "Biceps", equipment: "Barbell" },
  { id: "68", name: "EZ Bar Curl", category: "Arms", muscle: "Biceps", equipment: "Barbell" },
  { id: "69", name: "Preacher Curl (Barbell)", category: "Arms", muscle: "Biceps", equipment: "Barbell" },
  { id: "70", name: "Drag Curl", category: "Arms", muscle: "Biceps", equipment: "Barbell" },
  { id: "71", name: "Reverse Curl (Barbell)", category: "Arms", muscle: "Forearms", equipment: "Barbell" },
  // Arms - Biceps - Dumbbell
  { id: "72", name: "Dumbbell Curl", category: "Arms", muscle: "Biceps", equipment: "Dumbbell" },
  { id: "73", name: "Hammer Curl", category: "Arms", muscle: "Biceps", equipment: "Dumbbell" },
  { id: "74", name: "Incline Dumbbell Curl", category: "Arms", muscle: "Biceps", equipment: "Dumbbell" },
  { id: "75", name: "Concentration Curl", category: "Arms", muscle: "Biceps", equipment: "Dumbbell" },
  { id: "76", name: "Spider Curl", category: "Arms", muscle: "Biceps", equipment: "Dumbbell" },
  { id: "77", name: "Zottman Curl", category: "Arms", muscle: "Biceps", equipment: "Dumbbell" },
  { id: "78", name: "Cross Body Hammer Curl", category: "Arms", muscle: "Biceps", equipment: "Dumbbell" },
  // Arms - Biceps - Cable
  { id: "79", name: "Cable Curl", category: "Arms", muscle: "Biceps", equipment: "Cable" },
  { id: "80", name: "Cable Hammer Curl", category: "Arms", muscle: "Biceps", equipment: "Cable" },
  { id: "81", name: "High Cable Curl", category: "Arms", muscle: "Biceps", equipment: "Cable" },
  // Arms - Triceps - Barbell
  { id: "82", name: "Skull Crusher", category: "Arms", muscle: "Triceps", equipment: "Barbell" },
  { id: "83", name: "Close Grip Bench Press", category: "Arms", muscle: "Triceps", equipment: "Barbell" },
  { id: "84", name: "JM Press", category: "Arms", muscle: "Triceps", equipment: "Barbell" },
  // Arms - Triceps - Dumbbell
  { id: "85", name: "Overhead Tricep Extension", category: "Arms", muscle: "Triceps", equipment: "Dumbbell" },
  { id: "86", name: "Tricep Kickback", category: "Arms", muscle: "Triceps", equipment: "Dumbbell" },
  { id: "87", name: "Dumbbell Skull Crusher", category: "Arms", muscle: "Triceps", equipment: "Dumbbell" },
  { id: "88", name: "Tate Press", category: "Arms", muscle: "Triceps", equipment: "Dumbbell" },
  // Arms - Triceps - Cable
  { id: "89", name: "Tricep Pushdown", category: "Arms", muscle: "Triceps", equipment: "Cable" },
  { id: "90", name: "Rope Tricep Pushdown", category: "Arms", muscle: "Triceps", equipment: "Cable" },
  { id: "91", name: "Overhead Cable Extension", category: "Arms", muscle: "Triceps", equipment: "Cable" },
  { id: "92", name: "Single Arm Tricep Pushdown", category: "Arms", muscle: "Triceps", equipment: "Cable" },
  // Arms - Triceps - Bodyweight
  { id: "93", name: "Tricep Dip", category: "Arms", muscle: "Triceps", equipment: "Bodyweight" },
  { id: "94", name: "Bench Dip", category: "Arms", muscle: "Triceps", equipment: "Bodyweight" },
  // Arms - Forearms
  { id: "95", name: "Wrist Curl", category: "Arms", muscle: "Forearms", equipment: "Dumbbell" },
  { id: "96", name: "Reverse Wrist Curl", category: "Arms", muscle: "Forearms", equipment: "Dumbbell" },
  { id: "97", name: "Farmer's Walk", category: "Arms", muscle: "Forearms", equipment: "Dumbbell" },

  // Legs - Quads - Barbell
  { id: "98", name: "Squat (Barbell)", category: "Legs", muscle: "Quads", equipment: "Barbell" },
  { id: "99", name: "Front Squat", category: "Legs", muscle: "Quads", equipment: "Barbell" },
  { id: "100", name: "Pause Squat", category: "Legs", muscle: "Quads", equipment: "Barbell" },
  { id: "101", name: "Box Squat", category: "Legs", muscle: "Quads", equipment: "Barbell" },
  { id: "102", name: "Zercher Squat", category: "Legs", muscle: "Quads", equipment: "Barbell" },
  // Legs - Quads - Dumbbell
  { id: "103", name: "Goblet Squat", category: "Legs", muscle: "Quads", equipment: "Dumbbell" },
  { id: "104", name: "Lunges", category: "Legs", muscle: "Quads", equipment: "Dumbbell" },
  { id: "105", name: "Walking Lunges", category: "Legs", muscle: "Quads", equipment: "Dumbbell" },
  { id: "106", name: "Reverse Lunges", category: "Legs", muscle: "Quads", equipment: "Dumbbell" },
  { id: "107", name: "Bulgarian Split Squat", category: "Legs", muscle: "Quads", equipment: "Dumbbell" },
  { id: "108", name: "Step Up", category: "Legs", muscle: "Quads", equipment: "Dumbbell" },
  // Legs - Quads - Machine
  { id: "109", name: "Leg Press", category: "Legs", muscle: "Quads", equipment: "Machine" },
  { id: "110", name: "Leg Extension", category: "Legs", muscle: "Quads", equipment: "Machine" },
  { id: "111", name: "Hack Squat", category: "Legs", muscle: "Quads", equipment: "Machine" },
  { id: "112", name: "Pendulum Squat", category: "Legs", muscle: "Quads", equipment: "Machine" },
  { id: "113", name: "Belt Squat", category: "Legs", muscle: "Quads", equipment: "Machine" },
  { id: "114", name: "Sissy Squat Machine", category: "Legs", muscle: "Quads", equipment: "Machine" },
  // Legs - Hamstrings
  { id: "115", name: "Romanian Deadlift", category: "Legs", muscle: "Hamstrings", equipment: "Barbell" },
  { id: "116", name: "Stiff Leg Deadlift", category: "Legs", muscle: "Hamstrings", equipment: "Barbell" },
  { id: "117", name: "Single Leg Romanian Deadlift", category: "Legs", muscle: "Hamstrings", equipment: "Dumbbell" },
  { id: "118", name: "Leg Curl (Lying)", category: "Legs", muscle: "Hamstrings", equipment: "Machine" },
  { id: "119", name: "Leg Curl (Seated)", category: "Legs", muscle: "Hamstrings", equipment: "Machine" },
  { id: "120", name: "Nordic Hamstring Curl", category: "Legs", muscle: "Hamstrings", equipment: "Bodyweight" },
  { id: "121", name: "Glute Ham Raise", category: "Legs", muscle: "Hamstrings", equipment: "Machine" },
  // Legs - Glutes
  { id: "122", name: "Hip Thrust (Barbell)", category: "Legs", muscle: "Glutes", equipment: "Barbell" },
  { id: "123", name: "Hip Thrust (Dumbbell)", category: "Legs", muscle: "Glutes", equipment: "Dumbbell" },
  { id: "124", name: "Glute Bridge", category: "Legs", muscle: "Glutes", equipment: "Bodyweight" },
  { id: "125", name: "Cable Pull Through", category: "Legs", muscle: "Glutes", equipment: "Cable" },
  { id: "126", name: "Cable Kickback", category: "Legs", muscle: "Glutes", equipment: "Cable" },
  { id: "127", name: "Hip Abduction Machine", category: "Legs", muscle: "Glutes", equipment: "Machine" },
  // Legs - Calves
  { id: "128", name: "Standing Calf Raise", category: "Legs", muscle: "Calves", equipment: "Machine" },
  { id: "129", name: "Seated Calf Raise", category: "Legs", muscle: "Calves", equipment: "Machine" },
  { id: "130", name: "Donkey Calf Raise", category: "Legs", muscle: "Calves", equipment: "Machine" },
  { id: "131", name: "Single Leg Calf Raise", category: "Legs", muscle: "Calves", equipment: "Bodyweight" },
  // Legs - Bodyweight
  { id: "132", name: "Bodyweight Squat", category: "Legs", muscle: "Quads", equipment: "Bodyweight" },
  { id: "133", name: "Pistol Squat", category: "Legs", muscle: "Quads", equipment: "Bodyweight" },
  { id: "134", name: "Jump Squat", category: "Legs", muscle: "Quads", equipment: "Bodyweight" },
  { id: "135", name: "Wall Sit", category: "Legs", muscle: "Quads", equipment: "Bodyweight" },

  // Core - Abs
  { id: "136", name: "Crunch", category: "Core", muscle: "Abs", equipment: "Bodyweight" },
  { id: "137", name: "Sit Up", category: "Core", muscle: "Abs", equipment: "Bodyweight" },
  { id: "138", name: "Reverse Crunch", category: "Core", muscle: "Lower Abs", equipment: "Bodyweight" },
  { id: "139", name: "Hanging Leg Raise", category: "Core", muscle: "Abs", equipment: "Bodyweight" },
  { id: "140", name: "Hanging Knee Raise", category: "Core", muscle: "Abs", equipment: "Bodyweight" },
  { id: "141", name: "Lying Leg Raise", category: "Core", muscle: "Lower Abs", equipment: "Bodyweight" },
  { id: "142", name: "V-Up", category: "Core", muscle: "Abs", equipment: "Bodyweight" },
  { id: "143", name: "Toe Touch", category: "Core", muscle: "Abs", equipment: "Bodyweight" },
  { id: "144", name: "Dead Bug", category: "Core", muscle: "Abs", equipment: "Bodyweight" },
  { id: "145", name: "Cable Crunch", category: "Core", muscle: "Abs", equipment: "Cable" },
  { id: "146", name: "Ab Wheel Rollout", category: "Core", muscle: "Abs", equipment: "Other" },
  // Core - Obliques
  { id: "147", name: "Russian Twist", category: "Core", muscle: "Obliques", equipment: "Bodyweight" },
  { id: "148", name: "Bicycle Crunch", category: "Core", muscle: "Obliques", equipment: "Bodyweight" },
  { id: "149", name: "Side Plank", category: "Core", muscle: "Obliques", equipment: "Bodyweight" },
  { id: "150", name: "Wood Chop", category: "Core", muscle: "Obliques", equipment: "Cable" },
  { id: "151", name: "Pallof Press", category: "Core", muscle: "Obliques", equipment: "Cable" },
  { id: "152", name: "Oblique Crunch", category: "Core", muscle: "Obliques", equipment: "Bodyweight" },
  // Core - Stability
  { id: "153", name: "Plank", category: "Core", muscle: "Core", equipment: "Bodyweight" },
  { id: "154", name: "Mountain Climber", category: "Core", muscle: "Core", equipment: "Bodyweight" },
  { id: "155", name: "Hollow Body Hold", category: "Core", muscle: "Core", equipment: "Bodyweight" },
  { id: "156", name: "Bird Dog", category: "Core", muscle: "Core", equipment: "Bodyweight" },

  // Olympic Lifts
  { id: "157", name: "Clean", category: "Olympic", muscle: "Full Body", equipment: "Barbell" },
  { id: "158", name: "Clean and Jerk", category: "Olympic", muscle: "Full Body", equipment: "Barbell" },
  { id: "159", name: "Snatch", category: "Olympic", muscle: "Full Body", equipment: "Barbell" },
  { id: "160", name: "Power Clean", category: "Olympic", muscle: "Full Body", equipment: "Barbell" },
  { id: "161", name: "Power Snatch", category: "Olympic", muscle: "Full Body", equipment: "Barbell" },
  { id: "162", name: "Hang Clean", category: "Olympic", muscle: "Full Body", equipment: "Barbell" },
  { id: "163", name: "Hang Snatch", category: "Olympic", muscle: "Full Body", equipment: "Barbell" },
  { id: "164", name: "Push Jerk", category: "Olympic", muscle: "Full Body", equipment: "Barbell" },
  { id: "165", name: "Split Jerk", category: "Olympic", muscle: "Full Body", equipment: "Barbell" },
  { id: "166", name: "Clean Pull", category: "Olympic", muscle: "Full Body", equipment: "Barbell" },
  { id: "167", name: "Snatch Pull", category: "Olympic", muscle: "Full Body", equipment: "Barbell" },
  { id: "168", name: "Overhead Squat", category: "Olympic", muscle: "Full Body", equipment: "Barbell" },

  // Cardio
  { id: "169", name: "Running (Treadmill)", category: "Cardio", muscle: "Cardio", equipment: "Machine" },
  { id: "170", name: "Cycling (Stationary)", category: "Cardio", muscle: "Cardio", equipment: "Machine" },
  { id: "171", name: "Rowing Machine", category: "Cardio", muscle: "Cardio", equipment: "Machine" },
  { id: "172", name: "Elliptical", category: "Cardio", muscle: "Cardio", equipment: "Machine" },
  { id: "173", name: "Stair Climber", category: "Cardio", muscle: "Cardio", equipment: "Machine" },
  { id: "174", name: "Jump Rope", category: "Cardio", muscle: "Cardio", equipment: "Other" },
  { id: "175", name: "Battle Ropes", category: "Cardio", muscle: "Cardio", equipment: "Other" },
  { id: "176", name: "Burpees", category: "Cardio", muscle: "Full Body", equipment: "Bodyweight" },
  { id: "177", name: "Box Jump", category: "Cardio", muscle: "Legs", equipment: "Other" },
  { id: "178", name: "Kettlebell Swing", category: "Cardio", muscle: "Full Body", equipment: "Kettlebell" },
  { id: "179", name: "Sled Push", category: "Cardio", muscle: "Full Body", equipment: "Other" },
  { id: "180", name: "Assault Bike", category: "Cardio", muscle: "Cardio", equipment: "Machine" },

  // Stretching / Mobility
  { id: "181", name: "Foam Rolling (Quads)", category: "Stretching", muscle: "Quads", equipment: "Other" },
  { id: "182", name: "Foam Rolling (Back)", category: "Stretching", muscle: "Back", equipment: "Other" },
  { id: "183", name: "Hip Flexor Stretch", category: "Stretching", muscle: "Hip Flexors", equipment: "Bodyweight" },
  { id: "184", name: "Pigeon Pose", category: "Stretching", muscle: "Glutes", equipment: "Bodyweight" },
  { id: "185", name: "Cat Cow Stretch", category: "Stretching", muscle: "Back", equipment: "Bodyweight" },
  { id: "186", name: "Downward Dog", category: "Stretching", muscle: "Full Body", equipment: "Bodyweight" },
  { id: "187", name: "Chest Doorway Stretch", category: "Stretching", muscle: "Chest", equipment: "Bodyweight" },
  { id: "188", name: "Shoulder Dislocates", category: "Stretching", muscle: "Shoulders", equipment: "Other" },
  { id: "189", name: "World's Greatest Stretch", category: "Stretching", muscle: "Full Body", equipment: "Bodyweight" },
  { id: "190", name: "90/90 Hip Stretch", category: "Stretching", muscle: "Hip Flexors", equipment: "Bodyweight" },
]

export const categories = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Olympic",
  "Cardio",
  "Stretching",
]

export const equipmentTypes = ["All", "Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight", "Kettlebell", "Other"]

export const muscleGroups = [
  "All",
  "Chest",
  "Upper Chest",
  "Lower Chest",
  "Inner Chest",
  "Back",
  "Lats",
  "Lower Back",
  "Upper Back",
  "Traps",
  "Shoulders",
  "Front Delts",
  "Side Delts",
  "Rear Delts",
  "Biceps",
  "Triceps",
  "Forearms",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Hip Flexors",
  "Abs",
  "Lower Abs",
  "Obliques",
  "Core",
  "Full Body",
  "Cardio",
]
