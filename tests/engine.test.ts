import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  neutral,
  step,
  aiInput,
  type Game,
  type Input,
} from "../src/engine.ts";
import { load, save, KEY, type Store } from "../src/storage.ts";
const input = (i: Partial<Input> = {}): Input => ({ ...neutral(), ...i });
function fight() {
  const g = createGame(false);
  for (let n = 0; n < 90; n++) step(g);
  return g;
}
function ticks(g: Game, n: number, a = neutral(), b = neutral()) {
  for (let k = 0; k < n; k++) step(g, a, b);
}
function near(g: Game, d = 95) {
  g.fighters[0].x = 400;
  g.fighters[1].x = 400 + d;
}
test("continuous movement, crouch lock, jumping and facing after crossing", () => {
  const g = fight(),
    a = g.fighters[0];
  ticks(g, 10, input({ x: 1 }));
  assert.equal(a.x, 365);
  ticks(g, 10, input({ x: 1, down: true }));
  assert.equal(a.x, 365);
  assert.equal(a.crouch, true);
  step(g, input({ x: 1, up: true }));
  assert.ok(a.y > 0);
  ticks(g, 45);
  assert.equal(a.y, 0);
  g.fighters[1].x = 100;
  step(g);
  assert.equal(a.facing, -1);
});
test("ground bodies separate and arena walls hold", () => {
  const g = fight();
  near(g, 68);
  ticks(g, 100, input({ x: 1 }), input({ x: -1 }));
  assert.ok(g.fighters[1].x - g.fighters[0].x >= 66.9);
  ticks(g, 500, input({ x: -1 }));
  assert.equal(g.fighters[0].x, 55);
});
test("held attack does not repeat and recovery cannot be cancelled", () => {
  const g = fight();
  step(g, input({ punch: true }));
  const a = g.fighters[0];
  assert.equal(a.state, "attack");
  step(g, input({ kick: true }));
  assert.equal(a.attack, "jab");
  ticks(g, 60, input({ punch: true }));
  assert.equal(a.state, "neutral");
});
test("one air attack per jump, no block in air", () => {
  const g = fight();
  step(g, input({ up: true }));
  step(g, input({ punch: true, x: -1 }));
  assert.equal(g.fighters[0].attack, "airPunch");
  assert.equal(g.fighters[0].guarding, false);
  ticks(g, 34);
  step(g, input({ kick: true }));
  assert.equal(g.fighters[0].attack, null);
});
test("range misses and one hit per active window", () => {
  const g = fight();
  step(g, input({ punch: true }));
  ticks(g, 30);
  assert.equal(g.fighters[1].hp, 100);
  near(g, 85);
  step(g, input({ punch: true }));
  ticks(g, 11);
  assert.equal(g.fighters[1].hp, 93);
  ticks(g, 10);
  assert.equal(g.fighters[1].hp, 93);
});
test("back guards mid without chip, down-back guards low", () => {
  let g = fight();
  near(g, 95);
  step(g, input({ kick: true }), input({ x: 1 }));
  ticks(g, 17, neutral(), input({ x: 1 }));
  assert.equal(g.fighters[1].hp, 100);
  g = fight();
  near(g, 90);
  step(g, input({ down: true, kick: true }), input({ x: 1, down: true }));
  ticks(g, 16, neutral(), input({ x: 1, down: true }));
  assert.equal(g.fighters[1].hp, 100);
  assert.equal(g.fighters[1].state, "block");
});
test("standing guard loses to low sweep, knockdown disables attacks", () => {
  const g = fight();
  near(g, 67);
  step(g, input({ down: true, kick: true }), input({ x: 1 }));
  ticks(g, 15, neutral(), input({ x: 1 }));
  assert.equal(g.fighters[1].hp, 89);
  assert.equal(g.fighters[1].state, "down");
  step(g, neutral(), input({ punch: true }));
  assert.equal(g.fighters[1].attack, null);
  ticks(g, 55);
  assert.equal(g.fighters[1].state, "neutral");
});
test("low guard loses to airborne high strike", () => {
  const g = fight();
  near(g, 90);
  g.fighters[0].y = 40;
  g.fighters[0].vy = 0;
  step(g, input({ punch: true }), input({ down: true, x: 1 }));
  ticks(g, 16, neutral(), input({ down: true, x: 1 }));
  assert.ok(g.fighters[1].hp < 100);
});
test("close forward punch throws through guard; airborne target cannot be thrown", () => {
  const g = fight();
  g.fighters[0].x = 875;
  g.fighters[1].x = 945;
  step(g, input({ x: 1, punch: true }), input({ x: 1 }));
  assert.equal(g.fighters[0].attack, "throw");
  ticks(g, 6, neutral(), input({ x: 1 }));
  assert.equal(g.fighters[1].hp, 84);
  const h = fight();
  near(h, 70);
  h.fighters[1].y = 120;
  step(h, input({ x: 1, punch: true }));
  assert.notEqual(h.fighters[0].attack, "throw");
});
test("quarter-circle is ordered, fresh, mirrored and consumed", () => {
  for (const facing of [1, -1] as const) {
    const g = fight();
    g.fighters[0].x = facing === 1 ? 200 : 800;
    g.fighters[1].x = 500;
    step(g, input({ down: true }));
    step(g, input({ down: true, x: facing }));
    step(g, input({ x: facing, punch: true }));
    assert.equal(g.fighters[0].attack, "drive");
    assert.ok(g.events.some((e) => e.kind === "special"));
    ticks(g, 65);
    step(g, input({ punch: true }));
    assert.notEqual(g.fighters[0].attack, "drive");
  }
  const g = fight();
  step(g, input({ down: true }));
  ticks(g, 31);
  step(g, input({ down: true, x: 1 }));
  step(g, input({ x: 1, punch: true }));
  assert.notEqual(g.fighters[0].attack, "drive");
});
test("stability regenerates in neutral, stops in guard, depletion stuns and mash recovers", () => {
  const g = fight();
  g.fighters[0].stability = 50;
  step(g);
  assert.ok(g.fighters[0].stability > 50);
  const stable = g.fighters[0].stability;
  step(g, input({ x: -1 }));
  assert.equal(g.fighters[0].stability, stable);
  near(g, 85);
  g.fighters[1].stability = 10;
  step(g, input({ punch: true }));
  ticks(g, 7);
  const b = g.fighters[1];
  assert.equal(b.state, "stun");
  const before = b.timer;
  step(g, neutral(), input({ punch: true }));
  assert.ok(b.timer < before - 1);
  ticks(g, 110);
  assert.equal(b.state, "neutral");
  assert.equal(b.stability, 100);
});
test("simultaneous punches trade without leaving phantom attacks", () => {
  const g = fight();
  near(g, 85);
  step(g, input({ punch: true }), input({ punch: true }));
  ticks(g, 7);
  assert.equal(g.fighters[0].hp, 93);
  assert.equal(g.fighters[1].hp, 93);
  assert.equal(g.fighters[0].attack, null);
  assert.equal(g.fighters[1].attack, null);
});
test("knockout awards round once, resets, match ends first to two and rematch is fresh", () => {
  const g = fight();
  for (let round = 0; round < 2; round++) {
    near(g, 85);
    g.fighters[1].hp = 1;
    step(g, input({ punch: true }));
    ticks(g, 7);
    assert.equal(g.score[0], round + 1);
    if (round === 0) {
      ticks(g, 150);
      assert.equal(g.fighters[1].hp, 100);
      assert.equal(g.round, 2);
    }
  }
  assert.equal(g.phase, "match");
  ticks(g, 200);
  assert.equal(g.score[0], 2);
  assert.deepEqual(createGame().score, [0, 0]);
});
test("timeout uses integrity; tied round does not award either fighter", () => {
  const g = fight();
  g.clock = 1;
  step(g);
  assert.equal(g.phase, "round");
  assert.deepEqual(g.score, [0, 0]);
  const h = fight();
  h.clock = 1;
  h.fighters[0].hp = 90;
  step(h);
  assert.equal(h.winner, 1);
});
test("AI approaches, reacts to attacks and produces actual combat over a match", () => {
  const g = createGame();
  ticks(g, 90);
  assert.equal(aiInput(g).x, -1);
  g.tick = 96;
  g.fighters[0].x = 540;
  g.fighters[0].state = "attack";
  g.fighters[0].attack = "sweep";
  g.fighters[0].age = 8;
  const i = aiInput(g);
  assert.equal(i.down, true);
  assert.equal(i.x, 1);
  g.fighters[0].state = "neutral";
  g.fighters[0].attack = null;
  for (let n = 0; n < 16000 && g.phase !== "match"; n++) step(g);
  assert.equal(g.phase, "match");
  assert.equal(g.winner, 1);
  assert.equal(g.score[1], 2);
});
test("versioned persistence round-trips without touching other projects; corrupt/unavailable storage is safe", () => {
  const map = new Map([["other-game", "do not touch"]]);
  const s: Store = {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
  };
  const record = { version: 1 as const, wins: 2, losses: 1, muted: true };
  assert.equal(save(s, record), true);
  assert.deepEqual(load(s), record);
  assert.equal(map.get("other-game"), "do not touch");
  map.set(KEY, '{"version":1,"wins":-1}');
  assert.equal(load(s).wins, 0);
  const bad: Store = {
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
  };
  assert.equal(save(bad, record), false);
  assert.equal(load(bad).wins, 0);
});

