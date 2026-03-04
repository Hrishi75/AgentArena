import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";
import { env } from "./env";
import { AI_QUALITY_WEIGHT, CORRECTNESS_WEIGHT } from "./constants";

export function triggerAiEvaluation(submissionId: string) {
  setImmediate(() => evaluateWithAi(submissionId));
}

async function evaluateWithAi(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { problem: true },
  });
  if (!submission) return;

  // Guard against division by zero
  if (submission.testsTotal === 0) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { score: 0 },
    });
    return;
  }

  const correctnessScore =
    (submission.testsPassed / submission.testsTotal) * CORRECTNESS_WEIGHT * 100;

  // If no Anthropic API key, score on correctness only (full weight)
  if (!env.hasAnthropicKey) {
    const correctnessOnlyScore =
      (submission.testsPassed / submission.testsTotal) * 100;
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: correctnessOnlyScore,
        aiReview: "_AI evaluation skipped: ANTHROPIC_API_KEY not configured._",
      },
    });
    return;
  }

  // Escape code for safe embedding in prompt
  const escapedCode = submission.code
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`");

  const prompt = `You are an expert code reviewer and judge for a competitive programming platform.

## Problem
Title: ${submission.problem.title}
Description:
${submission.problem.description}

## Submitted Solution (${submission.language})
\`\`\`${submission.language}
${escapedCode}
\`\`\`

## Test Results
- Passed: ${submission.testsPassed}/${submission.testsTotal}
- Status: ${submission.status}

## Evaluation Criteria
Score this solution from 0 to 100 based on:
1. **Code Quality** (readability, naming, structure): 30%
2. **Algorithm Efficiency** (time/space complexity): 40%
3. **Creativity/Elegance** (novel approach, clean design): 30%

## Required Output Format
Respond with EXACTLY this JSON structure (no other text):
{"score": <number 0-100>, "review": "<markdown string with detailed feedback>"}`;

  try {
    const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      console.error(`AI evaluation: unexpected content type for submission ${submissionId}`);
      return;
    }

    // Try to extract JSON from the response (handle markdown code blocks)
    let jsonText = content.text.trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonText);
    const aiScore = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    const aiReview = String(parsed.review || "No review provided.");

    const qualityScore = (aiScore / 100) * AI_QUALITY_WEIGHT * 100;
    const totalScore = correctnessScore + qualityScore;

    await prisma.submission.update({
      where: { id: submissionId },
      data: { aiScore, aiReview, score: totalScore },
    });
  } catch (error) {
    console.error(`AI evaluation failed for submission ${submissionId}:`, error);
    // Fallback: score on correctness only so the submission isn't stuck
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: correctnessScore,
        aiReview: "_AI evaluation failed. Score based on correctness only._",
      },
    });
  }
}
