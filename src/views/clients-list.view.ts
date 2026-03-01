/**
 * Retorna uma página HTML completa com tema escuro que lista os clientes cadastrados.
 * Faz fetch na API REST /clients a cada 60 segundos para manter a tabela atualizada.
 */
export function clientsListView(): string {
  return /* html */ `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Clientes Cadastrados</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', sans-serif;
      background: #0f0f13;
      color: #e4e4e7;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      background: linear-gradient(135deg, #818cf8, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      color: #71717a;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }

    .status-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.8rem;
      color: #71717a;
    }

    .status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulse 2s infinite;
    }

    .status-dot.error { background: #ef4444; animation: none; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .table-wrapper {
      width: 100%;
      max-width: 960px;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead { background: #1e1e24; }

    th {
      text-align: left;
      padding: 0.875rem 1.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #a1a1aa;
      border-bottom: 1px solid #27272a;
    }

    td {
      padding: 0.875rem 1.25rem;
      font-size: 0.875rem;
      border-bottom: 1px solid #1f1f23;
    }

    tr:last-child td { border-bottom: none; }

    tr:hover td { background: #1c1c22; }

    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge-cpf  { background: #1e3a5f; color: #60a5fa; }
    .badge-cnpj { background: #3b1f4e; color: #c084fc; }

    .empty-msg {
      text-align: center;
      padding: 3rem;
      color: #52525b;
      font-size: 0.9rem;
    }

    .error-msg {
      text-align: center;
      padding: 2rem;
      color: #f87171;
      font-size: 0.85rem;
    }

    .countdown {
      font-variant-numeric: tabular-nums;
      color: #52525b;
    }

    @media (max-width: 640px) {
      th, td { padding: 0.625rem 0.75rem; font-size: 0.8rem; }
    }
  </style>
</head>
<body>
  <h1>Clientes Cadastrados</h1>
  <p class="subtitle">Atualização automática a cada 60 segundos</p>

  <div class="status-bar">
    <span id="statusDot" class="status-dot"></span>
    <span id="statusText">Carregando...</span>
    <span class="countdown" id="countdown"></span>
  </div>

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Documento</th>
          <th>Criado em</th>
        </tr>
      </thead>
      <tbody id="clientsBody">
        <tr><td colspan="4" class="empty-msg">Carregando...</td></tr>
      </tbody>
    </table>
  </div>

  <script>
    const tbody = document.getElementById('clientsBody');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const countdownEl = document.getElementById('countdown');
    let secondsLeft = 0;

    function formatDoc(doc) {
      if (doc.length === 11) {
        return doc.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
      }
      if (doc.length === 14) {
        return doc.replace(/(\\d{2})(\\d{3})(\\d{3})(\\d{4})(\\d{2})/, '$1.$2.$3/$4-$5');
      }
      return doc;
    }

    function formatDate(dateStr) {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    function docBadge(doc) {
      const type = doc.length === 11 ? 'cpf' : 'cnpj';
      const label = type.toUpperCase();
      return '<span class="badge badge-' + type + '">' + label + '</span> ' + formatDoc(doc);
    }

    async function fetchClients() {
      try {
        const res = await fetch('/clients');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const clients = await res.json();

        statusDot.className = 'status-dot';
        statusText.textContent = clients.length + ' cliente(s) encontrado(s)';

        if (clients.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" class="empty-msg">Nenhum cliente cadastrado</td></tr>';
          return;
        }

        tbody.innerHTML = clients.map(function(c) {
          return '<tr>'
            + '<td>' + (c.name || '—') + '</td>'
            + '<td>' + (c.email || '—') + '</td>'
            + '<td>' + (c.document ? docBadge(c.document) : '—') + '</td>'
            + '<td>' + formatDate(c.created_at) + '</td>'
            + '</tr>';
        }).join('');

      } catch (err) {
        statusDot.className = 'status-dot error';
        statusText.textContent = 'Erro ao carregar: ' + err.message;
        tbody.innerHTML = '<tr><td colspan="4" class="error-msg">Falha ao buscar dados. Tentando novamente em breve...</td></tr>';
      }
    }

    function startCountdown() {
      secondsLeft = 60;
      countdownEl.textContent = '(próx. em 60s)';
    }

    // Fetch inicial
    fetchClients().then(startCountdown);

    // Retry a cada 60 segundos
    setInterval(function() {
      fetchClients().then(startCountdown);
    }, 60000);

    // Atualiza contador visual
    setInterval(function() {
      if (secondsLeft > 0) {
        secondsLeft--;
        countdownEl.textContent = '(próx. em ' + secondsLeft + 's)';
      }
    }, 1000);
  </script>
</body>
</html>`;
}
