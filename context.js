const messages = [
	{
		role: "system",
		content: "你是一个简洁、准确的中文助手",
	},
];

let persistMessages = null;

export function setPersistMessages(handler) {
	persistMessages = handler;
}

export const context = {
	getMessages: () => messages,
	addUserMessage: (message) => {
		messages.push({ role: "user", content: message });
		queueMicrotask(() => persistMessages?.(messages));
	},
	addAiMessage: (message) => {
		messages.push(message);
		queueMicrotask(() => persistMessages?.(messages));
	},
	addToolResult: (id, message) => {
		messages.push({ role: "tool", tool_call_id: id, content: message });
		queueMicrotask(() => persistMessages?.(messages));
	},
};
