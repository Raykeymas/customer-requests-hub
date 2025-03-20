import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
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

const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // 顧客データの取得
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        let url = "/customers";

        // 検索クエリがある場合
        if (searchQuery) {
          url = `/customers/search?query=${encodeURIComponent(searchQuery)}`;
        }

        const response = await api.get(url);
        setCustomers(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [searchQuery]);

  // ページネーションハンドラー
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 検索ハンドラー
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // 削除ダイアログを開く
  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  // 削除ダイアログを閉じる
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  // 顧客を削除
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/customers/${customerToDelete._id}`);

      // 削除後に顧客リストを更新
      setCustomers(customers.filter((c) => c._id !== customerToDelete._id));

      closeDeleteDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || "顧客の削除に失敗しました");
    } finally {
      setDeleteLoading(false);
    }
  };

  // 顧客の詳細ページに移動
  const handleViewCustomer = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  // 顧客の編集ページに移動
  const handleEditCustomer = (customerId: string) => {
    navigate(`/customers/edit/${customerId}`);
  };

  if (loading && customers.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && customers.length === 0) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // 現在のページに表示する顧客データ
  const paginatedCustomers = customers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          顧客一覧
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate("/customers/new")}
        >
          顧客登録
        </Button>
      </Box>

      {/* 検索欄 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="顧客名または会社名で検索..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchQuery("")} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* 顧客一覧テーブル */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>顧客名</TableCell>
              <TableCell>会社名</TableCell>
              <TableCell>メールアドレス</TableCell>
              <TableCell>電話番号</TableCell>
              <TableCell>登録日</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCustomers.map((customer) => (
              <TableRow key={customer._id} hover>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.company}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone || "-"}</TableCell>
                <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Tooltip title="詳細を表示">
                    <IconButton color="primary" onClick={() => handleViewCustomer(customer._id)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="編集">
                    <IconButton color="secondary" onClick={() => handleEditCustomer(customer._id)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="削除">
                    <IconButton color="error" onClick={() => openDeleteDialog(customer)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginatedCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 3 }}>
                    顧客が見つかりません
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ページネーション */}
      <TablePagination
        component="div"
        count={customers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="表示件数:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} / ${count !== -1 ? count : `${to}以上`}`
        }
      />

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>顧客の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            顧客「{customerToDelete?.name}」を削除しますか？ この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleteLoading}>
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

export default CustomerList;
