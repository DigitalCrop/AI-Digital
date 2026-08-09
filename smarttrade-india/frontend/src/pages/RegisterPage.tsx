import { Alert, Box, Button, Card, CardContent, TextField, Typography, Link } from '@mui/material';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../store';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 440, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>Create Account</Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            By registering, you acknowledge that trading in securities involves market risk.
          </Alert>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="First Name" margin="normal" required
              value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <TextField fullWidth label="Last Name" margin="normal" required
              value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <TextField fullWidth label="Email" type="email" margin="normal" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField fullWidth label="Password" type="password" margin="normal" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 2 }} disabled={loading}>
              Register
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Already have an account? <Link component={RouterLink} to="/login">Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
