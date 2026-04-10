// js/app.js — Foreclosure + Tax Sale Tracker

const STORE_KEY = 'fctl_v1';
const TAX_STAGES = new Set(['Tax Lien', 'Tax Deed', 'Land Bank']);

let listings = [];
let activeMarket = 'all';
let editId = null;

// ── Storage ────────────────────────────────────────────────────────────────

function loadListings() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { listings = JSON.parse(raw); return; }
  } catch (e) {}
  listings = JSON.parse(JSON.stringify(SEED_DATA));
  saveListings();
}

function saveListings() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(listings));
    const el = document.getElementById('savedAt');
    if (el) el.textContent = 'Saved ' + new Date().toLocaleTimeString();
  } catch (e) {}
}

function uid() {
  return 'l' + Date.now() + Math.random().toString(36).slice(2, 6);
}

// ── Formatting ─────────────────────────────────────────────────────────────

function fmtMoney(v) {
  if (!v && v !== 0) return '—';
  return '$' + parseInt(v).toLocaleString();
}

function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

function stageBadge(s) {
  const map = {
    'Pre-Foreclosure': 'pre',
    'Filing':          'filing',
    'Auction':         'auction',
    'REO':             'reo',
    'Tax Lien':        'taxlien',
    'Tax Deed':        'taxdeed',
    'Land Bank':       'landbank',
  };
  const cls = map[s] || 'filing';
  return `<span class="badge badge-${cls}">${s}</span>`;
}

// ── Filtering & sorting ────────────────────────────────────────────────────

