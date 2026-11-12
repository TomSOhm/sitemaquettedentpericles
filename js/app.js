/* Logique de la page : état, textes calculés, gestionnaires. Voir CLAUDE.md. */
class Component extends DCLogic {
  componentDidMount() {
    this._t = setInterval(() => this.setState({ now: new Date() }), 60000);
    this._center = (s) => {
      const d = this.dims();
      const st = this.state || {};
      const sc = s || st.s || 1;
      // point de visée : entre l'entrée Montée C et le parking patients
      const c = this.clampT(d[0] / 2 - 0.55 * d[2] * sc, d[1] / 2 - 0.42 * d[3] * sc, sc);
      this.setState({ s: sc, tx: c[0], ty: c[1] });
    };
    this._key = (e) => {
      if (e.key !== 'Escape') return;
      const st = this.state || {};
      if (st.mapFull && this._setFull) this._setFull(false);
      else if (st.rdv && this._closeRdv) this._closeRdv();
    };
    window.addEventListener('keydown', this._key);
    this._ci = setTimeout(() => this._center(1), 120);
    this._rs = () => this._center();
    window.addEventListener('resize', this._rs);
  }
  componentWillUnmount() {
    clearInterval(this._t);
    clearTimeout(this._ct);
    clearTimeout(this._ci);
    window.removeEventListener('resize', this._rs);
    window.removeEventListener('keydown', this._key);
  }
  dims() {
    const el = this._mapEl;
    const ly = this._layerEl;
    const W = el ? el.clientWidth : 1200;
    const H = el ? el.clientHeight : 750;
    return [W, H, ly ? ly.offsetWidth : W, ly ? ly.offsetHeight : H];
  }
  clampT(tx, ty, s) {
    const d = this.dims();
    // calque plus petit que le cadre (plein écran) : centré ; sinon borné aux bords
    const cl = (t, F, L) => (L <= F ? (F - L) / 2 : Math.min(0, Math.max(F - L, t)));
    return [cl(tx, d[0], d[2] * s), cl(ty, d[1], d[3] * s)];
  }
  canPan(s) {
    const d = this.dims();
    return d[2] * s > d[0] + 1 || d[3] * s > d[1] + 1;
  }
  pinchPts() {
    const ids = Object.keys(this._pts || {});
    if (ids.length < 2) return null;
    const a = this._pts[ids[0]], b = this._pts[ids[1]];
    const r = this._mapEl.getBoundingClientRect();
    return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2 - r.left, my: (a.y + b.y) / 2 - r.top };
  }
  zoomTo(s2, cxp, cyp) {
    const st = this.state || {};
    const s = st.s || 1;
    const wh = this.dims();
    const cx = cxp == null ? wh[0] / 2 : cxp;
    const cy = cyp == null ? wh[1] / 2 : cyp;
    s2 = Math.max(1, Math.min(4, s2));
    const tx = cx - (cx - (st.tx || 0)) * (s2 / s);
    const ty = cy - (cy - (st.ty || 0)) * (s2 / s);
    const c = this.clampT(tx, ty, s2);
    this.setState({ s: s2, tx: c[0], ty: c[1] });
  }
  renderVals() {
    const st = this.state || {};
    const sel = st.sel === undefined ? 'new' : st.sel;
    const mode = st.mode || 'car';
    const hotId = st.hot || '';
    const now = st.now || new Date();
    const s = st.s || 1;

    const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    // Horaires du SECRÉTARIAT (heures où l'on peut appeler), en minutes depuis minuit, par jour (0 = dimanche).
    const HOURS = {
      1: [[525, 720], [840, 1080]],
      2: [[525, 720], [840, 1080]],
      3: [[525, 720], [840, 1080]],
      4: [[525, 720], [840, 1080]],
      5: [[525, 720], [840, 990]]
    };
    // Jours de présence des praticiens (pas d'heures : demande du cabinet). Ordre d'affichage : Dr Bernardi en premier.
    // book : page Doctolib (vide = rendez-vous par téléphone). Dr Bernardi : pas de Doctolib (demande du cabinet).
    // Dr Richard : lien Doctolib à fournir par le cabinet (l'ancienne page répond « supprimée »).
    const PRACS = [
      { id: 'bernardi', name: 'Dr Christine Bernardi', short: 'Dr Bernardi', days: [1, 4, 5, 6], book: '' },
      { id: 'manisse', name: 'Dr Clara Manisse', short: 'Dr Manisse', days: [1, 2, 3, 5], book: this.props.doctolibUrl || 'https://www.doctolib.fr/dentiste/epagny-metz-tessy/clara-manisse' },
      { id: 'feaud', name: 'Dr Martin Feaud', short: 'Dr Feaud', days: [1, 2, 3, 4], book: 'https://www.doctolib.fr/dentiste/epagny-metz-tessy/martin-feaud' },
      { id: 'richard', name: 'Dr Coline Richard', short: 'Dr Richard', days: [2, 4], book: '' }
    ];
    this._pracs = PRACS;
    const hsel = PRACS.some((p) => p.id === st.hsel) ? st.hsel : 'sec';
    const selP = PRACS.filter((p) => p.id === hsel)[0] || null;
    const slotsOf = (dd) => HOURS[dd] || [];
    const fmt = (x) => Math.floor(x / 60) + 'h' + String(x % 60).padStart(2, '0');
    const fmtS = (x) => Math.floor(x / 60) + 'h' + (x % 60 ? String(x % 60).padStart(2, '0') : '');
    const d = now.getDay();
    const m = now.getHours() * 60 + now.getMinutes();
    let isOpen = false, until = 0, slotIdx = -1;
    slotsOf(d).forEach((sl, i) => { if (m >= sl[0] && m < sl[1]) { isOpen = true; until = sl[1]; slotIdx = i; } });
    let next = null;
    for (let k = 0; k < 8 && !next; k++) {
      const dd = (d + k) % 7;
      const sl = slotsOf(dd);
      for (let i = 0; i < sl.length; i++) {
        if (k > 0 || m < sl[i][0]) { next = { k: k, dd: dd, t: sl[i][0] }; break; }
      }
    }
    const nextOpen = next ? ((next.k === 0 ? 'aujourd’hui à ' : next.k === 1 ? 'demain à ' : DAYS[next.dd] + ' à ') + fmt(next.t)) : '';
    const forced = this.props.openState || 'auto';
    if (forced === 'open') { isOpen = true; until = until || 1080; }
    if (forced === 'closed') { isOpen = false; slotIdx = -1; }
    const todaySl = slotsOf(d);
    const lunch = !isOpen && todaySl.length > 1 && m >= todaySl[0][1] && m < todaySl[1][0] && forced === 'auto';
    const statusText = isOpen ? ('Secrétariat ouvert, jusqu’à ' + fmt(until))
      : lunch ? ('Pause de midi, le secrétariat rouvre à ' + fmt(todaySl[1][0]))
      : ('Secrétariat fermé, réouverture ' + nextOpen);

    // Frise : de 8h00 (480) à 18h00 (1080), soit 600 minutes.
    const pct = (x) => (Math.max(0, Math.min(600, x - 480)) / 6).toFixed(2) + '%';
    const order = [1, 2, 3, 4, 5, 6, 0];
    const week = order.map((i) => {
      const sl = slotsOf(i);
      const open = sl.length > 0;
      const today = i === d;
      const here = PRACS.filter((p) => p.days.indexOf(i) >= 0).map((p) => p.short);
      const pres = selP ? selP.days.indexOf(i) >= 0 : false;
      return {
        short: SHORT[i],
        open: open ? 'true' : 'false',
        today: today ? 'true' : 'false',
        name: DAYS[i].charAt(0).toUpperCase() + DAYS[i].slice(1),
        hours: open ? sl.map((x) => fmtS(x[0]) + ' à ' + fmtS(x[1])).join(', ') : (here.length ? 'Secrétariat fermé' : 'Fermé'),
        pracs: here.length ? here.join(', ') : 'Cabinet fermé',
        st: selP ? (pres ? 'on' : 'off') : 'sec',
        who: selP ? (pres ? 'Au cabinet' : 'Pas de consultation') : (here.length ? here.join(', ') : 'Cabinet fermé'),
        none: here.length ? 'false' : 'true',
        amL: open ? pct(sl[0][0]) : '0%',
        amW: open ? pct(480 + sl[0][1] - sl[0][0]) : '0%',
        pmL: open && sl[1] ? pct(sl[1][0]) : '0%',
        pmW: open && sl[1] ? pct(480 + sl[1][1] - sl[1][0]) : '0%',
        nowLeft: pct(m),
        nowDisp: (today && m >= 480 && m <= 1080) ? 'block' : 'none',
        amNow: (today && isOpen && slotIdx === 0) ? 'true' : 'false',
        pmNow: (today && isOpen && slotIdx === 1) ? 'true' : 'false'
      };
    });

    // Sélecteur de la frise des horaires : secrétariat (par défaut) ou un praticien.
    const hon = {}, hpick = {}, seeDays = {};
    ['sec'].concat(PRACS.map((p) => p.id)).forEach((k) => {
      hon[k] = hsel === k ? 'true' : 'false';
      hpick[k] = () => this.setState({ hsel: k });
      seeDays[k] = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        this.setState({ hsel: k });
        const el = document.getElementById('horaires');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    });
    const listFr = (arr) => (arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' et ' + arr[arr.length - 1]);
    const hsum = selP
      ? selP.short + ' consulte le ' + listFr(selP.days.map((x) => DAYS[x])) + '.' + (selP.days.indexOf(6) >= 0 ? ' Le samedi, le secrétariat est fermé.' : '')
      : '';
    const hcta = selP
      ? (selP.book ? { show: true, href: selP.book, label: 'Réserver en ligne avec le ' + selP.short } : { show: true, href: 'tel:0450675514', label: 'Rendez-vous au 04 50 67 55 14' })
      : { show: false, href: '#', label: '' };

    const ids = ['new', 'rdv', 'pain', 'come', 'mail', 'care'];
    const on = {}, show = {}, pick = {};
    ids.forEach((id) => {
      on[id] = sel === id ? 'true' : 'false';
      show[id] = sel === id;
      pick[id] = () => this.setState({ sel: id, menu: false });
    });

    const modes = ['car', 'bus', 'bike'];
    const modeOn = {}, modeIs = {}, setMode = {}, mapOp = {};
    modes.forEach((id) => {
      modeOn[id] = mode === id ? 'true' : 'false';
      modeIs[id] = mode === id;
      setMode[id] = () => this.setState({ mode: id, hot: id === 'car' ? '' : id });
      mapOp[id] = mode === id ? '1' : '0';
    });

    // Repères du plan, en % de l'image assets/plan-acces-ign.webp (1800 x 1350).
    // [x, y, titre, texte, photo à placer ('' si aucune)]
    const SPOTS = {
      door: [53.67, 22.22, 'Entrée Montée C', 'Juste après la passerelle. Ascenseur jusqu’au 2ᵉ étage, puis présentez votre ticket à l’accueil : le parking vous est remboursé.', 'entrée Montée C'],
      court: [45.83, 24.44, 'Sous la passerelle', 'Passez sous la passerelle entre les bâtiments : l’entrée Montée C est juste après.', 'la passerelle'],
      gate: [63.28, 34.96, 'Barrière Patients', 'Tournez à gauche vers la barrière Patients et prenez un ticket. L’autre barrière est réservée aux abonnés.', 'la barrière Patients'],
      park: [54.94, 48.3, 'Parking patients', 'Garez-vous dans la zone verte. La partie en rouge, le long des bâtiments, est réservée aux abonnés.', ''],
      bike: [61.28, 38.3, 'Abri vélo', 'Garez votre vélo ici, puis suivez le chemin orange jusqu’à la passerelle.', ''],
      bus: [53.22, 81.11, 'Arrêt Hôpital', 'Devant l’entrée de l’hôpital, bus Sibra lignes 2 et 11. Suivez le chemin orange jusqu’à la barrière Patients, puis passez sous la passerelle.', '']
    };
    const full = !!st.mapFull;
    const coarse = typeof window !== 'undefined' && !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    const hot = {}, hover = {}, focus = {}, tap = {}, spotOn = {};
    const SPOT_MODE = { gate: 'car', park: 'car', bike: 'bike', bus: 'bus' };
    Object.keys(SPOTS).forEach((id) => {
      hot[id] = hotId === id ? 'true' : 'false';
      spotOn[id] = !SPOT_MODE[id] || SPOT_MODE[id] === mode || (id === 'gate' && mode === 'bus') || hotId === id ? 'true' : 'false';
      hover[id] = () => { if ((this.state || {}).hot !== id) this.setState({ hot: id }); };
      tap[id] = () => { const m = SPOT_MODE[id]; this.setState(m ? { hot: id, mode: m } : { hot: id }); };
      focus[id] = () => {
        const cur = this.state || {};
        // au doigt, hors plein écran, on ne zoome pas : le plan reste entier et la page défile
        if (coarse && !cur.mapFull) { this.setState({ hot: id }); }
        else {
          const p = SPOTS[id];
          const d = this.dims();
          const s2 = Math.max(cur.s || 1, 2);
          const c = this.clampT(d[0] / 2 - p[0] / 100 * d[2] * s2, d[1] / 2 - p[1] / 100 * d[3] * s2, s2);
          this.setState({ s: s2, tx: c[0], ty: c[1], hot: id });
        }
        const el = this._mapEl;
        if (el && el.getBoundingClientRect && !cur.mapFull) {
          const r = el.getBoundingClientRect();
          if (r.top < 0 || r.bottom > (window.innerHeight || 800)) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
    });
    // zones du parking : nettes en voiture, atténuées en bus et à vélo
    const zonesMode = mode === 'car' || hotId === 'park' || hotId === 'gate';
    const okOp = !zonesMode ? '0.07' : (hotId === 'park' || hotId === 'gate' ? '0.42' : '0.26');
    const noOp = okOp;
    const sp = SPOTS[hotId] || SPOTS.door;
    const info = { title: sp[2], text: sp[3], photo: sp[4], hasPhoto: !!sp[4] };
    this._setFull = (f) => {
      try { document.body.style.overflow = f ? 'hidden' : ''; } catch (err) {}
      this._pts = {}; this._drag = null; this._pinch = null;
      this.setState({ mapFull: f, s: 1, tx: 0, ty: 0, touched: false, dragging: false });
      // plein écran sur téléphone (portrait) : on part zoomé sur le parking et l'entrée
      setTimeout(() => {
        if (!this._center) return;
        const d = this.dims();
        this._center(f ? Math.min(2.2, Math.max(1, (d[1] / Math.max(1, d[3])) * 0.8)) : 1);
      }, 60);
      if (!f && this._mapEl) setTimeout(() => { this._mapEl.scrollIntoView({ block: 'center' }); }, 80);
    };

    const careIds = ['blanch', 'fac', 'imp', 'oam', 'paro'];
    const careOpen = {}, careShow = {}, careToggle = {};
    careIds.forEach((id) => {
      const o = (st.care || 'blanch') === id;
      careOpen[id] = o ? 'true' : 'false';
      careShow[id] = o;
      careToggle[id] = () => this.setState({ care: (this.state || {}).care === id || (!(this.state || {}).care && id === 'blanch') ? 'none' : id });
    });
    const CAPS = {
      new: ['01', 'Premier rendez-vous', 'Bienvenue au cabinet', 'Réservation en ligne pour les nouveaux patients, et ce qu’il faut apporter le jour du rendez-vous.'],
      rdv: ['02', 'Rendez-vous', 'Prendre ou déplacer un rendez-vous', 'Déjà patient du cabinet ? Le plus simple est d’appeler, aux heures d’ouverture.'],
      pain: ['03', 'Urgence', 'Vous avez mal ?', 'Que faire maintenant, selon le jour et l’heure.'],
      come: ['04', 'Accès', 'Venir au cabinet', 'Adresse GPS, parking remboursé, bus et vélo.'],
      mail: ['05', 'E-mail', 'Écrire au cabinet', 'Documents, questions administratives, rendez-vous à déplacer.'],
      care: ['06', 'Soins', 'Un soin en particulier', 'Implant, blanchiment, facettes, orthèse, gencives.']
    };
    const QMAP = [
      [/horaire|ouvert|ferm|heure|quand/, { label: 'Voir les horaires du cabinet', href: 'horaires' }],
      [/mal|douleur|urgen|cass|abc|gonfl|saign|garde|dimanche|f[ée]ri/, { label: 'J’ai mal, c’est urgent', id: 'pain' }],
      [/park|gar[ée]|bus|v[ée]lo|adresse|acc[èe]s|gps|ascenseur|[ée]tage|itin|venir|plan|ticket|rembours/, { label: 'Venir au cabinet', id: 'come' }],
      [/mail|[ée]crire|courriel|document|tarif|devis|mutuelle|vitale|paiement/, { label: 'Écrire au cabinet', id: 'mail' }],
      [/implant|blanch|facette|orth[èe]se|ronfl|apn[ée]e|gencive|paro|carie|d[ée]vital|extraction|soin/, { label: 'Un soin en particulier', id: 'care' }],
      [/nouveau|nouvelle|premi|1er|inscri|doctolib/, { label: 'Premier rendez-vous', id: 'new' }],
      [/rdv|rendez|d[ée]placer|annul|modifi|cr[ée]neau|t[ée]l[ée]phone|appeler/, { label: 'Prendre ou déplacer un RDV', id: 'rdv' }]
    ];
    const qv = String(st.q || '').toLowerCase().trim();
    let sug = null;
    if (qv.length >= 2) { for (const row of QMAP) { if (row[0].test(qv)) { sug = row[1]; break; } } if (!sug) sug = { label: 'Appeler le cabinet : 04 50 67 55 14', tel: true }; }
    const goSug = () => {
      const g = sug; if (!g) return;
      if (this._qEl) { this._qEl.value = ''; this._qEl.blur && this._qEl.blur(); }
      if (g.tel) { this.setState({ q: '' }); window.location.href = 'tel:0450675514'; return; }
      if (g.href) { this.setState({ q: '' }); const el = document.getElementById(g.href); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      this.setState({ q: '', sel: g.id });
      setTimeout(() => { const el = document.getElementById('situations'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    };
    const soinIds = ['cour', 'blanch', 'fac', 'imp', 'oam', 'paro'];
    const soinOn = {}, soinShow = {}, soinSet = {};
    soinIds.forEach((id) => {
      const o = (st.soin || 'cour') === id;
      soinOn[id] = o ? 'true' : 'false';
      soinShow[id] = o;
      soinSet[id] = () => this.setState({ soin: id });
    });
    const LOWER = { new: 'un premier rendez-vous', rdv: 'prendre ou déplacer un rendez-vous', pain: 'une douleur, une urgence', come: 'savoir comment venir', mail: 'écrire au cabinet', care: 'un soin en particulier' };
    const closeSheet = () => {
      try { document.body.style.overflow = ''; } catch (err) {}
      const cur = this.state || {};
      if (cur.sheet || cur.rdv) this.setState({ sheet: false, rdv: false });
      if (cur.rdv && this._rdvFrom && this._rdvFrom.focus) { try { this._rdvFrom.focus({ preventScroll: true }); } catch (err) {} }
    };
    this._closeRdv = closeSheet;
    // Feuille « Premier rendez-vous » : filtre par jour (0 = tous) et liste des praticiens
    const rdvDayV = st.rdvDay || 0;
    const rdvDayOn = {}, rdvDay = {}, rdvShow = {};
    [0, 1, 2, 3, 4, 5, 6].forEach((k) => {
      rdvDayOn['d' + k] = rdvDayV === k ? 'true' : 'false';
      rdvDay['d' + k] = () => this.setState({ rdvDay: k });
    });
    PRACS.forEach((pr) => { rdvShow[pr.id] = !rdvDayV || pr.days.indexOf(rdvDayV) >= 0; });
    const openRdv = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      this._rdvFrom = document.activeElement;
      try { document.body.style.overflow = 'hidden'; } catch (err) {}
      this.setState({ rdv: true, nav: false });
      setTimeout(() => { if (this._rdvX && this._rdvX.focus) this._rdvX.focus({ preventScroll: true }); }, 80);
    };

    return {
      accent: this.props.accent || '#1E3B33',
      doctolibUrl: this.props.doctolibUrl || 'https://www.doctolib.fr/dentiste/epagny-metz-tessy/clara-manisse/booking/availabilities?specialityId=1&telehealth=false&placeId=practice-659010&motiveIds%5B%5D=13814423&pid=practice-659010&source=profile',
      isOpen: isOpen,
      isClosed: !isOpen,
      statusText: statusText,
      isOpenA: isOpen ? 'true' : 'false',
      hon: hon, hpick: hpick, seeDays: seeDays, hsum: hsum, hcta: hcta,
      statusFg: isOpen ? '#15603F' : '#3E3655',
      statusDot: isOpen ? '#22A06B' : '#B0306A',
      nextOpen: nextOpen,
      week: week,
      on: on, show: show, pick: pick,
      modeOn: modeOn, modeIs: modeIs, setMode: setMode, mapOp: mapOp,
      hot: hot, hover: hover, focus: focus, tap: tap, spotOn: spotOn, okOp: okOp, noOp: noOp, info: info,
      zoneOn: zonesMode ? 'true' : 'false', zoneSo: zonesMode ? '1' : '0.3',
      mapFullA: full ? 'true' : 'false',
      toggleFull: () => this._setFull(!(this.state || {}).mapFull),
      fullLabel: full ? 'Fermer le plan' : 'Agrandir le plan',
      mapFull: full, mapNotFull: !full,
      hintText: st.wheelHint ? 'Ctrl + molette pour zoomer sur le plan' : (coarse ? 'Pincez pour zoomer, glissez pour explorer' : 'Ctrl + molette pour zoomer, glissez pour explorer'),
      s: String(s),
      inv: String(1 / s),
      tx: String(Math.round(st.tx || 0)),
      ty: String(Math.round(st.ty || 0)),
      zoomed: !!st.wheelHint || (full && !st.touched) || (!coarse && this.canPan(s) && !st.touched),
      cursor: this.canPan(s) ? (st.dragging ? 'grabbing' : 'grab') : 'default',
      touch: full ? 'none' : 'pan-y pinch-zoom',
      layerTrans: st.dragging || st.wheeling ? 'none' : 'transform .35s ease',
      mapRef: (el) => {
        this._mapEl = el;
        if (!el || el._wheelOn) return;
        el._wheelOn = true;
        // Ctrl + molette (et pincement sur pavé tactile, qui envoie ctrlKey) : zoom autour du curseur.
        // En plein écran, la molette seule zoome aussi. Sinon la page défile et une aide s'affiche.
        el.addEventListener('wheel', (e) => {
          const cur = this.state || {};
          if (!e.ctrlKey && !e.metaKey && !cur.mapFull) {
            if (!cur.wheelHint) this.setState({ wheelHint: true });
            clearTimeout(this._wh);
            this._wh = setTimeout(() => this.setState({ wheelHint: false }), 1400);
            return;
          }
          e.preventDefault();
          let dy = e.deltaY * (e.deltaMode === 1 ? 33 : 1);
          dy = Math.max(-60, Math.min(60, dy));
          const r = el.getBoundingClientRect();
          this.setState({ touched: true, wheeling: true, wheelHint: false });
          this.zoomTo((cur.s || 1) * Math.exp(-dy * 0.0045), e.clientX - r.left, e.clientY - r.top);
          clearTimeout(this._wz);
          this._wz = setTimeout(() => this.setState({ wheeling: false }), 160);
        }, { passive: false });
      },
      layerRef: (el) => { this._layerEl = el; },
      panelRef: (el) => { this._panelEl = el; },
      sheetOn: st.sheet ? 'true' : 'false',
      selTitle: ({ new: 'Premier rendez-vous', rdv: 'Prendre ou déplacer un RDV', pain: 'J’ai mal, c’est urgent', come: 'Venir au cabinet', mail: 'Écrire au cabinet', care: 'Un soin en particulier' })[sel] || '',
      closeSheet: closeSheet,
      closeRdv: closeSheet,
      openRdv: openRdv,
      rdvOpenA: st.rdv ? 'true' : 'false',
      rdvHidden: st.rdv ? 'false' : 'true',
      rdvDayOn: rdvDayOn, rdvDay: rdvDay, rdvShow: rdvShow,
      rdvXRef: (el) => { this._rdvX = el; },
      bdRef: (el) => { this._bdEl = el; },
      sTs: (e) => {
        const cs = this.state || {};
        if (!cs.sheet && !cs.rdv) return;
        if (window.innerWidth > 760) return;
        const el = this._panelEl;
        const t = e.touches && e.touches[0];
        if (!el || !t) return;
        this._sw = { y0: t.clientY, st: el.scrollTop, t0: Date.now(), dy: 0 };
      },
      sTm: (e) => {
        const sw = this._sw;
        const el = this._panelEl;
        const t = e.touches && e.touches[0];
        if (!sw || !el || !t) return;
        const dy = t.clientY - sw.y0;
        if (sw.st > 0 || el.scrollTop > 0 || dy <= 0) {
          if (sw.dy) { sw.dy = 0; el.style.transform = ''; }
          return;
        }
        sw.dy = dy;
        el.style.transition = 'none';
        el.style.transform = 'translateY(' + dy + 'px)';
        if (this._bdEl) this._bdEl.style.opacity = String(Math.max(0.15, 1 - dy / 400));
      },
      sTe: () => {
        const sw = this._sw;
        const el = this._panelEl;
        const bd = this._bdEl;
        this._sw = null;
        if (!sw || !el || !sw.dy) return;
        const v = sw.dy / Math.max(1, Date.now() - sw.t0);
        if (sw.dy > 110 || (v > 0.6 && sw.dy > 40)) {
          el.style.transition = 'transform .22s ease-in';
          el.style.transform = 'translateY(100%)';
          if (bd) { bd.style.transition = 'opacity .22s ease-in'; bd.style.opacity = '0'; }
          setTimeout(() => {
            el.style.transition = ''; el.style.transform = '';
            if (bd) { bd.style.transition = ''; bd.style.opacity = ''; }
            closeSheet();
          }, 220);
        } else {
          el.style.transition = 'transform .2s ease-out';
          el.style.transform = '';
          if (bd) bd.style.opacity = '';
          setTimeout(() => { el.style.transition = ''; }, 220);
        }
      },
      zoomIn: () => this.zoomTo(s * 1.5),
      zoomOut: () => this.zoomTo(s / 1.5),
      resetView: () => { if (this._center) this._center(1); else this.setState({ s: 1, tx: 0, ty: 0 }); },
      dbl: (e) => {
        if (e.target && e.target.closest && e.target.closest('.hs, .mapctl, .mapfull, .mapinfo')) return;
        if (coarse && !(this.state || {}).mapFull) return;
        const r = this._mapEl ? this._mapEl.getBoundingClientRect() : null;
        if (r) this.zoomTo(s * 1.6, e.clientX - r.left, e.clientY - r.top); else this.zoomTo(s * 1.6);
      },
      pDown: (e) => {
        if (e.target && e.target.closest && e.target.closest('.mapctl, .mapfull')) return;
        // au doigt hors plein écran : on laisse la page défiler normalement
        if (e.pointerType === 'touch' && !(this.state || {}).mapFull) return;
        const onSpot = !!(e.target && e.target.closest && e.target.closest('.hs'));
        this._pts = this._pts || {};
        this._pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        if (!(this.state || {}).touched) this.setState({ touched: true });
        if (!onSpot) { try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {} }
        const cur = this.state || {};
        const pp = this.pinchPts();
        if (pp) {
          this._drag = null;
          this._pinch = { d0: pp.d, s0: cur.s || 1, tx0: cur.tx || 0, ty0: cur.ty || 0, mx: pp.mx, my: pp.my };
          this.setState({ dragging: true });
          return;
        }
        if (onSpot || !this.canPan(cur.s || 1)) return;
        this._drag = { x: e.clientX, y: e.clientY, tx: cur.tx || 0, ty: cur.ty || 0 };
        this.setState({ dragging: true });
      },
      pMove: (e) => {
        if (this._pts && this._pts[e.pointerId]) this._pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        const pc = this._pinch;
        if (pc) {
          const pp = this.pinchPts();
          if (!pp) return;
          const s2 = Math.max(1, Math.min(4, pc.s0 * pp.d / pc.d0));
          const px = (pc.mx - pc.tx0) / pc.s0, py = (pc.my - pc.ty0) / pc.s0;
          const c = this.clampT(pp.mx - px * s2, pp.my - py * s2, s2);
          this.setState({ s: s2, tx: c[0], ty: c[1] });
          return;
        }
        const dr = this._drag;
        if (!dr) return;
        const c = this.clampT(dr.tx + e.clientX - dr.x, dr.ty + e.clientY - dr.y, (this.state || {}).s || 1);
        this.setState({ tx: c[0], ty: c[1] });
      },
      pUp: (e) => {
        if (this._pts && e && e.pointerId != null) delete this._pts[e.pointerId];
        const left = Object.keys(this._pts || {});
        if (this._pinch && left.length < 2) {
          this._pinch = null;
          if (left.length === 1) {
            const p0 = this._pts[left[0]];
            const cur = this.state || {};
            this._drag = { x: p0.x, y: p0.y, tx: cur.tx || 0, ty: cur.ty || 0 };
            return;
          }
        }
        if (left.length === 0) {
          this._drag = null;
          if ((this.state || {}).dragging) this.setState({ dragging: false });
        }
      },
      careOpen: careOpen, careShow: careShow, careToggle: careToggle,
      soinOn: soinOn, soinShow: soinShow, soinSet: soinSet,
      selLower: LOWER[sel] || 'choisir…',
      capN: (CAPS[sel] || CAPS.new)[0], capK: (CAPS[sel] || CAPS.new)[1], capT: (CAPS[sel] || CAPS.new)[2], capD: (CAPS[sel] || CAPS.new)[3],
      qRef: (el) => { this._qEl = el; },
      fxRef: (el) => {
        if (!el || this._fxEl === el || typeof window === 'undefined') return;
        this._fxEl = el;
        const setup = () => {
          const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
          const TH = Array.from({ length: 41 }, (_, i) => i / 40);
          const rvMap = new Map();
          el.querySelectorAll('.rv').forEach((n) => { const src = n.matches('.rvT, .rvI') ? n.parentElement : n; if (!rvMap.has(src)) rvMap.set(src, []); rvMap.get(src).push(n); });
          const hasIO = 'IntersectionObserver' in window;
          // scroll-linked progress for every card (works in the page and inside the canvas)
          if (hasIO && !reduce) {
            const io = new IntersectionObserver((ents) => {
              ents.forEach((en) => {
                const r = en.boundingClientRect;
                const top0 = en.rootBounds ? en.rootBounds.top : 0;
                let p = r.top < top0 ? 1 : en.intersectionRect.height / Math.max(1, Math.min(r.height, 160));
                p = Math.max(0, Math.min(1, p));
                (rvMap.get(en.target) || [en.target]).forEach((x) => x.style.setProperty('--p', p.toFixed(3)));
              });
            }, { threshold: TH });
            rvMap.forEach((list, src) => io.observe(src));
          }
          // hero exit progress, dominant section, nav and orbs
          const nav = el.querySelector('.navD');
          const ind = nav ? nav.querySelector('.nav-ind') : null;
          let cur = null, hov = false;
          const place = (a) => { if (!ind) return; if (!a) { ind.style.opacity = '0'; return; } ind.style.opacity = '1'; ind.style.width = a.offsetWidth + 'px'; ind.style.transform = 'translateX(' + a.offsetLeft + 'px)'; };
          const setCur = (id) => {
            if (!nav) return;
            const a = nav.querySelector('a.navl[href="#' + id + '"]') ;
            if (a === cur) return;
            nav.querySelectorAll('a.navl').forEach((x) => x.removeAttribute('data-cur'));
            if (a) a.setAttribute('data-cur', '1');
            cur = a; if (!hov) place(a);
          };
          if (nav) {
            nav.querySelectorAll('a.navl').forEach((a) => a.addEventListener('mouseenter', () => { hov = true; place(a); }));
            nav.addEventListener('mouseleave', () => { hov = false; place(cur); });
          }
          const vis = {};
          const darkEls = Array.prototype.slice.call(el.querySelectorAll('#soins, .ridge-dark'));
          const trailLinks = Array.prototype.slice.call(el.querySelectorAll('.trail a'));
          const darkCheck = () => {
            const rs = darkEls.map((d) => d.getBoundingClientRect());
            trailLinks.forEach((a) => {
              const r = a.getBoundingClientRect(); const cy = r.top + r.height / 2;
              const on = rs.some((d) => cy > d.top + 2 && cy < d.bottom - 2);
              if (on) a.setAttribute('data-dark', '1'); else a.removeAttribute('data-dark');
            });
            const tr = el.querySelector('.trail'); if (tr) { if (trailLinks.length && trailLinks.every((a) => a.hasAttribute('data-dark'))) tr.setAttribute('data-dark', '1'); else tr.removeAttribute('data-dark'); }
          };
          const pickSec = (live) => {
            darkCheck();
            const vh = window.innerHeight || 800;
            let best = 'top';
            if (vh < 2500) {
              let bt = -1e9; ids.forEach((id) => { const n = el.querySelector('#' + id); if (!n) return; const t = n.getBoundingClientRect().top; if (t < vh * 0.3 && t > bt) { bt = t; best = id; } });
            } else {
              let bv = -1;
              ids.forEach((id) => { if ((vis[id] || 0) > bv) { bv = vis[id] || 0; best = id; } });
            }
            const sec = (best === 'situations' || best === 'reponse') ? 'top' : best;
            if (el.getAttribute('data-sec') !== sec) el.setAttribute('data-sec', sec);
            setCur(sec);
          };
          const ids = ['top', 'situations', 'reponse', 'cabinet', 'horaires', 'acces', 'soins', 'tarifs', 'equipe'];
          if (hasIO) {
            const so = new IntersectionObserver((ents) => {
              ents.forEach((en) => {
                const id = en.target.id;
                vis[id] = en.intersectionRect.height;
                const ratio = en.intersectionRect.height / Math.max(1, en.boundingClientRect.height);
                if (id === 'top' && !reduce) { el.style.setProperty('--hp', ratio.toFixed(3)); el.setAttribute('data-scrolled', ratio < 0.95 ? '1' : '0'); }
                if (id === 'situations' && !reduce) el.style.setProperty('--op', (en.boundingClientRect.top < (en.rootBounds ? en.rootBounds.top : 0) ? ratio : 1).toFixed(3));
              });
              pickSec(false);
            }, { threshold: TH });
            ids.forEach((id) => { const n = el.querySelector('#' + id); if (n) so.observe(n); });
          }
          // smooth anchors
          el.addEventListener('click', (e) => {
            const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
            if (!a) return;
            const h = a.getAttribute('href');
            if (!h || h.length < 2) return;
            const t = el.querySelector(h);
            if (!t) return;
            e.preventDefault();
            t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          });
          // gentle orb parallax while the page itself scrolls
          let raf = 0;
          const rvs = reduce ? [] : Array.prototype.slice.call(el.querySelectorAll('.rv'));
          const upd = () => {
            darkCheck();
            raf = 0;
            const y = window.scrollY || window.pageYOffset || 0;
            const vh = window.innerHeight || 800;
            pickSec(true);
            const topEl = el.querySelector('#top');
            if (topEl && !reduce && vh < 2500) { const tr = topEl.getBoundingClientRect(); const hpv = tr.top < 0 ? Math.max(0, Math.min(1, tr.bottom / Math.max(1, tr.height))) : 1; el.style.setProperty('--hp', hpv.toFixed(3)); el.setAttribute('data-scrolled', hpv < 0.95 ? '1' : '0'); }
            if (vh < 2500) rvs.forEach((n) => {
              const r = (n.matches('.rvT, .rvI') ? n.parentElement : n).getBoundingClientRect();
              let p = r.top < 0 ? 1 : (Math.min(r.bottom, vh) - Math.max(r.top, 0)) / Math.max(1, Math.min(r.height, 160));
              p = Math.max(0, Math.min(1, p));
              n.style.setProperty('--p', p.toFixed(3));
            });
            const set = (k, v) => el.style.setProperty(k, v.toFixed(1) + 'px');
            set('--o1x', Math.sin(y / 700) * 140); set('--o1y', Math.cos(y / 900) * 90);
            set('--o2x', Math.cos(y / 800) * -130); set('--o2y', Math.sin(y / 650) * 110);
            set('--o3x', Math.sin(y / 600 + 1) * 160); set('--o3y', Math.cos(y / 750) * -100);
            set('--o4x', Math.cos(y / 900 + 2) * 120); set('--o4y', Math.sin(y / 800) * 80);
          };
          if (!reduce) {
            window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
            let lastY = -1;
            setInterval(() => { const yy = window.scrollY || 0; if (yy !== lastY) { lastY = yy; if (!raf) raf = requestAnimationFrame(upd); } }, 450);
          }
          upd();
          window.addEventListener('resize', () => place(cur));
          [['.objs', '.obj'], ['.soin-list', '.soin-it']].forEach((pair) => {
            const row = el.querySelector(pair[0]);
            if (!row) return;
            let rf = 0;
            const pickMid = () => {
              rf = 0;
              if (row.scrollWidth <= row.clientWidth + 4) return;
              const mid = row.getBoundingClientRect().left + row.clientWidth / 2;
              let best = null, bd = 1e9;
              row.querySelectorAll(pair[1]).forEach((o) => { const r = o.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = o; } });
              if (best && best.getAttribute('data-on') !== 'true') { row._auto = true; best.click(); row._auto = false; }
            };
            row.addEventListener('scroll', () => { if (!rf) rf = requestAnimationFrame(pickMid); }, { passive: true });
          });
          el.querySelectorAll('.obj, .soin-it').forEach((b) => b.addEventListener('click', () => { const row = b.parentElement; if (row && !row._auto && row.scrollWidth > row.clientWidth + 4) row.scrollTo({ left: b.offsetLeft - (row.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' }); }));

        };
        setTimeout(setup, 0);
      },
      onQ: (e) => { const v = (e && e.target && e.target.value) || ''; this.setState({ q: v }); },
      onQKey: (e) => { if (e && e.key === 'Enter') { e.preventDefault && e.preventDefault(); goSug(); } },
      sugShow: !!sug,
      sugLabel: sug ? sug.label : '',
      goSug: goSug,
      menuOpen: !!st.menu,
      toggleMenu: () => this.setState({ menu: !(this.state || {}).menu }),
      palId: st.pal || this.props.palette || 'foret',
      palOn: ['foret', 'lac', 'ardoise', 'nuit', 'terre'].reduce((o, k) => { o[k] = (st.pal || this.props.palette || 'foret') === k ? 'true' : 'false'; return o; }, {}),
      setPal: ['foret', 'lac', 'ardoise', 'nuit', 'terre'].reduce((o, k) => { o[k] = () => this.setState({ pal: k }); return o; }, {}),
      navOpen: !!st.nav,
      navOpenA: st.nav ? 'true' : 'false',
      toggleNav: () => this.setState({ nav: !(this.state || {}).nav }),
      closeNav: () => { if ((this.state || {}).nav) this.setState({ nav: false }); },
      legendMain: mode === 'car' ? 'trajet en voiture' : mode === 'bike' ? 'trajet à vélo' : 'trajet depuis l’arrêt de bus',
      copyLabel: st.copied ? 'Adresse copiée !' : 'Copier l’adresse',
      copy: () => {
        try { if (navigator.clipboard) navigator.clipboard.writeText('Cabinet dentaire du Pericles, Montée C, 1 allée de la Mandallaz, 74370 Epagny Metz-Tessy'); } catch (e) {}
        this.setState({ copied: true });
        clearTimeout(this._ct);
        this._ct = setTimeout(() => this.setState({ copied: false }), 2200);
      }
    };
  }
}

__mountDC(Component, {"palette": "foret", "accent": "#1E3B33", "doctolibUrl": "https://www.doctolib.fr/dentiste/epagny-metz-tessy/clara-manisse/booking/availabilities?specialityId=1&telehealth=false&placeId=practice-659010&motiveIds%5B%5D=13814423&pid=practice-659010&source=profile", "openState": "auto"});
document.getElementById('app').classList.add('ready');
