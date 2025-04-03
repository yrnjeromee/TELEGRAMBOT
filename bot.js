// comandi da eseguire con git bash:
// npm install node-telegram-bot-api qrcode
//
// per avviare scrivere nel terminale: "node --no-deprecation bot.js"
//
// fonte Qr Code: "https://www.npmjs.com/package/qrcode"
// fonte per l'uso di fs.existsSync: "https://nodejs.org/docs/latest/api/fs.html#fsexistssyncpath"
// fonte per l'uso di fs.unlinkSync: "https://nodejs.org/docs/latest/api/fs.html#fsunlinksyncpath"

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

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const qrcode = "./qrcode_" + chatId + ".png";

    if (text === "/start") {
        bot.sendMessage(chatId, "Ciao! Inviami qualsiasi testo e genererò un QR Code per te!");
        return;
    }
    
    if (text === "/help") {
        bot.sendMessage(chatId, "Non ci sono dei comandi da usare, devi solo mandare un messaggio e ti restituirà un Qr Code!");
        return;
    }

    try {
        await generatoreQRCode(qrcode, text);
        if (fs.existsSync(qrcode)) {
            await bot.sendPhoto(chatId, qrcode, {
                caption: "Ecco il tuo QR Code per: " + text,
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
