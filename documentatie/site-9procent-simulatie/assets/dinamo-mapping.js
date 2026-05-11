/* ===========================================================
   DINAMO-mapping — interactieve weergave
   Carucci-signalen + doing-mode + Vertrouwen-resultante
   gekoppeld aan DINAMO-dimensies en interventie-aangrijpingspunten.

   Vanilla JS, geen frameworks. Gebruikt veilige DOM-methoden
   (textContent + createElement) i.p.v. innerHTML.
   =========================================================== */

const mapping = [
  {
    id: 'loss',
    signaal: 'Loss',
    carucci: '"Wat verlies ik?"',
    dimensie: 'Gevolgen voor het werk',
    cluster: 'Willen',
    interventie: 'Werktevredenheid, loopbaankansen, identiteit aan rol',
    debriefvraag: 'Wat verloor de medewerker in de simulatie? Status, expertise, decision rights, sociale rol? Wat zou jij persoonlijk verloren hebben in hun positie?',
    soort: 'carucci'
  },
  {
    id: 'anxiety',
    signaal: 'Anxiety',
    carucci: '"Wat betekent dit voor mij?"',
    dimensie: 'Emoties',
    cluster: 'Willen',
    interventie: 'Het bedreigende of benauwende reduceren — herhaalde, consistente communicatie; onzekerheid normaliseren',
    debriefvraag: 'Welke worst-case-scenario\'s vulden medewerkers in waar de directie geen helderheid gaf? Hoe vaak werd dezelfde vraag herhaald — een teken van onvoldoende verwerkte communicatie?',
    soort: 'carucci'
  },
  {
    id: 'control',
    signaal: 'Lack of control',
    carucci: '"Waarom overkomt me dit?"',
    dimensie: 'Betrokkenheid',
    cluster: 'Willen',
    interventie: 'Meedenken-en-meedoen-ruimte; expliciet maken waar invloed mogelijk is',
    debriefvraag: 'Waar voelden medewerkers zich machteloos? Werd er gevraagd om input ná een gemaakt besluit (faux-inclusion)? Wat zou échte co-creatie hier opgeleverd hebben?',
    soort: 'carucci'
  },
  {
    id: 'flaws',
    signaal: 'Flaws in change',
    carucci: '"Dit gaat zo niet werken"',
    dimensie: 'Aansturing',
    cluster: 'Kunnen',
    interventie: 'Heldere fasering, duidelijke eigenaar, realistische timelines, executie-haken expliciet benoemen',
    debriefvraag: 'Welke praktische bezwaren bracht de medewerker in — en hoe reageerde de directie? Werd het signaal als feedback of als weerstand behandeld? Wie was hier de échte expert op de operationele realiteit?',
    soort: 'carucci'
  },
  {
    id: 'doing-mode',
    signaal: 'Doing-mode default',
    carucci: '"Wat is de status van X?"',
    dimensie: 'Informatievoorziening',
    cluster: 'Kunnen',
    interventie: 'Open vragen vervangen status-vragen; novelty + ruimte voor reflectie planmatig inbouwen',
    debriefvraag: 'Hoe vaak opende de directie met een taak-vraag versus een idee-vraag? Wat veranderde er in de groep als er één keer spacious mode optrad? Hoe ziet "be clear, be quick, be gone" eruit in deze context?',
    soort: 'reitz-higgins'
  },
  {
    id: 'vertrouwen',
    signaal: 'Vertrouwen (resultante)',
    carucci: 'Gemeten thermometer — niet zelf de oorzaak',
    dimensie: 'Vertrouwen (in koers + succes)',
    cluster: 'Kunnen — uitkomst-laag',
    interventie: 'Niet direct interveniëren — dit is de thermometer. Adresseren gebeurt in Willen-cluster + Aansturing + Informatievoorziening.',
    debriefvraag: 'Waar landde het verloren vertrouwen vandaag — en uit welke kleinere ondermijningen kwam het voort? Welke één-dimensie-interventie (uit Willen of Kunnen) zou het meest impact hebben gehad?',
    soort: 'resultante'
  }
];

/* ----------- Helpers (safe DOM construction) ----------- */

