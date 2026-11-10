// Game data. Everything after the "=" is plain JSON; keep the ";" at the end.
LOU_DATA.shops = {
  "_readme": "Merchants. A story scene shows one with \"shop\": \"<id>\". Prices are in dollars. 'once': true means Akira can only own one. Optional 'effects' work like a choice's effects, e.g. { \"stamina\": 15 }.",
  "town_market": {
    "name": "Town market",
    "items": [
      { "id": "bread_roll", "name": "Bread roll", "price": 6, "description": "Still warm. From the unstable pyramid.", "effects": { "stamina": 15 } },
      { "id": "meat_skewer", "name": "Meat skewer", "price": 9, "description": "Hissing over the coals. Smells like a feast.", "effects": { "stamina": 25 } },
      { "id": "fried_fish", "name": "Fried fish", "price": 12, "description": "Caught this morning, or so the sign says.", "effects": { "stamina": 30 } },
      { "id": "waterskin", "name": "Waterskin", "price": 15, "description": "Leather, barely used.", "once": true }
    ]
  }
};
