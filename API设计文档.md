# 图书馆管理系统 - API设计文档

## 概述

本文档详细描述图书馆管理系统的RESTful API接口设计，包括请求格式、响应格式、错误处理等。

---

## 基础信息

### Base URL
```
http://localhost:3000/api
```

### 通用响应格式

#### 成功响应
```json
{
  "success": true,
  "data": { ... }
}
```

#### 错误响应
```json
{
  "success": false,
  "error": "错误信息"
}
```

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 认证相关API

### 1. 用户注册

**接口地址**: `POST /api/register`

**请求参数**:
```json
{
  "username": "string (必填, 3-20字符)",
  "password": "string (必填, 6-20字符)",
  "name": "string (必填, 2-20字符)",
  "email": "string (可选, 邮箱格式)",
  "phone": "string (可选, 手机号格式)"
}
```

**响应示例**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "testuser",
    "name": "测试用户",
    "email": "test@example.com",
    "phone": "13800138000"
  }
}
```

**错误响应**:
```json
{
  "error": "用户名已存在"
}
```

**注意事项**:
- 密码使用bcrypt加密存储（salt rounds: 10）
- 用户名必须唯一
- 返回的用户信息不包含密码

---

### 2. 用户登录

**接口地址**: `POST /api/login`

**请求参数**:
```json
{
  "username": "string (必填)",
  "password": "string (必填)"
}
```

**响应示例**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "testuser",
    "name": "测试用户",
    "email": "test@example.com",
    "phone": "13800138000"
  }
}
```

**错误响应**:
```json
{
  "error": "用户名或密码错误"
}
```

**注意事项**:
- 使用bcrypt.compare验证密码
- 登录成功后应在前端保存用户信息
- 当前版本未实现JWT或Session，客户端需自行管理登录状态

---

## 图书管理API

### 3. 图书入库

**接口地址**: `POST /api/books`

**请求参数**:
```json
{
  "isbn": "string (必填, 10-13位数字)",
  "title": "string (必填, 1-100字符)",
  "author": "string (必填, 1-50字符)",
  "publisher": "string (可选, 1-50字符)",
  "publish_date": "string (可选, YYYY-MM-DD格式)",
  "category": "string (可选, 1-30字符)",
  "total_quantity": "number (必填, >=1)",
  "price": "number (可选, >=0)",
  "description": "string (可选, 最多500字符)"
}
```

**响应示例**:
```json
{
  "success": true,
  "book": {
    "id": 1,
    "isbn": "9787111111111",
    "title": "JavaScript高级程序设计",
    "author": "Nicholas C. Zakas",
    "publisher": "人民邮电出版社",
    "publish_date": "2020-01-01",
    "category": "编程",
    "total_quantity": 5,
    "available_quantity": 5,
    "price": 99.00,
    "description": "JavaScript经典教程",
    "add_date": "2026-01-04T07:00:00.000Z"
  }
}
```

**错误响应**:
```json
{
  "error": "ISBN已存在"
}
```

**注意事项**:
- ISBN必须唯一
- available_quantity初始值等于total_quantity
- 自动记录入库时间

---

### 4. 获取图书列表

**接口地址**: `GET /api/books`

**请求参数**:
```
page: number (可选, 默认1, >=1)
pageSize: number (可选, 默认10, 1-100)
```

**请求示例**:
```
GET /api/books?page=1&pageSize=10
```

**响应示例**:
```json
{
  "books": [
    {
      "id": 1,
      "isbn": "9787111111111",
      "title": "JavaScript高级程序设计",
      "author": "Nicholas C. Zakas",
      "publisher": "人民邮电出版社",
      "publish_date": "2020-01-01",
      "category": "编程",
      "total_quantity": 5,
      "available_quantity": 3,
      "price": 99.00,
      "description": "JavaScript经典教程",
      "add_date": "2026-01-04T07:00:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "pageSize": 10,
  "totalPages": 2
}
```

