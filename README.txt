TELEGRAM BOT - REPLY KEYBOARD BUTTONS
======================================

SETUP
-----
1. Install Node.js (v16 or higher)
2. Run: npm install
3. Set your bot token:
   - Option A: Edit bot.js and replace 'YOUR_BOT_TOKEN_HERE' with your token
   - Option B: Set environment variable: export TELEGRAM_BOT_TOKEN=your_token_here
4. Run: npm start
5. Add the bot to your Telegram group
6. In the group, type /start or /menu to show the buttons


HOW TO ADD A NEW BUTTON
-----------------------
1. Open bot.js
2. In KEYBOARD_BUTTONS, add the button label to an existing row or create a new row:
   Example - add "My New Button" to row 1:
     ['Post Ad to Web', 'Post to Group - $1', 'My New Button'],
   Example - add a new third row:
     ['My New Button']
3. In BUTTON_COMMANDS, map the label to a command:
     'My New Button': '/mynewcommand',
4. Add a command handler:
     bot.onText(/\/mynewcommand/, (msg) => {
       bot.sendMessage(msg.chat.id, 'Your response here', replyKeyboard);
     });
5. Restart the bot


HOW TO REMOVE A BUTTON
----------------------
1. Open bot.js
2. Delete the button label from KEYBOARD_BUTTONS
3. Delete the entry from BUTTON_COMMANDS
4. Optionally remove the command handler
5. Restart the bot


HOW TO CHANGE A BUTTON'S COMMAND
--------------------------------
1. Open bot.js
2. Change the label in KEYBOARD_BUTTONS (what the user sees)
3. Update the label and command in BUTTON_COMMANDS
4. Update or add the matching command handler
5. Restart the bot


IMPORTANT NOTES FOR GROUPS
---------------------------
- The bot must be added as a member of the group
- In group settings, the bot needs "can send messages" permission
- Reply Keyboards in groups require "selective" mode or a direct reply
- Each user needs to type /start or /menu once to see the keyboard
- The keyboard persists until the bot sends a message without it
- If the bot has Privacy Mode ON (default), it only sees commands (/start etc)
  and button taps. To disable: go to @BotFather > /mybots > your bot >
  Bot Settings > Group Privacy > Turn off


RUNNING IN BACKGROUND (PRODUCTION)
-----------------------------------
Option 1 - PM2 (recommended):
  npm install -g pm2
  pm2 start bot.js --name telegram-bot
  pm2 save
  pm2 startup

Option 2 - systemd service:
  Create /etc/systemd/system/telegram-bot.service with:
  [Unit]
  Description=Telegram Buttons Bot
  After=network.target

  [Service]
  ExecStart=/usr/bin/node /path/to/bot.js
  Environment=TELEGRAM_BOT_TOKEN=your_token_here
  Restart=always

  [Install]
  WantedBy=multi-user.target

  Then: systemctl enable telegram-bot && systemctl start telegram-bot
