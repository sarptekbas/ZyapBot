/**
 * @author kenan238
 * @summary Command parser
 */


/**
 * 
 * @summary Contains information about a command
 * @param {string} name 
 * @param {string} args 
 */
const commandObject = class {
    constructor(name, args) {
        this.name = name;
        this.args = args;
    }
    co_args() { this.args; }
    co_name() { this.name; }
};

/**
 * 
 * @summary Parser
 * @param {string} prefix 
 */
const commandParser = class {
    constructor(prefix = "!") {
        this.prefix = prefix;
        this.arg_separator = " ";
    }

    /**
     * 
     * @summary Parses a command
     * @param {string} cmd 
     * @returns commandObject or invalid
     */
    parse(cmd) {
        if(cmd === this.prefix) return "INVALID";
        else if (cmd.startsWith(this.prefix)) {
            cmd = cmd.replace(this.prefix, "");
            var name = cmd.split(" ")[0];
            cmd = cmd.replace(name, "");
            var args = cmd.split(this.arg_separator);
            if(args !== [""] && args.length > 1) {
                args = args.splice(1);
            }
            return new commandObject(name, args);
        }
        return "INVALID";
    }
};

// Export
module.exports = {
	commandParser,
	commandObject
};