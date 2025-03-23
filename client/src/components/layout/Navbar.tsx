import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Box,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Brightness4,
  Brightness7
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

interface NavbarProps {
  drawerOpen?: boolean;
  onDrawerToggle?: () => void;
  isDesktop?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  drawerOpen = false,
  onDrawerToggle = () => {},
  isDesktop = false
}) => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { mode, toggleColorMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: '100%'
      }}
    >
      <Toolbar>
        {isAuthenticated && !isDesktop && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={onDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          component={RouterLink}
          to="/dashboard"
          sx={{
            flexGrow: 1,
            color: 'inherit',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          顧客要望管理システム
        </Typography>

        {/* テーマ切り替えボタン */}
        <Tooltip title={mode === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}>
          <IconButton 
            color="inherit" 
            onClick={toggleColorMode} 
            sx={{ mr: 1 }}
          >
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Tooltip>

        {isAuthenticated ? (
          <div>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.name.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem component={RouterLink} to="/profile">
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                プロフィール
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                ログアウト
              </MenuItem>
            </Menu>
          </div>
        ) : (
          <>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
            >
              ログイン
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/register"
            >
              登録
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;