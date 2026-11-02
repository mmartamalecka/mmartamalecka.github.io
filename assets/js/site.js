(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  // ---------- Language ----------
  function setLang(lang) {
    root.dataset.lang = lang;
    root.lang = lang;
    try { localStorage.setItem('preferredLanguage', lang); } catch (e) { /* storage unavailable */ }
  }
  root.lang = root.dataset.lang || 'pl';

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

  // ---------- Scroll-linked reveal ----------
  // Viewport height is cached and only refreshed on width changes, so the mobile
  // address bar showing/hiding doesn't change the animation geometry.
  var vh = window.innerHeight;
  var vw = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth !== vw) {
      vw = window.innerWidth;
      vh = window.innerHeight;
      requestUpdate();
    }
  });

  var scrollItems = Array.prototype.slice.call(doc.querySelectorAll('[data-scroll-reveal]')).map(function (el) {
    return { el: el, p: 0, i: parseFloat(el.style.getPropertyValue('--i')) || 0, dist: 160 };
  });
  var titleItems = Array.prototype.slice.call(doc.querySelectorAll('[data-scroll-title]')).map(function (el) {
    return { el: el, p: 0 };
  });

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function updateScrollReveals() {
    var i, it, rect, top, x, p;
    // Read phase
    for (i = 0; i < scrollItems.length; i++) {
      it = scrollItems[i];
      rect = it.el.getBoundingClientRect();
      // Remove the current translate to get the untransformed position
      it.top = rect.top - (1 - it.p) * it.dist;
    }
    for (i = 0; i < titleItems.length; i++) {
      it = titleItems[i];
      it.top = it.el.getBoundingClientRect().top;
    }
    // Write phase
    for (i = 0; i < scrollItems.length; i++) {
      it = scrollItems[i];
      x = (vh - it.top) / (vh * 0.4);
      p = ease(clamp01((x - it.i * 0.15) / 0.7));
      if (Math.abs(p - it.p) > 0.001) {
        it.p = p;
        it.el.style.setProperty('--rp', p.toFixed(3));
      }
    }
    for (i = 0; i < titleItems.length; i++) {
      it = titleItems[i];
      p = ease(clamp01((vh - it.top) / (vh * 0.35)));
      if (Math.abs(p - it.p) > 0.001) {
        it.p = p;
        it.el.style.setProperty('--tp', p.toFixed(3));
      }
    }
  }

  var updatePending = false;
  function requestUpdate() {
    if (updatePending) return;
    updatePending = true;
    requestAnimationFrame(function () {
      updatePending = false;
      updateScrollReveals();
    });
  }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('load', requestUpdate);
  updateScrollReveals();

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
      if (hero) {
        hero.style.setProperty('--hero-progress', Math.min(1, y / (vh * 0.8)).toFixed(3));
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

  // ---------- Mobile: show project overlay by scroll position ----------
  // Viewport height fraction (0 = top, 1 = bottom) a tile must cross to become active
  var MOBILE_ACTIVE_LINE = 0.2;
  var mobileQuery = window.matchMedia('(max-width: 767px)');
  var listings = Array.prototype.slice.call(doc.querySelectorAll('.project-listing'));
  var activePending = false;

  function updateActiveListing() {
    activePending = false;
    var line = window.innerHeight * MOBILE_ACTIVE_LINE;
    listings.forEach(function (el) {
      var on = false;
      if (mobileQuery.matches) {
        var r = el.getBoundingClientRect();
        on = r.top <= line;
      }
      el.classList.toggle('is-active', on);
    });
  }
  function requestActiveUpdate() {
    if (activePending) return;
    activePending = true;
    requestAnimationFrame(updateActiveListing);
  }
  window.addEventListener('scroll', requestActiveUpdate, { passive: true });
  window.addEventListener('resize', requestActiveUpdate);
  window.addEventListener('load', requestActiveUpdate);
  updateActiveListing();

  // Make sure videos (including ones injected into the project dialog) never show native controls or go fullscreen
  function hardenVideo(v) {
    v.controls = false;
    v.removeAttribute('controls');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('disablepictureinpicture', '');
    v.setAttribute('disableremoteplayback', '');
    v.setAttribute('controlslist', 'nofullscreen nodownload noremoteplayback');
    v.playsInline = true;
    v.muted = true;
    v.addEventListener('webkitbeginfullscreen', function () {
      if (v.webkitExitFullscreen) v.webkitExitFullscreen();
    });
  }
  doc.querySelectorAll('video').forEach(hardenVideo);
  if ('MutationObserver' in window) {
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType !== 1) return;
          if (n.tagName === 'VIDEO') hardenVideo(n);
          else n.querySelectorAll('video').forEach(hardenVideo);
        });
      });
    }).observe(doc.body, { childList: true, subtree: true });
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

  // Keep dialog content hidden until its media has loaded (or a timeout passes)
  function revealWhenLoaded(slug) {
    var pending = [];
    content.querySelectorAll('img').forEach(function (img) {
      if (img.complete) return;
      pending.push(new Promise(function (resolve) {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }));
    });
    content.querySelectorAll('video').forEach(function (v) {
      if (v.readyState >= 2) return;
      pending.push(new Promise(function (resolve) {
        v.addEventListener('loadeddata', resolve, { once: true });
        v.addEventListener('error', resolve, { once: true });
      }));
    });
    var timeout = new Promise(function (resolve) { setTimeout(resolve, 2500); });
    Promise.race([Promise.all(pending), timeout]).then(function () {
      if (openId === slug) content.classList.remove('is-loading');
    });
  }

  function openProject(slug) {
    var tpl = doc.getElementById('tpl-' + slug);
    if (!tpl || !canNativeDialog) return;
    content.innerHTML = '';
    content.classList.add('is-loading');
    content.appendChild(tpl.content.cloneNode(true));
    content.querySelectorAll('img[loading]').forEach(function (img) { img.loading = 'eager'; });
    content.querySelectorAll('[data-gallery]').forEach(initGallery);
    content.querySelectorAll('[data-comparison]').forEach(initComparison);
    observeReveals(content);
    revealWhenLoaded(slug);

    openId = slug;
    dialog.dataset.section = tpl.dataset.sectionId;
    if (!dialog.open) dialog.showModal();
    // showModal() focuses the close button, which iOS Safari outlines with a native ring
    dialog.focus({ preventScroll: true });
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
