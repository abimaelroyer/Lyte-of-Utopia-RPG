# Lyte of Utopia — Combat Design Record

Latest playable branch: **v0.11 — Episode I Insight and timing lab**. Adult high-level branch retained at **v0.8**. Updated 16 September 2026.

This master record covers Episode I v0.11 first, followed by historical v0.10, v0.9 and adult v0.8 specifications. Newer rules supersede older rules only within the same branch. Their formulas and catalogs are branch-specific. Numerical values, levels and slots are prototype proposals, not canon measurements.

## Asset pass — Episode I idle sprites v1 (16 September 2026)

Separate from the playable v0.11 release: generated four-frame idle design sheets for farm-clothed Akira, Haru, Felix and the Lesser Demon Wolf. Exported aligned native PNGs, transparent 128×128 frames, 512×128 strips, looping GIFs and a self-contained idle viewer. Akira uses worn farm clothing rather than his UFA uniform. Haru's silver hair/beard, clothing colors and some costume details are provisional; Episode I supports his short, frail-looking elderly farmer appearance but does not specify those details in the inspected text. Felix retains orange hair, red coat and dark gray trousers. Wolf stance references informed an original heavier silhouette and fur pattern.

Source basis: Arc I compiled PDF, Episode I pages 2–6; Misc. notes include Haru's Arts but did not add an appearance description in the relevant passage. Full generation prompts and technical packaging script are included in the asset pack. These animations establish a design direction; attack/defense/Art and hit-reaction assets will follow after design review. Idle remains intended for profiles and out-of-combat use. No game-balance parameter changed in this asset pass.

Multi-hit is now a proposed independent skill toggle alongside Area, with editable count and positive tick interval. The proposed rule pays costs/one use once, resolves successive hits separately, and cancels future hits on qualifying interruption or attacker KO. Completed hits remain. Recovery starts after the final scheduled hit. Total-damage versus per-hit-damage meaning must be explicit; the recommended default splits a total across hits. Per-hit/once-per-technique effects and cancellation recovery need explicit definitions. These rules are documented in the sprite pack's Design-Notes.md and remain unimplemented in v0.11.

## v0.11 — Current Episode I rules (15 September 2026)

### Scope and preserved builds

Player versus CPU is the current game target. Manual two-side control remains a full-information debugging mode, not a multiplayer fairness implementation. The author's Akira, Haru, Felix and Lesser Demon Wolf levels, allocations and existing move/perk/status fields are preserved. Pools, potency, defense, level budgets and stat caps are unchanged from v0.10. No new canonical perks are assigned. The adult v0.8 branch and earlier downloadable releases remain separate.

### Finer timing and optional speed tuning

The simulation clock is an integer count of tenths of a displayed tick. Configuration startup/recovery/window/status values remain in displayed ticks, preserving import compatibility. Startup rounds upward to the next tenth, minimum 0.1 unless explicitly zero; recovery rounds upward to the next tenth, minimum 3. Defense windows and statuses convert to internal units. Wait remains 5 displayed ticks. Slow affects newly scheduled actions, not existing commitments.

| Model | Physical startup speed before perks | Recovery reduction |
|---|---|---|
| Standard (default) | 1 + Agility / 100 | min(0.25, Movement / 400) |
| Stronger (experimental) | 1 + 0.02 × (Agility − 1) | min(0.40, (Movement − 1) / 200) |

Both models use finer timing. Select a model per character in Characters. Aetherical startup speed remains 1 + Control / 100 before perks. These settings are experiment controls, not point-bought advantages. Applied → Draft attributes reflect the selected model.

Passive Focus, DOT, regeneration and resource perks apply one tenth of their per-tick amount each internal step. Status damage resolves before healing and cannot resurrect a KO. Pool values retain nine decimal places to prevent accumulation of floating-point residue; UI values are abbreviated. Defense expiry is now a scheduled event. Next event and Auto skip internal steps while preserving depletion/KO checks. Animation/playback speed does not set combat time.

### Technique use capacity

Normal attacks have unlimited uses and retain their energy costs. Existing basic Guard, Evade, Charge and stamina recovery also default to unlimited. Ducha Sagrado starts with limited uses: base 3, cap 20, one extra use per 10 above-baseline Flow points. Haru's preserved Flow 11 therefore grants 4 uses. No artificial weak fallback attack is added to this release: the unlimited Normal attacks remain available whenever affordable.

For an eligible limited move:

`weighted investment = [Flow weight × (Flow − 1) + Endurance weight × (Endurance − 1)] / total weight`

`max uses = min(cap, base uses + floor(weighted investment / growth interval))`

Zero total weight gives zero investment, allowing fixed-use techniques. Resource weights are independent of damage channels and startup weights. The editor exposes limited/unlimited, base, cap, growth interval and both weights for non-Normal options. Base/growth/cap are integers; cap must cover base. Normal attacks cannot be assigned a limit. No Ultimates are added to the Episode I catalog.

A use is spent on commitment and remains spent after a miss, stagger or interruption. Starting a new spar restores all uses. Use counts appear on limited action buttons and in the selected-action panel. Exhausted actions remain visible with an explanation. There is no passive use recovery or campaign persistence.

### CPU commitments and Insight

When both sides are ready, the CPU selects and locks before the player confirms. Previewing player buttons does not change its choice. On a later CPU decision opportunity, it can respond to an already committed player action using its existing reactive policy. Committed moves do not automatically change. A direct player commitment also triggers a ready CPU choice first, so the ordering is not dependent only on rendering.

Insight is an independent editable character rating (0–4), default 2, and consumes no stat points. In player-vs-CPU mode, the selected player's rating controls their view. CPU behavior itself uses the existing reactive policy; its own Insight rating is not yet an AI-perception restriction. Selecting that character as the player uses its rating normally.

| Tier | Pending enemy information |
|---|---|
| 0 | Preparing an unknown action; recovery is also unquantified |
| 1 | Approximate startup within a two-tick range |
| 2 | Exact remaining startup and scheduled readiness/recovery completion |
| 3 | Timing and technique identity |
| 4 | Identity/timing plus conditional current-defense damage and potential effects |

