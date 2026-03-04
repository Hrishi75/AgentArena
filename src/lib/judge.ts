import { prisma } from "./prisma";
import { executeCode } from "./executor";
import { triggerAiEvaluation } from "./ai-evaluator";
import { LANGUAGE_VERSIONS, CORRECTNESS_WEIGHT, EXECUTION_TIMEOUT_MS } from "./constants";

export function enqueueJudging(submissionId: string) {
  // In MVP, run inline via setImmediate. In production, use a job queue.
  setImmediate(() => judgeSubmission(submissionId));
}

async function judgeSubmission(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      problem: {
        include: { testCases: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!submission) return;

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: "running" },
  });

  let passed = 0;
  let totalTimeMs = 0;
  let hasError = false;
  let hasTimeout = false;

  for (const testCase of submission.problem.testCases) {
    const version = LANGUAGE_VERSIONS[submission.language] || "latest";

    const result = await executeCode(
      submission.language,
      version,
      submission.code,
      testCase.input,
      EXECUTION_TIMEOUT_MS
    );

    totalTimeMs += result.executionTimeMs;

    if (result.timedOut) {
      hasTimeout = true;
      break;
    }

    if (result.exitCode !== 0) {
      hasError = true;
      break;
    }

    if (result.stdout === testCase.expectedOutput.trim()) {
      passed++;
    }
  }

  const total = submission.problem.testCases.length;
  let status: string;
  if (hasTimeout) {
    status = "time_limit";
  } else if (hasError) {
    status = "runtime_error";
  } else if (passed === total) {
    status = "accepted";
  } else {
    status = "wrong_answer";
  }

  const correctnessScore = (passed / total) * CORRECTNESS_WEIGHT * 100;

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status,
      testsPassed: passed,
      executionTimeMs: totalTimeMs,
      score: correctnessScore,
    },
  });

  // Trigger AI evaluation for submissions that pass at least one test
  if (passed > 0) {
    triggerAiEvaluation(submissionId);
  }
}
