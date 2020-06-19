
const { Message, Collection } = require('discord.js');
const { Client } = require('../classes/BlockPalace');

const BaseEvent = require('../structures/BaseEvent');
const messages = require('../../config/messages.json');

const minimist = require('minimist');
const options = require('minimist-options');
const ms = require('ms');

/**
 * @returns {Object}
 * @param {Array<String>} args 
 * @param {Object} opts 
 */
function parseArguments(args, opts) {
    return minimist(args, options(opts));
}

module.exports = class MessageEvent extends BaseEvent {
    constructor() {
        super('message')
    }
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     */
    async run(client, message) {
        if (message.author.bot || message.channel.type !== 'text') return;
        if (!message.member) await message.member.fetch();
        const prefix = new RegExp(`^(<@!?${client.user.id}>|${client.escapeRegex(client.prefix)})\\s*`);
        if (!prefix.test(message.content)) return;
        const [, matchedPrefix] = message.content.match(prefix);
        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName) || client.commands.find(c => c.options.aliases && c.options.aliases.includes(commandName));
        if (!command) return;
        if (command.options.clientPermissions) {
            if (!message.guild.me.permissions.has(command.options.clientPermissions)) {
                message.channel.send(messages.clientMissingPermissions.replace(/{PERMS}/g, command.options.clientPermissions.join(' ')))
                return;
            }
        }
        if (command.options.args && !args.length && command.options.usage) {
            message.channel.send(messages.missingArguments.replace(/{USAGE}/g, command.options.usage));
            return;
        }
        if (!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Collection());
        const now = Date.now();
        const timestamps = client.cooldowns.get(command.name);
        const cooldownAmount = (command.options.cooldown || 3) * 1000;
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = ms(expirationTime - now);
                message.channel.send(messages.commandthrottle.replace(/{COOLDOWN}/g, timeLeft.toString()));
                return;
            }
        }
        try {
            const argv = command.options.argsDefinitions ? parseArguments(args, command.options.argsDefinitions) : args;
            const status = await command.execute(client, message, argv);
            if (status !== false) {
                timestamps.set(message.author.id, now);
                client.setTimeout(() => {
                    timestamps.delete(message.author.id);
                }, cooldownAmount);
            }
        } catch (e) {
            const content = client.trim(await client.clean(messages.commandError.replace(/{ERRORNAME}/g, e.name).replace(/{ERROR}/g, e)), 1024)
            message.channel.send(`${content}`);
        }

    }
}