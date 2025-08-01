require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const albums = require('./api/albums');
const songs = require('./api/songs');
const AlbumsService = require('./services/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');
const ClientError = require('./exceptions/ClientError');
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const authentications = require('./api/authentications');
const AuthenticationsValidator = require('./validator/authentications');

const UsersService = require('./services/postgres/UsersService');
const users = require('./api/users');
const UsersValidator = require('./validator/users');



const init = async () => {

    const albumsService = new AlbumsService();
    const songsService = new SongsService();
    const playlistsService = new PlaylistsService();
    const authenticationsService = new AuthenticationsService();



    const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
        cors: {
        origin: ['*'],
        },
    },
    });

    await server.register([
    {
        Jwt,
    },
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
        service: AuthenticationsService,
        usersService: UsersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
    },
    },
    {
        plugin: users,
        options: {
            service: UsersService,
            validator: UsersValidator,
        },
    },
    ]);

    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
        if (response instanceof ClientError) {
        const newResponse = h.response({
            status: 'fail',
            message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
        }

        if (!response.isServer) {
        return h.continue;
        }

        const newResponse = h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server',
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