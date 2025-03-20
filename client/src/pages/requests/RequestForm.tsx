import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import api from "../../services/api";

// タグの型定義
interface Tag {
  _id: string;
  name: string;
  color: string;
  category: string;
}

// 顧客の型定義
interface Customer {
  _id: string;
  name: string;
  company: string;
  email: string;
}

// 要望の型定義
interface RequestFormData {
  title: string;
  content: string;
  customers: Customer[];
  reporter: string;
  status: string;
  priority: string;
  tags: Tag[];
}

const RequestForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // フォーム状態
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  // 関連データの状態
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState<boolean>(true);

  // 類似要望検索関連
  const [similarRequests, setSimilarRequests] = useState<any[]>([]);
  const [showSimilarRequests, setShowSimilarRequests] = useState<boolean>(false);
  const [searchingSimilar, setSearchingSimilar] = useState<boolean>(false);

  // React Hook Formのセットアップ
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RequestFormData>({
    defaultValues: {
      title: "",
      content: "",
      customers: [],
      reporter: "",
      status: "新規",
      priority: "中",
      tags: [],
    },
  });

  // 監視対象の値
  const watchTitle = watch("title");
  const watchContent = watch("content");

  // 関連データの取得
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoadingRelatedData(true);

        // 顧客データを取得
        const customersResponse = await api.get("/customers");
        setCustomers(customersResponse.data);

        // タグデータを取得
        const tagsResponse = await api.get("/tags");
        setTags(tagsResponse.data);

        // 編集モードの場合は要望データを取得
        if (isEditMode && id) {
          const requestResponse = await api.get(`/requests/${id}`);
          const requestData = requestResponse.data;

          // フォームに値をセット
          setValue("title", requestData.title);
          setValue("content", requestData.content);
          setValue("customers", requestData.customers);
          setValue("reporter", requestData.reporter);
          setValue("status", requestData.status);
          setValue("priority", requestData.priority);
          setValue("tags", requestData.tags);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "データの取得に失敗しました");
      } finally {
        setLoadingRelatedData(false);
      }
    };

    fetchRelatedData();
  }, [id, isEditMode, setValue]);

  // 類似要望の検索
  useEffect(() => {
    // タイトルか内容が変更されたら、類似要望を検索
    const searchSimilarRequests = async () => {
      if (!watchTitle && !watchContent) {
        setSimilarRequests([]);
        return;
      }

      // 短すぎる場合は検索しない
      if ((watchTitle && watchTitle.length < 3) || (watchContent && watchContent.length < 10)) {
        return;
      }

      try {
        setSearchingSimilar(true);
        const response = await api.post("/requests/similar", {
          title: watchTitle,
          content: watchContent,
        });

        if (response.data.length > 0) {
          setSimilarRequests(response.data);
          setShowSimilarRequests(true);
        } else {
          setSimilarRequests([]);
        }
      } catch (err) {
        console.error("類似要望の検索に失敗しました", err);
      } finally {
        setSearchingSimilar(false);
      }
    };

    // デバウンス処理
    const timer = setTimeout(() => {
      searchSimilarRequests();
    }, 1000);

    return () => clearTimeout(timer);
  }, [watchTitle, watchContent]);

  // フォーム送信処理
  const onSubmit = async (data: RequestFormData) => {
    try {
      setLoading(true);
      setError("");

      // 顧客IDのみの配列に変換
      const customerIds = data.customers.map((customer) => customer._id);

      // タグIDのみの配列に変換
      const tagIds = data.tags.map((tag) => tag._id);

      const requestData = {
        ...data,
        customers: customerIds,
        tags: tagIds,
      };

      if (isEditMode && id) {
        // 編集モード：更新API呼び出し
        await api.put(`/requests/${id}`, requestData);
        setSuccess(true);
        setTimeout(() => {
          navigate(`/requests/${id}`);
        }, 1500);
      } else {
        // 新規作成モード：作成API呼び出し
        const response = await api.post("/requests", requestData);
        setSuccess(true);
        setTimeout(() => {
          navigate(`/requests/${response.data._id}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "要望の保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 類似要望ダイアログを閉じる
  const handleCloseSimilarDialog = () => {
    setShowSimilarRequests(false);
  };

  // 類似要望画面に移動
  const handleViewSimilarRequest = (requestId: string) => {
    navigate(`/requests/${requestId}`);
  };

  if (loadingRelatedData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? "要望編集" : "新規要望登録"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            要望が正常に{isEditMode ? "更新" : "登録"}されました
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* タイトル */}
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{
                  required: "タイトルは必須です",
                  minLength: {
                    value: 3,
                    message: "タイトルは3文字以上で入力してください",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="タイトル"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    disabled={loading}
                    required
                  />
                )}
              />
            </Grid>

            {/* 要望内容 */}
            <Grid item xs={12}>
              <Controller
                name="content"
                control={control}
                rules={{
                  required: "要望内容は必須です",
                  minLength: {
                    value: 10,
                    message: "要望内容は10文字以上で入力してください",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="要望内容"
                    fullWidth
                    multiline
                    rows={6}
                    error={!!errors.content}
                    helperText={errors.content?.message}
                    disabled={loading}
                    required
                  />
                )}
              />
            </Grid>

            {/* 報告者 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="reporter"
                control={control}
                rules={{ required: "報告者は必須です" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="報告者"
                    fullWidth
                    error={!!errors.reporter}
                    helperText={errors.reporter?.message}
                    disabled={loading}
                    required
                    placeholder="顧客担当者など"
                  />
                )}
              />
            </Grid>

            {/* ステータス */}
            <Grid item xs={12} md={3}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel id="status-label">ステータス</InputLabel>
                    <Select {...field} labelId="status-label" label="ステータス">
                      <MenuItem value="新規">新規</MenuItem>
                      <MenuItem value="検討中">検討中</MenuItem>
                      <MenuItem value="保留">保留</MenuItem>
                      <MenuItem value="却下">却下</MenuItem>
                      <MenuItem value="実装予定">実装予定</MenuItem>
                      <MenuItem value="完了">完了</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* 優先度 */}
            <Grid item xs={12} md={3}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel id="priority-label">優先度</InputLabel>
                    <Select {...field} labelId="priority-label" label="優先度">
                      <MenuItem value="低">低</MenuItem>
                      <MenuItem value="中">中</MenuItem>
                      <MenuItem value="高">高</MenuItem>
                      <MenuItem value="緊急">緊急</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* 顧客 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="customers"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    multiple
                    options={customers}
                    getOptionLabel={(option) => `${option.name} (${option.company})`}
                    value={value}
                    onChange={(_, newValue) => onChange(newValue)}
                    disabled={loading}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={`${option.name} (${option.company})`}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="関連顧客" placeholder="顧客を選択" />
                    )}
                  />
                )}
              />
            </Grid>

            {/* タグ */}
            <Grid item xs={12} md={6}>
              <Controller
                name="tags"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    multiple
                    options={tags}
                    getOptionLabel={(option) => option.name}
                    value={value}
                    onChange={(_, newValue) => onChange(newValue)}
                    disabled={loading}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="filled"
                          label={option.name}
                          {...getTagProps({ index })}
                          style={{ backgroundColor: option.color, color: "white" }}
                        />
                      ))
                    }
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box
                          component="span"
                          sx={{
                            width: 14,
                            height: 14,
                            mr: 1,
                            borderRadius: "50%",
                            backgroundColor: option.color,
                            display: "inline-block",
                          }}
                        />
                        {option.name} ({option.category})
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} label="タグ" placeholder="タグを選択" />
                    )}
                  />
                )}
              />
              {searchingSimilar && (
                <Typography variant="caption" sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  類似要望を検索中...
                </Typography>
              )}
            </Grid>

            {/* ボタン */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate("/requests")}
                  disabled={loading}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {isEditMode ? "更新" : "登録"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* 類似要望ダイアログ */}
      <Dialog open={showSimilarRequests} onClose={handleCloseSimilarDialog} maxWidth="md" fullWidth>
        <DialogTitle>類似の要望が見つかりました</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            以下の要望が類似している可能性があります。新しい要望を登録する前にご確認ください。
          </Typography>
          <Box sx={{ mt: 2 }}>
            {similarRequests.map((request) => (
              <Paper key={request._id} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {request.requestId}: {request.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {request.content.length > 200
                    ? `${request.content.substring(0, 200)}...`
                    : request.content}
                </Typography>
                <Typography variant="caption" display="block">
                  ステータス: {request.status}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <Button size="small" onClick={() => handleViewSimilarRequest(request._id)}>
                    詳細を表示
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSimilarDialog} color="primary">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequestForm;
