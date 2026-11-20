(() => {
  const results = document.getElementById('supplier-results');
  if (!results) return;

  const search = document.getElementById('supplier-search');
  const count = document.getElementById('supplier-record-count');
  const more = document.getElementById('supplier-more');
  const buttons = [...document.querySelectorAll('[data-supplier-filter]')];

  let records = [];
  let filter = 'all';
  let limit = 12;

  const statusLabels = {
    Ready: 'Ready',
    Review: 'Needs answer',
    Discontinued: 'Discontinued',
  };
  const statusClasses = {
    Ready: 'ready',
    Review: 'review',
    Discontinued: 'discontinued',
  };
  const flagLabels = {
    sku_format_normalised: 'SKU normalised',
    whitespace_or_case_normalised: 'Whitespace/case fixed',
    category_mismatch_corrected: 'Category corrected',
    category_filled_from_type: 'Category filled',
    duplicate_title_resolved: 'Title disambiguated',
    missing_price: 'Price needed',
    missing_image: 'Missing image',
    broken_image: 'Broken image',
    missing_barcode: 'Barcode missing',
    invalid_barcode: 'Barcode invalid',
    missing_brand: 'Brand missing',
    missing_category: 'Category missing',
    variant_option_missing: 'Variant option missing',
    discontinued: 'Discontinued',
  };
  const blockingFlags = new Set([
    'missing_price',
    'missing_image',
    'broken_image',
    'missing_barcode',
    'invalid_barcode',
    'missing_brand',
    'missing_category',
    'variant_option_missing',
  ]);

  const normalise = value => String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const flagsFor = row => (
    row.review_flags ? row.review_flags.split('; ').filter(Boolean) : []
  );

  const tag = (label, kind) => node('span', `check-tag ${kind || ''}`.trim(), label);

  function recordCard(row) {
    const article = node('article', 'supplier-record');

    const main = node('div', 'supplier-record-main');
    main.append(
      node('span', `record-status ${statusClasses[row.import_status] || ''}`.trim(), statusLabels[row.import_status] || row.import_status),
      node('h3', '', row.product_name),
      node('p', 'record-code', [row.sku, row.brand, row.category].filter(Boolean).join(' · ')),
    );

    const source = node('div', 'supplier-record-source');
    source.append(
      node('span', '', 'Source'),
      node('strong', '', `${row.source_file} · row ${row.source_row}`),
      node('p', '', row.price_gbp ? `£${row.price_gbp}` : 'No firm price'),
    );

    const checks = node('div', 'supplier-record-checks');
    const flags = flagsFor(row);

    if (row.import_status === 'Ready') {
      checks.append(tag('Image OK', 'ok'), tag('Barcode OK', 'ok'), tag('Price set', 'ok'));
    } else if (row.import_status === 'Discontinued') {
      checks.append(tag('Not in platform files', 'info'));
    } else {
      const blocking = flags.filter(flag => blockingFlags.has(flag));
      if (!blocking.length) checks.append(tag('Needs review', 'warn'));
      blocking.forEach(flag => checks.append(tag(flagLabels[flag] || flag, 'warn')));
    }

    const nonBlocking = flags
      .filter(flag => !blockingFlags.has(flag) && flag !== 'discontinued')
      .slice(0, 2);
    nonBlocking.forEach(flag => checks.append(tag(flagLabels[flag] || flag, 'info')));

    if (row.parent_sku && row.option_name) {
      checks.append(tag(`${row.option_name}: ${row.option_value}`, 'info'));
    }

    article.append(main, source, checks);
    return article;
  }

  function matchesFilter(row) {
    if (filter === 'ready') return row.import_status === 'Ready';
    if (filter === 'review') return row.import_status === 'Review';
    if (filter === 'discontinued') return row.import_status === 'Discontinued';
    return true;
  }

  function render() {
    const query = normalise(search.value.trim());
    const rows = records.filter(row => {
      if (!matchesFilter(row)) return false;
      if (!query) return true;
      const haystack = normalise([
        row.sku,
        row.product_name,
        row.brand,
        row.category,
        row.source_file,
        row.review_flags,
        row.option_name,
        row.option_value,
      ].join(' '));
      return haystack.includes(query);
    });

    const shown = rows.slice(0, limit);
    results.replaceChildren(...shown.map(recordCard));

    if (!rows.length) {
      count.textContent = `No records match that search. ${records.length} records in the cleaned master.`;
    } else {
      const suffix = query ? ' matching' : '';
      count.textContent = `Showing ${shown.length} of ${rows.length}${suffix} records.`;
    }
    more.hidden = shown.length >= rows.length;
  }

  function setFilter(next) {
    filter = next;
    limit = 12;
    buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.supplierFilter === filter));
    });
    render();
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => setFilter(button.dataset.supplierFilter));
  });
  search.addEventListener('input', () => {
    limit = 12;
    render();
  });
  more.addEventListener('click', () => {
    limit += 12;
    render();
  });

  const setExample = (name, value) => {
    if (value === undefined || value === null || value === '') return;
    document.querySelectorAll(`[data-example="${name}"]`).forEach(element => {
      element.textContent = value;
    });
  };

  function hydrateExamples(data) {
    const examples = data.examples || {};

    const format = examples.format;
    if (format) {
      setExample('format-row', format.source_row);
      setExample('format-file', format.source_file);
      setExample('format-sku', format.sku);
      setExample('format-source-sku', format.source_sku);
      setExample('format-source-price', format.source_price || 'Blank');
      setExample('format-clean-sku', format.clean_sku);
      setExample('format-clean-price', format.clean_price);
    }

    const duplicate = (examples.duplicates || [])[0];
    if (duplicate) {
      setExample('duplicate-sku', duplicate.sku);
      setExample('duplicate-rows', duplicate.source_rows.join(' and '));
      setExample('duplicate-count', `${duplicate.source_rows.length} rows`);
      setExample(
        'duplicate-field',
        (duplicate.merged_field_labels || []).join(', ') || 'No blank field',
      );
    }

    const review = examples.review || [];
    const barcode = review.find(entry => entry.issue === 'Invalid barcode');
    if (barcode) setExample('review-barcode', barcode.source_value);
    const missingPrice = review.find(entry => entry.issue === 'Missing or non-numeric price');
    if (missingPrice) setExample('review-price', missingPrice.source_value || 'Blank');
  }

  fetch('supplier-catalogue-data.json')
    .then(response => {
      if (!response.ok) throw new Error('record data');
      return response.json();
    })
    .then(data => {
      records = data.records || [];
      hydrateExamples(data);
      render();
    })
    .catch(() => {
      count.textContent = 'The record file could not be loaded. Download the cleaned master CSV to inspect all 250 records.';
      results.replaceChildren(node('p', 'no-records', 'Record browsing needs the data file. The cleaned CSV contains the same 250 records.'));
    });
})();
