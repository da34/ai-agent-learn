let currentPlan = null;

function isNonEmptyString(value) {
	return typeof value === "string" && value.trim().length > 0;
}

function normalizeStatus(status) {
	if (status === "pending" || status === "in_progress" || status === "completed") {
		return status;
	}
	return null;
}

function buildPlanPayload(plan) {
	return {
		title: plan.title,
		steps: plan.steps.map((step, index) => ({
			index: index + 1,
			text: step.text,
			status: step.status,
		})),
	};
}

export const planToolSchemas = [
	{
		type: "function",
		function: {
			name: "createPlan",
			description: "创建执行计划。复杂任务时先规划再执行。",
			parameters: {
				type: "object",
				properties: {
					title: {
						type: "string",
						description: "计划标题",
					},
					steps: {
						type: "array",
						items: {
							type: "string",
						},
						description: "计划步骤文本列表",
					},
				},
				required: ["title", "steps"],
			},
		},
	},
	{
		type: "function",
		function: {
			name: "updatePlanStep",
			description: "更新执行计划的步骤状态。",
			parameters: {
				type: "object",
				properties: {
					index: {
						type: "number",
						description: "步骤序号（从 1 开始）",
					},
					status: {
						type: "string",
						description: "步骤状态：pending / in_progress / completed",
					},
				},
				required: ["index", "status"],
			},
		},
	},
	{
		type: "function",
		function: {
			name: "getPlan",
			description: "获取当前执行计划。",
			parameters: {
				type: "object",
				properties: {},
			},
		},
	},
];

export function createPlan({ title, steps }) {
	if (!isNonEmptyString(title)) {
		return "创建失败：title 不合法";
	}
	if (!Array.isArray(steps) || steps.length === 0) {
		return "创建失败：steps 不合法";
	}
	const normalizedSteps = steps
		.filter((step) => isNonEmptyString(step))
		.map((step) => ({
			text: step.trim(),
			status: "pending",
		}));
	if (normalizedSteps.length === 0) {
		return "创建失败：steps 不合法";
	}

	currentPlan = {
		title: title.trim(),
		steps: normalizedSteps,
	};

	const payload = {
		message: "计划已创建",
		plan: buildPlanPayload(currentPlan),
	};
	return JSON.stringify(payload);
}

export function updatePlanStep({ index, status }) {
	if (!currentPlan) return "当前没有计划";
	if (!Number.isFinite(index) || index < 1) {
		return "更新失败：index 超出范围";
	}
	const normalizedStatus = normalizeStatus(status);
	if (!normalizedStatus) {
		return "更新失败：status 无效";
	}
	const stepIndex = Math.floor(index) - 1;
	if (stepIndex < 0 || stepIndex >= currentPlan.steps.length) {
		return "更新失败：index 超出范围";
	}

	const step = currentPlan.steps[stepIndex];
	step.status = normalizedStatus;

	const payload = {
		message: "步骤已更新",
		step: {
			index: stepIndex + 1,
			text: step.text,
			status: step.status,
		},
	};
	return JSON.stringify(payload);
}

export function getPlan() {
	if (!currentPlan) return "当前没有计划";
	return JSON.stringify(buildPlanPayload(currentPlan));
}
