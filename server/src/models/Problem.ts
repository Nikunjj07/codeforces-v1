import mongoose, { Schema, Document } from 'mongoose';

interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface IProblem extends Document {
  title: string;
  slug: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
  timeLimit: number; // seconds
  memoryLimit: number; // MB
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  tags: string[];
  points: number;
  editorial?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const testCaseSchema = new Schema<TestCase>(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: String,
  },
  { _id: false }
);

const problemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    statement: { type: String, required: true },
    inputFormat: { type: String, required: true },
    outputFormat: { type: String, required: true },
    constraints: { type: String, required: true },
    sampleTestCases: [testCaseSchema],
    hiddenTestCases: [testCaseSchema],
    timeLimit: { type: Number, default: 1 }, // 1 second default
    memoryLimit: { type: Number, default: 256 }, // 256MB default
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
      required: true,
    },
    tags: [String],
    points: { type: Number, default: 100 },
    editorial: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

problemSchema.index({ tags: 1, difficulty: 1 });

export const Problem = mongoose.model<IProblem>('Problem', problemSchema);
