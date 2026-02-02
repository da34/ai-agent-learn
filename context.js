function createDefaultMessages() {
	return [
		{
			role: "system",
			content: "你是一个简洁、准确的中文助手",
		},
	];
}

const messages = createDefaultMessages();

let persistMessages = null;

export function setPersistMessages(handler) {
	persistMessages = handler;
}

export function getDefaultMessages() {
	return createDefaultMessages();
}

export function resetMessages(nextMessages) {
	messages.length = 0;
	for (const message of nextMessages) {
		messages.push({ ...message });
	}
	queueMicrotask(() => persistMessages?.(messages));
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
