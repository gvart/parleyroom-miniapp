// Shared screens: lesson-live (call), vocab review, calendar, notifications, settings

function LessonLive({ T, state, go, dark }) {
  const [mic, setMic] = React.useState(true);
  const [cam, setCam] = React.useState(true);
  const [showRecap, setShowRecap] = React.useState(false);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0A0A09', color: '#F2F1EC', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Remote video */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 40%, oklch(0.35 0.12 172) 0%, oklch(0.12 0.05 200) 70%)`,
        }} />
        {/* avatar badge */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Avatar hue={172} initials="HK" size={120} />
        </div>
        {/* top bar */}
        <div style={{ position: 'absolute', top: 50, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pill tone="live" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', backdropFilter: 'blur(12px)' }}><span className="live-dot"/>Live · 12:34</Pill>
          <button onClick={() => go('home')} className="tap" style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <span className="ms" style={{ fontSize: 18 }}>expand_more</span>
          </button>
        </div>
        {/* self preview */}
        <div style={{ position: 'absolute', bottom: 180, right: 16, width: 90, height: 130, borderRadius: 16, background: 'linear-gradient(180deg, oklch(0.35 0.1 290), oklch(0.18 0.05 290))', border: '2px solid rgba(255,255,255,0.15)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Avatar hue={290} initials="LW" size={48} />
        </div>

        {/* Caption bubble (AI-translate style) */}
        <div style={{ position: 'absolute', bottom: 180, left: 16, right: 120, padding: '10px 14px', borderRadius: 16, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)', color: '#F2F1EC', fontSize: 13, lineHeight: 1.35, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 10, color: 'oklch(0.75 0.14 172)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Live caption · DE</div>
          „Heute sprechen wir über den Unterschied zwischen Perfekt und Präteritum…"
        </div>
      </div>

      {/* Lesson deck bar */}
      <div style={{ padding: '16px 16px 10px', background: 'linear-gradient(180deg, transparent, #0A0A09 50%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: 'oklch(0.7 0.1 172)', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Lesson deck · 3/8</div>
            <div className="serif" style={{ fontSize: 18, marginTop: 2 }}>Perfekt vs. Präteritum</div>
          </div>
          <button onClick={() => setShowRecap(true)} className="tap" style={{ border:'1px solid rgba(255,255,255,0.18)', background:'rgba(255,255,255,0.06)', color:'#fff', padding:'8px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', display:'inline-flex', alignItems:'center', gap:6 }}>
            <span className="ms" style={{ fontSize: 14 }}>note_alt</span>Notes
          </button>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i < 3 ? 'oklch(0.75 0.14 172)' : 'rgba(255,255,255,0.12)' }} />
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
          <CallBtn icon={mic ? 'mic' : 'mic_off'} onClick={() => setMic(!mic)} active={mic} />
          <CallBtn icon={cam ? 'videocam' : 'videocam_off'} onClick={() => setCam(!cam)} active={cam} />
          <CallBtn icon="screen_share" />
          <CallBtn icon="translate" />
          <button onClick={() => go('home')} className="tap" style={{ width: 60, height: 60, borderRadius: 999, background: 'oklch(0.55 0.22 25)', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', boxShadow: '0 8px 24px oklch(0.55 0.22 25 / 0.5)' }}>
            <span className="ms fill" style={{ fontSize: 26 }}>call_end</span>
          </button>
        </div>
      </div>

      <Sheet open={showRecap} onClose={() => setShowRecap(false)} dark={true}>
        <div style={{ padding: '0 22px 10px' }}>
          <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 4 }}>Lesson notes</div>
          <div style={{ fontSize: 13, color: '#A7A69C', marginBottom: 18 }}>Auto-captured · edit anytime</div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#A7A69C', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>New vocabulary</div>
            {['die Vergangenheit · the past','beiläufig · casually','die Erzählung · the narrative'].map((s,i)=>(
              <div key={i} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: 6, fontSize: 14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>{s}</span><span className="ms" style={{ fontSize: 16, color: 'oklch(0.7 0.12 172)' }}>add_circle</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#A7A69C', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>Key rule</div>
            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, fontSize: 14, lineHeight: 1.5 }}>
              Präteritum is used in written German (novels, news); Perfekt dominates in spoken conversation, esp. in the south.
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function CallBtn({ icon, onClick, active = true }) {
  return (
    <button onClick={onClick} className="tap" style={{
      width: 52, height: 52, borderRadius: 999, border: 0, cursor: 'pointer',
      background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,100,100,0.85)',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${active ? 'rgba(255,255,255,0.14)' : 'transparent'}`,
    }}>
      <span className="ms" style={{ fontSize: 22 }}>{icon}</span>
    </button>
  );
}

function VocabReview({ T, state, go, dark }) {
  const [i, setI] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const cards = window.VOCAB.filter(v => v.status === 'review');
  const card = cards[i % cards.length];

  const next = (grade) => {
    setFlipped(false);
    setTimeout(() => setI(i + 1), 180);
  };

  const progress = ((i) / cards.length) * 100;

  return (
    <div style={{ paddingBottom: 110, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => go('vocab')} className="tap" style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--card)', border: '1px solid var(--hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span className="ms" style={{ fontSize: 20 }}>close</span>
        </button>
        <div style={{ flex: 1, margin: '0 14px', height: 4, background: 'var(--hair)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--ink)', borderRadius: 999, transition: 'width .3s var(--ease)' }} />
        </div>
        <div className="mono" style={{ fontSize: 12, color: 'var(--ink-2)', minWidth: 34, textAlign: 'right' }}>{i+1}/{cards.length}</div>
      </div>

      {/* Flashcard */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={() => setFlipped(!flipped)} style={{
          width: '100%', height: 360, borderRadius: 24, cursor: 'pointer',
          perspective: 1200,
        }}>
          <div style={{
            width: '100%', height: '100%', position: 'relative',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform .6s var(--ease)',
          }}>
            {/* Front */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 24,
              background: 'linear-gradient(160deg, var(--card) 0%, var(--accent-soft) 100%)',
              border: '1px solid var(--hair)', backfaceVisibility: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 30, textAlign: 'center',
              boxShadow: '0 20px 60px rgba(15,15,14,0.08)',
            }}>
              <div style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>{card.category}</div>
              <div className="serif" style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: '-0.02em' }}>{card.german}</div>
              <div style={{ marginTop: 'auto', fontSize: 12, color: 'var(--ink-3)' }}>Tap to reveal</div>
            </div>
            {/* Back */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 24,
              background: 'var(--ink)', color: 'var(--bg)',
              backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 30, textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>Meaning</div>
              <div className="serif" style={{ fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{card.english}</div>
              <div style={{ marginTop: 14, fontSize: 13, color: 'rgba(242,241,236,0.6)', fontStyle: 'italic' }} className="serif">{card.exampleSentence ? `„${card.exampleSentence}“` : ''}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade buttons */}
      <div style={{ padding: '0 20px 30px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { l: T('again'),  bg: 'oklch(0.55 0.18 25)' },
            { l: T('good'),   bg: 'oklch(0.5 0.14 75)' },
            { l: T('easy'),   bg: 'oklch(0.5 0.12 172)' },
          ].map((g,j) => (
            <button key={j} onClick={() => next(g.l)} className="tap" style={{ flex:1, border:0, background: g.bg, color: '#fff', padding: '14px', borderRadius: 16, fontSize: 13, fontWeight: 600, cursor:'pointer' }}>
              {g.l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarScreen({ T, state, go }) {
  const [dayIdx, setDayIdx] = React.useState(2);
  const hours = ['08','09','10','11','12','13','14','15','16','17','18'];

  // WEEK entries correspond to dates 2026-03-14 … 2026-03-20 (Sat..Fri? — see data). Build mapping from lesson.date → dayIdx.
  const WEEK_ISO = ['2026-03-14','2026-03-15','2026-03-16','2026-03-17','2026-03-18','2026-03-19','2026-03-20'];
  const dayLessons = window.LESSONS.filter(l => WEEK_ISO.indexOf(l.date) === dayIdx);

  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: '8px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{T('calendar')}</div>
          <div className="serif" style={{ fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em' }}>March 2026<span style={{ color: 'var(--accent)' }}>.</span></div>
        </div>
        <button className="tap" style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--ink)', color: 'var(--bg)', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span className="ms" style={{ fontSize: 20 }}>add</span>
        </button>
      </div>

      {/* Week strip */}
      <div style={{ padding: '0 12px 16px', display: 'flex', gap: 4 }}>
        {window.WEEK.map((d, i) => (
          <button key={d.key} onClick={() => setDayIdx(i)} className="tap" style={{
            flex: 1, border: 0, cursor: 'pointer',
            padding: '10px 0',
            background: dayIdx === i ? 'var(--ink)' : 'transparent',
            color: dayIdx === i ? 'var(--bg)' : 'var(--ink)',
            borderRadius: 14,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.7 }}>{d.label}</div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>{d.n}</div>
            <div style={{ width: 4, height: 4, borderRadius: 999, background: (i === 2 || i === 3) ? (dayIdx === i ? 'var(--accent)' : 'var(--accent)') : 'transparent' }} />
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ padding: '0 20px', position: 'relative' }}>
        {hours.map((h, i) => (
          <div key={h} style={{ display: 'flex', gap: 14, minHeight: 50, borderTop: i === 0 ? 0 : '1px dashed var(--hair)', paddingTop: 6, paddingBottom: 6 }}>
            <div className="mono" style={{ width: 32, fontSize: 11, color: 'var(--ink-3)', paddingTop: 2 }}>{h}:00</div>
            <div style={{ flex: 1, position: 'relative' }}>
              {dayLessons.filter(l => parseInt(l.time.split(':')[0]) === parseInt(h)).map(l => {
                const isLive = l.status === 'in-progress';
                const isClub = l.type !== 'one-on-one';
                return (
                  <div key={l.id} onClick={() => go('lesson-live')} style={{
                    background: isLive ? 'linear-gradient(135deg, oklch(0.38 0.12 145), oklch(0.28 0.1 200))' : isClub ? 'oklch(0.94 0.04 290)' : 'var(--card)',
                    color: isLive ? '#F2F1EC' : isClub ? 'oklch(0.35 0.12 290)' : 'var(--ink)',
                    padding: '10px 12px', borderRadius: 14,
                    border: isLive ? 0 : '1px solid var(--hair)',
                    marginBottom: 4, cursor: 'pointer',
                    boxShadow: isLive ? '0 8px 20px oklch(0.28 0.1 200 / 0.3)' : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.topic}</div>
                      {isLive && <Pill tone="live" style={{ fontSize: 9, padding: '2px 6px' }}><span className="live-dot" />LIVE</Pill>}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>
                      {l.time} · {l.duration}m · {isClub ? `${(l.studentIds||[]).length}${l.maxParticipants ? '/'+l.maxParticipants : ''}` : (window.PEOPLE.find(p=>p.id===(l.studentIds||[])[0])?.name)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsScreen({ T, state, go }) {
  const notifText = (n) => {
    const who = n.actor ? `${n.actor.firstName} ${n.actor.lastName}` : 'Someone';
    switch (n.type) {
      case 'reschedule-accepted': return `${who} accepted your reschedule request.`;
      case 'reschedule-rejected': return `${who} declined your reschedule request.`;
      case 'reschedule-requested': return `${who} asked to reschedule a lesson.`;
      case 'lesson-requested':     return `${who} requested a lesson.`;
      case 'lesson-accepted':      return `${who} confirmed your lesson.`;
      case 'lesson-cancelled':     return `${who} cancelled a lesson.`;
      case 'lesson-completed':     return `${who} marked your lesson as complete.`;
      case 'lesson-reminder':      return `Your lesson with ${who} starts soon.`;
      case 'homework-assigned':    return `${who} assigned new homework.`;
      case 'homework-submitted':   return `${who} submitted homework for review.`;
      case 'homework-reviewed':    return `${who} reviewed your homework.`;
      case 'vocab-review-due':     return `You have words ready to review.`;
      case 'goal-completed':       return `You completed a learning goal.`;
      case 'material-shared':      return `${who} shared new materials.`;
      default:                     return n.type.replace(/-/g, ' ');
    }
  };
  const notifIcon = (t) => {
    if (t.startsWith('lesson') || t.startsWith('reschedule')) return 'videocam';
    if (t.startsWith('homework')) return 'task_alt';
    if (t.startsWith('vocab'))    return 'menu_book';
    if (t.startsWith('goal'))     return 'flag';
    if (t.startsWith('material')) return 'folder_open';
    return 'notifications';
  };
  const relTime = (iso) => {
    if (!iso) return '';
    const now = new Date('2026-03-16T10:00:00Z').getTime();
    const t = new Date(iso).getTime();
    const m = Math.max(0, Math.round((now - t) / 60000));
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h/24)}d ago`;
  };

  const items = window.NOTIFICATIONS || [];

  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: '8px 20px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => go('home')} className="tap" style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--card)', border: '1px solid var(--hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span className="ms" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>Notifications</div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '0 20px' }}>
        {items.length === 0 ? (
          <div style={{ padding: '40px 30px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>◌</div>
            <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>All caught up</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>You have no new notifications.</div>
          </div>
        ) : (
          <Card padded={false}>
            {items.map((n, i) => {
              const unread = !n.viewed;
              return (
                <div key={n.id} style={{
                  padding: '16px 18px',
                  borderBottom: i < items.length - 1 ? '1px solid var(--hair)' : 0,
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  background: unread ? 'var(--accent-soft)' : 'transparent',
                  position: 'relative',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 999,
                    background: unread ? 'var(--accent)' : 'var(--bg-2)',
                    color: unread ? '#fff' : 'var(--ink-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span className="ms" style={{ fontSize: 18 }}>{notifIcon(n.type)}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, lineHeight: 1.4, marginBottom: 2, color: 'var(--ink)' }}>{notifText(n)}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{relTime(n.createdAt)}</div>
                  </div>
                  {unread && <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />}
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}

function SettingsScreen({ T, state, go }) {
  const me = state.role === 'teacher' ? window.TEACHER_ME : window.STUDENT_ME;
  const groups = [
    { title: 'Account', items: [
      { i: 'person', l: 'Edit profile', screen: 'profile-edit' },
      { i: 'credit_card', l: 'Subscription' },
      { i: 'language', l: 'Interface language' },
    ]},
    { title: 'Privacy', items: [
      { i: 'lock', l: 'Change password', screen: 'password-reset' },
      { i: 'notifications', l: 'Notifications' },
      { i: 'help', l: 'Support' },
    ]},
  ];
  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: '8px 20px 18px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{T('settings')}</div>
        <div className="serif" style={{ fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em' }}>{me.name.split(' ')[0]}<span style={{ color: 'var(--accent)' }}>.</span></div>
      </div>

      <div style={{ padding: '0 20px 18px' }}>
        <Card onClick={() => go('profile-edit')} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
          <Avatar hue={me.hue} initials={me.initials} size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{me.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{me.level} · {state.role === 'teacher' ? 'German, English' : 'Learning German'}</div>
          </div>
          <span className="ms" style={{ fontSize: 22, color: 'var(--ink-3)' }}>chevron_right</span>
        </Card>
      </div>

      {groups.map(grp => (
        <Section key={grp.title} eyebrow={grp.title}>
          <Card padded={false}>
            {grp.items.map((it, i) => (
              <div key={it.l} onClick={() => it.screen && go(it.screen)} style={{ padding: '14px 18px', borderBottom: i < grp.items.length - 1 ? '1px solid var(--hair)' : 0, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <span className="ms" style={{ fontSize: 20, color: 'var(--ink-2)' }}>{it.i}</span>
                <div style={{ flex: 1, fontSize: 14 }}>{it.l}</div>
                <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }}>chevron_right</span>
              </div>
            ))}
          </Card>
        </Section>
      ))}
    </div>
  );
}

function ScreenHeader({ title, onBack }) {
  return (
    <div style={{ padding: '8px 20px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={onBack} className="tap" style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--card)', border: '1px solid var(--hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <span className="ms" style={{ fontSize: 20 }}>arrow_back</span>
      </button>
      <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>{title}</div>
    </div>
  );
}

function ProfileEditScreen({ T, state, go }) {
  const me = state.role === 'teacher' ? window.TEACHER_ME : window.STUDENT_ME;
  const [name, setName] = React.useState(me.name);
  const [email, setEmail] = React.useState('lina.w@example.com');
  const [bio, setBio] = React.useState('Berlin-based, learning German for work and a novel someday.');
  const [level, setLevel] = React.useState(me.level);
  const [saved, setSaved] = React.useState(false);

  const save = () => { setSaved(true); setTimeout(() => go('settings'), 900); };

  const field = (label, value, set, opts = {}) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {opts.multiline ? (
        <textarea value={value} onChange={e => set(e.target.value)} style={{
          width: '100%', minHeight: 84, padding: '12px 14px', background: 'var(--card)', color: 'var(--ink)',
          border: '1px solid var(--hair)', borderRadius: 14, fontSize: 14, lineHeight: 1.5, fontFamily: 'inherit', resize: 'vertical', outline: 'none',
        }} />
      ) : (
        <input value={value} onChange={e => set(e.target.value)} type={opts.type || 'text'} style={{
          width: '100%', padding: '12px 14px', background: 'var(--card)', color: 'var(--ink)',
          border: '1px solid var(--hair)', borderRadius: 14, fontSize: 14, fontFamily: 'inherit', outline: 'none',
        }} />
      )}
    </div>
  );

  return (
    <div style={{ paddingBottom: 110 }}>
      <ScreenHeader title="Edit profile" onBack={() => go('settings')} />

      {/* Avatar editor */}
      <div style={{ padding: '0 20px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Avatar hue={me.hue} initials={me.initials} size={96} />
          <button className="tap" style={{ position: 'absolute', bottom: -2, right: -2, width: 34, height: 34, borderRadius: 999, border: '3px solid var(--bg)', background: 'var(--ink)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span className="ms" style={{ fontSize: 16 }}>photo_camera</span>
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>Tap to change photo</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <Card>
          {field('Display name', name, setName)}
          {field('Email', email, setEmail, { type: 'email' })}
          {field('About', bio, setBio, { multiline: true })}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>{T('level')}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['A1','A2','B1','B2','C1','C2'].map(lv => (
                <button key={lv} onClick={() => setLevel(lv)} className="tap" style={{
                  padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: '1px solid var(--hair)',
                  background: level === lv ? 'var(--ink)' : 'transparent',
                  color: level === lv ? 'var(--bg)' : 'var(--ink)',
                }}>{lv}</button>
              ))}
            </div>
          </div>
        </Card>

        <button onClick={save} className="tap" style={{
          width: '100%', marginTop: 16, border: 0, cursor: 'pointer',
          background: saved ? 'oklch(0.55 0.14 172)' : 'var(--ink)', color: saved ? '#fff' : 'var(--bg)',
          padding: '14px', borderRadius: 999, fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: 'all .2s var(--ease)',
        }}>
          <span className="ms fill" style={{ fontSize: 18 }}>{saved ? 'check' : 'save'}</span>
          {saved ? 'Saved' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

function PasswordResetScreen({ T, state, go }) {
  const [step, setStep] = React.useState(0); // 0=email, 1=code, 2=newpw, 3=done
  const [email, setEmail] = React.useState('lina.w@example.com');
  const [code, setCode] = React.useState(['','','','','','']);
  const [pw1, setPw1] = React.useState('');
  const [pw2, setPw2] = React.useState('');

  const strength = (p) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const st = strength(pw1);
  const match = pw1 && pw1 === pw2;

  const setCodeDigit = (i, v) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    const next = [...code]; next[i] = digit; setCode(next);
  };

  return (
    <div style={{ paddingBottom: 110 }}>
      <ScreenHeader title="Reset password" onBack={() => go('settings')} />

      {/* Steps indicator */}
      <div style={{ padding: '0 20px 22px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= step ? 'var(--accent)' : 'var(--hair)', transition: 'background .3s var(--ease)' }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 10 }}>
          Step {Math.min(step + 1, 4)} of 4
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {step === 0 && (
          <>
            <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6 }}>Where should we send the code?</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 22 }}>We'll email you a 6-digit confirmation code.</div>
            <Card>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6 }}>Email</div>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" style={{ width: '100%', padding: '12px 0', background: 'transparent', color: 'var(--ink)', border: 0, fontSize: 16, fontFamily: 'inherit', outline: 'none' }} />
            </Card>
            <button disabled={!email.includes('@')} onClick={() => setStep(1)} className="tap" style={{
              width: '100%', marginTop: 16, border: 0, cursor: email.includes('@') ? 'pointer' : 'not-allowed',
              background: email.includes('@') ? 'var(--ink)' : 'var(--hair-strong)',
              color: email.includes('@') ? 'var(--bg)' : 'var(--ink-3)',
              padding: '14px', borderRadius: 999, fontSize: 14, fontWeight: 600,
            }}>Send code</button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6 }}>Check your inbox.</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 22 }}>We sent a 6-digit code to <span style={{ color: 'var(--ink)' }}>{email}</span>.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 22 }}>
              {code.map((d, i) => (
                <input key={i} value={d} onChange={e => setCodeDigit(i, e.target.value)} maxLength={1} inputMode="numeric" style={{
                  width: 44, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 600,
                  border: `1.5px solid ${d ? 'var(--ink)' : 'var(--hair)'}`,
                  background: 'var(--card)', color: 'var(--ink)',
                  borderRadius: 12, outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color .2s var(--ease)',
                }} />
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-2)', marginBottom: 22 }}>
              Didn't get it? <span style={{ color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }}>Resend (0:42)</span>
            </div>
            <button disabled={code.join('').length < 6} onClick={() => setStep(2)} className="tap" style={{
              width: '100%', border: 0, cursor: code.join('').length < 6 ? 'not-allowed' : 'pointer',
              background: code.join('').length < 6 ? 'var(--hair-strong)' : 'var(--ink)',
              color: code.join('').length < 6 ? 'var(--ink-3)' : 'var(--bg)',
              padding: '14px', borderRadius: 999, fontSize: 14, fontWeight: 600,
            }}>Continue</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6 }}>Choose a new password.</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 22 }}>At least 8 characters with a number and a symbol.</div>
            <Card>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6 }}>New password</div>
              <input value={pw1} onChange={e=>setPw1(e.target.value)} type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 0', background: 'transparent', color: 'var(--ink)', border: 0, fontSize: 16, fontFamily: 'inherit', outline: 'none', marginBottom: 10 }} />
              {/* Strength meter */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i < st ? (st < 2 ? 'oklch(0.6 0.18 25)' : st < 3 ? 'oklch(0.7 0.14 75)' : 'oklch(0.55 0.14 172)') : 'var(--hair)', transition: 'background .2s var(--ease)' }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{st === 0 ? ' ' : st < 2 ? 'Too weak' : st < 3 ? 'Okay' : st < 4 ? 'Strong' : 'Very strong'}</div>

              <div style={{ height: 1, background: 'var(--hair)', margin: '14px 0' }} />

              <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6 }}>Confirm password</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input value={pw2} onChange={e=>setPw2(e.target.value)} type="password" placeholder="••••••••" style={{ flex: 1, padding: '10px 0', background: 'transparent', color: 'var(--ink)', border: 0, fontSize: 16, fontFamily: 'inherit', outline: 'none' }} />
                {pw2 && (
                  <span className="ms fill" style={{ fontSize: 18, color: match ? 'oklch(0.55 0.14 172)' : 'oklch(0.6 0.18 25)' }}>{match ? 'check_circle' : 'cancel'}</span>
                )}
              </div>
            </Card>
            <button disabled={!(match && st >= 3)} onClick={() => setStep(3)} className="tap" style={{
              width: '100%', marginTop: 16, border: 0, cursor: (match && st >= 3) ? 'pointer' : 'not-allowed',
              background: (match && st >= 3) ? 'var(--ink)' : 'var(--hair-strong)',
              color: (match && st >= 3) ? 'var(--bg)' : 'var(--ink-3)',
              padding: '14px', borderRadius: 999, fontSize: 14, fontWeight: 600,
            }}>Update password</button>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ width: 84, height: 84, borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', animation: 'scale-in .5s var(--spring)' }}>
              <span className="ms fill" style={{ fontSize: 42 }}>lock_reset</span>
            </div>
            <div className="serif" style={{ fontSize: 30, letterSpacing: '-0.02em', marginBottom: 6 }}>All set.</div>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 24, maxWidth: 260, margin: '0 auto 24px' }}>You can sign in with your new password from now on.</div>
            <button onClick={() => go('settings')} className="tap" style={{ border: 0, background: 'var(--ink)', color: 'var(--bg)', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Back to settings</button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { LessonLive, VocabReview, CalendarScreen, NotificationsScreen, SettingsScreen, ProfileEditScreen, PasswordResetScreen, ScreenHeader, CallBtn });
