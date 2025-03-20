import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  Avatar,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import api from "../../services/api";

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  attachments: string[];
  createdAt: string;
}

interface Tag {
  _id: string;
  name: string;
  color: string;
  category: string;
}

interface Customer {
  _id: string;
  name: string;
  company: string;
  email: string;
}

interface HistoryItem {
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: {
    _id: string;
    name: string;
  };
  changedAt: string;
}

interface RequestDetail {
  _id: string;
  requestId: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  reporter: string;
  customers: Customer[];
  tags: Tag[];
  comments: Comment[];
  history: HistoryItem[];
  createdBy: {
    _id: string;
    name: string;
  };
  updatedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchRequestDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/requests/${id}`);
        setRequest(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequestDetail();
    }
  }, [id]);

  // 削除確認ダイアログを開く
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // 削除確認ダイアログを閉じる
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // 要望を削除
  const handleDeleteRequest = async () => {
    if (!id) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/requests/${id}`);
      navigate("/requests");
    } catch (err: any) {
      setError(err.response?.data?.message || "要望の削除に失敗しました");
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // 編集ページへ移動
  const handleEdit = () => {
    navigate(`/requests/edit/${id}`);
  };

  // コメント送信
  const handleSendComment = async () => {
    if (!commentText.trim() || !id) return;

    try {
      setCommentLoading(true);
      const response = await api.post(`/requests/${id}/comments`, {
        content: commentText.trim(),
      });

      // 要望データを更新
      setRequest(response.data);
      setCommentText("");
    } catch (err: any) {
      setError(err.response?.data?.message || "コメントの送信に失敗しました");
    } finally {
      setCommentLoading(false);
    }
  };

  // 履歴ダイアログを開く
  const handleOpenHistoryDialog = () => {
    setHistoryDialogOpen(true);
  };

  // 履歴ダイアログを閉じる
  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
  };

  // ステータスに応じた色を返す
  const getStatusColor = (status: string) => {
    switch (status) {
      case "新規":
        return "#4caf50";
      case "検討中":
        return "#2196f3";
      case "保留":
        return "#ff9800";
      case "却下":
        return "#f44336";
      case "実装予定":
        return "#9c27b0";
      case "完了":
        return "#3f51b5";
      default:
        return "#757575";
    }
  };

  // 優先度に応じた色を返す
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "低":
        return "#4caf50";
      case "中":
        return "#ff9800";
      case "高":
        return "#f44336";
      case "緊急":
        return "#9c27b0";
      default:
        return "#757575";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !request) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!request) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        要望情報が見つかりません
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* エラーメッセージ */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* ヘッダー部分 */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/requests")}>
          一覧に戻る
        </Button>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ mr: 1 }}
          >
            編集
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleOpenDeleteDialog}
          >
            削除
          </Button>
        </Box>
      </Box>

      {/* 要望詳細 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {request.title}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {request.requestId}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {request.content}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  ステータス
                </Typography>
                <Chip
                  label={request.status}
                  sx={{
                    bgcolor: getStatusColor(request.status),
                    color: "white",
                    mb: 1,
                  }}
                />

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  優先度
                </Typography>
                <Chip
                  label={request.priority}
                  sx={{
                    bgcolor: getPriorityColor(request.priority),
                    color: "white",
                    mb: 1,
                  }}
                />

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  報告者
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {request.reporter}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  タグ
                </Typography>
                <Box sx={{ mb: 1 }}>
                  {request.tags.map((tag) => (
                    <Chip
                      key={tag._id}
                      label={tag.name}
                      size="small"
                      sx={{
                        bgcolor: tag.color,
                        color: "white",
                        mr: 0.5,
                        mb: 0.5,
                      }}
                    />
                  ))}
                </Box>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  関連顧客
                </Typography>
                <Box sx={{ mb: 1 }}>
                  {request.customers.map((customer) => (
                    <Typography key={customer._id} variant="body2" gutterBottom>
                      {customer.name} ({customer.company})
                    </Typography>
                  ))}
                </Box>

                <Divider sx={{ my: 1 }} />

                <Typography variant="caption" display="block" color="text.secondary">
                  登録日: {moment(request.createdAt).format("YYYY/MM/DD HH:mm")}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  登録者: {request.createdBy.name}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  最終更新: {moment(request.updatedAt).format("YYYY/MM/DD HH:mm")}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  更新者: {request.updatedBy.name}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    startIcon={<HistoryIcon />}
                    onClick={handleOpenHistoryDialog}
                  >
                    変更履歴を表示
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* コメントセクション */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <CommentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          コメント
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* コメント入力欄 */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="コメントを入力"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={commentLoading}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              endIcon={commentLoading ? <CircularProgress size={20} /> : <SendIcon />}
              onClick={handleSendComment}
              disabled={commentLoading || commentText.trim() === ""}
            >
              コメント送信
            </Button>
          </Box>
        </Box>

        {/* コメント一覧 */}
        {request.comments.length > 0 ? (
          request.comments.map((comment) => (
            <Card key={comment._id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32, mr: 1 }}>
                    {comment.author.name.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle1">{comment.author.name}</Typography>
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {moment(comment.createdAt).format("YYYY/MM/DD HH:mm")}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {comment.content}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
            まだコメントはありません
          </Typography>
        )}
      </Paper>

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>要望の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            要望「{request.title}」を削除しますか？この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            キャンセル
          </Button>
          <Button onClick={handleDeleteRequest} color="error" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={24} /> : "削除"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 変更履歴ダイアログ */}
      <Dialog open={historyDialogOpen} onClose={handleCloseHistoryDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <HistoryIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          変更履歴
        </DialogTitle>
        <DialogContent dividers>
          {request.history.length > 0 ? (
            <List>
              {request.history.map((item, index) => (
                <ListItem
                  key={index}
                  alignItems="flex-start"
                  divider={index < request.history.length - 1}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "secondary.main" }}>
                      <AssignmentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {item.field === "status" && "ステータス変更"}
                        {item.field === "priority" && "優先度変更"}
                        {item.field === "title" && "タイトル変更"}
                        {item.field === "content" && "内容変更"}
                        {item.field === "customers" && "関連顧客変更"}
                        {item.field === "tags" && "タグ変更"}
                        {item.field === "reporter" && "報告者変更"}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {moment(item.changedAt).format("YYYY/MM/DD HH:mm")} -{" "}
                          {item.changedBy.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.field === "customers" || item.field === "tags"
                            ? "関連情報が更新されました"
                            : `${item.oldValue} → ${item.newValue}`}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" sx={{ p: 2, textAlign: "center" }}>
              履歴はありません
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequestDetailPage;
