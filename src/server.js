require("dotenv").config();
const path = require('path');
const Inert = require('@hapi/inert');

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const ClientError = require("./exceptions/ClientError");

const albums = require("./api/albums");
const AlbumsService = require("./services/postgres/AlbumService");
const AlbumsValidator = require("./validator/albums");

const songs = require("./api/songs");
const SongsService = require("./services/postgres/SongsService");
const SongsValidator = require("./validator/songs");

const playlists = require("./api/playlists");
const PlaylistService = require("./services/postgres/PlayListsService");
const PlaylistsValidator = require("./validator/playlists");

const AuthenticationsService = require("./services/postgres/AuthenticationsService");
const TokenManager = require("./tokenize/TokenManager");
const authentications = require("./api/authentications");
const AuthenticationsValidator = require("./validator/authentications");

const UsersService = require("./services/postgres/UsersService");
const users = require("./api/users");
const UsersValidator = require("./validator/users");

const collaborations = require("./api/collaborations");
const CollaborationsService = require("./services/postgres/CollaborationsService");
const CollaborationsValidator = require("./validator/collaborations");

const playlistactivities = require("./api/playlistactivities");
const PlaylistActivitiesService = require("./services/postgres/PlaylistActivitiesService");

const playlistSongs = require("./api/playlistsongs");
const PlaylistSongsValidator = require("./validator/playlistsongs");
const PlaylistSongsService = require("./services/postgres/PlaylistSongsService");

const _exports = require("./api/exports");
const ProducerService = require("./services/rabbitmq/ProducerService");
const ExportsValidator = require("./validator/exports");

const uploads = require("./api/uploads");
const StorageService = require("./services/storage/StorageService");
const UploadsValidator = require("./validator/uploads");

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const collaborationsService = new CollaborationsService(usersService);
  const playlistsService = new PlaylistService(collaborationsService);
  const authenticationsService = new AuthenticationsService();
  const playlistActivitiesService = new PlaylistActivitiesService();
  const playlistSongsService = new PlaylistSongsService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
    plugin: Jwt,
    },
    {
      plugin: Inert,
    }
  ]);

  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => {
      return {
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.id,
        },
      };
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        service: authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: playlistactivities,
      options: {
        service: playlistActivitiesService,
        playlistsService,
      },
    },
    {
      plugin: playlistSongs,
      options: {
        playlistSongsService,
        playlistsService,
        songsService,
        playlistActivitiesService,
        validator: PlaylistSongsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        playlistsService: playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        storageService: storageService, 
        albumsService: albumsService,
        validator: UploadsValidator,
    },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server",
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
