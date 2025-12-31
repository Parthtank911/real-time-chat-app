import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "chat_app"
});

db.connect(err => {
  if (err) console.log("DB Connection Error:", err);
  else console.log("MySQL Connected!");
});

export default db;
