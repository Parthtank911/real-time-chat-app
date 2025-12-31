import db from "../config/db.js";

export const chatPage = (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.render("chat", { user: req.session.user });
};

export const users = (req, res) => {
  db.query(
    "SELECT id, name FROM users WHERE id != ?",
    [req.session.user.id],
    (err, rows) => res.json(rows)
  );
};

export const fetchMessages = (req, res) => {
  const myId = req.session.user.id;
  const otherId = req.query.with;

  db.query(
    `SELECT id, sender_id, receiver_id, message, seen
     FROM messages
     WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)
     ORDER BY created_at ASC`,
    [myId, otherId, otherId, myId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
};