Predictions are not guarantees: defenses, states and interruption can change the result. History becomes explicit once actions resolve or are interrupted. Unresolved CPU commitment names, costs and timestamps are redacted in event entries until resolution/interruption or match end. At Insight below 3, opponent energy bars show the last values before its pending commitment, with a visible explanation; this prevents costs from directly revealing the technique. Live HP remains visible. History snapshots remain read-only and use the same intent visibility rules. Manual lab mode is explicitly full-information.

This is presentation behavior in an offline local prototype, not a network security boundary. No private multiplayer choice screen or ranked rules are introduced.

### Per-technique disruption, without tier-wide perks

Normal/Heavy labels do not automatically grant special effects. Existing Focus-loss-on-hit parameters remain. New optional fields default to zero across all four builds:

- Startup delay (Stagger): after a positive-damage hit, add the configured ticks to an enemy's still-pending action and its readiness. Each commitment can be delayed this way once.
- Startup interruption power: after a positive-damage hit, cancel a still-pending action only if interruption is enabled for that target move and attacking power is strictly greater than its interruption resistance.
- Startup protection: each technique has an interruptible toggle (default true) and resistance (default zero). If interruption fails and a delay is configured, that delay may still apply. The toggle protects against this specific cancel mechanic, not delay or the separate Stun status.

Interruption retains already-paid resources, spent uses and the originally scheduled recovery. It grants no free immediate turn. Successful interruption takes priority over delay. Hits at the exact same resolution time trade; neither retroactively cancels the other's resolved attack. Stun remains the separately configurable status from v0.10. Focus disruption removes stored Focus but does not invalidate an already-funded move. No Move Cancel, guard-pressure or automatic anti-stun system has been introduced.

### Saving, validation and verification

v0.11 exports include Insight, speed model, use-capacity configuration and disruption/protection fields. v0.9 and v0.10 imports migrate while preserving existing allocations and move/perk/status parameters. Drafts never mutate a live fight. Export before closing; there is no autosave. Match setup remains accessible during and after combat.

Validation covers base pools/budgets, mixed damage, zero-time defenses, simultaneous trades, all 12 baseline pairings and all 12 author-build pairings, timing/rate conversion, precise defense expiry, uses/weighted scaling/caps/reset, CPU locking, Insight redaction and reveal, interruption resistance/ties, Focus independence and migration. Simulated-DOM checks cover the new controls, JSON round trips, high/low Insight views, history and matchup switching after KO. Rendered-browser visual verification remains outstanding.

### Deferred work and study interpretation

The prior 14,976-fight study tested older limited-Normal proposals and remains a historical experiment, not validation of this exact release. It informed finer timing and selective limits. Keep HP scaling unchanged while testing this release. Character-specific perks and advantages will be authored technique by technique. Guard pressure, advanced cancels, more sprites, AI Insight modeling, Spirit scaling, form-family stacking and Prestige remain future work. No claim of solved competitive balance is made.

## v0.10 — Historical Episode I rules and author builds

This release uses the author's uploaded LoU-Episode1-builds-v0.9.json as its initial configuration. All original levels, stats and move fields are preserved exactly. New formulas change derived pools, speed and damage. New perks and statuses start empty; no unapproved canon ability is assigned. v0.9 and the adult v0.8 HTML remain separate releases.

### Point economy and scaling

Budget is now 1 + 10 × (level − 1). Nine baseline stat units plus one discretionary level-one point give ten total units. Every previously fully allocated build gains one unspent point, without redistributing anything. Baseline 1, stat cap 120 and maximum test level 100 remain.

| Attribute | Current formula |
|---|---|
| HP | 100 + 25 × (Vitality − 1) |
| Aether | 100 + 10 × (Flow − 1) |
| Stamina | 100 + 5 × (Endurance − 1) |
| Melee potency | 10 + 5 × (Strength − 1) |
| Aetherical potency | 10 + 5 × (Control − 1) |
| Physical startup speed | 1 + Agility / 100, before perks |
| Aetherical startup speed | 1 + Control / 100, before perks |

The +25 HP increment was selected from the author's proposed 20/25 alternatives. Melee potency also moves to five-point increments, replacing 10 + 2 × Strength; this is a balance change. Constitution, Focus, retention and Movement formulas otherwise remain as in v0.9. Control retains its Focus-cost/retention functions alongside casting speed and aetherical potency.

Aetherical raw damage = flat aetherical damage + aetherical coefficient × potency, then applicable damage bonuses. Physical damage retains the matching flat-plus-melee-coefficient structure. Imported moves with positive aetherFlat gain an editable coefficient of 1; other moves gain 0. Existing flat values and costs are untouched. Setting coefficient to 0 makes a move flat-only. Coefficients and timing weights are independent.

### Preserved author allocations

Stat order: Flow, Flux, Control, Strength, Constitution, Vitality, Movement Speed, Agility, Endurance.

| Character | Level | Supplied stats | Unspent now | HP / Aether / stamina |
|---|---:|---|---:|---|
| Akira | 2 | 11, 1, 1, 1, 1, 1, 1, 1, 1 | 1 | 100 / 200 / 100 |
| Haru | 16 | 11, 30, 1, 25, 25, 51, 1, 1, 14 | 1 | 1350 / 200 / 165 |
| Felix | 35 | 36, 55, 35, 42, 50, 81, 10, 9, 31 | 1 | 2100 / 450 / 250 |
| Lesser Demon Wolf | 8 | 1, 1, 1, 20, 10, 6, 10, 15, 15 | 1 | 225 / 100 / 170 |

These remain author-selected lab builds, not numerical canon levels. The application preloads them; Refund all stats remains available. initial-configuration.json contains the converted build, and author-builds-v0.9.json retains the exact input. default-configuration.json remains a blank, baseline-one option.

### Perk editor

The new Perks page allows up to 12 enabled/disabled, named passives per character. Types: HP/Aether/stamina recovery per tick; physical/aetherical damage bonus percentage; physical/aetherical defense percentage; physical/aetherical startup-speed percentage. Same-type perk values add; amounts range 0–1000. Recovery has no implicit cost and is capped by the resource maximum. Damage perks multiply the matching complete damage component, including its flat portion. No perks are preassigned.

