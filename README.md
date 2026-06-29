# SEO Decision Lab

SEO Decision Lab is a Codex plugin for SEO strategy and execution powered by DataForSEO. It adds a BYOK local MCP server plus a skill for keyword research, competitor analysis, SERP checks, on-page audits, backlink analysis, local SEO, content/reputation analysis, and AI search brand monitoring.

## Install

In Codex, add this repository as a plugin marketplace, then install `seo-decision-lab`.

The marketplace file is:

```text
.agents/plugins/marketplace.json
```

The plugin entry points to:

```text
plugins/seo-decision-lab
```

For local testing outside Codex plugin installation, install the MCP server dependencies:

```sh
cd plugins/seo-decision-lab
npm install
npm run smoke
```

## Configure DataForSEO

This plugin is BYOK. Each user supplies their own DataForSEO credentials after installing.

In a new Codex thread, ask:

```text
Use $seo-decision-lab and check DataForSEO auth status.
```

If credentials are missing, Codex will call `dfs_save_credentials`. Credentials are stored locally on the user's machine at:

```text
~/.config/seo-decision-lab/dataforseo.json
```

The plugin also supports environment variables:

```text
DATAFORSEO_LOGIN
DATAFORSEO_PASSWORD
```

or:

```text
DATAFORSEO_EMAIL
DATAFORSEO_API_KEY
```

## Tools

The MCP server exposes:

- `dfs_auth_status`
- `dfs_save_credentials`
- `dfs_clear_credentials`
- `dfs_account_status`
- `dfs_available_endpoints`
- `dfs_request`
- `dfs_google_serp_live`
- `dfs_labs_keyword_ideas`
- `dfs_labs_keyword_overview`
- `dfs_labs_ranked_keywords`
- `dfs_backlinks_summary`
- `dfs_llm_mentions_search`
- `dfs_onpage_task_post`
- `dfs_onpage_task_get`

## Security

Do not commit local credentials, `.env` files, Codex config files, or DataForSEO credential files. This repository intentionally ships no API keys.
