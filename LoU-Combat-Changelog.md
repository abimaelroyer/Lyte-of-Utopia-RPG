# Lyte of Utopia — Combat Prototype Changelog

Latest playable branch: **v0.11 (Episode I)**; adult branch retained at **v0.8**  
Changelog established: **13 September 2026**

This log tracks what changed between playable prototypes, why it changed, and which ideas remain proposals. Earlier entries were reconstructed from the retained prototype code, design record and conversation. Original release dates are omitted where they were not confirmed. Version labels refer to the game prototype, not revisions of individual files.

## Asset pass — Episode I action sprites v2 (16 September 2026)

- Corrected Felix’s idle: fixed lower body with coordinated upper-body breathing.
- Added action coverage for all 23 Episode I menu entries, preserving disabled lab-only entries as optional assets.
- Added hit, stagger, victory and defeat animations for all four characters, plus human combat-ready stances.
- Created golden blade and golden rain effects for Haru’s Espada Santa and Ducha Sagrado.
- Delivered 46 four-frame clips, PNG frames/strips, GIF previews and a standalone action viewer.
- Combat remains v0.11. Animation integration, multi-hit implementation and dedicated status overlays are still pending.

## Asset pass — Episode I idle sprites v1 (16 September 2026)

- Created proposed idle animation sheets for farm-clothed Akira, Haru, Felix and the Lesser Demon Wolf using Episode I descriptions and supplied visual references.
- Distinguished confirmed traits from provisional palette/costume/Haru hairstyle decisions in Design-Notes.md.
- Packaged four aligned transparent PNG frames per character, horizontal strips, four-frame GIF loops, source sheets and an offline animation viewer with pause, stepping, mirroring and download controls.
- Recorded the proposed independent Multi-hit toggle, hit intervals, one-time costs, per-hit defense checks and interruption of future hits.
- This is an asset/design delivery, not a new combat release. v0.11 remains the latest playable menu; multi-hit and action-specific sprite integration are still pending.

## v0.11 — Finer timing, Insight and selective technique uses (15 September 2026)

- Preserved author allocations and existing move/perk/status parameters; kept HP, Aether, stamina, potency and point scaling unchanged.
- Converted combat to integer tenths of a displayed tick. Updated startup/recovery rounding, passive rates, DOT/regen, status durations, defense windows, Wait and AI reaction timing. Defense expiry is an explicit event.
- Added per-character Standard/Stronger experimental speed tuning. Standard finer timing is the default.
- Kept all Normal attacks unlimited. Added editable use capacity for non-Normal options with independent Flow/Endurance weights, growth interval and cap. Ducha Sagrado starts at 3 base uses, 4 with Haru's current Flow. Existing basic support actions remain unlimited.
- Added remaining-use displays, exhaustion reasons and reset-on-new-spar. Uses are paid on commitment and not refunded after misses or interruption.
- Added independent Insight tiers 0–4. Preview progresses from unknown action through approximate/exact timing to identity and conditional effect prediction.
- Locked CPU choices before player confirmation at simultaneous readiness. Retained legitimate CPU responses to already-started actions at later decision opportunities. Manual control is labeled full-information debugging.
- Redacted unresolved CPU commitment details and masked pre-recognition resource-cost clues, including in history views. Resolved/interrupted actions become inspectable.
- Added optional per-technique startup delay, interruption power, resistance and interruptibility. All disruption amounts default to zero; attack tiers grant no automatic perks. Existing Focus disruption remains separate from startup cancellation.
- Added v0.9/v0.10 migration and v0.11 export for the new fields. Retained character swapping, stat preview arrows, editable effects and read-only snapshots.
- Passed engine regressions, 24 complete pairings, new timing/uses/Insight/interruption tests and simulated-DOM editor/combat/history checks. No rendered-browser visual verification was performed.
- Updated the master record and next-update plan. Kept older prototypes and historical simulation reports intact. No multiplayer system, new canon Arts, Spirit mechanics or new sprite assets were added.

