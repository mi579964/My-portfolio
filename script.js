/* ═══════════════════════════════════════
   PORTFOLIO SCRIPT
═══════════════════════════════════════ */

/* ── 1. 프로젝트 더미 데이터 ── */
const PROJECTS = [
  {
    id: 1,
    icon: '🛒',
    title: '쇼핑몰 웹앱',
    desc: '장바구니, 결제 흐름, 상품 필터링을 갖춘 풀스택 이커머스 플랫폼입니다.',
    tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    category: 'web',
    demo: '#',
    github: '#',
  },
  {
    id: 2,
    icon: '📊',
    title: '데이터 대시보드',
    desc: '실시간 차트와 필터로 비즈니스 KPI를 한눈에 파악할 수 있는 분석 도구입니다.',
    tags: ['Vue.js', 'D3.js', 'Firebase'],
    category: 'web',
    demo: '#',
    github: '#',
  },
  {
    id: 3,
    icon: '📱',
    title: '할 일 관리 앱',
    desc: '드래그 앤 드롭으로 태스크를 관리하는 크로스플랫폼 모바일 앱입니다.',
    tags: ['React Native', 'TypeScript', 'SQLite'],
    category: 'app',
    demo: '#',
    github: '#',
  },
  {
    id: 4,
    icon: '🤖',
    title: 'AI 챗봇 API',
    desc: 'OpenAI API를 활용해 맥락 기반 대화를 제공하는 RESTful 서비스입니다.',
    tags: ['Python', 'FastAPI', 'OpenAI', 'Redis'],
    category: 'api',
    demo: '#',
    github: '#',
  },
  {
    id: 5,
    icon: '🗺️',
    title: '여행 플래너',
    desc: '지도 기반으로 여행 일정을 시각화하고 친구와 공유할 수 있는 웹앱입니다.',
    tags: ['Next.js', 'Mapbox', 'Supabase'],
    category: 'web',
    demo: '#',
    github: '#',
  },
  {
    id: 6,
    icon: '💬',
    title: '실시간 채팅',
    desc: 'WebSocket 기반의 다중 채널 실시간 채팅 서비스입니다.',
    tags: ['Socket.io', 'Express', 'JWT'],
    category: 'api',
    demo: '#',
    github: '#',
  },
];

/* ── 2. 타이핑 애니메이션 ── */
const ROLES = ['강원대학교 소속', '25학번 컴퓨터공학과'];
let roleIdx = 0, charIdx = 0, deleting = false;

function typeEffect() {
  const el = document.getElementById('typed');
  if (!el) return;
  const current = ROLES[roleIdx];

  if (!deleting) {
    el.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeEffect, 1800);
      return;
    }
  } else {
    el.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % ROLES.length;
    }
  }
  setTimeout(typeEffect, deleting ? 60 : 100);
}

/* ── 3. 프로젝트 카드 렌더링 ── */
function renderProjects(filter) {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';

  const list = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.category === filter);

  list.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.style.animationDelay = `${i * 80}ms`;
    card.dataset.category = p.category;
    card.dataset.id = p.id;

    card.innerHTML = `
      <button class="card-edit-btn" data-id="${p.id}" title="편집">✏</button>
      <div class="card-top">
        <span class="card-icon">${p.icon}</span>
        <span class="card-badge">${categoryLabel(p.category)}</span>
      </div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div class="tags">
        ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div class="card-links">
        <a href="${p.demo}" target="_blank" rel="noopener" class="card-link">라이브 데모</a>
        <a href="${p.github}" target="_blank" rel="noopener" class="card-link github">GitHub</a>
      </div>
    `;

    card.querySelector('.card-edit-btn').addEventListener('click', () => openEditModal(p.id));
    grid.appendChild(card);
  });
}

function categoryLabel(cat) {
  return { web: '웹', app: '앱', api: 'API' }[cat] ?? cat;
}

/* ── 편집 모달 ── */
let currentFilter = 'all';

