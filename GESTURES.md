# Gesture dictionary

This lists every entry in [`data/gestures/gestures.json`](data/gestures/gestures.json): what it means and how it's performed. Sports Mafia hand signals are club/community convention rather than anything codified by a tournament federation, so treat these as a reasonable starting point to be refined by hand (via `/playground` and the live avatar), not as a fixed authority.

| id | category | meaning | how it's performed |
|---|---|---|---|
| `citizen` | roles | Citizen | Thumbs up, or a light touch of something red |
| `mafia` | roles | Mafia | Thumbs down, or a light touch of something black |
| `don` | roles | Don | Mime putting a ring onto your finger |
| `sheriff` | roles | Sheriff | Thumb + index finger form a circle ("OK" shape) |
| `sheriff_self` | roles | I am Sheriff | Index + middle fingers joined, tap the shoulder (epaulette) |
| `me` | roles | Me | Point index finger at your own chest |
| `you` | roles | You | Point index finger at another player |
| `player_number_1`…`player_number_5` | roles | Player 1–5 | That many fingers raised on one hand |
| `player_number_6`…`player_number_10` | roles | Player 6–10 | Both hands are used above 5; animated here as a sequential approximation (5, then the remainder) — see Known limitations |
| `check_player` | information | Check / Question | Hooked index finger or a question mark traced in the air, pointed at a player |
| `who_is_sheriff` | information | Who is Sheriff? | The Sheriff gesture followed by the question gesture |
| `reveal_role` | information | Reveal role | — (no animation yet) |
| `checked_red` | information | Checked: Red | — (no animation yet) |
| `checked_black` | information | Checked: Black | — (no animation yet) |
| `unknown` | information | Unknown | — (no animation yet) |
| `vote` | actions | Vote | Fist, thumb up, placed/struck on the table |
| `vote_for_player` | actions | Nominate player | — (no animation yet) |
| `shoot` | actions | Shoot | Fingers held like a gun barrel, short wiggle |
| `next_player` / `wait` / `stop` | actions | — | — (no animation yet) |
| `agree` | strategy | Agree | Nod, or thumbs up |
| `disagree` | strategy | Disagree | Head shake, or crossed arms |
| `together` | strategy | Together | Two players show the same handshape side by side |
| `listen` / `trust` / `distrust` / `defend` / `accuse` / `conflict` | strategy | — | — (no animation yet) |

## Known limitations

- **Player numbers 6–10** are a one-hand-at-a-time sequence (shows "5", then the remainder) rather than a true simultaneous two-hand pose — the CWASA two-hand primitives available here (`hamsymmlr`/`hamsymmpar`) only support identical/mirrored poses on both hands, not two different handshapes at once.
- **`don`** (ring-miming) and **`sheriff_self`** (shoulder tap) are approximated with a one-hand mime, since the available HamNoSys location vocabulary in this build is body-landmark-based, not "the other hand's ring finger."
- **`together`** uses `hamsymmpar` (both hands mirrored/parallel) as the one two-hand gesture in this set — worth a visual sanity check since it's less exercised elsewhere in this codebase.
- Animations are being refined by hand against the live avatar (via `/playground` or the dev server) rather than derived from a formal citation for each handshape — see `data/sigml/*.sigml` to inspect or adjust any of them, and `sigml-reference.md` for the full HamNoSys/SiGML tag reference.
- **License file inconsistency** (pre-existing, not introduced by this change): `LICENSE` contains the full GPLv3 text, while `pyproject.toml` and the README footer declare `CC-BY-NC-4.0`. Left as-is for the repository owner to resolve.
