const BaseCommand = require('../structures/BaseCommand');
const { Client } = require('../classes/BlockPalace');
const { Message, MessageEmbed, MessageAttachment } = require('discord.js');

const fs = require('fs').promises;
const path = require('path');

const { botsettings } = require('../../config.json');

module.exports = class extends BaseCommand {
    constructor() {
        super('applications', {
            aliases: ['application', 'apps'],
            clientPermissions: [],
            cooldown: 3,
            usage: 'applications\napplications --page=1\napplications --fetch=<Application ID> [--file]',
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
            const user = await client.dbModels.application.findOne({ where: { user_id: args.fetch } });
            if (!user) return message.channel.send(`An application ID of \`${args.fetch}\` does not exist in the database`);
            const app = path.join(__dirname, `temp.txt`);
            if (args.file) {
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
                .setTitle(`Application ${user.user_id}`)
            await arr.forEach(async (m) => {
                embed.setDescription(`Applicant: ${await client.users.fetch(user.user_id)}`)
                embed.addField('\u200b', client.trim(m, 1024));
            });
            message.channel.send(embed);
            return;
        }
        const applications = await client.dbModels.application.findAll();
        const apps = client.chunk(applications, 3);

        let embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle('Applications')
            .setDescription('Commands\n```\napplications --fetch=<Application ID>\naccept --id=<Application ID>\naccept --id=<Application ID> -r [...Reason]\nreject --id=<Application ID>\nreject --id=<Application ID> -r [...Reason]\n```')
            .setTimestamp();

        if (!applications) {
            embed.setDescription('NO APPLICATIONS YET');
            return message.channel.send(embed);
        }
        const PAGE = args.page || 1;
        const PAGES = apps.length;
        if (PAGE > 0 && PAGE <= PAGES) {
            apps[PAGE - 1].forEach((app) => {
                embed.addField(`Applicant: ${app.data.tag}`, `Application ID: ${app.user_id}`);
            });
            embed.setFooter(`Page ${PAGE} of ${PAGES}`);
            return message.channel.send(embed);
        }
        apps[0].forEach((app) => {
            embed.addField(`Applicant: ${app.data.tag}`, `Application ID: ${app.user_id}`);
        });
        embed.setFooter(`Page ${PAGE} of ${PAGES}`);
        return message.channel.send(embed);
    }
}