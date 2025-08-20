exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("user_album_likes", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "users",
      onDelete: "cascade",
    },
    album_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "albums",
      onDelete: "cascade",
    },
    created_at: {
      type: "TIMESTAMP",
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.addConstraint(
    "user_album_likes",
    "unique_user_album",
    "UNIQUE(user_id, album_id)",
  );
};

exports.down = (pgm) => {
  pgm.dropTable("user_album_likes");
};
