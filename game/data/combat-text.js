// Game data. Everything after the "=" is plain JSON; keep the ";" at the end.
LOU_DATA.combatText = {
  "_readme": "Combat narration. {A}/{a} = the acting fighter (capitalized / lowercase), {T}/{t} = the target. Each list picks one line at random. Keys under 'intent' and 'attack' are move ids from moves.json; '_kind' and '_default' are fallbacks for moves without their own lines.",
  "start": {
    "wolf": [
      "The wolf comes forward one slow step at a time. There's nowhere to put the bucket but down.",
      "Akira raises his fists. The wolf doesn't seem impressed."
    ],
    "_default": [
      "{T} squares up."
    ],
    "guard1": [
      "The first guard rolls his neck and steps in. The crowd backs up to give him room.",
      "He's twice Akira's height and doesn't seem worried about it."
    ],
    "guard2": [
      "The second guard doesn't wait for his partner to get up. He's already bouncing on his toes.",
      "This one's smaller, and faster. His fists are already up."
    ]
  },
  "intent": {
    "wolf_bite": [
      "The wolf's lips peel back from red-stained teeth. It edges in, head low.",
      "Its jaws click shut once. Its eyes don't leave him.",
      "The wolf's head dips and bobs, inching closer."
    ],
    "wolf_pounce": [
      "The wolf sinks onto its haunches.",
      "Its weight rocks back. Its flanks bunch tight.",
      "The wolf goes very still and very low."
    ],
    "wolf_evade": [
      "The wolf's ears flatten. It shifts its weight onto its back legs.",
      "It watches his hands, paws light on the dirt."
    ],
    "wolf_breath": [
      "The wolf circles wide, flanks heaving.",
      "It paces at the edge of the clearing, tongue lolling."
    ],
    "_kind": {
      "attack": [
        "{A} readies an attack."
      ],
      "guard": [
        "{A} sets {their} feet and braces."
      ],
      "evade": [
        "{A} rocks onto the balls of {their} feet."
      ],
      "recover": [
        "{A} hangs back, breathing hard."
      ],
      "charge": [
        "{A} goes still. The air around {them} tightens."
      ],
      "none": [
        "{A} hesitates."
      ]
    },
    "_offBalance": {
      "wolf": [
        "The wolf skids and scrambles, trying to get its feet back under it. It's wide open.",
        "It overshot. For a heartbeat its flank is turned toward him."
      ],
      "_default": [
        "{A} stumbles, off balance. {Their} guard is wide open."
      ]
    },
    "guard1_punch": [
      "The guard rolls his shoulders and plants his feet.",
      "He drops his weight onto his back foot.",
      "His right hand drifts back toward his ear."
    ],
    "guard1_guard": [
      "The guard tucks his chin and raises his forearms.",
      "He hunkers down behind his arms."
    ],
    "guard1_breath": [
      "The guard hangs back, puffing.",
      "He wipes his face and takes a step away."
    ],
    "guard2_jab": [
      "The guard bounces on his toes, lead hand flicking.",
      "His shoulders twitch. His fists stay high and loose.",
      "He bobs in, closing the gap."
    ],
    "guard2_evade": [
      "The guard sways side to side, eyes on Akira's hands.",
      "His weight goes light. He's not moving forward."
    ],
    "guard2_breath": [
      "The guard backs off and shakes out his arms.",
      "He circles wide, chest heaving."
    ],
    "guard1_jab": [
      "The guard's lead hand twitches.",
      "He edges forward, left hand loose."
    ],
    "guard2_haymaker": [
      "The guard stops bouncing.",
      "He settles his feet. His back shoulder dips."
    ],
    "haru_protect": [
      "The old man squares his shoulders and steps in.",
      "His stance shortens. His hands close into fists."
    ],
    "haru_espada": [
      "Faint light flickers between the old man's palms.",
      "His hands drift together, close to his chest."
    ],
    "haru_ducha": [
      "The old man raises his eyes to the sky and breathes in, slow.",
      "The air above him seems to brighten."
    ],
    "haru_guard": [
      "The old man sets his feet and raises his forearms.",
      "He settles in, hands up, unmoving."
    ],
    "haru_evade": [
      "The old man's weight shifts onto the balls of his feet.",
      "He watches, loose, ready to move."
    ],
    "haru_charge": [
      "The old man closes his eyes. The air around him hums.",
      "He stands very still, gathering something."
    ],
    "haru_breath": [
      "The old man steps back, breathing hard.",
      "He lowers his hands for a moment."
    ],
    "felix_wave": [
      "Felix lifts one hand, almost lazily.",
      "He smiles, and his fingers curl."
    ],
    "felix_guard": [
      "Felix turns his body side-on, one hand raised.",
      "He waits, palm open, unbothered."
    ],
    "felix_evade": [
      "Felix rocks back on his heels, still smiling.",
      "He drifts half a step to the side."
    ],
    "felix_charge": [
      "The air around Felix grows heavy.",
      "Felix tilts his head. Something in the air tightens."
    ],
    "felix_breath": [
      "Felix rolls his neck, taking his time.",
      "He steps back and brushes off his coat."
    ]
  },
  "intentTag": {
    "quick": "Quick",
    "slow": "Slow",
    "defensive": "Defensive",
    "recovering": "Recovering",
    "charging": "Gathering",
    "unknown": "Unclear",
    "offbalance": "Off balance"
  },
  "attack": {
    "akira_strike": {
      "hit": [
        "Akira throws a wild punch into {t}'s shoulder.",
        "Akira swings with everything he has and catches {t} in the ribs.",
        "A clumsy fist connects with {t}'s snout."
      ],
      "guarded": [
        "Akira's punch lands on {t}'s guard."
      ],
      "evaded": [
        "Akira swings at where {t} was a moment ago.",
        "{T} slips back and Akira's fist finds nothing."
      ],
      "grazed": [
        "The punch glances off as {t} twists away."
      ],
      "opening": [
        "Akira catches it while it's still turning. His fist lands clean.",
        "He doesn't think. He just swings, and this time it lands square on the wolf's skull.",
        "Akira drives a fist into its exposed side."
      ],
      "vs": {
        "guard1": {
          "hit": [
            "Akira's fist snaps into {t}'s jaw.",
            "Akira slips inside and drives a punch into {t}'s gut.",
            "A quick kick catches {t} behind the knee."
          ],
          "opening": [
            "{T} is wide open. Akira doesn't waste it.",
            "Akira darts in while {t} is still recovering and lands it clean."
          ]
        },
        "guard2": {
          "hit": [
            "Akira's fist snaps into {t}'s jaw.",
            "Akira slips inside and drives a punch into {t}'s gut.",
            "A quick kick catches {t} behind the knee."
          ],
          "opening": [
            "{T} is wide open. Akira doesn't waste it.",
            "Akira darts in while {t} is still recovering and lands it clean."
          ]
        }
      }
    },
    "wolf_bite": {
      "hit": [
        "The wolf lunges and its jaws close on Akira's forearm.",
        "Teeth rake across Akira's shoulder.",
        "The wolf darts in and bites down hard."
      ],
      "guarded": [
        "Akira gets his arms up in time. The bite lands on forearms instead of throat.",
        "Akira tucks behind his arms. Teeth sink in anyway."
      ],
      "evaded": [
        "Akira throws himself sideways. Jaws snap shut on empty air.",
        "Akira twists away and the bite misses by a hand's width."
      ],
      "opening": [
        "Akira is still stumbling when the jaws find him."
      ]
    },
    "wolf_pounce": {
      "hit": [
        "The wolf launches itself at Akira and the full weight of it slams him backward.",
        "It leaps. Claws and weight and teeth, all at once."
      ],
      "guarded": [
        "Akira braces as the wolf crashes into him. His arms take most of it.",
        "The wolf hits his raised arms like a falling tree."
      ],
      "evaded": [
        "Akira dives aside and the wolf sails past, skidding in the dirt.",
        "The pounce comes. Akira isn't there for it."
      ],
      "opening": [
        "The wolf slams into him before he has his feet back."
      ]
    },
    "_default": {
      "hit": [
        "{A}'s attack strikes {t}."
      ],
      "guarded": [
        "{T} blocks, but the blow still gets through."
      ],
      "evaded": [
        "{T} slips out of the way."
      ],
      "grazed": [
        "{T} dodges most of it, but not all."
      ],
      "opening": [
        "{A} catches {t} wide open."
      ]
    },
    "guard1_punch": {
      "hit": [
        "The guard's fist crashes into Akira's chest and knocks him back a step.",
        "A huge punch clips Akira across the side of the head.",
        "The haymaker lands. Akira's ears ring."
      ],
      "guarded": [
        "Akira gets his arms up. The punch hits them like a sack of bricks.",
        "Akira blocks it, and still slides back across the cobbles."
      ],
      "evaded": [
        "Akira ducks and the fist whistles over his head.",
        "The punch hits nothing but air. The guard stumbles after it."
      ],
      "grazed": [
        "The punch skims Akira's shoulder as he twists away."
      ]
    },
    "guard2_jab": {
      "hit": [
        "Two quick jabs snap Akira's head back.",
        "A jab catches Akira on the cheek before he sees it coming.",
        "The guard's fists pepper Akira's ribs."
      ],
      "guarded": [
        "Akira keeps his arms tight. The jabs rattle off them.",
        "Akira covers up as the jabs land on his forearms."
      ],
      "evaded": [
        "Akira slips the jabs, moving low.",
        "The jabs cut through empty air where Akira's head was."
      ],
      "grazed": [
        "One jab grazes Akira's ear as he slips away."
      ]
    },
    "guard1_jab": {
      "hit": [
        "A quick jab catches Akira on the chin.",
        "The guard's jab snaps into Akira's cheek."
      ],
      "guarded": [
        "Akira catches the jab on his forearm."
      ],
      "evaded": [
        "Akira bobs and the jab sails past."
      ],
      "grazed": [
        "The jab skims Akira's ear."
      ]
    },
    "guard2_haymaker": {
      "hit": [
        "The haymaker lands. Akira staggers back a step.",
        "A big swing clips Akira across the jaw."
      ],
      "guarded": [
        "Akira blocks the haymaker, and it still rattles his arms."
      ],
      "evaded": [
        "Akira ducks the haymaker and it whistles overhead."
      ],
      "grazed": [
        "The haymaker brushes past Akira's shoulder."
      ]
    }
  },
  "earlyEvade": [
    "{T} moves too soon.",
    "{T} commits to the dodge too early."
  ],
  "severity": {
    "graze": [
      "It barely seems to notice.",
      "It hardly registers."
    ],
    "light": [
      "It stings.",
      "A shallow hit."
    ],
    "solid": [
      "That one hurt.",
      "A solid hit."
    ],
    "heavy": [
      "The impact staggers {t}.",
      "A brutal blow."
    ],
    "brutal": [
      "Something gives.",
      "It's devastating."
    ]
  },
  "defendIdle": {
    "guard": [
      "{A} braces, but nothing comes.",
      "{A} keeps {their} guard up, waiting."
    ],
    "evade": [
      "{A} dodges at nothing.",
      "{A} shifts aside, but there was nothing to avoid."
    ]
  },
  "recover": {
    "_default": [
      "{A} gulps down air. {Their} legs steady a little.",
      "{A} takes a breath and holds it."
    ],
    "wolf_breath": [
      "The wolf pants, flanks heaving, getting its wind back."
    ],
    "akira_breath": [
      "Akira drags in a lungful of air. His legs steady a little.",
      "Akira holds his ground and breathes. In. Out."
    ],
    "guard1_breath": [
      "The guard sucks in air, red-faced."
    ],
    "guard2_breath": [
      "The guard shakes out his arms and breathes."
    ]
  },
  "charge": {
    "_default": [
      "{A} gathers {their} focus."
    ]
  },
  "exhausted": {
    "player": "Akira is too winded to do that.",
    "enemy": "{A} is too winded to press the attack."
  },
  "ko": {
    "player": {
      "wolf": [
        "Akira's legs fold under him. He hits the ground and doesn't get up.",
        "The world tilts. Akira is on his back in the roots, and the wolf is standing over him."
      ],
      "_default": [
        "Akira's legs fold under him. He hits the ground and doesn't get up."
      ],
      "guard1": [
        "The cobblestones come up to meet him. Akira's on his back, and the guard is standing over him."
      ],
      "guard2": [
        "One jab too many. Akira's knees give out."
      ]
    },
    "enemy": {
      "wolf": [
        "The wolf staggers, legs buckling, and collapses into the leaves."
      ],
      "_default": [
        "{A} goes down and stays down."
      ],
      "guard1": [
        "The guard's eyes roll back. He sits down hard on the cobblestones."
      ],
      "guard2": [
        "The guard folds in half and drops to his knees, groaning."
      ]
    },
    "draw": [
      "They hit each other at the same instant. Neither gets back up."
    ]
  },
  "outcome": {
    "win": "The fight is over.",
    "loss": "The fight is over.",
    "draw": "The fight is over."
  },
  "flee": {
    "success": [
      "Akira turns and runs, and doesn't look back.",
      "Akira bolts for the trees before it can close the gap."
    ],
    "_comment": "Played after any hit Akira takes while running."
  },
  "commit": {
    "akira_guard": [
      "Akira throws his arms up in front of his face."
    ],
    "akira_evade": [
      "Akira rocks onto the balls of his feet, ready to throw himself aside."
    ],
    "akira_breath": [
      "Akira backs off a step and tries to get his breath under control."
    ],
    "flee": [
      "Akira turns to run."
    ],
    "akira_wait": [
      "Akira stays put and watches.",
      "Akira holds still, eyes on {t}."
    ]
  },
  "offBalance": {
    "enemy": {
      "wolf": [
        "The wolf overshoots and skids, off balance."
      ],
      "_default": [
        "{A} overcommits and stumbles."
      ],
      "guard1": [
        "The guard's own swing carries him off balance."
      ]
    },
    "player": [
      "Akira overcommits and stumbles. He's wide open."
    ]
  },
  "interrupt": [
    "The hit knocks {a} off {their} stride before {they} can strike.",
    "{A} is caught mid-motion and loses the moment."
  ],
  "tutorial": {
    "_readme": "The combat tutorial. 'tour' is the step-by-step walkthrough shown before the first fight (and from the ? button): each step points at one part of the screen ('target' is a CSS selector; leave it out for a centred box). Press ` to go back, 1 to go forward. 'enemyNotes' adds a last step only when fighting that enemy. 'steps' is the old one-window version, kept for reference.",
    "title": "Combat Tutorial",
    "steps": [
      ["Congrats! If you're reading this then that means that you've gotten yourself into quite the mess, let's see if we can figure out how to keep you alive."],
      ["Read your opponent", "The opponent's panel will give you some clues on what it's about to do. It's awfully vague now, but in the future with enough training you'll be able to read your enemies like a book. As for now pay attention to the speed in which they attack.\n**Quick** attacks land almost instantly\n**Slow** ones take a while\n**Defensive** means it's waiting for you to move first."],
      ["Pick one move", "At the bottom of your screen, you'll see a list of possible moves that Akira can do. Make sure you carefully read each of them, or else you could do more harm than good."],
      ["Fewer ticks gives you priority", "Every move shows its tick (or frame) cost. Whoever moves faster lands their move, and a successful hit cancels the other fighter's move for that round. On a tie, your stats will decide."],
      ["Mind your recovery", "Heavy moves leave you ticks behind next round. Each panel shows **Ready** or how far behind that fighter is."],
      ["Watch your stamina", "Most moves cost stamina. When you're low, **Catch breath** to get it back, ideally while the opponent is busy."]
    ],
    "enemyNotes": {
      "_readme": "Extra lines added to the end of the tutorial only when fighting that enemy.",
      "wolf": [
        "I doubt you'll be able to kill this wolf, but give the combat a go to familiarize yourself with the combat. Have fun! -downabyzmal"
      ]
    },
    "button": "Got it",
    "tour": [
      {
        "title": "Uh oh",
        "text": "Congrats! If you're reading this, you've gotten yourself into quite the mess. Let's see if we can figure out how to keep you alive."
      },
      {
        "target": ".sb-stats .sb-stat:nth-child(1)",
        "title": "Health",
        "text": "How much health Akira has left. I'm sure you can figure out what happens if this hits zero, right?"
      },
      {
        "target": ".sb-stats .sb-stat:nth-child(2)",
        "title": "Yield level",
        "text": "How much power Akira is letting out. Enemies with a higher yield level than yours are stronger than you. Fight them anyway, if you're feeling brave."
      },
      {
        "target": ".sb-bar-stamina",
        "title": "Stamina",
        "text": "Almost everything you do in a fight costs stamina. Don't let it run out, or you'll be punished for it. Use **Recovery** to catch your breath."
      },
      {
        "target": ".sb-bar-aether",
        "title": "Aether",
        "text": "The energy behind special techniques. Akira doesn't know any yet, but hang on to the thought."
      },
      {
        "target": ".sb-conditions",
        "title": "Condition",
        "text": "Akira's physical, emotional and mental state. Some conditions can give you a real edge in battle. Others will kneecap you."
      },
      {
        "target": ".foe-card",
        "title": "Read your opponent",
        "text": "This panel describes what your opponent is doing. It won't tell you what's coming, so watch their body and make your best guess. A fighter winding up looks different from one testing the distance, or one getting ready to dodge."
      },
      {
        "target": ".you-card",
        "title": "Mind your recovery",
        "text": "Heavy moves leave you ticks behind next round. Each panel says **Ready**, or how far behind that fighter is."
      },
      {
        "target": ".combat-log",
        "title": "What happened",
        "text": "Every round is written out here, blow by blow."
      },
      {
        "target": ".actions",
        "title": "Pick a move",
        "text": "Choose a category first: **Combat**, **Defense**, **Recovery** or **Flee**. Then pick a move from it. Press ` to go back to the categories."
      },
      {
        "target": ".actions",
        "title": "Fewer ticks gives you priority",
        "text": "Every move shows its tick cost. Whoever is faster lands first, and a hit cancels the other fighter's move for that round. On a tie, your stats decide."
      },
      {
        "target": ".stage-help",
        "title": "Need a refresher?",
        "text": "Click **?** any time to go through this tutorial again. Good luck, and try not to embarrass yourself."
      }
    ]
  },
  "tieBreak": {
    "_readme": "Shown when both actions land on the same tick and stats decide who goes first. {stat} comes from 'stat' below.",
    "lines": [
      "Both move on the same tick, but {a}'s {stat} gets {them} there first.",
      "They commit at the same instant. {A}'s {stat} wins it."
    ],
    "stat": {
      "agility": "quicker footwork",
      "control": "sharper control",
      "stats": "sheer edge"
    }
  },
  "tempo": {
    "_readme": "Shown after a round when one fighter is still recovering. {n} = ticks of lag carried into the next round.",
    "player": [
      "Akira is still recovering. He starts the next exchange {n} ticks behind.",
      "Akira hasn't reset yet. He's {n} ticks late into the next exchange."
    ],
    "enemy": [
      "{A} is still recovering and starts the next exchange {n} ticks behind.",
      "{A} hasn't reset yet. Akira has a {n} tick head start."
    ]
  }
};
