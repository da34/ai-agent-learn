import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const cacheDir = path.join(os.homedir(), ".learn-agent", "sessions");

function pad2(value) {
	return String(value).padStart(2, "0");
}

function formatTimestamp(date) {
	const year = date.getFullYear();
	const month = pad2(date.getMonth() + 1);
	const day = pad2(date.getDate());
	const hours = pad2(date.getHours());
	const minutes = pad2(date.getMinutes());
	const seconds = pad2(date.getSeconds());
	return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function buildPayload(messages, createdAt) {
	const now = new Date().toISOString();
	return {
		version: 1,
		createdAt,
		updatedAt: now,
		messages,
	};
}

export async function createSessionCache(messages) {
	await fs.mkdir(cacheDir, { recursive: true });
	const fileName = `${formatTimestamp(new Date())}-${process.pid}.json`;
	const cacheFilePath = path.join(cacheDir, fileName);
	const createdAt = new Date().toISOString();
	const payload = buildPayload(messages, createdAt);
	await fs.writeFile(cacheFilePath, JSON.stringify(payload, null, 2), "utf-8");
	return { cacheFilePath, createdAt, id: fileName };
}

export async function writeSessionCache(cacheFilePath, createdAt, messages) {
	const payload = buildPayload(messages, createdAt);
	await fs.writeFile(cacheFilePath, JSON.stringify(payload, null, 2), "utf-8");
}

export async function listSessionCaches() {
	await fs.mkdir(cacheDir, { recursive: true });
	const entries = await fs.readdir(cacheDir, { withFileTypes: true });
	const files = entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
		.map((entry) => entry.name);
	const sessions = [];
	for (const fileName of files) {
		const filePath = path.join(cacheDir, fileName);
		try {
			const content = await fs.readFile(filePath, "utf-8");
			const payload = JSON.parse(content);
			sessions.push({
				id: fileName,
				filePath,
				createdAt: payload?.createdAt ?? null,
				updatedAt: payload?.updatedAt ?? null,
				messageCount: Array.isArray(payload?.messages)
					? payload.messages.length
					: 0,
			});
		} catch {
			continue;
		}
	}
	sessions.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
	return sessions;
}

export async function readSessionCache(id) {
	await fs.mkdir(cacheDir, { recursive: true });
	const filePath = path.join(cacheDir, id);
	const content = await fs.readFile(filePath, "utf-8");
	const payload = JSON.parse(content);
	return { filePath, payload };
}
