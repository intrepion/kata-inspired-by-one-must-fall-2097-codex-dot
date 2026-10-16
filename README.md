# Rivet Circuit

An original browser robot fighter inspired by **One Must Fall: 2097**. A side-on shared-floor duel in the Foundry: Kestrel versus tactical CPU Basalt, first to two rounds. Original canvas robot/arena art, synthesized audio and TypeScript code. No original game assets.

## Run
Requires Node.js 24 and npm.

```sh
npm ci
npm test
npm run build
npm run preview
```
Production preview: **http://127.0.0.1:5223** (loopback only). `npm run dev -- --port 5223 --strictPort` is also available. The port was checked against existing projects before use; no prior preview was stopped. No public website deployment is configured.

## Controls
Click **Engage Systems**, then use the keyboard. Click the arena to restore focus.

| Input | Action |
|---|---|
| ←/→ or A/D | Walk continuously; away from opponent guards high |
| ↑ or W; diagonal up | Jump straight / backward / forward |
| ↓ or S | Crouch |
| Down + away | Low guard |
| J or Enter | Punch; direction and stance choose context |
| K or Right Shift | Kick; crouching kick sweeps |
| Close forward + punch | Throw through guard |
| ↓, ↘, → + punch | **Arc drive** facing right; mirror facing left |
| Escape / Pause button | Pause/resume; focus loss also pauses |

For Arc drive: hold down, add forward, release down, then press punch while holding forward, all within half a second. This is a motion input, without a special button or cooldown. Startup and recovery prevent cancellation. One attack per jump. High guard blocks mid/high; low guard blocks mid/low. Jump avoids sweeps and throws. Reducing **integrity** to zero wins a round; depleted **stability** causes stun. Stability returns in neutral, never by spending it on moves. Tap punch/kick to recover from stun faster. Rounds time out at 60 seconds; ties replay.

Completed match wins/losses and mute preference save under `rivet-circuit:v1` on this origin. No in-progress match saves. Rematch starts a fresh first-to-two. Storage errors fall back to session-only records.

## Scope and evidence
See [research and verified rules](docs/RESEARCH.md), [accepted spec](docs/SPEC.md), [QA](docs/QA.md), and [review findings](docs/REVIEWS.md). All frame timings, geometry, damage, AI and visual designs are original tuning. Excludes tournament progression/upgrades, hazards, finishers, rehit juggling, projectiles, multiplayer and mobile/gamepad support. The two robots share one balanced move set.

`npm run typecheck`, `npm test`, `npm run build` are CI gates. Combat tests use the exported deterministic tick, AI and persistence interfaces; native Mac keyboard QA is reported separately. No game-state mutation hooks or automation-only win shortcuts are shipped.

## License
MIT. See the complete [LICENSE](LICENSE). Official GitHub global Linux, Windows and macOS ignore templates are retained verbatim in `.gitignore`, followed by project ignores. Source: [github/gitignore/Global](https://github.com/github/gitignore/tree/main/Global).