### Status editor and resolution

Each move can contain up to 12 named, toggleable status definitions: Bleed, Burn, Stun, Regeneration, Damage boost and Slow. Choose target self/opponent, duration 1–300 ticks and amount 0–1000. Stun uses duration rather than amount. Trigger is On damaging hit (attacks only, requires positive post-defense damage) or On resolution (including through defense).

One active status per type per character. Reapplication retains the greater amount and later end time; it does not create unlimited stacks. Different types coexist, so Bleed and Burn can both tick. Status badges show names, types and remaining ticks.

- Bleed/Burn: direct HP damage per tick, bypassing defense and block. Regeneration: flat HP recovery per tick. Periodic effects start on the tick after application and include their final tick before removal.
- Periodic damage resolves before healing. Dead actors cannot heal; both actors' periodic damage is processed before the knockout result. The engine checks internal ticks and stops exactly at lethal damage, even during a long startup/recovery interval.
- Stun: clears defensive windows, cancels pending startup without refunding commitment costs, and blocks new actions until expiry. Any longer existing recovery is retained. Same-tick attacks still trade; their statuses apply afterward.
- Damage boost: multiplies both channels after permanent damage perks. Slow: multiplies startup/recovery of newly committed moves, without retroactively rescheduling existing moves. Nonperiodic statuses expire before actions at their ending tick.
- Direct action restoration remains separate. Resource gains/losses are capped and logged. Recurring changes are grouped by actor, resource, sign and cause, with tick ranges retained in expanded details.

### Matchup switching and saves

Match setup is now directly at the top of the Spar page, including after a knockout. Change either character or control mode, then Apply drafts & start spar. Builds persist while the fight/history reset. Mirror matches and manual two-side control remain supported. Existing navigation and stat/technique setup controls remain.

JSON exports are v0.10 and include perks/statuses. The importer accepts v0.9 or v0.10, validates new fields, preserves original v0.9 fields and adds new defaults during migration. Draft imports/edits do not mutate a live fight. No automatic save or live-fight JSON import is added.

### Validation and limits

Passed: exact preservation of supplied stats/move fields; level-one point; revised pool/potency formulas; Control casting/potency; additive perks; status refresh and conditional application; stun interruption; tick-accurate damage/recovery/no resurrection; resource caps and causes; JSON round trips and invalid effects; twelve blank-build and twelve supplied-build matchups. Simulated-DOM tests cover effect/perk editing and saving, normal menus, and selecting a different matchup after an actual knockout. A rendered browser is still unavailable; human visual/input playtesting remains needed.

The prior nine-stat tree, attack categories, two-actor scope and v0.9 visuals are retained. No new canon Arts, animations, multi-enemy encounters, forms, Ego or Spirit systems are added. Core capacity remains absent. The older branch descriptions below are historical references where they differ from this section.

---

## v0.9 — Episode I tuning lab (historical branch)

The author requested an editable combat test for Akira, Haru, Felix and the Lesser Demon Wolf, with unallocated stats and 100 base HP, Aether and stamina. This release implements a separate two-character spar and parameter editor, not the scripted escape episode. The adult v0.8 HTML remains unchanged.

### Stats and pools

All nine exposed stats begin at the free baseline 1. No points are preassigned. Test levels: Akira 2 (10 points); Lesser Demon Wolf 8 (70); Haru 16 (150); Felix 35 (340). Level is editable 1–100, budget is 10 × (level − 1), stat cap 120. Lowering a level does not silently refund stats; an over-budget draft must be corrected before starting. Refund all stats returns that character to baseline.

- HP = 100 + 24 × (Vitality − 1).
- Aether = 100 + 8 × (Flow − 1).
- Stamina = 100 + 6 × (Endurance − 1).
- Other Focus, Control, melee, Constitution and Movement formulas retain their baseline v0.8 values. Agility speeds physical startup. Aetherical startup is 1× for every Episode I character; the adult Akira casting bonus is not carried over.
- Startup uses editable physical/aether timing weights; zero/zero fixes speed at 1. Recovery depends on Movement, minimum 3 ticks. No active forms or form speed bonuses exist here.
- Current → proposed attributes compare the last applied character build with the draft. Draft edits and imports do not change an ongoing fight.
- Willpower, Introspection, Core and Spirit contributions are absent from the Episode I interface and calculations. The same exact 100 starting pools apply to each character. All pools are shown for tuning.

### Included actions and editor

| Character | Normal attacks | Heavy attacks | Support |
|---|---|---|---|
| Akira | Desperate strike (proposed label) | None | Guard, Sidestep, Catch breath; Charge initially unequipped |
| Haru | Protective Strike, Espada Santa | Ducha Sagrado | Guard, Sidestep, Charge, Catch breath |
| Felix | Unnamed hand-wave attack | None | Deflect, Sidestep, Charge, Catch breath |
| Lesser Demon Wolf | Bite, Pounce | None | Backstep, Recover; Guard and Charge initially unequipped |

All included options can be equipped for lab experiments without story/level gates. This is not a claim that every generic support option is a demonstrated canon ability. Normal/Heavy are fixed categories and do not confer hidden damage multipliers. Each move is a unique known entry; this release edits parameters, not catalog size or move types.

Editable fields: display name and description, equipped flag, raw Focus/Aether/stamina cost, startup/recovery, physical/aetherical timing weights, flat physical damage, melee coefficient, flat aetherical damage, separate defense bypass percentages, Focus loss on hit, area flag, separate physical/aetherical block percentages, evade percentage and duration, charge gain multiplier, and optional HP/Aether/stamina restoration. Applicable fields are shown by action kind; recovery is under optional effects.

Physical damage = flat physical + coefficient × melee potency. Aetherical damage = flat aetherical potency. Each component uses its matching defense; the total is rounded once. Guard uses independent block percentages; single-target Evade uses its percentage, while area attacks retain 65% damage. Evade is consumed once by the incoming attack. Control reduces involuntary Focus loss. There are no hidden damage perks or automatic HP/stamina/Aether regeneration.

