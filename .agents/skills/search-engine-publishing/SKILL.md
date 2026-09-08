# Search Engine Publishing Skill

## Purpose

Install, repair, validate, and operate a reusable post-deployment search-engine publishing pipeline for static and Astro websites. The primary notification mechanism is IndexNow for participating search engines. Google discovery is handled through standards-compliant XML sitemaps, accurate lastmod values, internal linking, and Search Console rather than the deprecated Google sitemap ping endpoint.

Use this skill when asked to:

- install IndexNow on a website
- repair a broken IndexNow workflow
- create WordPress-like search-engine notifications for a static site
- add automated search-engine publishing to Astro
- migrate an existing IndexNow implementation to Astro
- validate an IndexNow key
- configure production and staging hosts safely
- create the same publishing process for another agency/client website
- diagnose IndexNow HTTP 400, 403, 422, or 429 responses

## Core principles

1. Production URLs may be submitted to IndexNow automatically after a successful deployment.
2. Staging, preview, localhost, and pages.dev branch environments must not be submitted for indexing unless the user explicitly requests it.
3. Staging may still validate its own IndexNow key file to prove the mechanism works.
4. Every hostname submitted to IndexNow must use a key file available from that same hostname or an IndexNow-compliant keyLocation.
5. Preserve a known-working production key. Do not rotate it merely because a new implementation is being installed.
6. Rotate a key only when troubleshooting demonstrates that the current key is unusable or a clean verification cycle is required.
7. Treat HTTP 200 and HTTP 202 from IndexNow as accepted responses.
8. Never use Google's Indexing API for ordinary webpages or blog posts. Google discovery should rely on sitemap.xml/sitemap-index.xml, accurate lastmod, canonical URLs, internal links, and Search Console.
9. Do not submit URLs that are noindex, non-canonical, redirects, staging URLs, or outside the declared host.
10. Prefer post-deployment verification over assuming a GitHub commit is already live on the CDN.

## Required inputs

Determine these values from the repository and deployment configuration whenever possible before asking the user:

- repository name
- framework: Astro, static HTML, or other
- production domain
- production branch
- staging/development hostname, if any
- staging branch, if any
- Cloudflare Pages project name, if used
- sitemap location(s)
- current IndexNow key and key file, if one exists
- build output directory
- whether the site uses an Astro-generated sitemap index or committed sitemap files

If the information can be discovered from the repository, GitHub Actions, Cloudflare check runs, package.json, astro.config.*, sitemap files, or deployment records, discover it instead of asking the user.

## Repository audit

Before changing anything, inspect:

- `.github/workflows/`
- `package.json`
- `astro.config.mjs`, `astro.config.ts`, or equivalent
- `public/`
- root-level `*.txt` files that may be IndexNow keys
- `sitemap.xml`
- `sitemap-index.xml`
- secondary sitemap files
- `robots.txt`
- `_headers`
- `_redirects`
- any scripts containing `indexnow`, `sitemap`, `ping`, `submit`, or `search engine`

If a previous IndexNow workflow exists, inspect its recent GitHub Actions runs and logs before replacing it. Preserve working behavior and repair only what is necessary.

## Key generation and placement

IndexNow keys must be 8-128 characters and use only allowed characters. Generate a cryptographically random value when a new key is required.

### Static site

Place the key file at the deployed site root, for example:

`<KEY>.txt`

Contents must be exactly:

`<KEY>`

### Astro

Place the key file in:

`public/<KEY>.txt`

Astro will copy it to the root of the final build.

Verify after deployment that:

`https://<HOST>/<KEY>.txt`

returns HTTP 200 and a response body exactly matching the key after trimming surrounding whitespace.

## Production and staging strategy

Use separate keys for production and staging when staging validation is desired.

Example:

- production host: `example.com`
- production key: `PROD_KEY`
- staging host: `feature.example-project.pages.dev`
- staging key: `STAGING_KEY`

Production workflow behavior:

1. wait for deployment to settle or, preferably, trigger after a confirmed deployment event
2. fetch the production key file
3. verify exact body match
4. obtain indexable URLs from the live or built sitemap
5. filter URLs to the exact production host
6. deduplicate URLs
7. submit to `https://api.indexnow.org/indexnow`
8. accept HTTP 200 or 202 as success
9. log URL count and response status
10. fail clearly on validation or submission errors

Staging workflow behavior:

1. wait for staging deployment
2. verify the staging key file on the actual deployed branch hostname
3. report successful validation
4. do NOT send the staging URLs to IndexNow

## Cloudflare Pages branch-host rule

Do not assume the plain project hostname is the URL for a non-production branch.

For a Cloudflare Pages project named `example-project` and branch `feature-x`, the branch URL is commonly:

`feature-x.example-project.pages.dev`

The unique deployment URL may also look like:

`<deployment-id>.example-project.pages.dev`

Use GitHub's Cloudflare Pages check run to discover the actual branch preview URL whenever possible. Do not hard-code an assumed pages.dev hostname without checking the deployment record.

## Sitemap handling

### Astro-generated sitemap