## v0.10 — Control scaling, perks/statuses and matchup switching

- Preloaded the author's supplied v0.9 JSON, preserving every existing stat allocation and original move field. Added one discretionary point at level 1, carried through every level; all four builds now have one extra unspent point.
- Changed above-baseline pool increments to +10 Aether/Flow, +25 HP/Vitality and +5 stamina/Endurance. Set melee and aetherical potency to 10 + 5 × (relevant stat − 1).
- Added Control-based casting speed and an editable aetherical damage coefficient. Migrated energy attacks start with coefficient 1; setting 0 retains flat-only damage.
- Added a Perks page for named, toggleable recovery, damage, defense and startup-speed passives.
- Added editable move-applied Bleed, Burn, Stun, Regeneration, Damage boost and Slow, with target, trigger, duration, refresh rules, status badges and cause-aware resource history.
- Processed periodic effects tick by tick internally, preventing skipped lethal damage or healing after knockout. Stun cancels pending moves without refunds and retains longer recovery.
- Put matchup selectors directly on Spar, usable during and after fights. Starting a new matchup retains edited builds and resets the fight.
- Exported v0.10 configurations include perks and statuses; v0.9 import migrates automatically. No default perks/statuses are assigned as canon.
- Passed engine and simulated-DOM checks, 24 complete matchups, and switching characters after a knockout. Rendered-browser verification remains outstanding.

## v0.9 — Episode I characters and editable techniques (14 September 2026)

- Added an Episode I tuning branch with Akira, Haru, Felix and the Lesser Demon Wolf, any-pair or mirror sparring, AI and manual two-side control.
- Started every stat at baseline 1 with all level-based points unspent. Editable levels supply 10 points per level after level 1; current/proposed attributes update with the draft.
- Set HP, Aether and stamina to exactly 100 before allocation, with gains of 24/Vitality, 8/Flow and 6/Endurance above baseline.
- Classified Bite and Pounce as Normal, Protective Strike and Espada Santa as Normal, and Ducha Sagrado as Heavy, as requested.
- Added editable per-move damage components, costs, timing weights, startup/recovery, bypass, defense windows, charge and restoration effects, names/notes and equipped toggles.
- Added saved JSON configurations containing stats and all move edits, validation, independent fight snapshots, Next event/Auto controls and detailed resource causes.
- Kept Episode I form/Spirit/Ego systems absent; no forced story outcome or hidden invulnerability in the test. Felix's unnamed attack and other uncertain components are explicitly marked as placeholders.
- Reused the child Akira portrait. Other portraits remain placeholders; combat uses status and intent cards.
- Retained the adult v0.8 menu separately. Updated the master record to distinguish branch-specific formulas and catalogs.
- Passed engine and simulated-DOM checks plus twelve complete simulated matchups. Actual browser rendering and competitive balance require playtesting.

## v0.8 — Merged Spirit capacity and independent Art components

- Removed the separate Core capacity everywhere in the current builder and runtime. Core means Spirit pools; Rikito's duplicate +240 is removed, not reassigned to Lunario.
- Added independent physical/aetherical damage components, timing weights, costs and suppression/efficiency flags. Each damage component uses its matching defense; Guard, Evade and partial Lunar Reflection resolve without double counting damage.
- Added component and timing explanations to action previews and detailed history. Existing move coefficients and channels are preserved until the author supplies mixed-move parameters.
- Retained current → proposed stat previews, combined Attacks, Utility support, hidden locked systems and no experimental Ego actions or Will spending.
- Renamed the internal core form compatibility group to transformation without changing stacking. Family/stage consolidation remains deferred.
- Updated the original master design record and this changelog through v0.8; archived superseded package records under history/.
- Verified corrected Spirit accounting, component interactions, menus in a simulated DOM, resource history and complete simulated matches. Browser rendering and competitive balance remain playtest work.

