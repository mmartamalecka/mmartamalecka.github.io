(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Language ----------
  function setLang(lang) {
    root.dataset.lang = lang;
    root.lang = lang;
    try { localStorage.setItem('preferredLanguage', lang); } catch (e) { /* storage unavailable */ }
  }
  root.lang = root.dataset.lang || 'en';

  doc.querySelector('[data-lang-toggle]').addEventListener('click', function () {
    setLang(root.dataset.lang === 'en' ? 'pl' : 'en');
  });

  // ---------- Reveal on scroll ----------
  var revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' })
    : null;

  function observeReveals(scope) {
    scope.querySelectorAll('[data-reveal], [data-reveal-group]').forEach(function (el) {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('is-visible');
    });
  }
  observeReveals(doc);

  // ---------- Header: background, mobile menu, scroll-spy ----------
  var header = doc.querySelector('[data-header]');
  var nav = doc.querySelector('[data-nav]');
  var toggle = doc.querySelector('[data-menu-toggle]');
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[data-nav-link]'));
  var hero = doc.querySelector('[data-hero]');

  function setMenu(open) {
    nav.classList.toggle('show', open);
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    root.classList.toggle('dialog-open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('show'));
  });

  doc.querySelectorAll('[data-nav-link]').forEach(function (link) {
    link.addEventListener('click', function () {
      setMenu(false);
      // Hash is applied by the browser; smooth scrolling is handled in CSS
    });
  });

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      if (hero && !reducedMotion) {
        hero.style.setProperty('--hero-progress', Math.min(1, y / (window.innerHeight * 0.8)).toFixed(3));
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var sections = doc.querySelectorAll('[data-section]');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('current', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // ---------- Thumbnail videos only play while visible ----------
  if ('IntersectionObserver' in window) {
    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.play().catch(function () {});
        else entry.target.pause();
      });
    }, { threshold: 0.25 });
    doc.querySelectorAll('[data-lazy-video]').forEach(function (v) { videoObserver.observe(v); });
  }

  // ---------- Gallery ----------
  function initGallery(gallery) {
    var container = gallery.querySelector('.gallery-container');
    var images = JSON.parse(gallery.dataset.images);
    var base = gallery.dataset.imageServePath;
    var index = 0;
    var busy = false;

    function make(i, cls) {
      var img = new Image();
      img.src = base + images[i];
      img.className = cls;
      img.alt = 'Gallery image ' + (i + 1);
      return img;
    }

    var current = make(0, 'current');
    current.style.transform = 'none';
    var next = make(images.length > 1 ? 1 : 0, 'next');
    container.appendChild(current);
    container.appendChild(next);

    function go(dir) {
      if (busy || images.length < 2) return;
      busy = true;
      var target = (index + dir + images.length) % images.length;
      var from = dir > 0 ? '100%' : '-100%';
      var to = dir > 0 ? '-100%' : '100%';

      next.src = base + images[target];
      next.style.transition = 'none';
      next.style.transform = 'translateX(' + from + ')';
      void next.offsetWidth;

      next.style.transition = 'transform 0.5s ease-in-out';
      next.style.transform = 'translateX(0)';
      current.style.transform = 'translateX(' + to + ')';

      setTimeout(function () {
        container.removeChild(current);
        current = next;
        current.className = 'current';
        index = target;
        next = make((index + 1) % images.length, 'next');
        container.appendChild(next);
        busy = false;
      }, 520);
    }

    gallery.querySelector('.gallery-nav.next').addEventListener('click', function () { go(1); });
    gallery.querySelector('.gallery-nav.prev').addEventListener('click', function () { go(-1); });
  }

  // ---------- Before / after comparison ----------
  function initComparison(container) {
    var slider = container.querySelector('.slider');
    var before = container.querySelector('.image-before');
    var after = container.querySelector('.image-after');
    var button = container.querySelector('.slider-button');
    var line = container.querySelector('.slider-line');
    var isVideo = before.tagName === 'VIDEO';
    var current = 50;
    var target = 50;

    function setPosition(p) {
      if (isVideo) {
        after.style.left = '0';
        after.style.clipPath = 'inset(0 0 0 ' + p + '%)';
      } else {
        before.style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
      }
      button.style.left = p + '%';
      line.style.left = p + '%';
      slider.value = p;
    }

    function animate() {
      if (Math.abs(target - current) > 0.1) {
        current += (target - current) * 0.1;
        setPosition(current);
        requestAnimationFrame(animate);
      } else {
        current = target;
        setPosition(current);
      }
    }

    slider.addEventListener('input', function (e) {
      target = parseFloat(e.target.value);
      requestAnimationFrame(animate);
    });

    if (isVideo) {
      before.play().catch(function () {});
      after.play().catch(function () {});
    }
    setPosition(50);
  }

  // ---------- Project dialog ----------
  var dialog = doc.getElementById('project-dialog');
  var content = dialog.querySelector('[data-dialog-content]');
  var openId = null;
  var canNativeDialog = typeof dialog.showModal === 'function';

  function openProject(slug) {
    var tpl = doc.getElementById('tpl-' + slug);
    if (!tpl || !canNativeDialog) return;
    content.innerHTML = '';
    content.appendChild(tpl.content.cloneNode(true));
    content.querySelectorAll('[data-gallery]').forEach(initGallery);
    content.querySelectorAll('[data-comparison]').forEach(initComparison);
    observeReveals(content);

    openId = slug;
    dialog.dataset.section = tpl.dataset.sectionId;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    root.classList.add('dialog-open');
  }

  function cleanupDialog() {
    openId = null;
    content.innerHTML = '';
    root.classList.remove('dialog-open');
    if (/^#project-/.test(location.hash)) {
      history.replaceState(null, '', '#' + (dialog.dataset.section || 'home'));
    }
  }

  dialog.addEventListener('close', cleanupDialog);
  dialog.querySelector('[data-dialog-close]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });

  function syncWithHash() {
    var m = /^#project-(.+)$/.exec(location.hash);
    if (m) {
      if (m[1] !== openId) openProject(decodeURIComponent(m[1]));
    } else if (dialog.open) {
      dialog.close();
    }
  }
  window.addEventListener('hashchange', syncWithHash);

  doc.querySelectorAll('[data-project]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      history.pushState(null, '', '#project-' + a.dataset.project);
      openProject(a.dataset.project);
    });
  });

  window.addEventListener('popstate', syncWithHash);
  syncWithHash();
})();
