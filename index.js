const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

// Crear una función para enviar el mensaje de bienvenida con la imagen
async function sendWelcomeMessage(client, recipient, imgPath, userName) {
    // Crear objeto MessageMedia desde el archivo de imagen
    const media = MessageMedia.fromFilePath(imgPath);

    // Texto de bienvenida
    const welcomeMessage = `¡Bienvenido al curso, ${userName}!`;

    // Enviar la imagen y el mensaje de bienvenida juntos
    await client.sendMessage(recipient, [media, welcomeMessage]);
}

// Resto del código...

const client = new Client();

client.on('qr', (qr) => {
    // Generar y mostrar el código QR para escanear
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Cliente de WhatsApp listo!');
});

client.on('message', async (message) => {
    const bodyLower = message.body.toLowerCase(); // Convertir el texto del mensaje a minúsculas para una comparación sin distinción entre mayúsculas y minúsculas

    // Verificar si el mensaje proviene de un chat privado o de un grupo
    const isPrivateMessage = !message.fromMe && !message.isGroupMsg;
    const isGroup = message.isGroupMsg;

    if (isPrivateMessage) {
        const contact = await message.getContact(); // Obtener la información del contacto
        const userName = contact.name || contact.pushname || contact.verifiedName || 'Usuario'; // Obtener el nombre del usuario

        if (bodyLower.includes('curso') || bodyLower.includes('python')) {
            // Responder con un mensaje de bienvenida al curso y enviar una imagen
            const imgPath = path.join(__dirname, 'cp.png'); // Ruta absoluta de la imagen
            await sendWelcomeMessage(client, message.from, imgPath, userName);
        } else if (bodyLower === 'hola') {
            // Responder con un saludo y el nombre del usuario
            message.reply(`Hola *${userName}!* ¿Cómo puedo ayudarte?`);
        } else {
            // Si el mensaje no es "curso", "python" o "hola", enviar solo el mensaje de bienvenida con la imagen
            const imgPath = path.join(__dirname, 'cp.png'); // Ruta absoluta de la imagen
            await sendWelcomeMessage(client, message.from, imgPath, userName);
        }
    } else if (isGroup) {
        // El mensaje proviene de un grupo
        const groupName = message.chat.name; // Obtener el nombre del grupo
        const groupWelcomeMessage = `¡Hola a todos en ${groupName}! ¡Bienvenidos al curso! 🎉`;

        // Enviar el mensaje de bienvenida personalizado en el grupo
        client.sendMessage(message.from, groupWelcomeMessage);
    }
});

client.initialize();