## v0.7.1 — Current → proposed attributes

- Compared the applied combat build's base attributes with the edited draft, including Focus efficiency and Spirit contribution/perk strength.
- Applied values change only when starting a new spar; editing a draft does not mutate the live fight.
- Deferred transformation-family consolidation pending detailed parameters. No balance or slot changes.

## v0.7 — Loadout and stat builder

- Added level 1–100, baseline-one stats, 990 freely assignable points at level 100, refunds and earlier-build templates.
- Added slot budgets, level gates, prerequisites, equipped-only combat, two-character drafts and JSON export/import.
- Combined physical/aether attacks in Attacks and moved retained Spirit support to Utility. Removed experimental Ego actions and Will spending; hid unavailable systems.
- Added optional Spirit capacity sharing through Willpower/Introspection and Introspection-gated perks/techniques. The additional Core capacity present here was subsequently corrected in v0.8.

## v0.6 — Streamlined high-level lab

- Moved resource bars beneath health, retained base and stacked ATK/SPD/DEF ratios, and displayed total form upkeep.
- Grouped history into form upkeep, boons and flaws with expandable source details; gave history its own page.

## v0.5 — Adult Arc IV stress test

- Added adult Akira/Rikito catalogs, provisional numerical builds, Spirit contributions and perks, advanced forms and stacking.
- Added advanced interactions and adult sprite assets for the high-level test. Numbers are game balance proposals, not canon measurements.

## Historical documentation update — 13 September 2026

### Added

- Created this dedicated changelog, including the confirmed v0.1–v0.4 releases and the unnumbered design and sprite milestones.
- Added a release-history index to the design record.
- Included the changelog alongside the design record and editable combat source in the sprite handoff pack.

### Version note

The playable build remains **v0.4**. This update changes documentation and packaging only; no combat rules, numbers or visuals changed.

## v0.4 — Event playback, resource history and SR correction

### Added

- Step-through playback with a **Next event** button, plus **Auto** playback.
- Pauses at meaningful events rather than requiring clicks for every empty tick.
- Complete event history for the current spar, with recorded resource and form snapshots.
- A **Replay this event** view that displays the recorded animation and state without changing the live fight.
- Cause-aware resource messages for activation costs, transformation upkeep, regeneration and passive Focus gain. Recurring changes are grouped between events and show their tick range.
- A detailed combat design record covering stats, attributes, moves, forms, sprites, progression and outstanding decisions.

### Changed / fixed

- Corrected SR from a yellow/gold-looking aura to creamy white for both characters. Rikito’s shadow-violet Demon aura stayed unchanged.
- Restored the profile transformation-preview selector, which had been disconnected from the active profile-rendering function.

### Design direction recorded, not implemented

- Use one shared aether pool with capacity contributions and perks for alternate aether types. No type capacity bonuses or perk numbers have been assigned.

### Verification / limits

- Checked manual pauses, event progression, resource explanations, snapshot immutability and replay isolation, alongside the existing form/combat checks.
- History resets with the spar and is not saved between sessions. Browser rendering still requires user testing.

## v0.3 — Distinct Rikito design and transformations

### Added

- SR for Akira and Rikito; DFL1 for Rikito; return-to-base action for Akira.
- A Forms action category and a choice of Rikito’s opening form.
- Animated transformation aura overlays, active-form labels and displayed form modifiers.
- Focus activation costs, per-tick aether drain, gentle DFL1 regeneration and automatic return to base when aether runs out.

### Changed

- Replaced Rikito’s tall, Akira-like hair with a compact crown, uneven forward fringe and tapered sides, guided by his supplied portrait.
- Regenerated Rikito’s idle, guard, charge, strike, cast and orb animation strips.
- Added modest visual bulk for Rikito’s Demon Form.

### Initial provisional balance

