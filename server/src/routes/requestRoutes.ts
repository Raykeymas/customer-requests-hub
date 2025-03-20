import express from 'express';
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  findSimilarRequests,
  addComment,
  getRequestStats
} from '../controllers/requestController';
import { protect } from '../utils/authUtils';

const router = express.Router();

// すべての要望を取得（フィルタリング・ソート可能）
router.get('/', protect, getRequests);

// 類似要望を検索
router.post('/similar', protect, findSimilarRequests);

// 要望の統計データを取得
router.get('/stats', protect, getRequestStats);

// 要望を作成
router.post('/', protect, createRequest);

// 要望をIDで取得
router.get('/:id', protect, getRequestById);

// 要望を更新
router.put('/:id', protect, updateRequest);

// 要望にコメントを追加
router.post('/:id/comments', protect, addComment);

// 要望を削除
router.delete('/:id', protect, deleteRequest);

export default router;