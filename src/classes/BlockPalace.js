const { Client, Collection, Message, TextChannel, MessageEmbed } = require('discord.js');
const path = require('path');
const fs = require('fs').promises;

const BaseCommand = require('../structures/BaseCommand');
const BaseEvent = require('../structures/BaseEvent');
const Database = require('../modules/Database');
const Logger = require('../utils/Logger');

class BPClient extends Client {
    constructor() {
        super({
            partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
            fetchAllMembers: false,
            messageCacheMaxSize: 100,
        });
        this.prefix = process.env.DEFAULT_PREFIX;
        this.commands = new Collection();
        this.cooldowns = new Collection();
        this.logger = Logger;
        this.database = new Database();
        this.dbModels = {
            application: this.database.import('../models/application'),
            unban: this.database.import('../models/unbans'),
        }
        require('../modules/ErrorHandler')(this);
        if (process.argv.includes('-f') || process.argv.includes('--force')) {
            this.database.sync({ force: true });
        }
        this.database.authenticate().then(() => {
            this.logger.info('Database Connection Established!');
        }).catch(err => {
            this.logger.error(`Unable to connect to the database: ${err} ${JSON.stringify(err)}`);
        });
    }
    /**
     * 
     * @param {String} dir commands directory
     */
    async registerCommands(dir) {
        const filePath = path.join(__dirname, dir);
        const files = await fs.readdir(filePath);
        for (const file of files) {
            const Command = require(path.join(filePath, file));
            if (Command.prototype instanceof BaseCommand) {
                const instance = new Command();
                this.commands.set(instance.name, instance);
            }
        }
    }
    /**
     * 
     * @param {String} dir events category
     */
    async registerEvents(dir) {
        const filePath = path.join(__dirname, dir);
        const files = await fs.readdir(filePath);
        for (const file of files) {
            const Event = require(path.join(filePath, file));
            if (Event.prototype instanceof BaseEvent) {
                const instance = new Event();
                this.on(instance.name, instance.run.bind(instance, this));
            }
        }
    }
    /**
     * @returns {Promise<String>|Promise<Message>}
     * @param {Message|TextChannel} message 
     * @param {String|MessageEmbed} question 
     * @param {Number} duration in millieseconds
     * @param {Boolean} obj if true, returns the message object collected not message content
     */
    async awaitReply(message, author, question, duration = 60000, obj = false) {
        const filter = m => m.author.id === author;
        await message.channel.send(question);
        try {
            const collected = await message.channel.awaitMessages(filter, { max: 1, time: duration, errors: ['time'] });
            if (obj) return collected.first();
            return collected.first().content;
        } catch (e) {
            return false;
        }
    }
    /**
     * @returns {String}
     * @param {String} str 
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    /**
     * @returns {String}
     * @param {String} str 
     */
    trim(str, max) {
        return (str.length > max) ? `${str.slice(0, max - 3)}...` : str;
    }
    /**
     * @returns {Array<Array<Any>>}
     * @param {Array} array 
     * @param {Number} chunkSize 
     */
    chunk(array, chunkSize = 0) {
        return array.reduce(function (previous, current) {
            let chunk;
            if (previous.length === 0 || previous[previous.length - 1].length === chunkSize) {
                chunk = [];
                previous.push(chunk);
            }
            else {
                chunk = previous[previous.length - 1];
            }
            chunk.push(current);
            return previous;
        }, []);
    }
    /**
     * @returns {Promise<String>}
     * @param {Promise<String>|String} text 
     */
    async clean(text) {
        if (text && text.constructor && text.constructor.name == 'Promise') text = await text;
        if (typeof text !== 'string') text = inspect(text, { depth: 1 });
        text = text.replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203))
            .replace(this.token, 'yes');
        return text;
    }
}

module.exports = {
    Client: BPClient
}