When `@astrojs/sitemap` is used, inspect `astro.config.*` for the `site` value. The sitemap may be generated as:

- `/sitemap-index.xml`
- one or more `/sitemap-*.xml` child files

The workflow may fetch the live sitemap index and recursively collect child sitemap URLs after deployment.

### Committed static sitemap

If the repository commits sitemap files, read those files directly in CI after checkout.

Support multiple sitemap files when required, including a separate blog sitemap.

### URL validation

Before submission:

- require `https://`
- require exact production hostname
- deduplicate
- exclude obvious staging/preview hosts
- exclude noindex URLs when this can be determined reliably
- do not submit sitemap files themselves as page URLs
- enforce IndexNow's maximum batch size of 10,000 URLs per request

## Full-sitemap vs changed-URL submission

A full-sitemap submission is acceptable for small sites and is useful as a reliable baseline.

For mature sites, prefer changed-URL submission when the repository structure supports deterministic URL mapping.

Changed-URL logic should consider:

- newly added page files
- modified page files
- deleted page files
- new/updated Astro content collection entries
- new/updated blog Markdown/MDX files
- route-generating configuration changes

When changed-file-to-URL mapping is ambiguous, fall back to the sitemap rather than risk submitting incorrect URLs.

Deleted URLs may be submitted to IndexNow after the production deployment has made the deletion or redirect live.

## Recommended GitHub Actions safeguards

Use:

- explicit production branches
- `workflow_dispatch` for manual testing when useful
- `concurrency` to prevent duplicate overlapping submissions
- a reasonable timeout
- post-deployment delay only when a deployment-completion trigger is unavailable
- clear diagnostic logging

Never log secrets that are actually sensitive. An IndexNow key is designed to be publicly retrievable through its key file, but avoid unnecessary duplication in logs.

## IndexNow request

POST to:

`https://api.indexnow.org/indexnow`

JSON payload:

```json
{
  "host": "example.com",
  "key": "<KEY>",
  "keyLocation": "https://example.com/<KEY>.txt",
  "urlList": [
    "https://example.com/page-one/",
    "https://example.com/blog/article/"
  ]
}
```

Use:

`Content-Type: application/json; charset=utf-8`

## Response handling

### HTTP 200

Success. Submission accepted.

### HTTP 202

Accepted. Treat as success; verification/processing may still be occurring.

### HTTP 400

Malformed request. Check JSON shape, host, key, keyLocation, and URL list.

### HTTP 403

Key/site authorization failed.

Troubleshooting order:

1. fetch the keyLocation from an external runner
2. confirm HTTP 200
3. confirm body exactly matches the configured key
4. confirm host and keyLocation correspond to the submitted site
5. inspect Cloudflare WAF/Bot rules
6. inspect IndexNow response body
7. if all external verification succeeds but IndexNow remains stuck on authorization, consider rotating the key once and retrying

Do not assume Cloudflare is the cause when the key file is demonstrably reachable by the relevant verifier.

### HTTP 422

The request is semantically invalid, commonly because one or more URLs do not belong to the declared host/protocol. Filter the URL list again.

### HTTP 429

Rate limited. Do not hammer the endpoint. Allow the next deployment or a later manual run to retry.

## Google handling

Do not attempt to recreate obsolete WordPress ping services for Google.

For Google:

- maintain a valid XML sitemap
- use accurate `lastmod`
- ensure canonical URLs are correct
- keep important pages internally linked
- list the sitemap in robots.txt when appropriate
- submit/monitor the sitemap through Google Search Console

Google's Indexing API must not be used for normal webpages or ordinary blog posts.

## Migration from static site to Astro

When the production domain is moving from static HTML to Astro:

1. preserve the working production hostname
2. preserve the proven production IndexNow key
3. copy the production key file into Astro `public/`
4. make sure Astro's `site` property is the production canonical domain
5. validate the Astro-generated sitemap
6. keep staging submissions disabled
7. validate staging using its branch hostname and separate staging key if desired
8. after cutover, run the production workflow against the production domain
9. confirm IndexNow returns HTTP 200 or 202
10. confirm Search Console sitemap remains valid

## Completion criteria

Do not report the implementation as working until evidence supports it.

Production is complete only when:

- production key file returns HTTP 200 with the exact key
- sitemap URLs resolve to the correct production host
- GitHub Actions workflow completes successfully
- IndexNow returns HTTP 200 or 202
- submitted URL count is reported

Staging validation is complete only when:

- the actual Cloudflare branch deployment URL is identified
- staging key file returns HTTP 200 with the exact staging key
- staging workflow completes successfully
- staging URLs were not submitted unless explicitly requested

## Reporting format

After implementation, report:

- repository and branch modified
- production hostname
- production key status (do not unnecessarily print the entire key)
- staging hostname and validation status
- sitemap source
- IndexNow HTTP response
- number of URLs submitted
- files created/modified
- any remaining Cloudflare or Search Console action the user must perform

## Reuse directive

This skill is site-agnostic. Never hard-code James Martial Arts Academy, KarateLoco, or any other client name into a new implementation unless it is discovered from that target repository. Always derive target-specific values from the repository and deployment environment first.
