
const { Sequelize, Transaction } = require('sequelize');
const { settings } = require('../../config.json');

class Database extends Sequelize {
    constructor() {
        let logger = settings.debug ? console.log : false;
        super('database', 'username', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: logger,
            storage: './database/database.sqlite',
            transactionType: Transaction.TYPES.IMMEDIATE,
            retry: {
                max: 10,
            }
        });
    }
}

module.exports = Database;