const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'library.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('数据库连接成功');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
    // 读者表
    db.run(`CREATE TABLE IF NOT EXISTS readers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      register_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 图书表
    db.run(`CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      isbn TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      publisher TEXT,
      publish_date TEXT,
      category TEXT,
      total_quantity INTEGER DEFAULT 1,
      available_quantity INTEGER DEFAULT 1,
      price REAL,
      description TEXT,
      add_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 借阅记录表
    db.run(`CREATE TABLE IF NOT EXISTS borrow_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reader_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      return_date DATETIME,
      due_date DATETIME,
      status TEXT DEFAULT 'borrowed',
      FOREIGN KEY (reader_id) REFERENCES readers(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    )`);

    // 创建索引以提升查询性能
    db.run(`CREATE INDEX IF NOT EXISTS idx_books_title ON books(title)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_books_author ON books(author)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_borrow_reader ON borrow_records(reader_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_borrow_book ON borrow_records(book_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_borrow_status ON borrow_records(status)`);
  });
}

module.exports = db;