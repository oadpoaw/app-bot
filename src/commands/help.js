const BaseCommand = require('../structures/BaseCommand');
const { Client } = require('../classes/BlockPalace');
const { Message, MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = class extends BaseCommand {
    constructor() {
        super('help', {
            aliases: ['commands'],
            clientPermissions: [],
            cooldown: 3,
            usage: 'help [-c <CommandName>]',
            args: false,
            argsDefinitions: {
                arguments: 'string',
                command: {
                    type: 'string',
                    alias: ['c', 'cmd'],
                    default: '',
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
        const prefix = client.prefix;
        if (args.command) {
            const command = client.commands.get(args.command) || client.commands.find((c) => c.options.aliases && c.options.aliases.includes(args.command));
            if (!command) {
                return message.channel.send('That command does not exist');
            } else {
                let embed = new MessageEmbed()
                    .setColor('RANDOM')
                    .setTitle(`**${command.name}** Command`)
                    .addField(`Cooldown`, `${ms(command.options.cooldown * 1000)}`, true)
                    ;
                if (command.options.aliases && command.options.aliases.length !== 0)
                    embed.addField(`Aliases`, `${command.options.aliases.join(', ')}`, true);
                if (command.options.clientPermissions && command.options.clientPermissions.length !== 0)
                    embed.addField(`Required Bot Permissions`, `\`\`\`xl\n${command.options.clientPermissions.join(' ')}\n\`\`\``, false)
                if (command.options.usage)
                    embed.addField(`Usage`, `\`\`\`xl\n${command.options.usage}\n\`\`\``, false);
                return message.channel.send(embed);
            }

        }
        return message.channel.send(new MessageEmbed()
            .setColor('RANDOM')
            .setTitle('Commands')
            .setDescription(`Prefix: \`${prefix}\`\n\`help [Command]\``)
            .addField('Commands', `\`ping\`, \`apply\`, \`appeal\`, \`help\``)
            .addField('Admin Commands', `\`applications\`, \`accept\`, \`reject\`, \`accept-appeal\`, \`appeals\`, \`reject-appeal\``)
            .setFooter('Powered by undefine')
        );
    }
}