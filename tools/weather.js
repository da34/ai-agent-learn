export const weatherToolSchemas = [
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

export function getCurrentWeather({ location }) {
	return `${location} 天气 非常不错！`;
}
