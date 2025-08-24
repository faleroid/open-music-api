const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: `INSERT INTO playlist_song_activities 
             (id, playlist_id, song_id, user_id, action, time)
             VALUES ($1, $2, $3, $4, $5, $6)`,
      values: [id, playlistId, songId, userId, action, time],
    };

    await this._pool.query(query);
  }

  async getActivities(playlistId) {
    const query = {
      text: `
        SELECT u.username, s.title, a.action, a.time
        FROM playlist_song_activities a
        JOIN users u ON u.id = a.user_id
        JOIN songs s ON s.id = a.song_id
        WHERE a.playlist_id = $1
        ORDER BY a.time ASC`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return {
      playlistId,
      activities: result.rows.map((row) => ({
        username: row.username,
        title: row.title,
        action: row.action,
        time: row.time,
      })),
    };
  }
}

module.exports = PlaylistActivitiesService;
