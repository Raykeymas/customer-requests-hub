import { Request, Response } from 'express';
import mongoose from 'mongoose';
import CustomerRequest, { IRequest } from '../models/Request';
import { AuthRequest } from '../utils/authUtils';

// 要望を作成
export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      title, 
      content, 
      customers, 
      reporter, 
      status, 
      priority, 
      tags,
      customFields 
    } = req.body;
    
    // 必須項目のチェック
    if (!title || !content) {
      return res.status(400).json({ message: 'タイトルと内容は必須項目です' });
    }
    
    const request = new CustomerRequest({
      title,
      content,
      customers,
      reporter,
      status: status || '新規',
      priority: priority || '中',
      tags,
      customFields,
      createdBy: req.user?.id,
      updatedBy: req.user?.id
    });
    
    const createdRequest = await request.save();
    
    // 関連情報を取得して返す
    const populatedRequest = await CustomerRequest.findById(createdRequest._id)
      .populate('customers', 'name company')
      .populate('tags', 'name color category')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// すべての要望を取得（フィルタリング・ソート可能）
export const getRequests = async (req: Request, res: Response) => {
  try {
    const {
      status, 
      priority,
      customer,
      tag,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;
    
    // フィルタリング条件を構築
    const filter: any = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (customer) filter.customers = customer;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { reporter: { $regex: search, $options: 'i' } }
      ];
    }
    
    // ページネーション設定
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // ソート設定
    const sortOption: any = {};
    sortOption[sort as string] = order === 'desc' ? -1 : 1;
    
    // 要望数をカウント
    const total = await CustomerRequest.countDocuments(filter);
    
    // 要望を取得
    const requests = await CustomerRequest.find(filter)
      .populate('customers', 'name company')
      .populate('tags', 'name color category')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);
    
    res.json({
      requests,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// 要望をIDで取得
export const getRequestById = async (req: Request, res: Response) => {
  try {
    const request = await CustomerRequest.findById(req.params.id)
      .populate('customers', 'name company email')
      .populate('tags', 'name color category')
      .populate('parentRequest', 'requestId title')
      .populate('relatedRequests', 'requestId title')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('comments.author', 'name');
    
    if (!request) {
      return res.status(404).json({ message: '要望が見つかりません' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// 類似要望を検索
export const findSimilarRequests = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    
    if (!title && !content) {
      return res.status(400).json({ message: 'タイトルまたは内容が必要です' });
    }
    
    let searchQuery: any = {};
    
    if (title) {
      searchQuery.title = { $regex: title, $options: 'i' };
    }
    
    if (content) {
      if (!searchQuery.$or) searchQuery.$or = [];
      searchQuery.$or = [
        { title: { $regex: content, $options: 'i' } },
        { content: { $regex: content, $options: 'i' } }
      ];
    }
    
    const similarRequests = await CustomerRequest.find(searchQuery)
      .select('requestId title content status')
      .limit(5);
    
    res.json(similarRequests);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// 要望を更新
export const updateRequest = async (req: AuthRequest, res: Response) => {
  try {
    const request = await CustomerRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: '要望が見つかりません' });
    }
    
    const {
      title,
      content,
      customers,
      reporter,
      status,
      priority,
      tags,
      parentRequest,
      relatedRequests,
      customFields
    } = req.body;
    
    // 変更履歴を記録
    const history: any = [];
    
    if (title !== undefined && title !== request.title) {
      history.push({
        field: 'title',
        oldValue: request.title,
        newValue: title,
        changedBy: req.user?.id,
        changedAt: new Date()
      });
      request.title = title;
    }
    
    if (content !== undefined && content !== request.content) {
      history.push({
        field: 'content',
        oldValue: request.content,
        newValue: content,
        changedBy: req.user?.id,
        changedAt: new Date()
      });
      request.content = content;
    }
    
    if (reporter !== undefined && reporter !== request.reporter) {
      history.push({
        field: 'reporter',
        oldValue: request.reporter,
        newValue: reporter,
        changedBy: req.user?.id,
        changedAt: new Date()
      });
      request.reporter = reporter;
    }
    
    if (status !== undefined && status !== request.status) {
      history.push({
        field: 'status',
        oldValue: request.status,
        newValue: status,
        changedBy: req.user?.id,
        changedAt: new Date()
      });
      request.status = status;
    }
    
    if (priority !== undefined && priority !== request.priority) {
      history.push({
        field: 'priority',
        oldValue: request.priority,
        newValue: priority,
        changedBy: req.user?.id,
        changedAt: new Date()
      });
      request.priority = priority;
    }
    
    if (customers !== undefined) {
      history.push({
        field: 'customers',
        oldValue: request.customers,
        newValue: customers,
        changedBy: req.user?.id,
        changedAt: new Date()
      });
      request.customers = customers;
    }
    
    if (tags !== undefined) {
      history.push({
        field: 'tags',
        oldValue: request.tags,
        newValue: tags,
        changedBy: req.user?.id,
        changedAt: new Date()
      });
      request.tags = tags;
    }
    
    if (parentRequest !== undefined) {
      history.push({
        field: 'parentRequest',
        oldValue: request.parentRequest,
        newValue: parentRequest,
        changedBy: req.user?.id,
        changedAt: new Date()
      });
      request.parentRequest = parentRequest;
    }
    
    if (relatedRequests !== undefined) {
      history.push({
        field: 'relatedRequests',
        oldValue: request.relatedRequests,
        newValue: relatedRequests,
        changedBy: req.user?.id,
        changedAt: new Date()
      });
      request.relatedRequests = relatedRequests;
    }
    
    if (customFields !== undefined) {
      history.push({
        field: 'customFields',
        oldValue: request.customFields,
        newValue: customFields,
        changedBy: req.user?.id,
        changedAt: new Date()
      });
      request.customFields = customFields;
    }
    
    // 履歴を追加
    request.history.push(...history);
    
    // 更新者とタイムスタンプを更新
    request.updatedBy = req.user?.id;
    
    const updatedRequest = await request.save();
    
    // 関連情報を取得して返す
    const populatedRequest = await CustomerRequest.findById(updatedRequest._id)
      .populate('customers', 'name company')
      .populate('tags', 'name color category')
      .populate('parentRequest', 'requestId title')
      .populate('relatedRequests', 'requestId title')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('comments.author', 'name');
    
    res.json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// 要望にコメントを追加
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { content, attachments } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'コメント内容は必須です' });
    }
    
    const request = await CustomerRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: '要望が見つかりません' });
    }
    
    const comment = {
      content,
      author: new mongoose.Types.ObjectId(req.user?.id),
      attachments: attachments || [],
    };
    
    request.comments.push(comment);
    request.updatedBy = new mongoose.Types.ObjectId(req.user?.id);
    
    await request.save();
    
    // 最新のコメントを含む要望を返す
    const updatedRequest = await CustomerRequest.findById(req.params.id)
      .populate('comments.author', 'name')
      .populate('updatedBy', 'name');
    
    res.status(201).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// 要望を削除
