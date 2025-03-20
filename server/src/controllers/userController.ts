import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { generateToken, AuthRequest } from '../utils/authUtils';

// ユーザー登録
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'このメールアドレスは既に登録されています' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// ユーザーログイン
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// プロフィール取得
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'ユーザーが見つかりません' });
    }
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// ユーザー一覧取得（管理者用）
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};