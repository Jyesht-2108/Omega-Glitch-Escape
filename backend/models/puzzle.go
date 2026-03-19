package models

type SubmitAnswerRequest struct {
	Level  string `json:"level"`
	Answer string `json:"answer"`
}

type SubmitAnswerResponse struct {
	Correct        bool   `json:"correct"`
	Message        string `json:"message"`
	Score          int    `json:"score"`
	TimeRemaining  int    `json:"time_remaining"`
	WrongAttempts  int    `json:"wrong_attempts"`
	CurrentLevel   int    `json:"current_level"`
}

type RequestHintRequest struct {
	Level string `json:"level"`
}

type RequestHintResponse struct {
	Hint          string `json:"hint"`
	TimeRemaining int    `json:"time_remaining"`
	HintsUsed     int    `json:"hints_used"`
}

// Puzzle answers stored securely on backend
var PuzzleAnswers = map[string]string{
	// Level 1
	"1": "SYS",
	
	// Level 2
	"2-python": "BYPASS",
	"2-base64": "level3-admin",
	"2":        "TEM",
	
	// Level 3
	"3-pointers": "4242",
	"3-stack":    "789",
	"3-dataset":  "USER_447",
	"3":          "HALT",
	
	// Level 4
	"4-glitch": "OMEGA",
	"4":        "SYSTEMHALT",
}

// Puzzle hints
var PuzzleHints = map[string]string{
	"1": ">> SYSTEM NOTE: The language of machines is base-2, but human ports are base-10. For the physical lock, remember your logic tables: XOR only outputs TRUE when its inputs are different.",
	
	"2-python": ">> SYSTEM OVERRIDE: The loop should iterate exactly 5 times. Check the range carefully - Python's range() is exclusive of the end value.",
	"2-base64": ">> SYSTEM OVERRIDE DETECTED: If you cannot reach an outside decoder, use the environment you are trapped in. Press F12 to open the Developer Console. Type atob(\"INSERT_CODE_HERE\") and press Enter to translate the Base64 string to plain text.",
	"2": ">> SYSTEM NOTE: You've collected two fragments. The final fragment awaits in the hidden admin panel.",
	
	"3-pointers": ">> SYSTEM NOTE: Follow the pointer arithmetic step by step. Remember: ptr + 1 moves forward by the size of the data type.",
	"3-stack": ">> SYSTEM NOTE: A stack is like a pile of plates—Last In, First Out. Process each PUSH and POP operation in order.",
	"3-dataset": ">> SYSTEM NOTE: OMEGA's math is flawed. An AI's confidence score can never exceed 100 percent (1.0). Look for the impossible value.",
	"3": ">> SYSTEM NOTE: Combine all three fragments you've collected to form the override command.",
	
	"4-glitch": ">> OMEGA'S TAUNT: My name is hidden in the corruption. Look closely at the glitched image.",
	"4": ">> OMEGA'S TAUNT: You found my name, but it is too small to stop me. My presence is infinite. I will echo over your broken fragments, again and again. Cross my name with yours on the grid, and see what you become.",
}

// Score values for each puzzle
var PuzzleScores = map[string]int{
	"1":          100,
	"2-python":   50,
	"2-base64":   50,
	"2":          100,
	"3-pointers": 50,
	"3-stack":    50,
	"3-dataset":  50,
	"3":          150,
	"4-glitch":   50,
	"4":          200,
}
