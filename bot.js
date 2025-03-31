// comandi da eseguire con git bash:
// npm install node-telegram-bot-api
// npm install node-telegram-bot-api qrcode dotenv

const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const QRCode = require("qrcode");
const conf = JSON.parse(fs.readFileSync('conf.json'));
const token = conf.key;

const bot = new TelegramBot(token, { polling: true });

function generatoreQRCode(qrcode, text) {
    return new Promise((resolve, reject) => {
        QRCode.toFile(qrcode, text, function (err) {
            if (err) reject(err);
            resolve();
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

    try {
        await generatoreQRCode(qrcode, text);
        if (fs.existsSync(qrcode)) {
            await bot.sendPhoto(chatId, qrcode, {
                caption: "Ecco il tuo QR Code per: " + text,
            });
            fs.unlinkSync(qrcode);
        } else {
            throw new Error("Il file QR Code non è stato creato correttamente.");
        }
    } catch (err) {
        bot.sendMessage(chatId, "❌❌❌ Si è verificato un errore durante la generazione del QR Code! ❌❌❌");
        console.error("Errore durante la generazione del QR Code:", err);
    }
});
