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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocalOffer as LocalOfferIcon,
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
      } catch (err: any) {
        setError(err.response?.data?.message || "タグの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

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

      {/* カテゴリー別タグ一覧 */}
      {Object.entries(groupedTags).map(([category, categoryTags]) => (
        <Paper key={category} sx={{ mb: 4, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            {category}
          </Typography>

          <Grid container spacing={2}>
            {categoryTags.map((tag) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={tag._id}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: tag.color,
                          mr: 1,
                        }}
                      />
                      <Typography variant="h6" noWrap>
                        {tag.name}
                      </Typography>
                    </Box>

                    <Chip
                      icon={<LocalOfferIcon />}
                      label={tag.name}
                      sx={{
                        bgcolor: tag.color,
                        color: "#fff",
                        mb: 1,
                      }}
                    />

                    <Typography variant="body2" color="textSecondary">
                      カテゴリー: {tag.category || "その他"}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="編集">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(tag)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="削除">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(tag)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}

      {tags.length === 0 && (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" sx={{ py: 3 }}>
            タグがありません。新しいタグを作成してください。
          </Typography>
        </Paper>
      )}

      {/* 新規タグ作成ダイアログ */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>新規タグ作成</DialogTitle>
        <DialogContent>
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

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              色を選択
            </Typography>
            <ChromePicker
              color={newTagColor}
              onChangeComplete={(color) => setNewTagColor(color.hex)}
              disableAlpha
            />
          </Box>

          <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              プレビュー:
            </Typography>
            <Chip
              label={newTagName || "タグ名"}
              sx={{
                bgcolor: newTagColor,
                color: "#fff",
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} disabled={createLoading}>
            キャンセル
          </Button>
          <Button
            onClick={handleCreateTag}
            color="primary"
            startIcon={createLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={!newTagName.trim() || createLoading}
          >
            作成
          </Button>
        </DialogActions>
      </Dialog>

      {/* タグ編集ダイアログ */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>タグ編集</DialogTitle>
        <DialogContent>
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

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              色を選択
            </Typography>
            <ChromePicker
              color={editTagColor}
              onChangeComplete={(color) => setEditTagColor(color.hex)}
              disableAlpha
            />
          </Box>

          <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              プレビュー:
            </Typography>
            <Chip
              label={editTagName || "タグ名"}
              sx={{
                bgcolor: editTagColor,
                color: "#fff",
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={editLoading}>
            キャンセル
          </Button>
          <Button
            onClick={handleUpdateTag}
            color="primary"
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
          <Typography>
            タグ「{deleteTag?.name}」を削除しますか？
            <br />
            このタグを使用している要望からも削除されます。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteTag}
            color="error"
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