**注意事项**:
- 按入库时间倒序排列
- 使用分页避免返回过多数据
- total表示总记录数

---

### 5. 搜索图书

**接口地址**: `GET /api/books/search`

**请求参数**:
```
q: string (必填, 搜索关键词)
page: number (可选, 默认1)
pageSize: number (可选, 默认10)
```

**请求示例**:
```
GET /api/books/search?q=JavaScript&page=1&pageSize=10
```

**响应示例**:
```json
{
  "books": [
    {
      "id": 1,
      "isbn": "9787111111111",
      "title": "JavaScript高级程序设计",
      "author": "Nicholas C. Zakas",
      "publisher": "人民邮电出版社",
      "publish_date": "2020-01-01",
      "category": "编程",
      "total_quantity": 5,
      "available_quantity": 3,
      "price": 99.00,
      "description": "JavaScript经典教程",
      "add_date": "2026-01-04T07:00:00.000Z"
    }
  ],
  "total": 3,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

**注意事项**:
- 同时搜索书名、作者、ISBN字段
- 使用LIKE模糊匹配
- 支持部分关键词匹配

---

### 6. 获取图书详情

**接口地址**: `GET /api/books/:id`

**请求参数**:
```
id: number (必填, 图书ID)
```

**请求示例**:
```
GET /api/books/1
```

**响应示例**:
```json
{
  "success": true,
  "book": {
    "id": 1,
    "isbn": "9787111111111",
    "title": "JavaScript高级程序设计",
    "author": "Nicholas C. Zakas",
    "publisher": "人民邮电出版社",
    "publish_date": "2020-01-01",
    "category": "编程",
    "total_quantity": 5,
    "available_quantity": 3,
    "price": 99.00,
    "description": "JavaScript经典教程",
    "add_date": "2026-01-04T07:00:00.000Z"
  }
}
```

**错误响应**:
```json
{
  "error": "图书不存在"
}
```

---

## 借阅管理API

### 7. 借书

**接口地址**: `POST /api/borrow`

**请求参数**:
```json
{
  "readerId": "number (必填, 读者ID)",
  "bookId": "number (必填, 图书ID)"
}
```

**响应示例**:
```json
{
  "success": true,
  "record": {
    "id": 1,
    "readerId": 1,
    "bookId": 1,
    "borrowDate": "2026-01-04T07:00:00.000Z",
    "dueDate": "2026-02-03T07:00:00.000Z"
  }
}
```

**错误响应**:
```json
{
  "error": "图书已借完"
}
```

**注意事项**:
- 使用数据库事务确保原子性
- 检查图书库存（available_quantity > 0）
- 检查用户是否已借阅该书且未归还
- 默认借阅期限30天
- 自动减少available_quantity

---

### 8. 还书

**接口地址**: `POST /api/return`

**请求参数**:
```json
{
  "readerId": "number (必填, 读者ID)",
  "bookId": "number (必填, 图书ID)"
}
```

**响应示例**:
```json
{
  "success": true,
  "record": {
    "id": 1,
    "returnDate": "2026-01-10T07:00:00.000Z",
    "status": "returned"
  }
}
```

**错误响应**:
```json
{
  "error": "未找到借阅记录"
}
```

**注意事项**:
- 使用数据库事务确保原子性
- 查找状态为'borrowed'的借阅记录
- 自动增加available_quantity
- 更新借阅记录状态为'returned'
- 记录归还时间

---

### 9. 获取借阅记录

**接口地址**: `GET /api/borrow/:readerId`

**请求参数**:
```
readerId: number (必填, 读者ID)
page: number (可选, 默认1)
pageSize: number (可选, 默认10)
```

**请求示例**:
```
GET /api/borrow/1?page=1&pageSize=10
```

**响应示例**:
```json
{
  "records": [
    {
      "id": 1,
      "reader_id": 1,
      "book_id": 1,
      "title": "JavaScript高级程序设计",
      "author": "Nicholas C. Zakas",
      "isbn": "9787111111111",
      "borrow_date": "2026-01-04T07:00:00.000Z",
      "return_date": null,
      "due_date": "2026-02-03T07:00:00.000Z",
      "status": "borrowed"
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

**注意事项**:
- 使用JOIN查询图书信息
- 按借阅时间倒序排列
- status字段: 'borrowed'（借阅中）或'returned'（已归还）

---

## 统计分析API

### 10. 借阅排行榜

**接口地址**: `GET /api/ranking`

**请求参数**:
```
limit: number (可选, 默认10, 1-100)
```

**请求示例**:
```
GET /api/ranking?limit=10
```

**响应示例**:
```json
{
  "success": true,
  "ranking": [
    {
      "id": 1,
      "title": "JavaScript高级程序设计",
      "author": "Nicholas C. Zakas",
      "isbn": "9787111111111",
      "borrow_count": 15
    },
    {
      "id": 2,
      "title": "Python编程从入门到实践",
      "author": "Eric Matthes",
      "isbn": "9787111111112",
      "borrow_count": 12
    }
  ]
}
```

**注意事项**:
- 按借阅次数降序排列
- 使用LEFT JOIN包含未借阅过的图书
- borrow_count为0表示从未被借阅

---

## 数据模型

### readers（读者表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 主键 | PRIMARY KEY, AUTOINCREMENT |
| username | TEXT | 用户名 | UNIQUE, NOT NULL |
| password | TEXT | 密码（加密） | NOT NULL |
| name | TEXT | 姓名 | NOT NULL |
| email | TEXT | 邮箱 | |
| phone | TEXT | 电话 | |
| register_date | DATETIME | 注册时间 | DEFAULT CURRENT_TIMESTAMP |

### books（图书表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 主键 | PRIMARY KEY, AUTOINCREMENT |
| isbn | TEXT | ISBN编号 | UNIQUE, NOT NULL |
| title | TEXT | 书名 | NOT NULL |
| author | TEXT | 作者 | NOT NULL |
| publisher | TEXT | 出版社 | |
| publish_date | TEXT | 出版日期 | |
| category | TEXT | 分类 | |
| total_quantity | INTEGER | 总数量 | DEFAULT 1 |
| available_quantity | INTEGER | 可借数量 | DEFAULT 1 |
| price | REAL | 价格 | |
| description | TEXT | 简介 | |
| add_date | DATETIME | 入库时间 | DEFAULT CURRENT_TIMESTAMP |

### borrow_records（借阅记录表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 主键 | PRIMARY KEY, AUTOINCREMENT |
| reader_id | INTEGER | 读者ID | FOREIGN KEY, NOT NULL |
| book_id | INTEGER | 图书ID | FOREIGN KEY, NOT NULL |
| borrow_date | DATETIME | 借阅时间 | DEFAULT CURRENT_TIMESTAMP |
| return_date | DATETIME | 归还时间 | |
| due_date | DATETIME | 应还时间 | |
| status | TEXT | 状态 | DEFAULT 'borrowed' |

---

## 数据库索引

### 性能优化索引

```sql
-- 图书表索引
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_isbn ON books(isbn);

-- 借阅记录表索引
CREATE INDEX idx_borrow_reader ON borrow_records(reader_id);
CREATE INDEX idx_borrow_book ON borrow_records(book_id);
CREATE INDEX idx_borrow_status ON borrow_records(status);
```

### 索引说明

| 索引名 | 表 | 字段 | 用途 |
|--------|-----|------|------|
| idx_books_title | books | title | 加速按书名搜索 |
| idx_books_author | books | author | 加速按作者搜索 |
| idx_books_isbn | books | isbn | 加速按ISBN查询 |
| idx_borrow_reader | borrow_records | reader_id | 加速查询用户借阅记录 |
| idx_borrow_book | borrow_records | book_id | 加速查询图书借阅记录 |
| idx_borrow_status | borrow_records | status | 加速按状态筛选 |

---

## 错误处理

### 错误码定义

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 常见错误信息

| 错误信息 | 场景 |
|----------|------|
| 用户名已存在 | 注册时用户名重复 |
| 用户名或密码错误 | 登录时凭证错误 |
| 用户名、密码和姓名不能为空 | 注册或登录时缺少必填项 |
| ISBN已存在 | 入库时ISBN重复 |
| 图书不存在 | 查询不存在的图书 |
| 图书已借完 | 借阅时图书库存为0 |
| 您已借阅该书，请先归还 | 重复借阅同一本书 |
| 未找到借阅记录 | 归还不存在的借阅记录 |
| 读者ID和图书ID不能为空 | 借阅或归还时缺少参数 |

---

## 安全性设计

### 1. 密码安全
- 使用bcrypt加密存储密码
- Salt rounds设置为10
- 不在响应中返回密码

### 2. SQL注入防护
- 所有数据库操作使用参数化查询
- 不拼接SQL字符串
- 使用prepared statements

### 3. 输入验证
- 前端验证：必填项、格式检查
- 后端验证：类型检查、长度限制
- 参数化查询：防止注入攻击

### 4. 事务处理
- 借阅和归还操作使用数据库事务
- 确保数据一致性
- 失败时自动回滚

---

## 性能优化

### 1. 数据库优化
- 为常用查询字段创建索引
- 使用分页查询减少数据传输
- 使用JOIN优化关联查询
- 使用聚合函数优化统计查询

### 2. 查询优化
```sql
-- 使用索引的查询
SELECT * FROM books WHERE title LIKE '%关键词%';
SELECT * FROM books WHERE isbn = '9787111111111';

-- 分页查询
SELECT * FROM books ORDER BY add_date DESC LIMIT 10 OFFSET 0;

-- 统计查询
SELECT b.*, COUNT(br.id) as borrow_count
FROM books b
LEFT JOIN borrow_records br ON b.id = br.book_id
GROUP BY b.id
ORDER BY borrow_count DESC;
```

### 3. 响应时间目标
- 所有API响应时间 < 1.5秒
- 简单查询 < 0.5秒
- 复杂查询 < 1.5秒

---

## 使用示例

### JavaScript示例

```javascript
// 用户注册
async function register(username, password, name) {
  const response = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, name })
  });
  const data = await response.json();
  console.log(data);
}

// 用户登录
async function login(username, password) {
  const response = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  console.log(data);
}

// 搜索图书
async function searchBooks(query) {
  const response = await fetch(`http://localhost:3000/api/books/search?q=${query}`);
  const data = await response.json();
  console.log(data);
}

// 借书
async function borrowBook(readerId, bookId) {
  const response = await fetch('http://localhost:3000/api/borrow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ readerId, bookId })
  });
  const data = await response.json();
  console.log(data);
}
```

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-01-04 | 初始版本 |

---

## 注意事项

1. **认证机制**: 当前版本未实现JWT或Session，客户端需自行管理登录状态
2. **并发控制**: 使用数据库事务确保并发操作的数据一致性
3. **错误处理**: 所有错误都返回统一的错误格式
4. **分页参数**: page从1开始，不是从0开始
5. **日期格式**: 使用ISO 8601格式（YYYY-MM-DDTHH:mm:ss.sssZ）
6. **密码安全**: 永远不要在响应中返回密码字段
7. **参数验证**: 前后端都应进行参数验证
8. **性能监控**: 建议添加API响应时间监控

---

## 扩展建议

### 短期扩展
1. 添加JWT认证机制
2. 实现API限流
3. 添加操作日志
4. 实现数据导出功能

### 中期扩展
1. 添加图书预约功能
2. 实现超期罚款系统
3. 添加图书评价功能
4. 实现批量导入功能

### 长期扩展
1. 迁移到MySQL/PostgreSQL
2. 添加Redis缓存
3. 实现全文搜索
4. 开发移动端API