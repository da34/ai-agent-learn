# ai-agent-learn

## 启动说明

1. 复制环境变量文件：

```bash
cp .env.example .env
```

2. 配置 `.env`：

- `LLM_API_KEY`：你的 API Key
- `LLM_API_BASE_URL`：可选，默认 `https://api.302ai.cn`

3. 启动：

```bash
node index.js
```

## 使用 dotenv（推荐）

安装依赖后可直接读取 `.env`：

```bash
npm install
npm run dev
```
