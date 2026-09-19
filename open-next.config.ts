import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

// OpenNext adapter config for Cloudflare Workers. The full-stack app
// (App Router, API routes, Studio) runs on the Workers runtime with
// nodejs_compat; ISR/incremental cache is backed by R2.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
