import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  PriorityHigh as PriorityHighIcon,
  PeopleAlt as PeopleAltIcon,
  LocalOffer as LocalOfferIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import api from "../../services/api";

// ChartJSの登録
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface StatsData {
  totalRequests: number;
  newRequestsThisMonth: number;
  statusStats: Array<{ _id: string; count: number }>;
  priorityStats: Array<{ _id: string; count: number }>;
  tagStats: Array<{ _id: string; name: string; color: string; count: number }>;
  customerStats: Array<{ _id: string; name: string; company: string; count: number }>;
  monthlyStats: Array<{ _id: { year: number; month: number }; count: number }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/requests/stats");
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ステータスチャートデータ
  const statusChartData = stats
    ? {
        labels: stats.statusStats.map((item) => item._id),
        datasets: [
          {
            data: stats.statusStats.map((item) => item.count),
            backgroundColor: [
              "#4caf50", // 新規
              "#2196f3", // 検討中
              "#ff9800", // 保留
              "#f44336", // 却下
              "#9c27b0", // 実装予定
              "#3f51b5", // 完了
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  // 優先度チャートデータ
  const priorityChartData = stats
    ? {
        labels: stats.priorityStats.map((item) => item._id),
        datasets: [
          {
            data: stats.priorityStats.map((item) => item.count),
            backgroundColor: [
              "#4caf50", // 低
              "#ff9800", // 中
              "#f44336", // 高
              "#9c27b0", // 緊急
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  // 月別要望登録数
  const monthlyChartData = stats?.monthlyStats
    ? {
        labels: stats.monthlyStats.map((item) => `${item._id.year}/${item._id.month}`),
        datasets: [
          {
            label: "登録数",
            data: stats.monthlyStats.map((item) => item.count),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgb(54, 162, 235)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ダッシュボード
      </Typography>

      {/* サマリーカード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent
              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  全要望数
                </Typography>
                <Typography variant="h4">{stats?.totalRequests || 0}</Typography>
              </Box>
              <NotificationsIcon color="primary" sx={{ fontSize: 40 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent
              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  今月の新規要望
                </Typography>
                <Typography variant="h4">{stats?.newRequestsThisMonth || 0}</Typography>
              </Box>
              <AssignmentTurnedInIcon color="secondary" sx={{ fontSize: 40 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent
              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  優先度「高」以上
                </Typography>
                <Typography variant="h4">
                  {stats?.priorityStats
                    .filter((item) => ["高", "緊急"].includes(item._id))
                    .reduce((acc, curr) => acc + curr.count, 0) || 0}
                </Typography>
              </Box>
              <PriorityHighIcon sx={{ fontSize: 40, color: "#f44336" }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent
              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  登録済み顧客
                </Typography>
                <Typography variant="h4">{stats?.customerStats?.length || 0}</Typography>
              </Box>
              <PeopleAltIcon sx={{ fontSize: 40, color: "#4caf50" }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* チャート */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ステータス別要望数
            </Typography>
            {statusChartData ? (
              <Box
                sx={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
              </Box>
            ) : (
              <Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  ステータスデータがありません
                </Typography>
              </Box>
            )}
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button component={Link} to="/requests" color="primary">
                要望一覧を見る
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              優先度別要望数
            </Typography>
            {priorityChartData ? (
              <Box
                sx={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pie data={priorityChartData} options={{ maintainAspectRatio: false }} />
              </Box>
            ) : (
              <Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  優先度データがありません
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              月別要望登録数
            </Typography>
            {monthlyChartData ? (
              <Box sx={{ height: 300 }}>
                <Bar
                  data={monthlyChartData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "要望数",
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "年/月",
                        },
                      },
                    },
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  月別データがありません
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              人気のタグ
            </Typography>
            <Box sx={{ mt: 2 }}>
              {stats?.tagStats && stats.tagStats.length > 0 ? (
                stats.tagStats.map((tag) => (
                  <Chip
                    key={tag._id}
                    label={`${tag.name} (${tag.count})`}
                    sx={{
                      m: 0.5,
                      bgcolor: tag.color || "#3498db",
                      color: "#ffffff",
                    }}
                    icon={<LocalOfferIcon style={{ color: "#ffffff" }} />}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  タグデータがありません
                </Typography>
              )}
            </Box>
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button component={Link} to="/tags" color="primary">
                すべてのタグを見る
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              要望の多い顧客
            </Typography>
            <Box sx={{ mt: 2 }}>
              {stats?.customerStats && stats.customerStats.length > 0 ? (
                stats.customerStats.slice(0, 10).map((customer, index) => (
                  <Box
                    key={customer._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1.5,
                      alignItems: "center",
                    }}
                  >
                    <Typography>
                      {index + 1}. {customer.name} ({customer.company})
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {customer.count}件
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  顧客データがありません
                </Typography>
              )}
            </Box>
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button component={Link} to="/customers" color="primary">
                すべての顧客を見る
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
