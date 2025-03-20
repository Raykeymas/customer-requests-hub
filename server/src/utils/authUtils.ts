import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';

// JWTトークン生成
export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '30d' }
  );
};

// 拡張したExpressのRequestインターフェース
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// 認証ミドルウェア
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your_jwt_secret'
      );

      req.user = decoded as { id: string; role: string };
      next();
    } catch (error) {
      res.status(401).json({ message: '認証トークンが無効です' });
    }
  }

  if (!token) {
    res.status(401).json({ message: '認証トークンがありません' });
  }
};

// 管理者権限確認ミドルウェア
export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '管理者権限が必要です' });
  }
};