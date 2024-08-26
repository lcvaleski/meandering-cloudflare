# Setup instructions

* `npm install -g @cloudflare/wrangler`
* `wrangler login`

# Testing
## Get testing environment setup
* `npm install vitest@1.5.0 --save-dev --save-exact`
* `npm install @cloudflare/vitest-pool-workers --save-dev`
## Run tests from working directory base
* `npx vitest`

Let me know what options you have after this. The goal is for you to be able to access the `meandering` worker. And run commands such as `npx wrangler` deploy if you were to make any changes.

