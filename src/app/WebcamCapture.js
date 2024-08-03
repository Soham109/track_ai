'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Container, Button, TextField, Typography, Card, CardContent, Grid, Paper, AppBar, Toolbar, CircularProgress } from '@mui/material';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import './WebcamCapture.css';
import { Snackbar, Alert } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pantryItems, setPantryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setMessage("Photo captured");
  }, [webcamRef]);

  const uploadImage = async () => {
    if (image) {
      setMessage("Uploading photo...");
  
      const response = await fetch(image);
      const blob = await response.blob();
      console.log(process.env.api);
      const apiResponse = await fetch('https://image-intellect-ai.cognitiveservices.azure.com/vision/v3.2/analyze?visualFeatures=Categories,Description,Color', {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': '79892cfe82f0486a9e571b26140613a1',
          'Content-Type': 'application/octet-stream',
        },
        body: blob,
      });
  
      const result = await apiResponse.json();
      const itemName = result.description.tags[0];
      setMessage(`Item detected: ${itemName}`);
      setItemName(itemName);
    }
  };


  const addItem = async () => {
    if (itemName && quantity && user) {
      try {
        await addDoc(collection(db, 'pantry'), {
          name: itemName,
          quantity: parseInt(quantity),
          createdAt: new Date(),
          userId: user.uid,
        });
        setMessage("Item added to pantry");
        fetchPantryItems();
      } catch (error) {
        console.error("Error adding item:", error);
        setMessage("Failed to add item");
      }
    }
  };

  const fetchPantryItems = async () => {
    if (user) {
      setLoading(true);
      try {
        const q = query(collection(db, 'pantry'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPantryItems(items);
        setMessage("Pantry items fetched successfully");
      } catch (error) {
        console.error("Error fetching pantry items:", error);
        setMessage("Failed to fetch pantry items");
      } finally {
        setLoading(false);
      }
    }
  };

  const updateItem = async (id, updatedQuantity) => {
    if (updatedQuantity < 0) {
      setMessage("Quantity cannot be less than zero");
      return;
    }
    try {
      await updateDoc(doc(db, 'pantry', id), { quantity: updatedQuantity });
      setMessage("Item updated");
      fetchPantryItems();
    } catch (error) {
      console.error("Error updating item:", error);
      setMessage("Failed to update item");
    }
  };

  const removeItem = async (id) => {
    console.log('Removing item with id:', id);
    try {
      await deleteDoc(doc(db, 'pantry', id));
      setMessage("Item removed");
      fetchPantryItems();
    } catch (error) {
      console.error("Error removing item:", error);
      setMessage("Failed to remove item");
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setMessage('Signed out successfully!');
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchPantryItems(); 
      } else {
        setPantryItems([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPantryItems();
    }
  }, [user]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const cursor = document.querySelector('.cursor');
      const x = event.clientX;
      const y = event.clientY;
  
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    };
  
    document.addEventListener('mousemove', handleMouseMove);
  
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };
  
    document.addEventListener('mousemove', handleMouseMove);
  
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  useEffect(() => {
    const updateCursor = () => {
      const cursor = document.querySelector('.cursor');
  
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      requestAnimationFrame(updateCursor);
    };
  
    updateCursor();
  }, [mouseX, mouseY]);


  const filteredPantryItems = pantryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <Container maxWidth="lg" sx={{ padding: '20px', backgroundColor: '#f7f7f7' }}>
      <div className='cursor'></div>
      {user ? (
        <>
          <AppBar position="static" sx={{ backgroundColor: '#333', color: '#fff' }}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                TrackAI
              </Typography>
              {user.photoURL && (
                <img src={user.photoURL} alt="Profile" className="profile-pic" style={{ borderRadius: '50%', width: '40px', marginRight: '10px' }} />
              )}
              <Typography variant="body1" component="div" sx={{ marginRight: '10px' }}>
                {user.displayName || user.email}
              </Typography>
              <Button onClick={handleSignOut} variant="contained" color="secondary" sx={{ backgroundColor: '#333', color: '#fff' }}>
                Sign Out
              </Button>
            </Toolbar>
          </AppBar>
          <Typography variant="h4" component="div" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
            
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ padding: '20px', backgroundColor: '#fff' }}>
                <Typography variant="h6" component="div" sx={{ marginBottom: '10px' }}>
                  Capture Photo
                </Typography>
                <div className="webcam-container">
                  <div className="webcam-wrapper">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="webcam"
                    />
                    <Button onClick={capture} variant="contained" color="primary" fullWidth sx={{ marginBottom: '10px' }}>
                      Capture Photo
                    </Button>
                  </div>
                  {image && (
                    <div className="webcam-wrapper" style={{ marginTop: '0px' }}>
                      <img src={image} alt="Captured" className="captured-image" />
                      <Button onClick={uploadImage} variant="contained" color="secondary" fullWidth sx={{ marginBottom: '10px' }}>
                        Upload and Analyze
                      </Button>
                    </div>
                  )}
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ padding: '20px', backgroundColor: '#fff' }}>
                <Typography variant="h6" component="div" sx={{ marginBottom: '10px' }}>
                  Add or Update Pantry Item
                </Typography>
                <TextField
                  label="Item Name"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  sx={{ marginBottom: '10px' }}
                />
                <TextField
                  label="Quantity"
                  variant="outlined"
                  type="number"
                  fullWidth
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  sx={{ marginBottom: '10px' }}
                />
                <Button onClick={addItem} variant="contained" color="primary" fullWidth>
                  Add Item
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ padding: '20px', backgroundColor: '#fff' }}>
                <Typography variant="h6" component="div" sx={{ marginBottom: '10px' }}>
                  Search Pantry Items
                </Typography>
                <TextField
                  label="Search Items"
                  variant="outlined"
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ marginBottom: '10px' }}
                />
                <Typography variant="h6" component="div" sx={{ marginBottom: '10px' }}>
                  Pantry Items
                </Typography>
                {loading ? (
                  <CircularProgress />
                ) : (
                  filteredPantryItems.length > 0 ? (
                    filteredPantryItems.map(item => (
                      <Card key={item.id} sx={{ marginBottom: '10px', backgroundColor: '#fff' }}>
                        <CardContent>
                          <Typography variant="h6" component="div" sx={{ marginBottom: '5px' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body1" component="div" sx={{ marginBottom: '5px' }}>
                            Quantity: {item.quantity}
                          </Typography>
                          <Button onClick={() => updateItem(item.id, item.quantity + 1)} variant="contained" color="primary" sx={{ marginRight: '5px' }}>
                            +
                          </Button>
                          <Button onClick={() => updateItem(item.id, item.quantity - 1)} variant="contained" color="primary" sx={{ marginRight: '5px' }}>
                            -
                          </Button>
                          <Button onClick={() => removeItem(item.id)} variant="contained" color="secondary">
                          Remove Item
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body1" component="div">
                      No items found.
                    </Typography>
                  )
                )}
              </Paper>
            </Grid>
          </Grid>
          <Typography variant="body1" component="div" sx={{ marginTop: '20px' }}>
            {message}
          </Typography>
        </>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {showSignUp ? (
            <>
              <SignUpForm onSignUp={() => setUser(auth.currentUser)} />
              <Button onClick={() => setShowSignUp(false)} variant="contained" color="primary" sx={{ marginTop: '10px' }}>
                Already have an account? Sign In
              </Button>
            </>
          ) : (
            <>
              <SignInForm onSignIn={() => setUser(auth.currentUser)} />
              <Button
                onClick={() => setShowSignUp(true)}
                variant="contained"
                color="primary"
                sx={{ marginTop: '10px' }}
              >
                Need an account? Sign Up
              </Button>
            </>
          )}
        </div>
      )}
      <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage('')}>
        <Alert onClose={() => setMessage('')} severity="success">
          {message}
        </Alert>
      </Snackbar>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default WebcamCapture;