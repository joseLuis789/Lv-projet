const renderStats = (data) => {
  const statsGrid = document.getElementById('stats-grid');

  const cards = [
    { label: 'Balance total', value: `$${data.balance.toLocaleString()}`, trend: '+12.8%' },
    { label: 'Reserva', value: `$${data.reserve.toLocaleString()}`, trend: '+4.2%' },
    { label: 'Cuentas activas', value: data.activeAccounts, trend: '+3' },
    { label: 'Cash Flow', value: `$${data.cashFlow.toLocaleString()}`, trend: '+8.1%' }
  ];

  statsGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="stat-card">
          <span class="stat-label">${card.label}</span>
          <div class="stat-value">
            <div class="value-number">${card.value}</div>
            <span class="value-trend">${card.trend}</span>
          </div>
        </article>
      `
    )
    .join('');
};

const renderPortfolio = (items) => {
  const list = document.getElementById('portfolio-list');
  list.innerHTML = items
    .map(
      (item) => `
        <div class="asset-item">
          <div class="asset-meta">
            <span class="asset-name">${item.name}</span>
            <span class="asset-sub">${item.amount.toLocaleString()} unidades</span>
          </div>
          <div class="asset-value">
            <div>${item.value.toLocaleString('es-AR', { style: 'currency', currency: 'USD' })}</div>
            <span class="${item.change >= 0 ? 'value-positive' : 'value-negative'}">${item.change >= 0 ? '+' : ''}${item.change}%</span>
          </div>
        </div>
      `
    )
    .join('');
};

const renderMarkets = (items) => {
  const list = document.getElementById('markets-list');
  list.innerHTML = items
    .map(
      (item) => `
        <div class="market-item">
          <div class="market-meta">
            <span class="market-symbol">${item.symbol}</span>
            <span class="market-sub">Vol. ${item.volume}</span>
          </div>
          <div class="asset-value">
            <div class="market-price">$${item.price}</div>
            <span class="${item.change >= 0 ? 'value-positive' : 'value-negative'}">${item.change >= 0 ? '+' : ''}${item.change}%</span>
          </div>
        </div>
      `
    )
    .join('');
};

const renderTransactions = (items) => {
  const list = document.getElementById('transactions-list');
  list.innerHTML = items
    .map(
      (item) => `
        <div class="transaction-item">
          <div class="transaction-meta">
            <span class="transaction-name">${item.type}</span>
            <span class="transaction-sub">${item.asset} · ${item.id}</span>
          </div>
          <div class="asset-value">
            <div>${item.amount}</div>
            <span class="transaction-sub">${item.time}</span>
          </div>
        </div>
      `
    )
    .join('');
};

const loadDashboard = async () => {
  try {
    const overviewRes = await fetch('/api/overview');
    const portfolioRes = await fetch('/api/portfolio');
    const marketsRes = await fetch('/api/markets');
    const transactionsRes = await fetch('/api/transactions');

    const overview = await overviewRes.json();
    const portfolio = await portfolioRes.json();
    const markets = await marketsRes.json();
    const transactions = await transactionsRes.json();

    renderStats(overview);
    renderPortfolio(portfolio);
    renderMarkets(markets);
    renderTransactions(transactions);
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    document.getElementById('stats-grid').innerHTML = '<div class="stat-card">No se pudo cargar la información.</div>';
  }
};

loadDashboard();
