const TelegramBot = require('node-telegram-bot-api');

// ============================================================
// CONFIGURATION
// ============================================================

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

// Define your buttons here. Each row is an array of button labels.
// The label is what appears on the button AND what gets sent as text.
// To ADD a button: add a string to an existing row, or add a new row.
// To REMOVE a button: delete it from the array.
// To CHANGE a command: edit the label string and update the handler below.
const KEYBOARD_BUTTONS = [
  ['📝 Post Ad to Web', 'Post to Group – $1'],
  ['📞 Contact Support', '💰 Claim $25']
];

// Map button labels to the commands they trigger.
// When a user taps a button, the bot receives the label as text.
// This map tells the bot which command handler to run.
const BUTTON_COMMANDS = {
  '📝 Post Ad to Web':   '/postad',
  'Post to Group – $1':  '/postgroup',
  '📞 Contact Support':  '/support',
  '💰 Claim $25':        '/claim'
};

// ============================================================
// BOT SETUP
// ============================================================

const bot = new TelegramBot(TOKEN, { polling: true });

const replyKeyboard = {
  reply_markup: {
    keyboard: KEYBOARD_BUTTONS,
    resize_keyboard: true,
    one_time_keyboard: false,
    selective: false
  }
};

// ============================================================
// COMMAND HANDLERS
// ============================================================

// /start or /menu — shows the keyboard
bot.onText(/\/(start|menu)/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    '🚀 Let\'s grow your reach together! 🚀\nUse the buttons below to get started.',
    replyKeyboard
  );
});

// /postad command
bot.onText(/\/postad/, (msg) => {
  bot.sendMessage(msg.chat.id, '📝 Post Ad to Web — coming soon! Use this to post your ad to the website.', replyKeyboard);
});

// /postgroup command
bot.onText(/\/postgroup/, (msg) => {
  bot.sendMessage(msg.chat.id, '💰 Post to Group — $1 per post. Send your ad content to proceed.', replyKeyboard);
});

// /support command
bot.onText(/\/support/, (msg) => {
  bot.sendMessage(msg.chat.id, '📞 Contact Support — reach out to our team for help. We\'ll get back to you shortly!', replyKeyboard);
});

// /claim command
bot.onText(/\/claim/, (msg) => {
  bot.sendMessage(msg.chat.id, '💰 Claim $25 — follow the instructions to claim your reward!', replyKeyboard);
});

// ============================================================
// BUTTON TAP HANDLER
// ============================================================
// When a user taps a Reply Keyboard button, Telegram sends the
// button label as a regular text message. This handler catches
// those and routes them to the right command.

bot.on('message', (msg) => {
  if (!msg.text) return;

  const command = BUTTON_COMMANDS[msg.text];
  if (command) {
    // Re-emit as if the user typed the command
    msg.text = command;
    bot.emit('text', msg);
  }
});

// ============================================================
// ERROR HANDLING
// ============================================================

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code, error.message);
});

console.log('Bot is running! Send /start or /menu in the group to see the keyboard.');
