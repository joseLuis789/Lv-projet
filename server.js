const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/overview', (req, res) => {
  res.json({
    balance: 245680.92,
    monthlyGrowth: 18.4,
    activeAccounts: 12,
    reserve: 84250.13,
    burnRate: 6.2,
    cashFlow: 15320.5,
    status: 'stable'
  });
});

app.get('/api/portfolio', (req, res) => {
  res.json([
    { name: 'LV Token', amount: 34500, change: 8.7, value: 17640 },
    { name: 'Aqua Stable', amount: 18400, change: 2.1, value: 18400 },
    { name: 'Neon Yield', amount: 12800, change: 12.8, value: 14320 },
    { name: 'Digital Gold', amount: 3200, change: 5.3, value: 9810 }
  ]);
});

app.get('/api/markets', (req, res) => {
  res.json([
    { symbol: 'LV3', price: 4.82, change: 3.2, volume: '2.3M' },
    { symbol: 'AQUA', price: 1.01, change: 0.9, volume: '980K' },
    { symbol: 'NXT', price: 27.6, change: -1.4, volume: '1.1M' },
    { symbol: 'GLD', price: 231.4, change: 1.7, volume: '640K' }
  ]);
});

app.get('/api/transactions', (req, res) => {
  res.json([
    { id: 'TX-1042', type: 'Ingreso', asset: 'LV Token', amount: '+$12,400', time: 'Hace 14 min' },
    { id: 'TX-1041', type: 'Venta', asset: 'Aqua Stable', amount: '-$3,200', time: 'Hace 42 min' },
    { id: 'TX-1040', type: 'Swap', asset: 'Neon Yield', amount: '+$8,750', time: 'Hace 1h 05m' },
    { id: 'TX-1039', type: 'Transferencia', asset: 'Wallet SEC', amount: '$5,000', time: 'Hace 3h' }
  ]);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Agua Neon running on http://localhost:${PORT}`);
});
