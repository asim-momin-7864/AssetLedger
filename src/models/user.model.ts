//* user model
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// interface for user schema
export interface IUser extends Document {
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'IT_ADMIN';
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

// schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['EMPLOYEE', 'IT_ADMIN'],
      required: true,
      uppercase: true,
      default: 'EMPLOYEE',
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// pre opeartion on IUser, Hash password before saving
UserSchema.pre<IUser>('save', async function () {
  // hash only after modify password and set new
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// lets add custome password compare method ( we store it in schmea filed )
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// make model and export
export const User = mongoose.model<IUser>('User', UserSchema);
