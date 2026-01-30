import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolveSafePath } from "./utils.js";

const execFileAsync = promisify(execFile);

function normalizeMaxResults(maxResults) {
	if (!Number.isFinite(maxResults)) return 200;
	return Math.min(Math.max(1, Math.floor(maxResults)), 1000);
}

function formatOutput(stdout, stderr) {
	return [stdout?.trim(), stderr?.trim()].filter(Boolean).join("\n");
}

export const searchToolSchemas = [
	{
		type: "function",
		function: {
			name: "searchCode",
			description: "在工作目录内搜索代码（使用 ripgrep）",
			parameters: {
				type: "object",
				properties: {
					query: {
						type: "string",
						description: "搜索关键词或正则",
					},
					cwd: {
						type: "string",
						description: "工作目录（相对路径或工作目录内的绝对路径）",
					},
					useRegex: {
						type: "boolean",
						description: "是否使用正则匹配，默认 true",
					},
					output: {
						type: "string",
						description: "输出格式：lines 或 files，默认 lines",
					},
					ignoreNodeModules: {
						type: "boolean",
						description: "是否排除 node_modules，默认 true",
					},
					maxResults: {
						type: "number",
						description: "最大返回条数，默认 200，最大 1000",
					},
				},
				required: ["query"],
			},
		},
	},
];

export async function searchCode({
	query,
	cwd,
	useRegex = true,
	output = "lines",
	ignoreNodeModules = true,
	maxResults,
}) {
	if (!query || typeof query !== "string") {
		return "搜索失败：query 不能为空";
	}

	const safeCwd = cwd ? resolveSafePath(cwd) : process.cwd();
	if (!safeCwd) return "搜索失败：cwd 路径不允许";

	const normalizedMaxResults = normalizeMaxResults(maxResults);
	const outputMode = output === "files" ? "files" : "lines";
	const args = [
		"--no-heading",
		"--line-number",
		"--color",
		"never",
		"-m",
		String(normalizedMaxResults),
	];

	if (outputMode === "files") {
		args.push("-l");
	}
	if (useRegex === false) {
		args.push("-F");
	}
	if (ignoreNodeModules !== false) {
		args.push("--glob", "!node_modules/**");
	}

	args.push(query);

	try {
		const { stdout, stderr } = await execFileAsync("rg", args, {
			cwd: safeCwd,
			maxBuffer: 1024 * 1024,
			encoding: "utf-8",
			windowsHide: true,
		});
		const combined = formatOutput(stdout, stderr);
		return combined || "未找到匹配";
	} catch (error) {
		if (error?.code === "ENOENT") {
			return "搜索失败：未找到 rg，请先安装 ripgrep 并加入 PATH";
		}
		const stdout = error?.stdout?.toString?.() ?? "";
		const stderr = error?.stderr?.toString?.() ?? "";
		const code = error?.code ?? "unknown";
		const signal = error?.signal ?? "unknown";
		const details = formatOutput(stdout, stderr);
		if (code === 1 && !details) return "未找到匹配";
		return `搜索失败：code=${code} signal=${signal}${details ? `\n${details}` : ""}`;
	}
}
