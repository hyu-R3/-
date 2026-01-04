const db = require('./database');

// 图书入库
function addBook(bookData) {
  return new Promise((resolve, reject) => {
    const { isbn, title, author, publisher, publish_date, category, total_quantity, price, description } = bookData;
    
    db.run(
      `INSERT INTO books (isbn, title, author, publisher, publish_date, category, total_quantity, available_quantity, price, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [isbn, title, author, publisher, publish_date, category, total_quantity, total_quantity, price, description],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return reject(new Error('ISBN已存在'));
          }
          return reject(err);
        }
        resolve({ id: this.lastID, ...bookData });
      }
    );
  });
}

// 图书查询
function searchBooks(query, page = 1, pageSize = 10) {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * pageSize;
    const searchPattern = `%${query}%`;
    
    // 获取总数
    db.get(
      'SELECT COUNT(*) as total FROM books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?',
      [searchPattern, searchPattern, searchPattern],
      (err, countResult) => {
        if (err) return reject(err);
        
        // 获取分页数据
        db.all(
          `SELECT * FROM books 
           WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? 
           ORDER BY add_date DESC 
           LIMIT ? OFFSET ?`,
          [searchPattern, searchPattern, searchPattern, pageSize, offset],
          (err, books) => {
            if (err) return reject(err);
            
            resolve({
              books,
              total: countResult.total,
              page,
              pageSize,
              totalPages: Math.ceil(countResult.total / pageSize)
            });
          }
        );
      }
    );
  });
}

// 获取所有图书（分页）
function getAllBooks(page = 1, pageSize = 10) {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * pageSize;
    
    db.get('SELECT COUNT(*) as total FROM books', (err, countResult) => {
      if (err) return reject(err);
      
      db.all(
        'SELECT * FROM books ORDER BY add_date DESC LIMIT ? OFFSET ?',
        [pageSize, offset],
        (err, books) => {
          if (err) return reject(err);
          
          resolve({
            books,
            total: countResult.total,
            page,
            pageSize,
            totalPages: Math.ceil(countResult.total / pageSize)
          });
        }
      );
    });
  });
}

// 获取单本书籍详情
function getBookById(bookId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, book) => {
      if (err) return reject(err);
      if (!book) return reject(new Error('图书不存在'));
      resolve(book);
    });
  });
}

module.exports = { addBook, searchBooks, getAllBooks, getBookById };