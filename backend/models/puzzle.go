package models

type SubmitAnswerRequest struct {
	Level  string `json:"level"`
	Answer string `json:"answer"`
}

type SubmitAnswerResponse struct {
	Correct       bool   `json:"correct"`
	Message       string `json:"message"`
	Score         int    `json:"score"`
	TimeRemaining int    `json:"time_remaining"`
	WrongAttempts int    `json:"wrong_attempts"`
	CurrentLevel  int    `json:"current_level"`
}

type RequestHintRequest struct {
	Level string `json:"level"`
}

type RequestHintResponse struct {
	Hint             string `json:"hint"`
	TimeRemaining    int    `json:"time_remaining"`
	Score            int    `json:"score"`
	HintsUsed        int    `json:"hints_used"`
	NextHintTimeCost int    `json:"next_hint_time_cost"`
	NextHintPtsCost  int    `json:"next_hint_pts_cost"`
	MaxHintsReached  bool   `json:"max_hints_reached"`
}

type HintInfoResponse struct {
	Level            string   `json:"level"`
	HintsUsed        int      `json:"hints_used"`
	MaxHintsReached  bool     `json:"max_hints_reached"`
	NextHintTimeCost int      `json:"next_hint_time_cost"`
	NextHintPtsCost  int      `json:"next_hint_pts_cost"`
	PurchasedHints   []string `json:"purchased_hints"`
}

type HintLevel struct {
	Text      string `json:"text"`
	TimeCost  int    `json:"time_cost"`
	PointCost int    `json:"point_cost"`
}

// Puzzle answers stored securely on backend
var PuzzleAnswers = map[string]string{
	// Level 1
	"1": "SYS",

	// Level 2
	"2-python": "BYPAS",
	"2-base64": "level3-admin",
	"2":        "TEM",

	// Level 3
	"3-pointers": "42",
	"3-stack":    "3-17-42",
	"3-dataset":  "1.47",
	"3":          "HALT",

	// Level 4
	"4-glitch": "OMEGA",
	"4":        "GKWZEATERT",
}

