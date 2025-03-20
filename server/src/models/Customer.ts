import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  company: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model<ICustomer>('Customer', CustomerSchema);