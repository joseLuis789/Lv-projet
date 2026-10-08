const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

const USERS = [
  {
    email: 'admin@agua.neon',
    password: 'AguaNeon2026!',
    name: 'Administrador'
  }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'agua-neon-session-secret',
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
    email: user.email,
    name: user.name
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

app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/overview', requireAuth, (req, res) => {
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

app.get('/api/portfolio', requireAuth, (req, res) => {
  res.json([
    { name: 'LV Token', amount: 34500, change: 8.7, value: 17640 },
    { name: 'Aqua Stable', amount: 18400, change: 2.1, value: 18400 },
    { name: 'Neon Yield', amount: 12800, change: 12.8, value: 14320 },
    { name: 'Digital Gold', amount: 3200, change: 5.3, value: 9810 }
  ]);
});

app.get('/api/markets', requireAuth, (req, res) => {
  res.json([
    { symbol: 'LV3', price: 4.82, change: 3.2, volume: '2.3M' },
    { symbol: 'AQUA', price: 1.01, change: 0.9, volume: '980K' },
    { symbol: 'NXT', price: 27.6, change: -1.4, volume: '1.1M' },
    { symbol: 'GLD', price: 231.4, change: 1.7, volume: '640K' }
  ]);
});

app.get('/api/transactions', requireAuth, (req, res) => {
  res.json([
    { id: 'TX-1042', type: 'Ingreso', asset: 'LV Token', amount: '+$12,400', time: 'Hace 14 min' },
    { id: 'TX-1041', type: 'Venta', asset: 'Aqua Stable', amount: '-$3,200', time: 'Hace 42 min' },
    { id: 'TX-1040', type: 'Swap', asset: 'Neon Yield', amount: '+$8,750', time: 'Hace 1h 05m' },
    { id: 'TX-1039', type: 'Transferencia', asset: 'Wallet SEC', amount: '$5,000', time: 'Hace 3h' }
  ]);
});

app.get('*', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Agua Neon running on http://localhost:${PORT}`);
  console.log('Login user: admin@agua.neon');
  console.log('Password: AguaNeon2026!');
});
