const chalk = require('chalk');
const moment = require('moment');

const { settings } = require('../../config.json');

module.exports = {
	timestamp: function (thread = 'Server') {
		return `[${moment().format('YYYY-MM-DD HH:mm:ss')}] [${thread} Thread]`;
	},
	info: function (content, thread = 'Server') {
		content = content.replace(new RegExp(`${__dirname}/`, 'g'), './');
		console.log(`${this.timestamp(thread)} ${chalk.black.bgWhite('[INFO]')} : ${content}`);
	},
	error: function (content, thread = 'Server') {
		content = content.replace(new RegExp(`${__dirname}/`, 'g'), './');
		console.log(`${this.timestamp(thread)} ${chalk.black.bgRed('[ERROR]')} : ${content}`);
		if (settings['tracing']) {
			console.log(chalk.black.bgRed('[ERROR_TRACE]'));
			console.trace(content);
			console.log(chalk.black.bgRed('[/ERROR_TRACE]'));
		}
	},
	warn: function (content, thread = 'Server') {
		content = content.replace(new RegExp(`${__dirname}/`, 'g'), './');
		if (settings['warnings']) {
			console.log(`${this.timestamp(thread)} ${chalk.black.bgYellow('[WARNING]')} : ${content}`);
			if (settings['tracing']) {
				console.log(chalk.black.bgYellow('[WARNING_TRACE]'));
				console.trace(content);
				console.log(chalk.black.bgYellow('[/WARNING_TRACE]'));
			}
		}
	},
	debug: function (content, thread = 'Server') {
		content = content.replace(new RegExp(`${__dirname}/`, 'g'), './');
		if (settings['debug']) {
			console.log(`${this.timestamp(thread)} ${chalk.black.bgGreen('[DEBUG]')} : ${content}`);
		}
	}
}