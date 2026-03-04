const PISTON_URL = process.env.PISTON_URL || "http://localhost:2000";

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

  const response = await fetch(`${PISTON_URL}/api/v2/execute`, {
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

  if (!response.ok) {
    return {
      stdout: "",
      stderr: `Execution service error: ${response.status}`,
      exitCode: 1,
      timedOut: false,
      executionTimeMs: Date.now() - start,
    };
  }

  const result = await response.json();
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