Initial move numbers are intentionally editable placeholders. In particular, Felix's hand-wave mechanism is unspecified in Episode I; the initial aetherical classification is not canon. Protective Strike starts physical-only without asserting that the final author-approved Art lacks an energy component. Haru's canon ×1.1/×2 Yield multipliers are not applied as direct game damage coefficients.

### Fight, history and saved configurations

Choose any left/right character, including a mirror match. Control the player against deterministic AI or manually control both sides. The AI announces its commitment. Starting a new fight copies builds and edits, resets resources and starts at tick zero. Every ready actor must commit or Wait before time advances. Wait is a five-tick, no-cost lab fallback when edited costs leave no legal action.

Commitment spends resources immediately. Effects resolve after startup; another action requires recovery to finish. Same-tick defensive actions resolve before attacks; simultaneous damaging hits can produce a double knockout. Defense windows expire at their ending tick or on the next commitment. Recovery effects resolve with the action and are capped at maximum pools. Passive Focus accrues while Aether remains, without an additional Aether drain, matching the earlier baseline behavior.

Next event advances to an action resolution or readiness event. Auto pauses for a player decision. History groups resource changes while preserving individual causes/calculations and immutable snapshots. Snapshot inspection never re-runs or changes the live fight.

Save/load JSON includes all four levels, stat allocations and edited move fields. Import validates budgets, ranges, categories, IDs and text; incompatible adult v0.8 JSON is rejected. No auto-save or combat-state import is provided. Export before closing. All code and the reused Akira portrait are embedded in the standalone HTML.

### Scope and verification

The source basis is the prior Episode I draft: Arc I compiled PDF pages 1–9 and Haru's two Art entries in Misc. No new literature claim or sprite generation is made in this release. Akira uses the existing child guard portrait; the other portraits are labeled placeholders. Combat uses resource/intent cards rather than newly animated action sprites.

No scripted Haru death, Felix invulnerability, escape objective, pack-pressure system, extra targets, range, Forms, Ego, Spirit sharing or move cancels is implemented in this branch. Area is an evasion flag in a one-opponent test, not a multi-target simulation.

Validated by Node: exact baseline pools, all unspent budgets, user-specified attack tiers, mixed defenses, cost independence, same-tick guard, double knockout, capped recovery, stat/parameter cloning, JSON round trips and invalid import rejection, resource bounds, and twelve complete simulated matchups. Simulated-DOM tests cover allocation, arrows, technique edits, loading, combat controls, eight resource bars and read-only snapshots. A rendered browser was not available; visual/input playtesting remains necessary.

Source package: engine.js, app.js, styles.css, template.html, build.cjs, tests and default-configuration.json. Build with node build.cjs. The detailed adult rules below remain the v0.8 branch reference only.

---

## Retained adult v0.8 specification

## Start here

Open index.html. Both adult characters are assigned test level 100 and start at 1 in every stat with 990 unspent points. Edit either character. Use previous stats restores that character's v0.5/v0.6 numerical spread at level 100 while retaining their current loadout. Refund all stats returns their full point budget.

Choose equipment in Loadout, resolve any prerequisite messages, then Start spar with both builds. A spar copies both drafts and starts in base. Changes made in the builder never alter that live match. You may leave points unspent. Switching to a lower level refunds all stats and fits the standard starter loadout to the new slot limits.

Save / load builds exports both characters as JSON, or accepts pasted/uploaded JSON. Imports require legal budgets and equipment. No automatic browser storage is used; export before closing if you want to keep your changes. Exports contain builds, not combat saves or event history.

## Levels and stats

These levels are game-design proposals, not canon character levels. Level range 1–100. Each stat has a free baseline of 1 and a cap of 120. Available allocation budget = 10 × (level − 1). Each increase of one stat costs one point. Baseline values do not consume the allocation budget.

The earlier adult stat spreads remain templates; their leftover points are available to assign. Lower-level previews retain the adult technique catalog ; they model slot/stat progression, not the character's actual chronological abilities at that age or point in the story.

| Attribute | Formula before forms |
| --- | --- |
| Health | 500 + 24 × Vitality |
| Native Aether | 40 + 8 × Flow |
| Shared Aether | Native + linked Spirit contributions |
| Stamina | 40 + 6 × Endurance |
| Maximum Focus | 3 + floor(Flux / 8) |
| Starting Focus | 1 + floor(Flux / 16) |
| Active Focus gain | 1 + Flux / 16 |
| Passive Focus / tick | Flux / 800, subject to funding/caps |
| Focus retention | Control / (Control + 40) |
| Melee potency | 10 + 2 × Strength |
| Physical / Aether defense | 2 × Constitution / Constitution |
| Physical attack speed | 1 + Agility / 100 |
| Movement recovery reduction | min(25%, Movement Speed / 400) |

Non-form positive Focus costs retain max(1, ceil(raw Focus / (1 + Control / 100))). Form Focus costs are fixed. Actual timings retain the preceding speed, recovery and form rules. The selected combat action previews costs/timing after your stats and current forms are applied.

## Slot progression

| Group | Initial capacity | Additional unlocks |
| --- | --- | --- |
| Normal attacks | 2 | Third at level 20 |
| Heavy attacks | 1 | Second at level 35 |
| Ultimate | 0 | One at level 60 |
| Guard | 1 | Basic Guard occupies this slot |
| Standard evade | 1 | Evasive step occupies this slot |
| Advanced defense | 0 | One at level 30 |
| Charge / stamina recovery | One each, fixed | Always equipped |
| Additional Utility | 1 | Second at 25, third at 50 |
| Prepared forms | 0 | Two at 20; third at 40; fourth at 60; fifth at 80 |

These level gates stand in for future story/quest unlocks. No quest system or earned progression is implemented. All catalog candidates within an unlocked group are available to choose, subject to the prerequisites below. A technique is equipped only once. Quick strike must occupy a Normal slot as a no-Focus/no-Aether fallback; it still costs stamina.

