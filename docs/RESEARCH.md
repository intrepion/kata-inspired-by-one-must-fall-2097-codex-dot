# Research and fidelity
Research completed before the combat implementation. No original game assets or source code are distributed.

## Primary source: original instruction manual
[Scanned instruction manual](https://www.omf2097.com/pub/files/pdf/One_Must_Fall_2097_Instruction_Manual.pdf), hosted by OMF2097.com, with scans credited on its [download page](https://www.omf2097.com/wiki/doku.php?id=download). Downloaded and visually inspected locally: printed pp. 6, 10–13 (PDF pages 8, 12–15). The 104MB image-only scan is deliberately not in this repository.

Verified: configurable keyboard controls default to Enter/punch and Right Shift/kick; automatic facing reverses the meaning of forward after crossing; eight-direction movement supports jumping and crouching. Punch/kick change with directional context. Backward movement defends, with down-back required against crouching kicks. Specials use sequences. Damage and pilot stamina are separate bars; hits reduce both, rest restores stamina, depletion causes dizziness. Tournament mode is a separate pilot/robot outfitting and training mode.

Manual screenshots show the side-on, shared-floor view with both robots visible and HUD above. This game uses a fixed shared view; perspective lines are scenic only.

## Gameplay cross-checks
[OMF controls reference](https://www.omf2097.com/wiki/doku.php?id=omf2097:controls) confirms forward+punch close throws break guard, and guards distinguish standing, low and jumping attacks.

[Robert Marney's Definitive FAQ v2.04](https://www.omf2097.com/wiki/doku.php?id=omf2097:robyrt_faq), sections II.A.3–5, 10 and 12: jumping cannot block; one attack per normal jump; neutral recovery of stun; mashing attacks shortens dizziness. Endurance affects stun recovery rather than acting as ability fuel. Four of five arenas have hazards; the Stadium has none. Tournament progression involves earnings, repairs, upgrades and championships. The reference also describes extensive rehit/air recovery behavior excluded here. These are gameplay observations rather than claims that the manual specifies every engine detail.

## Original rules versus this implementation
| Topic | Verified original | Rivet Circuit scope / tuning |
|---|---|---|
| Movement and camera | Continuous side-on fighting; automatic facing | Fixed 1000-unit arena, 60Hz ticks, jump arc and body separation |
| Buttons | Two buttons; 7 contextual normals per button | 3 standing variants/button, 1 crouching and 1 airborne variant/button; custom ranges and timing |
| Directional attacks | Forward is fastest, neutral stronger, backward fiercest | Custom forward advancing attack, neutral quick attack, backward hook/heel; a deliberate tuning departure |
| Defense | Away high; down-away low; throws defeat guard | No chip, no air block, 13-tick blockstun; jump strikes beat low guard |
| Specials | Robot-specific directional sequences | One original Arc drive, ↓ ↘ → + punch within 30 ticks, mirrored left; strict ordered segments and 9-tick final grace |
| Damage/stun | Separate damage/stamina; stun depletion causes dizzy | Integrity/stability labels; fixed original damage values, regeneration and mash recovery |
| Throws | Close forward+punch | Standing targets, escape possible before active frame; crouch/air avoid throw |
| Rounds | Configurable best-of | First to two; 60 seconds; tie replays; 2.5-second inter-round reset |
| Hazards | Four of five stages, Stadium exception | One hazard-free foundry, scenery does not inflict damage |
| Tournament | Progression, repair and upgrades | Excluded; completed match W/L and mute preference persist locally |

## Explicit exclusions
No campaign/tournament economy, upgrades, pilot statistics/selection, roster selection, stage hazards, projectiles, scrap/destruction finishers, rehit juggling, super jumps, air recovery tech, network/local multiplayer, mobile/gamepad controls, recorded replay or original soundtrack. Both original colorway robots share a balanced industrial chassis and move set. AI uses the same legal actions and physical motion recognizer. The result is a bounded homage, not an accurate recreation of all OMF systems or frame data.
