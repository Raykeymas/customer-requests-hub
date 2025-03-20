import express from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  searchCustomers
} from '../controllers/customerController';
import { protect } from '../utils/authUtils';

const router = express.Router();

// すべての顧客を取得
router.get('/', protect, getCustomers);

// 顧客を検索
router.get('/search', protect, searchCustomers);

// 顧客を作成
router.post('/', protect, createCustomer);

// 顧客をIDで取得
router.get('/:id', protect, getCustomerById);

// 顧客を更新
router.put('/:id', protect, updateCustomer);

// 顧客を削除
router.delete('/:id', protect, deleteCustomer);

export default router;