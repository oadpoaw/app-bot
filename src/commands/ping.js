const BaseCommand = require('../structures/BaseCommand');

const { Client } = require('../classes/BlockPalace');

const { Message } = require('discord.js');

module.exports = class Ping extends BaseCommand {
    constructor() {
        super('ping', {
            aliases: ['botping'],
            cooldown: 20,
        });
    }
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array<String>|JSON} args 
     */
    async execute(client, message, args) {
        return message.channel.send('Ping?').then(msg => {
            msg.edit(`Pong! Latency is \`${msg.createdTimestamp - message.createdTimestamp}\`ms.\nAPI Latency is \`${Math.round(client.ws.ping)}ms\``);
        }).catch((e) => {
            client.logger.error(`Error : ${e}`);
            return false;
        });
    }
}