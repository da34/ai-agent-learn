const messages = [
	{
		role: "system",
		content: "你是一个简洁、准确的中文助手",
	},
];

export const context = {
	getMessages: () => messages,
	addUserMessage: (message) => messages.push({ role: "user", content: message }),
	addAiMessage: (message) => messages.push(message),
	addToolResult: (id, message) =>
		messages.push({ role: "tool", tool_call_id: id, content: message }),
};
