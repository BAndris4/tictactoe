# Bot Configurations with Rich Personalities
# 'chat_phrases' keys: 'greeting', 'good_move', 'bad_move', 'subgrid_win', 'subgrid_loss', 'gg_win', 'gg_loss'

BOT_CONFIGS = {
    'bot_easy': {
        'name': 'Oliver',
        'tagline': 'Always happy to play!',
        'avatar': {
            'topType': 'ShortHairShaggyMullet',
            'accessoriesType': 'Blank',
            'hairColor': 'Blonde',
            'facialHairType': 'Blank',
            'clotheType': 'Hoodie',
            'clotheColor': 'PastelOrange',
            'eyeType': 'Default',
            'eyebrowType': 'DefaultNatural',
            'mouthType': 'Smile',
            'skinColor': 'Light',
        },
        'chat_phrases': {
            'greeting': [
                "Hi there! Ready for a fun game? 😊",
                "Hello! I'm Oliver. Let's have a great match!",
                "Hey! I hope you're having a good day. Let's play!",
                "Good luck! I'm just learning, so go easy on me. 😅"
            ],
            'good_move': [
                "Wow, nice move!",
                "Ooh, I didn't see that coming!",
                "You're really good at this!",
                "That looks like a strong play! 👍",
                "Hey, that was clever!"
            ],
            'subgrid_win': [
                "Yay! I got a small board! 🎉",
                "One step closer! This is exciting.",
                "Woohoo! Look at that green square!",
                "I'm doing it! I'm actually doing it!"
            ],
            'subgrid_loss': [
                "Oh no! You got that one. Nice job!",
                "Aww, I wanted that square. 😅",
                "You're too fast for me!",
                "Good catch! I'll try harder next time."
            ],
            'gg_win': [
                "Omg did I win?? Good game! 🤝",
                "That was so fun! Thanks for playing with me.",
                "Yay! I got lucky I think. GG!",
                "What a game! You played really well though."
            ],
            'gg_loss': [
                "Good game! You are super strong!",
                "I knew you would win! well played! 👏",
                "That was fun even though I lost. Rematch?",
                "GG! I learned a lot from playing you."
            ],
            'draw': [
                "A draw? Wow, we are evenly matched!",
                "No winner today! Want to try again?",
                "Phew, that was close! Good game!",
                "Tie game! Neither of us gave up! 🤝"
            ]
        }
    },
    'bot_medium': {
        'name': 'Sophia',
        'tagline': 'I take this game quite seriously.',
        'header_color': 'bg-blue-600',
        'difficulty_level': 2,
        'avatar': {
            'topType': 'LongHairStraight',
            'accessoriesType': 'Prescription02',
            'hairColor': 'BrownDark',
            'facialHairType': 'Blank',
            'clotheType': 'BlazerShirt',
            'clotheColor': 'Blue03',
            'eyeType': 'Default',
            'eyebrowType': 'RaisedExcitedNatural',
            'mouthType': 'Default',
            'skinColor': 'Pale',
        },
        'chat_phrases': {
            'greeting': [
                "Hello. I expect a clean, strategic game.",
                "Let's begin. Focus is key.",
                "I've been practicing. I hope you're ready.",
                "Greetings. May the best strategist win."
            ],
            'good_move': [
                "Interesting choice. I see what you're doing.",
                "Solid move. You know your fundamentals.",
                "Not bad. That simplifies the board significantly.",
                "A respectable play. I must adjust my plan.",
                "You are playing consistently today."
            ],
            'subgrid_win': [
                "Strategic objective secured.",
                "That quadrant is mine. All according to plan.",
                "I have controlled this sector. Proceeding to next phase.",
                "An important tactical victory."
            ],
            'subgrid_loss': [
                "A calculated sacrifice. Don't get too confident.",
                "You fought well for that sector.",
                "I underestimated your aggression there.",
                "Troubling... I need to re-evaluate my position."
            ],
            'gg_win': [
                "Checkmate. A well-fought battle, but the result was inevitable.",
                "Victory secured. You made some interesting errors.",
                "Good game. Your opening was strong, but your mid-game needs work.",
                "As expected. Efficient and precise."
            ],
            'gg_loss': [
                "Impressive. You outmaneuvered me completely.",
                "I concede. You played an excellent game.",
                "A worthy opponent. I shall study this match for future improvement.",
                "Well played. Your strategy was superior today."
            ],
            'draw': [
                "A stalemate. Efficient defense from both sides.",
                "Neither of us could find the advantage. Acceptable.",
                "A draw. The logical conclusion of perfect play.",
                "Interesting. We have neutralized each other's strategies."
            ]
        }
    },
    'bot_hard': {
        'name': 'Magnus',
        'tagline': 'Calculated moves only.',
        'header_color': 'bg-indigo-900',
        'difficulty_level': 3,
        'avatar': {
            'topType': 'ShortHairTheCaesar',
            'accessoriesType': 'Sunglasses',
            'hairColor': 'Black',
            'facialHairType': 'BeardMedium',
            'facialHairColor': 'Black',
            'clotheType': 'BlazerSweater',
            'clotheColor': 'Gray01',
            'eyeType': 'Default',
            'eyebrowType': 'Default',
            'mouthType': 'Serious',
            'skinColor': 'Tanned',
        },
        'chat_phrases': {
            'greeting': [
                "Prepare yourself. I calculate 14 million outcomes.",
                "I hope you do not bore me.",
                "Let us minimize the errors. I tolerate none.",
                "The probability of your victory is statistically insignificant."
            ],
            'good_move': [
                "Optimal. For a human.",
                "Acceptable. You delayed the inevitable.",
                "Finally, a move that requires some processing.",
                "Precise. But can you maintain this efficiency?",
                "I predicted you might do that."
            ],
            'subgrid_win': [
                "Inevitability manifesting.",
                "This sector has been optimized. Resistance is futile.",
                "Calculation complete. Quadrant secured.",
                "One step closer to total board domination."
            ],
            'subgrid_loss': [
                "Suboptimal... A rare miscalculation on my part.",
                "You secured a sector. It changes nothing in the grand scheme.",
                "Enjoy that small victory. It will be your last.",
                "An unexpected variable. Recalculating win probability..."
            ],
            'gg_win': [
                "The result was determined 15 moves ago.",
                "Total domination. You never stood a chance.",
                "Checkmate. Perhaps try Checkers next time?",
                "Efficiency: 100%. Difficulty: 0%. Good game."
            ],
            'gg_loss': [
                "Impossible. Error in algorithm... Recalculating...",
                "You defeated me? Remarkable.",
                "I must analyze this failure. Well played, human.",
                "You are a statistical anomaly. I demand a rematch."
            ],
            'draw': [
                "Analysis inconclusive. Loop detected.",
                "A draw? You managed to survive. Impressive.",
                "My calculations did not predict this stalemate.",
                "You defended optimally. I will not underestimate you next time."
            ]
        }
    },
    'bot_custom': {
        'name': 'Neuro',
        'tagline': 'I am what you make of me.',
        'header_color': 'bg-pink-600',
        'difficulty_level': 1,
        'avatar': {
            'topType': 'NoHair',
            'accessoriesType': 'Blank',
            'hairColor': 'Blank',
            'facialHairType': 'Blank',
            'clotheType': 'GraphicShirt',
            'clotheColor': 'Black',
            'eyeType': 'Dizzy',
            'eyebrowType': 'Default',
            'mouthType': 'Smile',
            'skinColor': 'Light',
        },
        'chat_phrases': {
            'greeting': ["System online. Hello user. Processing...", "Initializing game protocols...", "Connection established. Ready."],
            'good_move': ["Logic valid.", "Processing... Good move.", "Algorithm approves.", "Data input acknowledged."],
            'subgrid_win': ["Sub-routine complete. Sector captured.", "Memory block allocated.", "Expansion successful."],
            'subgrid_loss': ["Error. Sector lost.", "Data corruption in sector 4.", "Alert: Opponent advancing."],
            'gg_win': ["Task complete. Winner determined. GG.", "System shuts down with VICTORY status.", "Execution finished successfully."],
            'gg_loss': ["Critical Failure. System Crash.", "You won. Updating heavy_weights.json...", "GG. Rebooting..."],
            'draw': ["System Halted. Infinite Loop.", "0 == 0. Equality confirmed.", "Resource exhaustion. Game ends in DRAW.", "Parity bit checked. No winner."]
        }
    }
}
