
const Sequelize = require('sequelize');
const { settings } = require('../../config.json');

class Database extends Sequelize.Sequelize {
    constructor() {
        let logger = settings.debug ? console.log : false;
        super('database', process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
            host: 'localhost',
            dialect: 'sqlite',
            logging: logger,
            storage: './database/database.sqlite',
        });
    }
}

module.exports = Database;