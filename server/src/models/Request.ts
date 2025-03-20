import mongoose, { Document, Schema } from 'mongoose';
import { ICustomer } from './Customer';
import { ITag } from './Tag';

export interface IHistory {
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: Schema.Types.ObjectId;
  changedAt: Date;
}

export interface IComment extends Document {
  content: string;
  author: Schema.Types.ObjectId;
  attachments: string[];
  createdAt: Date;
}

export interface IRequest extends Document {
  requestId: string;
  title: string;
  content: string;
  customers: Schema.Types.ObjectId[] | ICustomer[];
  reporter: string;
  status: string;
  priority: string;
  tags: Schema.Types.ObjectId[] | ITag[];
  parentRequest?: Schema.Types.ObjectId | IRequest;
  relatedRequests: (Schema.Types.ObjectId | IRequest)[];
  customFields: Map<string, any>;
  comments: IComment[];
  history: IHistory[];
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    type: String
  }],
}, {
  timestamps: true
});

const HistorySchema = new Schema({
  field: {
    type: String,
    required: true
  },
  oldValue: {
    type: Schema.Types.Mixed
  },
  newValue: {
    type: Schema.Types.Mixed
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
});

const RequestSchema = new Schema({
  requestId: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  customers: [{
    type: Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  reporter: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['新規', '検討中', '保留', '却下', '実装予定', '完了'],
    default: '新規'
  },
  priority: {
    type: String,
    enum: ['低', '中', '高', '緊急'],
    default: '中'
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  parentRequest: {
    type: Schema.Types.ObjectId,
    ref: 'Request'
  },
  relatedRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'Request'
  }],
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  },
  comments: [CommentSchema],
  history: [HistorySchema],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 自動でrequestIdを生成するためのミドルウェア
RequestSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Request').countDocuments();
    this.requestId = `REQ-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<IRequest>('Request', RequestSchema);