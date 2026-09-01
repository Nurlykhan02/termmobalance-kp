(function () {
  function initScrollStory(section) {
    const track = section.querySelector('.scroll-story-track');
    if (!track) return;

    const stageCount = parseInt(section.dataset.stageCount, 10) || 4;
    const panels = Array.from(section.querySelectorAll('.scroll-panel'));
    const dots = Array.from(section.querySelectorAll('.scroll-dot'));
    const isVideo = section.classList.contains('process-story');
    const isConstructor = section.classList.contains('constructor-story');
    const videos = isVideo ? Array.from(section.querySelectorAll('.scroll-story-video')) : [];
    const compareFrame = section.querySelector('.constructor-compare-frame');
    const compareReveal = section.querySelector('.constructor-compare-reveal');
    const compareAfter = section.querySelector('.constructor-compare-after');
    const compareLine = section.querySelector('.constructor-compare-line');
    const badgeBefore = section.querySelector('.constructor-badge--before');
    const badgeAfter = section.querySelector('.constructor-badge--after');

    section.style.setProperty('--stage-count', String(stageCount));

    let activeIndex = -1;
    let ticking = false;
    let inView = false;

    function getScrollState() {
      const rect = track.getBoundingClientRect();
      const viewport = window.innerHeight;
      const scrollable = track.offsetHeight - viewport;

      if (scrollable <= 0) {
        return { progress: 0, index: 0, local: 0 };
      }

      const scrolled = Math.min(scrollable, Math.max(0, -rect.top));
      const progress = scrolled / scrollable;
      const segment = 1 / stageCount;
      const index = Math.min(stageCount - 1, Math.max(0, Math.floor(progress / segment)));
      const local = (progress - index * segment) / segment;

      return { progress, index, local: Math.max(0, Math.min(1, local)) };
    }

    function playVideo(video) {
      if (!video) return;
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }

    function setVideoStage(index) {
      videos.forEach(function (video, i) {
        const show = i === index;
        video.classList.toggle('is-visible', show);
        if (show) playVideo(video);
        else video.pause();
      });
    }

    function syncCompareImageWidth() {
      if (!compareFrame || !compareAfter) return;
      compareAfter.style.width = compareFrame.offsetWidth + 'px';
    }

    function setConstructorMix(mix) {
      const value = Math.max(0, Math.min(1, mix));
      const pct = value * 100;

      if (compareReveal) compareReveal.style.width = pct + '%';
      if (compareLine) compareLine.style.left = pct + '%';
      if (badgeBefore) badgeBefore.style.opacity = String(1 - value * 0.65);
      if (badgeAfter) badgeAfter.style.opacity = String(0.35 + value * 0.65);
    }

    function updatePanels(index, local) {
      panels.forEach(function (panel, i) {
        var opacity = 0;
        var translate = 32;

        if (i === index) {
          opacity = 1 - local * 0.4;
          translate = local * 14;
        } else if (i === index + 1 && index < stageCount - 1) {
          opacity = local;
          translate = 32 - local * 32;
        }

        if (index === stageCount - 1 && i === index) {
          opacity = 1;
          translate = 0;
        }

        panel.style.opacity = String(opacity);
        panel.style.transform = 'translateY(' + translate + 'px)';
        panel.classList.toggle('is-active', i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function tick() {
      const state = getScrollState();

      if (isConstructor) {
        setConstructorMix(state.progress);
      }

      if (state.index !== activeIndex) {
        activeIndex = state.index;
        if (isVideo) setVideoStage(state.index);
      }

      updatePanels(state.index, state.local);
      ticking = false;
    }

    function onScroll() {
      if (!inView) return;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(tick);
      }
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          inView = entry.isIntersecting;
          if (inView) {
            syncCompareImageWidth();
            tick();
          } else if (isVideo) {
            videos.forEach(function (v) { v.pause(); });
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(track);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      syncCompareImageWidth();
      tick();
    }, { passive: true });

    activeIndex = 0;
    if (isVideo) setVideoStage(0);
    if (isConstructor) {
      syncCompareImageWidth();
      setConstructorMix(0);
    }
    tick();
  }

  document.querySelectorAll('.scroll-story').forEach(initScrollStory);
})();
