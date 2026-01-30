import { llm } from "./llm.js";
import { context } from "./context.js";
import { getToolSchemas, executeTool } from "./tools";
import readline from "node:readline";
import process from "node:process";

// 获取用户输入
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

let pending = false;

rl.setPrompt("> ");
rl.prompt();

rl.on("line", (line) => {
	const content = line.trim();
	if (content === "exit") {
		rl.close();
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
			for (const call of response.choices[0].message.tool_calls) {
				const result = await executeTool(call.function.name, call.function.arguments);
				context.addToolResult(call.id, result);
			}
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
		console.log(data.choices[0].message.content, 33333333);
	} catch (error) {
		console.error("请求失败：", error?.message ?? error);
	} finally {
		pending = false;
		// console.log(res)
		rl.prompt();
	}
}

