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
    ]
  },
  "intent": {
    "wolf_bite": [
      "The wolf's lips peel back from red-stained teeth. It edges in, head low.",
      "It snaps its jaws once, testing the distance.",
      "The wolf darts forward a half step, then stops, measuring him."
    ],
    "wolf_pounce": [
      "The wolf sinks onto its haunches, hind legs coiling.",
      "Its weight rocks back. Every muscle in its flanks bunches tight.",
      "The wolf goes very still and low, like a spring being wound."
    ],
    "wolf_evade": [
      "The wolf's ears flatten. It shifts its weight backward.",
      "It watches his hands, ready to spring away."
    ],
    "wolf_breath": [
      "The wolf circles wide, flanks heaving, keeping its distance.",
      "It paces, tongue lolling, not closing in."
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
    }
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
      ]
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
    "player": [
      "Akira's legs fold under him. He hits the ground and doesn't get up.",
      "The world tilts. Akira is on his back in the roots, and the wolf is standing over him."
    ],
    "enemy": {
      "wolf": [
        "The wolf staggers, legs buckling, and collapses into the leaves."
      ],
      "_default": [
        "{A} goes down and stays down."
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
    ]
  },
  "offBalance": {
    "enemy": {
      "wolf": [
        "The wolf overshoots and skids, off balance."
      ],
      "_default": [
        "{A} overcommits and stumbles."
      ]
    },
    "player": [
      "Akira overcommits and stumbles. He's wide open."
    ]
  },
  "interrupt": [
    "The hit knocks {a} off {their} stride before {they} can strike."
  ]
};
