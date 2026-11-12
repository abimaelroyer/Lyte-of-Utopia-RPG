// Game data. Everything after the "=" is plain JSON; keep the ";" at the end.
LOU_DATA.achievements = {
  "_readme": "Achievements shown in the menu. 'title' is listed; clicking it shows 'text', 'unlock' (how to get it) and 'reward'. 'bonus' gives a real gameplay effect: higherYieldDamage adds that much damage (0.1 = 10%) against enemies whose yield level is higher than Akira's. Achievements without an entry here still work, they just stay hidden from the player. 'episode' groups entries.",
  "snuckToVillage": {
    "episode": 1,
    "title": "Contrarian",
    "text": "Quite the rebel, are you?",
    "unlock": "Sneak to the village while gramps is away.",
    "reward": "We don't reward disobedience."
  },
  "stayedHome": {
    "episode": 1,
    "title": "Good Boy",
    "text": "Who's a good boy? You are!",
    "unlock": "Choose to stay home like you were told.",
    "reward": "Getting praise is enough of a reward for a good boy like you."
  },
  "goliathSlayer": {
    "episode": 1,
    "title": "Goliath Slayer",
    "text": "Despite the odds, you managed to kill an enemy that was way stronger than you.",
    "unlock": "Kill the tutorial wolf.",
    "reward": "10% more damage to enemies with a higher yield level.",
    "bonus": {
      "higherYieldDamage": 0.1
    }
  },
  "completedEpisode1": {
    "episode": 1,
    "title": "Just the Beginning",
    "text": "You finished Episode One.",
    "unlock": "Finish Episode One.",
    "reward": "If you think you'll get a handout for completing the first section of the game, I don't know what to tell you."
  },
  "enrolledInUFA": {
    "episode": 2,
    "title": "Freshman",
    "text": "You're now enrolled at UFA, a super prestigious fighting academy. Don't get shoved in a locker, loser.",
    "unlock": "Accept Kai's offer to UFA.",
    "reward": "You're finally starting to sound like a shonen protagonist, that's rewarding enough."
  }
};
