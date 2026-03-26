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

const NOME_DO_GRUPO = 'FUTEBOL KM6 TESTE';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  }
});

client.on('qr', (qr) => {
  console.log('\n📱 Escaneie o QR Code:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('✅ Bot conectado!');
  const grupo = await buscarGrupo();
  if (grupo) {
    console.log(`✅ Grupo encontrado: ${grupo.name}`);
    await grupo.sendMessage('🚀 Bot conectado e pronto!');
  } else {
    console.log('⚠️ Grupo não encontrado. Verifique o nome em NOME_DO_GRUPO.');
  }
});

async function buscarGrupo() {
  const chats = await client.getChats();
  const grupos = chats.filter(c => {
    try { return c.isGroup; } catch (e) { return false; }
  });
  return grupos.find(g => g.name.trim() === NOME_DO_GRUPO.trim());
}

function processarNomes(texto, tipo) {
  const nomes = texto.trim()
    .split(/,|\n/)
    .map(n => n.trim())
    .filter(n => n.length > 0);

  return nomes.map(nome => adicionarJogador(tipo, nome)).join('\n');
}

cron.schedule('0 19 * * 1', async () => {
  const grupo = await buscarGrupo();
  if (!grupo) return;
  resetarLista();
  abrirLista();
  await grupo.sendMessage('⚽ Lista aberta!');
}, { timezone: 'America/Sao_Paulo' });

cron.schedule('0 16 * * 3', async () => {
  const grupo = await buscarGrupo();
  if (!grupo) return;
  fecharLista();
  await grupo.sendMessage(gerarMensagem());
}, { timezone: 'America/Sao_Paulo' });

client.on('message_create', async (msg) => {
  const chat = await msg.getChat();
  if (!chat.isGroup) return;
  if (chat.name.trim() !== NOME_DO_GRUPO.trim()) return;

  const texto = msg.body.toLowerCase().trim();

  try {
    if (texto === '!abrir') {
      resetarLista();
      abrirLista();
      return chat.sendMessage('🟢 Lista aberta!');
    }

    if (texto === '!lista') {
      return msg.reply(verLista());
    }

    if (texto === '!sortear') {
      fecharLista();
      return chat.sendMessage(gerarMensagem());
    }

    if (texto.startsWith('goleiro ')) {
      return msg.reply(processarNomes(msg.body.slice(8), 'goleiro'));
    }

    if (texto.startsWith('linha ')) {
      return msg.reply(processarNomes(msg.body.slice(6), 'linha'));
    }

    if (texto.startsWith('reserva ')) {
      return msg.reply(processarNomes(msg.body.slice(8), 'reserva'));
    }

    if (texto.startsWith('remover ')) {
      return msg.reply(removerJogador(msg.body.slice(8).trim()));
    }

    if (texto === '!testar') {
      await msg.reply('🧪 Teste iniciado...');
      resetarLista();
      abrirLista();
      processarNomes('Goleiro1, Goleiro2', 'goleiro');
      processarNomes('Jogador1, Jogador2, Jogador3, Jogador4, Jogador5, Jogador6, Jogador7, Jogador8', 'linha');
      processarNomes('Reserva1, Reserva2', 'reserva');
      await chat.sendMessage(verLista());
      fecharLista();
      return chat.sendMessage(gerarMensagem());
    }

    if (texto === '!teste') {
      return chat.sendMessage('✅ Bot funcionando!');
    }

  } catch (err) {
    console.log('❌ Erro:', err);
  }
});

client.initialize();
