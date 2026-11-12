// Game data. Everything after the "=" is plain JSON; keep the ";" at the end.
LOU_DATA.player = {
  "id": "akira",
  "name": "Akira",
  "shortName": "Akira",
  "pronouns": "he",
  "sprite": "akira",
  "stageScale": 1,
  "moveIds": [
    "akira_strike",
    "akira_guard",
    "akira_evade",
    "akira_wait",
    "akira_breath",
    "akira_charge"
  ],
  "vitalText": {
    "health": [
      [
        1,
        "You feel fine.",
        "good"
      ],
      [
        0.75,
        "A few scrapes.",
        "good"
      ],
      [
        0.5,
        "You're hurting.",
        "warn"
      ],
      [
        0.25,
        "Badly hurt.",
        "bad"
      ],
      [
        0.01,
        "You can barely stand.",
        "bad"
      ],
      [
        0,
        "Unconscious.",
        "bad"
      ]
    ],
    "stamina": [
      [
        0.8,
        "You're rested.",
        "good"
      ],
      [
        0.5,
        "A little winded.",
        "good"
      ],
      [
        0.25,
        "Out of breath.",
        "warn"
      ],
      [
        0,
        "Exhausted.",
        "bad"
      ]
    ],
    "aether": [
      [
        0,
        "Untapped.",
        "calm"
      ]
    ]
  },
  "moveText": {
    "akira_strike": "Throw a punch. Not pretty, but it's what you've got.",
    "akira_guard": "Get your arms up. Takes the edge off a hit, but it still gets through.",
    "akira_evade": "Throw yourself aside. Avoids one attack completely if it comes while you're still moving.",
    "akira_wait": "Don't move. Just watch. It costs nothing and it's over quickly, so you're ready again before a slower move finishes.",
    "akira_breath": "Back off and get your wind back. You can't defend while you do it.",
    "akira_charge": "Gather your focus.",
    "flee": "Turn and run. Anything faster than you will catch you before you're clear."
  },
  "yieldLevel": "5",
  "money": 5,
  "conditionText": {
    "_readme": "Lines in the sidebar's Condition list. Health always shows one line; stamina only shows once it drops below their first threshold (entries with null text).",
    "health": [
      [
        1,
        "You are in perfect condition.",
        "good"
      ],
      [
        0.75,
        "You are lightly injured.",
        "good"
      ],
      [
        0.5,
        "You are injured.",
        "warn"
      ],
      [
        0.25,
        "You are badly injured.",
        "bad"
      ],
      [
        0.01,
        "You are barely standing.",
        "bad"
      ],
      [
        0,
        "You are unconscious.",
        "bad"
      ]
    ],
    "stamina": [
      [
        0.5,
        null,
        ""
      ],
      [
        0.25,
        "You are winded.",
        "warn"
      ],
      [
        0,
        "You are exhausted.",
        "bad"
      ]
    ]
  },
  "conditions": {
    "_readme": "Story conditions a scene can add with addConditions / removeConditions. id: [text, tone]."
  }
};
