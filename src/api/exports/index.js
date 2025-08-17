const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, playlistsService, validator }) => {
    const exportsHandler = new ExportsHandler(service, playlistsService, validator);
    console.log('--- METHOD YANG TERSEDIA DI HANDLER ---');
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(exportsHandler)));
    server.route(routes(exportsHandler));
  },
};
