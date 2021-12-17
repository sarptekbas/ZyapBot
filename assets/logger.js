/**
 * @author kenan238
 * @summary Logger
 */

const fs = require("fs");

/**
 * 
 * @summary types of log messages
 */
const LogTypes = {
	INFO: 1,
	WARN: 2,
	HANDLED_ERROR: 3
};

/**
 * 
 * @summary Logger class
 * @param {string} outfile
 */
const Logger = class {
	constructor(outfile) {
		this.outfile = outfile;
	}

	/**
	 * 
	 * @summary convert to log message
	 * @param {LogTypes.*} type
	 * @param {string} from
	 * @param {string} content
	 */
	format(type, from, content) {
		return `[${this.logTypeToStr(type)} - ${from}]: ${content}`;
	}

	/**
	 * 
	 * @summary log type to string
	 * @param {LogTypes.*} type
	 */
	logTypeToStr(type) {
        var entries = Object.entries(LogTypes);
		for (let i = 0; i < entries.length; i++) {
            var key = entries[i][0];
            var val = entries[i][1];
			if (val === type)
				return key;
		}
		return 'INVALID_TYPE';
	}

	/**
	 * 
	 * @summary log the thing
	 * @param {LogTypes.*}
	 * @param {string} from
	 * @param {string} content
	 */
	log(type, from, content) {
		fs.appendFile(this.outfile, this.format(type, from, content) + "\n", err => {
	        if (err)
	        	console.error(`[LOGGER]: Failed to append to file: ${this.outfile}:\n${err}`);
	    });
	}
}

module.exports = {
	LogTypes,
	Logger
}