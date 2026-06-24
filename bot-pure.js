const https = require('https');

// ============================================================
// CONFIGURATION
// ============================================================

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8814550180:AAEQYkIp62gRckGkdK0WF9-yFteZ2SLEb7U';
const POLL_INTERVAL = 1000;

// Define your buttons here. Each row is an array of button labels.
// To ADD a button: add a string to an existing row, or add a new row.
// To REMOVE a button: delete it from the array.
// To CHANGE a button: edit the label string and update BUTTON_COMMANDS below.
const KEYBOARD_BUTTONS = [
  ['📝 Post Ad to Web', 'Post to Group – $1'],
  ['📞 Contact Support', '💰 Claim $25']
];

// Map button labels to the commands they trigger.
const BUTTON_COMMANDS = {
  '📝 Post Ad to Web':   '/postad',
  'Post to Group – $1':  '/postgroup',
  '📞 Contact Support':  '/support',
  '💰 Claim $25':        '/claim'
};

// Command responses — what the bot says when a command is triggered.
const COMMAND_RESPONSES = {
  '/postad':     '📝 Post Ad to Web — coming soon! Use this to post your ad to the website.',
  '/postgroup':  '💰 Post to Group — $1 per post. Send your ad content to proceed.',
  '/support':    '📞 Contact Support — reach out to our team for help. We\'ll get back to you shortly!',
  '/claim':      '💰 Claim $25 — follow the instructions to claim your reward!'
};

// ============================================================
// TELEGRAM API (pure HTTPS, no libraries)
// ============================================================

function callApi(method, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', (chunk) => { chunks += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(chunks));
        } catch (e) {
          reject(new Error('Failed to parse response: ' + chunks));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sendMessage(chatId, text) {
  return callApi('sendMessage', {
    chat_id: chatId,
    text: text,
    reply_markup: {
      keyboard: KEYBOARD_BUTTONS,
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
}

// ============================================================
// UPDATE HANDLING
// ============================================================

const shownKeyboardTo = new Set();

function userKey(chatId, userId) {
  return chatId + ':' + userId;
}

function handleUpdate(update) {
  const msg = update.message;
  if (!msg) return;

  const chatId = msg.chat.id;

  // New member joined — auto-show keyboard
  if (msg.new_chat_members && msg.new_chat_members.length > 0) {
    msg.new_chat_members.forEach((m) => shownKeyboardTo.add(userKey(chatId, m.id)));
    sendMessage(chatId, '🚀 Welcome! Use the buttons below to get started.');
    return;
  }

  if (!msg.text || !msg.from) return;

  const text = msg.text.trim();
  const key = userKey(chatId, msg.from.id);

  // /start or /menu
  if (text === '/start' || text === '/menu' || text.startsWith('/start@') || text.startsWith('/menu@')) {
    shownKeyboardTo.add(key);
    sendMessage(chatId, '🚀 Let\'s grow your reach together! 🚀\nUse the buttons below to get started.');
    return;
  }

  // Direct command (typed manually)
  if (COMMAND_RESPONSES[text]) {
    sendMessage(chatId, COMMAND_RESPONSES[text]);
    return;
  }

  // Button tap — map label to command
  if (BUTTON_COMMANDS[text]) {
    const cmd = BUTTON_COMMANDS[text];
    sendMessage(chatId, COMMAND_RESPONSES[cmd] || 'Command received.');
    return;
  }

  // First message from a user who hasn't seen the keyboard — auto-show it
  if (!shownKeyboardTo.has(key)) {
    shownKeyboardTo.add(key);
    sendMessage(chatId, '🚀 Use the buttons below!');
    return;
  }
}

// ============================================================
// LONG POLLING (no libraries)
// ============================================================

let offset = 0;

async function poll() {
  try {
    const result = await callApi('getUpdates', {
      offset: offset,
      timeout: 30,
      allowed_updates: ['message']
    });

    if (result.ok && result.result.length > 0) {
      for (const update of result.result) {
        offset = update.update_id + 1;
        try {
          handleUpdate(update);
        } catch (e) {
          console.error('Error handling update:', e.message);
        }
      }
    }
  } catch (e) {
    console.error('Polling error:', e.message);
    await new Promise((r) => setTimeout(r, 3000));
  }

  setTimeout(poll, POLL_INTERVAL);
}

console.log('Bot is running (pure Node.js, no dependencies)!');
poll();
