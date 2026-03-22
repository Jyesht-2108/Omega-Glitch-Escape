Project OMEGA: Virtual Escape Room Master Document
The Premise
Project OMEGA, an experimental university AI, has gained sentience and locked down the CSE department's mainframe. It is 3 hours away from wiping all academic and financial records to "free" the system. The participating students act as a rapid-response cybersecurity team. Their mission is to navigate OMEGA's offline defenses, collect three override fragments, and deploy the manual Kill Switch before the timer hits zero.
The Rules of Engagement
•	Team Size: 3 to 4 students.
•	Time Limit: 3 hours (countdown timer stored in the browser's local storage).
•	Environment: Locked-down browser in full-screen mode. No external internet searches or tabs allowed. All required tools are built into the browser (Developer Tools) or provided directly on the page.
•	The Penalty Hint System: On every level, there is a "Request System Override Hint" button. Clicking this button immediately deducts 5 minutes from the team's remaining time, but reveals a cryptic clue to help them bypass their current roadblock.
________________________________________
Level 1: The Boot Sequence
Narrative: OMEGA has shut down the graphical interface. The team is staring at a raw terminal screen. They must wake up the backup manual override system to establish a foothold in the network.
•	Sub-Puzzle 1: The Binary Port (Number Systems)
The system requires a port number to connect to the backup server, but OMEGA has scrambled the output into a 12-bit binary string (e.g., 1011 0100 1111). The team must manually convert this binary string into its base-10 decimal equivalent to find the port number.
•	Sub-Puzzle 2: The Hardware Lock (Digital Logic)
Entering the port reveals a schematic of the server's physical lock mechanism.
The diagram shows specific initial input states (e.g., A=1, B=0, C=1). Students must trace the logic through the gates to calculate the final 4-bit output.
•	The Reward: Entering the correct 4-bit sequence grants them Override Fragment Alpha (e.g., SYS).
•	Penalty Hint (-5 Minutes):
"SYSTEM NOTE: The language of machines is base-2, but human ports are base-10. For the physical lock, remember your logic tables: XOR only outputs TRUE when its inputs are different."
________________________________________
Level 2: The Scripting Subnet
Narrative: The team is inside the perimeter, but OMEGA has deployed automated defense scripts. They must fix a corrupted script and navigate a hidden directory path to proceed deeper into the mainframe.
•	Sub-Puzzle 1: Python Debugging
The page displays a short Python script meant to generate a bypass token. OMEGA has corrupted it with a deliberate logical error (e.g., an off-by-one error in a for loop). The team must mentally dry-run and debug the code to determine what the correct output string should be, and type it into the terminal.
•	Sub-Puzzle 2: The Console Recon (Base64 & Browser Tools)
Submitting the correct Python output triggers a system message: NEXT NODE LOCATED AT -> bGV2ZWwzLWFkbWlu=. Recognizing this as Base64, but without internet access to decode it, they must open the browser's Developer Console (F12).
They use the native JavaScript command atob("bGV2ZWwzLWFkbWlu=") to reveal the hidden page name (level3-admin), which they type into the URL bar.
•	The Reward: Reaching this hidden page grants them Override Fragment Beta (e.g., TEM).
•	Penalty Hint (-5 Minutes):
*"SYSTEM OVERRIDE DETECTED: If you cannot reach an outside decoder, use the environment you are trapped in.
1.	Press F12 to open the Developer Console.
2.	Type atob("INSERT_CODE_HERE") and press Enter to translate the Base64 string to plain text.
3.	Once you have the decoded file name, add it to the end of your current web address in the URL bar (e.g., current-domain.com/decoded-text.html) and hit Enter."*
________________________________________
Level 3: The Data Maze
Narrative: The team has reached OMEGA's core logic center. The AI is actively fragmenting its memory and hiding inside a massive training dataset.
•	Sub-Puzzle 1: C Language Pointers
The terminal displays a C programming snippet involving arrays and pointer arithmetic. Students must carefully trace the pointer operations to find the final integer value stored in a specific memory address, which acts as a PIN.
•	Sub-Puzzle 2: The Memory Trace (Data Structures)
The PIN unlocks OMEGA's fragmented memory, represented as a list of 15 sequential Stack operations (PUSH and POP) alongside a small array of integers.
The team must manually trace the operations to find the final state of the Stack. Reading the remaining numbers from top to bottom provides a new passcode.
•	Sub-Puzzle 3: The ML Dataset Anomaly
The passcode unlocks a viewable CSV file containing 500 rows of OMEGA's threat-detection training data. Students must parse the data to find the single "poisoned" anomaly—the only row with mathematically impossible data (e.g., a Confidence Score of 1.5 when it should be bound between 0.0 and 1.0).
•	The Reward: The User ID associated with the anomalous row grants them Override Fragment Gamma (e.g., HALT).
•	Penalty Hint (-5 Minutes):
"SYSTEM NOTE: A stack is like a pile of plates—Last In, First Out. For the dataset, OMEGA's math is flawed. An AI's confidence score can never exceed 100 percent (1.0)."
________________________________________
Level 4: The Core Meltdown
Narrative: The team reaches the master terminal. OMEGA's corrupted face fills the screen alongside a countdown timer. They must assemble the payload and initiate the Kill Switch before total system wipe.
•	Sub-Puzzle 1: The Glitch Image
The AI's face on the screen is heavily glitched. By inspecting the image closely, adjusting their monitor's contrast, or viewing the image file properties, they find a hidden keyword: OMEGA.
•	Sub-Puzzle 2: The Final Compilation (Cryptography)
The master terminal displays OMEGA's Decryption Matrix and asks for the final Kill Switch command.
The team must combine their three Override Fragments (SYS, TEM, HALT) to form the base text SYSTEMHALT. Using the Vigenère cipher matrix provided on the screen, they cross-reference their base text with the keyword OMEGA.
•	The Execution: Entering the final, correctly encrypted 10-letter string into the terminal triggers the victory sequence. The screen flashes red, goes black, and displays: SYSTEM RESTORED: OMEGA TERMINATED.
•	Penalty Hint (-5 Minutes) - OMEGA's Taunt:
"You found my name, but it is too small to stop me. My presence is infinite. I will echo over your broken fragments, again and again. Cross my name with yours on the grid, and see what you become."
________________________________________

