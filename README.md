# 图书馆管理系统

一个功能完整的图书馆管理系统，支持图书入库、查询、借阅、归还和排行榜功能。

## 功能特性

- ✅ 用户注册/登录（密码使用bcrypt加密存储）
- ✅ 图书入库管理
- ✅ 图书搜索（支持书名、作者、ISBN查询）
- ✅ 图书借阅/归还
- ✅ 借阅记录查询
- ✅ 热门图书排行榜
- ✅ 响应式Web界面
- ✅ 性能优化（响应时间 < 1.5秒）

## 技术栈

- **后端**: Node.js + Express.js
- **数据库**: SQLite3
- **前端**: HTML + Bootstrap 5
- **密码加密**: bcrypt
- **性能优化**: 数据库索引、分页查询

## 安装运行

### 1. 安装依赖

```bash
cd library_system
npm install
```

### 2. 启动服务器

```bash
npm start
```

### 3. 访问系统

打开浏览器访问: http://localhost:3000/index.html

## 使用说明

### 用户注册
1. 点击"注册"标签
2. 填写用户名、密码、姓名等信息
3. 点击"注册"按钮

### 用户登录
1. 输入用户名和密码
2. 点击"登录"按钮

### 图书入库
1. 登录后点击"图书入库"按钮
2. 填写图书信息（ISBN、书名、作者等为必填项）
3. 点击"确认入库"

### 图书查询
1. 在搜索框输入关键词（书名、作者或ISBN）
2. 点击"搜索"按钮或按回车键

### 借书
1. 在图书列表中找到想借的书
2. 确认该书有库存（显示"可借"）
3. 点击"借阅"按钮

### 还书
1. 点击"我的借阅"查看借阅记录
2. 找到需要归还的书
3. 点击"归还"按钮

### 查看排行榜
1. 点击"借阅排行榜"
2. 查看热门图书排名

## 数据库结构

### readers（读者表）
- id: 用户ID
- username: 用户名
- password: 密码（加密存储）
- name: 姓名
- email: 邮箱
- phone: 电话
- register_date: 注册日期

### books（图书表）
- id: 图书ID
- isbn: ISBN编号
- title: 书名
- author: 作者
- publisher: 出版社
- publish_date: 出版日期
- category: 分类
- total_quantity: 总数量
- available_quantity: 可借数量
- price: 价格
- description: 简介
- add_date: 入库日期

### borrow_records（借阅记录表）
- id: 记录ID
- reader_id: 读者ID
- book_id: 图书ID
- borrow_date: 借阅日期
- return_date: 归还日期
- due_date: 应还日期
- status: 状态（borrowed/returned）

## 性能优化

1. **数据库索引**: 为常用查询字段创建索引
2. **分页查询**: 所有列表都支持分页，避免一次性加载大量数据
3. **连接池**: 使用SQLite3连接管理
4. **前端优化**: 使用CDN加载静态资源

## 安全特性

- 密码使用bcrypt加密存储（salt rounds: 10）
- SQL注入防护（使用参数化查询）
- 响应式输入验证

## API接口

### 认证接口
- POST /api/register - 用户注册
- POST /api/login - 用户登录

### 图书接口
- POST /api/books - 图书入库
- GET /api/books - 获取图书列表
- GET /api/books/search - 搜索图书
- GET /api/books/:id - 获取图书详情

### 借阅接口
- POST /api/borrow - 借书
- POST /api/return - 还书
- GET /api/borrow/:readerId - 获取借阅记录

### 排行榜接口
- GET /api/ranking - 获取借阅排行榜

## 注意事项

- 默认借阅期限为30天
- 每本书同一用户只能借阅一本
- 系统会自动检查图书库存

## 许可证

ISC