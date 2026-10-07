const STORAGE_KEY = 'studyvault-static-data-v3';
const ADMIN_KEY = 'studyvault-admin-session';

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return buildSeedMaterials(JSON.parse(saved)); } catch (_) {}
  }
  return buildSeedMaterials(clone(DEFAULT_DATA));
}
let DB = loadData();

function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); }
function esc(value='') { return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch])); }
function go(route) { location.hash = route; }
function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

function universityById(id) { return DB.universities.find(u => u.id === id); }
function defaultUniversity() { return DB.universities[0]; }
function programById(universityId, programId) {
  return universityById(universityId)?.programs.find(p => p.id === programId);
}
function subjects(programId, semester) { return DB.subjects?.[programId]?.[Number(semester)] || []; }
function subjectById(programId, semester, subjectId) { return subjects(programId, semester).find(s => s.id === subjectId); }

function crumbs(items) {
  return `<div class="breadcrumbs">${items.map((item,i) => i === items.length-1 ? `<span>${esc(item.label)}</span>` : `<button data-route="${esc(item.route)}">${esc(item.label)}</button><span>›</span>`).join('')}</div>`;
}

function selectionPage({kicker,title,subtitle,selectId,placeholder,options,nextId,backRoute,info='Select one option to continue.'}) {
  return `<div class="page"><div class="container narrow-container">
    ${backRoute ? crumbs([{label:'Home',route:'#/'},{label:title}]) : ''}
    <section class="selector-card">
      <div class="selector-icon">⌄</div>
      <div class="kicker">${esc(kicker)}</div>
      <h1 class="page-title selector-title">${esc(title)}</h1>
      <p class="page-subtitle selector-subtitle">${esc(subtitle)}</p>
      <div class="field selector-field">
        <label for="${esc(selectId)}">${esc(title)}</label>
        <select id="${esc(selectId)}">
          <option value="">${esc(placeholder)}</option>
          ${options}
        </select>
      </div>
      <div class="selection-hint" id="selectionHint">${esc(info)}</div>
      <button class="primary-btn next-btn" id="${esc(nextId)}" disabled>Next →</button>
    </section>
  </div></div>`;
}

function renderHome() {
  const options = DB.universities.map(u => `<option value="${u.id}" data-name="${esc(u.name)}" data-location="${esc(u.location)}">${esc(u.shortName)} — ${esc(u.name)}</option>`).join('');
  return selectionPage({
    kicker:'Step 1 of 4',
    title:'Select University',
    subtitle:'Choose your university to continue to courses and study material.',
    selectId:'universitySelect',
    placeholder:'Choose a university',
    options,
    nextId:'universityNext',
    info:`${DB.universities.length} sample universities available.`
  });
}

function renderUniversity(universityId) {
  const u = universityById(universityId);
  if (!u) return renderNotFound();
  const options = u.programs.map(p => `<option value="${p.id}" data-name="${esc(p.name)}" data-description="${esc(p.description)}">${esc(p.shortName)} — ${esc(p.name)}</option>`).join('');
  return `<div class="page"><div class="container narrow-container">
    ${crumbs([{label:'Home',route:'#/'},{label:u.shortName}])}
    <section class="selector-card">
      <div class="step-badge">Step 2 of 4</div>
      <div class="selected-context"><strong>${esc(u.shortName)}</strong><span>${esc(u.name)} • ${esc(u.location)}</span></div>
      <div class="kicker">Course Selection</div>
      <h1 class="page-title selector-title">Select Course</h1>
      <p class="page-subtitle selector-subtitle">Choose the degree/course you are studying.</p>
      <div class="field selector-field">
        <label for="courseSelect">Course / Degree</label>
        <select id="courseSelect"><option value="">Choose a course</option>${options}</select>
      </div>
      <div class="selection-hint" id="selectionHint">${u.programs.length} courses available in this demo.</div>
      <button class="primary-btn next-btn" id="courseNext" data-university="${u.id}" disabled>Next →</button>
    </section>
  </div></div>`;
}

