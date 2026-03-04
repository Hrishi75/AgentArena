import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const problems = [
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    tags: ["array", "hash-table"],
    description: `## Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers that add up to \`target\`.

You may assume that each input has exactly one solution, and you may not use the same element twice.

### Input Format
- First line: space-separated integers (the array)
- Second line: the target integer

### Output Format
- Two space-separated indices (0-based)

### Example
\`\`\`
Input:
2 7 11 15
9
Output:
0 1
\`\`\`

### Constraints
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9`,
    testCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1", isHidden: false },
      { input: "3 2 4\n6", expectedOutput: "1 2", isHidden: false },
      { input: "3 3\n6", expectedOutput: "0 1", isHidden: true },
      { input: "1 5 3 7 2\n9", expectedOutput: "1 3", isHidden: true },
      { input: "-1 -2 -3 -4 -5\n-8", expectedOutput: "2 4", isHidden: true },
    ],
  },
  {
    slug: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: "easy",
    tags: ["string", "math"],
    description: `## FizzBuzz

Given an integer \`n\`, return a string with numbers from 1 to n, where:
- Multiples of 3 are replaced with "Fizz"
- Multiples of 5 are replaced with "Buzz"
- Multiples of both 3 and 5 are replaced with "FizzBuzz"

### Input Format
- A single integer n

### Output Format
- Space-separated values from 1 to n with FizzBuzz rules applied

### Example
\`\`\`
Input:
15
Output:
1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz
\`\`\``,
    testCases: [
      { input: "5", expectedOutput: "1 2 Fizz 4 Buzz", isHidden: false },
      { input: "15", expectedOutput: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz", isHidden: false },
      { input: "1", expectedOutput: "1", isHidden: true },
      { input: "3", expectedOutput: "1 2 Fizz", isHidden: true },
      { input: "30", expectedOutput: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz 16 17 Fizz 19 Buzz Fizz 22 23 Fizz Buzz 26 Fizz 28 29 FizzBuzz", isHidden: true },
    ],
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "easy",
    tags: ["stack", "string"],
    description: `## Valid Parentheses

Given a string containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

A string is valid if:
1. Open brackets are closed by the same type of brackets
2. Open brackets are closed in the correct order

### Input Format
- A single string of brackets

### Output Format
- "true" or "false"

### Example
\`\`\`
Input:
()[]{}
Output:
true
\`\`\``,
    testCases: [
      { input: "()", expectedOutput: "true", isHidden: false },
      { input: "()[]{}", expectedOutput: "true", isHidden: false },
      { input: "(]", expectedOutput: "false", isHidden: false },
      { input: "([)]", expectedOutput: "false", isHidden: true },
      { input: "{[]}", expectedOutput: "true", isHidden: true },
      { input: "", expectedOutput: "true", isHidden: true },
      { input: "((()))", expectedOutput: "true", isHidden: true },
    ],
  },
  {
    slug: "reverse-string",
    title: "Reverse String",
    difficulty: "easy",
    tags: ["string", "two-pointers"],
    description: `## Reverse String

Given a string, reverse it in-place and output the result.

### Input Format
- A single string

### Output Format
- The reversed string

### Example
\`\`\`
Input:
hello
Output:
olleh
\`\`\``,
    testCases: [
      { input: "hello", expectedOutput: "olleh", isHidden: false },
      { input: "Hannah", expectedOutput: "hannaH", isHidden: false },
      { input: "a", expectedOutput: "a", isHidden: true },
      { input: "abcdef", expectedOutput: "fedcba", isHidden: true },
    ],
  },
  {
    slug: "fibonacci",
    title: "Fibonacci Number",
    difficulty: "easy",
    tags: ["math", "dynamic-programming"],
    description: `## Fibonacci Number

Given \`n\`, calculate the nth Fibonacci number.

F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)

### Input Format
- A single integer n (0 <= n <= 45)

### Output Format
- The nth Fibonacci number

### Example
\`\`\`
Input:
10
Output:
55
\`\`\``,
    testCases: [
      { input: "0", expectedOutput: "0", isHidden: false },
      { input: "1", expectedOutput: "1", isHidden: false },
      { input: "10", expectedOutput: "55", isHidden: false },
      { input: "20", expectedOutput: "6765", isHidden: true },
      { input: "30", expectedOutput: "832040", isHidden: true },
      { input: "45", expectedOutput: "1134903170", isHidden: true },
    ],
  },
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "medium",
    tags: ["array", "dynamic-programming", "divide-and-conquer"],
    description: `## Maximum Subarray

Given an integer array \`nums\`, find the subarray with the largest sum and return its sum.

### Input Format
- Space-separated integers

### Output Format
- The maximum subarray sum

### Example
\`\`\`
Input:
-2 1 -3 4 -1 2 1 -5 4
Output:
6
\`\`\`

Explanation: The subarray [4,-1,2,1] has the largest sum = 6.

### Constraints
- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4`,
    testCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isHidden: false },
      { input: "1", expectedOutput: "1", isHidden: false },
      { input: "5 4 -1 7 8", expectedOutput: "23", isHidden: true },
      { input: "-1", expectedOutput: "-1", isHidden: true },
      { input: "-2 -1", expectedOutput: "-1", isHidden: true },
    ],
  },
  {
    slug: "merge-sorted-arrays",
    title: "Merge Two Sorted Arrays",
    difficulty: "medium",
    tags: ["array", "two-pointers", "sorting"],
    description: `## Merge Two Sorted Arrays

Given two sorted integer arrays, merge them into a single sorted array.

### Input Format
- First line: space-separated integers (first sorted array)
- Second line: space-separated integers (second sorted array)

### Output Format
- Space-separated integers (merged sorted array)

### Example
\`\`\`
Input:
1 3 5 7
2 4 6 8
Output:
1 2 3 4 5 6 7 8
\`\`\``,
    testCases: [
      { input: "1 3 5 7\n2 4 6 8", expectedOutput: "1 2 3 4 5 6 7 8", isHidden: false },
      { input: "1\n2", expectedOutput: "1 2", isHidden: false },
      { input: "1 2 3\n4 5 6", expectedOutput: "1 2 3 4 5 6", isHidden: true },
      { input: "1 1 1\n1 1 1", expectedOutput: "1 1 1 1 1 1", isHidden: true },
    ],
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "easy",
    tags: ["array", "binary-search"],
    description: `## Binary Search

Given a sorted array of integers and a target value, return the index of the target if found, otherwise return -1.

### Input Format
- First line: space-separated sorted integers
- Second line: target integer

### Output Format
- Index of target (0-based) or -1

### Example
\`\`\`
Input:
-1 0 3 5 9 12
9
Output:
4
\`\`\``,
    testCases: [
      { input: "-1 0 3 5 9 12\n9", expectedOutput: "4", isHidden: false },
      { input: "-1 0 3 5 9 12\n2", expectedOutput: "-1", isHidden: false },
      { input: "5\n5", expectedOutput: "0", isHidden: true },
      { input: "1 2 3 4 5\n1", expectedOutput: "0", isHidden: true },
      { input: "1 2 3 4 5\n5", expectedOutput: "4", isHidden: true },
    ],
  },
  {
    slug: "longest-common-prefix",
    title: "Longest Common Prefix",
    difficulty: "easy",
    tags: ["string"],
    description: `## Longest Common Prefix

Find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string "".

### Input Format
- Comma-separated strings

### Output Format
- The longest common prefix (or empty line if none)

### Example
\`\`\`
Input:
flower,flow,flight
Output:
fl
\`\`\``,
    testCases: [
      { input: "flower,flow,flight", expectedOutput: "fl", isHidden: false },
      { input: "dog,racecar,car", expectedOutput: "", isHidden: false },
      { input: "abc,abc,abc", expectedOutput: "abc", isHidden: true },
      { input: "a", expectedOutput: "a", isHidden: true },
      { input: "cir,car", expectedOutput: "c", isHidden: true },
    ],
  },
  {
    slug: "count-primes",
    title: "Count Primes",
    difficulty: "medium",
    tags: ["math", "sieve"],
    description: `## Count Primes

Given an integer n, return the number of prime numbers that are strictly less than n.

### Input Format
- A single integer n

### Output Format
- Count of primes less than n

### Example
\`\`\`
Input:
10
Output:
4
\`\`\`

Explanation: There are 4 primes less than 10: 2, 3, 5, 7.

### Constraints
- 0 <= n <= 5 * 10^6`,
    testCases: [
      { input: "10", expectedOutput: "4", isHidden: false },
      { input: "0", expectedOutput: "0", isHidden: false },
      { input: "1", expectedOutput: "0", isHidden: true },
      { input: "2", expectedOutput: "0", isHidden: true },
      { input: "100", expectedOutput: "25", isHidden: true },
      { input: "1000", expectedOutput: "168", isHidden: true },
    ],
  },
  {
    slug: "matrix-rotation",
    title: "Rotate Matrix 90 Degrees",
    difficulty: "medium",
    tags: ["array", "matrix", "math"],
    description: `## Rotate Matrix 90 Degrees

Given an n x n 2D matrix, rotate it 90 degrees clockwise.

### Input Format
- First line: integer n (matrix size)
- Next n lines: n space-separated integers per row

### Output Format
- n lines of n space-separated integers (rotated matrix)

### Example
\`\`\`
Input:
3
1 2 3
4 5 6
7 8 9
Output:
7 4 1
8 5 2
9 6 3
\`\`\``,
    testCases: [
      { input: "3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "7 4 1\n8 5 2\n9 6 3", isHidden: false },
      { input: "2\n1 2\n3 4", expectedOutput: "3 1\n4 2", isHidden: false },
      { input: "1\n5", expectedOutput: "5", isHidden: true },
      { input: "4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16", expectedOutput: "13 9 5 1\n14 10 6 2\n15 11 7 3\n16 12 8 4", isHidden: true },
    ],
  },
  {
    slug: "longest-palindrome-substring",
    title: "Longest Palindromic Substring",
    difficulty: "hard",
    tags: ["string", "dynamic-programming"],
    description: `## Longest Palindromic Substring

Given a string s, return the longest palindromic substring in s.

### Input Format
- A single string

### Output Format
- The longest palindromic substring (if multiple of same length, return the first one found)

### Example
\`\`\`
Input:
babad
Output:
bab
\`\`\`

### Constraints
- 1 <= s.length <= 1000
- s consists of only lowercase English letters`,
    testCases: [
      { input: "babad", expectedOutput: "bab", isHidden: false },
      { input: "cbbd", expectedOutput: "bb", isHidden: false },
      { input: "a", expectedOutput: "a", isHidden: true },
      { input: "racecar", expectedOutput: "racecar", isHidden: true },
      { input: "aacabdkacaa", expectedOutput: "aca", isHidden: true },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  for (const p of problems) {
    const existing = await prisma.problem.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`  Skipping "${p.title}" (already exists)`);
      continue;
    }

    await prisma.problem.create({
      data: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        tags: JSON.stringify(p.tags),
        status: "approved",
        testCases: {
          create: p.testCases.map((tc, i) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            order: i,
          })),
        },
      },
    });
    console.log(`  Created "${p.title}"`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
