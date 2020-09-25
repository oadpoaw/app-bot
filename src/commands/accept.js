const BaseCommand = require('../structures/BaseCommand');
const { Client } = require('../classes/AppBot');
const { Message, MessageEmbed } = require('discord.js');
const { botsettings } = require('../../config.json');
const applications = require('../../config/application.json');

module.exports = class extends BaseCommand {
    constructor() {
        super('accept', {
            aliases: [],
            clientPermissions: [],
            cooldown: 3,
            usage: 'accept [...Reason]',
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
        if (!message.member.roles.cache.has(botsettings.managerRoleID)) return;
        if (message.channel.parentID !== botsettings.category) return message.channel.send('This is not an application channel');
        const [type, id] = message.channel.topic.split(/ +/g);
        const b = await client.dbModels.apps.findOne({ where: { app_type: type } }).catch(console.log);
        const app = applications[type];
        const applicant = await client.users.fetch(id);
        let reason = app.config.messages.accepted;
        if (args && args.length) reason = args.join(' ');
        await message.channel.send(new MessageEmbed()
            .setColor(0x0FF00)
            .setAuthor(message.author.tag, message.author.displayAvatarURL() || null)
            .setDescription(`${type.toUpperCase()} Application \`${id}\` of ${applicant} has been approved for:\n${reason}`)
            .setTimestamp()
        );
        const dm = await applicant.createDM();
        dm.send(new MessageEmbed()
            .setColor(0x00FF00)
            .setAuthor(message.author.tag, message.author.displayAvatarURL() || null)
            .setTitle(`Your ${type.toUpperCase()} Application on AppBot has been approved`)
            .setTimestamp()
            .addField('Reason(s)', reason)
        ).catch(console.log);
        b.applicants = b.applicants.filter((c) => { return c !== id });
        await b.save();
        client.setTimeout(() => {
            await message.channel.delete('Application... Closed');
            const ch = await client.channels.fetch(botsettings.logChannelID);
            ch.send(new MessageEmbed()
                .setColor(0x0FF00)
                .setAuthor(message.author.tag, message.author.displayAvatarURL() || null)
                .setDescription(`${type.toUpperCase()} Application \`${id}\` of ${applicant} has been approved for:\n${reason}`)
                .setTimestamp()
            );
        }, 10000);
    }
}