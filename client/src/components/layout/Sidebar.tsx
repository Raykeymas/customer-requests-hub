import React from 'react';
import { 
  Box, 
  Drawer, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography,
  useTheme
} from '@mui/material';
import {
  Dashboard,
  People,
  ListAlt,
  LocalOffer,
  BarChart
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  isDesktop: boolean;
  drawerWidth: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onDrawerToggle,
  isDesktop,
  drawerWidth
}) => {
  const theme = useTheme();

  const menuItems = [
    { text: 'ダッシュボード', icon: <Dashboard />, link: '/dashboard' },
    { text: '要望一覧', icon: <ListAlt />, link: '/requests' },
    { text: '顧客管理', icon: <People />, link: '/customers' },
    { text: 'タグ管理', icon: <LocalOffer />, link: '/tags' },
    { text: '分析・レポート', icon: <BarChart />, link: '/analytics' }
  ];

  const drawerContent = (
    <>
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/dashboard"
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          顧客要望管理
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={RouterLink}
            to={item.link}
            sx={{
              '&.active': {
                backgroundColor: theme.palette.action.selected,
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* モバイル用ドロワー */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // モバイルでのパフォーマンス向上のため
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* デスクトップ用固定サイドバー */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            top: '64px', // AppBar の高さと合わせる
            height: 'calc(100% - 64px)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;