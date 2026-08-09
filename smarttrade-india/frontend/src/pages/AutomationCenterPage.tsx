import {
  Box, Card, CardContent, Typography, Switch, FormControlLabel, Grid,
  Alert, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTradingStore } from '../store';
import { apiGet, apiPatch } from '../services/api';
import type { Strategy } from '@smarttrade/shared';

export default function AutomationCenterPage() {
  const { emergencyStopActive, autoTradingEnabled, fetchRiskSettings, updateRiskSettings, triggerEmergencyStop } = useTradingStore();
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  useEffect(() => {
    fetchRiskSettings();
    apiGet<Strategy[]>('/trading/strategies').then(setStrategies);
  }, [fetchRiskSettings]);

  const toggleStrategy = async (id: string, status: string) => {
    await apiPatch(`/trading/strategies/${id}/status`, { status });
    const updated = await apiGet<Strategy[]>('/trading/strategies');
    setStrategies(updated);
  };

  const toggleAutoTrading = async () => {
    await updateRiskSettings({ autoTradingEnabled: !autoTradingEnabled });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Automation Center</Typography>

      {emergencyStopActive && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Emergency stop is ACTIVE. All automated trading is halted. Reset in Settings after review.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <FormControlLabel
                control={<Switch checked={autoTradingEnabled} onChange={toggleAutoTrading} disabled={emergencyStopActive} />}
                label="Enable Auto Trading"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Requires broker consent and manual order approval (default).
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Engine Status</Typography>
              <Chip
                label={emergencyStopActive ? 'STOPPED' : autoTradingEnabled ? 'RUNNING' : 'PAUSED'}
                color={emergencyStopActive ? 'error' : autoTradingEnabled ? 'success' : 'warning'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Button fullWidth variant="contained" color="error" onClick={triggerEmergencyStop} disabled={emergencyStopActive}>
                Emergency Stop All
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Active Strategies</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Symbols</TableCell>
                <TableCell>Approval</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {strategies.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>
                    <Chip label={s.status} size="small"
                      color={s.status === 'ACTIVE' ? 'success' : s.status === 'STOPPED' ? 'error' : 'default'} />
                  </TableCell>
                  <TableCell>{s.symbols.join(', ')}</TableCell>
                  <TableCell>{s.requiresManualApproval ? 'Manual' : 'Auto'}</TableCell>
                  <TableCell>
                    {s.status !== 'ACTIVE' ? (
                      <Button size="small" onClick={() => toggleStrategy(s.id, 'ACTIVE')} disabled={emergencyStopActive}>
                        Activate
                      </Button>
                    ) : (
                      <Button size="small" color="error" onClick={() => toggleStrategy(s.id, 'STOPPED')}>
                        Stop
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {strategies.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">No strategies yet. Create one in Strategy Builder.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
