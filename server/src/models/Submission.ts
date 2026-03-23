import mongoose, { Schema, Document } from 'mongoose';

export type SubmissionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR';

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  contestId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  language: string;
  code: string;
  status: SubmissionStatus;
  score: number;
  executionTime?: number; // ms
  memoryUsed?: number; // KB
  testResults: Array<{
    passed: boolean;
    time: number;
    memory: number;
    error?: string;
  }>;
  judge0Token?: string;
  submittedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contestId: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'PENDING',
        'ACCEPTED',
        'WRONG_ANSWER',
        'TIME_LIMIT_EXCEEDED',
        'MEMORY_LIMIT_EXCEEDED',
        'COMPILATION_ERROR',
        'RUNTIME_ERROR',
      ],
      default: 'PENDING',
    },
    score: { type: Number, default: 0 },
    executionTime: Number,
    memoryUsed: Number,
    testResults: [
      {
        passed: Boolean,
        time: Number,
        memory: Number,
        error: String,
        _id: false,
      },
    ],
    judge0Token: String,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

submissionSchema.index({ userId: 1, contestId: 1, problemId: 1 });
submissionSchema.index({ contestId: 1, status: 1 });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
