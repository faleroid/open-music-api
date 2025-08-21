const UploadsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "uploads",
  version: "1.0.0",
  register: async (server, { storageService, albumsService, validator }) => {
    const uploadsHandler = new UploadsHandler(
      storageService,
      albumsService,
      validator,
    );

    console.log('ini testing index.js');
    console.log(routes(uploadsHandler));
    
    server.route(routes(uploadsHandler));
  },
};
