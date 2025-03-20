import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ListAlt as ListAltIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate, useParams, Link } from "react-router-dom";
import moment from "moment";
import api from "../../services/api";

interface Customer {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface Request {
  _id: string;
  requestId: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [relatedRequests, setRelatedRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        // 顧客情報を取得
        const customerResponse = await api.get(`/customers/${id}`);
        setCustomer(customerResponse.data);

        // 関連する要望を取得（このAPIは例なので、適切なAPIに変更してください）
        const requestsResponse = await api.get(`/requests?customer=${id}`);
        setRelatedRequests(requestsResponse.data.requests || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerData();
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

  // 顧客を削除
  const handleDeleteCustomer = async () => {
    if (!id) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/customers/${id}`);
      navigate("/customers");
    } catch (err: any) {
      setError(err.response?.data?.message || "顧客の削除に失敗しました");
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // 編集ページへ移動
  const handleEdit = () => {
    navigate(`/customers/edit/${id}`);
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

  if (error && !customer) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!customer) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        顧客情報が見つかりません
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
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/customers")}>
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

      {/* 顧客詳細情報 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <PersonIcon sx={{ fontSize: 40, mr: 2, color: "primary.main" }} />
              <Typography variant="h4" component="h1">
                {customer.name}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  基本情報
                </Typography>
                <List>
                  <ListItem divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <BusinessIcon sx={{ mr: 1, fontSize: 20, color: "text.secondary" }} />
                          <Typography variant="subtitle2">会社名</Typography>
                        </Box>
                      }
                      secondary={customer.company}
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <EmailIcon sx={{ mr: 1, fontSize: 20, color: "text.secondary" }} />
                          <Typography variant="subtitle2">メールアドレス</Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          component="a"
                          href={`mailto:${customer.email}`}
                          color="primary"
                          sx={{ textDecoration: "none" }}
                        >
                          {customer.email}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PhoneIcon sx={{ mr: 1, fontSize: 20, color: "text.secondary" }} />
                          <Typography variant="subtitle2">電話番号</Typography>
                        </Box>
                      }
                      secondary={
                        customer.phone ? (
                          <Typography
                            component="a"
                            href={`tel:${customer.phone}`}
                            color="primary"
                            sx={{ textDecoration: "none" }}
                          >
                            {customer.phone}
                          </Typography>
                        ) : (
                          <Typography color="text.secondary">登録なし</Typography>
                        )
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  システム情報
                </Typography>
                <List>
                  <ListItem divider>
                    <ListItemText
                      primary={<Typography variant="subtitle2">登録日時</Typography>}
                      secondary={moment(customer.createdAt).format("YYYY年MM月DD日 HH:mm")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={<Typography variant="subtitle2">最終更新日時</Typography>}
                      secondary={moment(customer.updatedAt).format("YYYY年MM月DD日 HH:mm")}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* 関連要望一覧 */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <ListAltIcon sx={{ mr: 1 }} />
          <Typography variant="h5" component="h2">
            関連する要望
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {relatedRequests.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>タイトル</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>優先度</TableCell>
                  <TableCell>登録日</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relatedRequests.map((request) => (
                  <TableRow key={request._id} hover>
                    <TableCell>{request.requestId}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(request.status),
                          color: "white",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.priority}
                        size="small"
                        sx={{
                          bgcolor: getPriorityColor(request.priority),
                          color: "white",
                        }}
                      />
                    </TableCell>
                    <TableCell>{moment(request.createdAt).format("YYYY/MM/DD")}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="text"
                        color="primary"
                        component={Link}
                        to={`/requests/${request._id}`}
                        size="small"
                      >
                        詳細
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" sx={{ py: 4, textAlign: "center" }} color="text.secondary">
            関連する要望はありません
          </Typography>
        )}

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={"/requests/new"}
            startIcon={<ListAltIcon />}
          >
            新規要望を登録
          </Button>
        </Box>
      </Paper>

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>顧客の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            顧客「{customer.name}（{customer.company}）」を削除しますか？
            <br />
            この操作は元に戻せません。関連する要望のデータには影響しません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            キャンセル
          </Button>
          <Button onClick={handleDeleteCustomer} color="error" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={24} /> : "削除"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerDetail;
