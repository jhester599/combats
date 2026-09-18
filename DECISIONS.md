# Battle Bats — Decision Log & Loop 📓

This is where **Lewis's creative-director decisions become official.** When he
answers homework, we run the loop below so the answer actually lands in the
game instead of getting lost between sessions.

---

## 🔁 The Decision Loop

```
Lewis answers homework  →  tells Dad his picks  →  Claude records them here
        │                                                    │
        │                                    updates DESIGN.md (clears [TO DECIDE])
        │                                                    │
        └──────────── ticks the question, commits ───────────┘
```

**To run the loop, just tell Claude the picks**, for example:

> "Lewis decided: B5 = A, the sniper bat, and he wants it called Zap.
>  B10 = B, five levels. B1 — the bats are guarding their cave from robots."

Claude then, for each decision:

1. **Logs it** in the table below — number, what was decided, why, date.
2. **Updates `DESIGN.md`** — finds the matching `[TO DECIDE]` (use §13's index)
   and replaces it with the decision, tagged **`DECIDED (date):`**.
3. **Ticks the question** in `HOMEWORK.md` and `HOMEWORK_BACKLOG.md` (🔲 → ✅).
4. **Builds it, if it's buildable** — a stats-only decision like a new bat is
   often just a block in `data/units.js` and can ship the same day.
5. **Commits** with a plain message, e.g. `decide: third bat is a sniper`.

**Small rule:** if a pick is unclear, or clashes with something already
decided, Claude **asks first**. We don't guess on Lewis's behalf.

**Second small rule:** a decision can be *changed later*. If something turns out
not to be fun when we play it, we supersede it — log the new one and mark the
old row ⚠️ with a pointer. Nothing here is permanent.

---

## 📋 Decisions Made

*(Empty — Round 1 is the first homework. This table fills top-down as Lewis
answers.)*

| # | Question | Decision | Why | Date |
|---|---|---|---|---|
| — | — | *waiting on Round 1* | — | — |

---

## 🔧 Decisions Dad already made (so Lewis knows what's assumed)

These were settled while building Milestone 1. **Any of them can be overruled**
— they're starting points, not rules.

| # | What | Decision | Why | Date |
|---|---|---|---|---|
| D1 | Engine | Phaser 4.2.1, vendored, no build step | Same setup as Fakeamon Spark; open it and it runs | 2026-09-18 |
| D2 | Unit control | You never steer a bat — deploy and forget | It's what makes it *this* genre | 2026-09-18 |
| D3 | Do bats queue or swarm? | **Swarm** — they pile on and all attack | With any spacing, only the front bat is in range, so a 10-bat army did the damage of 1. `DESIGN.md` §6 | 2026-09-18 |
| D4 | Level 1's lesson | Keep spending; hoarding loses | Active play wins at ~68s, hoarding loses. Measured, not guessed | 2026-09-18 |
| D5 | Enemy base HP | 4000 vs your 1000 | It's a fortress you're besieging, not a duel | 2026-09-18 |
| D6 | Art | Placeholder art the game draws itself | Real sprite sheets drop in as a data change, so art isn't blocking | 2026-09-18 |
| D7 | Where numbers live | All gameplay numbers in `data/`, never in code | So Lewis can change anything without touching code | 2026-09-18 |

---

## 🗂️ Question Index — where each answer lands

| # | Question | Lands in `DESIGN.md` | Status |
|---|---|---|---|
| B1 | Why are the bats fighting? | §1 Vision, §10 Story | 🔲 On the plate |
| B2 | The world's name & look | §1 Vision | 🔲 On the plate |
| B3 | Who is the enemy? | §4 The Enemy | 🔲 On the plate |
| B4 | What the bats look like | §9 Look & Sound | 🔲 On the plate |
| B5 | The third bat | §3 The Bats | 🔲 On the plate |
| B6 | Special powers? | §3 The Bats | 🔲 Open (M5) |
| B7 | How strict is saving up? | §3 The Bats | 🔲 On the plate |
| B8 | Is there a boss? | §4 The Enemy | 🔲 Open (M5) |
| B9 | A long-range bat? | §6 Combat Rules | 🔲 Open (M2) |
| B10 | How many levels? | §7 Levels & Waves | 🔲 On the plate |
| B11 | What makes level 2 different? | §7 Levels & Waves | 🔲 Open (M2) |
| B12 | How you unlock bats | §8 Progression | 🔲 Open (M4) |
| B13 | Does progress save? | §8 Progression | 🔲 On the plate |
| B14 | A second lane? | §6 Combat Rules | 🔲 Open (M5) |
| B15 | Music & sound | §9 Look & Sound | 🔲 Open (M3) |
| B16 | What a bat's death looks like | §9 Look & Sound | 🔲 Open (M3) |
| B17 | Level names | §7 Levels & Waves | 🔲 Open (M2) |
| B18 | The base-breaking moment | §9 Look & Sound | 🔲 Open (anytime) |
| B19 | Can you upgrade a bat? | §8 Progression | 🔲 Open (M4) |
| B20 | A fast-forward button? | §5 Energy & Deploying | 🔲 Open (anytime) |
