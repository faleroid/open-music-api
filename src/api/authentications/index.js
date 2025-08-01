const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  register: async (server, { service, usersService, tokenManager, validator }) => {
    const handler = new AuthenticationsHandler(service, usersService, tokenManager, validator);
    server.route(routes(handler));
  },
};
