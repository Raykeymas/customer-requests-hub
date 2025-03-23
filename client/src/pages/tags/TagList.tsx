import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  InputAdornment,
  Divider,
  Avatar,
  Badge,
  Collapse,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocalOffer as LocalOfferIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import { ChromePicker } from "react-color";
import api from "../../services/api";

interface Tag {
  _id: string;
  name: string;
  color: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

const TagList: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // フィルタリング・検索用の状態
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // 新規タグ作成用の状態
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [newTagName, setNewTagName] = useState<string>("");
  const [newTagColor, setNewTagColor] = useState<string>("#3498db");
  const [newTagCategory, setNewTagCategory] = useState<string>("その他");
  const [createLoading, setCreateLoading] = useState<boolean>(false);

  // タグ編集用の状態
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [editTagName, setEditTagName] = useState<string>("");
  const [editTagColor, setEditTagColor] = useState<string>("");
  const [editTagCategory, setEditTagCategory] = useState<string>("");
  const [editLoading, setEditLoading] = useState<boolean>(false);

  // 削除確認用の状態
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // タグデータの取得
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await api.get("/tags");
        setTags(response.data);

        // 初期状態ですべてのカテゴリーを展開
        const categories = [
          ...new Set(response.data.map((tag: Tag) => tag.category || "その他")),
        ] as string[];
        const initialExpandedState: Record<string, boolean> = {};
        categories.forEach((category) => {
          initialExpandedState[category] = true;
        });
        setExpandedCategories(initialExpandedState);
      } catch (err: any) {
        setError(err.response?.data?.message || "タグの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  // カテゴリーの展開・折りたたみを切り替え
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // タブ変更ハンドラー
  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  // 検索ハンドラー
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // 検索クリアハンドラー
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // 新規タグダイアログを開く
  const handleOpenCreateDialog = () => {
    setNewTagName("");
    setNewTagColor("#3498db");
    setNewTagCategory("その他");
    setOpenCreateDialog(true);
  };

  // 新規タグダイアログを閉じる
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  // 新規タグを作成
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      return;
    }
    try {
      setCreateLoading(true);
      const response = await api.post("/tags", {
        name: newTagName.trim(),
        color: newTagColor,
        category: newTagCategory,
      });
      // タグリストを更新
      setTags([...tags, response.data]);
      handleCloseCreateDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || "タグの作成に失敗しました");
    } finally {
      setCreateLoading(false);
    }
  };

  // タグ編集ダイアログを開く
  const handleOpenEditDialog = (tag: Tag) => {
    setEditTag(tag);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
    setEditTagCategory(tag.category);
    setOpenEditDialog(true);
  };

  // タグ編集ダイアログを閉じる
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditTag(null);
  };

  // タグを更新
  const handleUpdateTag = async () => {
    if (!editTag || !editTagName.trim()) {
      return;
    }
    try {
      setEditLoading(true);
      const response = await api.put(`/tags/${editTag._id}`, {
        name: editTagName.trim(),
        color: editTagColor,
        category: editTagCategory,
      });
      // タグリストを更新
      setTags(tags.map((tag) => (tag._id === editTag._id ? response.data : tag)));
      handleCloseEditDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || "タグの更新に失敗しました");
    } finally {
      setEditLoading(false);
    }
  };

  // 削除確認ダイアログを開く
  const handleOpenDeleteDialog = (tag: Tag) => {
    setDeleteTag(tag);
    setOpenDeleteDialog(true);
  };

  // 削除確認ダイアログを閉じる
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteTag(null);
  };

  // タグを削除
  const handleDeleteTag = async () => {
    if (!deleteTag) {
      return;
    }
    try {
      setDeleteLoading(true);
      await api.delete(`/tags/${deleteTag._id}`);
      // タグリストを更新
      setTags(tags.filter((tag) => tag._id !== deleteTag._id));
      handleCloseDeleteDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || "タグの削除に失敗しました");
    } finally {
      setDeleteLoading(false);
    }
  };

  // カテゴリー別にタグをグループ化
  const groupedTags = tags.reduce<Record<string, Tag[]>>((acc, tag) => {
    const category = tag.category || "その他";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {});

  // カテゴリーリストを取得
  const categories = Object.keys(groupedTags);

  // タグをフィルタリング
  const filteredTags = tags.filter((tag) => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // フィルター後にカテゴリー別にタグをグループ化
  const filteredGroupedTags = filteredTags.reduce<Record<string, Tag[]>>((acc, tag) => {
    const category = tag.category || "その他";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {});

  if (loading && tags.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && tags.length === 0) {
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
          タグ管理
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          新規タグ
        </Button>
      </Box>

      {/* エラーメッセージ */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* 検索・フィルターエリア */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="タグを検索..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} edge="end" size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={selectedCategory}
                onChange={handleCategoryChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="タグカテゴリータブ"
              >
                <Tab label="すべて" value="all" />
                {categories.map((category) => (
                  <Tab key={category} label={category} value={category} />
                ))}
              </Tabs>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* タグ一覧 */}
      {Object.entries(filteredGroupedTags).length > 0 ? (
        Object.entries(filteredGroupedTags).map(([category, categoryTags]) => (
          <Paper key={category} sx={{ mb: 3, overflow: "hidden" }}>
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "background.default",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
              onClick={() => toggleCategoryExpansion(category)}
              style={{ cursor: "pointer" }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h6">{category}</Typography>
                <Chip
                  label={categoryTags.length}
                  size="small"
                  sx={{ ml: 1, bgcolor: "primary.main", color: "white" }}
                />
              </Box>
              <IconButton size="small">
                {expandedCategories[category] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedCategories[category]} timeout="auto">
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {categoryTags.map((tag) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={tag._id}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            boxShadow: 3,
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: tag.color,
                                mr: 1,
                                fontSize: "0.8rem",
                              }}
                            >
                              {tag.name.charAt(0)}
                            </Avatar>
                            <Typography variant="subtitle1" noWrap fontWeight="bold">
                              {tag.name}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            <Chip
                              icon={<LocalOfferIcon />}
                              label={tag.name}
                              sx={{
                                bgcolor: tag.color,
                                color: "#fff",
                                mb: 1,
                                maxWidth: "100%",
                              }}
                            />
                          </Box>
                        </CardContent>

                        <CardActions sx={{ justifyContent: "space-between", p: 1 }}>
                          <Box>
                            <Tooltip title="このタグを編集">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditDialog(tag);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="このタグを削除">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteDialog(tag);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Collapse>
          </Paper>
        ))
      ) : (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1">
            {searchQuery
              ? "検索条件に一致するタグはありません。"
              : "タグがありません。新しいタグを作成してください。"}
          </Typography>
        </Paper>
      )}

      {/* 新規タグ作成ダイアログ */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>新規タグ作成</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="タグ名"
            fullWidth
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            disabled={createLoading}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>カテゴリー</InputLabel>
            <Select
              value={newTagCategory}
              label="カテゴリー"
              onChange={(e) => setNewTagCategory(e.target.value)}
              disabled={createLoading}
            >
              <MenuItem value="機能領域">機能領域</MenuItem>
              <MenuItem value="顧客属性">顧客属性</MenuItem>
              <MenuItem value="重要度">重要度</MenuItem>
              <MenuItem value="その他">その他</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="subtitle1" gutterBottom>
            色を選択
          </Typography>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <ChromePicker
                color={newTagColor}
                onChangeComplete={(color) => setNewTagColor(color.hex)}
                disableAlpha
              />
            </Box>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                プレビュー
              </Typography>
              <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
                <Chip
                  icon={<LocalOfferIcon />}
                  label={newTagName || "タグ名"}
                  sx={{
                    bgcolor: newTagColor,
                    color: "#fff",
                    fontSize: "1rem",
                    py: 2,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} disabled={createLoading}>
            キャンセル
          </Button>
          <Button
            onClick={handleCreateTag}
            color="primary"
            variant="contained"
            startIcon={createLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={!newTagName.trim() || createLoading}
          >
            作成
          </Button>
        </DialogActions>
      </Dialog>

      {/* タグ編集ダイアログ */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>タグ編集</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="タグ名"
            fullWidth
            value={editTagName}
            onChange={(e) => setEditTagName(e.target.value)}
            disabled={editLoading}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>カテゴリー</InputLabel>
            <Select
              value={editTagCategory}
              label="カテゴリー"
              onChange={(e) => setEditTagCategory(e.target.value)}
              disabled={editLoading}
            >
              <MenuItem value="機能領域">機能領域</MenuItem>
              <MenuItem value="顧客属性">顧客属性</MenuItem>
              <MenuItem value="重要度">重要度</MenuItem>
              <MenuItem value="その他">その他</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="subtitle1" gutterBottom>
            色を選択
          </Typography>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <ChromePicker
                color={editTagColor}
                onChangeComplete={(color) => setEditTagColor(color.hex)}
                disableAlpha
              />
            </Box>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                プレビュー
              </Typography>
              <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
                <Chip
                  icon={<LocalOfferIcon />}
                  label={editTagName || "タグ名"}
                  sx={{
                    bgcolor: editTagColor,
                    color: "#fff",
                    fontSize: "1rem",
                    py: 2,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={editLoading}>
            キャンセル
          </Button>
          <Button
            onClick={handleUpdateTag}
            color="primary"
            variant="contained"
            startIcon={editLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={!editTagName.trim() || editLoading}
          >
            更新
          </Button>
        </DialogActions>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>タグの削除</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="body1">以下のタグを削除しますか？</Typography>
          </Box>
          {deleteTag && (
            <Box
              sx={{
                p: 2,
                bgcolor: "background.default",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Chip
                icon={<LocalOfferIcon />}
                label={deleteTag.name}
                sx={{
                  bgcolor: deleteTag.color,
                  color: "#fff",
                  mr: 1,
                }}
              />
              <Typography variant="caption" color="error.main" sx={{ ml: 1 }}>
                このタグを使用している要望からも削除されます
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteTag}
            color="error"
            variant="contained"
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
            disabled={deleteLoading}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TagList;
