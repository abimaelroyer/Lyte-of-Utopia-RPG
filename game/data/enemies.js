// Game data. Everything after the "=" is plain JSON; keep the ";" at the end.
LOU_DATA.enemies = {
  "haru": {
    "name": "Haru",
    "level": 16,
    "role": "Protective ally",
    "description": "Espada Santa and Ducha Sagrado are demonstrated in Episode I. No prime-era or later kit.",
    "stats": {
      "flow": 11,
      "flux": 16,
      "control": 19,
      "strength": 25,
      "constitution": 25,
      "vitality": 51,
      "movementSpeed": 1,
      "agility": 1,
      "endurance": 11
    },
    "perks": [],
    "insight": 2,
    "speedScaling": "standard",
    "moveIds": [
      "haru_protect",
      "haru_espada",
      "haru_ducha",
      "haru_guard",
      "haru_evade",
      "haru_charge",
      "haru_breath"
    ],
    "shortName": "Haru",
    "pronouns": "he",
    "sprite": "haru",
    "condition": [
      [
        1,
        "Unhurt."
      ],
      [
        0.8,
        "A little roughed up."
      ],
      [
        0.55,
        "Hurt, and starting to show it."
      ],
      [
        0.3,
        "Badly hurt."
      ],
      [
        0.01,
        "Barely standing."
      ],
      [
        0,
        "Down."
      ]
    ],
    "staminaCondition": [
      [
        0.6,
        "Breathing easy."
      ],
      [
        0.3,
        "Breathing hard."
      ],
      [
        0,
        "Winded."
      ]
    ],
    "ai": {
      "weights": {
        "haru_protect": 4,
        "haru_espada": 3,
        "haru_ducha": 1,
        "haru_guard": 1,
        "haru_evade": 1,
        "haru_charge": 1,
        "haru_breath": 0
      },
      "recoverBelowStamina": 0.25,
      "react": {}
    }
  },
  "felix": {
    "name": "Felix",
    "level": 35,
    "role": "Antagonist \u00b7 test proxy",
    "description": "His Episode I hand-wave attack has no established name or mechanism. No scripted invulnerability in this lab.",
    "stats": {
      "flow": 36,
      "flux": 55,
      "control": 35,
      "strength": 42,
      "constitution": 50,
      "vitality": 81,
      "movementSpeed": 10,
      "agility": 9,
      "endurance": 31
    },
    "perks": [],
    "insight": 2,
    "speedScaling": "standard",
    "moveIds": [
      "felix_wave",
      "felix_guard",
      "felix_evade",
      "felix_charge",
      "felix_breath"
    ],
    "shortName": "Felix",
    "pronouns": "he",
    "sprite": "felix",
    "condition": [
      [
        1,
        "Untouched. Smirking."
      ],
      [
        0.8,
        "Mildly irritated."
      ],
      [
        0.55,
        "No longer smiling."
      ],
      [
        0.3,
        "Bleeding and furious."
      ],
      [
        0.01,
        "Barely standing."
      ],
      [
        0,
        "Down."
      ]
    ],
    "staminaCondition": [
      [
        0.6,
        "Breathing easy."
      ],
      [
        0.3,
        "Breathing hard."
      ],
      [
        0,
        "Winded."
      ]
    ],
    "ai": {
      "weights": {
        "felix_wave": 5,
        "felix_guard": 1,
        "felix_evade": 1,
        "felix_charge": 1,
        "felix_breath": 0
      },
      "recoverBelowStamina": 0.25,
      "react": {}
    }
  },
  "wolf": {
    "name": "Lesser Demon Wolf",
    "level": 8,
    "role": "Beast \u00b7 one individual",
    "description": "Episode I lesser wolf, not the stronger wolves from later episodes. No assumed Spirit or Demon transformation.",
    "stats": {
      "flow": 1,
      "flux": 1,
      "control": 1,
      "strength": 20,
      "constitution": 10,
      "vitality": 6,
      "movementSpeed": 10,
      "agility": 15,
      "endurance": 15
    },
    "perks": [],
    "insight": 2,
    "speedScaling": "standard",
    "moveIds": [
      "wolf_bite",
      "wolf_pounce",
      "wolf_guard",
      "wolf_evade",
      "wolf_charge",
      "wolf_breath"
    ],
    "shortName": "the wolf",
    "pronouns": "it",
    "sprite": "wolf",
    "condition": [
      [
        1,
        "Unhurt. Hackles raised."
      ],
      [
        0.8,
        "A few scrapes. Still eager."
      ],
      [
        0.55,
        "Bleeding at the muzzle. Its growl has gone ragged."
      ],
      [
        0.3,
        "Favoring a foreleg, breath rasping."
      ],
      [
        0.01,
        "Staggering, but its eyes still burn."
      ],
      [
        0,
        "Down."
      ]
    ],
    "staminaCondition": [
      [
        0.6,
        "Breathing easy."
      ],
      [
        0.3,
        "Panting."
      ],
      [
        0,
        "Winded, tongue lolling."
      ]
    ],
    "ai": {
      "weights": {
        "wolf_bite": 5,
        "wolf_pounce": 3,
        "wolf_evade": 1,
        "wolf_breath": 0
      },
      "recoverBelowStamina": 0.25,
      "react": {
        "guard": {
          "wolf_pounce": 2.0
        },
        "evade": {
          "wolf_bite": 2.0,
          "wolf_pounce": 0.5
        },
        "recover": {
          "wolf_pounce": 3.0
        },
        "attack": {
          "wolf_evade": 2.0
        }
      }
    }
  }
};