Physical and aether attacks share Attacks. The prior Arts and Ego & Spirit categories are removed. Retained support techniques use Utility. Signature remains a conceptual identity tag, not an extra slot or implemented power tier.

## Requirements and form preparation

- Astral Substitution requires Astra Eidolon Array equipped.
- Protos and Supernova require Nebulus equipped.
- Sunburst requires Photoreception equipped.
- Infuscate II requires Perfect Demon Form 3 equipped.
- Exponential 7 requires Exponential 1 equipped; Exponential 12 also requires 7. The three magnitudes occupy three prepared slots but count as one main-form family.
- At most two main-form families can be prepared. The prototype's main-family tags are SR, USR, Exponential, Photoreception, PDF3 and DDSR. These are provisional loadout classifications, not definitive canon taxonomy.
- Prepared options do not automatically activate or stack. Existing v0.6 slot/exclusion rules still govern active layers; a fuller canon compatibility mapping remains future work. A five-slot loadout necessarily trades off some of the earlier unrestricted stress-test stack.
- Dragon Festival gains familiarity by witnessing incoming energy Arts. Experimental Read, Ego pressure, Recenter and Ego brace are absent from the selectable catalog.

The empty-choice option is available in nonessential slots. Missing or incompatible prerequisites block starting a spar rather than silently adding free techniques. Having sufficient resources to use an equipped action is checked during combat; a legal build can still lack enough Focus to activate an expensive form until its stats improve.

## Optional Spirit scaling

Ego stats and the Spirits section unlock at test level 40. Linked share = min(0.90, (0.65 × Introspection + 0.35 × Willpower) / 120 × 0.90). The linked contribution of each Spirit is round(reserve proxy × linked share).

| Character / source | Reserve proxy |
| --- | --- |
| Akira / Spirit of Utopia | 720 |
| Akira / Helios | 600 |
| Rikito / Lunario | 980 |

Core is another term for Spirit pools, not an additional capacity source. The previous separate +240 on Rikito has been removed, not transferred to Lunario. Total Aether is native capacity plus the linked contribution from each Spirit exactly once. Disabling Spirits leaves native capacity only. With the previous adult stat template, Rikito now has 1,432 total Aether (760 native + 672 linked), down from 1,672. At all stats 1 he has 55 with Spirits, or 48 without. Akira's template remains 1,598.

Introspection 40 enables passive perks. Perk strength = linked share / 0.90. Akira's Utopic healing scales up to 0.20 HP/tick, and Helios recovery up to 0.35 Aether/tick in sunlight. Rikito's reduction to involuntary attack-related Focus loss scales up to 15%. Healing/recovery are capped by resource maxima and retain funding requirements. Introspection 60 allows equipping Spirit-flagged techniques and Solar/Lunar blessings. Spirit techniques retain their previous active effect values; this release scales capacity and passive perks, not every individual technique.

Disabling a character's Spirits removes their linked capacity and passive perks. Equipped Spirit actions must be removed before starting. The UI shows each reserve and its resulting contribution. These numbers and gates are provisional, not a claim about canon Spirit stats.

## Will and hidden systems

Willpower remains an assignable attribute that helps Spirit sharing. No independent Will energy resource is used. Form/Art Will costs and Will upkeep are zeroed in the build adapter, and no Will meter is shown. Move Cancel costs 3 Focus with the earlier Agility 85 requirement and cooldown, with no Will payment.

Below level 40, Ego stats and Spirit controls are hidden. Below level 20, Forms has no prepared slots and is absent from the combat menu. Having no prepared forms also hides that category. The builder shows only unlocked slot groups. This does not implement a full per-technique story-unlock tree.

## Source handoff

- high-data.js retains the baseline source catalog. build-rules.js defines tiers, budgets, slots, gates and validation.
- build-duel.js adapts the base engine: installs chosen stats, removes experimental moves/Will costs, limits available actions and applies Spirit sharing.
- high-engine.js remains the underlying tick engine. Its optional bond hook supports the new passive scaling. Some unused legacy effect handlers remain internal; they cannot be equipped in this release.
- high-ui.js contains the draft builder and combat UI. high-view.js retains grouped history totals. high-lab.html/css contain layout.
- balance-data.json is the adjusted v0.8 runtime catalog snapshot, generated from baseline-stat drafts; it is not an importable player save. Use Save / load builds for player JSON.
- Run node build-high.cjs after edits. It embeds the existing assets and regenerates index.html, combat-fragment.html and balance-data.json.

## Earlier release summary

v0.7: Added editable level/stat budgets, live derived attributes, slot-based loadouts, prerequisite validation, per-character Spirit scaling, JSON transfer and equipped-only combat. Combined attack categories; moved support techniques to Utility; removed experimental Ego actions and Will spending; hid locked systems. Retained the v0.6 resource-bar layout and history summaries.

v0.6: Streamlined panels and moved history to its own page with grouped upkeep, boons/flaws and expandable source causes.

v0.5: Introduced recovered adult Arc IV kits, stacking, Spirit capacity, advanced interactions and provisional adult sprite assets.

## Verification and limits

Run node test-build.cjs and node test-build-ui.cjs from this folder. Tests cover budgets, dependencies, form-family limits, Spirit scaling/gates, equipped-only actions, draft isolation, complete AI-driven duels, UI editing, hidden systems and JSON validation. The UI test uses a simulated DOM, not a rendered browser. Human browser/animation testing and balance work remain necessary. No new canon research or sprite generation was performed for v0.7; it reuses the preceding source-based catalog and visuals.


## v0.7.1 — Attribute comparison

The stats page now shows current → proposed base attribute values. Current is the character build applied to the combat engine, not its remaining HP/resources or active forms. Proposed is the editable draft. This baseline changes only when a new spar applies the drafts. Values display up to four decimal places so small passive gains remain visible. Added Focus-cost-factor and Spirit-link/perk-strength comparisons. No combat formulas or slot rules changed. Transformation-family consolidation is deferred until the author supplies the detailed form parameters.


## v0.8 — Independent Art components and merged Spirit capacity

Core capacity has been removed from calculations, current/proposed attribute comparisons, the Spirits panel and the runtime catalog. The internal form compatibility group formerly named core is now transformation; this rename does not change stacking.