function getFiltered() {
  const stage  = document.getElementById('fStage').value;
  const type   = document.getElementById('fType').value;
  const sort   = document.getElementById('fSort').value;
  const search = document.getElementById('fSearch').value.toLowerCase();

  let rows = listings.filter(r => {
    if (activeMarket !== 'all' && r.market !== activeMarket) return false;
    if (stage && r.stage !== stage) return false;
    if (type === 'foreclosure' && TAX_STAGES.has(r.stage)) return false;
    if (type === 'tax' && !TAX_STAGES.has(r.stage)) return false;
    if (search) {
      const haystack = [r.address, r.zip, r.county, r.notes, r.source]
        .join(' ').toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  if (sort === 'auction') {
    rows.sort((a, b) => {
      if (!a.auction && !b.auction) return 0;
      if (!a.auction) return 1;
      if (!b.auction) return -1;
      return a.auction.localeCompare(b.auction);
    });
  } else if (sort === 'value') {
    rows.sort((a, b) => (b.est_value || 0) - (a.est_value || 0));
  } else if (sort === 'county') {
    rows.sort((a, b) => (a.county || '').localeCompare(b.county || ''));
  } else {
    rows.sort((a, b) => (b.filed || '').localeCompare(a.filed || ''));
  }

  return rows;
}

// ── Render ─────────────────────────────────────────────────────────────────

function renderMetrics() {
  const today = new Date().toISOString().slice(0, 10);
  const taxRows = listings.filter(r => TAX_STAGES.has(r.stage));
  const fcRows  = listings.filter(r => !TAX_STAGES.has(r.stage));
  const upcoming = listings.filter(r => r.auction && r.auction >= today);

  const cards = [
    { label: 'Total listings',   value: listings.length,                                cls: '' },
    { label: 'Foreclosures',     value: fcRows.length,                                  cls: 'accent' },
    { label: 'Tax sales',        value: taxRows.length,                                 cls: 'purple' },
    { label: 'Upcoming sales',   value: upcoming.length,                                cls: 'amber' },
    { label: 'REO / bank-owned', value: listings.filter(r => r.stage === 'REO').length, cls: 'red' },
    { label: 'Land bank',        value: listings.filter(r => r.stage === 'Land Bank').length, cls: 'green' },
  ];

  document.getElementById('metrics').innerHTML = cards.map(c => `
    <div class="metric">
      <div class="metric-label">${c.label}</div>
      <div class="metric-value ${c.cls}">${c.value}</div>
    </div>`).join('');
}

function renderTable() {
  const rows  = getFiltered();
  const today = new Date().toISOString().slice(0, 10);

  document.getElementById('rowCount').textContent =
    rows.length + ' listing' + (rows.length !== 1 ? 's' : '');

  if (!rows.length) {
    document.getElementById('tbody').innerHTML =
      '<tr><td colspan="9" class="empty-state">No listings match your filters. Click "+ Add listing" to get started.</td></tr>';
    return;
  }

  document.getElementById('tbody').innerHTML = rows.map(r => {
    const soonCls = r.auction && r.auction >= today ? 'sale-soon' : '';
    const taxSub  = TAX_STAGES.has(r.stage) && r.tax_owed
      ? `<span class="addr-sub">Owed: ${fmtMoney(r.tax_owed)}${r.redemption_period ? ' · ' + r.redemption_period : ''}</span>`
      : '';
    const linkBtn = r.url
      ? `<button class="act-btn link" onclick="window.open('${r.url}','_blank')">Link</button>`
      : '';

    return `<tr>
      <td>
        <span class="addr-main" title="${r.address}">${r.address}</span>
        ${taxSub}
      </td>
      <td>${r.county || '—'}</td>
      <td>${stageBadge(r.stage)}</td>
      <td style="white-space:nowrap;font-size:12px">${fmtDate(r.filed)}</td>
      <td style="white-space:nowrap;font-size:12px" class="${soonCls}">${fmtDate(r.auction)}</td>
      <td class="money">${fmtMoney(r.est_value)}</td>
      <td class="tax-owed-cell">${r.tax_owed ? fmtMoney(r.tax_owed) : '—'}</td>
      <td><span class="src-chip" title="${r.source || ''}">${r.source || '—'}</span></td>
      <td>
        <div class="row-actions">
          ${linkBtn}
          <button class="act-btn" onclick="editListing('${r.id}')">Edit</button>
          <button class="act-btn del" onclick="deleteListing('${r.id}')">Del</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function render() {
  renderMetrics();
  renderTable();
}

// ── Market tabs ────────────────────────────────────────────────────────────

document.getElementById('marketTabs').addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  activeMarket = tab.dataset.market;
  render();
});

// ── Filter listeners ───────────────────────────────────────────────────────

['fStage', 'fType', 'fSort'].forEach(id => {
  document.getElementById(id).addEventListener('change', render);
});
document.getElementById('fSearch').addEventListener('input', render);

// ── Add / Edit modal ───────────────────────────────────────────────────────

function openAdd() {
  editId = null;
  document.getElementById('modalTitle').textContent = 'Add listing';
  const fields = ['fAddress','fZip','fCounty','fSource','fUrl','fNotes','fValue','fTaxOwed','fRedemption','fTaxRate'];
  fields.forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('fFiled').value = new Date().toISOString().slice(0, 10);
  document.getElementById('fAuction').value = '';
  document.getElementById('fStageIn').value = 'Pre-Foreclosure';
  document.getElementById('fMarket').value = activeMarket === 'all' ? 'lucas' : activeMarket;
  document.getElementById('taxFields').style.display = 'none';
  document.getElementById('addModal').classList.add('open');
}

function editListing(id) {
  const r = listings.find(l => l.id === id);
  if (!r) return;
  editId = id;
  document.getElementById('modalTitle').textContent = 'Edit listing';
  document.getElementById('fAddress').value   = r.address || '';
  document.getElementById('fZip').value       = r.zip || '';
  document.getElementById('fCounty').value    = r.county || '';
  document.getElementById('fMarket').value    = r.market || 'lucas';
  document.getElementById('fStageIn').value   = r.stage || 'Pre-Foreclosure';
  document.getElementById('fSource').value    = r.source || '';
  document.getElementById('fFiled').value     = r.filed || '';
  document.getElementById('fAuction').value   = r.auction || '';
  document.getElementById('fValue').value     = r.est_value || '';
  document.getElementById('fUrl').value       = r.url || '';
  document.getElementById('fNotes').value     = r.notes || '';
  document.getElementById('fTaxOwed').value   = r.tax_owed || '';
  document.getElementById('fRedemption').value = r.redemption_period || '';
  document.getElementById('fTaxRate').value   = r.tax_rate || '';
  document.getElementById('taxFields').style.display = TAX_STAGES.has(r.stage) ? 'block' : 'none';
  document.getElementById('addModal').classList.add('open');
}

document.getElementById('fStageIn').addEventListener('change', function () {
  document.getElementById('taxFields').style.display =
    TAX_STAGES.has(this.value) ? 'block' : 'none';
});

function saveListing() {
  const addr = document.getElementById('fAddress').value.trim();
  if (!addr) { alert('Address is required.'); return; }

  const rec = {
    id:               editId || uid(),
    address:          addr,
    zip:              document.getElementById('fZip').value.trim(),
    county:           document.getElementById('fCounty').value.trim(),
    market:           document.getElementById('fMarket').value,
    stage:            document.getElementById('fStageIn').value,
    source:           document.getElementById('fSource').value.trim(),
    filed:            document.getElementById('fFiled').value,
    auction:          document.getElementById('fAuction').value,
    est_value:        parseInt(document.getElementById('fValue').value) || null,
    url:              document.getElementById('fUrl').value.trim(),
    notes:            document.getElementById('fNotes').value.trim(),
    tax_owed:         parseInt(document.getElementById('fTaxOwed').value) || null,
    redemption_period: document.getElementById('fRedemption').value.trim(),
    tax_rate:         parseFloat(document.getElementById('fTaxRate').value) || null,
  };

  if (editId) {
    const idx = listings.findIndex(l => l.id === editId);
    if (idx >= 0) listings[idx] = rec;
  } else {
    listings.unshift(rec);
  }

  saveListings();
  render();
  closeModal();
}

function deleteListing(id) {
  if (!confirm('Delete this listing?')) return;
  listings = listings.filter(l => l.id !== id);
  saveListings();
  render();
}

function closeModal() {
  document.getElementById('addModal').classList.remove('open');
  editId = null;
}

// Close modal on overlay click
document.getElementById('addModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ── Import ─────────────────────────────────────────────────────────────────

function openImport() {
  document.getElementById('importText').value = '';
  document.getElementById('importModal').classList.add('open');
}

function closeImport() {
  document.getElementById('importModal').classList.remove('open');
}

document.getElementById('importModal').addEventListener('click', function(e) {
  if (e.target === this) closeImport();
});

function doImport() {
  const raw = document.getElementById('importText').value.trim();
  if (!raw) return;

  const lines = raw.split('\n').filter(l => l.trim());
  let added = 0;

  lines.forEach((line, i) => {
    if (i === 0 && line.toLowerCase().includes('address')) return;
    const p = line.split(',').map(x => x.trim().replace(/^"|"$/g, ''));
    if (!p[0]) return;

    listings.unshift({
      id:               uid(),
      address:          p[0],
      zip:              p[1] || '',
      county:           p[2] || '',
      market:           (p[3] || 'lucas').toLowerCase().includes('dmv') ? 'dmv' : 'lucas',
      stage:            p[4] || 'Filing',
      filed:            p[5] || '',
      auction:          p[6] || '',
      est_value:        parseInt(p[7]) || null,
      source:           p[8] || '',
      url:              p[9] || '',
      notes:            p[10] || '',
      tax_owed:         parseInt(p[11]) || null,
      redemption_period: p[12] || '',
      tax_rate:         parseFloat(p[13]) || null,
    });
    added++;
  });

  saveListings();
  render();
  closeImport();
  if (added) alert(added + ' listing' + (added !== 1 ? 's' : '') + ' imported.');
}

// Drag-and-drop CSV onto page
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (!file || !file.name.endsWith('.csv')) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('importText').value = ev.target.result;
    openImport();
  };
  reader.readAsText(file);
});

// ── Export ─────────────────────────────────────────────────────────────────

function exportCSV() {
  const headers = [
    'address','zip','county','market','stage','filed','auction',
    'est_value','source','url','notes','tax_owed','redemption_period','tax_rate'
  ];
  const rows = listings.map(r =>
    headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const a   = document.createElement('a');
  a.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'foreclosures_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
}

// ── Keyboard shortcuts ─────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeImport(); }
  if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); openAdd(); }
});

// ── Init ───────────────────────────────────────────────────────────────────

loadListings();
render();
