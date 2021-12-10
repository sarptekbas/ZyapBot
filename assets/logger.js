/**
 * @author kenan238
 * @summary Logger
 */

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
		for (var [key, val] in LogTypes) {
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
		fs.appendFile(this.outfile, format(type, from, content), err => {
	        if (err)
	        	console.error(`[LOGGER]: Failed to append to file: ${this.outfile}:\n${err}`);
	    });
	}
}

module.exports = {
	LogTypes,
	Logger
}