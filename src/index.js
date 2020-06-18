require('dotenv').config();
const BlockPalace = require('./classes/BlockPalace');
const client = new BlockPalace.Client();

(async function() {
    await client.registerCommands('../commands/');
    await client.registerEvents('../events/');
    client.login(process.env.BOT_TOKEN);
})();