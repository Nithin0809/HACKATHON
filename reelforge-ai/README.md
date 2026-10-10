# ReelForge AI — Hackathon MVP

A polished full-stack prototype that turns a short-form video brief into:
- 3 hooks with different angles
- timestamped voiceover script
- shot-by-shot storyboard with visual direction, camera framing, on-screen text, edit and audio cues
- caption variants and hashtags
- production checklist
- Smart Hook Lab: select one of three hook angles and regenerate the kit around that exact opening
- JSON export and copy actions

## Fast start

Requirements: Node.js 18+ and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5173**. The API runs on port 8787.

### Demo mode vs AI mode
- Without `OPENAI_API_KEY`, the app runs in demo mode and generates a deterministic example kit. This is useful for offline demos, but is not LLM-powered.
- For live AI generation, add your key to `.env`:
  ```
  OPENAI_API_KEY=your_key_here
  OPENAI_MODEL=gpt-4o-mini
  ```
  Restart `npm run dev`. Keep keys server-side; never add API keys to frontend code or commit `.env`.

## Build
```bash
npm run build
```
For production, set `NODE_ENV=production` and run `npm start` after building. The Express server serves `dist`.

## Suggested 12-hour hackathon plan

| Time | Work | Exit criteria |
|---|---|---|
| 0:00–0:45 | Agree on target user and demo story | One-sentence value proposition; 3 test briefs |
| 0:45–2:00 | Run app, configure AI key, smoke test API | Generate button returns valid structured JSON |
| 2:00–4:00 | Improve prompts and timing consistency | 3 niches generate usable, non-repetitive kits |
| 4:00–6:00 | UX polish and error states | Mobile layout, copy, export, regenerate all work |
| 6:00–7:30 | Test and fix | 5 end-to-end test briefs; no demo blockers |
| 7:30–9:00 | Add one differentiator | e.g. hook angle comparison or regenerate one shot |
| 9:00–10:00 | Prepare demo data and fallback | Save 2 known-good outputs; demo mode verified |
| 10:00–11:00 | Pitch deck and demo script | 3-minute pitch + clear live flow |
| 11:00–12:00 | Freeze features and rehearse | Clean install, restart, and demo rehearsal |

## Suggested team split (2–4 people)
1. Full-stack lead: setup, API, AI integration, deployment.
2. Frontend/product: UI polish, responsiveness, user testing.
3. Prompt/content: output quality, edge cases, demo examples.
4. Pitch/QA: test matrix, slides, rehearsals, judge questions.

For 2 people, combine roles 2+3 and 1+4. Avoid adding video rendering or account systems before the core workflow is reliable.

## Important MVP caveats
- This prototype creates a production plan; it does not render finished video files.
- Hashtags are suggestions, not live trend data.
- AI outputs should be reviewed for accuracy, copyright, and suitability before publishing.
