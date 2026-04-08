document.addEventListener('DOMContentLoaded', () => {
  const postList = document.getElementById('post-list');
  const modalOverlay = document.getElementById('post-modal');
  let postsData = [];
  let currentFilter = 'sell';

  // Fetch posts if we are on the index page
  if (postList) {
    fetch('data/posts.json')
      .then(res => res.json())
      .then(data => {
        let localPosts = [];
        try {
          localPosts = JSON.parse(localStorage.getItem('localPosts') || '[]');
        } catch (e) {
          console.warn("localStorage is not available (file:// on PC?)", e);
        }
        postsData = [...localPosts, ...data];
        renderPosts();
      })
      .catch(err => {
        console.error("Failed to load post data", err);
        let localPosts = [];
        try {
          localPosts = JSON.parse(localStorage.getItem('localPosts') || '[]');
        } catch (e) {}
        
        if (localPosts.length > 0) {
          postsData = localPosts;
          renderPosts();
        } else {
          postList.innerHTML = '<p class="text-center" style="margin-top:30px;">データの読み込みに失敗しました。</p>';
        }
      });

    // Sub-tab switching on main page
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.type;
        renderPosts();
      });
    });

    // Close Modal
    document.getElementById('close-modal').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Handle post form submission
  const postForm = document.getElementById('post-form');
  if (postForm) {
    const postTabs = document.querySelectorAll('.tab-btn');
    const typeInput = document.getElementById('post-type');
    
    postTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        postTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        const type = e.target.dataset.type;
        typeInput.value = type;
        
        // Toggle specific fields based on type
        if (type === 'sell') {
           document.getElementById('sell-fields').classList.remove('hidden');
           document.getElementById('buy-fields').classList.add('hidden');
        } else {
           document.getElementById('sell-fields').classList.add('hidden');
           document.getElementById('buy-fields').classList.remove('hidden');
        }
      });
    });

    postForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const type = typeInput.value;
      const isSell = type === 'sell';
      
      let title, quantity, price, region;
      
      if (isSell) {
        const fields = document.getElementById('sell-fields');
        const inputs = fields.querySelectorAll('input, select');
        title = inputs[0].value || '名称未設定';
        quantity = inputs[3].value || '不明';
        price = inputs[4].value ? inputs[4].value + '円' : '要相談';
        region = inputs[5].value;
      } else {
        const fields = document.getElementById('buy-fields');
        const inputs = fields.querySelectorAll('input, select');
        title = inputs[0].value || '名称未設定';
        quantity = inputs[2].value || '不明';
        price = inputs[3].value ? inputs[3].value + '円' : '要相談';
        region = inputs[4].value;
      }
      
      const selects = postForm.querySelectorAll('select');
      const urgency = selects[selects.length - 1].value;
      
      const newPost = {
        id: Date.now(),
        type: type,
        title: title,
        quantity: quantity,
        region: region,
        price: price,
        urgency: urgency,
        date: new Date().toISOString().split('T')[0]
      };
      
      let localPosts = [];
      try {
        localPosts = JSON.parse(localStorage.getItem('localPosts') || '[]');
        localPosts.unshift(newPost);
        localStorage.setItem('localPosts', JSON.stringify(localPosts));
      } catch (e) {
        alert("PCのローカルファイル(file://)から開いている場合、ブラウザのセキュリティ制限によって投稿が保存されません。GitHub PagesのURLから確認してください。");
      }

      showToast('投稿が完了しました！');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });
  }

  function renderPosts() {
    if (!postList) return;
    postList.innerHTML = '';
    
    const filtered = postsData.filter(p => p.type === currentFilter);
    
    if (filtered.length === 0) {
      postList.innerHTML = '<p class="text-center" style="margin-top:30px; color:#666;">該当する投稿がありません。</p>';
      return;
    }

    filtered.forEach(post => {
      const card = document.createElement('div');
      card.className = `post-card ${post.type}-card`;
      
      const isUrgent = post.urgency.includes("緊急") || post.urgency.includes("本日") || post.urgency.includes("明日まで");
      const badgeText = post.type === 'sell' ? '売り' : '買い';
      const badgeClass = post.type;

      card.innerHTML = `
        <div class="card-header">
          <div>
            <span class="badge ${badgeClass}">${badgeText}</span>
            ${isUrgent ? '<span class="badge urgent">緊急</span>' : ''}
          </div>
          <span class="card-date">${post.date}</span>
        </div>
        <div class="card-title">${post.title}</div>
        <div class="card-details">
          <div class="detail-item">📦 ${post.quantity}</div>
          <div class="detail-item">📍 ${post.region}</div>
          <div class="detail-item">💰 ${post.price}</div>
        </div>
      `;
      
      card.addEventListener('click', () => openModal(post));
      postList.appendChild(card);
    });
  }

  function openModal(post) {
    const modalBody = document.getElementById('modal-body');
    const isUrgent = post.urgency.includes("緊急") || post.urgency.includes("本日") || post.urgency.includes("明日まで");
    const badgeText = post.type === 'sell' ? '売り' : '買い';
    const badgeClass = post.type;

    modalBody.innerHTML = `
      <div class="card-header">
        <div>
          <span class="badge ${badgeClass}">${badgeText}</span>
          ${isUrgent ? '<span class="badge urgent">緊急</span>' : ''}
        </div>
        <span class="card-date">${post.date}</span>
      </div>
      <h2 style="margin: 10px 0; font-size: 1.3rem;">${post.title}</h2>
      
      <div style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin-bottom: 6px;"><strong>数量：</strong> ${post.quantity}</p>
        <p style="margin-bottom: 6px;"><strong>地域：</strong> ${post.region}</p>
        <p style="margin-bottom: 6px;"><strong>価格：</strong> ${post.price}</p>
        <p><strong>緊急度：</strong> ${post.urgency}</p>
      </div>
      
      <a href="#" class="contact-btn chat" onclick="event.preventDefault(); showToast('Google Chatを開きます(デモ)')">Google Chatで連絡</a>
      <a href="#" class="contact-btn email" onclick="event.preventDefault(); showToast('メールアプリを開きます(デモ)')">メールで連絡</a>
    `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
});
