import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const plugin = JSON.parse(await readFile(path.join(root, '.codex-plugin', 'plugin.json'), 'utf8'));
const mcp = JSON.parse(await readFile(path.join(root, '.mcp.json'), 'utf8'));

if (plugin.name !== 'seo-decision-lab') throw new Error('Unexpected plugin name.');
if (plugin.mcpServers !== './.mcp.json') throw new Error('plugin.json must reference .mcp.json.');
if (!mcp.mcpServers?.['seo-decision-lab']) throw new Error('Missing seo-decision-lab MCP server config.');

const serverPath = path.join(root, 'dist', 'server.js');
const child = spawn(process.execPath, [serverPath], { stdio: ['pipe', 'pipe', 'pipe'] });
let stderr = '';
child.stderr.on('data', (chunk) => {
  stderr += chunk.toString();
});
await new Promise((resolve) => setTimeout(resolve, 750));
if (child.exitCode !== null) {
  throw new Error(`Server exited early: ${stderr}`);
}
child.kill('SIGTERM');
console.log('seo-decision-lab smoke ok');