function el(tag, opts) {
  const node = document.createElement(tag);
  if (!opts) return node;
  if (opts.className) node.className = opts.className;
  if (opts.text != null) node.textContent = opts.text;
  if (opts.attrs) {
    for (const key in opts.attrs) {
      node.setAttribute(key, opts.attrs[key]);
    }
  }
  if (opts.children) {
    opts.children.forEach((child) => {
      if (child) node.appendChild(child);
    });
  }
  return node;
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/* ----------- Render ----------- */

function init() {
  const grid = document.getElementById('mapping-grid');
  const detail = document.getElementById('mapping-detail');
  if (!grid || !detail) return;

  mapping.forEach((item) => {
    const card = el('button', {
      className: 'mapping-card' + (item.soort === 'resultante' ? ' resultante' : ''),
      attrs: {
        type: 'button',
        'data-id': item.id,
        'aria-controls': 'mapping-detail',
        'aria-expanded': 'false'
      },
      children: [
        el('span', { className: 'signal-label', text: item.signaal }),
        el('div', { className: 'signal-question', text: item.carucci })
      ]
    });
    card.addEventListener('click', () => selectCard(item.id));
    grid.appendChild(card);
  });

  showPlaceholder();
}

function showPlaceholder() {
  const detail = document.getElementById('mapping-detail');
  clear(detail);
  detail.classList.add('placeholder');
  detail.classList.remove('visible');
  detail.appendChild(el('p', {
    text: 'Klik op een kaart hierboven om de bijbehorende DINAMO-dimensie, het interventie-aangrijpingspunt en een debrief-vraag te zien.'
  }));
}

function selectCard(id) {
  const item = mapping.find((m) => m.id === id);
  if (!item) return;

  // Update active state on cards
  document.querySelectorAll('.mapping-card').forEach((c) => {
    const isActive = c.dataset.id === id;
    c.classList.toggle('active', isActive);
    c.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });

  // Render detail panel
  const detail = document.getElementById('mapping-detail');
  clear(detail);
  detail.classList.remove('placeholder');
  detail.classList.add('visible');

  // Heading row: badge + signaal + carucci-quote
  const badge = el('span', {
    className: 'badge' + (item.soort === 'resultante' ? ' amber' : ''),
    text: item.signaal
  });
  const subtitle = el('span', {
    text: ' ' + item.carucci,
    attrs: { style: 'font-weight:400;color:var(--text-muted);font-size:0.9rem;margin-left:8px;' }
  });
  const heading = el('h3', {
    attrs: { style: 'margin-top:0;color:var(--primary);' },
    children: [badge, subtitle]
  });
  detail.appendChild(heading);

  // Definition list with DINAMO-dimensie / cluster / interventie
  const dl = el('dl', {
    children: [
      el('dt', { text: 'DINAMO-dimensie' }),
      el('dd', { text: item.dimensie }),
      el('dt', { text: 'Cluster' }),
      el('dd', { text: item.cluster }),
      el('dt', { text: 'Interventie-aangrijpingspunt' }),
      el('dd', { text: item.interventie })
    ]
  });
  detail.appendChild(dl);

  // Debrief-vraag callout
  const debrief = el('div', {
    className: 'debrief-vraag',
    children: [
      el('strong', { text: 'Debrief-vraag voor de student: ' }),
      el('span', { text: item.debriefvraag })
    ]
  });
  detail.appendChild(debrief);
}

/* ----------- Print fallback: render static table for printers ----------- */

function renderPrintTable() {
  const target = document.getElementById('print-table-fallback');
  if (!target) return;

  clear(target);

  const thead = el('thead', {
    children: [
      el('tr', {
        children: [
          el('th', { text: 'Signaal' }),
          el('th', { text: 'DINAMO-dimensie' }),
          el('th', { text: 'Cluster' }),
          el('th', { text: 'Interventie-aangrijpingspunt' }),
          el('th', { text: 'Debrief-vraag' })
        ]
      })
    ]
  });

  const tbody = el('tbody');
  mapping.forEach((item) => {
    const signaalCell = el('td', {
      children: [
        el('strong', { text: item.signaal }),
        el('br'),
        el('span', { className: 'small muted', text: item.carucci })
      ]
    });
    const debriefCell = el('td', {
      children: [el('em', { text: item.debriefvraag })]
    });
    tbody.appendChild(el('tr', {
      children: [
        signaalCell,
        el('td', { text: item.dimensie }),
        el('td', { text: item.cluster }),
        el('td', { text: item.interventie }),
        debriefCell
      ]
    }));
  });

  target.appendChild(el('table', { children: [thead, tbody] }));
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  renderPrintTable();
});