function renderProgram(universityId, programId) {
  const u = universityById(universityId);
  const p = programById(universityId, programId);
  if (!u || !p) return renderNotFound();
  const semesterOptions = Array.from({length:p.semesters},(_,i)=>i+1).map(sem => {
    const year = Math.ceil(sem/2);
    return `<option value="${sem}">Semester ${sem} — Year ${year}</option>`;
  }).join('');
  return `<div class="page"><div class="container narrow-container">
    ${crumbs([{label:'Home',route:'#/'},{label:u.shortName,route:`#/university/${u.id}`},{label:p.shortName}])}
    <section class="selector-card">
      <div class="step-badge">Step 3 of 4</div>
      <div class="selected-context"><strong>${esc(p.shortName)}</strong><span>${esc(u.shortName)} • ${esc(p.name)}</span></div>
      <div class="kicker">Semester Selection</div>
      <h1 class="page-title selector-title">Select Semester</h1>
      <p class="page-subtitle selector-subtitle">Choose your current semester to see the subject list.</p>
      <div class="field selector-field">
        <label for="semesterSelect">Semester</label>
        <select id="semesterSelect"><option value="">Choose a semester</option>${semesterOptions}</select>
      </div>
      <div class="selection-hint" id="selectionHint">${p.semesters} semesters available.</div>
      <button class="primary-btn next-btn" id="semesterNext" data-university="${u.id}" data-program="${p.id}" disabled>Next →</button>
    </section>
  </div></div>`;
}

function renderSemester(universityId, programId, semester) {
  const u = universityById(universityId);
  const p = programById(universityId, programId);
  if (!u || !p) return renderNotFound();
  const rows = subjects(programId, semester);
  return `<div class="page"><div class="container">
    ${crumbs([{label:'Home',route:'#/'},{label:u.shortName,route:`#/university/${u.id}`},{label:p.shortName,route:`#/university/${u.id}/program/${p.id}`},{label:`Semester ${semester}`}])}
    <div class="step-badge">Step 4 of 4</div>
    <div class="kicker">${esc(p.shortName)} • ${esc(u.shortName)}</div>
    <h1 class="page-title">Semester ${semester} Subjects</h1>
    <p class="page-subtitle">Choose a subject. Each subject contains only Syllabus, Notes and Previous Year Papers.</p>
    <div class="subject-list">
      ${rows.map((s,index) => `<div class="subject-row">
        <div class="subject-number">${String(index+1).padStart(2,'0')}</div>
        <div class="subject-copy"><h3>${esc(s.name)}</h3><p>${esc(s.code)} • Semester ${semester}</p></div>
        <button class="open-btn" data-route="#/university/${u.id}/program/${programId}/semester/${semester}/subject/${s.id}">Open subject →</button>
      </div>`).join('') || `<div class="empty">No subjects available.</div>`}
    </div>
  </div></div>`;
}

function renderSubject(universityId, programId, semester, subjectId, activeType='ALL') {
  const u = universityById(universityId);
  const p = programById(universityId, programId);
  const s = subjectById(programId, semester, subjectId);
  if (!u || !p || !s) return renderNotFound();
  const materials = (DB.materials[s.id] || []).filter(m => m.published !== false && (activeType === 'ALL' || m.type === activeType));
  const typeName = {SYLLABUS:'Syllabus',NOTES:'Notes',PYQ:'Previous Year Papers'};
  return `<div class="page"><div class="container">
    ${crumbs([{label:'Home',route:'#/'},{label:u.shortName,route:`#/university/${u.id}`},{label:p.shortName,route:`#/university/${u.id}/program/${p.id}`},{label:`Semester ${semester}`,route:`#/university/${u.id}/program/${p.id}/semester/${semester}`},{label:s.name}])}
    <section class="subject-hero">
      <div class="kicker">${esc(s.code)}</div>
      <h1 class="page-title">${esc(s.name)}</h1>
      <p class="page-subtitle">Subject-wise study material in one simple place.</p>
      <div class="subject-meta"><span class="pill">${esc(u.shortName)}</span><span class="pill">${esc(p.shortName)}</span><span class="pill">Semester ${semester}</span></div>
    </section>
    <div class="material-tabs">
      ${[['ALL','All'],['SYLLABUS','Syllabus'],['NOTES','Notes'],['PYQ','PYQ']].map(([key,label]) => `<button class="tab-btn ${activeType===key?'active':''}" data-material-tab="${key}">${label}</button>`).join('')}
    </div>
    <div class="material-list">
      ${materials.map(m => `<div class="material-card"><div><span class="eyebrow">${typeName[m.type] || m.type}</span><h4>${esc(m.title)}</h4><p>Sample document reference. Replace this path later from Admin.</p><span class="path-badge">${esc(m.path)}</span></div><button class="secondary-btn" data-preview-path="${esc(m.path)}">View Path</button></div>`).join('') || `<div class="empty">No material in this section yet.</div>`}
    </div>
  </div></div>`;
}

function getSearchResults(q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const results = [];
  PROGRAM_CATALOG.forEach(p => {
    for (let sem=1; sem<=p.semesters; sem++) {
      subjects(p.id,sem).forEach(s => {
        const haystack = `${s.name} ${s.code} ${p.shortName} semester ${sem}`.toLowerCase();
        if (haystack.includes(needle)) results.push({p,sem,s});
      });
    }
  });
  return results.slice(0,30);
}

function renderSearch(query='') {
  const results = getSearchResults(query);
  const u = defaultUniversity();
  return `<div class="page"><div class="container">
    ${crumbs([{label:'Home',route:'#/'},{label:'Search'}])}
    <div class="kicker">Search</div><h1 class="page-title">Find a subject</h1>
    <div class="search-box"><input id="searchInput" value="${esc(query)}" placeholder="Search DBMS, BT303, B.Tech..." autofocus><button class="primary-btn" id="searchButton">Search</button></div>
    <div class="subject-list">${query && !results.length ? `<div class="empty">No matching subject found.</div>` : results.map(({p,sem,s}) => `<div class="subject-row"><div class="subject-copy"><h3>${esc(s.name)}</h3><p>${esc(s.code)} • ${esc(p.shortName)} • Semester ${sem}</p></div><button class="open-btn" data-route="#/university/${u.id}/program/${p.id}/semester/${sem}/subject/${s.id}">Open →</button></div>`).join('')}</div>
  </div></div>`;
}

function adminLoggedIn() { return sessionStorage.getItem(ADMIN_KEY) === 'yes'; }
function renderAdmin() {
  if (!adminLoggedIn()) return `<div class="page"><div class="container"><div class="login-card"><div class="kicker">Demo Admin</div><h2>Admin Login</h2><p class="page-subtitle">This plain HTML version uses a local demo login only.</p><div class="field"><label>Email</label><input id="adminEmail" value="admin@studyvault.local"></div><br><div class="field"><label>Password</label><input id="adminPassword" type="password" value="Admin@123"></div><br><button class="primary-btn" id="adminLogin">Login</button><p class="note">Demo only: frontend JavaScript cannot provide real secure admin permission. For production, keep authentication and SQL on a backend server.</p></div></div></div>`;
  return renderAdminPanel('materials');
}

function renderAdminPanel(tab='materials') {
  const p = PROGRAM_CATALOG.find(x=>x.id==='btech');
  const allSubjects = [];
  for (let sem=1; sem<=p.semesters; sem++) subjects('btech',sem).forEach(s=>allSubjects.push({sem,s}));
  return `<div class="page"><div class="container">${crumbs([{label:'Home',route:'#/'},{label:'Admin'}])}<div class="admin-shell"><aside class="admin-side"><h3>Admin</h3><button class="${tab==='materials'?'active':''}" data-admin-tab="materials">Materials</button><button class="${tab==='subjects'?'active':''}" data-admin-tab="subjects">Subjects</button><button data-admin-action="reset">Reset Demo</button><button data-admin-action="logout">Logout</button></aside><section class="admin-main">${tab==='subjects' ? adminSubjects(allSubjects) : adminMaterials(allSubjects)}</section></div></div></div>`;
}

function adminMaterials(allSubjects) {
  const subjectOptions = allSubjects.map(({sem,s}) => `<option value="${s.id}">Sem ${sem} • ${esc(s.code)} • ${esc(s.name)}</option>`).join('');
  const materials = allSubjects.flatMap(({sem,s}) => (DB.materials[s.id]||[]).map(m=>({sem,s,m}))).slice(0,100);
  return `<div class="kicker">Manage</div><h2>Study Materials</h2><p class="page-subtitle">Add only document paths/URLs. No file upload is included.</p><div class="form-grid"><div class="field full"><label>Subject</label><select id="matSubject">${subjectOptions}</select></div><div class="field"><label>Type</label><select id="matType"><option value="SYLLABUS">Syllabus</option><option value="NOTES">Notes</option><option value="PYQ">Previous Year Paper</option></select></div><div class="field"><label>Title</label><input id="matTitle" placeholder="DBMS Unit 2 Notes"></div><div class="field full"><label>Document Path / URL</label><input id="matPath" placeholder="/materials/.../file.pdf"></div><div class="field full"><button class="primary-btn" id="addMaterial">Add Material</button></div></div><div class="admin-table">${materials.map(({sem,s,m})=>`<div class="admin-row"><div><strong>${esc(m.title)}</strong><small>${esc(s.code)} • Sem ${sem} • ${m.type} • ${m.published===false?'Hidden':'Published'}</small></div><div><button class="secondary-btn" data-toggle-material="${m.id}" data-subject="${s.id}">${m.published===false?'Publish':'Hide'}</button> <button class="danger-btn" data-delete-material="${m.id}" data-subject="${s.id}">Delete</button></div></div>`).join('')}</div>`;
}

function adminSubjects(allSubjects) {
  return `<div class="kicker">Manage</div><h2>B.Tech Subjects</h2><p class="page-subtitle">Edit the sample names and codes now; changes are saved in this browser.</p><div class="admin-table">${allSubjects.map(({sem,s})=>`<div class="admin-row"><div><strong>Semester ${sem}</strong><small>${esc(s.code)} • ${esc(s.name)}</small></div><button class="secondary-btn" data-edit-subject="${s.id}" data-sem="${sem}">Edit</button></div>`).join('')}</div>`;
}

function renderNotFound() { return `<div class="page"><div class="container"><div class="empty"><h2>Page not found</h2><button class="primary-btn" data-route="#/">Go Home</button></div></div></div>`; }

let currentMaterialType = 'ALL';
let adminTab = 'materials';

function render() {
  const hash = location.hash || '#/';
  const parts = hash.replace(/^#\//,'').split('/').filter(Boolean);
  let html;
  if (!parts.length) html = renderHome();
  else if (parts[0] === 'university' && parts.length === 2) html = renderUniversity(parts[1]);
  else if (parts[0] === 'university' && parts[2] === 'program' && parts.length === 4) html = renderProgram(parts[1],parts[3]);
  else if (parts[0] === 'university' && parts[2] === 'program' && parts[4] === 'semester' && parts.length === 6) html = renderSemester(parts[1],parts[3],parts[5]);
  else if (parts[0] === 'university' && parts[2] === 'program' && parts[4] === 'semester' && parts[6] === 'subject') html = renderSubject(parts[1],parts[3],parts[5],parts[7],currentMaterialType);
  else if (parts[0] === 'search') html = renderSearch(new URLSearchParams(location.search).get('q') || '');
  else if (parts[0] === 'admin') html = adminLoggedIn() ? renderAdminPanel(adminTab) : renderAdmin();
  else html = renderNotFound();
  document.getElementById('app').innerHTML = html;
  window.scrollTo({top:0,behavior:'instant'});
}

window.addEventListener('hashchange', () => { currentMaterialType='ALL'; render(); });

document.addEventListener('change', (e) => {
  if (e.target.id === 'universitySelect') {
    const btn = document.getElementById('universityNext');
    btn.disabled = !e.target.value;
    const opt = e.target.options[e.target.selectedIndex];
    document.getElementById('selectionHint').textContent = e.target.value ? `${opt.dataset.name} • ${opt.dataset.location}` : `${DB.universities.length} sample universities available.`;
  }
  if (e.target.id === 'courseSelect') {
    const btn = document.getElementById('courseNext');
    btn.disabled = !e.target.value;
    const opt = e.target.options[e.target.selectedIndex];
    document.getElementById('selectionHint').textContent = e.target.value ? `${opt.dataset.name} • ${opt.dataset.description}` : 'Choose a course to continue.';
  }
  if (e.target.id === 'semesterSelect') {
    const btn = document.getElementById('semesterNext');
    btn.disabled = !e.target.value;
    document.getElementById('selectionHint').textContent = e.target.value ? `Semester ${e.target.value} selected.` : 'Choose a semester to continue.';
  }
});

document.addEventListener('click', (e) => {
  const route = e.target.closest('[data-route]');
  if (route) { go(route.dataset.route); return; }

  if (e.target.id === 'universityNext') {
    const id = document.getElementById('universitySelect').value;
    if (id) go(`#/university/${id}`);
    return;
  }
  if (e.target.id === 'courseNext') {
    const pid = document.getElementById('courseSelect').value;
    const uid = e.target.dataset.university;
    if (pid) go(`#/university/${uid}/program/${pid}`);
    return;
  }
  if (e.target.id === 'semesterNext') {
    const sem = document.getElementById('semesterSelect').value;
    const uid = e.target.dataset.university;
    const pid = e.target.dataset.program;
    if (sem) go(`#/university/${uid}/program/${pid}/semester/${sem}`);
    return;
  }

  const tab = e.target.closest('[data-material-tab]');
  if (tab) { currentMaterialType = tab.dataset.materialTab; render(); return; }
  const preview = e.target.closest('[data-preview-path]');
  if (preview) { toast(`Document path: ${preview.dataset.previewPath}`); return; }

  if (e.target.id === 'searchButton') {
    const q = document.getElementById('searchInput').value.trim();
    history.replaceState(null,'',`${location.pathname}?q=${encodeURIComponent(q)}#/search`);
    render(); return;
  }
  if (e.target.id === 'adminLogin') {
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    if (email === 'admin@studyvault.local' && password === 'Admin@123') { sessionStorage.setItem(ADMIN_KEY,'yes'); toast('Admin login successful'); render(); }
    else toast('Invalid demo login');
    return;
  }
  const adminTabBtn = e.target.closest('[data-admin-tab]');
  if (adminTabBtn) { adminTab = adminTabBtn.dataset.adminTab; render(); return; }
  const action = e.target.closest('[data-admin-action]');
  if (action?.dataset.adminAction === 'logout') { sessionStorage.removeItem(ADMIN_KEY); render(); return; }
  if (action?.dataset.adminAction === 'reset') { localStorage.removeItem(STORAGE_KEY); DB = buildSeedMaterials(clone(DEFAULT_DATA)); saveData(); toast('Demo data reset'); render(); return; }

  if (e.target.id === 'addMaterial') {
    const subjectId = document.getElementById('matSubject').value;
    const type = document.getElementById('matType').value;
    const title = document.getElementById('matTitle').value.trim();
    const path = document.getElementById('matPath').value.trim();
    if (!title || !path) { toast('Enter title and document path'); return; }
    if (!DB.materials[subjectId]) DB.materials[subjectId] = [];
    DB.materials[subjectId].push({id:`m-${Date.now()}`,type,title,path,published:true});
    saveData(); toast('Material added'); render(); return;
  }
  const toggle = e.target.closest('[data-toggle-material]');
  if (toggle) {
    const rows = DB.materials[toggle.dataset.subject] || [];
    const m = rows.find(x=>x.id===toggle.dataset.toggleMaterial);
    if (m) { m.published = m.published === false ? true : false; saveData(); toast(m.published?'Published':'Hidden'); render(); }
    return;
  }
  const del = e.target.closest('[data-delete-material]');
  if (del) {
    const sid = del.dataset.subject;
    DB.materials[sid] = (DB.materials[sid]||[]).filter(x=>x.id!==del.dataset.deleteMaterial);
    saveData(); toast('Material deleted'); render(); return;
  }
  const edit = e.target.closest('[data-edit-subject]');
  if (edit) {
    const sem = Number(edit.dataset.sem);
    const s = subjectById('btech',sem,edit.dataset.editSubject);
    if (!s) return;
    const newName = prompt('Subject name:', s.name);
    if (newName === null) return;
    const newCode = prompt('Subject code:', s.code);
    if (newCode === null) return;
    s.name = newName.trim() || s.name;
    s.code = newCode.trim() || s.code;
    saveData(); toast('Subject updated'); render(); return;
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'searchInput') document.getElementById('searchButton')?.click();
});

render();
