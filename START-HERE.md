# Lyte of Utopia — Coder handoff
Packaged 19 September 2026. This bundles existing work; it is not a new gameplay release.

## Start here
1. Open `02-Episode1/Combat-Lab-v0.11.html` in a desktop browser. No server or installation is required.
2. Read the current design record and changelog in `01-Records`. They are the authoritative master copies. Later entries supersede earlier ones within the same branch.
3. Open `03-Sprites/Action-Preview-v2.html` to inspect the latest animations. Extract the adjacent sprite ZIP for frames, strips, GIFs, manifest and build scripts. It includes the final whole-body Felix idle correction.
4. Edit the Episode I source in `02-Episode1/Source`; follow its README for rebuilding and tests.

## Versions and scope
- Episode I combat engine/menu: v0.11. Includes current author allocations, editable techniques/effects, limited non-Normal uses, finer timing, optional stronger speed scaling, Insight and CPU commitment.
- Episode I builds: v0.11 JSON. Export edits before closing the menu; no autosave. Older configurations in Source support migration tests.
- Sprite assets: action pack v2, latest Felix correction. 46 four-frame clips covering 23 menu entries plus stances and reactions. Optional lab-only clips do not enable disabled techniques.
- Adult build maker: v0.8. Separate branch for high-level Akira/Rikito, loadouts and forms. Its formulas are not automatically the Episode I formulas.
- Earlier standalone high-level combat: v0.6, retained as a distinct reference alongside the newer adult build maker. The duel sprite pack is supporting historical art.
- Balance studies: earlier experimental evidence and proposals, not additional live rules.

## Work still pending
- Connect the new sprite animations to combat events. The v0.11 menu does not already contain the new action pack.
- Implement the proposed multi-hit toggle/interval rules after final parameter decisions; currently documented, not implemented.
- Separate wide Art effects from character placement as needed; use combat event timing to drive damage rather than GIF playback duration.
- Add dedicated status overlays if desired; hit/stagger/victory/defeat assets already exist.
- Perform in-browser integration testing after changes. Existing simulated-DOM tests do not certify rendered visuals.

## Reading historical records
The master record is chronological and retains superseded ideas, including the two earlier Felix idle fixes. The final whole-body idle entry overrides those fixes. Records inside older adult/study packages describe their original branch snapshots; use 01-Records for the latest overall status.

## Contents
01-Records: current changelog and design record.
02-Episode1: current playable HTML, builds, editable source and tests.
03-Sprites: latest preview and full asset archive.
04-Adult-Reference: adult builder, high-level menu, source packages and duel art.
05-Balance-Studies: simulation reports, data and scripts in their study archives.

Source novel compilations are not duplicated in this development handoff. Share them separately if the coder needs canon research access.
