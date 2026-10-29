// Formulaire de contact : validation (au blur puis à l'envoi), pièces jointes (A14),
// pré-remplissage depuis le calculateur « À l'unité », envoi et état « envoyée ! » (A13, M16).

// Messages d'erreur validés par Léa.
const MESSAGES = {
  nom: 'Indiquez votre prénom et votre nom.',
  emailVide: 'Indiquez votre email.',
  emailArobase: 'Oups, il manque le @ dans votre email.',
  emailFormat: 'Cet email semble incomplet.',
  message: 'Écrivez-moi quelques mots.',
  rgpd: 'Cochez cette case pour que je puisse vous répondre.',
  fichierType: 'Seuls les PDF, JPG et PNG sont acceptés.',
  fichierTaille: 'Vos fichiers dépassent 10 Mo.',
  envoi: "Votre lettre n'est pas partie, réessayez dans un instant.",
};
const MAX_TOTAL = 10 * 1024 * 1024;
const TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

// Prix et intitulés du calculateur (page Graphisme), pour le pré-remplissage.
const UNITE: Record<string, [string, string]> = {
  carte: ['Carte de visite (recto-verso)', '120 €'],
  signature: ['Signature de mail', '60 €'],
  doc: ['Template de document (1 modèle)', '90 €'],
  rs: ['Template réseaux sociaux (1 modèle Canva)', '70 €'],
  flyer: ['Flyer (recto-verso)', '150 €'],
  etiquette: ['Étiquette ou sticker', '90 €'],
  banderole: ['Banderole', '160 €'],
  infographie: ['Infographie', 'dès 180 €'],
};
// Formules des pages service (boutons « Choisir… ») : [service, formule, couleur du dossier].
const FORMULES: Record<string, [string, string, string]> = {
  'cm-essentiel': ['Community management', "L'essentiel", '#F2E3A0'],
  'cm-reguliere': ['Community management', 'La régulière', '#F2E3A0'],
  'audit-sans': ['Audit stratégique', 'Sans existant', '#C9D6EC'],
  'audit-avec': ['Audit stratégique', 'Avec existant', '#C9D6EC'],
};
const PRIX: Record<string, number> = { carte: 120, signature: 60, doc: 90, rs: 70, flyer: 150, etiquette: 90, banderole: 160, infographie: 180 };

const form = document.querySelector<HTMLFormElement>('#contact-form');

