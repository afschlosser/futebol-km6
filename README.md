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

## 🖥️ Instalação

### 1. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Instalar dependências Node
```bash
npm install
```

### 3. Configurar o nome do grupo
No `bot.js`, linha 8:
```js
const NOME_DO_GRUPO = 'FUTEBOL KM6'; // nome exato do seu grupo
```

### 4. Primeira execução (escanear QR Code)
```bash
node bot.js
```
Escaneie o QR Code com o WhatsApp que será o bot.

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