import { fsToolSchemas, readFile, writeFile } from "./fs.js";
import { weatherToolSchemas, getCurrentWeather } from "./weather.js";

const toolHandlers = {
	getCurrentWeather,
	readFile,
	writeFile,
};

export function getToolSchemas() {
	return [...weatherToolSchemas, ...fsToolSchemas];
}

export async function executeTool(name, args) {
	let payload = {};
	try {
		payload = args ? JSON.parse(args) : {};
	} catch (error) {
		return `工具参数解析失败：${error?.message ?? error}`;
	}

	const handler = toolHandlers[name];
	if (!handler) return `未知工具：${name}`;
	return await handler(payload);
}
