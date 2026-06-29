# DataForSEO API Map

Use this reference to pick DataForSEO endpoints for SEO workflows. Check https://docs.dataforseo.com/v3/ for the latest parameters before making unfamiliar calls.

## Authentication

DataForSEO v3 uses HTTP Basic auth. This plugin stores a user-provided login and API password/key locally, or reads `DATAFORSEO_LOGIN`/`DATAFORSEO_EMAIL` and `DATAFORSEO_PASSWORD`/`DATAFORSEO_API_KEY` from the environment.

## Main API Families

| API family | SEO use cases | Useful endpoint examples |
| --- | --- | --- |
| SERP API | Rank checks, SERP features, AI Mode, Maps, Local Finder, News, Images, YouTube, Bing, Yahoo, Baidu | `/v3/serp/google/organic/live/advanced`, `/v3/serp/google/ai_mode/live/advanced`, `/v3/serp/google/maps/live/advanced`, `/v3/serp/google/local_finder/live/advanced` |
| AI Optimization API | AI keyword data, LLM mentions, citations, top pages/domains, ChatGPT/Claude/Gemini/Perplexity responses | `/v3/ai_optimization/llm_mentions/search/live`, `/v3/ai_optimization/llm_mentions/top_pages/live`, `/v3/ai_optimization/chat_gpt/llm_responses/live`, `/v3/ai_optimization/perplexity/llm_responses/live` |
| Keywords Data API | Google/Bing Ads search volume, keyword ideas, ad traffic, Google Trends, DataForSEO Trends, clickstream volume | `/v3/keywords_data/google_ads/search_volume/live`, `/v3/keywords_data/google_ads/keywords_for_site/live`, `/v3/keywords_data/google_trends/explore/live`, `/v3/keywords_data/clickstream_data/global_search_volume/live` |
| DataForSEO Labs API | Keyword ideas, related keywords, intent, difficulty, ranked keywords, competitor domains, intersections, app/Amazon research | `/v3/dataforseo_labs/google/keyword_ideas/live`, `/v3/dataforseo_labs/google/search_intent/live`, `/v3/dataforseo_labs/google/ranked_keywords/live`, `/v3/dataforseo_labs/google/domain_intersection/live` |
| OnPage API | Crawls, technical SEO, duplicate tags/content, links, redirects, non-indexable pages, raw HTML, screenshots, parsing, Lighthouse | `/v3/on_page/task_post`, `/v3/on_page/summary/{task_id}`, `/v3/on_page/pages/{task_id}`, `/v3/on_page/lighthouse/live` |
| Backlinks API | Summary, backlinks, anchors, referring domains/networks, competitors, intersections, domain pages, timeseries, new/lost, bulk metrics | `/v3/backlinks/summary/live`, `/v3/backlinks/backlinks/live`, `/v3/backlinks/referring_domains/live`, `/v3/backlinks/domain_intersection/live` |
| Content Analysis API | Brand/content mention search, sentiment, rating distribution, phrase and category trends | `/v3/content_analysis/search/live`, `/v3/content_analysis/summary/live`, `/v3/content_analysis/sentiment_analysis/live`, `/v3/content_analysis/phrase_trends/live` |
| Business Data API | Local listings, Google Business Profile info, reviews, questions, hotels, Trustpilot, Tripadvisor, Pinterest | `/v3/business_data/business_listings/search/live`, `/v3/business_data/google/my_business_info/live`, `/v3/business_data/google/reviews/task_post`, `/v3/business_data/google/questions_and_answers/live` |
| Merchant API | Amazon and Google Shopping products, sellers, reviews, product visibility | `/v3/merchant/amazon/products/live/advanced`, `/v3/merchant/amazon/sellers/live/advanced`, `/v3/merchant/google/products/task_post`, `/v3/merchant/google/reviews/task_post` |
| App Data API | Google Play and App Store app searches, app info, app reviews, listings, ASO research | `/v3/app_data/google/app_searches/task_post`, `/v3/app_data/google/app_info/task_post`, `/v3/app_data/apple/app_searches/task_post`, `/v3/app_data/apple/app_reviews/task_post` |
| Domain Analytics API | Technology stacks and Whois | `/v3/domain_analytics/technologies/domain_technologies/live`, `/v3/domain_analytics/technologies/domains_by_technology/live`, `/v3/domain_analytics/whois/overview/live` |
| Databases | Bulk/prebuilt backlink, SERP, keyword, product, app, Whois, and business listing datasets | Use the Databases docs to choose the exact database endpoint and filters. |

## Business Owner Playbooks

### Fast SEO Opportunity Scan

1. `dfs_labs_ranked_keywords` for the user's domain.
2. `dfs_labs_keyword_ideas` for priority products/services.
3. `dfs_google_serp_live` for top opportunity keywords.
4. `dfs_backlinks_summary` for authority baseline.
5. Summarize quick wins and crawl/backlink follow-ups.

### Competitor Gap

1. Labs ranked keywords for user and competitors.
2. Labs competitor-domain or domain-intersection endpoints through `dfs_request`.
3. SERP live checks for high-value terms.
4. Backlinks competitors/intersection through `dfs_request` if authority is a likely constraint.
5. Produce a prioritized keyword/page/link gap table.

### Local SEO Audit

1. SERP Maps or Local Finder via `dfs_request`.
2. Business Listings search for category/location.
3. Google reviews and Q&A endpoints when a place id or listing target is available.
4. Content and page recommendations for city/service landing pages.

### AI Search Visibility Monitor

1. `dfs_llm_mentions_search` for the brand and competitors.
2. LLM Mentions top pages/domains and aggregated metrics through `dfs_request`.
3. ChatGPT/Claude/Gemini/Perplexity response endpoints for priority prompts.
4. Report citations, missing entities, competitor positioning, and pages that should be strengthened for citation eligibility.

## Access Notes

DataForSEO pricing and access rules can change. As of the June 2026 docs review, the public docs expose Backlinks API and AI Optimization API endpoints in v3. The user noted that from July 1 these areas should no longer need a separate subscription. Do not hard-code subscription gating in this plugin; if an endpoint returns an access error, surface the DataForSEO error and recommend checking account access or balance.