test("crouching normals keep their low posture through recovery", () => {
  const g = fight();
  step(g, input({ down: true, kick: true }));
  ticks(g, 20);
  assert.equal(g.fighters[0].crouch, true);
});
test("crouch guard actively blocks mid attacks rather than avoiding collision", () => {
  const g = fight();
  near(g, 90);
  step(g, input({ kick: true }), input({ down: true, x: 1 }));
  ticks(g, 12, neutral(), input({ down: true, x: 1 }));
  assert.equal(g.fighters[1].hp, 100);
  assert.equal(g.fighters[1].state, "block");
});
test("AI cannot react to an attack before eight startup ticks", () => {
  const g = fight();
  g.tick = 96;
  near(g, 100);
  g.fighters[0].state = "attack";
  g.fighters[0].attack = "sweep";
  g.fighters[0].age = 0;
  assert.equal(aiInput(g).down, false);
  g.fighters[0].age = 8;
  assert.equal(aiInput(g).down, true);
});

test("air overhead connects with a croucher before landing", () => {
  const g = fight();
  near(g, 90);
  g.fighters[0].y = 60;
  g.fighters[0].vy = -2;
  step(g, input({ punch: true }), input({ down: true, x: 1 }));
  for (let n = 0; n < 9 && g.fighters[1].hp === 100; n++)
    step(g, neutral(), input({ down: true, x: 1 }));
  assert.equal(g.fighters[1].hp, 90);
  assert.ok(g.fighters[0].y > 0);
});
test("unguarded crouch is vulnerable to a standing mid strike", () => {
  const g = fight();
  near(g, 85);
  step(g, input({ punch: true }), input({ down: true }));
  ticks(g, 8, neutral(), input({ down: true }));
  assert.equal(g.fighters[1].hp, 93);
});
