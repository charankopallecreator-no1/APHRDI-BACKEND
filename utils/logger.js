const { createLogger, format, transports } = require('winston');

const { combine, timestamp, json } = format;

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const logger = createLogger({
  level,
  format: combine(timestamp(), json()),
  transports: [new transports.Console()],
});

// Stream interface for morgan
logger.stream = {
  write: (message) => {
    // morgan adds a newline — trim to keep logs tidy
    logger.info(message.trim());
  },
};

module.exports = logger;
