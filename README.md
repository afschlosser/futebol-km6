# ⚽ Bot WhatsApp - Futebol KM6

Bot que gerencia automaticamente as inscrições e o sorteio de times no grupo do WhatsApp.

---

## 📅 Fluxo semanal

| Dia/Hora | Ação |
|---|---|
| **Segunda às 19h** | Bot abre as inscrições e avisa o grupo |
| **Seg → Qua** | Membros enviam seus nomes pelo grupo |
| **Quarta às 16h** | Bot fecha inscrições, sorteia e envia os times |

---

## 📁 Estrutura de arquivos

```
futebol-km6/
├── bot.js          # Lógica principal e agendamentos
├── jogadores.js    # Gerencia lista e sorteia times
├── package.json    # Dependências
├── lista.json      # Gerado automaticamente
└── README.md
```

---

## 🖥️ Instalação no VPS (Ubuntu/Debian)

### 1. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Instalar dependências do Puppeteer
```bash
sudo apt-get install -y \
  chromium-browser libgbm-dev libasound2 \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 \
  libgbm1 libnss3 libxss1
```

### 3. Enviar os arquivos para o VPS
```bash
mkdir ~/futebol-km6
cd ~/futebol-km6
# Copie bot.js, jogadores.js e package.json para esta pasta
```

### 4. Instalar dependências Node
```bash
npm install
```

### 5. Configurar o nome do grupo
No `bot.js`, linha 8:
```js
const NOME_DO_GRUPO = 'FUTEBOL KM6'; // nome exato do seu grupo
```

### 6. Primeira execução (escanear QR Code)
```bash
node bot.js
```
Escaneie o QR Code com o WhatsApp que será o bot.

---

## 🔄 Rodar 24/7 com PM2

```bash
npm install -g pm2
pm2 start bot.js --name futebol-km6
pm2 save
pm2 startup
```

### Comandos úteis
```bash
pm2 status                  # Ver status
pm2 logs futebol-km6        # Ver logs em tempo real
pm2 restart futebol-km6     # Reiniciar
pm2 stop futebol-km6        # Parar
```

---

## 💬 Comandos no grupo

| Mensagem | Resultado |
|---|---|
| `goleiro SeuNome` | Inscreve como goleiro (2 vagas) |
| `linha SeuNome` | Inscreve como jogador de linha (8 vagas) |
| `reserva SeuNome` | Inscreve como reserva (2 vagas) |
| `remover SeuNome` | Remove da lista |
| `!lista` | Mostra quem já está inscrito |
| `!sortear` | Sorteia os times na hora |
| `!ajuda` | Mostra os comandos disponíveis |

> ⚠️ Inscrições só funcionam entre segunda 19h e quarta 16h.

---

## 📋 Exemplos de mensagens

### Abertura (segunda 19h)
```
⚽ FUTEBOL KM6 QUARTA ⚽
━━━━━━━━━━━━━━━━━━━━━━

📋 As inscrições estão ABERTAS!

Mande sua posição aqui no grupo:

🧤 goleiro SeuNome → (2 vagas)
⚽ linha SeuNome → (8 vagas)
🔄 reserva SeuNome → (2 vagas)

Digite !lista para ver quem já confirmou.

⏳ Inscrições encerram na quarta às 16h.
━━━━━━━━━━━━━━━━━━━━━━
```

### Sorteio (quarta 16h)
```
⚽ FUTEBOL KM6 QUARTA ⚽
━━━━━━━━━━━━━━━━━━━━━━

🟣 TIME ROXO
🧤 Anderson
1. Pedro
2. Lucas
3. Mateus
4. Rafael
🔄 Reserva: Bruno

🟠 TIME LARANJA
🧤 Carlos
1. Diego
2. Thiago
3. Felipe
4. Gustavo
🔄 Reserva: João

━━━━━━━━━━━━━━━━━━━━━━
📍 Quarta-feira · KM6
⏰ Confirmem presença! 🙌
```
