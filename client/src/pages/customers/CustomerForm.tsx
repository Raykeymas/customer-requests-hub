import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import api from "../../services/api";

// 顧客フォームのデータ型
interface CustomerFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
}

const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // フォーム状態
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  // React Hook Formのセットアップ
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData>({
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
    },
  });

  // 編集モードの場合は顧客データを取得
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!isEditMode) return;

      try {
        setLoading(true);
        const response = await api.get(`/customers/${id}`);
        const customerData = response.data;

        // フォームに値をセット
        setValue("name", customerData.name);
        setValue("company", customerData.company);
        setValue("email", customerData.email);
        setValue("phone", customerData.phone || "");
      } catch (err: any) {
        setError(err.response?.data?.message || "顧客データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id, isEditMode, setValue]);

  // フォーム送信処理
  const onSubmit = async (data: CustomerFormData) => {
    try {
      setLoading(true);
      setError("");

      if (isEditMode) {
        // 編集モード：更新API呼び出し
        await api.put(`/customers/${id}`, data);
        setSuccess(true);
        setTimeout(() => {
          navigate(`/customers`);
        }, 1500);
      } else {
        // 新規作成モード：作成API呼び出し
        await api.post("/customers", data);
        setSuccess(true);
        setTimeout(() => {
          navigate("/customers");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "顧客の保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? "顧客情報の編集" : "新規顧客登録"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            顧客情報が正常に{isEditMode ? "更新" : "登録"}されました
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* 顧客名 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "顧客名は必須です",
                  minLength: {
                    value: 2,
                    message: "顧客名は2文字以上で入力してください",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="顧客名"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={loading}
                    required
                  />
                )}
              />
            </Grid>

            {/* 会社名 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="company"
                control={control}
                rules={{
                  required: "会社名は必須です",
                  minLength: {
                    value: 2,
                    message: "会社名は2文字以上で入力してください",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="会社名"
                    fullWidth
                    error={!!errors.company}
                    helperText={errors.company?.message}
                    disabled={loading}
                    required
                  />
                )}
              />
            </Grid>

            {/* メールアドレス */}
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "メールアドレスは必須です",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "有効なメールアドレスを入力してください",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="メールアドレス"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={loading}
                    required
                    type="email"
                  />
                )}
              />
            </Grid>

            {/* 電話番号 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={control}
                rules={{
                  pattern: {
                    value: /^[0-9-+\s()]*$/,
                    message: "有効な電話番号を入力してください",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="電話番号"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    disabled={loading}
                    placeholder="任意"
                  />
                )}
              />
            </Grid>

            {/* ボタン */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate("/customers")}
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
    </Box>
  );
};

export default CustomerForm;
