// Parleyroom app: orchestration + side panel (Tweaks) + iOS frames

const ACCENTS = {
  teal:    { h: 172, c: 0.12, l: 0.55 },
  amber:   { h: 75,  c: 0.14, l: 0.62 },
  violet:  { h: 290, c: 0.13, l: 0.58 },
  coral:   { h: 25,  c: 0.16, l: 0.62 },
  indigo:  { h: 260, c: 0.13, l: 0.55 },
  forest:  { h: 150, c: 0.10, l: 0.50 },
};

const STUDENT_TABS = [
  { key: 'home',     label: 'Home',    icon: 'home' },
  { key: 'lessons',  label: 'Lessons', icon: 'event_note' },
  { key: 'homework', label: 'Tasks',   icon: 'task_alt' },
  { key: 'vocab',    label: 'Words',   icon: 'menu_book' },
  { key: 'settings', label: 'You',     icon: 'person' },
];
const TEACHER_TABS = [
  { key: 'home',     label: 'Today',     icon: 'today' },
  { key: 'students', label: 'Students',  icon: 'groups' },
  { key: 'calendar', label: 'Calendar',  icon: 'calendar_today' },
  { key: 'materials',label: 'Library',   icon: 'collections_bookmark' },
  { key: 'settings', label: 'You',       icon: 'person' },
];

function IosFrame({ children, dark, showIsland }) {
  return (
    <div style={{
      width: 390, height: 844, position: 'relative',
      borderRadius: 56, padding: 12,
      background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
      boxShadow: '0 40px 80px rgba(15,15,14,0.28), 0 12px 32px rgba(15,15,14,0.18), 0 0 0 2px #000, inset 0 0 0 2px #2a2a2a',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden',
        background: dark ? '#0D0D0C' : '#FBFAF6',
        position: 'relative',
      }}>
        {/* Dynamic island */}
        {showIsland && (
          <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 125, height: 37, background: '#000', borderRadius: 24, zIndex: 70 }} />
        )}
        {children}
      </div>
    </div>
  );
}