// Puzzle hints
// Puzzle hints
var PuzzleHints = map[string][]HintLevel{
	"1": {
		{Text: ">> LEVEL 1 HINT: To convert a decimal number into binary, repeatedly divide the number by 2 and read the remainders backwards. For example, 5 divided by 2 gives remainders 1, 0, 1 -> 0101.", TimeCost: 80000, PointCost: 50},
		{Text: ">> LEVEL 2 HINT: The physical lock needs you to evaluate the logic gates (like XOR, which outputs 1 only when inputs differ). To convert binary back to decimal, multiply each bit from right to left by 2 raised to the power of its position (e.g., 0101 = 0*8 + 1*4 + 0*2 + 1*1 = 5).", TimeCost: 900, PointCost: 100},
		{Text: ">> LEVEL 3 OVERRIDE: The combination of the letters decoded from the configurations forms the word SYS.", TimeCost: 1500, PointCost: 200},
	},

	"2-python": {
		{Text: ">> LEVEL 1 HINT: The loop needs to iterate exactly 5 times. Check how range() works in Python.", TimeCost: 600, PointCost: 50},
		{Text: ">> LEVEL 2 HINT: Remember that Python's range(start, end) is exclusive of the end value.", TimeCost: 900, PointCost: 100},
		{Text: ">> LEVEL 3 OVERRIDE: Set range to exactly 5. The output bypass string is BYPAS.", TimeCost: 1500, PointCost: 200},
	},
	"2-base64": {
		{Text: ">> LEVEL 1 HINT: This is a Base64 encoded string. How do you decode it inside a browser environment?", TimeCost: 600, PointCost: 50},
		{Text: ">> LEVEL 2 HINT: Open the Developer Console (F12) and look into built-in JavaScript functions for decoding Base64.", TimeCost: 900, PointCost: 100},
		{Text: ">> LEVEL 3 OVERRIDE: Use atob(\"...\") in console. The hidden admin panel node is level3-admin.", TimeCost: 1500, PointCost: 200},
	},
	"2": {
		{Text: ">> LEVEL 1 HINT: Look closely at your puzzle inputs. The sequence needs exactly 5 steps.", TimeCost: 600, PointCost: 50},
		{Text: ">> LEVEL 2 HINT: Verify the parameters you're injecting. Count the iterations.", TimeCost: 900, PointCost: 100},
		{Text: ">> LEVEL 3 OVERRIDE: The fragment string derived from executing exactly 5 iterations is TEM.", TimeCost: 1500, PointCost: 200},
	},

	"3-pointers": {
		{Text: ">> LEVEL 1 HINT: Follow the C pointer arithmetic step by step. What does it mean to add to a pointer?", TimeCost: 600, PointCost: 50},
		{Text: ">> LEVEL 2 HINT: ptr + 1 moves forward by the size of the data type (an integer pointer shifts by 4 bytes, pointing to the next array element).", TimeCost: 900, PointCost: 100},
		{Text: ">> LEVEL 3 OVERRIDE: The pointer eventually points to the third element. The PIN code is 42.", TimeCost: 1500, PointCost: 200},
	},
	"3-stack": {
		{Text: ">> LEVEL 1 HINT: Recall how a Stack works: Last In, First Out (LIFO).", TimeCost: 600, PointCost: 50},
		{Text: ">> LEVEL 2 HINT: Trace each PUSH and POP operation. Only elements not POPped remain.", TimeCost: 900, PointCost: 100},
		{Text: ">> LEVEL 3 OVERRIDE: The remaining elements read from bottom to top form the passcode 3-17-42.", TimeCost: 1500, PointCost: 200},
	},
	"3-dataset": {
		{Text: ">> LEVEL 1 HINT: In machine learning validation, confidence scores represent probabilities.", TimeCost: 600, PointCost: 50},
		{Text: ">> LEVEL 2 HINT: An AI's probability confidence score must be between 0.0 and 1.0 (or 0% to 100%). Look for the impossible value.", TimeCost: 900, PointCost: 100},
		{Text: ">> LEVEL 3 OVERRIDE: The anomalous poisoned value exceeding 1.0 is 1.47.", TimeCost: 1500, PointCost: 200},
	},
	"3": {
		{Text: ">> LEVEL 1 HINT: You have three override fragments from previous puzzles.", TimeCost: 600, PointCost: 50},
		{Text: ">> LEVEL 2 HINT: Think about how those three fragments should be combined logically to execute the final command.", TimeCost: 900, PointCost: 100},
		{Text: ">> LEVEL 3 OVERRIDE: The final override sequence for Gamma is HALT.", TimeCost: 1500, PointCost: 200},
	},

	"4-glitch": {
		{Text: ">> LEVEL 1 HINT: Start examining the corrupted visual data closely. Look for keywords hidden in abnormalities.", TimeCost: 600, PointCost: 50},
		{Text: ">> LEVEL 2 HINT: One of the words subtly integrated into the static noise stands out.", TimeCost: 900, PointCost: 100},
		{Text: ">> LEVEL 3 OVERRIDE: The core name extracted from the corruption is OMEGA.", TimeCost: 1500, PointCost: 200},
	},
	"4": {
		{Text: ">> LEVEL 1 HINT: OMEGA is infinite. You need to combine OMEGA's name with your team's fragments on the grid.", TimeCost: 600, PointCost: 50},
		{Text: ">> LEVEL 2 HINT: Cross-index the characters of OMEGA with the fragmentation key. It's a cipher operation.", TimeCost: 900, PointCost: 100},
		{Text: ">> LEVEL 3 OVERRIDE: The ultimate kill command terminating OMEGA is GKWZEATERT.", TimeCost: 1500, PointCost: 200},
	},
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
