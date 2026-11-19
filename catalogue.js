(() => {
  const host = document.getElementById('catalogue-results');
  if (!host) return;
  const toolbar = document.querySelector('.record-toolbar');
  const search = document.getElementById('catalogue-search');
  const count = document.querySelector('.record-count');
  const more = document.querySelector('.records-more');
  const buttons = [...document.querySelectorAll('[data-record-filter]')];
  let records = [], filter = 'all', limit = 8;
  const node = (tag, className, text) => { const el = document.createElement(tag); if(className) el.className = className; if(text !== undefined) el.textContent = text; return el; };
  const normalise = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function render() {
    const query = normalise(search.value.trim());
    const rows = records.filter(r => (filter === 'all' || (filter === 'review' ? r.issue_count > 0 : r.issue_count === 0)) && (!query || normalise([r.product_name,r.brand,r.barcode,r.pack_size,r.issues].join(' ')).includes(query)));
    const fragment = document.createDocumentFragment();
    rows.slice(0,limit).forEach(r => {
      const card = node('article','catalogue-record');
      const identity = node('div');identity.append(node('h3','',r.product_name || 'Product name missing'),node('span','record-code',`Barcode ${r.barcode} · Source row ${r.source_row}`),node('p','record-brand',r.brand || 'Brand missing in source'));
      const state = node('div');state.append(node('span','record-status'+(r.issue_count===0?' pass':''),r.review_status));
      const pack=node('p','record-pack');pack.append(node('span','','Pack size'),node('strong','',r.pack_size || 'Missing in source'));state.append(pack);
      const action=node('div','record-action');action.append(node('p','',r.issues || 'No gaps found in the selected field checks.'),node('p','',r.next_action));
      const link=node('a','','View live source record ↗');link.href=r.source_url;link.target='_blank';link.rel='noopener noreferrer';action.append(link);
      card.append(identity,state,action);fragment.append(card);
    });
    if(!rows.length) fragment.append(node('p','no-records','No matching records. Try another product, barcode or filter.'));
    host.replaceChildren(fragment);
    count.textContent = `${rows.length} matching ${rows.length===1?'record':'records'} · Showing ${Math.min(limit,rows.length)} of ${rows.length}`;
    more.hidden = rows.length <= limit;
  }
  search.addEventListener('input',()=>{limit=8;render();});
  buttons.forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.recordFilter;limit=8;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}));
  more.addEventListener('click',()=>{const previous=limit;limit+=8;render();const firstNew=host.children[previous];if(firstNew){firstNew.setAttribute('tabindex','-1');firstNew.focus({preventScroll:true});}});
  fetch('catalogue-data.json').then(r=>{if(!r.ok)throw Error('data');return r.json();}).then(data=>{records=data.records;toolbar.hidden=false;render();}).catch(()=>{count.textContent='The interactive records could not load. Download the workbook or CSV below to inspect the full catalogue.';});
})();
