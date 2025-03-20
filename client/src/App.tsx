import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";

// ページのインポート
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import RequestList from "./pages/requests/RequestList";
import RequestForm from "./pages/requests/RequestForm";
import RequestDetail from "./pages/requests/RequestDetail";
import CustomerList from "./pages/customers/CustomerList";
import CustomerForm from "./pages/customers/CustomerForm";
import CustomerDetail from "./pages/customers/CustomerDetail";
import TagList from "./pages/tags/TagList";
import Analytics from "./pages/analytics/Analytics";

// 認証が必要なルートのラッパーコンポーネント
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// テーマの設定
const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f5f5f5",
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* 認証ルート */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 認証が必要なルート */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 要望関連ルート */}
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RequestList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RequestForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RequestDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/edit/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RequestForm />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 顧客関連ルート */}
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CustomerList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CustomerForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CustomerDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/edit/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CustomerForm />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* タグ関連ルート */}
            <Route
              path="/tags"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TagList />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 分析・レポート */}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ルートパスのリダイレクト */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* 404ページ */}
            <Route path="*" element={<div>ページが見つかりません</div>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
