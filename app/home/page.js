'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  Container,
  Paper,
  IconButton,
  createTheme,
  ThemeProvider
} from '@mui/material';
import { Add, Remove, CameraAlt, Close } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { firestore } from '@/firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import Webcam from 'react-webcam';

// Define the theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#f5f5dc', // beige color for buttons and other accents
    },
    secondary: {
      main: '#dbd7d2', // off-white color used for text and icons
    },
    background: {
      default: '#f0ead6', // changed to a more off-white for the entire background
      paper: '#e6e2d3', // a slight variation for surfaces like cards
    },
    text: {
      primary: '#333', // darker contrast for text
      secondary: '#555', // lighter text color
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h3: {
      fontWeight: 500,
      color: '#333',
    },
    h6: {
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
        },
      },
    },
  },
});

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

const TitleCard = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  margin: theme.spacing(2, 0),
}));

const ColumnHeaders = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const ColumnHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.text.secondary,
}));

const PantryItem = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  margin: theme.spacing(1, 0),
}));

const CameraButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const CameraModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const CameraContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '500px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2),
  position: 'relative',
}));

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const webcamRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);

  const handleCameraOpen = () => setCameraModalOpen(true);
  const handleCameraClose = () => {
    setCameraModalOpen(false);
    setCapturedImage(null);
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    // Here you can send the image to your backend or an AI service
  };


  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    setPantry(pantryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updatePantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updatePantry();
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredPantry = pantry
    .map(item => ({
      ...item,
      matchType: item.name.toLowerCase().startsWith(searchQuery) ? 'start' :
        item.name.toLowerCase().includes(searchQuery) ? 'include' : 'none'
    }))
    .filter(item => item.matchType !== 'none')
    .sort((a, b) => {
      if (a.matchType === 'start' && b.matchType !== 'start') return -1;
      if (b.matchType === 'start' && a.matchType !== 'start') return 1;
      return a.name.localeCompare(b.name); // Sort alphabetically by name if same match type
    });

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 5, backgroundColor: theme.palette.background.default }}>
        <TitleCard elevation={3}>
          <Typography variant="h3" align="center" gutterBottom>
            PantrySmart
          </Typography>
        </TitleCard>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <TextField
            label="Search Items"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ width: '70%' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{ mb: 3 }}
          >
            Add New Item
          </Button>
        </Stack>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Paper elevation={3}>
          <Box bgcolor="primary.light" py={2}>
            <Typography variant="h4" color="primary.contrastText" align="center">
              Your Items
            </Typography>
          </Box>
          <ColumnHeaders>
            <ColumnHeader sx={{ flex: 3 }}>Item Name</ColumnHeader>
            <ColumnHeader sx={{ flex: 2.8, textAlign: 'center' }}>Quantity</ColumnHeader>
            <ColumnHeader sx={{ flex: 0.55 }}>Actions</ColumnHeader>
          </ColumnHeaders>
          <Stack spacing={2} p={3} overflow="auto">
            {filteredPantry.map(({ name, quantity }) => (
              <PantryItem key={name}>
                <Typography variant="h6" component="div" sx={{ flex: 3 }}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h6" component="div" sx={{ flex: 1, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: 'flex-end' }}>
                  <IconButton
                    color="success"
                    onClick={() => addItem(name)}
                  >
                    <Add />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => removeItem(name)}
                  >
                    <Remove />
                  </IconButton>
                </Stack>
              </PantryItem>
            ))}
          </Stack>
        </Paper>
        <CameraButton color="primary" onClick={handleCameraOpen}>
          <CameraAlt fontSize="large" />
        </CameraButton>

        <CameraModal
          open={cameraModalOpen}
          onClose={handleCameraClose}
        >
          <CameraContainer>
            {!capturedImage ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                />
                <Stack direction="row" justifyContent="space-between" mt={2}>
                  <Button variant="contained" onClick={handleCameraClose}>
                    Back
                  </Button>
                  <Button variant="contained" onClick={capture}>
                    Capture
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={() => setCapturedImage(null)}
                >
                  <Close />
                </IconButton>
                <img src={capturedImage} alt="Captured" style={{ width: '100%' }} />
              </>
            )}
          </CameraContainer>
        </CameraModal>
      </Container>
    </ThemeProvider>
  );
}