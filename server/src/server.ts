import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import customerRoutes from './routes/customerRoutes';
import tagRoutes from './routes/tagRoutes';
import requestRoutes from './routes/requestRoutes';
import multer from 'multer';
import fs from 'fs';

// 環境変数の読み込み
dotenv.config();

// データベース接続
connectDB();

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ファイルアップロード用のストレージ設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // アップロードディレクトリがなければ作成
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ファイルアップロードAPI
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'ファイルがアップロードされていません' });
  }
  res.json({
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
  });
});

// 静的ファイルの提供
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/requests', requestRoutes);

// 本番環境ではフロントエンドも提供
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../client/build');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`サーバー起動: ポート ${PORT}`);
});