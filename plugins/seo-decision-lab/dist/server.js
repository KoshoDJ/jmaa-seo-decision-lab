import { chmod, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const DEFAULT_BASE_URL = 'https://api.dataforseo.com';
const CONFIG_DIR = process.env.SEO_DECISION_LAB_CONFIG_DIR || path.join(homedir(), '.config', 'seo-decision-lab');
const CREDENTIALS_PATH = process.env.SEO_DECISION_LAB_CREDENTIALS_PATH || path.join(CONFIG_DIR, 'dataforseo.json');
const BASE_URL = (process.env.DATAFORSEO_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
const DEFAULT_ARRAY_LIMIT = 25;

export const toolNames = [
  'dfs_auth_status',
  'dfs_save_credentials',
  'dfs_clear_credentials',
  'dfs_account_status',
  'dfs_available_endpoints',
  'dfs_request',
  'dfs_google_serp_live',
  'dfs_labs_keyword_ideas',
  'dfs_labs_keyword_overview',
  'dfs_labs_ranked_keywords',
  'dfs_backlinks_summary',
  'dfs_llm_mentions_search',
  'dfs_onpage_task_post',
  'dfs_onpage_task_get',
];

const apiAreas = [
  {
    area: 'SERP API',
    use: 'Rank checks, SERP features, AI Mode, Maps, Local Finder, News, Images, YouTube, Bing, Yahoo, Baidu, and other search surfaces.',
    examples: [
      '/v3/serp/google/organic/live/advanced',
      '/v3/serp/google/ai_mode/live/advanced',
      '/v3/serp/google/maps/live/advanced',
      '/v3/serp/youtube/organic/live/advanced',
    ],
  },
  {
    area: 'AI Optimization API',
    use: 'AI search volume, LLM brand mentions, citations, top cited pages/domains, and model responses for ChatGPT, Claude, Gemini, and Perplexity.',
    examples: [
      '/v3/ai_optimization/llm_mentions/search/live',
      '/v3/ai_optimization/llm_mentions/top_pages/live',
      '/v3/ai_optimization/chat_gpt/llm_responses/live',
      '/v3/ai_optimization/gemini/llm_responses/live',
    ],
  },
  {
    area: 'Keywords Data API',
    use: 'Google Ads and Bing Ads search volume, keyword ideas, traffic estimates, Google Trends, DataForSEO Trends, and clickstream search volume.',
    examples: [
      '/v3/keywords_data/google_ads/search_volume/live',
      '/v3/keywords_data/google_ads/keywords_for_site/live',
      '/v3/keywords_data/google_trends/explore/live',
      '/v3/keywords_data/clickstream_data/dataforseo_search_volume/live',
    ],
  },
  {
    area: 'DataForSEO Labs API',
    use: 'Keyword ideas, related keywords, search intent, keyword difficulty, ranked keywords, competitor domains, intersections, traffic estimates, app SEO, and Amazon research.',
    examples: [
      '/v3/dataforseo_labs/google/keyword_ideas/live',
      '/v3/dataforseo_labs/google/keyword_overview/live',
      '/v3/dataforseo_labs/google/ranked_keywords/live',
      '/v3/dataforseo_labs/google/competitors_domain/live',
    ],
  },
  {
    area: 'OnPage API',
    use: 'Technical SEO crawls, pages, duplicate tags/content, links, redirect chains, non-indexable pages, keyword density, raw HTML, screenshots, content parsing, instant pages, and Lighthouse.',
    examples: [
      '/v3/on_page/task_post',
      '/v3/on_page/summary/{task_id}',
      '/v3/on_page/pages/{task_id}',
      '/v3/on_page/lighthouse/live',
    ],
  },
  {
    area: 'Backlinks API',
    use: 'Backlink summaries, anchors, referring domains, competitors, domain/page intersections, domain pages, time series, new/lost links, and bulk backlink metrics.',
    examples: [
      '/v3/backlinks/summary/live',
      '/v3/backlinks/backlinks/live',
      '/v3/backlinks/competitors/live',
      '/v3/backlinks/domain_intersection/live',
    ],
  },
  {
    area: 'Content Analysis API',
    use: 'Content search, brand/content mentions, sentiment, rating distribution, phrase trends, and category trends.',
    examples: [
      '/v3/content_analysis/search/live',
      '/v3/content_analysis/summary/live',
      '/v3/content_analysis/sentiment_analysis/live',
      '/v3/content_analysis/phrase_trends/live',
    ],
  },
  {
    area: 'Local and Business Data',
    use: 'Business listings, Google Business Profile info, Google reviews, Q&A, hotels, Trustpilot, Tripadvisor, and local reputation research.',
    examples: [
      '/v3/business_data/business_listings/search/live',
      '/v3/business_data/google/my_business_info/live',
      '/v3/business_data/google/reviews/task_post',
      '/v3/business_data/google/questions_and_answers/live',
    ],
  },
  {
    area: 'Merchant and App Data',
    use: 'Amazon, Google Shopping, Google Play, and App Store competitive research, reviews, app keywords, app intersections, and product visibility.',
    examples: [
      '/v3/merchant/amazon/products/live/advanced',
      '/v3/merchant/google/products/task_post',
      '/v3/app_data/google/app_searches/task_post',
      '/v3/app_data/apple/app_info/task_post',
    ],
  },
  {
    area: 'Domain Analytics and Databases',
    use: 'Technology stacks, Whois, prebuilt SERP/keyword/product/app/business listing databases, and historical datasets.',
    examples: [
      '/v3/domain_analytics/technologies/domain_technologies/live',
      '/v3/domain_analytics/whois/overview/live',
      '/v3/dataforseo_labs/google/historical_serps/live',
      '/v3/appendix/user_data',
    ],
  },
];

function textResult(value) {
  return {
    content: [
      {
        type: 'text',
        text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

async function ensureConfigDir() {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  await chmod(CONFIG_DIR, 0o700).catch(() => undefined);
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function envCredentials() {
  const login = process.env.DATAFORSEO_LOGIN || process.env.DATAFORSEO_EMAIL || process.env.DFS_LOGIN || process.env.DFS_EMAIL;
  const password = process.env.DATAFORSEO_PASSWORD || process.env.DATAFORSEO_API_KEY || process.env.DFS_PASSWORD || process.env.DFS_API_KEY;
  if (!login || !password) return null;
  return { login, password, source: 'environment' };
}

async function storedCredentials() {
  try {
    const parsed = JSON.parse(await readFile(CREDENTIALS_PATH, 'utf8'));
    if (typeof parsed.login === 'string' && typeof parsed.password === 'string') {
      return { login: parsed.login, password: parsed.password, source: 'stored' };
    }
  } catch {
    return null;
  }
  return null;
}

async function credentials() {
  return envCredentials() || (await storedCredentials());
}

async function saveCredentials(login, password) {
  await ensureConfigDir();
  await writeFile(CREDENTIALS_PATH, JSON.stringify({ login, password }, null, 2), { mode: 0o600 });
  await chmod(CREDENTIALS_PATH, 0o600).catch(() => undefined);
}

function dataForSeoAuthHeader(creds) {
  return `Basic ${Buffer.from(`${creds.login}:${creds.password}`).toString('base64')}`;
}

function normalizePath(endpointPath) {
  if (typeof endpointPath !== 'string') {
    throw new Error('DataForSEO endpoint path must be a string.');
  }
  if (/https?:\/\//i.test(endpointPath)) {
    throw new Error('Pass only a DataForSEO /v3 path, not a full URL.');
  }
  if (!endpointPath.startsWith('/v3/')) {
    throw new Error('DataForSEO endpoint path must start with /v3/.');
  }
  if (/\s/.test(endpointPath)) {
    throw new Error('DataForSEO endpoint path must not contain whitespace.');
  }
  return endpointPath;
}

function appendQuery(url, query) {
  if (!query || typeof query !== 'object' || Array.isArray(query)) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
    } else {
      url.searchParams.set(key, String(value));
    }
  }
}

function truncate(value, maxArrayItems = DEFAULT_ARRAY_LIMIT, depth = 0) {
  if (depth > 8) return '[truncated: max depth reached]';
  if (Array.isArray(value)) {
    const items = value.slice(0, maxArrayItems).map((item) => truncate(item, maxArrayItems, depth + 1));
    if (value.length > maxArrayItems) {
      items.push({ truncated_items: value.length - maxArrayItems });
    }
    return items;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, truncate(item, maxArrayItems, depth + 1)]));
  }
  return value;
}

async function callDataForSeo({ endpointPath, method = 'POST', body, query, maxArrayItems = DEFAULT_ARRAY_LIMIT, includeRaw = false }) {
  const creds = await credentials();
  if (!creds) {
    throw new Error('DataForSEO credentials are not configured. Run dfs_save_credentials or set DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD.');
  }

  const normalizedPath = normalizePath(endpointPath);
  const url = new URL(`${BASE_URL}${normalizedPath}`);
  appendQuery(url, query);
  const upperMethod = method.toUpperCase();
  const headers = {
    Authorization: dataForSeoAuthHeader(creds),
    Accept: 'application/json',
  };
  const init = { method: upperMethod, headers };
  if (upperMethod !== 'GET') {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body ?? []);
  }

  const response = await fetch(url, init);
  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return {
    ok: response.ok,
    status: response.status,
    endpoint: normalizedPath,
    cost: parsed && typeof parsed === 'object' ? parsed.cost ?? null : null,
    tasks_count: parsed && typeof parsed === 'object' ? parsed.tasks_count ?? null : null,
    data: includeRaw ? parsed : truncate(parsed, maxArrayItems),
  };
}

function taskPayload(task) {
  return [task];
}

function createServer() {
  const server = new McpServer({
    name: 'seo-decision-lab',
    version: '0.1.0',
  });

  server.tool('dfs_auth_status', 'Check whether DataForSEO credentials are configured without exposing secret values.', {}, async () => {
    const env = envCredentials();
    const stored = await storedCredentials();
    return textResult({
      configured: Boolean(env || stored),
      active_source: env ? 'environment' : stored ? 'stored' : null,
      stored_credentials_present: Boolean(stored),
      credentials_path: CREDENTIALS_PATH,
      base_url: BASE_URL,
      accepted_env_vars: ['DATAFORSEO_LOGIN', 'DATAFORSEO_EMAIL', 'DATAFORSEO_PASSWORD', 'DATAFORSEO_API_KEY'],
    });
  });

  server.tool('dfs_save_credentials', 'Save DataForSEO BYOK credentials locally for this plugin. The password is the DataForSEO API password/key.', {
    login: z.string().min(1).describe('DataForSEO account login, usually the account email.'),
    password: z.string().min(1).describe('DataForSEO API password/key. It will be stored with 0600 file permissions.'),
  }, async ({ login, password }) => {
    await saveCredentials(login, password);
    return textResult({
      saved: true,
      credentials_path: CREDENTIALS_PATH,
      active_source: envCredentials() ? 'environment' : 'stored',
      note: 'Stored credentials are not printed back by this tool.',
    });
  });

  server.tool('dfs_clear_credentials', 'Remove locally stored DataForSEO credentials. Environment credentials, if set, remain active.', {}, async () => {
    await rm(CREDENTIALS_PATH, { force: true });
    return textResult({
      cleared: true,
      credentials_path: CREDENTIALS_PATH,
      environment_credentials_still_active: Boolean(envCredentials()),
    });
  });

  server.tool('dfs_account_status', 'Fetch DataForSEO user/account data to verify credentials and available balance.', {}, async () => {
    return textResult(await callDataForSeo({ endpointPath: '/v3/appendix/user_data', method: 'GET' }));
  });

  server.tool('dfs_available_endpoints', 'List the major DataForSEO API areas this plugin can use and example /v3 endpoint paths.', {}, async () => {
    return textResult({
      api_base_url: BASE_URL,
      docs: 'https://docs.dataforseo.com/v3/',
      areas: apiAreas,
      escape_hatch: 'Use dfs_request with any documented /v3 endpoint path when a workflow needs a DataForSEO endpoint not covered by a shortcut tool.',
    });
  });

  server.tool('dfs_request', 'Call any documented DataForSEO /v3 endpoint with BYOK credentials. Use this for advanced SERP, AI, local, content, merchant, app, or database calls.', {
    method: z.enum(['GET', 'POST']).default('POST'),
    path: z.string().describe('DataForSEO endpoint path beginning with /v3/, for example /v3/dataforseo_labs/google/keyword_ideas/live.'),
    body: z.any().optional().describe('JSON request body. DataForSEO POST endpoints usually expect an array of task objects.'),
    query: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number(), z.boolean()]))])).optional(),
    maxArrayItems: z.number().int().min(1).max(200).default(DEFAULT_ARRAY_LIMIT),
    includeRaw: z.boolean().default(false).describe('Return the full response. Prefer false for large SERP/backlink responses.'),
  }, async ({ method, path: endpointPath, body, query, maxArrayItems, includeRaw }) => {
    return textResult(await callDataForSeo({ endpointPath, method, body, query, maxArrayItems, includeRaw }));
  });

  server.tool('dfs_google_serp_live', 'Run a live Google organic SERP request for rank and SERP feature analysis.', {
    keyword: z.string().min(1),
    locationCode: z.number().int().default(2840).describe('DataForSEO location code. 2840 is United States.'),
    languageCode: z.string().default('en'),
    device: z.enum(['desktop', 'mobile']).default('desktop'),
    depth: z.number().int().min(1).max(700).default(10),
    maxArrayItems: z.number().int().min(1).max(200).default(DEFAULT_ARRAY_LIMIT),
  }, async ({ keyword, locationCode, languageCode, device, depth, maxArrayItems }) => {
    const body = taskPayload({ keyword, location_code: locationCode, language_code: languageCode, device, depth });
    return textResult(await callDataForSeo({
      endpointPath: '/v3/serp/google/organic/live/advanced',
      method: 'POST',
      body,
      maxArrayItems,
    }));
  });

  server.tool('dfs_labs_keyword_ideas', 'Find keyword ideas from seed terms with DataForSEO Labs.', {
    keywords: z.array(z.string().min(1)).min(1).max(200),
    locationCode: z.number().int().default(2840),
    languageCode: z.string().default('en'),
    limit: z.number().int().min(1).max(1000).default(100),
    includeSeedKeyword: z.boolean().default(true),
    maxArrayItems: z.number().int().min(1).max(200).default(DEFAULT_ARRAY_LIMIT),
  }, async ({ keywords, locationCode, languageCode, limit, includeSeedKeyword, maxArrayItems }) => {
    const body = taskPayload({
      keywords,
      location_code: locationCode,
      language_code: languageCode,
      limit,
      include_seed_keyword: includeSeedKeyword,
    });
    return textResult(await callDataForSeo({
      endpointPath: '/v3/dataforseo_labs/google/keyword_ideas/live',
      method: 'POST',
      body,
      maxArrayItems,
    }));
  });

  server.tool('dfs_labs_keyword_overview', 'Get DataForSEO Labs keyword overview metrics for one keyword.', {
    keyword: z.string().min(1),
    locationCode: z.number().int().default(2840),
    languageCode: z.string().default('en'),
    maxArrayItems: z.number().int().min(1).max(200).default(DEFAULT_ARRAY_LIMIT),
  }, async ({ keyword, locationCode, languageCode, maxArrayItems }) => {
    const body = taskPayload({ keyword, location_code: locationCode, language_code: languageCode });
    return textResult(await callDataForSeo({
      endpointPath: '/v3/dataforseo_labs/google/keyword_overview/live',
      method: 'POST',
      body,
      maxArrayItems,
    }));
  });

  server.tool('dfs_labs_ranked_keywords', 'Get organic keywords a domain ranks for in DataForSEO Labs.', {
    target: z.string().min(1).describe('Domain or URL to analyze.'),
    locationCode: z.number().int().default(2840),
    languageCode: z.string().default('en'),
    limit: z.number().int().min(1).max(1000).default(100),
    maxArrayItems: z.number().int().min(1).max(200).default(DEFAULT_ARRAY_LIMIT),
  }, async ({ target, locationCode, languageCode, limit, maxArrayItems }) => {
    const body = taskPayload({ target, location_code: locationCode, language_code: languageCode, limit });
    return textResult(await callDataForSeo({
      endpointPath: '/v3/dataforseo_labs/google/ranked_keywords/live',
      method: 'POST',
      body,
      maxArrayItems,
    }));
  });

  server.tool('dfs_backlinks_summary', 'Get backlink summary metrics for a domain, subdomain, URL, or page.', {
    target: z.string().min(1),
    includeSubdomains: z.boolean().default(true),
    backlinksStatusType: z.enum(['all', 'live', 'lost']).default('live'),
    maxArrayItems: z.number().int().min(1).max(200).default(DEFAULT_ARRAY_LIMIT),
  }, async ({ target, includeSubdomains, backlinksStatusType, maxArrayItems }) => {
    const body = taskPayload({
      target,
      include_subdomains: includeSubdomains,
      backlinks_status_type: backlinksStatusType,
    });
    return textResult(await callDataForSeo({
      endpointPath: '/v3/backlinks/summary/live',
      method: 'POST',
      body,
      maxArrayItems,
    }));
  });

  server.tool('dfs_llm_mentions_search', 'Search AI Optimization LLM mentions for a brand, product, domain, or query topic.', {
    target: z.string().min(1).describe('Brand, product, domain, or entity to find in LLM mention results.'),
    platform: z.enum(['chat_gpt', 'claude', 'gemini', 'perplexity']).default('chat_gpt'),
    locationCode: z.number().int().default(2840),
    languageCode: z.string().default('en'),
    limit: z.number().int().min(1).max(1000).default(100),
    maxArrayItems: z.number().int().min(1).max(200).default(DEFAULT_ARRAY_LIMIT),
  }, async ({ target, platform, locationCode, languageCode, limit, maxArrayItems }) => {
    const body = taskPayload({
      target,
      platform,
      location_code: locationCode,
      language_code: languageCode,
      limit,
    });
    return textResult(await callDataForSeo({
      endpointPath: '/v3/ai_optimization/llm_mentions/search/live',
      method: 'POST',
      body,
      maxArrayItems,
    }));
  });

  server.tool('dfs_onpage_task_post', 'Start a DataForSEO OnPage crawl for technical SEO auditing.', {
    target: z.string().url().describe('Website URL to crawl.'),
    maxCrawlPages: z.number().int().min(1).max(100000).default(100),
    enableJavascript: z.boolean().default(false),
    customSitemap: z.string().url().optional(),
    tag: z.string().optional(),
    maxArrayItems: z.number().int().min(1).max(200).default(DEFAULT_ARRAY_LIMIT),
  }, async ({ target, maxCrawlPages, enableJavascript, customSitemap, tag, maxArrayItems }) => {
    const task = {
      target,
      max_crawl_pages: maxCrawlPages,
      enable_javascript: enableJavascript,
    };
    if (customSitemap) task.custom_sitemap = customSitemap;
    if (tag) task.tag = tag;
    return textResult(await callDataForSeo({
      endpointPath: '/v3/on_page/task_post',
      method: 'POST',
      body: taskPayload(task),
      maxArrayItems,
    }));
  });

  server.tool('dfs_onpage_task_get', 'Fetch a DataForSEO OnPage task result such as summary, pages, links, duplicate tags, or redirect chains.', {
    taskId: z.string().min(1),
    report: z.enum(['summary', 'pages', 'links', 'duplicate_tags', 'duplicate_content', 'redirect_chains', 'non_indexable', 'resources', 'keyword_density', 'microdata']).default('summary'),
    body: z.any().optional().describe('Optional POST body for report endpoints that support filters, limit, or offset.'),
    maxArrayItems: z.number().int().min(1).max(200).default(DEFAULT_ARRAY_LIMIT),
  }, async ({ taskId, report, body, maxArrayItems }) => {
    return textResult(await callDataForSeo({
      endpointPath: `/v3/on_page/${report}/${taskId}`,
      method: 'POST',
      body: body ?? [],
      maxArrayItems,
    }));
  });

  return server;
}

export async function main() {
  const server = createServer();
  await server.connect(new StdioServerTransport());
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
