require('dotenv').config();
const AppBot = require('./classes/AppBot');
const client = new AppBot.Client();

(async function() {
    await client.registerCommands('../commands/');
    await client.registerEvents('../events/');
    client.login(process.env.BOT_TOKEN);
})();