import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  GroupWork as GroupWorkIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import api from "../../services/api";

// ChartJSの登録
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

// 統計データの型定義
interface StatsData {
  totalRequests: number;
  newRequestsThisMonth: number;
  statusStats: Array<{ _id: string; count: number }>;
  priorityStats: Array<{ _id: string; count: number }>;
  tagStats: Array<{
    _id: string;
    name: string;
    color: string;
    category: string;
    count: number;
  }>;
  customerStats: Array<{
    _id: string;
    name: string;
    company: string;
    count: number;
  }>;
  monthlyStats: Array<{ _id: { year: number; month: number }; count: number }>;
}

// タブパネルのProps型定義
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// タブパネルコンポーネント
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `analytics-tab-${index}`,
    "aria-controls": `analytics-tabpanel-${index}`,
  };
};

// メインコンポーネント
const Analytics: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tabValue, setTabValue] = useState(0);

  // タブ変更ハンドラー
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // データ取得
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/requests/stats");
        setStats(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "データの取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 月別チャートデータの作成
  const createMonthlyChartData = () => {
    if (!stats?.monthlyStats) return null;

    // 月名のマッピング
    const monthNames = [
      "1月", "2月", "3月", "4月", "5月", "6月",
      "7月", "8月", "9月", "10月", "11月", "12月"
    ];

    // データを日付順にソート
    const sortedData = [...stats.monthlyStats].sort((a, b) => {
      if (a._id.year !== b._id.year) {
        return a._id.year - b._id.year;
      }
      return a._id.month - b._id.month;
    });

    return {
      labels: sortedData.map(
        (item) => `${item._id.year}年${monthNames[item._id.month - 1]}`
      ),
      datasets: [
        {
          label: "要望数",
          data: sortedData.map((item) => item.count),
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 1,
        },
      ],
    };
  };

  // グラフなどで使用する色
  const chartColors = {
    blue: "rgba(54, 162, 235, 0.7)",
    green: "rgba(75, 192, 192, 0.7)",
    red: "rgba(255, 99, 132, 0.7)",
    orange: "rgba(255, 159, 64, 0.7)",
    purple: "rgba(153, 102, 255, 0.7)",
    yellow: "rgba(255, 206, 86, 0.7)",
  };

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
              "#9c27b6", // 実装予定
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
              "#9c27b6", // 緊急
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  // 月別要望登録数
  const monthlyChartData = createMonthlyChartData();

  // 要望数推移（折れ線グラフ用）
  const lineChartData = monthlyChartData
    ? {
        ...monthlyChartData,
        datasets: [
          {
            ...monthlyChartData.datasets[0],
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            tension: 0.1,
          },
        ],
      }
    : null;

  // タグカテゴリー別の要望数
  const tagCategoryData = stats
    ? {
        labels: Array.from(
          new Set(stats.tagStats.map((tag) => tag.category))
        ),
        datasets: [
          {
            label: "要望数",
            data: Array.from(
              new Set(stats.tagStats.map((tag) => tag.category))
            ).map((category) => {
              return stats.tagStats
                .filter((tag) => tag.category === category)
                .reduce((sum, tag) => sum + tag.count, 0);
            }),
            backgroundColor: Object.values(chartColors),
            borderWidth: 1,
          },
        ],
      }
    : null;

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
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
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <AssessmentIcon sx={{ fontSize: 32, mr: 1, color: "primary.main" }} />
        <Typography variant="h4" component="h1">
          分析・レポート
        </Typography>
      </Box>

      {/* サマリーカード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card raised>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                color="textSecondary"
                gutterBottom
                variant="h6"
                align="center"
              >
                総要望数
              </Typography>
              <Typography variant="h3" color="primary">
                {stats?.totalRequests || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                全期間
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card raised>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                color="textSecondary"
                gutterBottom
                variant="h6"
                align="center"
              >
                今月の新規要望
              </Typography>
              <Typography variant="h3" color="secondary">
                {stats?.newRequestsThisMonth || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                今月の増加数
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card raised>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                color="textSecondary"
                gutterBottom
                variant="h6"
                align="center"
              >
                対応中の要望
              </Typography>
              <Typography variant="h3" sx={{ color: "#ff9800" }}>
                {stats?.statusStats
                  .filter((item) => ["新規", "検討中", "実装予定"].includes(item._id))
                  .reduce((acc, curr) => acc + curr.count, 0) || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                新規・検討中・実装予定
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card raised>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                color="textSecondary"
                gutterBottom
                variant="h6"
                align="center"
              >
                緊急優先度
              </Typography>
              <Typography variant="h3" sx={{ color: "#f44336" }}>
                {stats?.priorityStats
                  .filter((item) => ["高", "緊急"].includes(item._id))
                  .reduce((acc, curr) => acc + curr.count, 0) || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                高・緊急の要望数
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* タブ */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="analytics tabs"
          >
            <Tab
              label="概要"
              icon={<AssessmentIcon />}
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              label="時系列分析"
              icon={<TimelineIcon />}
              iconPosition="start"
              {...a11yProps(1)}
            />
            <Tab
              label="タグ分析"
              icon={<GroupWorkIcon />}
              iconPosition="start"
              {...a11yProps(2)}
            />
            <Tab
              label="顧客分析"
              icon={<GroupIcon />}
              iconPosition="start"
              {...a11yProps(3)}
            />
          </Tabs>
        </Box>

        {/* 概要タブ */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  ステータス別要望数
                </Typography>
                {statusChartData && (
                  <Box
                    sx={{
                      height: 300,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Pie
                      data={statusChartData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  優先度別要望数
                </Typography>
                {priorityChartData && (
                  <Box
                    sx={{
                      height: 300,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Pie
                      data={priorityChartData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  タグカテゴリー別要望数
                </Typography>
                {tagCategoryData && (
                  <Box sx={{ height: 300 }}>
                    <Bar
                      data={tagCategoryData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "要望数",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 時系列分析タブ */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  月別要望登録数の推移
                </Typography>
                {lineChartData && (
                  <Box sx={{ height: 400 }}>
                    <Line
                      data={lineChartData}
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
                              text: "年月",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  月別グラフ
                </Typography>
                {monthlyChartData && (
                  <Box sx={{ height: 400 }}>
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
                              text: "年月",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* タグ分析タブ */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  人気のタグ（上位10件）
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>順位</TableCell>
                        <TableCell>タグ</TableCell>
                        <TableCell>カテゴリ</TableCell>
                        <TableCell align="right">要望数</TableCell>
                        <TableCell align="right">割合</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats?.tagStats.map((tag, index) => (
                        <TableRow key={tag._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Chip
                              label={tag.name}
                              size="small"
                              sx={{
                                backgroundColor: tag.color,
                                color: "white",
                              }}
                            />
                          </TableCell>
                          <TableCell>{tag.category}</TableCell>
                          <TableCell align="right">{tag.count}</TableCell>
                          <TableCell align="right">
                            {((tag.count / stats.totalRequests) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  タグカテゴリー別分布
                </Typography>
                {tagCategoryData && (
                  <Box sx={{ height: 400 }}>
                    <Pie
                      data={tagCategoryData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 顧客分析タブ */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  要望の多い顧客（上位10件）
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>順位</TableCell>
                        <TableCell>顧客名</TableCell>
                        <TableCell>会社名</TableCell>
                        <TableCell align="right">要望数</TableCell>
                        <TableCell align="right">割合</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats?.customerStats.map((customer, index) => (
                        <TableRow key={customer._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.company}</TableCell>
                          <TableCell align="right">{customer.count}</TableCell>
                          <TableCell align="right">
                            {((customer.count / stats.totalRequests) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  顧客別要望数分布
                </Typography>
                {stats?.customerStats && (
                  <Box sx={{ height: 400 }}>
                    <Bar
                      data={{
                        labels: stats.customerStats.map(
                          (customer) => `${customer.name} (${customer.company})`
                        ),
                        datasets: [
                          {
                            label: "要望数",
                            data: stats.customerStats.map(
                              (customer) => customer.count
                            ),
                            backgroundColor: "rgba(54, 162, 235, 0.7)",
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        indexAxis: "y", // 横棒グラフ
                        scales: {
                          x: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "要望数",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Analytics;