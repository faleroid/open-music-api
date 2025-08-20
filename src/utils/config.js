require("dotenv").config();

const config = {
  app: {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
};

module.exports = config;
