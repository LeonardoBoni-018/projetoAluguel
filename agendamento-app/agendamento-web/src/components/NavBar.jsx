import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";

export default function NavBar({ usuario, onLogout, onChangePassword }) {
  const userInitial = (usuario?.nome ||
    usuario?.usuario ||
    "U")[0].toUpperCase();

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={2}
      sx={{ backgroundColor: "white" }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SportsSoccerIcon color="primary" />
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            Agendamento Faculdade
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              onClick={onChangePassword}
              sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
            >
              {userInitial}
            </Avatar>
            <Typography variant="subtitle2" color="text.primary">
              {usuario?.nome || usuario?.usuario || "Usuário"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={onLogout}
            startIcon={<LogoutIcon />}
            size="small"
          >
            Sair
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
