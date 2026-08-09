import {
  Box, Card, CardContent, Typography, Button, Grid, TextField,
  FormControl, InputLabel, Select, MenuItem, IconButton, Chip, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { useState } from 'react';
import { apiPost } from '../services/api';
import type { StrategyCondition, StrategyRuleGroup } from '@smarttrade/shared';

const CONDITION_FIELDS = ['RSI', 'MACD', 'EMA', 'SMA', 'VWAP', 'PRICE', 'VOLUME', 'DELIVERY_PCT', 'BREAKOUT', 'MOMENTUM', 'STOP_LOSS', 'TARGET'];
const COMPARATORS = ['>', '<', '>=', '<=', '==', 'crosses_above', 'crosses_below'];

function RuleBuilder({
  title, rules, onChange, color,
}: {
  title: string;
  rules: StrategyRuleGroup;
  onChange: (rules: StrategyRuleGroup) => void;
  color: 'success' | 'error';
}) {
  const addCondition = () => {
    onChange({
      ...rules,
      conditions: [...rules.conditions, {
        id: crypto.randomUUID(),
        field: 'RSI',
        comparator: '<',
        value: 30,
        period: 14,
      }],
    });
  };

  const updateCondition = (idx: number, updates: Partial<StrategyCondition>) => {
    const conditions = [...rules.conditions];
    conditions[idx] = { ...conditions[idx], ...updates };
    onChange({ ...rules, conditions });
  };

  const removeCondition = (idx: number) => {
    onChange({ ...rules, conditions: rules.conditions.filter((_, i) => i !== idx) });
  };

  return (
    <Card sx={{ borderLeft: 4, borderColor: `${color}.main` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color={`${color}.main`}>{title}</Typography>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Logic</InputLabel>
            <Select value={rules.operator} label="Logic"
              onChange={(e) => onChange({ ...rules, operator: e.target.value as 'AND' | 'OR' })}>
              <MenuItem value="AND">AND</MenuItem>
              <MenuItem value="OR">OR</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {rules.conditions.map((cond, idx) => (
          <Grid container spacing={1} key={cond.id} sx={{ mb: 1, alignItems: 'center' }}>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <Select value={cond.field} onChange={(e) => updateCondition(idx, { field: e.target.value as StrategyCondition['field'] })}>
                  {CONDITION_FIELDS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <Select value={cond.comparator} onChange={(e) => updateCondition(idx, { comparator: e.target.value as StrategyCondition['comparator'] })}>
                  {COMPARATORS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <TextField fullWidth size="small" type="number" value={cond.value}
                onChange={(e) => updateCondition(idx, { value: +e.target.value })} />
            </Grid>
            <Grid item xs={2}>
              <TextField fullWidth size="small" type="number" label="Period" value={cond.period ?? ''}
                onChange={(e) => updateCondition(idx, { period: +e.target.value })} />
            </Grid>
            <Grid item xs={1}>
              <IconButton size="small" onClick={() => removeCondition(idx)}><DeleteIcon /></IconButton>
            </Grid>
          </Grid>
        ))}

        <Button startIcon={<AddIcon />} size="small" onClick={addCondition}>Add Condition</Button>
      </CardContent>
    </Card>
  );
}

export default function StrategyBuilderPage() {
  const [name, setName] = useState('My Strategy');
  const [symbols, setSymbols] = useState('RELIANCE,TCS,INFY');
  const [entryRules, setEntryRules] = useState<StrategyRuleGroup>({
    operator: 'AND',
    conditions: [
      { id: '1', field: 'RSI', comparator: '<', value: 30, period: 14 },
      { id: '2', field: 'VOLUME', comparator: '>', value: 2 },
    ],
  });
  const [exitRules, setExitRules] = useState<StrategyRuleGroup>({
    operator: 'OR',
    conditions: [
      { id: '3', field: 'RSI', comparator: '>', value: 70, period: 14 },
      { id: '4', field: 'STOP_LOSS', comparator: '<=', value: 0 },
      { id: '5', field: 'TARGET', comparator: '>=', value: 0 },
    ],
  });
  const [saved, setSaved] = useState(false);

  const saveStrategy = async () => {
    await apiPost('/trading/strategies', {
      name,
      symbols: symbols.split(',').map((s) => s.trim()),
      entryRules,
      exitRules,
      riskConfig: { stopLossPct: 2, targetPct: 4, positionSizePct: 10 },
      requiresManualApproval: true,
    });
    setSaved(true);
  };

  const loadSample = async () => {
    await apiPost('/trading/strategies/sample');
    setSaved(true);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Strategy Builder</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        No-code strategy creation. All automated trades require manual approval by default.
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <TextField fullWidth label="Strategy Name" value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth label="Symbols (comma-separated)" value={symbols} onChange={(e) => setSymbols(e.target.value)} sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <RuleBuilder title="BUY When" rules={entryRules} onChange={setEntryRules} color="success" />
            <RuleBuilder title="SELL When" rules={exitRules} onChange={setExitRules} color="error" />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Actions</Typography>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={saveStrategy} sx={{ mb: 1 }}>
                Save Strategy
              </Button>
              <Button fullWidth variant="outlined" onClick={loadSample} sx={{ mb: 1 }}>
                Load Sample Strategy
              </Button>
              {saved && <Chip label="Strategy Saved" color="success" sx={{ mt: 1 }} />}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
