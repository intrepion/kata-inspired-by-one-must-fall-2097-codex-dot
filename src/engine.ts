export type Direction = -1 | 0 | 1;
export interface Input {
  x: Direction;
  down: boolean;
  up: boolean;
  punch: boolean;
  kick: boolean;
}
export const neutral = (): Input => ({
  x: 0,
  down: false,
  up: false,
  punch: false,
  kick: false,
});
export type MoveName =
  | "jab"
  | "cross"
  | "hook"
  | "kick"
  | "boot"
  | "heel"
  | "lowJab"
  | "sweep"
  | "airPunch"
  | "airKick"
  | "drive"
  | "throw";
interface Move {
  start: number;
  active: number;
  recovery: number;
  range: number;
  damage: number;
  stun: number;
  height: "mid" | "low" | "high" | "throw";
  knock: boolean;
}
export const moves: Record<MoveName, Move> = {
  jab: {
    start: 6,
    active: 4,
    recovery: 13,
    range: 94,
    damage: 7,
    stun: 13,
    height: "mid",
    knock: false,
  },
  cross: {
    start: 10,
    active: 5,
    recovery: 18,
    range: 115,
    damage: 11,
    stun: 19,
    height: "mid",
    knock: false,
  },
  hook: {
    start: 8,
    active: 4,
    recovery: 16,
    range: 84,
    damage: 9,
    stun: 16,
    height: "mid",
    knock: false,
  },
  kick: {
    start: 11,
    active: 5,
    recovery: 20,
    range: 137,
    damage: 12,
    stun: 20,
    height: "mid",
    knock: false,
  },
  boot: {
    start: 15,
    active: 5,
    recovery: 22,
    range: 155,
    damage: 15,
    stun: 24,
    height: "mid",
    knock: true,
  },
  heel: {
    start: 10,
    active: 5,
    recovery: 18,
    range: 119,
    damage: 11,
    stun: 18,
    height: "mid",
    knock: false,
  },
  lowJab: {
    start: 6,
    active: 4,
    recovery: 13,
    range: 90,
    damage: 6,
    stun: 12,
    height: "mid",
    knock: false,
  },
  sweep: {
    start: 13,
    active: 5,
    recovery: 22,
    range: 133,
    damage: 11,
    stun: 20,
    height: "low",
    knock: true,
  },
  airPunch: {
    start: 6,
    active: 12,
    recovery: 16,
    range: 100,
    damage: 10,
    stun: 18,
    height: "high",
    knock: false,
  },
  airKick: {
    start: 9,
    active: 15,
    recovery: 19,
    range: 137,
    damage: 14,
    stun: 23,
    height: "high",
    knock: true,
  },
  drive: {
    start: 14,
    active: 16,
    recovery: 26,
    range: 116,
    damage: 19,
    stun: 33,
    height: "mid",
    knock: true,
  },
  throw: {
    start: 5,
    active: 3,
    recovery: 27,
    range: 76,
    damage: 16,
    stun: 23,
    height: "throw",
    knock: true,
  },
};
export interface Fighter {
  x: number;
  y: number;
  vy: number;
  vx: number;
  facing: Direction;
  hp: number;
  stability: number;
  state: "neutral" | "attack" | "hit" | "block" | "down" | "stun";
  timer: number;
  attack: MoveName | null;
  age: number;
  connected: boolean;
  crouch: boolean;
  guarding: boolean;
  airUsed: boolean;
  previous: Input;
  motion: { dir: number; tick: number }[];
  lastDir: number;
}
export interface CombatEvent {
  kind: "hit" | "block" | "special" | "throw" | "round";
  x: number;
  y: number;
  label: string;
  actor?: number;
}
export interface Game {
  fighters: [Fighter, Fighter];
  tick: number;
  clock: number;
  phase: "ready" | "fight" | "round" | "match";
  delay: number;
  score: [number, number];
  round: number;
  winner: number | null;
  events: CombatEvent[];
  message: string;
  ai: boolean;
}
export function fighter(x: number, facing: Direction): Fighter {
  return {
    x,
    y: 0,
    vy: 0,
    vx: 0,
    facing,
    hp: 100,
    stability: 100,
    state: "neutral",
    timer: 0,
    attack: null,
    age: 0,
    connected: false,
    crouch: false,
    guarding: false,
    airUsed: false,
    previous: neutral(),
    motion: [],
    lastDir: 5,
  };
}
export function createGame(ai = true): Game {
  return {
    fighters: [fighter(330, 1), fighter(670, -1)],
    tick: 0,
    clock: 3600,
    phase: "ready",
    delay: 90,
    score: [0, 0],
    round: 1,
    winner: null,
    events: [],
    message: "SYSTEMS ONLINE",
    ai,
  };
}
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
function recordMotion(f: Fighter, i: Input, tick: number) {
  const rel = i.x * f.facing;
  const dir = i.down
    ? rel === 1
      ? 3
      : rel === -1
        ? 1
        : 2
    : rel === 1
      ? 6
      : rel === -1
        ? 4
        : 5;
  if (dir !== f.lastDir) {
    f.motion.push({ dir, tick });
    f.lastDir = dir;
  }
  f.motion = f.motion.filter((m) => tick - m.tick <= 30);
}
function quarterCircle(f: Fighter, tick: number) {
  const a = f.motion.filter((m) => m.dir !== 5);
  const n = a.length;
  return (
    n >= 3 &&
    a[n - 3]?.dir === 2 &&
    a[n - 2]?.dir === 3 &&
    a[n - 1]?.dir === 6 &&
    tick - (a[n - 1]?.tick ?? 0) <= 9
  );
}
function begin(f: Fighter, name: MoveName, g: Game) {
  f.state = "attack";
  f.attack = name;
  f.age = 0;
  f.connected = false;
  f.guarding = false;
  if (f.y > 0) f.airUsed = true;
  if (name === "drive") {
    f.motion = [];
    g.events.push({
      kind: "special",
      x: f.x,
      y: f.y,
      label: "ARC DRIVE",
      actor: g.fighters.indexOf(f),
    });
  }
}
function update(f: Fighter, o: Fighter, i: Input, g: Game) {
  const punch = i.punch && !f.previous.punch,
    kick = i.kick && !f.previous.kick,
    jump = i.up && !f.previous.up;
  // Facing locks during committed attacks/stun, updates whenever neutral (including crossups).
  if (f.state === "neutral") f.facing = o.x >= f.x ? 1 : -1;
  recordMotion(f, i, g.tick);
  f.guarding = false;
  if (f.timer > 0) {
    if (f.state === "stun" && (punch || kick))
      f.timer = Math.max(1, f.timer - 6);
    f.timer--;
    if (f.timer === 0) {
      f.state = "neutral";
      f.attack = null;
      if (f.stability <= 0) f.stability = 100;
    }
  }
  if (f.state === "attack" && f.attack) {
    const m = moves[f.attack];
    f.age++;
    if (f.attack === "drive" && f.age >= m.start && f.age < m.start + m.active)
      f.x += f.facing * 6.5;
    if (f.age >= m.start + m.active + m.recovery) {
      f.state = "neutral";
      f.attack = null;
    }
  }
  f.crouch =
    f.y === 0 &&
    ((i.down && f.state === "neutral") ||
      (f.state === "attack" &&
        (f.attack === "lowJab" || f.attack === "sweep")));
  if (f.state === "neutral") {
    const backward = i.x === -f.facing;
    f.guarding = f.y === 0 && backward;
    if (f.y === 0) {
      f.x += i.down ? 0 : i.x * 3.5;
      if (jump && !i.down) {
        f.vy = 13.8;
        f.y = 0.1;
        f.vx = i.x * 3.8;
        f.airUsed = false;
        f.crouch = false;
        f.guarding = false;
      }
    }
    if ((punch || kick) && !(f.y > 0 && f.airUsed)) {
      const rel = i.x * f.facing;
      let move: MoveName;
      if (f.y > 0) move = punch ? "airPunch" : "airKick";
      else if (punch && quarterCircle(f, g.tick)) move = "drive";
      else if (
        punch &&
        rel === 1 &&
        !i.down &&
        o.y === 0 &&
        Math.abs(o.x - f.x) <= 76
      )
        move = "throw";
      else if (i.down) move = punch ? "lowJab" : "sweep";
      else
        move = punch
          ? rel === 1
            ? "cross"
            : rel === -1
              ? "hook"
              : "jab"
          : rel === 1
            ? "boot"
            : rel === -1
              ? "heel"
              : "kick";
      begin(f, move, g);
    } else if (!f.guarding && f.y === 0)
      f.stability = clamp(f.stability + 0.24, 0, 100);
  }
  if (f.y > 0 || f.vy !== 0) {
    f.y += f.vy;
    f.vy -= 0.62;
    f.x += f.vx;
    if (f.y <= 0) {
      f.y = 0;
      f.vy = 0;
      f.vx = 0;
      f.airUsed = false;
    }
  }
  f.x = clamp(f.x, 55, 945);
  f.previous = { ...i };
}
function candidate(a: Fighter, b: Fighter) {
  if (a.state !== "attack" || !a.attack || a.connected || b.state === "down")
    return false;
  const m = moves[a.attack];
  if (a.age < m.start || a.age >= m.start + m.active) return false;
  if ((b.x - a.x) * a.facing < 0 || Math.abs(b.x - a.x) > m.range) return false;
  if (m.height === "throw")
    return b.y === 0 && !b.crouch && b.state !== "attack" && b.state !== "stun";
  const bottom = a.y + (m.height === "low" ? 5 : m.height === "high" ? 10 : 35);
  const top = a.y + (m.height === "low" ? 35 : m.height === "high" ? 85 : 100);
  const defenderTop = b.y + (b.crouch ? 67 : 133);
  return bottom <= defenderTop && top >= b.y;
}
function resolve(a: Fighter, b: Fighter, g: Game) {
  if (!a.attack) return;
  const name = a.attack,
    m = moves[name];
  a.connected = true;
  const blocked =
    b.guarding &&
    b.state === "neutral" &&
    b.y === 0 &&
    m.height !== "throw" &&
    (m.height === "mid" || (m.height === "low" ? b.crouch : !b.crouch));
  if (blocked) {
    b.state = "block";
    b.timer = 13;
    b.x = clamp(b.x + a.facing * 16, 55, 945);
    g.events.push({ kind: "block", x: b.x, y: b.y + 80, label: "GUARD" });
    return;
  }
  b.hp = clamp(b.hp - m.damage, 0, 100);
  b.stability = clamp(b.stability - m.stun, 0, 100);
  b.attack = null;
  b.guarding = false;
  b.crouch = false;
  b.x = clamp(b.x + a.facing * (m.knock ? 42 : 24), 55, 945);
  if (b.stability === 0) {
    b.state = "stun";
    b.timer = 105;
  } else {
    b.state = m.knock ? "down" : "hit";
    b.timer = m.knock ? 48 : 19;
  }
  if (m.knock) {
    b.vy = 5;
    b.y = Math.max(1, b.y);
    b.vx = a.facing * 2.1;
  }
  g.events.push({
    kind: m.height === "throw" ? "throw" : "hit",
    x: b.x,
    y: b.y + 78,
    label: m.height === "throw" ? "THROW" : m.knock ? "KNOCKDOWN" : "IMPACT",
  });
}
export function aiInput(g: Game): Input {
  const a = g.fighters[1],
    b = g.fighters[0],
    d = Math.abs(a.x - b.x),
    toward: Direction = b.x > a.x ? 1 : -1;
  const i = neutral();
  // Decisions change only every twelve ticks; attacks have distinct releases.
  const beat = Math.floor(g.tick / 12),
    choice = (beat * 17 + Math.floor(g.tick / 240) * 11) % 11;
  if (a.state === "stun") {
    i.punch = g.tick % 8 < 4;
    return i;
  }
  if (b.state === "attack" && b.age >= 8 && d < 170 && choice < 8) {
    i.x = -toward as Direction;
    i.down = b.attack === "sweep";
    return i;
  }
  if (d > 125) i.x = toward;
  else if (choice === 0) i.x = -toward as Direction;
  if (d > 220 && choice === 3) i.up = true;
  if (d < 155 && g.tick % 36 === 0) {
    i.punch = choice % 3 !== 0;
    i.kick = !i.punch;
    i.down = choice === 3 || choice === 6;
    if (d < 76) i.x = toward;
  }
  // Physical quarter-circle input; AI gets the same recognizer as the player.
  const cycle = g.tick % 240;
  if (d > 135 && d < 350 && cycle >= 180 && cycle <= 198) {
    i.x = cycle < 186 ? 0 : toward;
    i.down = cycle < 192;
    i.punch = cycle === 198;
  }
  return i;
}
function finishRound(g: Game) {
  const [a, b] = g.fighters;
  const winner = a.hp === b.hp ? null : a.hp > b.hp ? 0 : 1;
  g.winner = winner;
  if (winner !== null) g.score[winner as 0 | 1]++;
  g.phase = g.score.some((s) => s >= 2) ? "match" : "round";
  g.delay = 150;
  g.message =
    winner === null
      ? "DRAW — REPLAY"
      : `${winner === 0 ? "KESTREL" : "BASALT"} ${g.phase === "match" ? "WINS THE MATCH" : "TAKES THE ROUND"}`;
  g.events.push({ kind: "round", x: 500, y: 200, label: g.message });
}
export function step(g: Game, player: Input = neutral(), other?: Input) {
  g.tick++;
  g.events = [];
  if (g.phase === "match") return;
  if (g.phase !== "fight") {
    g.delay--;
    if (g.delay <= 0) {
      if (g.phase === "round") {
        g.round++;
        g.fighters = [fighter(330, 1), fighter(670, -1)];
        g.clock = 3600;
      }
      g.phase = "fight";
      g.message = "FIGHT";
    }
    return;
  }
  const second = other ?? (g.ai ? aiInput(g) : neutral());
  const [a, b] = g.fighters;
  update(a, b, player, g);
  update(b, a, second, g);
  // Body separation in the ground plane; airborne fighters can cross over.
  if (Math.abs(a.y - b.y) < 105 && Math.abs(a.x - b.x) < 67) {
    const sign = a.x <= b.x ? 1 : -1;
    const push = (67 - Math.abs(a.x - b.x)) / 2;
    a.x = clamp(a.x - sign * push, 55, 945);
    b.x = clamp(b.x + sign * push, 55, 945);
  }
  // Snapshot eligibility first: simultaneous active attacks trade fairly.
  const ab = candidate(a, b),
    ba = candidate(b, a);
  const savedB = b.attack;
  if (ab) resolve(a, b, g);
  if (ba) {
    b.attack = savedB;
    resolve(b, a, g);
    if (ab) b.attack = null;
  }
  if (ab && ba) a.attack = null;
  g.clock--;
  if (a.hp <= 0 || b.hp <= 0 || g.clock <= 0) finishRound(g);
}
