const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');

const {
  adicionarJogador,
  removerJogador,
  verLista,
  gerarMensagem,
  resetarLista,
  listaAberta,
  abrirLista,
  fecharLista
} = require('./jogadores');

// ─── CONFIG ─────────────────────────────────────────────
const NOME_DO_GRUPO = 'FUTEBOL KM6 TESTE';
// ────────────────────────────────────────────────────────

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  }
});

// ─── QR CODE ────────────────────────────────────────────
client.on('qr', (qr) => {
  console.log('\n📱 Escaneie o QR Code:\n');
  qrcode.generate(qr, { small: true });
});

// ─── READY ──────────────────────────────────────────────
client.on('ready', async () => {
  console.log('✅ Bot conectado!');

  const chats = await client.getChats();
  const grupos = chats.filter(c => c.isGroup);

  console.log('📋 GRUPOS:');
  grupos.forEach((g, i) => console.log(`${i + 1}. "${g.name}"`));

  const grupo = await buscarGrupo();
  if (grupo) {
    await grupo.sendMessage('🚀 Bot conectado e pronto!');
  }
});

// ─── BUSCAR GRUPO ───────────────────────────────────────
async function buscarGrupo() {
  const chats = await client.getChats();
  const grupos = chats.filter(c => c.isGroup);

  return grupos.find(g => g.name.trim() === NOME_DO_GRUPO.trim());
}

// ─── FUNÇÃO PARA PROCESSAR VÁRIOS NOMES ─────────────────
function processarNomes(texto, tipo) {
  const nomesTexto = texto.trim();

  const nomes = nomesTexto
    .split(/,|\n/) // separa por vírgula ou quebra de linha
    .map(n => n.trim())
    .filter(n => n.length > 0);

  let respostas = [];

  for (const nome of nomes) {
    const resultado = adicionarJogador(tipo, nome);
    respostas.push(resultado);
  }

  return respostas.join('\n');
}

// ─── CRON SEGUNDA ───────────────────────────────────────
cron.schedule('0 19 * * 1', async () => {
  const grupo = await buscarGrupo();
  if (!grupo) return;

  resetarLista();
  abrirLista();

  await grupo.sendMessage('⚽ Lista aberta!');
}, { timezone: 'America/Sao_Paulo' });

// ─── CRON QUARTA ────────────────────────────────────────
cron.schedule('0 16 * * 3', async () => {
  const grupo = await buscarGrupo();
  if (!grupo) return;

  fecharLista();
  await grupo.sendMessage(gerarMensagem());
}, { timezone: 'America/Sao_Paulo' });

// ─── MENSAGENS ──────────────────────────────────────────
client.on('message_create', async (msg) => {
  console.log('📩', msg.body);

  const chat = await msg.getChat();

  if (!chat.isGroup) return;
  if (chat.name.trim() !== NOME_DO_GRUPO.trim()) return;

  const texto = msg.body.toLowerCase().trim();

  try {

    // ── ABRIR ──
    if (texto === '!abrir') {
      resetarLista();
      abrirLista();
      return chat.sendMessage('🟢 Lista aberta!');
    }

    // ── LISTA ──
    if (texto === '!lista') {
      return msg.reply(verLista());
    }

    // ── SORTEAR ──
    if (texto === '!sortear') {
      fecharLista();
      return chat.sendMessage(gerarMensagem());
    }

    // ── GOLEIRO (MULTI) ──
    if (texto.startsWith('goleiro ')) {
      const nomes = msg.body.slice(8);
      return msg.reply(processarNomes(nomes, 'goleiro'));
    }

    // ── LINHA (MULTI) ──
    if (texto.startsWith('linha ')) {
      const nomes = msg.body.slice(6);
      return msg.reply(processarNomes(nomes, 'linha'));
    }

    // ── RESERVA (MULTI) ──
    if (texto.startsWith('reserva ')) {
      const nomes = msg.body.slice(8);
      return msg.reply(processarNomes(nomes, 'reserva'));
    }

    // ── REMOVER ──
    if (texto.startsWith('remover ')) {
      const nome = msg.body.slice(8).trim();
      return msg.reply(removerJogador(nome));
    }

    // ── TESTE COMPLETO ──
    if (texto === '!testar') {
      await msg.reply('🧪 Teste iniciado...');

      resetarLista();
      abrirLista();

      processarNomes('Goleiro1, Goleiro2', 'goleiro');
      processarNomes(
        'Jogador1, Jogador2, Jogador3, Jogador4, Jogador5, Jogador6, Jogador7, Jogador8',
        'linha'
      );
      processarNomes('Reserva1, Reserva2', 'reserva');

      await chat.sendMessage(verLista());

      fecharLista();
      return chat.sendMessage(gerarMensagem());
    }

    // ── TESTE SIMPLES ──
    if (texto === '!teste') {
      return chat.sendMessage('✅ Bot funcionando!');
    }

  } catch (err) {
    console.log('❌ Erro:', err);
  }
});

// ─── START ─────────────────────────────────────────────
client.initialize();