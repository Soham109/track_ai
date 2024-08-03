import React, { useState } from 'react';
import { Button, TextField, Typography, Container, Paper, CircularProgress } from '@mui/material';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';

const SignInForm = ({ onSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Signed in successfully!');
      if (onSignIn) onSignIn();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      setMessage('Signed in with Google successfully!');
      if (onSignIn) onSignIn();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ borderRadius: '20px' }}>
      <Paper elevation={3} sx={{ padding: '32px', marginTop: '16px', borderRadius: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>Sign In</Typography>
        <form onSubmit={handleSignIn}>
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ marginBottom: '16px', borderRadius: '20px' }}
            required
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ marginBottom: '16px', borderRadius: '20px' }}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ padding: '12px', marginBottom: '16px', borderRadius: '20px' }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          <Button onClick={handleGoogleSignIn} variant="contained" color="secondary" fullWidth sx={{ padding: '12px', borderRadius: '20px' }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Sign in with Google'}
          </Button>
        </form>
        {message && (
          <Typography variant="body1" color="error" align="center" sx={{ marginTop: '16px', borderRadius: '20px' }}>
            {message}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default SignInForm;