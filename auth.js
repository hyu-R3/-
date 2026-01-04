const bcrypt = require('bcrypt');
const db = require('./database');

const SALT_ROUNDS = 10;

// 用户注册
async function registerUser(username, password, name, email, phone) {
  return new Promise((resolve, reject) => {
    // 检查用户名是否已存在
    db.get('SELECT id FROM readers WHERE username = ?', [username], async (err, user) => {
      if (err) {
        return reject(err);
      }
      if (user) {
        return reject(new Error('用户名已存在'));
      }

      // 加密密码
      try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        db.run(
          'INSERT INTO readers (username, password, name, email, phone) VALUES (?, ?, ?, ?, ?)',
          [username, hashedPassword, name, email, phone],
          function(err) {
            if (err) {
              return reject(err);
            }
            resolve({ id: this.lastID, username, name, email, phone });
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 用户登录
async function loginUser(username, password) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM readers WHERE username = ?', [username], async (err, user) => {
      if (err) {
        return reject(err);
      }
      if (!user) {
        return reject(new Error('用户名或密码错误'));
      }

      try {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          resolve({
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            phone: user.phone
          });
        } else {
          reject(new Error('用户名或密码错误'));
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = { registerUser, loginUser };