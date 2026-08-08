// ===== Avenza Electrical — Global JS =====
document.addEventListener('DOMContentLoaded', () => {

  /* Mobile nav toggle */
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const willOpen = !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', willOpen);
      menuToggle.textContent = willOpen ? '✕' : '☰';
      document.body.style.overflow = willOpen ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a:not(.mega-trigger)').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.textContent = '☰';
      document.body.style.overflow = '';
    }));
  }

  /* Services menu: click to open, showing only main categories */
  document.querySelectorAll('.has-mega > .mega-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = trigger.closest('.has-mega');
      const wasOpen = parent.classList.contains('mega-open');
      document.querySelectorAll('.has-mega').forEach(el => el.classList.remove('mega-open'));
      parent.classList.toggle('mega-open', !wasOpen);
    });
  });

  /* Category accordion inside the services menu */
  document.querySelectorAll('.mega-cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cat = btn.closest('.mega-cat');
      const wasOpen = cat.classList.contains('sub-open');
      cat.parentElement.querySelectorAll('.mega-cat').forEach(c => c.classList.remove('sub-open'));
      cat.classList.toggle('sub-open', !wasOpen);
    });
  });

  /* Close services menu when clicking outside */
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.has-mega.mega-open').forEach(el => {
      if (!el.contains(e.target)) el.classList.remove('mega-open');
    });
  });

  /* Fade-in on scroll */
  const faders = document.querySelectorAll('.fade-in');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  faders.forEach(f => io.observe(f));

  /* Generic carousel init */
  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  function initCarousel(root) {
    const track = root.querySelector('.carousel-track');
    const cards = Array.from(track.children);
    const prevBtn = root.querySelector('.carousel-prev');
    const nextBtn = root.querySelector('.carousel-next');
    const dotsWrap = root.querySelector('.carousel-dots');
    let index = 0;

    function perView() {
      const w = window.innerWidth;
      if (w >= 1080) return 3;
      if (w >= 760) return 2;
      return 1;
    }

    function maxIndex() {
      return Math.max(0, cards.length - perView());
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      const count = maxIndex() + 1;
      for (let i = 0; i < count; i++) {
        const d = document.createElement('span');
        d.className = 'dot' + (i === index ? ' active' : '');
        d.addEventListener('click', () => { index = i; update(); });
        dotsWrap.appendChild(d);
      }
    }

    function update() {
      const cardWidth = cards[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${index * cardWidth}px)`;
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === index));
      }
    }

    prevBtn && prevBtn.addEventListener('click', () => {
      index = index <= 0 ? maxIndex() : index - 1;
      update();
    });
    nextBtn && nextBtn.addEventListener('click', () => {
      index = index >= maxIndex() ? 0 : index + 1;
      update();
    });

    /* Touch swipe support for mobile */
    let touchStartX = 0;
    let touchDeltaX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchDeltaX = 0;
    }, { passive: true });
    track.addEventListener('touchmove', (e) => {
      touchDeltaX = e.touches[0].clientX - touchStartX;
    }, { passive: true });
    track.addEventListener('touchend', () => {
      const threshold = 40;
      if (touchDeltaX > threshold) {
        index = index <= 0 ? maxIndex() : index - 1;
        update();
      } else if (touchDeltaX < -threshold) {
        index = index >= maxIndex() ? 0 : index + 1;
        update();
      }
    });

    let autoTimer = setInterval(() => {
      index = index >= maxIndex() ? 0 : index + 1;
      update();
    }, 5500);
    root.addEventListener('mouseenter', () => clearInterval(autoTimer));
    root.addEventListener('mouseleave', () => {
      autoTimer = setInterval(() => {
        index = index >= maxIndex() ? 0 : index + 1;
        update();
      }, 5500);
    });

    window.addEventListener('resize', () => {
      index = Math.min(index, maxIndex());
      buildDots();
      update();
    });

    buildDots();
    update();
  }

  /* Lead form handling (all forms share class .lead-form-el) */
  document.querySelectorAll('.lead-form-el').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]');
      const phone = form.querySelector('[name="phone"]');
      let valid = true;

      [name, phone].forEach(field => {
        if (field && !field.value.trim()) {
          field.style.borderColor = '#d16b6b';
          valid = false;
        } else if (field) {
          field.style.borderColor = 'rgba(255,255,255,0.12)';
        }
      });

      if (!valid) return;

      const wrap = form.closest('.lead-form');
      const successEl = wrap ? wrap.querySelector('.form-success') : null;
      form.style.display = 'none';
      if (successEl) successEl.style.display = 'block';

      // In production, send form data to backend / email service here.
      console.log('Lead captured:', Object.fromEntries(new FormData(form)));
    });
  });

  /* Header background on scroll */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 20 ? '0 10px 30px rgba(0,0,0,0.35)' : 'none';
    });
  }

  /* Set active nav link */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
});
