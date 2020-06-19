const BaseCommand = require('../structures/BaseCommand');
const { Client } = require('../classes/BlockPalace');
const { Message } = require('discord.js');

module.exports = class extends BaseCommand {
    constructor() {
        super('name', {
            aliases: [],
            clientPermissions: [],
            cooldown: 3,
            usage: '',
            args: false,
            argsDefinitions: {

            }
        })
    }
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array<String>|JSON} args 
     */
    async execute(client, message, args) {

    }
}