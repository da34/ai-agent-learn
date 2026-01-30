import path from "node:path";

const baseDir = process.cwd();

export function resolveSafePath(inputPath) {
	const resolvedPath = path.resolve(baseDir, inputPath);
	const baseWithSep = baseDir.endsWith(path.sep) ? baseDir : baseDir + path.sep;
	const sameDrive = resolvedPath.toLowerCase().startsWith(baseWithSep.toLowerCase());
	if (!sameDrive) return null;
	return resolvedPath;
}
