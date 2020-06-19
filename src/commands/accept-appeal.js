const BaseCommand = require('../structures/BaseCommand');
const { Client } = require('../classes/BlockPalace');
const { Message, MessageEmbed } = require('discord.js');

const { defaultReasons } = require('../../config/messages.json');
const { botsettings } = require('../../config.json');

module.exports = class extends BaseCommand {
    constructor() {
        super('accept-appeal', {
            aliases: [],
            clientPermissions: [],
            cooldown: 3,
            usage: 'accept-appeal --id=<Application ID>\naccept-appeal --id=<Application ID> -r [...Reason]',
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
                    alias: ['r', 'm'],
                    default: defaultReasons.appeal_accepted,
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
            .setColor(0x0FF00)
            .setAuthor(message.author.tag, message.author.displayAvatarURL() || null)
            .setDescription(`Ban Appeal Application \`${app.user_id}\` of ${applicant} has been approved for:\n${args.reason}`)
            .setTimestamp()
        );
        try {
            const dm = await applicant.createDM();
            dm.send(new MessageEmbed()
                .setColor(0x00FF00)
                .setTitle('Your Ban Appeal Application on BlockPalace has been approved.')
                .setTimestamp()
                .addField('Reason(s)', args.reason)
                ).catch(e => { throw e });
        } catch (e) {
            message.channel.send(`${applicant.tag} was not notified about his/her application, He/she had DMs Off`);
        }
        await client.dbModels.unban.destroy({ where: { user_id: args.id } });
    }
}