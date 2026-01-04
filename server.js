const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { registerUser, loginUser } = require('./auth');
const { addBook, searchBooks, getAllBooks, getBookById } = require('./bookService');
const { borrowBook, returnBook, getBorrowRecords, getBorrowRanking } = require('./borrowService');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 用户注册
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ error: '用户名、密码和姓名不能为空' });
    }
    const user = await registerUser(username, password, name, email, phone);
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 用户登录
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    const user = await loginUser(username, password);
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// 图书入库
app.post('/api/books', async (req, res) => {
  try {
    const book = await addBook(req.body);
    res.json({ success: true, book });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 图书查询
app.get('/api/books/search', async (req, res) => {
  try {
    const { q, page = 1, pageSize = 10 } = req.query;
    if (!q) {
      return res.status(400).json({ error: '查询关键词不能为空' });
    }
    const result = await searchBooks(q, parseInt(page), parseInt(pageSize));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取所有图书
app.get('/api/books', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const result = await getAllBooks(parseInt(page), parseInt(pageSize));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单本书籍
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await getBookById(req.params.id);
    res.json({ success: true, book });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// 借书
app.post('/api/borrow', async (req, res) => {
  try {
    const { readerId, bookId } = req.body;
    if (!readerId || !bookId) {
      return res.status(400).json({ error: '读者ID和图书ID不能为空' });
    }
    const record = await borrowBook(readerId, bookId);
    res.json({ success: true, record });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 还书
app.post('/api/return', async (req, res) => {
  try {
    const { readerId, bookId } = req.body;
    if (!readerId || !bookId) {
      return res.status(400).json({ error: '读者ID和图书ID不能为空' });
    }
    const record = await returnBook(readerId, bookId);
    res.json({ success: true, record });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取用户借阅记录
app.get('/api/borrow/:readerId', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const result = await getBorrowRecords(req.params.readerId, parseInt(page), parseInt(pageSize));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 借阅排行榜
app.get('/api/ranking', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const ranking = await getBorrowRanking(parseInt(limit));
    res.json({ success: true, ranking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('请访问 http://localhost:3000/index.html 使用系统');
});