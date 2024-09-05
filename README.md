# Setup instructions

1. `npm install -g @cloudflare/wrangler`
2. `wrangler login`
3. Create a `.dev.vars` file and add:
    `CARTESIA_API_KEY="<ask logan for key>"`
4. `npx wrangler dev --remote` for dev
5. `npx wrangler deploy` for prod deploy

# Testing
## Get testing environment setup
* `npm install vitest@1.5.0 --save-dev --save-exact`
* `npm install @cloudflare/vitest-pool-workers --save-dev`
## Run tests from working directory base
* `npx vitest`