export const deleteRequest = async (req: AuthRequest, res: Response) => {
  try {
    const request = await CustomerRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: '要望が見つかりません' });
    }
    
    await request.deleteOne();
    
    res.json({ message: '要望が削除されました' });
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};

// 要望の集計・分析データを取得
export const getRequestStats = async (req: Request, res: Response) => {
  try {
    // ステータス別の要望数
    const statusStats = await CustomerRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // 優先度別の要望数
    const priorityStats = await CustomerRequest.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { 
          _id: 1,
          count: -1 
        }
      }
    ]);
    
    // タグ別の要望数（上位10件）
    const tagStats = await CustomerRequest.aggregate([
      {
        $unwind: '$tags'
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'tags',
          localField: '_id',
          foreignField: '_id',
          as: 'tagInfo'
        }
      },
      {
        $unwind: '$tagInfo'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$tagInfo.name',
          color: '$tagInfo.color',
          category: '$tagInfo.category'
        }
      }
    ]);
    
    // 月別の要望登録数（過去12ヶ月）
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    const monthlyStats = await CustomerRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);
    
    // 顧客別の要望数（上位10件）
    const customerStats = await CustomerRequest.aggregate([
      {
        $unwind: '$customers'
      },
      {
        $group: {
          _id: '$customers',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      {
        $unwind: '$customerInfo'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$customerInfo.name',
          company: '$customerInfo.company'
        }
      }
    ]);
    
    res.json({
      statusStats,
      priorityStats,
      tagStats,
      monthlyStats,
      customerStats,
      totalRequests: await CustomerRequest.countDocuments(),
      newRequestsThisMonth: await CustomerRequest.countDocuments({
        createdAt: { 
          $gte: new Date(today.getFullYear(), today.getMonth(), 1)
        }
      })
    });
  } catch (error) {
    res.status(500).json({ message: '予期せぬエラーが発生しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
};