An Art can combine physical damage, aetherical damage, resource costs, timing and utility effects independently. Spending Aether does not automatically add aetherical damage, and a physical-looking attack can have explicitly assigned aetherical damage. The existing catalog keeps its previous coefficients and damage channels; assigning specific mixed splits awaits the author's move parameters. No new live technique has been given an invented physical/aetherical split.

### Damage schema and calculation

`art-model.js` is shared by action previews and resolution. Each move has a `components` array. Each component has `channel` (physical or aether), `flat`, `melee`, `penetration` and optional `divine`. Its pre-defense potency is `(flat + melee × base melee potency) × matching form ATK`. Existing clone bonuses apply to physical components; explicitly divine aether components receive the retained 1.08 factor. Setup bonuses retain their existing values and are consumed once at commitment.

Each component is mitigated independently: `damage = raw × 100 / (100 + matching defense × (1 − penetration))`. Physical uses physical DEF; aether uses aether DEF. Guard applies its existing 0.4 factor to both. Evade is consumed once per whole attack (zero damage, or the retained 0.65 factor for area attacks). Lunar Reflection reacts only to non-area aetherical components: it halves that component and returns 40% of its pre-reflection, post-defense/guard/evade value. Physical components continue normally. Remaining component damage is summed and rounded once before a single capped HP deduction. Simultaneous hits retain the existing resolution rules.

The selected action shows unguarded damage, expandable component values, costs and timing basis. Preview damage is an estimate before temporary defense reactions. History retains one total damage entry, with component details in the raw explanation rather than duplicating the total in the summary.

### Costs, timing and effects

- Focus, Aether and stamina costs are independent of damage channel. No Will resource or costs are added back.
- `sealEligible` controls suppression; `efficiencyEligible` controls Divine Pressure's 15% Aether-cost reduction. Neither depends on spending Aether. Their initial values preserve the previous catalog's eligibility.
- `timing` has physical and aether weights. A positive sum normalizes them. Physical startup speed uses `(1 + Agility/100) × physical form SPD`; aether startup speed uses aether form SPD × the retained Akira 1.15 casting factor (Rikito 1). Mixed timings average those speeds by their weights. Zero/zero means fixed speed 1.
- Recovery uses the weighted form speed, then Movement's reduction; it does not get another Agility startup bonus. Startup is rounded up to at least one tick when nonzero; recovery is rounded up to at least three ticks. Existing Slow applies its 1.25 delay factor.
- Support effects remain explicit effects. An aura or Aether cost alone grants no extra damage, healing or status.
- Forms independently multiply physical/aether ATK, SPD and DEF. Active form multipliers multiply together; upkeep, healing and strain add. Base multipliers remain visible as ×1.00. No universal mixed-attack multiplier is added.

### Stat responsibilities and unimplemented ideas

Flow supplies native capacity; Flux supplies Focus capacity, starting Focus and gain; Control supplies retention and non-form Focus efficiency. Strength supplies melee potency. Constitution supplies both defense ratings. Vitality supplies maximum HP. Movement reduces recovery; Agility improves physical startup and gates Move Cancel. Endurance supplies stamina. Willpower and Introspection currently govern optional Spirit sharing, with Introspection also gating perks and techniques. There is no independent Arts-skill progression, trainable energy-potency stat, automatic stat-based HP/Aether/stamina regeneration, or usable Will pool in this build. Recovery only comes from explicit implemented effects.

Spirit Resonance remains creamy white; Rikito's demon treatment remains violet. Existing action animations, two-character combat display, category navigation and action previews are retained. Energy bars remain directly under health. Event stepping, replay snapshots and grouped form-upkeep/boon/flaw summaries retain detailed causes in expandable history. Replay never rewinds or changes the live fight.

Transformation-family consolidation (SR to higher ascensions, Exponential magnitudes and Demon levels sharing one prepared slot) is recorded as deferred, pending the author's parameters. Current stage slots and compatibility still apply. Story/trainer breakthroughs and training are design goals; current level gates only simulate their progression constraints.

### Verification for this release

Node checks cover component mitigation, mixed timing/cost independence, form-channel separation, partial reflection, Guard/Evade, one damage ledger entry, corrected capacity, build budgets, slot prerequisites, draft/application isolation, imports, hidden systems, attribute previews, history reconciliation and complete simulated matches. A synthetic mixed move is used in tests only. UI checks use a simulated DOM; rendered browser appearance and animation timing still need human playtesting.

The current source handoff adds `art-model.js`. Edit source files then run `node build-high.cjs`; generated HTML embeds assets and needs no server. Player JSON transfers builds, not move definitions or fight history; existing version-7 build JSON remains compatible. `balance-data.json` is a generated runtime reference, not a player save. The underlying legacy engine retains some unused Will/Ego handlers, but `BuildDuel` removes their availability and costs from this menu.


## Runtime catalog snapshot

Generated from v0.8. Costs here are raw Focus/Aether/stamina; Control, current forms and stats modify the combat preview. Startup/recovery are base ticks. Damage coefficients are pre-form, pre-defense. Eligibility and detailed flags are in balance-data.json.

