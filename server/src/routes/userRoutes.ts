import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  getUsers 
} from '../controllers/userController';
import { protect, admin } from '../utils/authUtils';

const router = express.Router();

// ユーザー登録
router.post('/', registerUser);

// ユーザーログイン
router.post('/login', loginUser);

// プロフィール取得
router.get('/profile', protect, getUserProfile);

// ユーザー一覧取得（管理者用）
router.get('/', protect, admin, getUsers);

export default router;