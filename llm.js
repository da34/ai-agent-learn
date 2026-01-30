
const apiKey = "";
const apiBaseUrl = "https://api.302ai.cn";

const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("Authorization", "Bearer " + apiKey);
myHeaders.append("Content-Type", "application/json");

// llm 入口
export const llm = {
	chat
};

// 聊天
async function chat(config) {
	const raw = JSON.stringify({
		model: "gpt-5-nano",
		...config,
	});
	
	const requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: raw,
		redirect: "follow",
	};
	// context.pushMessage({ role: 'user', content })
	return await fetch(`${apiBaseUrl}/v1/chat/completions`, requestOptions).then(async (response) => {
		if (!config.stream) {
			return response.json();
		}
		
		if (!response.body) return;
		const reader = response.body.getReader();
		// 将流中的字节数据解码为文本字符串
		const decoder = new TextDecoder("utf-8");
		let buffer = "";
		
		async function* iterator() {
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split(/\r?\n/);
				buffer = lines.pop() ?? "";
				
				for (const line of lines) {
					if (!line.startsWith("data:")) continue;
					const data = line.slice(5).trim();
					if (data === "[DONE]") return;
					
					const chunk = JSON.parse(data);
					const content = chunk?.choices?.[0]?.delta?.content ?? "";
					if (content) {
						yield { content, raw: chunk };
					}
				}
			}
		}
		
		return iterator();
	});
}