| Technique | User | Category | F/A/S | Startup/recovery | Components | Effect / description |
|---|---|---|---|---|---|---|
| Quick strike | both | Attacks | 0/0/8 | 6/10 | physical: 0 + 0.75 × melee | Cheap pressure; no interruption. Physical startup scales with Agility. |
| Heavy strike | both | Attacks | 0/0/20 | 12/18 | physical: 0 + 1.4 × melee | Slower physical hit with Focus pressure. |
| Dragon’s Barrage | akira | Attacks | 1/10/24 | 10/16 | physical: 0 + 1.5 × melee | Multi-strike animation represented by one combined damage event. |
| God Breaker | akira | Attacks | 3/45/20 | 12/20 | physical: 0 + 2 × melee | Blue aether-coated strike; ignores 30% of defense rating (test interpretation). |
| Utopic Star Destroyer | akira | Attacks | 3/35/0 | 16/20 | aether: 150 + 0 × melee | Go-to golden beam; efficient with Control and Divine Pressure. |
| Star Breaker | akira | Attacks | 6/80/0 | 26/27 | aether: 330 + 0 × melee | Heavy gold beam; forces involuntary Focus loss after retention. |
| True Utopic Stardust Breaker | akira | Attacks | 10/155/0 | 34/34 | aether: 650 + 0 × melee | Late Arc IV finisher. High impact and meaningful commitment. |
| Nebulus | akira | Utility | 2/35/0 | 10/14 | None | Prepare stardust for Protos or Supernova. Lasts 80 ticks. |
| Protos | akira | Attacks | 3/50/0 | 4/14 | aether: 200 + 0 × melee | Fast lesser-star attack requiring a prepared Nebulus cloud. |
| Supernova | akira | Attacks | 8/130/0 | 30/30 | aether: 480 + 0 × melee | Heavy stellar orb; area impact only partly evadable. This test consumes it as an attack, never also as fuel. |
| Sunburst · Last resort | akira | Attacks | 12/200/0 | 40/50 | aether: 1300 + 0 × melee | Requires Photoreception. Empties aether and KOs the user at impact, even if evaded. Deliberately sacrificial; may end in a draw. |
| Deep Crash | rikito | Attacks | 0/0/17 | 10/15 | physical: 0 + 1.35 × melee | Reliable physical entry. |
| Abyssal Ruination | rikito | Attacks | 3/40/24 | 12/19 | physical: 0 + 2.05 × melee | Lightning-cloaked rush; fast pressure with a stamina commitment. |
| Black Lightning | rikito | Attacks | 2/28/0 | 12/15 | aether: 125 + 0 × melee | Low-cost dark lightning. Useful when expensive finishers are unsafe. |
| Dark Lightning Cannon | rikito | Attacks | 3/38/0 | 18/20 | aether: 170 + 0 × melee | Go-to ranged pressure. |
| Abyss Breaker | rikito | Attacks | 6/85/0 | 26/27 | aether: 340 + 0 × melee | Dense black-violet orb and Focus pressure. |
| Ruination Cannon | rikito | Attacks | 9/145/0 | 33/32 | aether: 610 + 0 × melee | Major beam finisher. Benefits from prepared Midnight and Archaic. |
| Dark Ruin | rikito | Attacks | 5/85/0 | 22/25 | aether: 150 + 0 × melee | Damaging ruin field: +25% new action timings for 24 ticks. Existing commitments are unchanged. |
| Midnight | rikito | Utility | 2/35/0 | 7/10 | None | Next dark attack within 60 ticks gains ×1.30 damage. Consumed on commitment. |
| Archaic | rikito | Utility | 3/55/0 | 9/13 | None | Next finisher within 60 ticks gains ×1.35 damage. Can combine with Midnight. |
| Guard | both | Defense | 0/0/10 | 0/14 | None | Take 40% damage for 18 ticks. A new commitment ends Guard; Ego pressure is separate. |
| Evasive step | both | Defense | 1/0/22 | 2/14 | None | Evade one hit for 16 ticks. Area attacks still deal 65% damage. |
| Dragon Shift | akira | Defense | 2/24/0 | 2/12 | None | Teleport evasion for one incoming hit. Area attacks still partly connect. |
| Astra Eidolon Array | akira | Utility | 3/60/0 | 9/14 | None | Create two pre-existing clones for 50 ticks. Physical attacks gain 15% per clone; substitution consumes one. Excludes Exponential states. |
| Astral Substitution | akira | Defense | 1/12/0 | 1/10 | None | Consume an existing clone to enable a one-hit evasive swap. Cannot create a clone by itself. |
| Dragon Festival | akira | Utility | 5/110/0 | 16/22 | None | Requires 2 signature familiarity. Cancel an enemy pending Art, then suppress their Arts for 20 ticks. Not an Ego attack. |
| Blessed Kiss · Infinite Regenerations | akira | Utility | 3/70/0 | 8/18 | None | For 40 ticks, restore up to 1.8 HP/tick for 0.7 aether/tick. Costly regeneration, not immortality. |
| Solar Absorption | akira | Utility | 2/0/0 | 18/18 | None | Helios draws 180 aether from sunlight. 60-tick cooldown; unavailable in a sealed arena. |
| Lunar Reflection | rikito | Defense | 3/60/0 | 4/16 | None | For 20 ticks, halve the first non-area energy Art hit and return 40% of its pre-counter damage. Misc-listed counter; exact Arc IV placement and mechanics are provisional. |
| Moon Drip | rikito | Utility | 4/0/0 | 14/22 | None | Once per spar: restore 45% max aether, 30% max stamina and 15% max HP. Canon restoration compressed for this test. |
| Charge | both | Utility | 0/0/4 | 12/12 | None | Gain Flux-based Focus; cannot charge with zero aether or full Focus. |
| Catch breath | both | Utility | 0/0/0 | 16/16 | None | Restore up to 60 stamina. No aether or Will recovery. |
| Release all layers | both | Forms | 0/0/0 | 0/8 | None | Return to base and end all ongoing form upkeep. Temporary Arts remain until their duration ends. |
| Divine Pressure | both | Forms | 2/0/0 | 4/12 | None | Divine circulation: Art aether costs −15%. Efficiency aid, not a universal Divine prerequisite. |
| Spirit Resonance | both | Forms | 3/0/0 | 10/12 | None | Physical emphasis. Creamy-white aura. Replaces other soul-resonance states. |
| True God of Utopia | akira | Forms | 4/0/0 | 10/12 | None | Golden Utopic transformation; compatible with the war stack. |
| Utopic Spirit Resonance | akira | Forms | 3/0/0 | 10/12 | None | Soul Resonance layer; replaces SR or Exponential Spirit Resonance. |
| Golden Energy Mode · Layer Z | akira | Forms | 3/0/0 | 10/12 | None | Golden corona. Incompatible with Exponential Spirit Resonance and Photoreception mode. |
| Full-Powered Solar Pressure | akira | Forms | 2/0/0 | 10/12 | None | Helios’s blessing, not a Form. Compatible with either advanced Akira route. |
| Exponential Spirit Resonance · 1 | akira | Forms | 3/0/0 | 10/12 | None | First Magnitude. Removes GEM and clones; excludes new arrays. Requires an available environment. |
| Exponential Spirit Resonance · 7 | akira | Forms | 5/0/0 | 10/12 | None | Seventh Magnitude. Escalate from an active Exponential state; higher upkeep. |
| Exponential Spirit Resonance · 12 | akira | Forms | 6/0/0 | 10/12 | None | Twelfth Magnitude. 2.5 HP/tick strain. Requires Seventh Magnitude first; dangerous to sustain. |
| Photoreception · Earth’s Sun | akira | Forms | 6/0/0 | 10/12 | None | Natural-star route. Keeps only Divine Pressure and Solar blessing. Requires sunlight; not stacked with Exponential or GEM. |
| Perfect Demon Form · Level 3 | rikito | Forms | 3/0/0 | 10/12 | None | Demon transformation with dark sigils. Gentle test regeneration; not a Daimonblood/Satanic Form. |
| Divine Demonic Spirit Resonance | rikito | Forms | 3/0/0 | 10/12 | None | Soul Resonance layer; shares the soul slot with SR. |
| True Demonic Force | rikito | Forms | 3/0/0 | 10/12 | None | Deeper violet-black output; stacks with Demon Form and soul resonance. |
| Infuscate · Second Degree | rikito | Forms | 4/0/0 | 10/12 | None | Darkened frame and pale sigils in canon. Test prerequisite: active Perfect Demon Form. |
| Abyssal Lightning Cloak | rikito | Forms | 2/0/0 | 10/12 | None | Black-violet lightning coat for speed and physical pressure. |
| Full-Powered Lunar Pressure | rikito | Forms | 2/0/0 | 10/12 | None | Lunario’s blessing, not a Form. Silver-blue motes over the underlying stack. |

