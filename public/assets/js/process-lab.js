(function () {
  const root = document.getElementById('processLab');
  if (!root) return;

  const stages = Array.from(root.querySelectorAll('.lab-stage'));
  const videos = Array.from(root.querySelectorAll('.lab-preview-video'));
  const caption = root.querySelector('.lab-preview-caption');
  const hint = root.querySelector('.lab-hint-text');
  const progress = root.querySelector('.lab-progress-fill');
  const stageNow = root.querySelector('.lab-stage-now');
  const frame = root.querySelector('.lab-preview-frame');

  let activeIndex = -1;
  let visibleSlot = 0;
  let autoTimer = null;
  let isPaused = false;
  const AUTO_MS = 5500;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function playVideo(video) {
    if (!video) return;
    video.currentTime = 0;
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  function pauseAllVideos() {
    videos.forEach((v) => v.pause());
  }

  function updateMeta(index) {
    const stage = stages[index];
    if (!stage) return;

    if (caption) caption.textContent = stage.dataset.caption || '';
    if (hint) hint.textContent = stage.dataset.hint || '';
    if (stageNow) stageNow.textContent = pad(index + 1);
    if (progress) progress.style.width = ((index + 1) / stages.length) * 100 + '%';

    stages.forEach((s, i) => {
      s.classList.toggle('is-active', i === index);
      s.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }

  function setStage(index, { fromAuto = false } = {}) {
    const stage = stages[index];
    if (!stage) return;
    if (index === activeIndex && !fromAuto) return;

    activeIndex = index;
    updateMeta(index);

    const src = stage.dataset.video;
    const current = videos[visibleSlot];

    if (!src) {
      restartAuto();
      return;
    }

    if (current.getAttribute('src') === src && current.classList.contains('is-visible')) {
      playVideo(current);
      restartAuto();
      return;
    }

    const nextSlot = visibleSlot === 0 ? 1 : 0;
    const next = videos[nextSlot];

    if (next.getAttribute('src') !== src) next.setAttribute('src', src);
    next.classList.remove('is-visible');
    next.load();

    const swap = () => {
      playVideo(next);
      next.classList.add('is-visible');
      current.classList.remove('is-visible');
      setTimeout(() => current.pause(), 400);
      visibleSlot = nextSlot;
    };

    if (next.readyState >= 2) swap();
    else next.addEventListener('canplay', swap, { once: true });

    restartAuto();
  }

  function nextStage() {
    setStage((activeIndex + 1) % stages.length, { fromAuto: true });
  }

  function restartAuto() {
    clearTimeout(autoTimer);
    if (isPaused) return;

    const fill = progress;
    if (fill) {
      fill.style.transition = 'none';
      fill.style.width = (activeIndex / stages.length) * 100 + '%';
      requestAnimationFrame(() => {
        fill.style.transition = `width ${AUTO_MS}ms linear`;
        fill.style.width = ((activeIndex + 1) / stages.length) * 100 + '%';
      });
    }

    autoTimer = setTimeout(nextStage, AUTO_MS);
  }

  stages.forEach((stage, index) => {
    stage.addEventListener('click', () => setStage(index));
    stage.addEventListener('mouseenter', () => setStage(index));
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setStage(index);
      }
    });
  });

  root.addEventListener('mouseenter', () => {
    isPaused = true;
    clearTimeout(autoTimer);
    if (progress) progress.style.transition = 'width 0.35s ease';
  });

  root.addEventListener('mouseleave', () => {
    isPaused = false;
    restartAuto();
  });

  if (frame) {
    frame.addEventListener('mousemove', (e) => {
      const rect = frame.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      videos.forEach((v) => {
        v.style.objectPosition = x + '% center';
      });
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playVideo(videos[visibleSlot]);
          restartAuto();
        } else {
          pauseAllVideos();
          clearTimeout(autoTimer);
        }
      });
    },
    { threshold: 0.35 }
  );
  observer.observe(root);

  setStage(0, { fromAuto: true });
})();
