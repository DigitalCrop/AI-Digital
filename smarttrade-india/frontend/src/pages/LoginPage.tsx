import { Alert, Box, Button, Card, CardContent, TextField, Typography, Link } from '@mui/material';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuthStore } from '../store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, totpCode || undefined);
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message.includes('2FA')) setNeeds2FA(true);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <TrendingUpIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>SmartTrade India</Typography>
            <Typography variant="body2" color="text.secondary">
              Indian Stock Market Trading Platform
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mb: 2 }}>
            Trading involves substantial risk. Automated trades require explicit authorization.
          </Alert>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email" margin="normal"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
            <TextField
              fullWidth label="Password" type="password" margin="normal"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
            {needs2FA && (
              <TextField
                fullWidth label="2FA Code" margin="normal"
                value={totpCode} onChange={(e) => setTotpCode(e.target.value)} required
              />
            )}
            <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 2 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            No account? <Link component={RouterLink} to="/register">Register</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
