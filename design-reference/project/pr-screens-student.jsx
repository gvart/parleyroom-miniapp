// Student screens for Parleyroom

function StudentHome({ T, state, go, dark }) {
  const me = window.STUDENT_ME;
  const myStats = window.STATS_BY_USER[me.id] || { streak: 0, progress: 0 };
  const nextLesson = window.LESSONS.find(l => (l.studentIds||[]).includes(me.id) && (l.status === 'confirmed' || l.status === 'in-progress'));
  const hw = window.HOMEWORK.filter(h => h.studentId === me.id);
  const computeDue = (dueDate) => {
    if (!dueDate) return 'soon';
    if (dueDate < window.TODAY_ISO) return 'overdue';
    if (dueDate === window.TODAY_ISO) return 'today';
    if (dueDate === window.TOMORROW_ISO) return 'tomorrow';
    return dueDate.slice(5); // MM-DD
  };
  const dueHw = hw.filter(h => h.status !== 'done' && h.status !== 'rejected').slice(0, 3);
  const reviewCount = window.VOCAB.filter(v => v.status === 'review').length;
  const isLive = nextLesson && nextLesson.status === 'in-progress' && state.showLiveBanner;
  const isEmpty = !state.populated;

  return (
    <div style={{ paddingBottom: 110 }}>
      {/* Greeting */}
      <div style={{ padding: '8px 20px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{T('good_morning')}</div>
          <div className="serif" style={{ fontSize: 38, lineHeight: 1.02, letterSpacing: '-0.02em' }}>
            {me.name.split(' ')[0]}<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
        </div>
        <button className="tap" onClick={() => go('notifications')} style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--card)', border: '1px solid var(--hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <span className="ms" style={{ fontSize: 22, color: 'var(--ink)' }}>notifications</span>
          <span style={{ position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 999, background: 'oklch(0.68 0.19 25)', border: '2px solid var(--card)' }} />
        </button>
      </div>

      {/* Hero — next lesson live card */}
      {nextLesson && !isEmpty ? (
        <div style={{ padding: '0 20px 20px' }}>
          <Card padded={false} style={{
            background: isLive
              ? `linear-gradient(135deg, oklch(0.42 0.12 ${dark ? 200 : 172}) 0%, oklch(0.28 0.10 ${dark ? 240 : 200}) 100%)`
              : `linear-gradient(135deg, var(--ink) 0%, oklch(0.18 0.03 ${dark ? 200 : 172}) 100%)`,
            color: '#F2F1EC', border: 0, overflow: 'hidden', position: 'relative',
          }}>
            {/* subtle orbit decoration */}
            <div style={{ position:'absolute', right: -60, top: -60, width: 220, height: 220, borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
            <div style={{ position:'absolute', right: -20, top: -20, width: 140, height: 140, borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', pointerEvents: 'none' }} />
            <div style={{ position:'absolute', right: 30, top: 30, width: 56, height: 56, borderRadius: 999, background: `radial-gradient(circle at 30% 25%, oklch(0.88 0.15 ${isLive ? 145 : 172}), oklch(0.55 0.16 ${isLive ? 145 : 172}))`, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} />

            <div style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontSize: 11, color: 'rgba(242,241,236,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
                {isLive && <span className="live-dot" />}
                {isLive ? T('room_live') : T('next_lesson')}
              </div>
              <div className="serif" style={{ fontSize: 26, lineHeight: 1.12, letterSpacing: '-0.015em', maxWidth: 240, marginBottom: 6 }}>
                {nextLesson.topic}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(242,241,236,0.6)', marginBottom: 22, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span>{T('today')} · {nextLesson.time}</span>
                <span style={{ width: 3, height: 3, borderRadius: 999, background: 'currentColor' }} />
                <span>Helena K.</span>
              </div>

              <button className="tap" onClick={() => go('lesson-live')} style={{
                border: 0, cursor: 'pointer',
                background: isLive ? 'oklch(0.7 0.2 145)' : '#F2F1EC',
                color: isLive ? '#0D0D0C' : '#0D0D0C',
                padding: '12px 18px', borderRadius: 999, fontSize: 14, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                <span className="ms fill" style={{ fontSize: 18 }}>{isLive ? 'videocam' : 'play_arrow'}</span>
                {isLive ? T('join_now') : T('start_lesson')}
              </button>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Empty state for next-lesson slot */}
      {(!nextLesson || isEmpty) && (
        <div style={{ padding: '0 20px 20px' }}>
          <Card style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>✺</div>
            <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>{T('empty_lessons_title')}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 14 }}>{T('empty_lessons_sub')}</div>
            <button className="tap" onClick={() => go('calendar')} style={{ border: 0, background: 'var(--ink)', color: 'var(--bg)', padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor:'pointer' }}>{T('book')}</button>
          </Card>
        </div>
      )}

      {/* Quick stats row */}
      {!isEmpty && (
        <div style={{ padding: '0 20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <StatChip icon="local_fire_department" value={myStats.streak} label={T('streak')} hue={25} />
          <StatChip icon="menu_book" value={window.VOCAB.filter(v => v.status !== 'new').length} label={T('words_learned')} hue={290} />
          <StatChip icon="check_circle" value={hw.filter(h=>h.status==='done').length} label={T('lessons_done')} hue={172} />
        </div>
      )}

      {/* Vocab review */}
      {!isEmpty && reviewCount > 0 && (
        <Section eyebrow={T('practice')} title={T('review_due')} action={<button className="tap" onClick={() => go('vocab-review')} style={{ border:0, background:'transparent', color:'var(--ink)', fontSize:12, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4 }}>{T('open')}<span className="ms" style={{fontSize:14}}>arrow_forward</span></button>}>
          <Card onClick={() => go('vocab-review')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--card) 65%)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Ring value={(reviewCount / window.VOCAB.length) * 100} size={54} label={reviewCount} hue="var(--accent-h)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-title)', fontWeight: 600, marginBottom: 2 }}>{reviewCount} words ready</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>~4 minutes of spaced repetition</div>
              </div>
              <span className="ms" style={{ fontSize: 22, color: 'var(--ink-3)' }}>chevron_right</span>
            </div>
          </Card>
        </Section>
      )}

      {/* Homework */}
      {!isEmpty && dueHw.length > 0 && (
        <Section eyebrow={T('homework')} title={`${dueHw.length} ${dueHw.length === 1 ? 'task' : 'tasks'} open`} action={<button onClick={() => go('lessons')} className="tap" style={{ border:0, background:'transparent', color:'var(--ink)', fontSize:12, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4 }}>{T('open')}<span className="ms" style={{fontSize:14}}>arrow_forward</span></button>}>
          <Card padded={false}>
            {dueHw.map((h, i) => {
              const due = computeDue(h.dueDate);
              const tone = due === 'overdue' ? 'live' : due === 'today' ? 'warn' : 'neutral';
              const label = due === 'overdue' ? T('overdue') : due === 'today' ? T('today') : due === 'tomorrow' ? T('tomorrow') : due;
              return (
              <div key={h.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 18px', borderBottom: i < dueHw.length-1 ? '1px solid var(--hair)' : 0 }}>
                <CategoryDot cat={h.category} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.title}</div>
                  <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                    <Pill tone={tone}>{label}</Pill>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'capitalize' }}>{h.status === 'in-review' ? T('in_review') : h.status === 'submitted' ? T('submitted') : h.category}</div>
                  </div>
                </div>
              </div>
            );})}
          </Card>
        </Section>
      )}

      {/* Goals */}
      {!isEmpty && state.showGoals && (
        <Section eyebrow={T('goals')} title="Your rhythm">
          <Card>
            {window.GOALS.map((g, i) => (
              <div key={g.id} style={{ marginTop: i === 0 ? 0 : 14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{g.description}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{g.progress}%</div>
                </div>
                <div style={{ height: 4, background: 'var(--hair)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${g.progress}%`, height: '100%',
                    background: `linear-gradient(90deg, oklch(0.72 0.14 ${i===0?172:i===1?290:75}), oklch(0.55 0.14 ${i===0?172:i===1?290:75}))`,
                    borderRadius: 999, transition: 'width .8s var(--ease)' }} />
                </div>
              </div>
            ))}
          </Card>
        </Section>
      )}

      {/* Promo */}
      {!isEmpty && state.showPromo && (
        <Section>
          <Card style={{ background: 'var(--ink)', color: 'var(--bg)', border: 0, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position:'absolute', right:-30, bottom:-30, width: 160, height: 160, borderRadius: 999, background:'var(--accent)', opacity: .25, filter:'blur(20px)' }} />
            <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing:'0.12em', fontWeight: 600, marginBottom: 8 }}>Speaking Club · Sa 18:00</div>
            <div className="serif" style={{ fontSize: 22, lineHeight: 1.15, maxWidth: 220, marginBottom: 16, position:'relative' }}>Über Kunst & Kaffee auf Deutsch.</div>
            <button className="tap" onClick={() => go('lessons')} style={{ border:0, background:'var(--bg)', color:'var(--ink)', padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor:'pointer', position:'relative' }}>Join the list →</button>
          </Card>
        </Section>
      )}
    </div>
  );
}

function StatChip({ icon, value, label, hue }) {
  return (
    <Card padded={false} style={{ padding: '12px 12px 11px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span className="ms fill" style={{ fontSize: 14, color: `oklch(0.55 0.14 ${hue})` }}>{icon}</span>
        <div className="mono" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>{value}</div>
      </div>
      <div style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.03em', lineHeight: 1.2 }}>{label}</div>
    </Card>
  );
}

function CategoryDot({ cat }) {
  const map = {
    writing:  { bg: 'oklch(0.94 0.05 290)', fg: 'oklch(0.5 0.13 290)', icon: 'edit' },
    reading:  { bg: 'oklch(0.94 0.05 75)', fg: 'oklch(0.48 0.13 75)', icon: 'menu_book' },
    grammar:  { bg: 'oklch(0.94 0.04 172)', fg: 'oklch(0.45 0.11 172)', icon: 'school' },
    vocabulary: { bg: 'oklch(0.94 0.05 210)', fg: 'oklch(0.5 0.13 210)', icon: 'dictionary' },
    listening: { bg: 'oklch(0.94 0.05 25)', fg: 'oklch(0.55 0.15 25)', icon: 'headphones' },
  };
  const c = map[cat] || map.writing;
  return (
    <div style={{ width: 34, height: 34, borderRadius: 10, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span className="ms" style={{ fontSize: 18 }}>{c.icon}</span>
    </div>
  );
}

function StudentVocabList({ T, state, go }) {
  const [filter, setFilter] = React.useState('all');
  const filters = [
    { k: 'all', l: T('all') },
    { k: 'new', l: T('new') },
    { k: 'review', l: T('review') },
    { k: 'learned', l: T('learned') },
  ];
  const words = window.VOCAB.filter(v => filter === 'all' || v.status === filter);
  const isEmpty = !state.populated;

  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: '8px 20px 18px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{T('vocab')}</div>
        <div className="serif" style={{ fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.02em' }}>Your glossary<span style={{ color: 'var(--accent)' }}>.</span></div>
      </div>

      {/* Stats ring band */}
      {!isEmpty && (
        <div style={{ padding: '0 20px 18px' }}>
          <Card style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <Ring value={(window.VOCAB.filter(v=>v.status==='learned').length / window.VOCAB.length) * 100} size={72} hue="var(--accent-h)" label={`${Math.round((window.VOCAB.filter(v=>v.status==='learned').length / window.VOCAB.length) * 100)}%`} sublabel="learned" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 18 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{window.VOCAB.length}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>total</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'oklch(0.5 0.14 25)' }}>{window.VOCAB.filter(v=>v.status==='review').length}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>due review</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>3</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>new this wk</div>
                </div>
              </div>
              <button onClick={() => go('vocab-review')} className="tap" style={{ marginTop: 10, border:0, background:'var(--ink)', color:'var(--bg)', padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor:'pointer' }}>Start review →</button>
            </div>
          </Card>
        </div>
      )}

      {/* Filter segmented */}
      {!isEmpty && (
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }} className="no-scrollbar">
            {filters.map(f => (
              <button key={f.k} onClick={() => setFilter(f.k)} className="tap" style={{
                padding: '8px 14px', borderRadius: 999, border: '1px solid var(--hair)',
                background: filter === f.k ? 'var(--ink)' : 'transparent',
                color: filter === f.k ? 'var(--bg)' : 'var(--ink-2)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{f.l}</button>
            ))}
          </div>
        </div>
      )}

      {/* Word list */}
      {!isEmpty ? (
        <div style={{ padding: '0 20px' }}>
          <Card padded={false}>
            {words.map((w, i) => (
              <div key={w.id} style={{ padding: '14px 18px', borderBottom: i < words.length-1 ? '1px solid var(--hair)' : 0, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="serif" style={{ fontSize: 22, lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: 2 }}>{w.german}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{w.english}</div>
                  {w.exampleSentence && (
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic', marginTop: 4, lineHeight: 1.4 }}>“{w.exampleSentence}”</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <Pill tone={w.status === 'new' ? 'accent' : w.status === 'review' ? 'warn' : 'neutral'}>
                    {T(w.status === 'new' ? 'new' : w.status === 'review' ? 'review' : 'learned')}
                  </Pill>
                  <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>{w.category} · {w.addedDate.slice(5)}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      ) : (
        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>◌</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>{T('empty_vocab_title')}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{T('empty_vocab_sub')}</div>
        </div>
      )}
    </div>
  );
}

function StudentLessons({ T, state, go }) {
  const me = window.STUDENT_ME;
  const myLessons = window.LESSONS.filter(l =>
    (l.studentIds || []).includes(me.id) || l.type !== 'one-on-one'
  );
  const grouped = { today: [], tomorrow: [], upcoming: [] };
  myLessons.forEach(l => {
    if (l.date === window.TODAY_ISO) grouped.today.push(l);
    else if (l.date === window.TOMORROW_ISO) grouped.tomorrow.push(l);
    else grouped.upcoming.push(l);
  });
  // sort each bucket by time
  Object.values(grouped).forEach(arr => arr.sort((a,b) => (a.time||'').localeCompare(b.time||'')));

  return (
    <div style={{ paddingBottom: 110, position: 'relative' }}>
      <div style={{ padding: '8px 20px 18px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{T('lessons')}</div>
        <div className="serif" style={{ fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.02em' }}>Your schedule<span style={{ color: 'var(--accent)' }}>.</span></div>
      </div>

      {state.populated ? (
        <>
          {['today','tomorrow','upcoming'].map(k => grouped[k].length > 0 && (
            <Section key={k} eyebrow={k === 'today' ? T('today') : k === 'tomorrow' ? T('tomorrow') : T('next_up')}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {grouped[k].map(l => <LessonRow key={l.id} lesson={l} T={T} go={go} />)}
              </div>
            </Section>
          ))}

          {/* Inline "book more" card after the list */}
          <div style={{ padding: '6px 20px 0' }}>
            <button
              onClick={() => go('calendar')}
              className="tap"
              style={{
                width: '100%', border: '1px dashed var(--hair-2)', background: 'transparent',
                borderRadius: 20, padding: '18px 16px', color: 'var(--ink-2)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
              }}>
              <span className="ms" style={{ fontSize: 22, color: 'var(--accent)' }}>add_circle</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{T('book')}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Pick a time with Helena or join a club</div>
              </div>
              <span className="ms" style={{ fontSize: 18, color: 'var(--ink-3)' }}>chevron_right</span>
            </button>
          </div>
        </>
      ) : (
        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✺</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>{T('empty_lessons_title')}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>{T('empty_lessons_sub')}</div>
          <button onClick={() => go('calendar')} className="tap" style={{ border:0, background:'var(--ink)', color:'var(--bg)', padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor:'pointer' }}>{T('book')}</button>
        </div>
      )}

      {/* Floating Book FAB — always visible when populated */}
      {state.populated && (
        <button
          onClick={() => go('calendar')}
          className="tap"
          aria-label={T('book')}
          style={{
            position: 'absolute', right: 18, bottom: 92,
            height: 52, padding: '0 18px 0 14px', borderRadius: 26,
            background: 'var(--ink)', color: 'var(--bg)', border: 0,
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em',
            boxShadow: '0 12px 28px -10px oklch(0.25 0.05 220 / 0.45), 0 2px 6px rgba(0,0,0,0.08)',
            cursor: 'pointer', zIndex: 5,
          }}>
          <span className="ms" style={{ fontSize: 20 }}>add</span>
          {T('book')}
        </button>
      )}
    </div>
  );
}

function LessonRow({ lesson, T, go }) {
  const teacher = window.PEOPLE.find(p => p.id === lesson.teacherId);
  const isLive = lesson.status === 'in-progress';
  const isRequest = lesson.status === 'request';
  const isClub = lesson.type !== 'one-on-one';
  const participants = (lesson.studentIds || []).length;
  const capacity = lesson.maxParticipants || null;
  return (
    <Card onClick={() => go('lesson-live')} style={{ cursor: 'pointer', position: 'relative' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, gap: 2 }}>
          <div className="mono" style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.04em' }}>{lesson.time.split(':')[0]}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>:{lesson.time.split(':')[1]}</div>
        </div>
        <div style={{ width: 1, height: 38, background: 'var(--hair)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
            {isLive && <Pill tone="live"><span className="live-dot" />{T('live')}</Pill>}
            {isRequest && <Pill tone="warn">Pending</Pill>}
            {isClub && <Pill tone="violet">{lesson.type === 'speaking-club' ? 'Speaking' : 'Reading'} Club</Pill>}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.topic || lesson.title}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
            {isClub
              ? `${participants}${capacity ? '/'+capacity : ''} · ${lesson.level} · ${lesson.duration}m`
              : `${teacher?.name.split(' ')[0]} · ${lesson.level} · ${lesson.duration}m`}
          </div>
        </div>
        <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }}>chevron_right</span>
      </div>
    </Card>
  );
}

Object.assign(window, { StudentHome, StudentVocabList, StudentLessons, StatChip, CategoryDot, LessonRow });
