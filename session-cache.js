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
	return { cacheFilePath, createdAt };
}

export async function writeSessionCache(cacheFilePath, createdAt, messages) {
	const payload = buildPayload(messages, createdAt);
	await fs.writeFile(cacheFilePath, JSON.stringify(payload, null, 2), "utf-8");
}
