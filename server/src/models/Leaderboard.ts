import mongoose, { Schema, Document } from 'mongoose';

interface SolvedProblem {
  problemId: mongoose.Types.ObjectId;
  attempts: number;
  acceptedAt?: Date;
  score: number;
  penalty: number; // minutes
}

interface RankingEntry {
  userId: mongoose.Types.ObjectId;
  username: string;
  avatar?: string;
  totalScore: number;
  penalty: number;
  solvedProblems: SolvedProblem[];
  rank: number;
  lastSubmission?: Date;
}

export interface ILeaderboard extends Document {
  contestId: mongoose.Types.ObjectId;
  rankings: RankingEntry[];
  updatedAt: Date;
}

const leaderboardSchema = new Schema<ILeaderboard>(
  {
    contestId: {
      type: Schema.Types.ObjectId,
      ref: 'Contest',
      required: true,
      unique: true,
    },
    rankings: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        username: String,
        avatar: String,
        totalScore: { type: Number, default: 0 },
        penalty: { type: Number, default: 0 },
        solvedProblems: [
          {
            problemId: Schema.Types.ObjectId,
            attempts: { type: Number, default: 0 },
            acceptedAt: Date,
            score: Number,
            penalty: Number,
            _id: false,
          },
        ],
        rank: Number,
        lastSubmission: Date,
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

leaderboardSchema.index({ contestId: 1 });

export const Leaderboard = mongoose.model<ILeaderboard>('Leaderboard', leaderboardSchema);
