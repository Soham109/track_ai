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

      const apiResponse = await fetch(`https://image-intellect-ai.cognitiveservices.azure.com/vision/v3.2/analyze?visualFeatures=Categories,Description,Color`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': '79892cfe82f0486a9e571b26140613a1',
          'Content-Type': 'application/octet-stream',
        },
        body: blob,
      });

      const result = await apiResponse.json();
      const formattedText = formatResponse(result);
      setMessage(formattedText);
      setItemName(formattedText);
    }
  };

  const formatResponse = (response) => {
    if (response.description && response.description.tags && response.description.tags.length > 0) {
      return response.description.tags[0];
    }
    return "";
  };

  const addItem = async () => {
    if (itemName && quantity && user) {
      await addDoc(collection(db, 'pantry'), {
        name: itemName,
        quantity: parseInt(quantity),
        createdAt: new Date(),
        userId: user.uid,
      });
      setMessage("Item added to pantry");
      fetchPantryItems();
    }
  };
  const fetchPantryItems = async () => {
    if (user) {
      setLoading(true);
      try {
        console.log("Fetching pantry items for user:", user.uid);
        const q = query(collection(db, 'pantry'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        console.log("Snapshot data:", snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    await updateDoc(doc(db, 'pantry', id), { quantity: updatedQuantity });
    setMessage("Item updated");
    fetchPantryItems();
  };

  const removeItem = async (id) => {
    await deleteDoc(doc(db, 'pantry', id));
    setMessage("Item removed");
    fetchPantryItems();
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

  const filteredPantryItems = pantryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container>
      {user ? (
        <>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" style={{ flexGrow: 1 }}>
                Pantry
              </Typography>
              {user.photoURL && (
                <img src={user.photoURL} alt="Profile" className="profile-pic" style={{ borderRadius: '50%', width: '40px', marginRight: '10px' }} />
              )}
              <Typography variant="body1" style={{ marginRight: '10px' }}>
                {user.displayName || user.email}
              </Typography>
              <Button onClick={handleSignOut} variant="contained" color="secondary">
                Sign Out
              </Button>
            </Toolbar>
          </AppBar>
          <Typography variant="h4" gutterBottom>TrackAI</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} style={{ padding: '16px' }}>
                <Typography variant="h6" gutterBottom>Capture Photo</Typography>
                <div className="webcam-container">
                  <div className="webcam-wrapper">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="webcam"
                    />
                    <Button onClick={capture} variant="contained" color="primary" fullWidth style={{ marginBottom: '20px' }}>
                      Capture Photo
                    </Button>
                  </div>
                  {image && (
                    <div className="webcam-wrapper" style={{ marginTop: '0px' }}>
                      <img src={image} alt="Captured" className="captured-image" />
                      <Button onClick={uploadImage} variant="contained" color="secondary" fullWidth style={{ marginBottom: '20px' }}>
                        Upload and Analyze
                      </Button>
                    </div>
                  )}
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} style={{ padding: '16px' }}>
                <Typography variant="h6" gutterBottom>Add or Update Pantry Item</Typography>
                <TextField
                  label="Item Name"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  style={{ marginBottom: '16px' }}
                />
                <TextField
                  label="Quantity"
                  variant="outlined"
                  type="number"
                  fullWidth
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{ marginBottom: '16px' }}
                />
                <Button onClick={addItem} variant="contained" color="primary" fullWidth>
                  Add Item
                </Button>
              </Paper>
            </Grid>
                <Grid item xs={12}>
      <Paper elevation={3} style={{ padding: '16px' }}>
        <Typography variant="h6" gutterBottom>Search Pantry Items</Typography>
        <TextField
          label="Search Items"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        <Typography variant="h6" gutterBottom>Pantry Items</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          filteredPantryItems.length > 0 ? (
            filteredPantryItems.map(item => (
              <Card key={item.id} style={{ marginBottom: '16px' }}>
                <CardContent>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography>Quantity: {item.quantity}</Typography>
                  <Button onClick={() => updateItem(item.id, item.quantity + 1)} variant="contained" color="primary" style={{ marginRight: '8px' }}>
                    +
                  </Button>
                  <Button onClick={() => updateItem(item.id, item.quantity - 1)} variant="contained" color="primary" style={{ marginRight: '8px' }}>
                    -
                  </Button>
                  <Button onClick={() => removeItem(item.id)} variant="contained" color="secondary">
                    Remove Item
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body1">No items found.</Typography>
          )
        )}
      </Paper>
    </Grid>

          </Grid>
          <Typography variant="body1" color="textSecondary" style={{ marginTop: '16px' }}>
            {message}
          </Typography>
        </>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {showSignUp ? (
            <>
              <SignUpForm onSignUp={() => setUser(auth.currentUser)} />
              <Button onClick={() => setShowSignUp(false)} variant="contained" color="primary" style={{ marginTop: '16px' }}>
                Already have an account? Sign In
              </Button>
            </>
          ) : (
            <>
              <SignInForm onSignIn={() => setUser(auth.currentUser)} />
              <Button onClick={() => setShowSignUp(true)} variant="contained" color="primary" style={{ marginTop: '16px' }}>
                Need an account? Sign Up
              </Button>
            </>
          )}
        </div>
      )}
    </Container>
  );
};

export default WebcamCapture;
