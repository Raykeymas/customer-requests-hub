import express from 'express';
import {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
  getTagsByCategory,
  getTagStats
} from '../controllers/tagController';
import { protect } from '../utils/authUtils';

const router = express.Router();

// すべてのタグを取得
router.get('/', protect, getTags);

// タグ統計を取得
router.get('/stats', protect, getTagStats);

// カテゴリー別のタグを取得
router.get('/category/:category', protect, getTagsByCategory);

// タグを作成
router.post('/', protect, createTag);

// タグをIDで取得
router.get('/:id', protect, getTagById);

// タグを更新
router.put('/:id', protect, updateTag);

// タグを削除
router.delete('/:id', protect, deleteTag);

export default router;