function App() {
  // Load persisted defaults
  const [state, setState] = React.useState(() => {
    try {
      const saved = localStorage.getItem('parleyroom_tweaks_v2');
      return saved ? { ...window.TWEAK_DEFAULTS, ...JSON.parse(saved) } : { ...window.TWEAK_DEFAULTS };
    } catch { return { ...window.TWEAK_DEFAULTS }; }
  });
  const update = (patch) => setState(prev => {
    const next = { ...prev, ...patch };
    try { localStorage.setItem('parleyroom_tweaks_v2', JSON.stringify(next)); } catch {}
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
    return next;
  });

  // Set CSS vars on :root whenever accent/dark/density changes
  React.useEffect(() => {
    const a = ACCENTS[state.accent] || ACCENTS.teal;
    const root = document.documentElement;
    root.style.setProperty('--accent-h', a.h);
    root.style.setProperty('--accent-c', a.c);
    root.style.setProperty('--accent-l', a.l);
    root.classList.toggle('theme-dark', !!state.dark);
    root.classList.toggle('density-compact', state.density === 'compact');
  }, [state.accent, state.dark, state.density]);

  // Edit mode listener
  React.useEffect(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const [tweaksOpen, setTweaksOpen] = React.useState(true);
  const T = useT(state.language);
  const tabs = state.role === 'teacher' ? TEACHER_TABS : STUDENT_TABS;

  const go = (s) => update({ screen: s });

  // Route screen
  const renderScreen = () => {
    const role = state.role;
    const s = state.screen;
    if (s === 'lesson-live') return <LessonLive T={T} state={state} go={go} dark={state.dark} />;
    if (s === 'vocab-review') return <VocabReview T={T} state={state} go={go} dark={state.dark} />;
    if (s === 'notifications') return <NotificationsScreen T={T} state={state} go={go} />;
    if (s === 'student-profile') return <TeacherStudentProfile T={T} state={state} go={go} />;
    if (s === 'profile-edit') return <ProfileEditScreen T={T} state={state} go={go} />;
    if (s === 'password-reset') return <PasswordResetScreen T={T} state={state} go={go} />;

    if (role === 'student') {
      if (s === 'vocab')    return <StudentVocabList T={T} state={state} go={go} />;
      if (s === 'lessons')  return <StudentLessons T={T} state={state} go={go} />;
      if (s === 'homework') return <StudentHomework T={T} state={state} go={go} />;
      if (s === 'goals')    return <StudentGoals T={T} state={state} go={go} />;
      if (s === 'calendar') return <CalendarScreen T={T} state={state} go={go} />;
      if (s === 'settings') return <SettingsScreen T={T} state={state} go={go} />;
      return <StudentHome T={T} state={state} go={go} dark={state.dark} />;
    } else {
      if (s === 'students') return <TeacherStudents T={T} state={state} go={go} />;
      if (s === 'calendar') return <CalendarScreen T={T} state={state} go={go} />;
      if (s === 'materials') return <MaterialsScreen T={T} state={state} go={go} />;
      if (s === 'settings') return <SettingsScreen T={T} state={state} go={go} />;
      return <TeacherHome T={T} state={state} go={go} dark={state.dark} />;
    }
  };

  // Key to force remount + fade on transitions
  const screenKey = `${state.role}-${state.screen}-${state.populated}-${state.language}`;
  const showIsland = state.screen === 'home' && state.showLiveBanner;
  const hideTabs = state.screen === 'lesson-live' || state.screen === 'vocab-review';

  return (
    <div className={`stage ${state.dark ? 'dark' : ''}`}>
      <div className="canvas-wrap">
        <div className="device-scaler">
          <IosFrame dark={state.dark} showIsland={showIsland}>
            {/* Only render status strip outside of live call */}
            {state.screen !== 'lesson-live' && <StatusStrip dark={state.dark} />}
            <div key={screenKey} className="screen no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingTop: state.screen !== 'lesson-live' ? 10 : 0, animation: 'fade-in .24s var(--ease)' }}>
              {renderScreen()}
            </div>
            {!hideTabs && <TabBar tabs={tabs} active={state.screen === 'student-profile' ? 'students' : (['profile-edit','password-reset'].includes(state.screen) ? 'settings' : (state.screen === 'goals' ? 'home' : (['vocab-review','notifications','lesson-live','student-profile'].includes(state.screen) ? 'home' : state.screen)))} onChange={go} dark={state.dark} />}
            <HomeIndicator dark={state.dark} />
          </IosFrame>
        </div>
      </div>

      {/* Side panel (Tweaks) */}
      {tweaksOpen && <TweaksPanel state={state} update={update} />}
    </div>
  );
}

// Quick materials screen — for teacher
function MaterialsScreen({ T, state, go }) {
  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: '8px 20px 18px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{T('materials')}</div>
        <div className="serif" style={{ fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em' }}>Library<span style={{ color: 'var(--accent)' }}>.</span></div>
      </div>

      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {window.MATERIALS.map(m => (
          <Card key={m.id} padded={false} style={{ overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ height: 88, background: `linear-gradient(135deg, oklch(0.85 0.1 ${m.hue}) 0%, oklch(0.55 0.14 ${m.hue}) 100%)`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 10, left: 10 }}>
                <Pill tone="dark" style={{ background: 'rgba(0,0,0,0.35)', color: '#fff', backdropFilter: 'blur(6px)' }}>{m.level}</Pill>
              </div>
              <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 22, color: '#fff', opacity: 0.7 }}>
                <span className="ms" style={{ fontSize: 28 }}>
                  {m.kind === 'reading' ? 'menu_book' : m.kind === 'listening' ? 'headphones' : m.kind === 'speaking' ? 'chat' : m.kind === 'writing' ? 'edit' : 'school'}
                </span>
              </div>
            </div>
            <div style={{ padding: '10px 12px 12px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.25, marginBottom: 4 }}>{m.title}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.kind} · {m.minutes} min</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TweaksPanel({ state, update }) {
  const screens = state.role === 'student'
    ? [['home','Home'],['lessons','Lessons'],['homework','Tasks'],['vocab','Words'],['vocab-review','Review'],['goals','Goals'],['calendar','Calendar'],['lesson-live','Lesson live'],['notifications','Inbox'],['settings','You'],['profile-edit','Edit profile'],['password-reset','Reset password']]
    : [['home','Today'],['students','Students'],['student-profile','Profile'],['calendar','Calendar'],['materials','Library'],['lesson-live','Lesson live'],['notifications','Inbox'],['settings','You'],['profile-edit','Edit profile'],['password-reset','Reset password']];

  return (
    <aside className="side">
      <div className="brand">
        <div className="brand-mark">P</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>Parleyroom · mobile</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Redesign explorations</div>
        </div>
      </div>
      <h3>Tweaks</h3>
      <div className="sub">Switch roles, screens, theme, and content states to explore.</div>

      <div className="group">
        <div className="grp-title">Role</div>
        <div className="seg" style={{ width: '100%' }}>
          {['student','teacher'].map(r => (
            <button key={r} className={state.role === r ? 'on' : ''} onClick={() => update({ role: r, screen: 'home' })} style={{ flex:1 }}>{r[0].toUpperCase()+r.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="group">
        <div className="grp-title">Screen</div>
        <div className="screens-grid">
          {screens.map(([k,l]) => (
            <button key={k} className={state.screen === k ? 'on' : ''} onClick={() => update({ screen: k })}>{l}</button>
          ))}
        </div>
      </div>

      <div className="group">
        <div className="grp-title">Appearance</div>
        <label className="row">Dark mode
          <button className={`toggle ${state.dark ? 'on' : ''}`} onClick={() => update({ dark: !state.dark })} />
        </label>
        <label className="row">Density
          <div className="seg">
            <button className={state.density === 'comfort' ? 'on' : ''} onClick={() => update({ density: 'comfort' })}>Comfort</button>
            <button className={state.density === 'compact' ? 'on' : ''} onClick={() => update({ density: 'compact' })}>Compact</button>
          </div>
        </label>
        <div style={{ padding: '7px 0' }}>
          <div style={{ fontSize: 13, marginBottom: 8 }}>Accent</div>
          <div className="swatches">
            {Object.entries(ACCENTS).map(([k,v]) => (
              <button key={k} title={k} className={`sw ${state.accent === k ? 'on' : ''}`} onClick={() => update({ accent: k })} style={{ background: `oklch(${v.l} ${v.c} ${v.h})`, border: state.accent === k ? undefined : '2px solid rgba(0,0,0,0.06)' }} />
            ))}
          </div>
        </div>
      </div>

      <div className="group">
        <div className="grp-title">Content</div>
        <label className="row">Populated
          <button className={`toggle ${state.populated ? 'on' : ''}`} onClick={() => update({ populated: !state.populated })} />
        </label>
        <label className="row">Live lesson banner
          <button className={`toggle ${state.showLiveBanner ? 'on' : ''}`} onClick={() => update({ showLiveBanner: !state.showLiveBanner })} />
        </label>
        <label className="row">Show weekly goals
          <button className={`toggle ${state.showGoals ? 'on' : ''}`} onClick={() => update({ showGoals: !state.showGoals })} />
        </label>
        <label className="row">Show club promo
          <button className={`toggle ${state.showPromo ? 'on' : ''}`} onClick={() => update({ showPromo: !state.showPromo })} />
        </label>
      </div>

      <div className="group">
        <div className="grp-title">Language</div>
        <div className="seg" style={{ width: '100%' }}>
          {[['en','English'],['de','Deutsch']].map(([k,l]) => (
            <button key={k} className={state.language === k ? 'on' : ''} onClick={() => update({ language: k })} style={{ flex:1 }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="group">
        <div className="grp-title">Notes</div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55 }}>
          Typography pair: <span style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 14 }}>Instrument Serif</span> + <span style={{ fontFamily: 'Geist' }}>Geist</span>. All interactive rows respond to touch. Live call uses a darker palette regardless of theme.
        </div>
      </div>
    </aside>
  );
}

// Auto-scale the phone to viewport height
function fitScale() {
  const wrap = document.querySelector('.canvas-wrap');
  const scaler = document.querySelector('.device-scaler');
  if (!wrap || !scaler) return;
  const availH = window.innerHeight - 72;
  const availW = wrap.clientWidth - 24;
  const scale = Math.min(1, availH / 844, availW / 390);
  scaler.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', fitScale);
setTimeout(fitScale, 50);
setTimeout(fitScale, 400);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
setTimeout(fitScale, 50);
