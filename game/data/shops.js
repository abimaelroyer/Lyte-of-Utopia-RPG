// Game data. Everything after the "=" is plain JSON; keep the ";" at the end.
LOU_DATA.shops = {
  "_readme": "Merchants. A story scene shows one with \"shop\": \"<id>\". Prices are in credits (copper = 1, bronze = 100, silver = 10,000, gold = 1,000,000). 'once': true means Akira can only own one. Optional 'effects' work like a choice's effects, e.g. { \"stamina\": 15 }.",
  "town_market": {
    "name": "Town market",
    "items": [
      {"id": "bread_roll", "name": "Bread roll", "price": 6, "description": "Still warm. From the unstable pyramid.", "effects": {"stamina": 15}}
    ]
  },
  "village_trinkets": {
    "name": "Trinket table",
    "items": [
      {"id": "carved_shell", "name": "Carved shell", "price": 15, "description": "A spiral shell with a tiny boat cut into it."},
      {"id": "glass_beads", "name": "Glass beads", "price": 25, "description": "A string of sea-green beads that catch the light."},
      {"id": "corded_knife", "name": "Corded knife", "price": 250, "description": "Handle wrapped in dyed cord. Not for looking.", "once": true}
    ]
  }
};
