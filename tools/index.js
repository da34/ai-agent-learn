import { fsToolSchemas, readFile, writeFile } from "./fs.js";
import { weatherToolSchemas, getCurrentWeather } from "./weather.js";
import { commandToolSchemas, executeCommand } from "./command.js";
import { searchToolSchemas, searchCode } from "./search.js";
import {
	planToolSchemas,
	createPlan,
	updatePlanStep,
	getPlan,
} from "./plan.js";

const toolHandlers = {
	getCurrentWeather,
	readFile,
	writeFile,
	executeCommand,
	searchCode,
	createPlan,
	updatePlanStep,
	getPlan,
};

export function getToolSchemas() {
	return [
		...weatherToolSchemas,
		...fsToolSchemas,
		...commandToolSchemas,
		...searchToolSchemas,
		...planToolSchemas,
	];
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
