import "dotenv/config";
import { llm } from "./llm.js";
import {
	context,
	setPersistMessages,
	getDefaultMessages,
	resetMessages,
} from "./context.js";
import {
	createSessionCache,
	writeSessionCache,
	listSessionCaches,
	readSessionCache,
} from "./session-cache.js";
import { getToolSchemas, executeTool } from "./tools/index.js";
import readline from "node:readline";
import process from "node:process";

// 获取用户输入
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const COMMANDS = [
	{ name: "help", description: "查看支持的命令" },
	{ name: "list", description: "列出所有会话" },
	{ name: "new", description: "新建会话" },
	{ name: "resume <id>", description: "加载指定会话" },
	{ name: "exit", description: "退出程序" },
];

const SESSION_COMMANDS = new Set(["list", "new", "resume"]);

let pending = false;

let writeQueue = Promise.resolve();
try {
	const { cacheFilePath, createdAt } = await createSessionCache(
		context.getMessages()
	);
	configureSessionPersistence(cacheFilePath, createdAt);
} catch (error) {
	console.error("缓存初始化失败：", error?.message ?? error);
}

rl.setPrompt("> ");
printWelcome();
rl.prompt();

rl.on("line", (line) => {
	const content = line.trim();
	if (!content) {
		rl.prompt();
		return;
	}
	const [command, ...args] = content.split(/\s+/);
	if (content === "exit") {
		rl.close();
		return;
	}
	if (content === "help") {
		printHelp();
		rl.prompt();
		return;
	}
	if (SESSION_COMMANDS.has(command)) {
		if (pending) {
			rl.prompt();
			return;
		}
		void handleCommand(command, args);
		return;
	}
	if (pending) {
		rl.prompt();
		return;
	}
	void handleInput(content);
});

rl.on("close", () => {
	console.log("已退出");
});

function printWelcome() {
	console.log("欢迎使用 Learn Agent。");
	console.log("输入问题开始对话，输入 help 查看当前支持的命令。");
	printHelp();
}

function printHelp() {
	console.log("当前支持的命令：");
	for (const command of COMMANDS) {
		console.log(`- ${command.name}：${command.description}`);
	}
}

function printProgressStart() {
	console.log("正在处理…");
}

function printProgressEnd() {
	console.log("处理完成。");
}

function formatToolCall(call) {
	const name = call?.function?.name ?? "unknown";
	const args = call?.function?.arguments ?? "";
	return `${name}(${args})`;
}

function parseToolArgs(call) {
	const raw = call?.function?.arguments;
	if (!raw || typeof raw !== "string") return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function printToolStart() {
	console.log("AI 正在使用工具...");
}

function printToolCall(call) {
	console.log(`调用：${formatToolCall(call)}`);
}

function printToolResult(result) {
	console.log(`结果：${result}`);
}

function getPlanStepIndex(call) {
	if (call?.function?.name !== "updatePlanStep") return null;
	const args = parseToolArgs(call);
	const index = Number.isFinite(args?.index) ? Math.floor(args.index) : null;
	return index && index > 0 ? index : null;
}

function printToolStepStart(call) {
	const stepIndex = getPlanStepIndex(call);
	if (!stepIndex) return;
	console.log(`现在开始第 ${stepIndex} 步：调用 ${formatToolCall(call)}`);
}

function printToolStepEnd(call) {
	const stepIndex = getPlanStepIndex(call);
	if (!stepIndex) return;
	const name = call?.function?.name ?? "unknown";
	console.log(`已完成第 ${stepIndex} 步：${name}`);
}

function configureSessionPersistence(cacheFilePath, createdAt) {
	setPersistMessages((messages) => {
		writeQueue = writeQueue
			.then(() => writeSessionCache(cacheFilePath, createdAt, messages))
			.catch((error) => {
				console.error("缓存写入失败：", error?.message ?? error);
			});
	});
}

async function handleCommand(command, args) {
	rl.pause();
	pending = true;
	try {
		switch (command) {
			case "list":
				await handleListSessions();
				break;
			case "new":
				await handleNewSession();
				break;
			case "resume":
				await handleResumeSession(args);
				break;
			default:
				break;
		}
	} catch (error) {
		console.error("请求失败：", error?.message ?? error);
	} finally {
		pending = false;
		rl.prompt();
	}
}

async function handleListSessions() {
	const sessions = await listSessionCaches();
	if (!sessions.length) {
		console.log("暂无会话。");
		return;
	}
	console.log("会话列表：");
	for (const session of sessions) {
		const updatedAt = session.updatedAt ? `，更新时间：${session.updatedAt}` : "";
		const messageCount = `，消息数：${session.messageCount}`;
		console.log(`- ${session.id}${updatedAt}${messageCount}`);
	}
}

async function handleNewSession() {
	const defaultMessages = getDefaultMessages();
	const { cacheFilePath, createdAt, id } = await createSessionCache(
		defaultMessages
	);
	configureSessionPersistence(cacheFilePath, createdAt);
	resetMessages(defaultMessages);
	console.log(`已创建新会话：${id}`);
}

async function handleResumeSession(args) {
	const id = args[0];
	if (!id) {
		console.log("用法：resume <id>");
		return;
	}
	const { filePath, payload } = await readSessionCache(id);
	const nextMessages = Array.isArray(payload?.messages)
		? payload.messages
		: getDefaultMessages();
	const createdAt = payload?.createdAt ?? new Date().toISOString();
	resetMessages(nextMessages);
	configureSessionPersistence(filePath, createdAt);
	console.log(`已加载会话：${id}`);
	printSessionHistory(nextMessages);
}

function printSessionHistory(messages) {
	if (!messages.length) {
		console.log("历史记录为空。");
		return;
	}
	console.log("历史记录：");
	for (const message of messages) {
		const role = message?.role ?? "unknown";
		const content = message?.content ?? "";
		console.log(`[${role}] ${content}`);
	}
}

async function chat(userMessage) {
	context.addUserMessage(userMessage);
	
	while (true) {
		// console.log(context.getMessages(), '55555')
		const response = await llm.chat({
			messages: context.getMessages(),
			tools: getToolSchemas()
			// stream: true
		});
		// context.addUserMessage(userMessage)
		// console.log(response, 6666)
		response.choices && context.addAiMessage(response.choices[0].message);
		
		// AI 想用工具
		if (response.choices && response.choices[0].finish_reason === "tool_calls") {
			// console.log(response.choices[0].message.tool_calls)
			// console.log(response.choices[0].delta.tool_calls)
			printProgressStart();
			for (const call of response.choices[0].message.tool_calls) {
				printToolStart();
				printToolStepStart(call);
				printToolCall(call);
				const result = await executeTool(call.function.name, call.function.arguments);
				context.addToolResult(call.id, result);
				printToolResult(result);
				printToolStepEnd(call);
			}
			printProgressEnd();
			continue; // 继续循环，让 AI 看到工具结果
		}
		return response;
	}
}

async function handleInput(content) {
	rl.pause();
	// context.pushMessage({ role: 'user', content })
	pending = true;
	try {
		const data = await chat(content);
		console.log(data.choices[0].message.content);
	} catch (error) {
		console.error("请求失败：", error?.message ?? error);
	} finally {
		pending = false;
		// console.log(res)
		rl.prompt();
	}
}
