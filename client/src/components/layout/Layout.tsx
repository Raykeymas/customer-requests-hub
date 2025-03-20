import React, { ReactNode, useState } from "react";
import { Box, Container, Toolbar, Fab, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DRAWER_WIDTH = 240; // サイドバーの幅

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // md (960px) 以上をPC版と定義
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleAddRequest = () => {
    navigate('/requests/new');
  };

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ヘッダーのナビゲーションバー */}
      <Navbar 
        drawerOpen={mobileDrawerOpen} 
        onDrawerToggle={handleDrawerToggle} 
        isDesktop={isDesktop}
      />
      
      {/* サイドメニュー - PC版では常に表示、モバイルではドロワーとして表示 */}
      <Sidebar 
        mobileOpen={mobileDrawerOpen} 
        onDrawerToggle={handleDrawerToggle}
        isDesktop={isDesktop}
        drawerWidth={DRAWER_WIDTH}
      />
      
      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isDesktop ? DRAWER_WIDTH : 0}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          mt: '64px', // AppBarの高さ分
        }}
      >
        {children}
      </Box>

      {/* 要望追加用のフローティングボタン */}
      <Tooltip title="新しい要望を追加" arrow>
        <Fab
          color="secondary"
          aria-label="add request"
          onClick={handleAddRequest}
          sx={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            zIndex: (theme) => theme.zIndex.drawer + 1
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default Layout;
