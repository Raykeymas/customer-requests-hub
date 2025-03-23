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
  Chip,
  Button,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Autocomplete,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  LocalOffer as LocalOfferIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import moment from "moment";

interface Tag {
  _id: string;
  name: string;
  color: string;
  category?: string;
}

interface Customer {
  _id: string;
  name: string;
  company: string;
}

interface Request {
  _id: string;
  requestId: string;
  title: string;
  status: string;
  priority: string;
  customers: Customer[];
  tags: Tag[];
  reporter: string;
  createdAt: string;
  updatedAt: string;
}

const RequestList: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalRequests, setTotalRequests] = useState<number>(0);

  // フィルター状態
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState<string>(""); // タグ検索用

  // タグの取得
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get("/tags");
        setAvailableTags(response.data);
      } catch (err) {
        console.error("タグの取得に失敗しました", err);
      }
    };

    fetchTags();
  }, []);

  // リクエストの取得
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);

        // クエリパラメータの構築
        const params = new URLSearchParams();
        params.append("page", String(page + 1));
        params.append("limit", String(rowsPerPage));

        if (searchQuery) params.append("search", searchQuery);
        if (statusFilter) params.append("status", statusFilter);
        if (priorityFilter) params.append("priority", priorityFilter);

        // タグフィルター（複数）
        if (tagFilters.length > 0) {
          tagFilters.forEach((tagId) => {
            params.append("tag", tagId);
          });
        }

        const response = await api.get(`/requests?${params.toString()}`);
        setRequests(response.data.requests);
        setTotalRequests(response.data.total);
      } catch (err: any) {
        setError(err.response?.data?.message || "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [page, rowsPerPage, searchQuery, statusFilter, priorityFilter, tagFilters]);

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

  // フィルタークリアハンドラー
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setPriorityFilter("");
    setTagFilters([]);
    setTagSearchQuery("");
    setPage(0);
  };

  // タグ選択ハンドラー
  const handleTagToggle = (tagId: string) => {
    setTagFilters((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
    setPage(0);
  };

  // カテゴリー別にタグをグループ化
  const groupedTags = availableTags.reduce<Record<string, Tag[]>>((acc, tag) => {
    const category = tag.category || "その他";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {});

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

  if (loading && requests.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && requests.length === 0) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          要望一覧
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/requests/new"
        >
          新規要望
        </Button>
      </Box>

      {/* 検索とフィルター */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="要望を検索..."
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
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "フィルターを隠す" : "フィルター"}
              </Button>

              {(statusFilter || priorityFilter || searchQuery || tagFilters.length > 0) && (
                <Button variant="outlined" color="secondary" onClick={handleClearFilters}>
                  クリア
                </Button>
              )}
            </Box>
          </Grid>

          {showFilters && (
            <>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="status-filter-label">ステータス</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as string)}
                    label="ステータス"
                  >
                    <MenuItem value="">すべて</MenuItem>
                    <MenuItem value="新規">新規</MenuItem>
                    <MenuItem value="検討中">検討中</MenuItem>
                    <MenuItem value="保留">保留</MenuItem>
                    <MenuItem value="却下">却下</MenuItem>
                    <MenuItem value="実装予定">実装予定</MenuItem>
                    <MenuItem value="完了">完了</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="priority-filter-label">優先度</InputLabel>
                  <Select
                    labelId="priority-filter-label"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as string)}
                    label="優先度"
                  >
                    <MenuItem value="">すべて</MenuItem>
                    <MenuItem value="低">低</MenuItem>
                    <MenuItem value="中">中</MenuItem>
                    <MenuItem value="高">高</MenuItem>
                    <MenuItem value="緊急">緊急</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  タグで絞り込み（複数選択可）
                  {tagFilters.length > 0 && (
                    <Typography component="span" sx={{ ml: 1, color: "text.secondary" }}>
                      {tagFilters.length}件選択中
                    </Typography>
                  )}
                </Typography>

                {/* タグ検索フィールド */}
                <TextField
                  placeholder="タグを検索..."
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: tagSearchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setTagSearchQuery("")} edge="end">
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* 選択済みタグ */}
                {tagFilters.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      選択されたタグ:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {tagFilters.map((tagId) => {
                        const tag = availableTags.find((t) => t._id === tagId);
                        return tag ? (
                          <Chip
                            key={tag._id}
                            label={tag.name}
                            sx={{
                              bgcolor: tag.color,
                              color: "white",
                            }}
                            onDelete={() => handleTagToggle(tag._id)}
                          />
                        ) : null;
                      })}
                    </Box>
                  </Paper>
                )}

                {/* タグ一覧 - カテゴリー別に表示 */}
                <Box sx={{ maxHeight: "300px", overflow: "auto", mt: 1 }}>
                  {Object.entries(groupedTags).map(([category, categoryTags]) => {
                    // 検索クエリでフィルタリング
                    const filteredTags = categoryTags.filter((tag) =>
                      tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
                    );

                    // フィルタリングされたタグがなければそのカテゴリーは表示しない
                    if (filteredTags.length === 0) return null;

                    return (
                      <Box key={category} sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mb: 0.5, display: "block" }}
                        >
                          {category}
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {filteredTags.map((tag) => {
                            const isSelected = tagFilters.includes(tag._id);
                            return (
                              <Chip
                                key={tag._id}
                                label={tag.name}
                                variant={isSelected ? "filled" : "outlined"}
                                sx={{
                                  bgcolor: isSelected ? tag.color : "transparent",
                                  color: isSelected ? "white" : "inherit",
                                  borderColor: tag.color,
                                  "&:hover": {
                                    bgcolor: isSelected ? tag.color : `${tag.color}33`,
                                  },
                                }}
                                onClick={() => handleTagToggle(tag._id)}
                                icon={
                                  isSelected ? (
                                    <LocalOfferIcon
                                      sx={{ color: isSelected ? "white" : "inherit" }}
                                    />
                                  ) : undefined
                                }
                              />
                            );
                          })}
                        </Box>
                        <Divider sx={{ my: 1 }} />
                      </Box>
                    );
                  })}
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* 要望一覧テーブル */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>タイトル</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>優先度</TableCell>
              <TableCell>顧客</TableCell>
              <TableCell>タグ</TableCell>
              <TableCell>登録日</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
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
                <TableCell>
                  {request.customers.map((customer) => (
                    <Typography key={customer._id} variant="body2" noWrap>
                      {customer.name}
                    </Typography>
                  ))}
                </TableCell>
                <TableCell>
                  {request.tags.slice(0, 2).map((tag) => (
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
                  {request.tags.length > 2 && (
                    <Chip label={`+${request.tags.length - 2}`} size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>{moment(request.createdAt).format("YYYY/MM/DD")}</TableCell>
                <TableCell align="right">
                  <Tooltip title="詳細を表示">
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/requests/${request._id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" sx={{ py: 3 }}>
                    要望が見つかりません
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
        count={totalRequests}
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
    </Box>
  );
};

export default RequestList;
