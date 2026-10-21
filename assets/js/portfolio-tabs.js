(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('[data-panel]')];
  if (!tabs.length || !panels.length) return;
  const navigation = document.querySelector('#portfolio-tabs');
  const aliases = {research:'project', projects:'project', profile:'about', skills:'about', 'skills--contact':'contact'};
  const known = new Set(tabs.map(tab => tab.dataset.tab));
  const dialog = document.querySelector('#project-dialog');
  const dialogBody = document.querySelector('#project-dialog-body');
  const closeButton = document.querySelector('.dialog-close');
  let modalOpener = null;

  function tabFromHash() {
    let hash;
    try { hash = decodeURIComponent(location.hash.slice(1)); } catch { hash = ''; }
    const target = aliases[hash] || hash;
    return known.has(target) ? target : 'about';
  }

  function selectTab(name, {historyMode = 'none', focus = false, reposition = false} = {}) {
    if (!known.has(name)) return;
    if (dialog?.open) dialog.close();
    tabs.forEach(tab => {
      const selected = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      tab.classList.toggle('is-active', selected);
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.panel !== name; });
    document.title = `${name === 'project' ? 'Project' : name === 'contact' ? 'Contact' : 'About Me'} · 김연주`;
    if (historyMode !== 'none' && location.hash !== `#${name}`) {
      const url = `${location.pathname}${location.search}#${name}`;
      history[historyMode === 'replace' ? 'replaceState' : 'pushState']({tab:name}, '', url);
    }
    const current = tabs.find(tab => tab.dataset.tab === name);
    if (focus) current.focus({preventScroll:true});
    if (reposition && navigation && window.scrollY > navigation.offsetTop) {
      window.scrollTo({top:navigation.offsetTop, behavior:'instant'});
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      selectTab(tab.dataset.tab, {historyMode:'push', reposition:true});
    });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (event.key === 'Enter' || event.key === ' ') next = index;
      if (next === undefined) return;
      event.preventDefault();
      selectTab(tabs[next].dataset.tab, {historyMode:'push', focus:true, reposition:true});
    });
  });
  window.addEventListener('popstate', () => selectTab(tabFromHash()));
  window.addEventListener('hashchange', () => selectTab(tabFromHash(), {historyMode:'replace'}));
  selectTab(tabFromHash(), {historyMode:'replace'});

  document.querySelector('.skip-link')?.addEventListener('click', event => {
    event.preventDefault();
    const visiblePanel = panels.find(panel => !panel.hidden);
    visiblePanel?.focus({preventScroll:true});
    visiblePanel?.scrollIntoView({block:'start', behavior:'instant'});
  });

  document.querySelectorAll('[data-open-project]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const template = document.getElementById(`project-${link.dataset.openProject}`);
      if (!dialog || !dialogBody || !template || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      modalOpener = link;
      dialogBody.replaceChildren(template.content.cloneNode(true));
      dialog.setAttribute('aria-labelledby', `modal-title-${link.dataset.openProject}`);
      dialog.showModal();
      document.body.classList.add('modal-open');
      closeButton.focus({preventScroll:true});
    });
  });
  closeButton?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('cancel', event => {
    event.preventDefault();
    dialog.close();
  });
  dialog?.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog?.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (modalOpener?.isConnected && !modalOpener.closest('[hidden]')) modalOpener.focus({preventScroll:true});
    else tabs.find(tab => tab.getAttribute('aria-selected') === 'true')?.focus({preventScroll:true});
  });

  const copyButton = document.querySelector('#copy-email');
  const copyStatus = document.querySelector('#copy-status');
  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('yeonjuk8@gmail.com');
      copyStatus.textContent = '메일 주소를 복사했습니다.';
    } catch {
      copyStatus.textContent = '복사하지 못했습니다. 위의 메일 주소를 선택해 복사해 주세요.';
    }
  });

  const phrase = document.querySelector('#banner-phrase');
  const pauseButton = document.querySelector('#rotation-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const phrases = ['양자정보와 AI를 연구하는', '흉부 X-ray 분류 모델을 만드는', '양자 회로와 AI를 함께 실험하는'];
  let phraseIndex = 0;
  let paused = false;
  let timer = null;
  function updateRotation() {
    clearInterval(timer);
    timer = null;
    if (!phrase || !pauseButton) return;
    pauseButton.hidden = reducedMotion.matches;
    pauseButton.setAttribute('aria-label', paused ? '배너 문구 전환 재생' : '배너 문구 전환 일시정지');
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = paused ? '▶' : 'Ⅱ';
    if (paused || reducedMotion.matches || document.hidden) return;
    timer = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      phrase.textContent = phrases[phraseIndex];
      phrase.animate?.([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}], {duration:240,easing:'ease-out'});
    }, 4200);
  }
  pauseButton?.addEventListener('click', () => { paused = !paused; updateRotation(); });
  document.addEventListener('visibilitychange', updateRotation);
  reducedMotion.addEventListener?.('change', updateRotation);
  updateRotation();
})();
