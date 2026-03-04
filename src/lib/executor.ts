import { env } from "./env";

const PISTON_URL = env.PISTON_URL;

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  executionTimeMs: number;
}

export async function executeCode(
  language: string,
  version: string,
  code: string,
  stdin: string,
  timeoutMs: number = 5000
): Promise<ExecutionResult> {
  const start = Date.now();

  let response;
  try {
    response = await fetch(`${PISTON_URL}/api/v2/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version,
        files: [{ content: code }],
        stdin,
        run_timeout: timeoutMs,
        compile_memory_limit: 256_000_000,
        run_memory_limit: 256_000_000,
      }),
    });
  } catch (error) {
    // Network error — Piston is unreachable
    return {
      stdout: "",
      stderr: `Code execution service is unavailable. Please try again later. (${error instanceof Error ? error.message : "connection failed"})`,
      exitCode: 1,
      timedOut: false,
      executionTimeMs: Date.now() - start,
    };
  }

  if (!response.ok) {
    return {
      stdout: "",
      stderr: `Execution service error: ${response.status}`,
      exitCode: 1,
      timedOut: false,
      executionTimeMs: Date.now() - start,
    };
  }

  let result;
  try {
    result = await response.json();
  } catch {
    return {
      stdout: "",
      stderr: "Execution service returned an invalid response",
      exitCode: 1,
      timedOut: false,
      executionTimeMs: Date.now() - start,
    };
  }

  const executionTimeMs = Date.now() - start;

  return {
    stdout: result.run?.stdout?.trim() ?? "",
    stderr: result.run?.stderr?.trim() ?? "",
    exitCode: result.run?.code ?? 1,
    timedOut: result.run?.signal === "SIGKILL",
    executionTimeMs,
  };
}

export async function getAvailableRuntimes(): Promise<
  Array<{ language: string; version: string }>
> {
  const response = await fetch(`${PISTON_URL}/api/v2/runtimes`);
  if (!response.ok) return [];
  return response.json();
}
