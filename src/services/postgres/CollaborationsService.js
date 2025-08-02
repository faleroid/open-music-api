const { Pool } = require('pg');
const { nanoid } = require('nanoid');
// const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError')
const NotFoundError = require('../../exceptions/NotFoundError')

class CollaborationsService {
  constructor(usersService) {
    this._pool = new Pool();
    this._usersService = usersService;
  }

  async addCollaboration(playlistId, userId) {
  await this._usersService.getUserById(userId);

  const id = `collab-${nanoid(16)}`;
  const query = {
    text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
    values: [id, playlistId, userId],
  };

  const result = await this._pool.query(query);

  if (!result.rows.length) {
    throw new NotFoundError('User tidak ditemukan');
  }

  return result.rows[0].id;
}

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationsService;