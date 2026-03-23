import axios from 'axios';
import { env } from '../config/env';

const LANGUAGE_ID: Record<string, number> = {
  'c++': 54, 'cpp': 54,
  'python': 71,
  'java': 62,
  'javascript': 63,
  'typescript': 74,
};

interface TestResult {
  passed: boolean;
  time: number;
  memory: number;
  timedOut?: boolean;
  compileError?: boolean;
  error?: string;
}

export class JudgeService {
  static async runCode(code: string, language: string, problem: any): Promise<TestResult[]> {
    const langId = LANGUAGE_ID[language.toLowerCase()];
    if (!langId) throw new Error(`Unsupported language: ${language}`);

    const testCases = problem.hiddenTestCases?.length
      ? problem.hiddenTestCases
      : problem.sampleTestCases;

    const results: TestResult[] = [];

    for (const tc of testCases) {
      const result = await this.submitToJudge0(
        code,
        langId,
        tc.input,
        tc.output,
        problem.timeLimit,
        problem.memoryLimit
      );
      results.push(result);

      // Fail fast on compile error
      if (result.compileError) break;
    }

    return results;
  }

  private static async submitToJudge0(
    sourceCode: string,
    languageId: number,
    stdin: string,
    expectedOutput: string,
    timeLimit: number,
    memoryLimit: number
  ): Promise<TestResult> {
    const apiUrl = env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    const apiKey = env.JUDGE0_API_KEY || '';

    try {
      // Create submission
      const { data: sub } = await axios.post(
        `${apiUrl}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: sourceCode,
          language_id: languageId,
          stdin,
          expected_output: expectedOutput,
          cpu_time_limit: timeLimit,
          memory_limit: memoryLimit * 1024,
        },
        {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const statusId = sub.status?.id;

      return {
        passed: statusId === 3, // 3 = Accepted
        time: parseFloat(sub.time || '0') * 1000, // convert to ms
        memory: sub.memory || 0,
        timedOut: statusId === 5, // TLE
        compileError: statusId === 6, // CE
        error: sub.stderr || sub.compile_output || undefined,
      };
    } catch (err: any) {
      console.error('Judge0 error:', err.message);
      return { passed: false, time: 0, memory: 0, error: 'Judge unavailable' };
    }
  }
}
