import React, { useState } from 'react';
import { Button, TextField, Typography, Container, Paper, CircularProgress } from '@mui/material';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';

const SignUpForm = ({ onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage('Account created successfully!');
      if (onSignUp) onSignUp();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      setMessage('Signed up with Google successfully!');
      if (onSignUp) onSignUp();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: '32px', marginTop: '16px' }}>
        <Typography variant="h4" gutterBottom align="center">Sign Up</Typography>
        <form onSubmit={handleSignUp}>
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
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ padding: '12px', marginBottom: '16px' }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Button onClick={handleGoogleSignUp} variant="contained" color="secondary" fullWidth sx={{ padding: '12px' }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Sign up with Google'}
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

export default SignUpForm;