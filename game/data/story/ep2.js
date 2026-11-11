// Game data. Everything between the "{" and the last "}" is plain JSON.
// Episode 1 creates LOU_DATA.story; Object.assign adds these scenes to it,
// so this file must load after story/ep1.js in index.html.
Object.assign(LOU_DATA.story, {
  "ep2Opening": {
    "location": "old_home",
    "onEnter": {
      "setEpisode": 2
    },
    "text": "*Episode II: \"New Beginnings\"*\n\nStressed and exhausted, Akira passed out when he reached the town. An old lady and her nephew, who was a few years older than Akira, took him in.\n\n*The next morning…*\n\n\"He's dead…\" Akira said to the old woman.\n\nThe three of them were sitting at a small table in the old woman's home, eating breakfast. The old woman asked why Akira had passed out the previous night, so he explained what had happened.\n\n\"Oh no, that's terrible,\" she said. \"For a six-year-old to go through such a thing… You should stay with us for now. It may be a humble lifestyle, but it would be much better than a youngster like yourself being out on the street.\"\n\n\"Thank you…\" Akira mumbled, staring at his bowl without lifting his head.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_dont_get_used",
        "advancesStory": true
      }
    ]
  },
  "ep2_dont_get_used": {
    "location": "old_home",
    "text": "His voice trembled, but he swallowed it down with his pride. *If he cried here, it'd feel too real.*\n\nWhen the old woman reached across the table and squeezed his hand, he flinched, just slightly.\n\n*Don't get used to this,* he told himself. *People leave. They always do.*\n\nThe other young boy stuffed his face, paying little mind to the conversation.",
    "choices": [
      {
        "text": "Two years later",
        "goto": "ep2_dream",
        "advancesStory": true
      }
    ]
  },
  "ep2_dream": {
    "location": "void",
    "text": "Akira found himself in another vivid dream:\n\n\"Amazing. Our son was born with incredible power. I sense that he will become a great warrior one day.\"\n\n\"But he will need someone to guide him. You must stay by his side and watch over him, no matter the cost.\"",
    "choices": [
      {
        "text": "Wake up",
        "goto": "ep2_alleyway",
        "advancesStory": true
      }
    ]
  },
  "ep2_alleyway": {
    "location": "alley",
    "objective": null,
    "onEnter": {
      "addStats": {
        "strength": 21,
        "constitution": 13,
        "vitality": 11,
        "agility": 24,
        "movementSpeed": 13,
        "endurance": 17
      }
    },
    "text": "Akira woke from his dream to find himself in a grimy alleyway, in a town not far from his old home.\n\n*Smells like shit…* he thought as he looked at the garbage that was piled up near him.\n\nHis stomach grumbled. He looked down at his hands.\n\nThey were red and raw from the cold, but that wasn't what hurt. It was the ache in his chest, the one that came whenever he thought too long about Haru — or the old woman.\n\nHis foggy breath wasn't enough to warm his hands, so he shoved them into his pockets.\n\n*Keep moving. Don't think about it. Don't get stuck.*\n\nHe forced a smirk, muttering to himself, \"Guess I'm winning at life, huh?\"\n\nIt was easier to joke than to think about how alone he was.\n\nThe old woman had passed away from sickness just one year after Akira arrived. He and her nephew were left to wander the streets of the village. They went their separate ways and never saw each other again…\n\nTo find odd jobs and earn credits, Akira had made his way to the main town on Buena Island.",
    "choices": [
      {
        "text": "Get up",
        "goto": "ep2_streets",
        "advancesStory": true
      }
    ]
  },
  "ep2_streets": {
    "location": "town",
    "objective": "Find something to eat.",
    "text": "Akira got up and wandered out into the streets of the town.\n\n\"I wonder if I have enough credits to scrounge up something to eat.\"\n\nThe main town was bigger than the village Akira grew up near, but not by much. One crooked square, a handful of streets running off it, and the sea waiting at the end of every one of them.\n\nA tavern sign creaked over a door on one corner. Shopkeepers were already sweeping their steps along the shop row. Somewhere a market stall was frying something that made his stomach clench. Two patrol officers were dozing on a bench near the fountain.",
    "choices": [
      {
        "text": "Go into the tavern",
        "goto": "ep2_tavern",
        "advancesStory": true,
        "requires": {
          "notAchievements": [
            "gaveLastCredits"
          ]
        },
        "hideLocked": true
      },
      {
        "text": "Peek into the tavern",
        "goto": "ep2_tavern_again",
        "requires": {
          "achievements": [
            "gaveLastCredits"
          ]
        },
        "hideLocked": true
      },
      {
        "text": "Wander through the market",
        "goto": "ep2_town_market"
      },
      {
        "text": "Walk out to the edge of the island",
        "goto": "ep2_town_edge"
      },
      {
        "text": "Pass the patrol post",
        "goto": "ep2_town_patrol"
      },
      {
        "text": "Go back to the alley",
        "goto": "ep2_town_alley"
      },
      {
        "text": "Look for work on the shop row",
        "goto": "ep2_window_job",
        "advancesStory": true
      }
    ]
  },
  "ep2_town_hub": {
    "location": "town",
    "text": "The main town was bigger than the village Akira grew up near, but not by much. One crooked square, a handful of streets running off it, and the sea waiting at the end of every one of them.\n\nA tavern sign creaked over a door on one corner. Shopkeepers were already sweeping their steps along the shop row. Somewhere a market stall was frying something that made his stomach clench. Two patrol officers were dozing on a bench near the fountain.",
    "choices": [
      {
        "text": "Go into the tavern",
        "goto": "ep2_tavern",
        "advancesStory": true,
        "requires": {
          "notAchievements": [
            "gaveLastCredits"
          ]
        },
        "hideLocked": true
      },
      {
        "text": "Peek into the tavern",
        "goto": "ep2_tavern_again",
        "requires": {
          "achievements": [
            "gaveLastCredits"
          ]
        },
        "hideLocked": true
      },
      {
        "text": "Wander through the market",
        "goto": "ep2_town_market"
      },
      {
        "text": "Walk out to the edge of the island",
        "goto": "ep2_town_edge"
      },
      {
        "text": "Pass the patrol post",
        "goto": "ep2_town_patrol"
      },
      {
        "text": "Go back to the alley",
        "goto": "ep2_town_alley"
      },
      {
        "text": "Look for work on the shop row",
        "goto": "ep2_window_job",
        "advancesStory": true
      }
    ]
  },
  "ep2_tavern": {
    "location": "tavern",
    "text": "*There's hardly anyone here… I mean, I know that not a lot of people live in this town, but still. Actually… who is that?*\n\nAkira looked in the corner of the tavern to find a man slouched over the counter in front of a collection of empty glasses.",
    "choices": [
      {
        "text": "\"Are you alright, sir?\"",
        "goto": "ep2_drunkard",
        "advancesStory": true
      }
    ]
  },
  "ep2_drunkard": {
    "location": "tavern",
    "text": "\"Are you alright, sir?\"\n\n\"Ugh… y-yeah,\" he hiccuped. \"I'm o-okay.\"\n\nThe man was slouched over, unable to sit up straight.\n\n*Is he… drunk? Yeah, I think he is.*\n\n\"D-do you hap—\" *hiccup* \"—happen to have any spare credits?\" The man swayed back in his seat as he tried to focus on Akira.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_gave_coins",
        "advancesStory": true
      }
    ]
  },
  "ep2_gave_coins": {
    "location": "tavern",
    "onEnter": {
      "setMoney": 0
    },
    "text": "\"Uh…\" Akira sighed, \"… yeah, I do.\"\n\nAkira dumped a small pouch of copper coins on the counter, using the rest of his credits to pay for the strange man's drink.\n\n*Well, I'm gonna have to find some other way to get something to eat… I must be an idiot. Giving the rest of my money to some drunk guy instead of getting myself a meal.*\n\n\"T-thanks so much! I owe you one. One day I'll repay you tenfold~\"\n\n\"Yeah, sure…\"",
    "choices": [
      {
        "text": "Leave the tavern",
        "goto": "ep2_hungry",
        "advancesStory": true,
        "effects": {
          "setAchievements": [
            "gaveLastCredits"
          ]
        }
      }
    ]
  },
  "ep2_hungry": {
    "location": "town",
    "objective": "Earn a few credits.",
    "text": "As Akira left the tavern and started walking down the street, his stomach grumbled.\n\n*Gotta find a way to earn some money!*",
    "choices": [
      {
        "text": "Back to the square",
        "goto": "ep2_town_hub"
      }
    ]
  },
  "ep2_tavern_again": {
    "location": "tavern",
    "text": "The corner stool was empty. The glasses were gone too, which meant someone had paid for them. Akira had a pretty good idea who.\n\nThe barkeep looked up, saw who it was, and went back to polishing a mug. \"Your friend left. Didn't say where.\"\n\n\"He's not my friend.\"\n\n\"Didn't say that either.\"",
    "choices": [
      {
        "text": "Back to the square",
        "goto": "ep2_town_hub"
      }
    ]
  },
  "ep2_town_market": {
    "location": "town",
    "shop": "town_market",
    "text": "The market was three stalls and a cart, but it smelled like a feast. Skewers of meat hissed over coals. A woman was stacking bread rolls into a pyramid that looked structurally unsound.\n\n\"Six coppers a roll,\" she said, without looking at him.",
    "choices": [
      {
        "text": "Step away from the stall",
        "goto": "ep2_town_market_after"
      }
    ]
  },
  "ep2_town_market_after": {
    "location": "town",
    "text": "Akira checked his pockets, even though he knew exactly what was in them.\n\n\"Just looking.\"\n\n\"Look faster, you're scaring off the customers.\"\n\nThere were no other customers.",
    "choices": [
      {
        "text": "Back to the square",
        "goto": "ep2_town_hub"
      }
    ]
  },
  "ep2_town_edge": {
    "location": "island_edge",
    "text": "The street ran out, then the grass ran out, and then there was nothing but a long drop and the sea.\n\nFrom up here he could see the coast curling away to the south, toward the farm. Toward where the farm used to be. He couldn't actually see it. He looked anyway.\n\nThe wind was cold enough to make his eyes water. That was the wind's fault.\n\n*Keep moving. Don't get stuck.*",
    "choices": [
      {
        "text": "Back to the square",
        "goto": "ep2_town_hub"
      }
    ]
  },
  "ep2_town_patrol": {
    "location": "town",
    "text": "The patrol post was a wooden booth, a bench, and a sign that read *TOWN PATROL: ALWAYS VIGILANT*. Both officers on the bench were asleep.\n\nAkira walked past. One of them snorted awake and pointed at him without opening his eyes.\n\n\"Halt. State your business.\"\n\n\"Walking.\"\n\n\"Hm.\" The officer cracked one eye open and gave Akira a long once-over. Torn clothes, raw hands, no shoes worth the name. \"Suspicious.\"\n\n\"I'm *eight*.\"\n\n\"Eight-year-olds commit crimes all the time,\" the other officer muttered, still asleep. \"Statistically.\"\n\n\"Name one crime I could do right now.\"\n\nThe first officer thought about it for a long moment. \"Loitering.\"\n\n\"You're loitering.\"\n\n\"I'm *on duty*.\" He closed his eye again. \"Keep out of trouble, kid. Last thing I need is paperwork.\"\n\nBy the time Akira reached the corner, they were both snoring.",
    "choices": [
      {
        "text": "Back to the square",
        "goto": "ep2_town_hub"
      }
    ]
  },
  "ep2_town_alley": {
    "location": "alley",
    "onEnter": {
      "stamina": 30
    },
    "text": "The alley was exactly as he'd left it. Same garbage, same smell, same spot behind the crates where the wind couldn't quite reach.\n\nAkira sat down with his back to the wall and closed his eyes for a while. It wasn't sleep, but it was close enough.",
    "choices": [
      {
        "text": "Get back up",
        "goto": "ep2_town_hub"
      }
    ]
  },
  "ep2_window_job": {
    "location": "town",
    "objective": "Earn a few credits.",
    "text": "Akira was scrubbing a shop's windows in exchange for a few copper coins when a rather obtuse man came walking by.\n\nThe man tripped on Akira's water bucket and fell to the ground.\n\n\"Hey! Watch it, you brat!\" The man's voice was grating, his red face puffed up with anger.\n\n\"Sorry.\"\n\nThe man's meaty hand grabbed his shoulder, spinning him around.\n\n\"What are you going to do about this?\" he spat, jabbing a sausage-like finger at his wet, stained shirt. \"My clothes are ruined! I'm soaking wet!\"",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_your_fault",
        "advancesStory": true
      }
    ]
  },
  "ep2_your_fault": {
    "location": "town",
    "text": "Akira sighed. \"I said I was sorry. But honestly? The bucket wasn't even in your way.\"\n\nHe smiled innocently, but his words were sharp enough to draw blood.\n\n\"So, if anything, this is your fault.\"\n\nThe man's face darkened to a shade of crimson that matched his temper. \"You little—!\"",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_roundhouse",
        "advancesStory": true
      }
    ]
  },
  "ep2_roundhouse": {
    "location": "town",
    "text": "The swing came fast, but Akira was faster. He dipped under the wild punch, letting the man's momentum throw him off balance.\n\n\"You sorry little br-\"\n\nThe man's words died in his throat as Akira's foot connected with his jaw in a sharp, clean roundhouse. The large man stumbled back, crashing to the ground in a heap.\n\nBy now, people walking down the street had noticed the commotion and stopped to watch.\n\n\"Argh!\" the man groaned from the ground. \"Hey, don't just stand there, get that snot-nosed brat!\" he barked, clutching his face.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_bodyguards",
        "advancesStory": true
      }
    ]
  },
  "ep2_bodyguards": {
    "location": "town",
    "objective": "Deal with the bodyguards.",
    "text": "Two towering guards stepped forward, their presence immediately shifting the mood.\n\nAkira rubbed the back of his head with a sheepish grin. *Wow, he was so big I didn't even notice he had bodyguards.*\n\nThe first guard lunged, throwing a heavy punch aimed at Akira's head.",
    "choices": [
      {
        "text": "Fight",
        "goto": "ep2_first_guard_fight"
      }
    ]
  },
  "ep2_first_guard_fight": {
    "location": "town",
    "encounter": {
      "enemy": "guard1",
      "win": "ep2_first_guard",
      "lose": "ep2_guard_defeat",
      "playerYield": 480
    },
    "objective": "Deal with the bodyguards.",
    "text": ""
  },
  "ep2_first_guard": {
    "location": "town",
    "onEnter": {
      "stamina": 50
    },
    "text": "The first guard swung one last time. Akira vaulted over the arm, twisted in midair, and planted a kick on the side of his head.\n\nThe big man went down like a felled tree.\n\nHe didn't get back up.\n\nFor a second the whole street went quiet. Then the crowd exploded.\n\n\"Did that kid just—\"\n\n\"He's half his size!\"\n\n\"Somebody get me a chair, I'm watching the rest of this!\"\n\nThe second guard stepped over his partner, cracking his knuckles one at a time. He was smaller than the first one, and quicker on his feet.\n\n\"Lucky shot, kid,\" he said, raising his fists. \"Let's see you try that on me.\"",
    "choices": [
      {
        "text": "Face the second guard",
        "goto": "ep2_second_guard_fight"
      }
    ]
  },
  "ep2_second_guard_fight": {
    "location": "town",
    "encounter": {
      "enemy": "guard2",
      "win": "ep2_second_guard",
      "lose": "ep2_guard2_defeat",
      "playerYield": 480
    },
    "text": ""
  },
  "ep2_second_guard": {
    "location": "town",
    "text": "Akira slipped under one last jab and drove his fist into the guard's gut. The man folded in half and dropped on top of his partner.\n\nBoth guards collapsed to the ground, groaning.\n\nThe crowd erupted all over again.\n\n\"Holy hell, that kid—\"\n\n\"Did you see that kick?!\"\n\n\"Forget the kick, did you see that *punch*?!\"\n\n\"I'm telling you, I saw it first. I said he'd win. Didn't I say he'd win?\"\n\n\"You said, and I quote, *that kid's gonna die*.\"\n\nAkira brushed off his hands and smirked down at the two heaps on the cobblestones. \"You guys really need to work on your teamwork.\"\n\n\"Useless pieces of—\" the obtuse man grumbled, still sitting in the puddle from the bucket. \"I pay you two to stand there and look scary, and you can't even do that!\"",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_kai_appears",
        "advancesStory": true
      }
    ]
  },
  "ep2_guard_defeat": {
    "location": "town",
    "text": "Akira's feet went out from under him and the cobblestones came up hard.\n\nA boot pinned his shoulder down. The crowd that had been cheering a second ago went quiet, the way crowds do when they realise the fun part is over.\n\n\"That's enough,\" someone said. It wasn't the guards.\n\nThe patrol officers pushed through. One of them looked down at Akira and sighed like he'd been expecting this all morning.",
    "choices": [
      {
        "text": "*Great...*",
        "goto": "gameOver_guards"
      }
    ]
  },
  "gameOver_guards": {
    "location": "void",
    "objective": null,
    "text": "**You were caught.**\n\nThe cell is small and cold, and nobody comes to ask about the boy in it. The obtuse man's story is the only one anybody hears. A few weeks become a few months.\n\nSomewhere, a man in a black cloak waits around a little longer than he meant to, then shrugs and gets on his airship alone.\n\nThe world does not pause for this.",
    "choices": [
      {
        "text": "Refuse this ending",
        "goto": "ep2_bodyguards",
        "effects": {
          "restoreVitals": true
        }
      }
    ]
  },
  "ep2_guard2_defeat": {
    "location": "town",
    "text": "Akira's feet went out from under him and the cobblestones came up hard.\n\nA boot pinned his shoulder down. The crowd that had been cheering a second ago went quiet, the way crowds do when they realise the fun part is over.\n\n\"That's enough,\" someone said. It wasn't the guards.\n\nThe patrol officers pushed through. One of them looked down at Akira and sighed like he'd been expecting this all morning.",
    "choices": [
      {
        "text": "*Great...*",
        "goto": "gameOver_guards2"
      }
    ]
  },
  "gameOver_guards2": {
    "location": "void",
    "objective": null,
    "text": "**You were caught.**\n\nThe cell is small and cold, and nobody comes to ask about the boy in it. The obtuse man's story is the only one anybody hears. A few weeks become a few months.\n\nSomewhere, a man in a black cloak waits around a little longer than he meant to, then shrugs and gets on his airship alone.\n\nThe world does not pause for this.",
    "choices": [
      {
        "text": "Refuse this ending",
        "goto": "ep2_first_guard",
        "effects": {
          "restoreVitals": true
        }
      }
    ]
  },
  "ep2_kai_appears": {
    "location": "town",
    "objective": null,
    "text": "\"Hey, you've got some pretty nice moves there,\" a young man said as he walked down the street, looking over the crowd.\n\nAs the man pushed his way to the front, Akira turned to get a better look at whoever was complimenting him.\n\nNow that he could see him properly, Akira noticed the man was quite tall. Under his cloak, his refined muscles could be seen through his unique black robes. His black hair swayed in the wind, and his amber-brown eyes were bright, but sharp.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_i_remember_you",
        "advancesStory": true,
        "requires": {
          "achievements": [
            "gaveLastCredits"
          ]
        },
        "hideLocked": true
      },
      {
        "text": "Continue",
        "goto": "ep2_kai_stranger",
        "advancesStory": true,
        "requires": {
          "notAchievements": [
            "gaveLastCredits"
          ]
        },
        "hideLocked": true
      }
    ]
  },
  "ep2_i_remember_you": {
    "location": "town",
    "text": "\"Hey, I remember you!\" Akira said, pointing at him. \"You're that drunk bastard who used my last copper coins! You sobered up already?\"\n\n\"Hahaha! Now, now, I said I would pay you back. In fact, I bet it was fate that led me to you again today!\"\n\n\"Help! Help! This crazy homeless child is attacking me!\" The obtuse man yelled.\n\nSoon, town patrol officers were running down the street toward the shop.\n\n\"Whoa, that's not good. We'd better get out of here,\" the drunkard said. \"How about it, kid? Want me to get you out of here? It'd do you no good to end up in jail.\"",
    "choices": [
      {
        "text": "\"Yeah, alright.\"",
        "goto": "ep2_flight",
        "advancesStory": true
      }
    ]
  },
  "ep2_flight": {
    "location": "sky",
    "text": "*I don't know this guy… but he's right, I can't go to jail. Besides, now I can get him to cough up my money!* \"Yeah, alright.\"\n\nThe drunkard smiled, then lifted Akira with one arm.\n\n*Huh!?* Akira thought.\n\n\"W-what!?\" said the obtuse man, still sitting on the ground.\n\nThe drunkard slowly began ascending into the air while carrying Akira.\n\n\"W-we're flying!\" Akira exclaimed.\n\n\"Yeah, and we can do a lot more than this!\" the drunkard said as he sped toward the edge of the island.\n\n*What the hell? Is this really the same drunk guy I met earlier?*\n\nThe two patrolmen, the obtuse man, and the entire crowd of onlookers were all left with their mouths wide open, dumbfounded on the side of the road.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_airship",
        "advancesStory": true
      }
    ]
  },
  "ep2_airship": {
    "location": "airship",
    "text": "After a few minutes of flying, the drunkard landed in front of a small airship and put Akira down.\n\n\"Who are you?\" Akira asked.\n\n\"Ah, that's right. I haven't introduced myself to you yet. My name is Kai. I'm an instructor at the UFA. What's your name, kid?\"\n\n\"Akira…\"\n\n\"Just Akira?\" Kai smiled, but he was hiding a slight, unexplainable pain behind his expression.\n\n\"Yeah… anyways, what's the UFA?\"",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_ufa_explained",
        "advancesStory": true
      }
    ]
  },
  "ep2_ufa_explained": {
    "location": "airship",
    "text": "\"You haven't heard of it?\"\n\n\"Nope.\"\n\n\"Huh, that's strange… well, I guess if you've been on a small island like this one for your whole life, then you wouldn't really know. The UFA, short for Ultimate Fighting Academy, is a global institute that trains the most disciplined fighters. Even people from nearby planets come to Earth just to try to get into the school.\"\n\n\"Really?\"\n\n\"Yeah! And it's expensive too. Only a select few students who are considered exceptional talents get to enroll for free.\"\n\n\"A combat school, huh…\" *That sounds kind of cool…*",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_the_offer",
        "advancesStory": true,
        "requires": {
          "achievements": [
            "gaveLastCredits"
          ]
        },
        "hideLocked": true
      },
      {
        "text": "Continue",
        "goto": "ep2_the_offer_alt",
        "advancesStory": true,
        "requires": {
          "notAchievements": [
            "gaveLastCredits"
          ]
        },
        "hideLocked": true
      }
    ]
  },
  "ep2_the_offer": {
    "location": "airship",
    "text": "\"So, how about it?\"\n\n\"How about what?\"\n\n\"You know… Do you want to enroll? Now would be the perfect time, seeing as a new semester is about to start.\"\n\n\"E-enroll? I can barely pay for my next meal! How am I gonna enroll in an expensive school like that!?\"\n\n\"Hahaha, don't worry about that. With your skills, I'm sure you'd be able to get in. And if it's the money that concerns you, then don't worry, consider it my repayment.\"\n\n\"Are you sure?\"\n\n\"Yeah, we'd be missing out if we let a talent like yours get away. So? You wanna come with me?\"\n\nAkira looked down at the ground, unable to decide.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_good_choice",
        "advancesStory": true
      }
    ]
  },
  "ep2_kai_stranger": {
    "location": "town",
    "text": "\"That roundhouse was a little sloppy, but the vault? Not bad at all,\" the man said with a grin. \"Where'd a kid like you learn to fight like that?\"\n\n\"Who's asking?\"\n\n\"Help! Help! This crazy homeless child is attacking me!\" the obtuse man yelled.\n\nSoon, town patrol officers were running down the street toward the shop.\n\n\"Whoa, that's not good. We'd better get out of here,\" the man said. \"How about it, kid? Want me to get you out of here? It'd do you no good to end up in jail.\"",
    "choices": [
      {
        "text": "\"Yeah, alright.\"",
        "goto": "ep2_flight_alt",
        "advancesStory": true
      }
    ]
  },
  "ep2_flight_alt": {
    "location": "sky",
    "text": "*I don't know this guy… but he's right, I can't go to jail.* \"Yeah, alright.\"\n\nThe man smiled, then lifted Akira with one arm.\n\n*Huh!?* Akira thought.\n\n\"W-what!?\" said the obtuse man, still sitting on the ground.\n\nThe man slowly began ascending into the air while carrying Akira.\n\n\"W-we're flying!\" Akira exclaimed.\n\n\"Yeah, and we can do a lot more than this!\" the man said as he sped toward the edge of the island.\n\n*What the hell? Who is this guy?*\n\nThe two patrolmen, the obtuse man, and the entire crowd of onlookers were all left with their mouths wide open, dumbfounded on the side of the road.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_airship",
        "advancesStory": true
      }
    ]
  },
  "ep2_the_offer_alt": {
    "location": "airship",
    "text": "\"So, how about it?\"\n\n\"How about what?\"\n\n\"You know… Do you want to enroll? Now would be the perfect time, seeing as a new semester is about to start.\"\n\n\"E-enroll? I can barely pay for my next meal! How am I gonna enroll in an expensive school like that!?\"\n\n\"Hahaha, don't worry about that. With your skills, I'm sure you'd be able to get in. And if it's the money that concerns you, then don't worry. Consider it an investment.\"\n\n\"Are you sure?\"\n\n\"Yeah, we'd be missing out if we let a talent like yours get away. So? You wanna come with me?\"\n\nAkira looked down at the ground, unable to decide.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_good_choice",
        "advancesStory": true
      }
    ]
  },
  "ep2_good_choice": {
    "location": "airship",
    "text": "Kai softened his tone. \"You can keep running, or you can learn to fight. Which one do you think is better?\"\n\nAkira clenched his fists, biting his lip, before finally nodding. \"...Fine. I'll come.\"\n\nKai smirked but offered no celebratory cheer, only a quiet \"Good choice,\" as they both boarded the airship.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_boarding",
        "effects": {
          "setAchievements": [
            "enrolledInUFA"
          ]
        },
        "advancesStory": true
      }
    ]
  },
  "ep2_boarding": {
    "location": "airship",
    "text": "\"Oh, that's right,\" Kai started, \"don't you need permission from your family?\"\n\n\"I… don't have any family.\"\n\n\"I see… well, is there anyone else you need to say goodbye to?\" Kai said with a dry smile.\n\n\"Nah… not really.\"\n\nAkira briefly thought of the old woman and her nephew who took him in.\n\n\"Well, in that case… let's go straight to the academy.\"",
    "choices": [
      {
        "text": "The next day",
        "goto": "ep2_arrival",
        "advancesStory": true
      }
    ]
  },
  "ep2_arrival": {
    "location": "airship",
    "text": "\"Hey, we're here. Welcome to the UFA, the Ultimate Fighting Academy on Earth. I took the liberty of letting the headmaster know I'm enrolling you while we were flying, so a room has already been prepared for you.\"\n\n*He must have some pretty decent influence here for the headmaster of such a prestigious school to agree just like that…*\n\nAkira looked out the window as they passed over the campus.\n\n*Wow, this place is huge!*",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_campus",
        "advancesStory": true
      }
    ]
  },
  "ep2_campus": {
    "location": "ufa",
    "objective": "Follow Kai around campus.",
    "text": "Once they touched down and exited the airship, Akira was able to get a better look around.\n\n\"Everything looks all new and fancy.\"\n\n\"Yep, the UFA is equipped with numerous state-of-the-art facilities.\"\n\n\"Oh, that's right,\" Akira said with a hint of sarcasm. \"This is a rich kids' school.\"\n\n\"Haha, that's not wrong.\" Kai laughed. \"I'll show you around the main spots on campus, then take you to your room for now.\"\n\n\"Okay, let's go.\"",
    "choices": [
      {
        "text": "Fifteen minutes later",
        "goto": "ep2_meet_rayon",
        "advancesStory": true
      }
    ]
  },
  "ep2_meet_rayon": {
    "location": "ufa",
    "text": "\"Oh, would you look at that! Akira, this is Rayon, a student around the same age as you.\"\n\nRayon, a boy only a year older than Akira, wore a high-quality white gi. His black hair was well-kept, and he had bold, light blue eyes.\n\n\"It's nice to meet you, Rayon. My name is Akira.\" He extended his hand out to greet Rayon.\n\nRayon glanced at Akira's tattered old clothes with disapproval.\n\n\"Hmph, they're letting in street rats now?\" Rayon rolled his eyes and looked at Kai. \"So, when is the Trial?\"\n\n*This guy is… rude!* Akira thought with an irritated expression.\n\n\"Trial? What trial?\"",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_trials",
        "advancesStory": true
      }
    ]
  },
  "ep2_trials": {
    "location": "ufa",
    "text": "Kai explained, \"Trials… The academy hosts these 'Trials of Merit' so students can prove themselves as warriors.\"\n\nHe took out his ID from his cloak and showed it to Akira.\n\n\"Those who pass the Trial are granted provisional Fighter-class licenses, which allow them to use their powers within the laws of the Cosmic Guard.\"\n\n*Woah…* Akira looked at the glimmering card.\n\n\"Oh yeah, and I suppose you may know this already, but the Cosmic Guard is the organization that oversees this world and many others like it. They have designated stations and guards posted all over this planet to maintain control.\"",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_qualify",
        "advancesStory": true
      }
    ]
  },
  "ep2_qualify": {
    "location": "ufa",
    "text": "\"W-wow. So will I be taking this Trial too?\"\n\n\"Well, that depends on whether or not you'll be able to qualify for it. Only students who prove themselves with merit will be allowed to even attempt the Trials. The next round of Trials will probably start in about half a year.\"\n\n\"With your pathetic yield level, I wouldn't bank on it,\" Rayon remarked.\n\n\"Hey, what's your deal? I haven't done anything to you, yet you're acting like a complete jerk.\"\n\n\"Hmph.\"\n\nRayon walked off into one of the nearby buildings on the campus.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_kai_advice",
        "advancesStory": true
      }
    ]
  },
  "ep2_kai_advice": {
    "location": "ufa",
    "objective": null,
    "text": "\"Don't mind him. He just gets shy around new people.\"\n\n\"If you want him to warm up to you, you should show him just how powerful you really are. That'll get him to open up.\"\n\n\"But for now, you should focus on getting situated. Your first class will start at eight o'clock tomorrow morning.\"\n\nKai raised his sleeve, revealing a watch. He peered at his wrist to check the time.\n\n\"Alright, that's all I have to say for now. I have something urgent I must address. I'll come by to check on you later.\"\n\n\"Mhm, see you later, Mr. Kai.\"",
    "choices": [
      {
        "text": "A week later",
        "goto": "ep2_nightmare",
        "advancesStory": true
      }
    ]
  },
  "ep2_nightmare": {
    "location": "void",
    "text": "In his dreams, Akira stood on the edge of a dying world.\n\nThe planet stretched endlessly beneath him, larger than Earth but broken — its once-lush surface now nothing but cracked veins of dried magma. It glowed faintly like the embers of a dying fire, as if the planet's lifeblood hadn't yet given up.\n\nThe sky bled fire. Thick smoke choked the horizon and clawed at his throat. The air whipped around violently, and the ground beneath his feet trembled with the distant roar of explosions. It felt as though the entire planet was groaning in pain.\n\nThen he heard him.\n\n\"Go! Get out of here!\" The old man stood in a burning field, wolves circling closer with glowing eyes and snapping jaws.\n\n\"Har-\" Akira choked on his breath. *Not again.* He thought.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_nightmare_red",
        "advancesStory": true
      }
    ]
  },
  "ep2_nightmare_red": {
    "location": "void",
    "text": "A cold sweat ran down the side of Akira's face as the dream continued. His face twisted in distress as he relived his most helpless moments.\n\nThe image of Haru blurred, fading into darkness, until all that remained was red.\n\nThe red of blood.\n\nIt spread, swallowing everything, until he couldn't see, couldn't hear—\n\nOnly the blaring of some distant alarm cut through the void.\n\n**Beep! Beep! Beep!**",
    "choices": [
      {
        "text": "Wake up",
        "goto": "ep2_morning",
        "advancesStory": true
      }
    ]
  },
  "ep2_morning": {
    "location": "ufa_dorms",
    "text": "Akira rolled out of bed and turned off his alarm.\n\nIn the hallway outside, a young girl was approaching his room.\n\nAkira was lying in silence when he heard her knocking on his door.\n\n\"Huuuuuugh,\" he yawned. \"Time to get started.\"\n\n*I've already been here for a few months, and I've started to get used to this place.*\n\n*In the morning, we have a bunch of physical training classes followed by some general educational courses.*\n\n*Then, after a break for lunch, the real fun begins. In the afternoon, we have sparring sessions and technique classes.*\n\n*I've made some real progress towards my goal… I'm gonna hunt down Felix and get my revenge no matter what it takes…*\n\nAkira glared as he gazed upon his clenched fist.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_sikira",
        "advancesStory": true
      }
    ]
  },
  "ep2_sikira": {
    "location": "ufa_dorms",
    "text": "\"Hey! Akira! You up yet? We gotta go if we wanna make it to the cafeteria before all the pancakes are gone!\" the young girl shouted through the closed door.\n\n\"Yeah, yeah, I'm coming, give me a minute to get ready. You're always so energetic in the morning, Sikira.\"\n\nAs he shifted out of bed, he looked at the brand new gi sitting on his chair. Its yellow and black fabric was breathable yet reinforced, making it both comfortable and durable.\n\n\"Is there something wrong with that, mister?\" With her hands on her hips and sass on her tongue, she taunted him as he exited his room.\n\nSikira was slim, but well-toned. She had spiky black hair and black eyes.\n\n\"I mean… not really. But you do get ahead of yourself sometimes. Anyways, let's go meet up with Darc.\"\n\n\"Alrighty!\"",
    "choices": [
      {
        "text": "A few hours later",
        "goto": "ep2_kai_returns",
        "advancesStory": true
      }
    ]
  },
  "ep2_kai_returns": {
    "location": "ufa",
    "text": "Akira was walking to the training court for his next class when someone called out to him.\n\n\"Hey, Akira!\"\n\n\"Huh? Oh, it's you, Master Kai. How are you? It's been a while since we've seen each other.\"\n\n\"Yeah, that's probably my fault, hahaha,\" Kai said as he hid what seemed to be a flask in his cloak.\n\n\"I was on my way to some important business, but I decided to let you know something.\"\n\n\"I think you have a pretty good chance of being selected to take the upcoming trial in six months.\"\n\n\"You'd better get ready. I can tell this year's trial is going to be unlike any other,\" Master Kai said with a smirk.\n\n\"I'm always up for a challenge!\" Akira said confidently.\n\n\"Alright, I'll catch up with you later, Akira,\" he said, waving as he walked away.\n\n\"Yep!\" Akira chirped.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_challenge",
        "advancesStory": true
      }
    ]
  },
  "ep2_challenge": {
    "location": "ufa",
    "objective": "Show Rayon what you can do.",
    "text": "Then he gazed over at the other side of the training court, where he saw Rayon fixing his gi.\n\n*Speaking of challenges…* \"Hey Rayon, how about we get a quick match in before class!\"\n\nAll the students around the court looked towards Akira and Rayon as they slowly backed away.\n\n\"This idiot really went and challenged him to a fight!\" Sikira said.\n\nThe boy next to her replied, \"Yeah, still hard to believe that when we met him the other day, he declared that he would defeat Rayon and make it to the top of the class.\"\n\nHe was another young boy, with short grayish hair and light-brown eyes.\n\n\"I mean, I respect his enthusiasm, but it's barely been a week…\"\n\n\"Well, who knows, maybe he'll actually win.\"\n\n\"What? Are you crazy, Darc?\"",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_the_bet",
        "advancesStory": true
      }
    ]
  },
  "ep2_the_bet": {
    "location": "ufa",
    "text": "She turned to look him in the face.\n\n\"Akira's strong, sure, but Rayon's the best student in this year's class! Some of the instructors said he's one of the most impressive students ever! He's even stronger than some of the instructors, too!\"\n\n\"Yeah, yeah, that's all true… but I just get the feeling that there's something special about Akira. I can't really put my finger on it, though.\"\n\n\"Hmph, alright. If that's the case, then let's bet some money on it to see who wins. I'll put up two bronzes on Rayon!\"\n\n\"Huh!?\"\n\n\"Don't tell me you're chickening out now!\"\n\n\"D-dammit…\" Darc mumbled.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_crossing_the_court",
        "advancesStory": true
      }
    ]
  },
  "ep2_crossing_the_court": {
    "location": "ufa",
    "text": "Akira crossed the training court, each step echoing louder in his head than it did on the tiles. He could feel every pair of eyes on him.\n\nRayon turned slowly, as if Akira wasn't worth the effort. His light-blue eyes cut like ice, meeting Akira's gaze for only a moment before drifting lazily away.\n\n\"You're just begging for me to show you the difference in our abilities, aren't you?\" Rayon said, his voice calm, but laced with contempt. \"What was your name again?\"\n\nAkira clenched his teeth. \"You bastard. You forgot already?\"\n\nRayon tilted his head, letting a cruel smirk curl across his face. \"Actually, I've changed my mind.\" He tugged on his gi sleeve, tightening it. \"It doesn't matter who you are.\"\n\nThe crowd murmured, and Akira could feel the heat in his cheeks. He wasn't just being dismissed; he was being erased.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_line_in_the_sand",
        "advancesStory": true
      }
    ]
  },
  "ep2_line_in_the_sand": {
    "location": "ufa",
    "text": "\"Is that how you feel?\" Akira said, his voice low and dangerous. He stepped forward, his fists trembling, not with fear but with the kind of anger that leaves your chest tight.\n\n\"Fine then…\" He grinned, baring his teeth like a wolf. \"I'll knock you on your ass so hard that you'll be begging me to tell you the name of who bested you!\"\n\nThe students around them gasped, whispering bets and insults, while Sikira yelled from the sideline, \"Akira, are you insane?!\"\n\nRayon rolled his shoulders back, his energy flaring slightly: a flicker of raw power, just enough to make the air feel heavier.\n\n\"Big words… for someone with a yield level barely worth measuring.\"",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_standoff",
        "advancesStory": true
      }
    ]
  },
  "ep2_standoff": {
    "location": "ufa",
    "text": "Akira sank into his stance, his heart pounding. This wasn't just a fight anymore. This was a line in the sand.\n\nA strong breeze swept the court, carrying the silence of a hundred held breaths.\n\n\"Come on then,\" Rayon said. \"Show me if you're anything more than a stray mutt barking for attention.\"\n\nSweat rolled down the side of Akira's face as they stared each other down.",
    "choices": [
      {
        "text": "Continue",
        "goto": "ep2_end",
        "advancesStory": true
      }
    ]
  },
  "ep2_end": {
    "location": "void",
    "objective": null,
    "text": "*[Next time on Lyte of Utopia]: \"First Mission!\"*\n\n**[Yield Levels]**\n\n**Akira:** ???\n— Suppressed (Idle): 5\n— Suppressed (vs. Bodyguards): 480\n\n**Old Woman:** 1\n**Nephew:** 3\n**Bodyguard 1:** 140\n**Bodyguard 2:** 165\n**Obtuse man:** 6\n**Patrol officers:** 200 - 300\n**Master Kai:** ???\n\n**Rayon:** ???\n— Suppressed: 750\n\n**Sikira:** ???\n— Suppressed: 300\n\n**Darc:** ???\n— Suppressed: 350\n\n**UFA Students:** 50 - 400\n**UFA Instructors:** 1,000+",
    "choices": [],
    "ending": true
  }
});
