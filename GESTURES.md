# Gesture dictionary

This lists every entry in [`data/gestures/gestures.json`](data/gestures/gestures.json): what it means and how it's performed. Sports Mafia hand signals are club/community convention rather than anything codified by a tournament federation, so treat these as a reasonable starting point to be refined by hand (via `/playground` and the live avatar), not as a fixed authority.

| id | category | meaning | how it's performed |
|---|---|---|---|
| `citizen` | roles | Citizen | Thumbs up, or a light touch of something red |
| `mafia` | roles | Mafia | Thumbs down, or a light touch of something black |
| `don` | roles | Don | Flat hand, thumb touching the base of the ring finger (where a ring would sit) |
| `sheriff` | roles | Sheriff | Thumb + index finger form a circle ("OK" shape) |
| `me` | roles | Me | Point index finger at your own chest |
| `you` | roles | You | Point index finger at another player |
| `player_number_1`…`player_number_5` | roles | Player 1–5 | That many fingers raised on one hand |
| `player_number_6`…`player_number_10` | roles | Player 6–10 | Both hands are used above 5; animated here as an approximation — see Known limitations |
| `roof` | roles | Roof | Both hands mirrored, fingertips touching to form a peak, near the head — literal "roof"; possibly referencing Russian slang for mafia protection ("krysha") |
| `question_mark` | information | Question Mark (What/Who/Why?) | Hooked index finger or a question mark traced in the air — a universal question, often combined with pointing at a player |
| `who_is_sheriff` | information | Who is Sheriff? | The Sheriff gesture followed by the question gesture |
| `not_sheriff` | information | Not Sheriff | The Sheriff gesture followed by a side-to-side "no" wave |
| `reveal` | information | Reveal | Both flat hands stacked like a closed book, then the top hand rotates open while the bottom stays put |
| `secret_sheriff` | roles | Secret Sheriff | Just a wink (`hnm_eyelids tag="CL"`) — no hand gesture at all |
| `check_player_1`…`check_player_10` | information | Check Player 1–10 | Shows that player number, then the hooked-finger question gesture |
| `nominate` | actions | Nominate | Shows a player number, then a fist with thumb up is placed onto the other, flat horizontal hand |
| `kill_player_1`…`kill_player_10` | actions | Kill Player 1–10 | Shows that player number, then the same fingers curl into a repeated hook/claw motion |
| `kickout_player_1`…`kickout_player_10` | actions | Kick Out Player 1–10 | Shows that player number, then a fist with thumb up is placed onto the other, flat horizontal hand |
| `shot` | actions | Shot | Index+middle fingers extended like a gun barrel at the head, then curl into a repeated trigger motion |
| `split` | actions | Split vote | One flat, vertical "blade" hand saws down repeatedly through the other, half-open hand |
| `next` | actions | Next | Both hands (mirrored, alternating), index fingers pointing out, rotating around each other continuously |
| `stop` | actions | Stop | Both hands mirrored, flat palms down, small outward nudge then halt |
| `break` | actions | Break | Both palms pressed together, flat, in neutral space |
| `if` | strategy | If | Thumb and pinky extended, other fingers curled into the fist ("shaka"-style handshape) |
| `miss` | strategy | Miss | Open hand closes into a pinch with the index finger bent |
| `listen` | strategy | Listen | Both hands mirrored, fingers spread, drawn toward the shoulders/ears |
| `think` | strategy | Think | C-shaped hand near the ear, repeatedly opens/closes into a pinch (chattering mouth) — note: visually reads as "talk", not an obvious "think" gesture |
| `wins` | strategy | Wins | Index and pinky extended, middle and ring bent, thumb tucked across the palm |
| `plus` | strategy | Plus | Both hands, index fingers extended, crossing (one vertical, one horizontal) to form a "+" |
| `minus` | strategy | Minus | One hand, index finger extended horizontally, a flat "−" |
| `speak` | strategy | Speak | An open hand repeatedly closes into a pinch in front of the body (not at the head, unlike `think`) |
| `open_up` | strategy | Open Up | Both flat hands, palms facing each other together in the middle, swing apart like opening a book |
| `foul` | actions | Foul | Index finger traces a checkmark-like motion (`hamseqbegin`/`hamseqend`) |

## Known limitations

- **Player numbers 6–10** are a one-hand-at-a-time sequence rather than a true simultaneous two-hand pose — the CWASA two-hand primitives available here (`hamsymmlr`/`hamsymmpar`) only support identical/mirrored poses on both hands, not two different handshapes at once.
- Several animations (`miss`, `listen`, `talk`, `stop`, `roof`) are adapted from other national sign languages' SiGML corpora (British Sign Language, Polish Sign Language, Vietnamese Sign Language) rather than from a Sports Mafia-specific source — they're a reasonable visual starting point for the general concept (e.g. "talking", "listening"), not a claim that this is the actual Mafia table gesture for that meaning.
- Animations are being refined by hand against the live avatar (via `/playground` or the dev server) — see `data/sigml/*.sigml` to inspect or adjust any of them, and `sigml-reference.md` for the full HamNoSys/SiGML tag reference.
- **License file inconsistency** (pre-existing, not introduced by this change): `LICENSE` contains the full GPLv3 text, while `pyproject.toml` and the README footer declare `CC-BY-NC-4.0`. Left as-is for the repository owner to resolve.
