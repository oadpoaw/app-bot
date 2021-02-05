const BaseCommand = require('../structures/BaseCommand');
const { Client } = require('../classes/AppBot');
const { Message, MessageEmbed } = require('discord.js');

const apps = require('../../config/application.json');
const messages = require('../../config/messages.json');
const { botsettings } = require('../../config.json');

module.exports = class extends BaseCommand {
    constructor() {
        super('apply', {
            aliases: [],
            clientPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
            cooldown: 10,
            usage: `apply <Type>\nTypes:\nstaff\nunban`,
            args: true,
        });
    }
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array<String>} args 
     */
    async execute(client, message, args) {
        await message.delete();
        const type = args[0].toLowerCase();
        if (message.channel.parentID === botsettings.category) return message.channel.send(messages.wrongChannel);
        if (!apps.hasOwnProperty(type)) return message.channel.send(messages.invalidAppType.replace(/{PREFIX}/g, client.prefix)).then((m) => m.delete({ timeout: 10000 }));
        const app = apps[type];
        let db = await client.dbModels.apps.findOne({ where: { app_type: type } });
        if (db && db.applicants && db.applicants.includes(message.author.id)) return message.channel.send(messages.already.replace(/{TYPE}/g, type)).then((m) => m.delete({ timeout: 10000 }));
        if (!db) db = await client.dbModels.apps.create({ app_type: type });
        const channel = await message.guild.channels.create(`${type}-${message.author.username}`, {
            type: 'text',
            parent: botsettings.category,
            topic: `${type} ${message.author.id}`,
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
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'MANAGE_CHANNELS']
                },
                {
                    id: botsettings.managerRoleID,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'MANAGE_CHANNELS']
                }
            ]
        });
        const msg = await channel.send(`${message.author}'s Interview on going...\n\nType \`${client.prefix}cancel\` to cancel the interview`);
        let ApplicationResponse = '';
        for await (const question of app.questions) {
            const response = await client.awaitReply(msg, message.author.id, `${question}`, 60000 * 30, false, true, true);
            if (!response || response === `${client.prefix}cancel`) {
                ApplicationResponse = 'CANCELLED';
                break;
            }
            ApplicationResponse += `> ${question}\n${response}\n\n`;
        }
        await msg.delete({ timeout: 1000 });
        if (ApplicationResponse === 'CANCELLED') {
            await channel.send('Interview has been cancelled\n\nDeleting this channel in 10 seconds...');
            setTimeout(() => {
                channel.delete();
            }, 10000)
            return true;
        }
        const copy = ApplicationResponse;
        const content = client.chunkString(copy, 2048);
        await channel.send(new MessageEmbed()
            .setColor('RANDOM')
            .setTimestamp()
            .setAuthor(`${message.author.tag}'s ${type} application`, message.author.displayAvatarURL() || null)
        );
        for await (const text of content) {
            await channel.send(new MessageEmbed()
                .setColor('RANDOM')
                .setDescription(text)
            );
        }
        await channel.send(app.config.messages.pending);
        if (!db.applicants || !Array.isArray(db.applicants)) db.applicants = [];
        db.applicants.push(message.author.id);
        await db.save();
        const ch = await client.channels.fetch(botsettings.logChannelID);
        await ch.send(new MessageEmbed()
            .setColor('RANDOM')
            .setTimestamp()
            .setAuthor(`${message.author.tag}'s ${type} application`, message.author.displayAvatarURL() || null)
        );
        for await (const text of content) {
            await ch.send(new MessageEmbed()
                .setColor('RANDOM')
                .setDescription(text)
            );
        }
    }
}
