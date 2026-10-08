const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'agua_neon.db');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Database ready at:', DB_PATH);
  initDatabase();
});

function initDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        role TEXT DEFAULT 'admin',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        amount REAL NOT NULL,
        purchase_price REAL NOT NULL,
        current_price REAL NOT NULL,
        change REAL NOT NULL,
        trend TEXT DEFAULT 'up',
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        txn_id TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        asset TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS market_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        change REAL NOT NULL,
        volume TEXT NOT NULL,
        market_cap TEXT NOT NULL
      )
    `);

    db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
      if (err) {
        console.error('Error checking users:', err.message);
        return;
      }

      if (row && row.count === 0) {
        db.run(`
          INSERT INTO users (email, password, name, avatar, role)
          VALUES (?, ?, ?, ?, ?)
        `, [
          'admin@agua.neon',
          'AguaNeon2026!',
          'Administrador',
          'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          'admin'
        ]);

        db.run(`
          INSERT INTO assets (user_id, name, symbol, amount, purchase_price, current_price, change, trend)
          VALUES
            (?, 'LV Token', 'LV3', 34500, 2.14, 4.82, 8.7, 'up'),
            (?, 'Aqua Stable', 'AQUA', 18400, 0.98, 1.01, 2.1, 'up'),
            (?, 'Neon Yield', 'NXT', 12800, 15.3, 27.6, 12.8, 'up'),
            (?, 'Digital Gold', 'GLD', 3200, 210.2, 231.4, 5.3, 'up')
        `, [1, 1, 1, 1]);

        db.run(`
          INSERT INTO transactions (user_id, txn_id, type, asset, amount, status)
          VALUES
            (1, 'TX-1042', 'Ingreso', 'LV Token', 12400, 'completado'),
            (1, 'TX-1041', 'Venta', 'Aqua Stable', -3200, 'completado'),
            (1, 'TX-1040', 'Swap', 'Neon Yield', 8750, 'completado'),
            (1, 'TX-1039', 'Transferencia', 'Wallet SEC', 5000, 'completado')
        `);

        db.run(`
          INSERT INTO market_data (symbol, name, price, change, volume, market_cap)
          VALUES
            ('LV3', 'LV Token', 4.82, 3.2, '2.3M', '28.4B'),
            ('AQUA', 'Aqua Stable', 1.01, 0.9, '980K', '1.2B'),
            ('NXT', 'Neon Yield', 27.6, -1.4, '1.1M', '8.6B'),
            ('GLD', 'Digital Gold', 231.4, 1.7, '640K', '15.3B')
        `);
      }
    });
  });
}

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

  db.get(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND password = ?',
    [String(email).trim(), password],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor.' });
      }

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
    }
  );
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
  const userId = req.session.user.id;

  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error consultando perfil.' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.created_at
    });
  });
});

app.get('/api/overview', requireAuth, (req, res) => {
  const userId = req.session.user.id;

  db.all('SELECT * FROM assets WHERE user_id = ?', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error consultando activos.' });
    }

    const portfolio = rows.map((item) => ({
      ...item,
      value: Number((item.amount * item.current_price).toFixed(2)),
      purchaseValue: Number((item.amount * item.purchase_price).toFixed(2))
    }));

    const totalValue = portfolio.reduce((sum, item) => sum + item.value, 0);
    const totalInvested = portfolio.reduce((sum, item) => sum + item.purchaseValue, 0);
    const monthlyGrowth = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
    const reserve = portfolio[1]?.value || 0;

    return res.json({
      balance: Number(totalValue.toFixed(2)),
      monthlyGrowth: Number(monthlyGrowth.toFixed(1)),
      activeAccounts: portfolio.length,
      reserve: Number(reserve.toFixed(2)),
      burnRate: 6.2,
      cashFlow: 15320.5,
      status: 'stable',
      totalInvested: Number(totalInvested.toFixed(2)),
      gainLoss: Number((totalValue - totalInvested).toFixed(2))
    });
  });
});

app.get('/api/portfolio', requireAuth, (req, res) => {
  const userId = req.session.user.id;

  db.all('SELECT * FROM assets WHERE user_id = ?', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error consultando portfolio.' });
    }

    return res.json(rows.map((item) => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      symbol: item.symbol,
      amount: item.amount,
      purchasePrice: item.purchase_price,
      currentPrice: item.current_price,
      change: item.change,
      value: Number((item.amount * item.current_price).toFixed(2)),
      trend: item.trend
    })));
  });
});

app.get('/api/portfolio/:id', requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const assetId = Number(req.params.id);

  db.get('SELECT * FROM assets WHERE id = ? AND user_id = ?', [assetId, userId], (err, asset) => {
    if (err) {
      return res.status(500).json({ error: 'Error consultando activo.' });
    }

    if (!asset) {
      return res.status(404).json({ error: 'Activo no encontrado' });
    }

    return res.json({
      id: asset.id,
      userId: asset.user_id,
      name: asset.name,
      symbol: asset.symbol,
      amount: asset.amount,
      purchasePrice: asset.purchase_price,
      currentPrice: asset.current_price,
      change: asset.change,
      value: Number((asset.amount * asset.current_price).toFixed(2)),
      trend: asset.trend
    });
  });
});

app.get('/api/markets', requireAuth, (req, res) => {
  db.all('SELECT * FROM market_data ORDER BY price DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error consultando mercado.' });
    }

    return res.json(rows.map((row) => ({
      symbol: row.symbol,
      name: row.name,
      price: row.price,
      change: row.change,
      volume: row.volume,
      marketCap: row.market_cap
    })));
  });
});

app.get('/api/transactions', requireAuth, (req, res) => {
  const userId = req.session.user.id;

  db.all('SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error consultando transacciones.' });
    }

    const formatted = rows.map((row) => ({
      id: row.txn_id,
      type: row.type,
      asset: row.asset,
      amountDisplay: `${row.amount >= 0 ? '+' : '-'}$${Math.abs(row.amount).toLocaleString()}`,
      amount: row.amount,
      time: formatRelativeTime(row.created_at),
      status: row.status
    }));

    return res.json(formatted);
  });
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

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
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
  console.log('✓ Login: admin@agua.neon / AguaNeon2026!');
  console.log('✓ Data persists in SQLite at:', DB_PATH);
});

process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database closed.');
    process.exit(0);
  });
});
