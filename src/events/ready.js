const BaseEvent = require('../structures/BaseEvent');

const { Client } = require('../classes/BlockPalace');

module.exports = class Ready extends BaseEvent {
    constructor() {
        super('ready');
    }
    /**
     * 
     * @param {Client} client 
     */
    async run(client) {
        client.logger.info(`Bot Ready as ${client.user.tag} / ${client.user.id}`);
    }
}