import db from "../config/db.js";

export const showLogin = (req, res) => res.render("login");
export const showRegister = (req, res) => res.render("register");

export const login = (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, users) => {
      if (err) return res.send("Database error");
      if (users.length === 0) return res.send("Invalid credentials");

      req.session.user = users[0];
      res.redirect("/chat");
    }
  );
};

export const register = (req, res) => {
  const { name, email, password } = req.body;
  db.query("SELECT * FROM users WHERE email=?", [email], (err, rows) => {
    if (err) return res.send("Database error");
    if (rows.length > 0) return res.send("Email already registered");

    db.query(
      "INSERT INTO users (name,email,password) VALUES (?,?,?)",
      [name, email, password],
      (err, result) => {
        if (err) return res.send("Database error");
        req.session.user = { id: result.insertId, name, email };
        res.redirect("/chat");
      }
    );
  });
};

export const logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};
