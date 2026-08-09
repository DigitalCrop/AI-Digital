import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

const dailyPnl = [
  { day: 'Mon', pnl: 2500 }, { day: 'Tue', pnl: -1200 }, { day: 'Wed', pnl: 3800 },
  { day: 'Thu', pnl: 1500 }, { day: 'Fri', pnl: -800 },
];

const monthlyReturns = [
  { month: 'Jan', return: 3.2 }, { month: 'Feb', return: -1.5 }, { month: 'Mar', return: 5.8 },
  { month: 'Apr', return: 2.1 }, { month: 'May', return: 4.5 }, { month: 'Jun', return: -0.8 },
];

const winLoss = [
  { name: 'Wins', value: 62, color: '#00C853' },
  { name: 'Losses', value: 38, color: '#FF1744' },
];

export default function AnalyticsPage() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Analytics Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Daily P&L</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyPnl}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                  <Bar dataKey="pnl" fill="#42A5F5" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Monthly Returns (%)</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Line type="monotone" dataKey="return" stroke="#AB47BC" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Win/Loss Distribution</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={winLoss} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {winLoss.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
