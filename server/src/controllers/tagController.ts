import { Request, Response } from 'express';
import Tag, { ITag } from '../models/Tag';
import { AuthRequest } from '../utils/authUtils';

// タグ作成
export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, color, category } = req.body;
    
    // 同じ名前のタグが存在するか確認
    const tagExists = await Tag.findOne({ name });
    if (tagExists) {
      return res.status(400).json({ message: '同じ名前のタグが既に存在します' });
    }
    
    const tag = await Tag.create({
      name,
      color: color || '#3498db',
      category: category || 'その他'
    });
    
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// すべてのタグを取得
export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await Tag.find({});
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// タグをIDで取得
export const getTagById = async (req: Request, res: Response) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({ message: 'タグが見つかりません' });
    }
    
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// タグをカテゴリーで取得
export const getTagsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    const tags = await Tag.find({ category });
    
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// タグを更新
export const updateTag = async (req: Request, res: Response) => {
  try {
    const { name, color, category } = req.body;
    
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({ message: 'タグが見つかりません' });
    }
    
    // 名前を変更する場合は重複チェック
    if (name && name !== tag.name) {
      const tagExists = await Tag.findOne({ name });
      if (tagExists) {
        return res.status(400).json({ message: '同じ名前のタグが既に存在します' });
      }
      tag.name = name;
    }
    
    if (color) tag.color = color;
    if (category) tag.category = category;
    
    const updatedTag = await tag.save();
    
    res.json(updatedTag);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// タグを削除
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({ message: 'タグが見つかりません' });
    }
    
    await tag.deleteOne();
    
    res.json({ message: 'タグが削除されました' });
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// タグ統計を取得
export const getTagStats = async (req: Request, res: Response) => {
  try {
    const tagCounts = await Tag.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json(tagCounts);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};