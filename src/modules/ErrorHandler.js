module.exports = async (client) => {
    process.on('unhandledRejection', (err) => {
        const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
        client.logger.error(`Unhandled Rejection: ${errorMsg}`);
    });
    process.on('warning', (err) => {
        const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
        client.logger.warn(errorMsg);
    });
    process.on('uncaughtException', (err) => {
        const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
        client.logger.error(`Uncaught Exception: ${errorMsg}`);
        process.exit(1);
    });
}