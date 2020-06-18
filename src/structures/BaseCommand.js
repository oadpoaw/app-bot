
module.exports = class BaseCommand {
    constructor(commandName, options) {
        this.name = commandName;
        this.options = options;
    }
}