import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  profile: {
    avatar?: string;
    bio?: string;
    institution?: string;
    country?: string;
    socialLinks?: { github?: string; linkedin?: string; website?: string };
  };
  rating: number;
  stats: {
    solved: number;
    contests: number;
    wins: number;
    streak: number;
  };
  refreshTokens: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['STUDENT', 'TEACHER', 'ADMIN'],
      default: 'STUDENT',
    },
    profile: {
      avatar: String,
      bio: { type: String, maxlength: 300 },
      institution: String,
      country: String,
      socialLinks: {
        github: String,
        linkedin: String,
        website: String,
      },
    },
    rating: { type: Number, default: 1200 },
    stats: {
      solved: { type: Number, default: 0 },
      contests: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
    },
    refreshTokens: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Don't return sensitive fields by default
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const r: any = ret;
    r.passwordHash = undefined;
    r.refreshTokens = undefined;
    return r;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
