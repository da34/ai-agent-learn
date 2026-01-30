import { exec } from "node:child_process";
import { promisify } from "node:util";
import { resolveSafePath } from "./utils.js";

const execAsync = promisify(exec);

function formatOutput(stdout, stderr) {
	return [stdout?.trim(), stderr?.trim()].filter(Boolean).join("\n");
}

function normalizeTimeout(timeoutMs) {
	if (!Number.isFinite(timeoutMs)) return 10000;
	return Math.min(Math.max(0, timeoutMs), 30000);
}

export const commandToolSchemas = [
	{
		type: "function",
		function: {
			name: "executeCommand",
			description: "在工作目录内执行命令（使用 shell），并返回标准输出/错误",
			parameters: {
				type: "object",
				properties: {
					command: {
						type: "string",
						description: "要执行的命令",
					},
					cwd: {
						type: "string",
						description: "工作目录（相对路径或工作目录内的绝对路径）",
					},
					timeoutMs: {
						type: "number",
						description: "超时时间（毫秒），默认 10000，最大 30000",
					},
				},
				required: ["command"],
			},
		},
	},
];

export async function executeCommand({ command, cwd, timeoutMs }) {
	if (!command || typeof command !== "string") {
		return "执行失败：command 不能为空";
	}
	const safeCwd = cwd ? resolveSafePath(cwd) : process.cwd();
	if (!safeCwd) return "执行失败：cwd 路径不允许";

	const normalizedTimeout = normalizeTimeout(timeoutMs);

	try {
		const { stdout, stderr } = await execAsync(command, {
			cwd: safeCwd,
			timeout: normalizedTimeout,
			maxBuffer: 1024 * 1024,
			encoding: "utf-8",
			windowsHide: true,
		});
		const output = formatOutput(stdout, stderr);
		return output || "执行完成，无输出";
	} catch (error) {
		const stdout = error?.stdout?.toString?.() ?? "";
		const stderr = error?.stderr?.toString?.() ?? "";
		const code = error?.code ?? "unknown";
		const signal = error?.signal ?? "unknown";
		const details = formatOutput(stdout, stderr);
		return `执行失败：code=${code} signal=${signal}${details ? `\n${details}` : ""}`;
	}
}
