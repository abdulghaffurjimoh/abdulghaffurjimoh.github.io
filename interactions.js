(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.menu-toggle');
  const nav = header?.querySelector('#primary-navigation');
  if (toggle && nav) {
    const mobile = matchMedia('(max-width: 760px)');
    const setMenu = (open, restoreFocus = false) => {
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
      if (restoreFocus) toggle.focus();
    };
    header.classList.add('navigation-ready');
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', event => {
      if (event.target.closest('a') && mobile.matches) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    document.addEventListener('click', event => {
      if (!header.contains(event.target) && toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
    header.addEventListener('focusout', () => {
      requestAnimationFrame(() => {
        if (!header.contains(document.activeElement)) setMenu(false);
      });
    });
    mobile.addEventListener('change', () => {
      const focused = document.activeElement;
      setMenu(false);
      if (mobile.matches && nav.contains(focused)) toggle.focus();
      if (!mobile.matches && focused === toggle) header.querySelector('.brand').focus();
    });
  }
  // Announce actions accurately: a download click is a request, not proof of completion.
  const status = document.createElement('p');
  status.className = 'interaction-status';
  status.setAttribute('role', 'status');
  const contact = document.querySelector('.contact-section > .button');
  if (contact) {
    const actions = document.createElement('div');
    actions.className = 'contact-actions';
    contact.before(actions); actions.append(contact);
    const copy = document.createElement('button');
    copy.type = 'button'; copy.className = 'copy-email'; copy.textContent = 'Copy email address';
    actions.append(copy, status);
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('abdulghaffur.jimoh@gmail.com');
        status.textContent = 'Email address copied.';
        copy.textContent = 'Copied ✓';
        setTimeout(() => { copy.textContent = 'Copy email address'; }, 2400);
      } catch { status.textContent = 'You can copy the email address from the footer below.'; }
    });
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.getElementById(link.hash.slice(1));
      if (!target || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); history.pushState(null, '', link.hash);
      target.setAttribute('tabindex', '-1'); target.focus({preventScroll:true});
      target.scrollIntoView({behavior:reduced ? 'instant' : 'smooth',block:'start'});
    });
  });
  const sectionLinks = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting) sectionLinks.forEach(link => {
        if(link.hash === '#' + entry.target.id) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      }); });
    },{rootMargin:'-10% 0px -50% 0px'});
    sectionLinks.forEach(link => {const section=document.getElementById(link.hash.slice(1));if(section)observer.observe(section);});
  }
  const chart = document.getElementById('retail-chart');
  if (!chart) return;
  const dataURL = document.querySelector('script[src*="app.js"]').src.includes('/assets/') ? 'assets/data.json' : new URL('data.json',document.baseURI);
  // The authoring copy keeps its data in assets; the published site uses flat paths.
  const source = document.querySelector('link[rel="icon"]').getAttribute('href').startsWith('assets/') ? 'assets/data.json' : dataURL;
  fetch(source).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
    const box = document.createElement('div'); box.className='month-inspector';
    box.innerHTML='<label for="sales-month"><span id="month-label">November 2011</span><output id="month-value" for="sales-month"></output></label><input id="sales-month" type="range" min="0" max="12" value="11" step="1" aria-label="Explore monthly sales"><small>Drag to explore each month · arrow keys work too.</small>';
    document.querySelector('.chart-months').after(box);
    const slider=box.querySelector('input'),label=box.querySelector('#month-label'),value=box.querySelector('output');
    const money=new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0});
    let market='All';
    function update(){
      const i=Number(slider.value),row=data[market][i];
      const month = new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(row[0]+'-01T00:00:00Z'));
      label.textContent=month+(i===12?' · partial':''); value.textContent=money.format(row[1]);
      slider.setAttribute('aria-valuetext',`${month}: ${money.format(row[1])}${i===12?', partial month':''}`);
      chart.querySelectorAll('circle').forEach((dot,index)=>{dot.setAttribute('r',index===i?'6':'3');dot.setAttribute('fill',index===i?'#853D68':'#FFF8EA');});
    }
    slider.addEventListener('input',update);
    document.querySelectorAll('[data-market]').forEach(button=>button.addEventListener('click',()=>{market=button.dataset.market;update();}));
    new MutationObserver(update).observe(chart,{childList:true});
    update();
  }).catch(()=>{});
})();
