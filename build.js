import { build, serve } from "bun";
import { watch } from "fs";
import { version, description, author, match, displayName } from "./package.json"

const banner = await Bun.file("./banner.txt").text()

async function buildUserScript(action, file) {
	if (action && file) console.log(`${file} ${action}d, rebuilding...`)
	
	const start = performance.now();

	try {
		await build({
			entrypoints: ["./src/index.js"],
			outdir: "./dist",
			banner: banner
			.replace("$DISPLAYNAME", displayName)
			.replace("$VERSION", version)
			.replace("$DESCRIPTION", description)
			.replace("$AUTHOR", author.name)
			.replace("$NAMESPACE", author.url)
			.replace("$MATCHES", match.map(match => `// @match		${match}`).join("\n")),
			sourcemap: process.argv.includes("--sourcemap") || process.argv.includes("--watch") ? "inline" : "none",
			minify: process.argv.includes("--minify"),
			format: "esm"
		})
		
		const end = performance.now();
		
		console.log(`Built in: ${(end - start).toFixed(2)}ms`);
	} catch (error) {
		const end = performance.now();

		console.error(`Build failed in ${(end - start).toFixed(2)}ms:\n`, error);
	}
}

await buildUserScript();

async function serveUserScript (req) {
	console.log(`${app.requestIP(req).address} | ${req.url}`)

	return new Response(await Bun.file("./dist/index.js").text())
}

if (process.argv.includes("--watch")) {
	watch("./src", { recursive: true },  buildUserScript)
	
	const app = serve({
		routes: {
			"/": serveUserScript,
			"/:": serveUserScript,
		}
	})
	
	console.log(`Development server running at ${app.url}`)
}