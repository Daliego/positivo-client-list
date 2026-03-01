/**
 * Retorna uma página HTML completa com tema escuro que lista os clientes cadastrados.
 * Faz fetch na API REST /clients a cada 60 segundos para manter a tabela atualizada.
 * Permite cadastrar novos clientes via Modal.
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

    .header-section {
      width: 100%;
      max-width: 960px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
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
    }

    .btn-primary {
      background: #6366f1;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary:hover { background: #4f46e5; transform: translateY(-1px); }
    .btn-primary:active { transform: translateY(0); }

    .status-bar {
      width: 100%;
      max-width: 960px;
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

    .empty-msg { text-align: center; padding: 3rem; color: #52525b; font-size: 0.9rem; }
    .error-msg { text-align: center; padding: 2rem; color: #f87171; font-size: 0.85rem; }
    .countdown { font-variant-numeric: tabular-nums; color: #52525b; }

    /* Modal Styles */
    #modalBackdrop {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 100;
    }

    .modal {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      width: 100%;
      max-width: 450px;
      padding: 2rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }

    .modal-header { margin-bottom: 1.5rem; }
    .modal-title { font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.5rem; }
    .modal-subtitle { font-size: 0.875rem; color: #71717a; }

    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-size: 0.75rem; font-weight: 600; color: #a1a1aa; text-transform: uppercase; margin-bottom: 0.5rem; }
    .form-group input {
      width: 100%;
      background: #0f0f13;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 0.75rem;
      color: white;
      font-family: inherit;
      transition: border-color 0.2s;
    }
    .form-group input:focus { outline: none; border-color: #6366f1; }

    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem; }
    .btn-secondary {
      background: transparent;
      color: #71717a;
      border: 1px solid #27272a;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-secondary:hover { background: #27272a; color: white; }

    #formError {
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.8rem;
      margin-bottom: 1.25rem;
      display: none;
      border-left: 3px solid #ef4444;
    }

    @media (max-width: 640px) {
      th, td { padding: 0.625rem 0.75rem; font-size: 0.8rem; }
      .header-section { flex-direction: column; align-items: flex-start; gap: 1rem; }
    }
  </style>
</head>
<body>

  <div class="header-section">
    <div>
      <h1>Clientes Cadastrados</h1>
      <p class="subtitle">Atualização automática a cada 60 segundos</p>
    </div>
    <button class="btn-primary" onclick="openModal()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Novo Cliente
    </button>
  </div>

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

  <!-- Modal Backdrop -->
  <div id="modalBackdrop" onclick="if(event.target === this) closeModal()">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Cadastrar Cliente</h2>
        <p class="modal-subtitle">Preencha os dados abaixo para adicionar um novo cliente.</p>
      </div>

      <div id="formError"></div>

      <form id="createClientForm">
        <div class="form-group">
          <label>Nome Completo</label>
          <input type="text" id="name" name="name" placeholder="Ex: Maria Silva" required />
        </div>
        <div class="form-group">
          <label>Endereço de E-mail</label>
          <input type="email" id="email" name="email" placeholder="Ex: maria@empresa.com" required />
        </div>
        <div class="form-group">
          <label>Documento (CPF ou CNPJ)</label>
          <input type="text" id="document" name="document" placeholder="Apenas números (11 ou 14 dígitos)" required maxlength="14" />
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="btn-primary" id="btnSubmit">Salvar Cliente</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const tbody = document.getElementById('clientsBody');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const countdownEl = document.getElementById('countdown');
    const modal = document.getElementById('modalBackdrop');
    const form = document.getElementById('createClientForm');
    const formError = document.getElementById('formError');
    const btnSubmit = document.getElementById('btnSubmit');

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

    function openModal() {
      modal.style.display = 'flex';
      formError.style.display = 'none';
      form.reset();
      document.getElementById('name').focus();
    }

    function closeModal() {
      modal.style.display = 'none';
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Enviando...';
      formError.style.display = 'none';

      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        document: document.getElementById('document').value,
      };

      try {
        const res = await fetch('/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (res.status === 201) {
          closeModal();
          fetchClients(); // Atualiza a lista
        } else {
          showError(data.message || 'Erro ao cadastrar cliente');
        }
      } catch (err) {
        showError('Erro de conexão com o servidor');
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Salvar Cliente';
      }
    };

    function showError(msg) {
      formError.textContent = Array.isArray(msg) ? msg.join(', ') : msg;
      formError.style.display = 'block';
    }

    function startCountdown() {
      secondsLeft = 60;
      countdownEl.textContent = '(próx. em 60s)';
    }

    // Fetch inicial
    fetchClients().then(startCountdown);

    // Refresh a cada 60 segundos
    setInterval(function() {
      fetchClients().then(startCountdown);
    }, 60000);

    // Contador visual
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
