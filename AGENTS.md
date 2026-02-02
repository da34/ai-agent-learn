# Repository Guidelines

## 项目结构与模块组织

- 入口与核心逻辑在 `index.js`，使用 ES Modules 组织并负责命令行交互。
- LLM 交互与上下文分别在 `llm.js`、`context.js`，避免在入口堆叠业务逻辑。
- 工具模块集中在 `tools/`，其中 `tools/index.js` 负责聚合导出，单个工具各自成文件。
- 配置文件示例在 `.env.example`，实际运行使用 `.env`，不要将密钥写入代码。
- 需要新增模块时，优先放在根目录并保持文件名小写，如 `metrics.js`、`prompt.js`。

## 架构概览

CLI 输入 → `context.js` 维护对话 → `llm.js` 调用模型 → `tools/` 执行外部能力 → 结果回写上下文。
修改链路时，优先保证消息顺序、工具调用参数和错误处理一致性。

## 构建、测试与本地运行

- `node index.js`：直接启动交互式命令行，适合快速验证。
- `npm run dev`：等价于 `node index.js`，同时读取 `.env` 里的密钥配置。
- `npm test`：当前仅输出提示并以失败退出（尚未配置测试）。
- 常用排障路径：`.env` → `llm.js` → `tools/`，可按调用链定位问题。

## 代码风格与命名约定

- 缩进使用 **Tab**，保持与现有文件一致，避免混用空格。
- 文件与模块使用小写文件名，入口文件固定为 `index.js`。
- 使用 ES Modules 语法（`import`/`export`），避免混用 `require`。
- 函数命名使用动词短语：`getToolSchemas`、`executeTool`，避免缩写。
- 日志与注释以中文为主，必要时保留英文术语以对齐第三方接口。

## 测试指南

- 目前未引入测试框架，也没有覆盖率要求。
- 若新增测试，请在 `tools/` 或相关模块旁保持同目录组织，命名形如 `*.test.js`。
- 建议优先覆盖：工具参数解析、错误回退、以及 LLM 工具调用流程。
- 如需引入框架，优先选择轻量方案，并在 PR 中说明原因。

## 提交与合并请求规范

- 提交信息沿用 Conventional Commits：如 `feat:`、`refactor:`、`chore:`。
- 提交信息尽量包含范围或对象，例如 `feat(tools): add weather tool`。
- PR/合并请求应包含：改动目的、关键行为变化、手工验证步骤；若改动影响 CLI 输出，请附示例。

## 安全与配置提示

- 不要提交 `.env`，仅提交 `.env.example`。
- 需要搜索功能时依赖系统 `rg`，请确保本机已安装（见 README 说明）。
- 若需要代理或自定义 API 地址，优先通过环境变量配置，不要硬编码。
- 配置优先级以环境变量为准，必要时在文档中说明默认值。

## 示例与约定

目录示例：

```plaintext
.
├─ index.js
├─ llm.js
├─ context.js
└─ tools/
   ├─ index.js
   └─ search.js
```

`.env` 示例（不要提交真实密钥）：

```plaintext
LLM_API_KEY=your_api_key_here
LLM_API_BASE_URL=https://api.302ai.cn
```

## 依赖与工具

- 运行时依赖仅 `dotenv`，若新增依赖请更新 `package.json` 并说明用途。
- 外部命令工具 `rg` 供 `searchCode` 使用，避免在代码里做全量遍历。
- 错误日志保持统一格式，例如 `console.error("请求失败：", err)`，便于排查。

## Agent 说明

- 遵守仓库已有结构与命名习惯；涉及新工具时优先补充到 `tools/` 并在 `tools/index.js` 注册。
- 修改交互流程时请确认 `context.js` 的消息队列顺序，避免破坏对话历史。

参考文件：
- README.md
- package.json
- index.js
- llm.js
- context.js
- tools/index.js
- tools/
