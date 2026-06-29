---
name: seo-decision-lab
description: Use for SEO strategy and execution powered by DataForSEO, including keyword research, competitor analysis, SERP/rank checks, on-page and technical SEO audits, backlink analysis, local SEO, content and reputation analysis, and AI search/LLM brand monitoring. Use when a user wants business-owner SEO help, a site growth plan, search visibility diagnostics, or DataForSEO-backed SEO data collection.
---

# SEO Decision Lab

Use this skill when the user asks for SEO work that benefits from live DataForSEO data. Prefer the `dfs_*` MCP tools from this plugin when credentials are configured.

## Before Calling DataForSEO

1. Run `dfs_auth_status`.
2. If credentials are missing, ask the user for their DataForSEO login and API password/key, then call `dfs_save_credentials`. Never print credentials back.
3. For a first live check, run `dfs_account_status` to verify authentication and available balance.
4. Confirm the target market: country/location, language, business type, domain, competitors, and whether the task is national, local, ecommerce, app, or AI visibility.

Use `location_code: 2840` and `language_code: "en"` as the default United States market when the user does not specify another market.

## Core Workflows

### Keyword Research

Use `dfs_labs_keyword_ideas`, `dfs_labs_keyword_overview`, and `dfs_request` for Keywords Data when search volume, trends, or paid metrics are needed.

Deliver:
- keyword clusters by intent
- estimated opportunity and difficulty
- suggested landing page or content type
- quick wins from low-difficulty/high-relevance terms
- terms to avoid because they are off-intent or too competitive

### Competitor Analysis

Use `dfs_labs_ranked_keywords`, DataForSEO Labs competitor endpoints through `dfs_request`, and Google SERP live checks.

Compare:
- shared and missing keyword rankings
- competitor pages earning the most organic visibility
- SERP feature ownership
- content depth and intent fit
- backlink authority gaps when backlink data is relevant

### On-Page and Technical SEO

Start crawls with `dfs_onpage_task_post`; fetch results with `dfs_onpage_task_get`. For one-off URL checks, use the OnPage live endpoints through `dfs_request`.

Prioritize:
- indexability and crawlability problems
- title/meta/header duplication
- broken links and redirect chains
- canonical and duplicate-content issues
- internal linking opportunities
- Core Web Vitals or Lighthouse issues when relevant

### Backlink Analysis

Use `dfs_backlinks_summary` first, then `dfs_request` for backlinks, anchors, referring domains, competitors, intersections, new/lost links, and bulk metrics.

Report:
- authority and toxicity indicators
- link velocity and new/lost trends
- referring domain quality
- competitor link gaps
- practical acquisition targets

### Local SEO

Use SERP Maps/Local Finder, Business Data, Google Reviews, and Business Listings endpoints through `dfs_request`.

Evaluate:
- local pack competitors
- category and listing consistency
- reviews, ratings, and Q&A themes
- city/service-area landing page gaps
- citation opportunities and NAP consistency

### AI Search and Brand Monitoring

Use `dfs_llm_mentions_search` and AI Optimization endpoints through `dfs_request`.

Track:
- brand/entity mentions
- cited pages and domains
- competitor mentions
- answer sentiment and positioning
- query fan-out and citation patterns when returned

For `platform: "chat_gpt"`, default to `location_code: 2840` and `language_code: "en"` unless the user explicitly asks for a different supported market.

## Endpoint Selection

Read `references/dataforseo-api-map.md` when choosing an endpoint beyond the shortcut tools. Use `dfs_available_endpoints` to show available API areas inside the active MCP session.

Use `dfs_request` for any documented `/v3` endpoint that is not covered by a shortcut tool. Pass only a `/v3/...` path, not a full URL.

## Output Standard

For business-owner requests, convert raw SEO data into a decision-ready plan:

1. State the data pulled and the market/date assumptions.
2. Separate findings from recommendations.
3. Rank actions by expected impact, effort, and confidence.
4. Include next checks when the DataForSEO response is sparse, delayed, or blocked by missing credentials.
5. Avoid claiming rankings, volumes, backlinks, or AI mentions without citing the DataForSEO response used.

## Safety

- Never expose DataForSEO login, password, API key, Basic auth headers, or stored credential file contents.
- Keep live calls targeted; broad crawls and backlink exports can consume credits quickly.
- Prefer `maxArrayItems` limits for large SERP, backlink, and crawl responses.
- If an endpoint returns a task id, save and reuse the id instead of reposting expensive duplicate jobs.
