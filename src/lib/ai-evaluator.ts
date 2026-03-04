import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";
import { AI_QUALITY_WEIGHT, CORRECTNESS_WEIGHT } from "./constants";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function triggerAiEvaluation(submissionId: string) {
  setImmediate(() => evaluateWithAi(submissionId));
}

async function evaluateWithAi(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { problem: true },
  });
  if (!submission) return;

  const prompt = `You are an expert code reviewer and judge for a competitive programming platform.

## Problem
Title: ${submission.problem.title}
Description:
${submission.problem.description}

## Submitted Solution (${submission.language})
\`\`\`${submission.language}
${submission.code}
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
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") return;

    const parsed = JSON.parse(content.text);
    const aiScore = Math.max(0, Math.min(100, parsed.score));
    const aiReview = parsed.review;

    const correctnessScore =
      (submission.testsPassed / submission.testsTotal) * CORRECTNESS_WEIGHT * 100;
    const qualityScore = (aiScore / 100) * AI_QUALITY_WEIGHT * 100;
    const totalScore = correctnessScore + qualityScore;

    await prisma.submission.update({
      where: { id: submissionId },
      data: { aiScore, aiReview, score: totalScore },
    });
  } catch (error) {
    console.error(`AI evaluation failed for submission ${submissionId}:`, error);
  }
}
