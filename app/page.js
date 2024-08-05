'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  createTheme,
  ThemeProvider
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Use the same theme as in your home.js
const theme = createTheme({
  palette: {
    primary: {
      main: '#f5f5dc',
    },
    secondary: {
      main: '#dbd7d2',
    },
    background: {
      default: '#f0ead6',
      paper: '#e6e2d3',
    },
    text: {
      primary: '#333',
      secondary: '#555',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h1: {
      fontWeight: 500,
      color: '#333',
    },
    h4: {
      fontWeight: 400,
      color: '#555',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          textTransform: 'none',
          padding: '10px 20px',
          fontSize: '1.1rem',
        },
      },
    },
  },
});

const LandingCard = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(6),
  margin: theme.spacing(4, 0),
  textAlign: 'center',
}));

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/home');
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.palette.background.default }}>
        <LandingCard elevation={3}>
          <Typography variant="h1" gutterBottom>
            Welcome to PantrySmart
          </Typography>
          <Typography variant="h4" paragraph>
            Organization, recipe creation, all at your fingertips.
          </Typography>
          <Box mt={4}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </Box>
        </LandingCard>
      </Container>
    </ThemeProvider>
  );
}