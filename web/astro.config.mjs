// @ts-check
import { cpSync, createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { HOSTING, standaloneRegions } from '../pipeline/src/hosting.ts';
import { CITIES, REGIONS } from '../pipeline/src/places.ts';

// hosting settings (TILES_ORIGIN, SITE_DOMAIN) live in the repo-root .env, never in git
const ENV = fileURLToPath(new URL('../.env', import.meta.url));
if (existsSync(ENV)) process.loadEnvFile(ENV);

/**
 * Map data is not in web/public. In dev, /regions/* is served from the export cache
 * (data/web/regions: what `npm run export` built and `npm run publish` has not uploaded yet), and
 * everything else is proxied from production (R2), same-origin, so any dev port works without CORS.
 * The built site loads R2 directly.
 */
const CACHE = fileURLToPath(new URL('../data/web/', import.meta.url));
/** SITE_REGIONS (standalone site): only these regions get pages, and their data ships inside dist/ */
const STANDALONE = standaloneRegions();
const siteCities = () => Object.entries(CITIES).filter(([, c]) => !STANDALONE.length || STANDALONE.includes(c.region));
const TYPES = { avif: 'image/avif', webp: 'image/webp', json: 'application/json' };

/** @returns {import('vite').Plugin} */
const regionsOverlay = () => ({
	name: 'regions-overlay',
	configureServer(server) {
		server.middlewares.use('/regions/', (req, res) => {
			const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
			const file = CACHE + 'regions' + path;
			if (!path.includes('..') && existsSync(file) && statSync(file).isFile()) {
				res.setHeader('Content-Type', TYPES[/** @type {'avif'|'webp'|'json'} */ (file.split('.').pop())] ?? 'application/octet-stream');
				res.setHeader('Cache-Control', 'no-store');
				res.setHeader('X-Source', 'local-cache');
				createReadStream(file).pipe(res);
				return;
			}
			if (!HOSTING.origin) { res.statusCode = 404; res.end('not in the export cache'); return; } // standalone: no production
			fetch(`${HOSTING.origin}/regions${req.url}`).then(async (r) => {
				res.statusCode = r.status;
				for (const h of ['content-type', 'cache-control', 'etag']) { const v = r.headers.get(h); if (v) res.setHeader(h, v); }
				res.setHeader('X-Source', 'r2');
				res.end(Buffer.from(await r.arrayBuffer()));
			}).catch((e) => { res.statusCode = 502; res.end(String(e)); });
		});
	},
});

/**
 * Real 301s for capitalised city links (/Tel-Aviv-Yafo → /tel-aviv-yafo): writes dist/_redirects,
 * which Cloudflare static assets apply before anything else. Matching is case-sensitive, so each city
 * gets its Title-Case and title-based spellings; anything else still falls back to 404.html's script.
 * (Not Astro's `redirects`: /Tel-Aviv-Yafo.html and /tel-aviv-yafo.html collide on macOS.)
 */
/** @returns {import('astro').AstroIntegration} */
const cityRedirects = () => ({
	name: 'city-redirects',
	hooks: {
		'astro:build:done': ({ dir }) => {
			const lines = [];
			for (const [slug, city] of siteCities()) {
				const titleCase = slug.replace(/(^|-)([a-z])/g, (_, s, c) => s + c.toUpperCase());
				const fromTitle = city.title.trim().replace(/\s+/g, '-');
				for (const from of new Set([titleCase, fromTitle, slug.toUpperCase()])) {
					if (from !== slug && /^[\w-]+$/.test(from)) lines.push(`/${from} /${slug} 301`);
				}
			}
			writeFileSync(new URL('_redirects', dir), lines.join('\n') + '\n');
		},
	},
});

/**
 * The running dev server's URL in data/dev-server.json (removed when it stops): the test and film scripts
 * (pipeline/src/paths.ts siteUrl) open it when given no URL and SITE_URL is empty, whatever port Astro picked.
 */
const DEV_SERVER = fileURLToPath(new URL('../data/dev-server.json', import.meta.url));
/** @returns {import('astro').AstroIntegration} */
const devServerUrl = () => ({
	name: 'dev-server-url',
	hooks: {
		'astro:server:start': ({ address }) => {
			mkdirSync(fileURLToPath(new URL('../data/', import.meta.url)), { recursive: true });
			writeFileSync(DEV_SERVER, JSON.stringify({ url: `http://localhost:${address.port}/`, pid: process.pid }));
		},
		'astro:server:done': () => rmSync(DEV_SERVER, { force: true }),
	},
});

/**
 * Standalone site (SITE_REGIONS): copies each region's exported data (data/web/regions/<region>: tiles, data,
 * previews) into dist/regions/, drops the social cards of cities without a page, names the web app after
 * SITE_NAME, and ships the licences (LICENSE.txt, THIRD-PARTY-NOTICES.txt). dist/ is then the whole site:
 * upload it to any static host.
 */
/** @returns {import('astro').AstroIntegration} */
const standaloneBundle = () => ({
	name: 'standalone-bundle',
	hooks: {
		'astro:build:done': ({ dir }) => {
			if (!STANDALONE.length) return;
			const out = fileURLToPath(dir);
			for (const r of STANDALONE) {
				const src = `${CACHE}regions/${r}`;
				if (!existsSync(`${src}/data/world.json`)) throw new Error(`SITE_REGIONS: ${r} has no export in ${src} (npm run export -- ${r})`);
				cpSync(src, `${out}regions/${r}`, { recursive: true });
			}
			const keep = new Set(siteCities().map(([slug]) => `${slug}.jpg`));
			for (const f of existsSync(`${out}og`) ? readdirSync(`${out}og`) : []) if (!keep.has(f)) rmSync(`${out}og/${f}`);
			const manifest = JSON.parse(readFileSync(`${out}site.webmanifest`, 'utf8'));
			const name = process.env.SITE_NAME || STANDALONE.map((r) => REGIONS[r].title).join(' · ');
			Object.assign(manifest, { name, short_name: name, description: process.env.SITE_DESCRIPTION || manifest.description });
			writeFileSync(`${out}site.webmanifest`, JSON.stringify(manifest, null, 2) + '\n');
			const root = fileURLToPath(new URL('../', import.meta.url));
			cpSync(`${root}LICENSE`, `${out}LICENSE.txt`);
			// the libraries bundled into the page's scripts: their notices travel with them (MIT, BSD-3-Clause)
			const libs = [['openseadragon', 'LICENSE.txt'], ['three', 'LICENSE'], ['astro', 'LICENSE']];
			writeFileSync(`${out}THIRD-PARTY-NOTICES.txt`, libs.map(([lib, file]) =>
				`== ${lib} ==\n\n${readFileSync(`${root}node_modules/${lib}/${file}`, 'utf8').trim()}\n`).join('\n'));
			console.log(`standalone: ${STANDALONE.join(', ')} bundled into dist/regions/`);
		},
	},
});

// https://astro.build/config
export default defineConfig({
	integrations: [cityRedirects(), devServerUrl(), standaloneBundle()],
	site: process.env.SITE_DOMAIN ? `https://${process.env.SITE_DOMAIN}` : undefined,
	vite: {
		// the browser has no process.env: bake the tile origin into the viewer
		// SOURCE_URL: where the code and the pipeline (the method to rebuild the derived database, ODbL) are published
		define: { __TILES_ORIGIN__: JSON.stringify(HOSTING.origin), __WEB_CACHE__: JSON.stringify(CACHE),
			__SOURCE_URL__: JSON.stringify(process.env.SOURCE_URL || 'https://github.com/krasun/isometricworld'),
			__STANDALONE__: JSON.stringify(STANDALONE.length > 0) },
		// pre-bundle the viewer so the dev server never serves a stale dependency
		optimizeDeps: { include: ['openseadragon'] },
		plugins: [regionsOverlay()],
	},
});