if (form) {
  const $ = <T extends Element>(s: string) => form.querySelector<T>(s)!;
  const nom = $<HTMLInputElement>('#c-nom');
  const email = $<HTMLInputElement>('#c-mail');
  const message = $<HTMLTextAreaElement>('#c-msg');
  const rgpd = $<HTMLInputElement>('#c-rgpd');
  const fileInput = $<HTMLInputElement>('#c-file');
  const fileList = $<HTMLUListElement>('[data-files]');
  const drop = $<HTMLElement>('[data-drop]');
  const submit = $<HTMLButtonElement>('[data-submit]');
  const sendErr = $<HTMLElement>('[data-send-err]');
  const t0 = $<HTMLInputElement>('input[name="t0"]');
  t0.value = String(Date.now());
  let files: File[] = [];

  function setError(field: HTMLElement, msg: string | null) {
    const err = document.getElementById(`${field.id}-err`);
    if (!err) return;
    if (msg) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    err.hidden = !msg;
    err.textContent = msg ?? '';
    field.closest('.field, .ct-rgpd')?.classList.toggle('has-error', !!msg);
  }

  const checks: Record<string, () => string | null> = {
    'c-nom': () => (nom.value.trim() ? null : MESSAGES.nom),
    'c-mail': () => {
      const v = email.value.trim();
      if (!v) return MESSAGES.emailVide;
      if (!v.includes('@')) return MESSAGES.emailArobase;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : MESSAGES.emailFormat;
    },
    'c-msg': () => (message.value.trim() ? null : MESSAGES.message),
    'c-rgpd': () => (rgpd.checked ? null : MESSAGES.rgpd),
  };
  const fields: Record<string, HTMLElement> = { 'c-nom': nom, 'c-mail': email, 'c-msg': message, 'c-rgpd': rgpd };

  // Validation au blur, puis en direct une fois le champ en erreur
  Object.entries(fields).forEach(([id, el]) => {
    el.addEventListener('blur', () => {
      if (id === 'c-rgpd') return;
      if ((el as HTMLInputElement).value.trim()) setError(el, checks[id]());
    });
    el.addEventListener(id === 'c-rgpd' ? 'change' : 'input', () => {
      if (el.getAttribute('aria-invalid')) setError(el, checks[id]());
    });
  });

  /* ---------- Pièces jointes ---------- */
  function renderFiles() {
    fileList.innerHTML = '';
    files.forEach((f, i) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = f.name;
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'ct-file-rm';
      rm.setAttribute('aria-label', `Retirer ${f.name}`);
      rm.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path></svg>';
      rm.addEventListener('click', () => {
        files.splice(i, 1);
        renderFiles();
        checkFiles();
        drop.focus();
      });
      li.append(name, rm);
      fileList.appendChild(li);
    });
  }
  function checkFiles(): string | null {
    let msg: string | null = null;
    if (files.some((f) => !TYPES.includes(f.type))) msg = MESSAGES.fichierType;
    else if (files.reduce((s, f) => s + f.size, 0) > MAX_TOTAL) msg = MESSAGES.fichierTaille;
    setError(fileInput, msg);
    return msg;
  }
  function addFiles(list: FileList | null) {
    if (!list) return;
    Array.from(list).forEach((f) => {
      if (!files.some((g) => g.name === f.name && g.size === f.size)) files.push(f);
    });
    renderFiles();
    checkFiles();
  }
  fileInput.addEventListener('change', () => {
    addFiles(fileInput.files);
    fileInput.value = '';
  });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => {
    e.preventDefault();
    drop.classList.add('is-over');
  }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('is-over')));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    addFiles((e as DragEvent).dataTransfer?.files ?? null);
  });
  drop.tabIndex = 0;
  drop.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  /* ---------- Formule choisie : on n'affiche que son nom à la place des dossiers, budget et délai ---------- */
  const formule = FORMULES[new URLSearchParams(location.search).get('formule') ?? ''];
  if (formule) {
    const box = $<HTMLElement>('[data-formule]');
    const nomFormule = $<HTMLElement>('[data-formule-nom]');
    nomFormule.textContent = formule[1];
    nomFormule.style.background = formule[2];
    $<HTMLInputElement>('input[name="formule"]').value = `${formule[0]} · ${formule[1]}`;
    box.hidden = false;
    form.querySelectorAll<HTMLElement>('[data-sans-formule]').forEach((el) => {
      el.hidden = true;
      el.querySelectorAll('input').forEach((i) => (i.disabled = true));
    });
  }

  /* ---------- Pré-remplissage depuis le calculateur (?devis=carte,flyer) ---------- */
  const devis = new URLSearchParams(location.search).get('devis');
  if (devis) {
    const keys = devis.split(',').filter((k) => k in UNITE);
    if (keys.length) {
      const total = keys.reduce((s, k) => s + PRIX[k], 0);
      message.value = keys.map((k) => `${UNITE[k][0]} — ${UNITE[k][1]}`).join('\n') + `\nTotal estimé : ${total} €`;
      const graph = form.querySelector<HTMLInputElement>('input[name="services[]"][value="Graphisme"]');
      if (graph) graph.checked = true;
    }
  }

  /* ---------- Envoi ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    sendErr.hidden = true;
    let first: HTMLElement | null = null;
    Object.entries(fields).forEach(([id, el]) => {
      const msg = checks[id]();
      setError(el, msg);
      if (msg && !first) first = el;
    });
    if (checkFiles() && !first) first = drop;
    if (first) {
      // la page remonte jusqu'au premier champ en erreur (M15)
      (first as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      (first as HTMLElement).focus({ preventScroll: true });
      return;
    }
    const data = new FormData(form);
    files.forEach((f) => data.append('fichiers[]', f, f.name));
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error('envoi');
      showSent();
    } catch {
      sendErr.textContent = MESSAGES.envoi;
      sendErr.hidden = false;
    } finally {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  });

  function showSent() {
    const wrap = form!.closest<HTMLElement>('.ct-letter-wrap')!;
    const sent = document.querySelector<HTMLElement>('[data-sent]')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const done = () => {
      wrap.hidden = true;
      sent.hidden = false;
      sent.classList.add('is-in');
      sent.focus();
    };
    if (reduce) return done();
    // la lettre se plie et glisse dans l'enveloppe
    wrap.classList.add('is-folding');
    wrap.addEventListener('animationend', done, { once: true });
  }
}
