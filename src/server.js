require('dotenv').config();
const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const songs = require('./api/songs');
const AlbumsService = require('./services/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');
const ClientError = require('./exceptions/ClientError');

const init = async () => {

    const albumsService = new AlbumsService();
    const songsService = new SongsService();

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
    }
    ]);

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