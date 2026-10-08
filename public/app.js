<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agua Neon</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">A</div>
          <div>
            <p class="eyebrow">Ecosistema</p>
            <h1>Agua Neon</h1>
          </div>
        </div>

        <nav class="nav">
          <a class="nav-item active" href="#overview">Overview</a>
          <a class="nav-item" href="#portfolio">Portfolio</a>
          <a class="nav-item" href="#markets">Markets</a>
          <a class="nav-item" href="#transactions">Transactions</a>
          <a class="nav-item" href="#wallet">Wallet</a>
          <a class="nav-item" href="#security">Security</a>
        </nav>

        <div class="panel mini-panel">
          <p class="label">Sesión</p>
          <div id="userInfo" class="user-info"></div>
          <button id="logoutBtn" class="text-btn logout-btn">Cerrar sesión</button>
        </div>
      </aside>

      <main class="main-panel">
        <header class="topbar">
          <div>
            <p class="eyebrow muted">Panel financiero</p>
            <h2>Dashboard</h2>
          </div>
          <div class="top-actions">
            <button class="ghost-btn">Export</button>
            <button class="primary-btn">+ Nuevo movimiento</button>
          </div>
        </header>

        <section class="stats-grid" id="stats-grid"></section>

        <section class="content-grid">
          <div class="panel large-panel">
            <div class="panel-header">
              <h3>Portfolio</h3>
              <span class="pill neutral">4 activos</span>
            </div>
            <div id="portfolio-list" class="asset-list"></div>
          </div>

          <div class="panel large-panel">
            <div class="panel-header">
              <h3>Mercado</h3>
              <span class="pill positive">Live</span>
            </div>
            <div id="markets-list" class="market-list"></div>
          </div>
        </section>

        <section class="content-grid secondary-grid">
          <div class="panel">
            <div class="panel-header">
              <h3>Transacciones</h3>
              <button class="text-btn">Ver todo</button>
            </div>
            <div id="transactions-list" class="transaction-list"></div>
          </div>

          <div class="panel wallet-panel">
            <div class="panel-header">
              <h3>Billetera</h3>
              <span id="wallet-status" class="pill neutral">Cargando</span>
            </div>
            <div id="wallet-card" class="wallet-card"></div>
            <div class="wallet-actions">
              <input id="walletAmount" type="number" min="10" step="10" value="100" class="wallet-input" />
              <button id="topUpBtn" class="primary-btn wallet-btn">Recargar</button>
            </div>
          </div>
        </section>

        <section class="content-grid secondary-grid">
          <div class="panel" style="grid-column: 1 / -1;">
            <div class="panel-header">
              <h3>Ingresos Q2</h3>
              <span class="pill positive">+12.4%</span>
            </div>
            <div class="chart-bars" aria-label="Gráfico de ingresos">
              <span style="height: 28%"></span>
              <span style="height: 42%"></span>
              <span style="height: 34%"></span>
              <span style="height: 50%"></span>
              <span style="height: 62%"></span>
              <span style="height: 72%"></span>
              <span style="height: 90%"></span>
            </div>
            <div class="chart-labels">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
        </section>
      </main>
    </div>

    <script src="/app.js"></script>
  </body>
</html>