| Property | SR | DFL1 |
|---|---:|---:|
| Activation Focus | 4 | 2 |
| Aether drain per tick | 0.50 | 0.30 |
| Physical ATK | 1.75× | 1.30× |
| Aether ATK | 1.00× | 1.30× |
| Physical action speed | 1.35× | 1.15× |
| Aether action speed | 1.00× | 1.15× |
| Physical defense rating | 1.50× | 1.25× |
| Aether defense rating | 1.00× | 1.25× |
| Health regeneration per powered tick | 0 | 0.15 |

These values remain unchanged in v0.4. They are game adaptations, not canon Yield multipliers. Only one form is active at a time.

## v0.2 — Animated Akira–Rikito duel

### Added

- Both characters’ animated sprites on the combat page, plus idle animations on profiles.
- Action-specific pose mappings for strikes, charging, casting and defensive actions.
- Animated Art effects: Utopic beams, black/violet lightning, Abyss Breaker and teleport effects.
- Visual playback tied to resolved effects, with input locked during automatic resolution.
- A reusable pack of 13 four-frame character animation strips and supporting assets.

### Player-facing result

The player could see the selected Akira action and Rikito’s committed intent. Damage used a flash and number; dedicated hit sprites were still pending. Rikito’s hair was subsequently redesigned in v0.3.

## v0.1 — Arc I combat and scaling baseline

### Added

- Akira and Rikito sample profiles based on their end-of-Arc-I styles, with provisional numerical builds.
- Stat allocation, five test points per character, derived attributes and ability dossiers.
- Akira-POV combat with Attack, Defense and Utility categories.
- Focus costs and gain, aether and stamina costs, startup/recovery timing, damage/defense calculations and disclosed enemy intent.
- Selected physical attacks and Arts, Guard, Dragon Shift, Charge and Catch breath.
- A downloadable browser-test export.

### Baseline limitations

Forms and alternate-type perks were not simulated. Training, leveling, Ego combat and Move Cancels were design directions rather than working systems.

## Earlier / intermediate milestones — unnumbered

These milestones are preserved without inventing release numbers:

- Established Aether, Physical and Ego stat branches; Flux-based Focus gain/capacity; Control-based retention and Art costs; startup plus recovery timing.
- Developed category-based action menus, stat/attribute sections, and character profiles with Skills, Arts, Forms and titles/badges.
- Agreed on training plus level-up stat points, trainer-dependent breakthroughs, story-gated Introspection and Agility incorporating dexterity.
- Explored chibi and pixel-art Akira designs, then breathing/pose alternates and reusable animation frames.
- Incorporated animated Akira into a combat test before the two-character animated version. No distinct release number is assigned to this intermediate build here.

## Rules for future entries

- Put the newest released version at the top, below any documentation-only note.
- Record the version, confirmed date, reason for the update, and relevant **Added**, **Changed**, **Fixed**, **Balance**, **Removed**, or **Known limitations** items.
- For numerical changes, include **old value → new value**, affected characters/actions, and the intended gameplay effect.
- Keep proposals separate from implemented features. Canon clarifications should identify the author instruction or source passage behind them.
- Update the design record to describe current behavior; use this changelog to preserve historical behavior.
- Record only checks actually performed. A code/logic check does not establish that browser rendering passed.
- Keep documentation-only revisions separate from playable version increments. Do not renumber old unnumbered work retrospectively.

A changelog records history; it does not by itself preserve runnable copies of every old release.

## Asset fix — Felix idle waist seam (16 September 2026)

Replaced the split upper/lower-body translation with continuous row mapping. Breathing displacement tapers to zero at the waist; lower-body pixels remain fixed and the torso stays connected. Rebuilt the GIF, preview and sprite pack.

## Asset refinement — Felix whole-body idle (16 September 2026)

Supersedes both prior Felix idle fixes. Uses all four drawn poses at a shared scale with grounded alignment, allowing arms, torso, hips, knees and coat to move together. Removed the frozen lower-body mask and updated viewer text, animation files and pack.
