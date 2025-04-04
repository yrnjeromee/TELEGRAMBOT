// comandi da eseguire con git bash:
// npm install node-telegram-bot-api qrcode
//
// per avviare scrivere nel terminale: "node --no-deprecation bot.js"
//
// fonte Qr Code: "https://www.npmjs.com/package/qrcode"
// fonte per l'uso di fs.existsSync: "https://nodejs.org/docs/latest/api/fs.html#fsexistssyncpath"
// fonte per l'uso di fs.unlinkSync: "https://nodejs.org/docs/latest/api/fs.html#fsunlinksyncpath"
// fonte per l'uso della replyKeyboard: "https://telegrambots.github.io/book/2/reply-markup.html"
//                                    : "https://core.telegram.org/bots/features#keyboards"
// fonte per l'usp dell'operatore spread: "https://cipiaceinfo.it/docs/programmazione/javascript/funzioni-2/"

const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const QRCode = require("qrcode");
const conf = JSON.parse(fs.readFileSync('conf.json'));
const token = conf.key;

const bot = new TelegramBot(token, { polling: true });

function generatoreQRCode(qrcode, text) {
    return new Promise((resolve, reject) => {
        QRCode.toFile(qrcode, text, function (err) {
            if (err){
                reject(err);
            } else {
                resolve();
            };
        });
    });
}

const replyKeyboard = {
    reply_markup: {
      keyboard: [['Genera un Qr Code', '/help']],
      one_time_keyboard: true,
      resize_keyboard: true
    }
};

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const qrcode = "./qrcode_" + chatId + ".png";

    if (text === "/start" || text === "Genera un Qr Code") {
        bot.sendMessage(chatId, "Ciao! Inviami qualsiasi testo e genererò un QR Code per te!", replyKeyboard);
        return;
    }
    if (text === "/help") {
        bot.sendMessage(chatId, `
Questo bot ti permette di generare facilmente un QR Code a partire da qualsiasi testo tu invii!

📌 Come funziona:
1. Avvia il bot con il comando "/start" oppure clicca su **"Genera un Qr Code"** dal menu.
2. Inviagli un messaggio con il testo che vuoi trasformare in QR Code (può essere un link, una frase, un numero, ecc.).
3. Il bot genererà il QR Code e te la invierà!

📋 Comandi disponibili:
- "Genera un Qr Code" – Avvia il bot e mostra il menu.
- "/help" – Mostra il menu con le opzioni disponibili.`, replyKeyboard);
        return;
    }
    try {
        await generatoreQRCode(qrcode, text);
        if (fs.existsSync(qrcode)) {
            await bot.sendPhoto(chatId, qrcode, {
                caption: "Ecco il tuo QR Code per: " + text, ...replyKeyboard //aggiunto l'operatore spread per non riscrivere l'intero dizionario
            });
            fs.unlinkSync(qrcode);
        } else {
            throw new Error("Il file QR Code non è stato creato correttamente.");
        };
    } catch (err) {
        bot.sendMessage(chatId, "❌❌❌ Si è verificato un errore durante la generazione del QR Code! ❌❌❌");
        console.error("Errore durante la generazione del QR Code:", err);
    };
});