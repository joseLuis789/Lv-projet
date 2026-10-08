const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

const USERS = [
  {
    id: 1,
    email: 'admin@agua.neon',
    password: 'AguaNeon2026!',
    name: 'Administrador',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin',
    createdAt: '2026-04-15'
  }
];

const PORTFOLIOS = [
  {
    userId: 1,
    id: 1,
    name: 'LV Token',
    symbol: 'LV3',
    amount: 34500,
    purchasePrice: 2.14,
    currentPrice: 4.82,
    change: 8.7,
    value: 166470,
    trend: 'up'
  },
  {
    userId: 1,
    id: 2,
    name: 'Aqua Stable',
    symbol: 'AQUA',
    amount: 18400,
    purchasePrice: 0.98,
    currentPrice: 1.01,
    change: 2.1,
    value: 18584,
    trend: 'up'
  },
  {
    userId: 1,
    id: 3,
    name: 'Neon Yield',
    symbol: 'NXT',
    amount: 12800,
    purchasePrice: 15.3,
    currentPrice: 27.6,
    change: 12.8,
    value: 353280,
    trend: 'up'
  },
  {
    userId: 1,
    id: 4,
    name: 'Digital Gold',
    symbol: 'GLD',
    amount: 3200,
    purchasePrice: 210.2,
    currentPrice: 231.4,
    change: 5.3,
    value: 740480,
    trend: 'up'
  }
];

const TRANSACTIONS = [
  { userId: 1, id: 'TX-1042', type: 'Ingreso', asset: 'LV Token', amount: 12400, status: 'completado', timestamp: new Date(Date.now() - 14 * 60000) },
  { userId: 1, id: 'TX-1041', type: 'Venta', asset: 'Aqua Stable', amount: -3200, status: 'completado', timestamp: new Date(Date.now() - 42 * 60000) },
  { userId: 1, id: 'TX-1040', type: 'Swap', asset: 'Neon Yield', amount: 8750, status: 'completado', timestamp: new Date(Date.now() - 65 * 60000) },
  { userId: 1, id: 'TX-1039', type: 'Transferencia', asset: 'Wallet SEC', amount: 5000, status: 'completado', timestamp: new Date(Date.now() - 180 * 60000) }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'agua-neon-session-secret-v1',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 1000
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos.' });
  }

  const user = USERS.find(
    (item) => item.email.toLowerCase() === String(email).trim().toLowerCase() && item.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role
  };

  return res.json({
    success: true,
    user: req.session.user,
    redirectTo: '/'
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, redirectTo: '/login' });
  });
});

app.get('/api/auth/session', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    user: req.session.user
  });
});

app.get('/api/user/profile', requireAuth, (req, res) => {
  const user = USERS.find(u => u.id === req.session.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.createdAt
  });
});

app.get('/api/overview', requireAuth, (req, res) => {
  const userPortfolio = PORTFOLIOS.filter(p => p.userId === req.session.user.id);
  const totalValue = userPortfolio.reduce((sum, p) => sum + p.value, 0);
  const totalInvested = userPortfolio.reduce((sum, p) => sum + (p.purchasePrice * p.amount), 0);
  const monthlyGrowth = ((totalValue - totalInvested) / totalInvested * 100).toFixed(1);

  res.json({
    balance: totalValue,
    monthlyGrowth: parseFloat(monthlyGrowth),
    activeAccounts: userPortfolio.length,
    reserve: userPortfolio[1]?.value || 18584,
    burnRate: 6.2,
    cashFlow: 15320.5,
    status: 'stable',
    totalInvested: totalInvested,
    gainLoss: totalValue - totalInvested
  });
});

app.get('/api/portfolio', requireAuth, (req, res) => {
  const userPortfolio = PORTFOLIOS.filter(p => p.userId === req.session.user.id);
  res.json(userPortfolio);
});

app.get('/api/portfolio/:id', requireAuth, (req, res) => {
  const asset = PORTFOLIOS.find(p => p.id === parseInt(req.params.id) && p.userId === req.session.user.id);
  if (!asset) {
    return res.status(404).json({ error: 'Activo no encontrado' });
  }
  res.json(asset);
});

app.get('/api/markets', requireAuth, (req, res) => {
  res.json([
    { symbol: 'LV3', name: 'LV Token', price: 4.82, change: 3.2, volume: '2.3M', marketCap: '28.4B' },
    { symbol: 'AQUA', name: 'Aqua Stable', price: 1.01, change: 0.9, volume: '980K', marketCap: '1.2B' },
    { symbol: 'NXT', name: 'Neon Yield', price: 27.6, change: -1.4, volume: '1.1M', marketCap: '8.6B' },
    { symbol: 'GLD', name: 'Digital Gold', price: 231.4, change: 1.7, volume: '640K', marketCap: '15.3B' }
  ]);
});

app.get('/api/transactions', requireAuth, (req, res) => {
  const userTransactions = TRANSACTIONS.filter(t => t.userId === req.session.user.id);
  const formatted = userTransactions.map(t => ({
    ...t,
    time: formatRelativeTime(t.timestamp),
    amountDisplay: `${t.amount >= 0 ? '+' : ''}$${Math.abs(t.amount).toLocaleString()}`
  }));
  res.json(formatted);
});

app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('*', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return `Hace ${diffDays}d`;
}

app.listen(PORT, () => {
  console.log(`✓ Agua Neon running on http://localhost:${PORT}`);
  console.log(`✓ Login: admin@agua.neon / AguaNeon2026!`);
});
