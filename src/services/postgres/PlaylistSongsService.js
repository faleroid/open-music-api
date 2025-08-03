const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, songId) {
    const checkQuery = {
      text: 'SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const checkResult = await this._pool.query(checkQuery);
    if (checkResult.rowCount > 0) {
      throw new InvariantError('Lagu sudah ada di dalam playlist');
    }

    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    return result.rows[0].id;
  }

  async getSongsFromPlaylist(playlistId) {
    const playlistQuery = {
      text: `
      SELECT playlists.id, playlists.name, users.username
      FROM playlists
      JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1
    `,
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);

    if (!playlistResult.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = playlistResult.rows[0];

    const songsQuery = {
      text: `
      SELECT songs.id, songs.title, songs.performer
      FROM songs
      JOIN playlist_songs ON songs.id = playlist_songs.song_id
      WHERE playlist_songs.playlist_id = $1
    `,
      values: [playlistId],
    };
    const songsResult = await this._pool.query(songsQuery);

    return {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: songsResult.rows,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }
  }
}

module.exports = PlaylistSongsService;
