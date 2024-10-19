# Setup instructions

1. `npm install -g @cloudflare/wrangler`
2. `wrangler login` (you must be a part of Logan's org)
3. Create a `.dev.vars` file and add (ask Logan for the keys):
    `CARTESIA_API_KEY=""`
    `OPENAI_API_KEY=""`
    `CREATE_VOICE_ROUTE=""`
    `GENERATE_AUDIO_SEGMENT_ROUTE=""`
    `GENERATE_TEXT_SEGMENT_ROUTE=""`
    `GENERATE_STORY_ROUTE=""`
4. `npx wrangler dev --remote` for dev
5. `npx wrangler deploy` for prod deploy

# Testing

## Get testing environment setup
* `npm install vitest@1.5.0 --save-dev --save-exact`
* `npm install @cloudflare/vitest-pool-workers --save-dev`

## Run tests from working directory base
* `npx vitest`

# Manual testing

```curl -X POST http://localhost:8787/3rRwebcr-generate-story \
  -H "Content-Type: application/json" \
  -d '{
    "story_type": "boring",
    "segments": 5,
    "voice": "a0e99841-438c-4a64-b679-ae501e7d6091"
  }'```
    