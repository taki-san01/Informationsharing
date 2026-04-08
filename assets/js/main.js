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
        let deletedPosts = [];
        try {
          localPosts = JSON.parse(localStorage.getItem('localPosts') || '[]');
          deletedPosts = JSON.parse(localStorage.getItem('deletedPosts') || '[]');
        } catch (e) {
          console.warn("localStorage is not available", e);
        }
        postsData = [...localPosts, ...data].filter(p => !deletedPosts.includes(p.id));
        renderPosts();
      })
      .catch(err => {
        console.error("Failed to load post data", err);
        let localPosts = [];
        try {
          localPosts = JSON.parse(localStorage.getItem('localPosts') || '[]');
        } catch (e) {}
        
        if (localPosts.length > 0) {
          let deletedPosts = [];
          try { deletedPosts = JSON.parse(localStorage.getItem('deletedPosts') || '[]'); } catch(e){}
          postsData = localPosts.filter(p => !deletedPosts.includes(p.id));
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

    const filterEls = document.querySelectorAll('.filter-select');
    filterEls.forEach(el => {
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', () => {
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
      
      const title = document.getElementById(isSell ? 'sell-title' : 'buy-title').value || '名称未設定';
      const category = document.getElementById(isSell ? 'sell-category' : 'buy-category').value;
      const quantity = document.getElementById(isSell ? 'sell-qty' : 'buy-qty').value || '不明';
      const priceVal = document.getElementById(isSell ? 'sell-price' : 'buy-price').value;
      const price = priceVal ? priceVal + '円' : '要相談';
      const region = document.getElementById(isSell ? 'sell-region' : 'buy-region').value;
      
      const capacity = isSell ? document.getElementById('sell-capacity').value : '';
      const delivery = isSell ? document.getElementById('sell-delivery').value : '';
      
      const urgency = document.getElementById('post-urgency').value;
      const company = document.getElementById('post-company').value;
      const name = document.getElementById('post-name').value;
      const comment = document.getElementById('post-comment').value;
      const chat = document.getElementById('post-chat').value;
      const email = document.getElementById('post-email').value;
      
      const newPost = {
        id: Date.now(),
        type: type,
        title: title,
        category: category,
        capacity: capacity,
        quantity: quantity,
        region: region,
        price: price,
        delivery: delivery,
        urgency: urgency,
        company: company,
        name: name,
        comment: comment,
        chat: chat,
        email: email,
        date: new Date().toISOString().split('T')[0]
      };
      
      const completeSubmission = () => {
        let localPosts = [];
        try {
          localPosts = JSON.parse(localStorage.getItem('localPosts') || '[]');
          localPosts.unshift(newPost);
          localStorage.setItem('localPosts', JSON.stringify(localPosts));
        } catch (err) {
          alert("PCのローカルファイル(file://)から開いている場合、ブラウザのセキュリティ制限によって投稿が保存されません。GitHub PagesのURLから確認してください。");
        }
        showToast('投稿が完了しました！');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      };

      const photoInput = document.getElementById('post-photo');
      if (photoInput && photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          newPost.photo = evt.target.result;
          completeSubmission();
        };
        reader.readAsDataURL(photoInput.files[0]);
      } else {
        completeSubmission();
      }
    });
  }

  function renderPosts() {
    if (!postList) return;
    postList.innerHTML = '';
    
    const regionFilterInput = document.getElementById('filter-region');
    const categoryFilterInput = document.getElementById('filter-category');
    const urgencyFilterInput = document.getElementById('filter-urgency');
    const companyFilterInput = document.getElementById('filter-company');

    const regionVal = regionFilterInput ? regionFilterInput.value : '地域: 全て';
    const categoryVal = categoryFilterInput ? categoryFilterInput.value : '種類: 全て';
    const urgencyVal = urgencyFilterInput ? urgencyFilterInput.value : '緊急度: 全て';
    const filterCompanyVal = companyFilterInput ? companyFilterInput.value.trim().toLowerCase() : '';

    const filtered = postsData.filter(p => {
      if (p.type !== currentFilter) return false;
      if (filterCompanyVal && !(p.company && p.company.toLowerCase().includes(filterCompanyVal))) return false;
      if (regionVal !== '地域: 全て' && p.region !== regionVal) return false;
      if (categoryVal !== '種類: 全て' && p.category !== categoryVal) return false;
      if (urgencyVal !== '緊急度: 全て' && p.urgency !== urgencyVal) return false;
      return true;
    });
    
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

    const emailSubject = encodeURIComponent(`【JABRA CONNECT LINK】投稿について: ${post.title}`);
    const emailBody = encodeURIComponent(`掲示板の投稿（${post.title}）を拝見し、連絡いたしました。\n\n`);

    modalBody.innerHTML = `
      <div class="card-header">
        <div>
          <span class="badge ${badgeClass}">${badgeText}</span>
          ${isUrgent ? '<span class="badge urgent">緊急</span>' : ''}
        </div>
        <span class="card-date">${post.date}</span>
      </div>
      <h2 style="margin: 10px 0; font-size: 1.3rem;">${post.title}</h2>
      
      ${post.photo ? `<img src="${post.photo}" style="max-width: 100%; border-radius: 8px; margin-bottom: 12px; max-height: 250px; object-fit: contain;">` : ''}

      <div style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin-bottom: 6px;"><strong>出品者(会社名)：</strong> ${post.company || '未設定'}</p>
        <p style="margin-bottom: 6px;"><strong>氏名：</strong> ${post.name || '未設定'}</p>
        <p style="margin-bottom: 6px;"><strong>種類：</strong> ${post.category || '未設定'}</p>
        ${post.capacity ? `<p style="margin-bottom: 6px;"><strong>容量：</strong> ${post.capacity}</p>` : ''}
        <p style="margin-bottom: 6px;"><strong>数量：</strong> ${post.quantity}</p>
        <p style="margin-bottom: 6px;"><strong>地域：</strong> ${post.region}</p>
        <p style="margin-bottom: 6px;"><strong>価格：</strong> ${post.price}</p>
        ${post.delivery ? `<p style="margin-bottom: 6px;"><strong>引渡方法：</strong> ${post.delivery}</p>` : ''}
        <p style="margin-bottom: 6px;"><strong>緊急度：</strong> ${post.urgency}</p>
        ${post.comment ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;"><p style="white-space: pre-wrap;">${post.comment}</p></div>` : ''}
      </div>
      
      <button onclick="openChat('${post.chat || ''}')" class="contact-btn chat" style="border:none; cursor:pointer;">Google Chatで連絡</button>
      <a href="mailto:${post.email || ''}?subject=${emailSubject}&body=${emailBody}" class="contact-btn email">メールで連絡</a>
      <button onclick="deletePost(${post.id})" class="submit-btn" style="background-color: #d32f2f; margin-top: 10px; padding: 10px; font-size: 0.9rem;">この投稿を削除する</button>
    `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  window.deletePost = function(id) {
    if(!confirm("本当にこの投稿を削除しますか？")) return;
    
    try {
      let deleted = JSON.parse(localStorage.getItem('deletedPosts') || '[]');
      deleted.push(id);
      localStorage.setItem('deletedPosts', JSON.stringify(deleted));
      
      let local = JSON.parse(localStorage.getItem('localPosts') || '[]');
      local = local.filter(p => p.id !== id);
      localStorage.setItem('localPosts', JSON.stringify(local));
    } catch(e) {}

    postsData = postsData.filter(p => Number(p.id) !== Number(id));
    closeModal();
    renderPosts();
    showToast('削除しました');
  };

  window.openChat = function(chatId) {
    if (chatId && chatId.startsWith('http')) {
      window.open(chatId, '_blank');
    } else if (chatId) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(chatId).then(() => {
          showToast('連絡先(Gmail)をコピーしました！チャットの新規作成から検索してください。');
          setTimeout(() => window.open('https://chat.google.com/', '_blank'), 2000);
        }).catch(() => {
          window.open('https://chat.google.com/', '_blank');
        });
      } else {
        alert(`連絡先(Gmail): ${chatId}\n\nコピーしてGoogle Chatで検索してください。`);
        window.open('https://chat.google.com/', '_blank');
      }
    } else {
      window.open('https://chat.google.com/', '_blank');
    }
  };

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
