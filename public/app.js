// 全局变量
let currentUser = null;
let currentPage = 1;
let currentSearch = '';

// API基础URL
const API_BASE = '/api';

// 显示提示信息
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toastMessage.textContent = message;
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
}

// 登录
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    
    if (data.success) {
      currentUser = data.user;
      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('mainPage').style.display = 'block';
      document.getElementById('welcomeUser').textContent = `欢迎, ${currentUser.name}`;
      showSection('books');
      showToast('登录成功');
    } else {
      showToast(data.error, 'danger');
    }
  } catch (error) {
    showToast('登录失败，请重试', 'danger');
  }
});

// 注册
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const phone = document.getElementById('regPhone').value;
  
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name, email, phone })
    });
    const data = await response.json();
    
    if (data.success) {
      showToast('注册成功，请登录');
      document.querySelector('[data-bs-target="#login"]').click();
      document.getElementById('registerForm').reset();
    } else {
      showToast(data.error, 'danger');
    }
  } catch (error) {
    showToast('注册失败，请重试', 'danger');
  }
});

// 退出登录
function logout() {
  currentUser = null;
  document.getElementById('mainPage').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('loginForm').reset();
  showToast('已退出登录');
}

// 显示不同板块
function showSection(section) {
  document.getElementById('booksSection').style.display = 'none';
  document.getElementById('myBorrowsSection').style.display = 'none';
  document.getElementById('rankingSection').style.display = 'none';
  
  if (section === 'books') {
    document.getElementById('booksSection').style.display = 'block';
    loadBooks();
  } else if (section === 'myBorrows') {
    document.getElementById('myBorrowsSection').style.display = 'block';
    loadBorrows();
  } else if (section === 'ranking') {
    document.getElementById('rankingSection').style.display = 'block';
    loadRanking();
  }
}

// 加载图书列表
async function loadBooks(page = 1) {
  try {
    const url = currentSearch 
      ? `${API_BASE}/books/search?q=${encodeURIComponent(currentSearch)}&page=${page}&pageSize=10`
      : `${API_BASE}/books?page=${page}&pageSize=10`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    displayBooks(data.books);
    displayPagination(data, 'books');
    currentPage = page;
  } catch (error) {
    showToast('加载图书失败', 'danger');
  }
}

// 搜索图书
function searchBooks() {
  currentSearch = document.getElementById('searchInput').value.trim();
  currentPage = 1;
  loadBooks(currentPage);
}

// 显示图书列表
function displayBooks(books) {
  const container = document.getElementById('booksList');
  container.innerHTML = books.map(book => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card h-100">
        <div class="card-body">
          <div class="d-flex">
            <div class="book-cover me-3">
              <i class="bi bi-book"></i>
            </div>
            <div class="flex-grow-1">
              <h5 class="card-title">${book.title}</h5>
              <p class="card-text text-muted mb-1"><i class="bi bi-person"></i> ${book.author}</p>
              <p class="card-text text-muted mb-1"><i class="bi bi-upc-scan"></i> ${book.isbn}</p>
              <p class="card-text text-muted mb-2"><i class="bi bi-building"></i> ${book.publisher || '未知'}</p>
              <span class="badge ${book.available_quantity > 0 ? 'badge-available' : 'badge-unavailable'}">
                ${book.available_quantity > 0 ? `可借 (${book.available_quantity})` : '已借完'}
              </span>
            </div>
          </div>
          <div class="mt-3">
            ${book.available_quantity > 0 ? 
              `<button class="btn btn-primary btn-sm" onclick="borrowBook(${book.id})">
                <i class="bi bi-bookmark-plus"></i> 借阅
              </button>` : 
              `<button class="btn btn-secondary btn-sm" disabled>
                <i class="bi bi-bookmark-x"></i> 暂无库存
              </button>`
            }
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// 显示分页
function displayPagination(data, type) {
  const container = document.getElementById(type === 'books' ? 'pagination' : 'borrowsPagination');
  let html = '';
  
  if (data.page > 1) {
    html += `<li class="page-item"><a class="page-link" href="#" onclick="${type === 'books' ? 'loadBooks' : 'loadBorrows'}(${data.page - 1})">上一页</a></li>`;
  }
  
  for (let i = 1; i <= data.totalPages; i++) {
    html += `<li class="page-item ${i === data.page ? 'active' : ''}">
      <a class="page-link" href="#" onclick="${type === 'books' ? 'loadBooks' : 'loadBorrows'}(${i})">${i}</a>
    </li>`;
  }
  
  if (data.page < data.totalPages) {
    html += `<li class="page-item"><a class="page-link" href="#" onclick="${type === 'books' ? 'loadBooks' : 'loadBorrows'}(${data.page + 1})">下一页</a></li>`;
  }
  
  container.innerHTML = html;
}

// 图书入库
async function addBook() {
  const bookData = {
    isbn: document.getElementById('bookIsbn').value,
    title: document.getElementById('bookTitle').value,
    author: document.getElementById('bookAuthor').value,
    publisher: document.getElementById('bookPublisher').value,
    publish_date: document.getElementById('bookPublishDate').value,
    category: document.getElementById('bookCategory').value,
    total_quantity: parseInt(document.getElementById('bookQuantity').value),
    price: parseFloat(document.getElementById('bookPrice').value) || 0,
    description: document.getElementById('bookDescription').value
  };
  
  try {
    const response = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
    const data = await response.json();
    
    if (data.success) {
      showToast('图书入库成功');
      bootstrap.Modal.getInstance(document.getElementById('addBookModal')).hide();
      document.getElementById('addBookForm').reset();
      loadBooks(currentPage);
    } else {
      showToast(data.error, 'danger');
    }
  } catch (error) {
    showToast('入库失败，请重试', 'danger');
  }
}

// 借书
async function borrowBook(bookId) {
  if (!currentUser) {
    showToast('请先登录', 'danger');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/borrow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readerId: currentUser.id, bookId })
    });
    const data = await response.json();
    
    if (data.success) {
      showToast('借阅成功');
      loadBooks(currentPage);
    } else {
      showToast(data.error, 'danger');
    }
  } catch (error) {
    showToast('借阅失败，请重试', 'danger');
  }
}

