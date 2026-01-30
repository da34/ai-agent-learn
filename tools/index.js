export function getToolSchemas() {
	return [
		{
			type: "function",
			function: {
				name: "getCurrentWeather",
				description: "获取指定地点的当前天气情况",
				parameters: {
					type: "object",
					properties: {
						location: {
							type: "string",
							description: "城市获取地方名字",
						},
					},
					required: ["location"],
				},
			},
		},
	];
}

function getCurrentWeather({ location }) {
	return `${location} 天气 非常不错！`;
}

export function executeTool(name, args) {
	let payload;
	try {
		payload = JSON.parse(args);
	} catch (error) {
		return `工具参数解析失败：${error?.message ?? error}`;
	}

	if (name === "getCurrentWeather") return getCurrentWeather(payload);
	return `未知工具：${name}`;
}
