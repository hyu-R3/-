const db = require('./database');

// 借书
function borrowBook(readerId, bookId, borrowDays = 30) {
  return new Promise((resolve, reject) => {
    // 检查图书是否存在且有库存
    db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, book) => {
      if (err) return reject(err);
      if (!book) return reject(new Error('图书不存在'));
      if (book.available_quantity <= 0) return reject(new Error('图书已借完'));
      
      // 检查用户是否已借阅该书且未归还
      db.get(
        'SELECT * FROM borrow_records WHERE reader_id = ? AND book_id = ? AND status = ?',
        [readerId, bookId, 'borrowed'],
        (err, existingRecord) => {
          if (err) return reject(err);
          if (existingRecord) return reject(new Error('您已借阅该书，请先归还'));
          
          // 计算应还日期
          const borrowDate = new Date();
          const dueDate = new Date(borrowDate);
          dueDate.setDate(dueDate.getDate() + borrowDays);
          
          // 开始事务
          db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            // 减少可借数量
            db.run(
              'UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ?',
              [bookId],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
              }
            );
            
            // 插入借阅记录
            db.run(
              'INSERT INTO borrow_records (reader_id, book_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
              [readerId, bookId, borrowDate.toISOString(), dueDate.toISOString(), 'borrowed'],
              function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
                
                db.run('COMMIT');
                resolve({
                  id: this.lastID,
                  readerId,
                  bookId,
                  borrowDate,
                  dueDate
                });
              }
            );
          });
        }
      );
    });
  });
}

// 还书
function returnBook(readerId, bookId) {
  return new Promise((resolve, reject) => {
    // 查找借阅记录
    db.get(
      'SELECT * FROM borrow_records WHERE reader_id = ? AND book_id = ? AND status = ?',
      [readerId, bookId, 'borrowed'],
      (err, record) => {
        if (err) return reject(err);
        if (!record) return reject(new Error('未找到借阅记录'));
        
        const returnDate = new Date();
        
        // 开始事务
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          
          // 增加可借数量
          db.run(
            'UPDATE books SET available_quantity = available_quantity + 1 WHERE id = ?',
            [bookId],
            (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
            }
          );
          
          // 更新借阅记录
          db.run(
            'UPDATE borrow_records SET return_date = ?, status = ? WHERE id = ?',
            [returnDate.toISOString(), 'returned', record.id],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
              
              db.run('COMMIT');
              resolve({
                id: record.id,
                returnDate,
                status: 'returned'
              });
            }
          );
        });
      }
    );
  });
}

// 获取用户借阅记录
function getBorrowRecords(readerId, page = 1, pageSize = 10) {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * pageSize;
    
    db.get(
      'SELECT COUNT(*) as total FROM borrow_records WHERE reader_id = ?',
      [readerId],
      (err, countResult) => {
        if (err) return reject(err);
        
        db.all(
          `SELECT br.*, b.title, b.author, b.isbn 
           FROM borrow_records br 
           JOIN books b ON br.book_id = b.id 
           WHERE br.reader_id = ? 
           ORDER BY br.borrow_date DESC 
           LIMIT ? OFFSET ?`,
          [readerId, pageSize, offset],
          (err, records) => {
            if (err) return reject(err);
            
            resolve({
              records,
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

// 借阅排行榜
function getBorrowRanking(limit = 10) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT b.id, b.title, b.author, b.isbn, COUNT(br.id) as borrow_count
       FROM books b
       LEFT JOIN borrow_records br ON b.id = br.book_id
       GROUP BY b.id
       ORDER BY borrow_count DESC
       LIMIT ?`,
      [limit],
      (err, ranking) => {
        if (err) return reject(err);
        resolve(ranking);
      }
    );
  });
}

module.exports = { borrowBook, returnBook, getBorrowRecords, getBorrowRanking };