// 还书
async function returnBook(bookId) {
  if (!currentUser) {
    showToast('请先登录', 'danger');
    return;
  }
  
  if (!confirm('确定要归还这本书吗？')) return;
  
  try {
    const response = await fetch(`${API_BASE}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readerId: currentUser.id, bookId })
    });
    const data = await response.json();
    
    if (data.success) {
      showToast('归还成功');
      loadBorrows(currentPage);
    } else {
      showToast(data.error, 'danger');
    }
  } catch (error) {
    showToast('归还失败，请重试', 'danger');
  }
}

// 加载借阅记录
async function loadBorrows(page = 1) {
  try {
    const response = await fetch(`${API_BASE}/borrow/${currentUser.id}?page=${page}&pageSize=10`);
    const data = await response.json();
    
    displayBorrows(data.records);
    displayPagination(data, 'borrows');
  } catch (error) {
    showToast('加载借阅记录失败', 'danger');
  }
}

// 显示借阅记录
function displayBorrows(records) {
  const container = document.getElementById('borrowsList');
  
  if (records.length === 0) {
    container.innerHTML = '<tr><td colspan="6" class="text-center text-muted">暂无借阅记录</td></tr>';
    return;
  }
  
  container.innerHTML = records.map(record => `
    <tr>
      <td>${record.title}</td>
      <td>${record.author}</td>
      <td>${new Date(record.borrow_date).toLocaleDateString('zh-CN')}</td>
      <td>${new Date(record.due_date).toLocaleDateString('zh-CN')}</td>
      <td>
        <span class="badge ${record.status === 'borrowed' ? 'bg-warning' : 'bg-success'}">
          ${record.status === 'borrowed' ? '借阅中' : '已归还'}
        </span>
      </td>
      <td>
        ${record.status === 'borrowed' ? 
          `<button class="btn btn-sm btn-success" onclick="returnBook(${record.book_id})">
            <i class="bi bi-arrow-return-left"></i> 归还
          </button>` : 
          '<span class="text-muted">已归还</span>'
        }
      </td>
    </tr>
  `).join('');
}

// 加载排行榜
async function loadRanking() {
  try {
    const response = await fetch(`${API_BASE}/ranking?limit=10`);
    const data = await response.json();
    
    if (data.success) {
      displayRanking(data.ranking);
    }
  } catch (error) {
    showToast('加载排行榜失败', 'danger');
  }
}

// 显示排行榜
function displayRanking(ranking) {
  const container = document.getElementById('rankingList');
  
  if (ranking.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">暂无数据</p>';
    return;
  }
  
  container.innerHTML = ranking.map((book, index) => `
    <div class="ranking-item">
      <div class="ranking-number">${index + 1}</div>
      <div class="flex-grow-1">
        <h6 class="mb-1">${book.title}</h6>
        <p class="mb-0 text-muted"><small>${book.author} | 借阅次数: ${book.borrow_count}</small></p>
      </div>
    </div>
  `).join('');
}

// 回车搜索
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBooks();
  }
});