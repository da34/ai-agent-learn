import fs from "node:fs/promises";
import { resolveSafePath } from "./utils.js";

export const fsToolSchemas = [
	{
		type: "function",
		function: {
			name: "readFile",
			description: "读取工作目录内的文件内容",
			parameters: {
				type: "object",
				properties: {
					filePath: {
						type: "string",
						description: "相对路径或工作目录内的绝对路径",
					},
				},
				required: ["filePath"],
			},
		},
	},
	{
		type: "function",
		function: {
			name: "writeFile",
			description: "写入工作目录内的文件内容",
			parameters: {
				type: "object",
				properties: {
					filePath: {
						type: "string",
						description: "相对路径或工作目录内的绝对路径",
					},
					content: {
						type: "string",
						description: "要写入的文本内容",
					},
				},
				required: ["filePath", "content"],
			},
		},
	},
];

export async function readFile({ filePath }) {
	const safePath = resolveSafePath(filePath);
	if (!safePath) return "读取失败：路径不允许";
	try {
		return await fs.readFile(safePath, "utf-8");
	} catch (error) {
		return `读取失败：${error?.message ?? error}`;
	}
}

export async function writeFile({ filePath, content }) {
	const safePath = resolveSafePath(filePath);
	if (!safePath) return "写入失败：路径不允许";
	try {
		await fs.writeFile(safePath, content ?? "", "utf-8");
		return "写入成功";
	} catch (error) {
		return `写入失败：${error?.message ?? error}`;
	}
}