function openEditModal(id) {
  const p = PROJECTS.find(p => p.id === id);
  if (!p) return;

  document.getElementById('edit-id').value       = p.id;
  document.getElementById('edit-icon').value     = p.icon;
  document.getElementById('edit-category').value = p.category;
  document.getElementById('edit-title').value    = p.title;
  document.getElementById('edit-desc').value     = p.desc;
  document.getElementById('edit-tags').value     = p.tags.join(', ');
  document.getElementById('edit-demo').value     = p.demo === '#' ? '' : p.demo;
  document.getElementById('edit-github').value   = p.github === '#' ? '' : p.github;

  document.getElementById('edit-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('edit-title').focus();
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function initEditModal() {
  const modal   = document.getElementById('edit-modal');
  const form    = document.getElementById('edit-form');

  // 닫기 버튼
  document.getElementById('modal-close').addEventListener('click', closeEditModal);
  document.getElementById('modal-cancel').addEventListener('click', closeEditModal);

  // 오버레이 클릭 시 닫기
  modal.addEventListener('click', e => { if (e.target === modal) closeEditModal(); });

  // ESC 키 닫기
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeEditModal();
  });

  // 저장
  form.addEventListener('submit', e => {
    e.preventDefault();

    const id  = Number(document.getElementById('edit-id').value);
    const idx = PROJECTS.findIndex(p => p.id === id);
    if (idx === -1) return;

    const rawTags = document.getElementById('edit-tags').value;
    const demoVal = document.getElementById('edit-demo').value.trim();
    const ghVal   = document.getElementById('edit-github').value.trim();

    PROJECTS[idx] = {
      ...PROJECTS[idx],
      icon:     document.getElementById('edit-icon').value.trim()     || PROJECTS[idx].icon,
      category: document.getElementById('edit-category').value,
      title:    document.getElementById('edit-title').value.trim(),
      desc:     document.getElementById('edit-desc').value.trim(),
      tags:     rawTags.split(',').map(t => t.trim()).filter(Boolean),
      demo:     demoVal   || '#',
      github:   ghVal     || '#',
    };

    closeEditModal();
    renderProjects(currentFilter);
  });
}

/* ── 4. 필터 버튼 ── */
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderProjects(currentFilter);
    });
  });
}

/* ── 5. 헤더 스크롤 효과 & 활성 링크 ── */
function initHeader() {
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);

    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── 6. 부드러운 스크롤 (모든 앵커 링크) ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      // 모바일 메뉴 닫기
      closeMenu();
    });
  });
}

/* ── 7. 햄버거 메뉴 ── */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });
}

function closeMenu() {
  const nav = document.getElementById('nav');
  const btn = document.getElementById('hamburger');
  nav.classList.remove('open');
  btn.classList.remove('open');
  btn.setAttribute('aria-label', '메뉴 열기');
}

/* ── 8. 문의 폼 ── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const notice = document.getElementById('form-notice');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    // 간단한 유효성 검사
    if (!name || !email || !message) {
      showNotice('모든 항목을 입력해 주세요.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNotice('올바른 이메일 주소를 입력해 주세요.', 'error');
      return;
    }

    // 실제 서버 전송 대신 성공 메시지 표시
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '전송 중...';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = '보내기';
      showNotice('메시지가 성공적으로 전송되었습니다! 빠른 시일 내에 답변 드리겠습니다.', 'success');
    }, 1200);
  });

  function showNotice(msg, type) {
    notice.textContent = msg;
    notice.className = `form-notice ${type}`;
    setTimeout(() => { notice.textContent = ''; notice.className = 'form-notice'; }, 5000);
  }
}

/* ── 9. 카드 교차점 관찰 (스크롤 진입 애니메이션) ── */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );

  // 섹션 헤더 reveal
  document.querySelectorAll('.section-header, .contact-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', () => {
  typeEffect();
  renderProjects('all');
  initFilters();
  initHeader();
  initSmoothScroll();
  initHamburger();
  initContactForm();
  initScrollReveal();
  initEditModal();
});
