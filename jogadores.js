// jogadores.js - Gerencia a lista de jogadores e sorteia os times

const fs = require('fs');
const ARQUIVO = './lista.json';

// ─── ESTADO DA LISTA ─────────────────────────────────────────────
// Controla se as inscrições estão abertas ou fechadas
let _listaAberta = false;

function listaAberta() { return _listaAberta; }
function abrirLista() { _listaAberta = true; }
function fecharLista() { _listaAberta = false; }

// ─── ESTRUTURA DA LISTA ──────────────────────────────────────────
function carregarLista() {
  if (!fs.existsSync(ARQUIVO)) {
    return { goleiros: [], linha: [], reservas: [] };
  }
  return JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));
}

function salvarLista(lista) {
  fs.writeFileSync(ARQUIVO, JSON.stringify(lista, null, 2), 'utf8');
}

function resetarLista() {
  salvarLista({ goleiros: [], linha: [], reservas: [] });
}

// ─── ADICIONAR JOGADOR ───────────────────────────────────────────
function adicionarJogador(posicao, nome) {
  if (!_listaAberta) {
    return '⛔ As inscrições estão *fechadas* no momento.\nAguarde a abertura na próxima segunda às 19h!';
  }

  nome = nome.trim();
  if (!nome || nome.length < 2) return '❌ Nome inválido. Tente novamente.';

  const lista = carregarLista();
  const todos = [...lista.goleiros, ...lista.linha, ...lista.reservas];

  // Evita duplicata
  if (todos.map(n => n.toLowerCase()).includes(nome.toLowerCase())) {
    return `⚠️ *${nome}* já está na lista!`;
  }

  // Total de 12 jogadores
  if (todos.length >= 12) {
    return '⛔ A lista já está *completa* com 12 jogadores!';
  }

  const chave = posicao === 'goleiro' ? 'goleiros' : posicao === 'linha' ? 'linha' : 'reservas';
  const limites = { goleiros: 2, linha: 8, reservas: 2 };
  const labels  = { goleiros: 'goleiros', linha: 'jogadores de linha', reservas: 'reservas' };

  if (lista[chave].length >= limites[chave]) {
    return `⛔ Já temos ${limites[chave]} ${labels[chave]}. Vaga esgotada nessa posição!`;
  }

  lista[chave].push(nome);
  salvarLista(lista);

  const emojis  = { goleiros: '🧤', linha: '⚽', reservas: '🔄' };
  const total   = lista.goleiros.length + lista.linha.length + lista.reservas.length;
  const posInfo = `${lista[chave].length}/${limites[chave]}`;

  return `${emojis[chave]} *${nome}* confirmado como ${posicao}! (${posInfo})\n👥 Total na lista: ${total}/12`;
}

// ─── REMOVER JOGADOR ─────────────────────────────────────────────
function removerJogador(nome) {
  nome = nome.trim();
  const lista = carregarLista();
  let removido = false;
  let posicao = '';

  ['goleiros', 'linha', 'reservas'].forEach(chave => {
    const idx = lista[chave].map(n => n.toLowerCase()).indexOf(nome.toLowerCase());
    if (idx !== -1) {
      lista[chave].splice(idx, 1);
      removido = true;
      posicao = chave;
    }
  });

  if (!removido) return `⚠️ *${nome}* não encontrado na lista.`;
  salvarLista(lista);

  const total = lista.goleiros.length + lista.linha.length + lista.reservas.length;
  return `✅ *${nome}* removido da lista.\n👥 Total na lista: ${total}/12`;
}

// ─── VER LISTA ATUAL ─────────────────────────────────────────────
function verLista() {
  const lista = carregarLista();
  const total = lista.goleiros.length + lista.linha.length + lista.reservas.length;
  const status = _listaAberta ? '🟢 ABERTA' : '🔴 FECHADA';

  let msg = `📋 *FUTEBOL KM6 QUARTA - LISTA ${status}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;

  msg += `\n🧤 *Goleiros (${lista.goleiros.length}/2):*\n`;
  if (lista.goleiros.length === 0) msg += `  _nenhum ainda_\n`;
  else lista.goleiros.forEach((n, i) => msg += `  ${i + 1}. ${n}\n`);

  msg += `\n⚽ *Linha (${lista.linha.length}/8):*\n`;
  if (lista.linha.length === 0) msg += `  _nenhum ainda_\n`;
  else lista.linha.forEach((n, i) => msg += `  ${i + 1}. ${n}\n`);

  msg += `\n🔄 *Reservas (${lista.reservas.length}/2):*\n`;
  if (lista.reservas.length === 0) msg += `  _nenhum ainda_\n`;
  else lista.reservas.forEach((n, i) => msg += `  ${i + 1}. ${n}\n`);

  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👥 *Total: ${total}/12*`;

  if (_listaAberta) {
    const faltam = 12 - total;
    if (faltam > 0) msg += `\n⏳ Faltam ${faltam} jogador(es)!`;
    else msg += `\n✅ Lista completa!`;
  }

  return msg;
}

// ─── SORTEAR TIMES E GERAR MENSAGEM ─────────────────────────────
function gerarMensagem() {
  const lista = carregarLista();
  const total = lista.goleiros.length + lista.linha.length + lista.reservas.length;

  // Validações
  if (lista.goleiros.length < 2) {
    return `⚠️ Precisamos de 2 goleiros para sortear! Temos apenas ${lista.goleiros.length}.`;
  }
  if (lista.linha.length < 8) {
    return `⚠️ Precisamos de 8 jogadores de linha! Temos apenas ${lista.linha.length}.`;
  }
  if (lista.reservas.length < 2) {
    return `⚠️ Precisamos de 2 reservas! Temos apenas ${lista.reservas.length}.`;
  }

  // Embaralha goleiros e linha
  const goleiros = embaralhar([...lista.goleiros]);
  const linha    = embaralhar([...lista.linha]);
  const reservas = [...lista.reservas];

  // Monta os times
  const timeRoxo = {
    goleiro: goleiros[0],
    linha:   linha.slice(0, 4),
    reserva: reservas[0],
  };
  const timeLaranja = {
    goleiro: goleiros[1],
    linha:   linha.slice(4, 8),
    reserva: reservas[1],
  };

  // Monta a mensagem final
  let msg = `⚽ *FUTEBOL KM6 QUARTA* ⚽\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `🟣 *TIME ROXO*\n`;
  msg += `🧤 ${timeRoxo.goleiro}\n`;
  timeRoxo.linha.forEach((j, i) => msg += `${i + 1}. ${j}\n`);
  msg += `🔄 Reserva: ${timeRoxo.reserva}\n\n`;

  msg += `🟠 *TIME LARANJA*\n`;
  msg += `🧤 ${timeLaranja.goleiro}\n`;
  timeLaranja.linha.forEach((j, i) => msg += `${i + 1}. ${j}\n`);
  msg += `🔄 Reserva: ${timeLaranja.reserva}\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📍 Quarta-feira · KM6\n`;
  msg += `⏰ Confirmem presença! 🙌`;

  // Zera a lista após sortear
  resetarLista();
  fecharLista();

  return msg;
}

// ─── UTILITÁRIO: EMBARALHAR ARRAY ────────────────────────────────
function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = {
  adicionarJogador,
  removerJogador,
  verLista,
  gerarMensagem,
  resetarLista,
  listaAberta,
  abrirLista,
  fecharLista,
};
