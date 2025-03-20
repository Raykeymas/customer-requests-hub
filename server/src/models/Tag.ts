import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
  name: string;
  color: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  color: {
    type: String,
    default: '#3498db' // デフォルトの色
  },
  category: {
    type: String,
    enum: ['機能領域', '顧客属性', '重要度', 'その他'],
    default: 'その他'
  }
}, {
  timestamps: true
});

export default mongoose.model<ITag>('Tag', TagSchema);