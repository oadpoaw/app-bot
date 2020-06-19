const BaseCommand = require('../structures/BaseCommand');
const { Client } = require('../classes/BlockPalace');
const { Message, MessageEmbed, MessageAttachment } = require('discord.js');

const fs = require('fs').promises;
const path = require('path');

const { botsettings } = require('../../config.json');

module.exports = class extends BaseCommand {
    constructor() {
        super('appeals', {
            aliases: [],
            clientPermissions: [],
            cooldown: 3,
            usage: 'appeals\nappeals --page=1\nappeals --fetch=<Appeal ID> [--file]',
            args: true,
            argsDefinitions: {
                arguments: 'string',
                page: {
                    type: 'number',
                    alias: 'p',
                    default: 1,
                },
                fetch: {
                    type: 'string',
                    alias: 'f',
                    default: '',
                },
                file: {
                    type: 'boolean',
                    alias: 'f',
                    default: false,
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
        if (args.fetch) {
            const user = await client.dbModels.unban.findOne({ where: { user_id: args.fetch } });
            if (!user) return message.channel.send(`An Appeal ID of \`${args.fetch}\` does not exist in the database`);
            if (args.file) {
                const app = path.join(__dirname, `temp.txt`);
                await fs.writeFile(app, user.data.response.split('------------------------------------').join('\r\n'), {
                    encoding: 'utf8'
                }).then(async () => {
                    const file = await fs.readFile(app);
                    message.channel.send(new MessageAttachment(file, `application.txt`));
                    await fs.unlink(app);
                });
                return true;
            }
            const arr = user.data.response.split('------------------------------------');
            let embed = new MessageEmbed()
                .setColor('RANDOM')
                .setTimestamp()
                .setTitle(`Appeal ${user.user_id}`)
            await arr.forEach(async (m) => {
                embed.setDescription(`Applicant: ${await client.users.fetch(user.user_id)}`)
                embed.addField('\u200b', client.trim(m, 1024));
            });
            message.channel.send(embed);
            return true;
        }
        const applications = await client.dbModels.unban.findAll();
        const apps = client.chunk(applications, 3);

        let embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle('Ban Appeals')
            .setDescription('Commands\n```\nappeals --fetch=<Appeal ID>\naccept-appeal --id=<Appeal ID>\naccept-appeal --id=<Appeal ID> -r [...Reason]\nreject-appeal --id=<Appeal ID>\nreject-appeal --id=<Appeal ID> -r [...Reason]\n```')
            .setTimestamp();

        if (!applications) {
            embed.setDescription('NO BAN APPEALS YET');
            return message.channel.send(embed);
        }
        const PAGE = args.page || 1;
        const PAGES = apps.length;
        if (PAGE > 0 && PAGE <= PAGES) {
            apps[PAGE - 1].forEach((app) => {
                embed.addField(`Applicant: ${app.data.tag}`, `Appeal ID: ${app.user_id}`);
            });
            embed.setFooter(`Page ${PAGE} of ${PAGES}`);
            return message.channel.send(embed);
        }
        apps[0].forEach((app) => {
            embed.addField(`Applicant: ${app.data.tag}`, `Appeal ID: ${app.user_id}`);
        });
        embed.setFooter(`Page ${PAGE} of ${PAGES}`);
        return message.channel.send(embed);
    }
}