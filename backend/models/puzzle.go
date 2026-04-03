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

// Puzzle hints - Rebalanced for fairness
var PuzzleHints = map[string][]HintLevel{
	"1": {
		{Text: ">> LEVEL 1 HINT: To convert a decimal number into binary, repeatedly divide the number by 2 and read the remainders backwards. For example, 5 divided by 2 gives remainders 1, 0, 1 -> 0101.", TimeCost: 150, PointCost: 25},
		{Text: ">> LEVEL 2 HINT: The physical lock needs you to evaluate the logic gates (like XOR, which outputs 1 only when inputs differ). To convert binary back to decimal, multiply each bit from right to left by 2 raised to the power of its position (e.g., 0101 = 0*8 + 1*4 + 0*2 + 1*1 = 5).", TimeCost: 300, PointCost: 40},
		{Text: ">> LEVEL 3 HINT: Look for patterns in the binary configurations. Each configuration represents a letter when converted to decimal, then to ASCII characters.", TimeCost: 550, PointCost: 75},
	},

	"2-python": {
		{Text: ">> LEVEL 1 HINT: The loop needs to iterate exactly 5 times. Check how range() works in Python.", TimeCost: 180, PointCost: 25},
		{Text: ">> LEVEL 2 HINT: Remember that Python's range(start, end) is exclusive of the end value.", TimeCost: 300, PointCost: 40},
		{Text: ">> LEVEL 3 HINT: The correct range should start at 0 and end at 5. The output will be a 5-letter bypass code.", TimeCost: 600, PointCost: 75},
	},
	"2-base64": {
		{Text: ">> LEVEL 1 HINT: This is a Base64 encoded string. How do you decode it inside a browser environment?", TimeCost: 180, PointCost: 25},
		{Text: ">> LEVEL 2 HINT: Open the Developer Console (F12) and look into built-in JavaScript functions for decoding Base64.", TimeCost: 300, PointCost: 40},
		{Text: ">> LEVEL 3 HINT: Use atob() function in the console. The decoded string will reveal a hidden admin panel location.", TimeCost: 600, PointCost: 75},
	},
	"2": {
		{Text: ">> LEVEL 1 HINT: The loop needs to iterate exactly 5 times. Check how range() works in Python.", TimeCost: 180, PointCost: 25},
		{Text: ">> LEVEL 2 HINT: Remember that Python's range(start, end) is exclusive of the end value.", TimeCost: 300, PointCost: 40},
		{Text: ">> LEVEL 3 HINT: The correct range should start at 0 and end at 5. The output will be a 5-letter bypass code.", TimeCost: 600, PointCost: 75},
	},

	"3-pointers": {
		{Text: ">> LEVEL 1 HINT: Follow the C pointer arithmetic step by step. What does it mean to add to a pointer?", TimeCost: 180, PointCost: 25},
		{Text: ">> LEVEL 2 HINT: ptr + 1 moves forward by the size of the data type (an integer pointer shifts by 4 bytes, pointing to the next array element).", TimeCost: 300, PointCost: 40},
		{Text: ">> LEVEL 3 HINT: The pointer arithmetic will lead you to a specific array element. The value at that position is a 2-digit number.", TimeCost: 600, PointCost: 75},
	},
	"3-stack": {
		{Text: ">> LEVEL 1 HINT: Recall how a Stack works: Last In, First Out (LIFO).", TimeCost: 180, PointCost: 25},
		{Text: ">> LEVEL 2 HINT: Trace each PUSH and POP operation. Only elements not POPped remain.", TimeCost: 300, PointCost: 40},
		{Text: ">> LEVEL 3 HINT: After all operations, read the remaining stack elements from bottom to top. The format is number-number-number.", TimeCost: 600, PointCost: 75},
	},
	"3-dataset": {
		{Text: ">> LEVEL 1 HINT: In machine learning validation, confidence scores represent probabilities.", TimeCost: 180, PointCost: 25},
		{Text: ">> LEVEL 2 HINT: An AI's probability confidence score must be between 0.0 and 1.0 (or 0% to 100%). Look for the impossible value.", TimeCost: 300, PointCost: 40},
		{Text: ">> LEVEL 3 HINT: Find the confidence score that exceeds the valid range. It will be a decimal number greater than 1.0.", TimeCost: 600, PointCost: 75},
	},
	"3": {
		{Text: ">> LEVEL 1 HINT: You have three override fragments from previous puzzles.", TimeCost: 180, PointCost: 35},
		{Text: ">> LEVEL 2 HINT: Think about how those three fragments should be combined logically to execute the final command.", TimeCost: 300, PointCost: 50},
		{Text: ">> LEVEL 3 HINT: The final override sequence combines all fragments into a single 4-letter termination command.", TimeCost: 600, PointCost: 85},
	},

	"4-glitch": {
		{Text: ">> LEVEL 1 HINT: Start examining the corrupted visual data closely. Look for keywords hidden in abnormalities.", TimeCost: 180, PointCost: 25},
		{Text: ">> LEVEL 2 HINT: One of the words subtly integrated into the static noise stands out.", TimeCost: 300, PointCost: 40},
		{Text: ">> LEVEL 3 HINT: The hidden keyword is the name of the AI system. It's a 5-letter word embedded in the corruption.", TimeCost: 600, PointCost: 75},
	},
	"4": {
		{Text: ">> LEVEL 1 HINT: OMEGA is infinite. You need to combine OMEGA's name with your team's fragments on the grid.", TimeCost: 250, PointCost: 40},
		{Text: ">> LEVEL 2 HINT: Cross-index the characters of OMEGA with the fragmentation key. It's a cipher operation.", TimeCost: 500, PointCost: 60},
		{Text: ">> LEVEL 3 HINT: Use the Vigenère cipher with the keyword repeated to match the length of your plaintext. For example, if your plaintext is 10 characters, repeat the keyword like OMEGAOMEGA to create a 10-character cipher key.", TimeCost: 700, PointCost: 100},
	},
}

// Score values for each puzzle - Rebalanced for fairness
var PuzzleScores = map[string]int{
	"1":          150, // Increased - main level
	"2-python":   75,  // Increased - sub-puzzle
	"2-base64":   75,  // Increased - sub-puzzle
	"2":          150, // Same - main level
	"3-pointers": 75,  // Increased - sub-puzzle
	"3-stack":    75,  // Increased - sub-puzzle
	"3-dataset":  75,  // Increased - sub-puzzle
	"3":          200, // Increased - main level (hardest)
	"4-glitch":   100, // Increased - sub-puzzle (harder)
	"4":          300, // Increased - final level (hardest)
}
