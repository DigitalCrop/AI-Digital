import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  FormControlLabel, Alert, FormControl, InputLabel, Select, MenuItem, Checkbox,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTradingStore } from '../store';
import { apiPost } from '../services/api';

export default function SettingsPage() {
  const { fetchRiskSettings, updateRiskSettings, emergencyStopActive } = useTradingStore();
  const [risk, setRisk] = useState({
    capitalAllocationPct: 80,
    maxDailyLoss: 5000,
    maxOpenPositions: 5,
    defaultPositionSizePct: 10,
    autoTradingEnabled: false,
  });
  const [broker, setBroker] = useState({
    provider: 'ZERODHA',
    apiKey: '',
    apiSecret: '',
    clientId: '',
    consentGiven: false,
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => { fetchRiskSettings(); }, [fetchRiskSettings]);

  const saveRisk = async () => {
    await updateRiskSettings(risk);
  };

  const connectBroker = async () => {
    if (!broker.consentGiven) return;
    await apiPost('/trading/brokers/connect', broker);
    setConnected(true);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Settings</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Risk Management</Typography>
              <TextField fullWidth label="Capital Allocation %" type="number" margin="normal" size="small"
                value={risk.capitalAllocationPct} onChange={(e) => setRisk({ ...risk, capitalAllocationPct: +e.target.value })} />
              <TextField fullWidth label="Max Daily Loss (₹)" type="number" margin="normal" size="small"
                value={risk.maxDailyLoss} onChange={(e) => setRisk({ ...risk, maxDailyLoss: +e.target.value })} />
              <TextField fullWidth label="Max Open Positions" type="number" margin="normal" size="small"
                value={risk.maxOpenPositions} onChange={(e) => setRisk({ ...risk, maxOpenPositions: +e.target.value })} />
              <TextField fullWidth label="Default Position Size %" type="number" margin="normal" size="small"
                value={risk.defaultPositionSizePct} onChange={(e) => setRisk({ ...risk, defaultPositionSizePct: +e.target.value })} />
              <Button variant="contained" onClick={saveRisk} sx={{ mt: 1 }}>Save Risk Settings</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Broker Integration</Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                API keys are encrypted at rest. You must provide explicit consent before connecting.
              </Alert>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Broker</InputLabel>
                <Select value={broker.provider} label="Broker"
                  onChange={(e) => setBroker({ ...broker, provider: e.target.value })}>
                  <MenuItem value="ZERODHA">Zerodha Kite</MenuItem>
                  <MenuItem value="UPSTOX">Upstox</MenuItem>
                  <MenuItem value="ANGEL_ONE">Angel One</MenuItem>
                  <MenuItem value="ICICI_DIRECT">ICICI Direct</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="API Key" margin="normal" size="small"
                value={broker.apiKey} onChange={(e) => setBroker({ ...broker, apiKey: e.target.value })} />
              <TextField fullWidth label="API Secret" type="password" margin="normal" size="small"
                value={broker.apiSecret} onChange={(e) => setBroker({ ...broker, apiSecret: e.target.value })} />
              <TextField fullWidth label="Client ID" margin="normal" size="small"
                value={broker.clientId} onChange={(e) => setBroker({ ...broker, clientId: e.target.value })} />
              <FormControlLabel
                control={<Checkbox checked={broker.consentGiven}
                  onChange={(e) => setBroker({ ...broker, consentGiven: e.target.checked })} />}
                label="I authorize SmartTrade to execute trades on my behalf"
              />
              <Button variant="contained" onClick={connectBroker} disabled={!broker.consentGiven} fullWidth>
                Connect Broker
              </Button>
              {connected && <Alert severity="success" sx={{ mt: 1 }}>Broker connected successfully</Alert>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {emergencyStopActive && (
        <Alert severity="error">
          Emergency stop is active. Review your positions and reset auto-trading when ready.
        </Alert>
      )}
    </Box>
  );
}
