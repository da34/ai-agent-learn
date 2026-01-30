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

## 代码搜索工具（searchCode）

该工具依赖系统已安装的 ripgrep（rg），用于在工作目录内搜索代码（默认排除 node_modules）。

Windows 安装方式（任选其一）：

```powershell
winget install BurntSushi.ripgrep
```

```powershell
scoop install ripgrep
```

```powershell
choco install ripgrep
```

安装完成后重新打开终端，验证：

```powershell
rg --version
```

## 使用 dotenv（推荐）

安装依赖后可直接读取 `.env`：

```bash
npm install
npm run dev
```
