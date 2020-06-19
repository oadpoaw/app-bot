const BaseCommand = require('../structures/BaseCommand');
const { Client } = require('../classes/BlockPalace');
const { Message, MessageEmbed } = require('discord.js');

const questions = require('../../config/questions.json');
const messages = require('../../config/messages.json');
const { botsettings } = require('../../config.json');

module.exports = class extends BaseCommand {
    constructor() {
        super('apply', {
            aliases: [],
            clientPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
            cooldown: 60 * 60,
            usage: '',
            args: false,
        });
    }
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array<String>|JSON} args 
     */
    async execute(client, message, args) {
        await message.delete();
        const app = await client.dbModels.application.findOne({ where: { user_id: message.author.id } });
        if (app || message.guild.channels.cache.find((c) => c.name === 'application')) {
            message.channel.send('Sorry, you already applied for staff position or there is an application on going right now');
            return true;
        }
        const channel = await message.guild.channels.create('application', {
            type: 'text',
            topic: `Application ID: ${message.author.id}\nApplicant : ${message.author.tag}`,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ['VIEW_CHANNEL']
                },
                {
                    id: message.author.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                },
                {
                    id: client.user.id,
                    allow: ['MANAGE_CHANNELS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }
            ]
        });

        const msg = await channel.send(`${message.author} Staff Interview on going...`);

        let ApplicationResponse = '';

        for await (const question of questions) {
            const temp = `${question}\n\nType \`;cancel\` to cancel the interview.`;
            const response = await client.awaitReply(msg, message.author.id, temp, 60000 * 60);
            if (!response || response === ';cancel') {
                ApplicationResponse = 'CANCELLED';
                break;
            }
            ApplicationResponse += `> ${question}\nResponse: ${response}\n\n------------------------------------\n`;
        }
        if (ApplicationResponse === 'CANCELLED') {
            await channel.send('Application Interview has been cancelled\n\nDeleting this channel in 10 seconds...');
            setTimeout(() => {
                channel.delete();
            }, 10000)
            return true;
        }

        const ctx = `${messages.pending}\n\nDeleting this channel in 10 seconds...`;
        await channel.send(ctx);

        setTimeout(() => {
            channel.delete();
        }, 10000);

        await client.dbModels.application.create(
            {
                user_id: message.author.id,
                data: {
                    response: ApplicationResponse,
                    tag: message.author.tag,
                },
            }
        );
        const logChannel = client.channels.cache.get(botsettings.logChannelID);

        logChannel.send(new MessageEmbed()
            .setColor('RANDOM')
            .setTimestamp()
            .setAuthor(message.author.tag, message.author.displayAvatarURL() || null)
            .setDescription(`Someone applied for staff!\nApplication ID: \`${message.author.id}\`\nApplicant: \`${message.author.tag}\`\n\nTo view application response use \`%application --fetch=<APPLICATION ID>\``)
        );
    }
}