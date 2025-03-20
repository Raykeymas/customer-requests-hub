import React, { useContext, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const Register: React.FC = () => {
  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError("");
      await registerUser(data.name, data.email, data.password);
      navigate("/dashboard");
    } catch (error: any) {
      setError(error.response?.data?.message || "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            ユーザー登録
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              id="name"
              label="名前"
              autoComplete="name"
              autoFocus
              {...register("name", {
                required: "名前を入力してください",
                minLength: {
                  value: 2,
                  message: "名前は2文字以上である必要があります",
                },
              })}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="メールアドレス"
              autoComplete="email"
              {...register("email", {
                required: "メールアドレスを入力してください",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "有効なメールアドレスを入力してください",
                },
              })}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              id="password"
              label="パスワード"
              type="password"
              autoComplete="new-password"
              {...register("password", {
                required: "パスワードを入力してください",
                minLength: {
                  value: 6,
                  message: "パスワードは6文字以上である必要があります",
                },
              })}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              id="passwordConfirm"
              label="パスワード（確認）"
              type="password"
              autoComplete="new-password"
              {...register("passwordConfirm", {
                required: "パスワード（確認）を入力してください",
                validate: (val: string) => {
                  if (watch("password") !== val) {
                    return "パスワードが一致しません";
                  }
                },
              })}
              error={Boolean(errors.passwordConfirm)}
              helperText={errors.passwordConfirm?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "登録する"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2">
                既にアカウントをお持ちですか？ <Link to="/login">ログインする</Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
