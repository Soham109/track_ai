import React, { useState } from 'react';
import { Button, TextField, Typography, Container, Paper } from '@mui/material';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';

const SignInForm = ({ onSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Signed in successfully!');
      if (onSignIn) onSignIn();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setMessage('Signed in with Google successfully!');
      if (onSignIn) onSignIn();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: '32px', marginTop: '64px' }}>
        <Typography variant="h4" gutterBottom align="center">Sign In</Typography>
        <form onSubmit={handleSignIn}>
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ marginBottom: '16px' }}
            required
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ marginBottom: '16px' }}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ padding: '12px' }}>
            Sign In
          </Button>
          <Button onClick={handleGoogleSignIn} variant="contained" color="secondary" fullWidth sx={{ padding: '12px', marginTop: '16px' }}>
            Sign in with Google
          </Button>
        </form>
        {message && (
          <Typography variant="body1" color="error" align="center" sx={{ marginTop: '16px' }}>
            {message}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default SignInForm;