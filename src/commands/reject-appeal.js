const BaseCommand = require('../structures/BaseCommand');
const { Client } = require('../classes/BlockPalace');
const { Message, MessageEmbed } = require('discord.js');

const { defaultReasons } = require('../../config/messages.json');
const { botsettings } = require('../../config.json');

module.exports = class extends BaseCommand {
    constructor() {
        super('reject-appeal', {
            aliases: [],
            clientPermissions: [],
            cooldown: 10,
            usage: 'reject-appeal --id=<Appeal ID>\nreject-appeal --id=<Appeal ID> -r [...Reason]',
            args: true,
            argsDefinitions: {
                arguments: 'string',
                id: {
                    type: 'string',
                    alias: 'i',
                    default: 'Follow the usage'
                },
                reason: {
                    type: 'string',
                    alias: 'r',
                    default: defaultReasons.appeal_rejected,
                }
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
        if (!message.member.roles.cache.has(botsettings.accepterRoleID)) return;
        const app = await client.dbModels.unban.findOne({ where: { user_id: args.id } });
        if (!app) {
            message.channel.send(`An Appeal with an ID of \`${args.id}\` does not exist`);
            return true;
        }
        const applicant = await client.users.fetch(args.id);
        message.channel.send(new MessageEmbed()
            .setColor('RED')
            .setAuthor(message.author.tag, message.author.displayAvatarURL() || null)
            .setDescription(`Ban Appeal Application \`${app.user_id}\` of ${applicant} has been denied for:\n${args.reason}`)
            .setTimestamp()
        );
        try {
            const dm = await applicant.createDM();
            dm.send(new MessageEmbed()
                .setColor('RED')
                .setTitle('Your Ban Appeal Application on BlockPalace has been denied.')
                .setTimestamp()
                .addField('Reason(s)', args.reason)
            ).catch(e => { throw e });
        } catch (e) {
            message.channel.send(`${applicant.tag} was not notified about his/her application, He/she had DMs Off`);
        }
        await client.dbModels.unban.destroy({ where: { user_id: args.id } });
    }
}