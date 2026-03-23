export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type ContestStatus = 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'ENDED';
export type Visibility = 'PUBLIC' | 'PRIVATE';
export type ScoringType = 'ACM' | 'IOI';
export type SubmissionStatus = 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR';

export interface UserProfile {
  avatar?: string;
  bio?: string;
  institution?: string;
  country?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface UserStats {
  solved: number;
  contests: number;
  wins: number;
  streak: number;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: Role;
  profile?: UserProfile;
  rating: number;
  stats: UserStats;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contest {
  _id: string;
  title: string;
  slug: string;
  description: string;
  createdBy: string | Partial<User>;
  status: ContestStatus;
  startTime: string;
  endTime: string;
  scoringType: ScoringType;
  difficulty: Difficulty;
  visibility: Visibility;
  inviteCode?: string;
  problems: string[] | any[]; // Usually populated as Problem interfaces
  participants: string[] | Partial<User>[];
  tags: string[];
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  _id: string;
  title: string;
  slug: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleTestCases: TestCase[];
  hiddenTestCases?: TestCase[]; // Usually omitted from API responses to non-admins
  timeLimit: number; // in seconds
  memoryLimit: number; // in MB
  difficulty: Difficulty;
  tags: string[];
  points: number;
  editorial?: string;
  createdBy: string | Partial<User>;
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  testCaseId?: string;
  passed: boolean;
  time?: number;
  memory?: number;
  output?: string;
  error?: string;
  expectedOutput?: string;
}

export interface Submission {
  _id: string;
  userId: string | Partial<User>;
  contestId: string | Partial<Contest>;
  problemId: string | Partial<Problem>;
  language: string;
  code: string;
  status: SubmissionStatus;
  score: number;
  executionTime?: number;
  memoryUsed?: number;
  testResults?: TestResult[];
  submittedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  username?: string;
  rank: number;
  totalScore: number;
  penalty: number;
  lastSubmission?: string;
}

export interface Leaderboard {
  _id: string;
  contestId: string;
  rankings: LeaderboardEntry[];
  lastUpdated: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