### Active form multipliers

Omitted multipliers default to 1. Costs below are per tick; activation Focus is fixed. Form names include techniques/states provisionally placed in the Forms menu. Prepared slots and compatibility are separate constraints.

| Form | Group | Physical ATK/SPD/DEF | Aether ATK/SPD/DEF | Focus | Aether upkeep | HP healing / strain |
|---|---|---|---|---|---|---|
| Divine Pressure | pressure | 1.08/1/1.1 | 1.08/1/1.1 | 2 | 0.5 | 0 / 0 |
| Spirit Resonance | soul | 1.5/1.2/1.3 | 1/1/1 | 3 | 0.6 | 0 / 0 |
| True God of Utopia | transformation | 1.35/1/1.25 | 1.5/1/1.25 | 4 | 1.4 | 0 / 0 |
| Utopic Spirit Resonance | soul | 1.35/1/1.15 | 1.2/1/1.15 | 3 | 1.1 | 0 / 0 |
| Golden Energy Mode · Layer Z | amplifier | 1.2/1.1/1 | 1.2/1.1/1 | 3 | 0.9 | 0 / 0 |
| Full-Powered Solar Pressure | blessing | 1.08/1/1 | 1.08/1/1.1 | 2 | 0.3 | 0 / 0 |
| Exponential Spirit Resonance · 1 | soul | 1.2/1.05/1 | 1.2/1.05/1 | 3 | 1.8 | 0 / 0 |
| Exponential Spirit Resonance · 7 | soul | 1.8/1.15/1 | 1.8/1.15/1 | 5 | 3.6 | 0 / 0 |
| Exponential Spirit Resonance · 12 | soul | 2.2/1.22/1 | 2.2/1.22/1 | 6 | 5.1 | 0 / 2.5 |
| Photoreception · Earth’s Sun | solarRoute | 2.2/1.25/1.5 | 2.5/1.25/1.5 | 6 | 2.2 | 0 / 0 |
| Perfect Demon Form · Level 3 | transformation | 1.4/1/1.45 | 1.3/1/1.45 | 3 | 1.2 | 0.12 / 0 |
| Divine Demonic Spirit Resonance | soul | 1.25/1/1.15 | 1.25/1/1.15 | 3 | 1 | 0 / 0 |
| True Demonic Force | amplifier | 1.2/1/1 | 1.2/1/1 | 3 | 0.8 | 0 / 0 |
| Infuscate · Second Degree | shroud | 1.1/1/1.1 | 1.15/1/1.2 | 4 | 1.4 | 0 / 0 |
| Abyssal Lightning Cloak | cloak | 1.15/1.2/1 | 1/1.05/1 | 2 | 0.8 | 0 / 0 |
| Full-Powered Lunar Pressure | blessing | 1.08/1/1 | 1.08/1/1.1 | 2 | 0.3 | 0 / 0 |


## Asset pass — Episode I action sprites v2 (16 September 2026)

- Corrected Felix’s idle: fixed lower body with coordinated upper-body breathing.
- Added action coverage for all 23 Episode I menu entries, preserving disabled lab-only entries as optional assets.
- Added hit, stagger, victory and defeat animations for all four characters, plus human combat-ready stances.
- Created golden blade and golden rain effects for Haru’s Espada Santa and Ducha Sagrado.
- Delivered 46 four-frame clips, PNG frames/strips, GIF previews and a standalone action viewer.
- Combat remains v0.11. Animation integration, multi-hit implementation and dedicated status overlays are still pending.

Animation timing is presentation-only; game events remain authoritative for hits and recovery. The pack preserves current move IDs and does not grant optional charge/guard actions. Haru’s wide Art frames require effect placement during combat integration.

## Asset fix — Felix idle waist seam (16 September 2026)

Replaced the split upper/lower-body translation with continuous row mapping. Breathing displacement tapers to zero at the waist; lower-body pixels remain fixed and the torso stays connected. Rebuilt the GIF, preview and sprite pack.

## Asset refinement — Felix whole-body idle (16 September 2026)

Supersedes both prior Felix idle fixes. Uses all four drawn poses at a shared scale with grounded alignment, allowing arms, torso, hips, knees and coat to move together. Removed the frozen lower-body mask and updated viewer text, animation files and pack.
