<?php

// ============================================================
// CONFIGURATION
// ============================================================

$TOKEN = getenv('TELEGRAM_BOT_TOKEN') ?: '8814550180:AAEQYkIp62gRckGkdK0WF9-yFteZ2SLEb7U';
$POLL_INTERVAL = 1; // seconds

// Define your buttons here. Each row is an array of button labels.
// To ADD a button: add a string to an existing row, or add a new row.
// To REMOVE a button: delete it from the array.
// To CHANGE a button: edit the label and update $BUTTON_COMMANDS below.
$KEYBOARD_BUTTONS = [
    ['📝 Post Ad to Web', 'Post to Group – $1'],
    ['📞 Contact Support', '💰 Claim $25']
];

// Map button labels to the commands they trigger.
$BUTTON_COMMANDS = [
    '📝 Post Ad to Web'  => '/postad',
    'Post to Group – $1' => '/postgroup',
    '📞 Contact Support'  => '/support',
    '💰 Claim $25'        => '/claim'
];

// Command responses — what the bot says when a command is triggered.
$COMMAND_RESPONSES = [
    '/postad'    => '📝 Post Ad to Web — coming soon! Use this to post your ad to the website.',
    '/postgroup' => '💰 Post to Group — $1 per post. Send your ad content to proceed.',
    '/support'   => '📞 Contact Support — reach out to our team for help. We\'ll get back to you shortly!',
    '/claim'     => '💰 Claim $25 — follow the instructions to claim your reward!'
];

// ============================================================
// TELEGRAM API (pure PHP, no libraries)
// ============================================================

function callApi($method, $body) {
    global $TOKEN;

    $url = "https://api.telegram.org/bot{$TOKEN}/{$method}";
    $payload = json_encode($body);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        echo "API error: {$error}\n";
        return null;
    }

    return json_decode($response, true);
}

function sendMessage($chatId, $text) {
    global $KEYBOARD_BUTTONS;

    return callApi('sendMessage', [
        'chat_id' => $chatId,
        'text' => $text,
        'reply_markup' => [
            'keyboard' => $KEYBOARD_BUTTONS,
            'resize_keyboard' => true,
            'one_time_keyboard' => false
        ]
    ]);
}

// ============================================================
// UPDATE HANDLING
// ============================================================

$shownKeyboardTo = [];

function userKey($chatId, $userId) {
    return "{$chatId}:{$userId}";
}

function handleUpdate($update) {
    global $BUTTON_COMMANDS, $COMMAND_RESPONSES, $shownKeyboardTo;

    $msg = $update['message'] ?? null;
    if (!$msg) return;

    $chatId = $msg['chat']['id'];

    // New member joined — auto-show keyboard
    if (!empty($msg['new_chat_members'])) {
        foreach ($msg['new_chat_members'] as $member) {
            $shownKeyboardTo[userKey($chatId, $member['id'])] = true;
        }
        sendMessage($chatId, '🚀 Welcome! Use the buttons below to get started.');
        return;
    }

    $text = trim($msg['text'] ?? '');
    $fromId = $msg['from']['id'] ?? null;
    if (!$text || !$fromId) return;

    $key = userKey($chatId, $fromId);

    // /start or /menu
    if (preg_match('/^\/(start|menu)(@.*)?$/', $text)) {
        $shownKeyboardTo[$key] = true;
        sendMessage($chatId, "🚀 Let's grow your reach together! 🚀\nUse the buttons below to get started.");
        return;
    }

    // Direct command (typed manually)
    if (isset($COMMAND_RESPONSES[$text])) {
        sendMessage($chatId, $COMMAND_RESPONSES[$text]);
        return;
    }

    // Button tap — map label to command
    if (isset($BUTTON_COMMANDS[$text])) {
        $cmd = $BUTTON_COMMANDS[$text];
        sendMessage($chatId, $COMMAND_RESPONSES[$cmd] ?? 'Command received.');
        return;
    }

    // First message from a user who hasn't seen the keyboard — auto-show it
    if (!isset($shownKeyboardTo[$key])) {
        $shownKeyboardTo[$key] = true;
        sendMessage($chatId, '🚀 Use the buttons below!');
        return;
    }
}

// ============================================================
// LONG POLLING (no libraries, no frameworks)
// ============================================================

$offset = 0;

echo "Bot is running (pure PHP, no dependencies)!\n";

while (true) {
    $result = callApi('getUpdates', [
        'offset' => $offset,
        'timeout' => 30,
        'allowed_updates' => ['message']
    ]);

    if ($result && $result['ok'] && !empty($result['result'])) {
        foreach ($result['result'] as $update) {
            $offset = $update['update_id'] + 1;
            try {
                handleUpdate($update);
            } catch (Exception $e) {
                echo "Error: " . $e->getMessage() . "\n";
            }
        }
    }

    sleep($POLL_INTERVAL);
}
