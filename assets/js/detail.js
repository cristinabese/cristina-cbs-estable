(() => {
  const items = document.querySelectorAll('.detail-page main > section, .detail-page .detail-card, .detail-page .detail-cta');
  if (!items.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  items.forEach((item, index) => {
    item.classList.add('detail-reveal');
    item.style.setProperty('--detail-delay', `${Math.min(index * 70, 280)}ms`);
  });
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('detail-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  items.forEach(item => observer.observe(item));
})();
