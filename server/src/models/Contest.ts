import mongoose, { Schema, Document } from 'mongoose';

export interface IContest extends Document {
  title: string;
  slug: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  status: 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'ENDED';
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  scoringType: 'ACM' | 'IOI';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  visibility: 'PUBLIC' | 'PRIVATE';
  inviteCode?: string;
  problems: mongoose.Types.ObjectId[];
  participants: mongoose.Types.ObjectId[];
  tags: string[];
  maxParticipants?: number;
  createdAt: Date;
  updatedAt: Date;
}

const contestSchema = new Schema<IContest>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'LIVE', 'ENDED'],
      default: 'DRAFT',
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    scoringType: { type: String, enum: ['ACM', 'IOI'], default: 'ACM' },
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
      default: 'INTERMEDIATE',
    },
    visibility: { type: String, enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' },
    inviteCode: String,
    problems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tags: [String],
    maxParticipants: Number,
  },
  { timestamps: true }
);

contestSchema.index({ status: 1, startTime: -1 });
contestSchema.index({ slug: 1 });

export const Contest = mongoose.model<IContest>('Contest', contestSchema);
