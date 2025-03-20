import { Request, Response } from 'express';
import Customer, { ICustomer } from '../models/Customer';
import { AuthRequest } from '../utils/authUtils';

// 顧客を作成
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, company, email, phone } = req.body;
    
    // 同じメールアドレスの顧客が存在するか確認
    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      return res.status(400).json({ message: '同じメールアドレスの顧客が既に存在します' });
    }
    
    const customer = await Customer.create({
      name,
      company,
      email,
      phone
    });
    
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// すべての顧客を取得
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.find({});
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// 顧客をIDで取得
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: '顧客が見つかりません' });
    }
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// 顧客を検索（名前または会社名）
export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: '検索クエリが必要です' });
    }
    
    const customers = await Customer.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } }
      ]
    });
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// 顧客を更新
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { name, company, email, phone } = req.body;
    
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: '顧客が見つかりません' });
    }
    
    // メールアドレスを変更する場合は重複チェック
    if (email && email !== customer.email) {
      const customerExists = await Customer.findOne({ email });
      if (customerExists) {
        return res.status(400).json({ message: '同じメールアドレスの顧客が既に存在します' });
      }
    }
    
    customer.name = name || customer.name;
    customer.company = company || customer.company;
    customer.email = email || customer.email;
    customer.phone = phone || customer.phone;
    
    const updatedCustomer = await customer.save();
    
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// 顧客を削除
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: '顧客が見つかりません' });
    }
    
    await customer.deleteOne();
    
    res.json({ message: '顧客が削除されました' });
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};