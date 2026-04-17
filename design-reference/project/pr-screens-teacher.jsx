// Teacher screens for Parleyroom

function TeacherHome({ T, state, go, dark }) {
  const me = window.TEACHER_ME;
  const today = window.LESSONS.filter(l => l.date === window.TODAY_ISO);
  const requests = window.LESSONS.filter(l => l.status === 'request');
  const activeStudents = window.PEOPLE.filter(p => p.role === 'student');
  const live = today.find(l => l.status === 'in-progress');
  const isEmpty = !state.populated;

  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: '8px 20px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{T('good_morning')}</div>
          <div className="serif" style={{ fontSize: 38, lineHeight: 1.02, letterSpacing: '-0.02em' }}>
            {me.name.split(' ')[0]}<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
            {today.length} lessons · 1 pending
          </div>
        </div>
        <button className="tap" onClick={() => go('compose')} style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--ink)', color: 'var(--bg)', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <span className="ms" style={{ fontSize: 22 }}>add</span>
        </button>
      </div>

      {/* Live hero if any */}
      {live && !isEmpty && state.showLiveBanner && (
        <div style={{ padding: '0 20px 16px' }}>
          <Card onClick={() => go('lesson-live')} padded={false} style={{
            background: `linear-gradient(135deg, oklch(0.4 0.14 145) 0%, oklch(0.22 0.08 200) 100%)`,
            color: '#F2F1EC', border: 0, cursor: 'pointer', overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <Avatar hue={172} initials={window.PEOPLE.find(p=>p.id===(live.studentIds||[])[0])?.initials || '??'} size={48} />
                <span style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 999, background: 'oklch(0.7 0.2 145)', border: '2px solid oklch(0.3 0.1 180)', animation: 'pulse-dot 1.4s infinite' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'oklch(0.85 0.14 145)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>● Live · 12:34</div>
                <div className="serif" style={{ fontSize: 20, lineHeight: 1.1 }}>{live.topic}</div>
                <div style={{ fontSize: 12, color: 'rgba(242,241,236,0.65)', marginTop: 2 }}>{window.PEOPLE.find(p=>p.id===(live.studentIds||[])[0])?.name}</div>
              </div>
              <span className="ms" style={{ fontSize: 24, color: '#F2F1EC' }}>arrow_forward</span>
            </div>
          </Card>
        </div>
      )}

      {/* KPI strip */}
      {!isEmpty && (
        <div style={{ padding: '0 20px 22px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <StatChip icon="groups" value={activeStudents.length} label={T('active_students')} hue={172} />
          <StatChip icon="event" value={today.length} label={T('today')} hue={210} />
          <StatChip icon="schedule" value={requests.length} label={T('requests')} hue={25} />
          <StatChip icon="task_alt" value="14" label="pending hw" hue={290} />
        </div>
      )}

      {/* Requests band */}
      {!isEmpty && requests.length > 0 && (
        <Section eyebrow={T('requests')} title="Needs your answer">
          {requests.map(req => {
            const s = window.PEOPLE.find(p => p.id === (req.studentIds||[])[0]);
            return (
              <Card key={req.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <Avatar hue={s?.hue || 172} initials={s?.initials || '??'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{s?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{req.topic} · {T('today')} {req.time}</div>
                  </div>
                  <Pill tone="warn">{s?.level}</Pill>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="tap" style={{ flex: 1, border:0, background: 'var(--ink)', color: 'var(--bg)', padding: '10px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{T('accept')}</button>
                  <button className="tap" style={{ flex: 1, border:'1px solid var(--hair-strong)', background: 'transparent', color: 'var(--ink)', padding: '10px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{T('reject')}</button>
                </div>
              </Card>
            );
          })}
        </Section>
      )}

      {/* Today's lessons timeline */}
      {!isEmpty && (
        <Section eyebrow={T('today')} title="Your timeline" action={<button onClick={()=>go('calendar')} className="tap" style={{ border:0, background:'transparent', color:'var(--ink)', fontSize:12, fontWeight:600, cursor:'pointer' }}>See all →</button>}>
          <Card padded={false}>
            {today.map((l, i) => {
              const s = window.PEOPLE.find(p => p.id === (l.studentIds||[])[0]);
              const isClub = l.type !== 'one-on-one';
              return (
                <div key={l.id} onClick={() => go('lesson-live')} style={{ padding: '14px 18px', borderBottom: i < today.length - 1 ? '1px solid var(--hair)' : 0, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width: 42 }}>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.03em' }}>{l.time}</div>
                    <div style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{l.duration}m</div>
                  </div>
                  <div style={{ width: 2, height: 32, background: l.status === 'in-progress' ? 'oklch(0.7 0.2 145)' : 'var(--hair-strong)', borderRadius: 999 }} />
                  {isClub ? (
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'oklch(0.94 0.04 290)', color: 'oklch(0.4 0.12 290)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>
                      {l.type === 'speaking-club' ? 'SC' : 'RC'}
                    </div>
                  ) : (
                    <Avatar hue={s?.hue || 172} initials={s?.initials || '??'} size={36} live={l.status === 'in-progress'} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isClub ? l.topic : s?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isClub ? `${(l.studentIds||[]).length}${l.maxParticipants ? '/'+l.maxParticipants : ''} · ${l.topic}` : l.topic}</div>
                  </div>
                  {l.status === 'in-progress' && <Pill tone="live"><span className="live-dot"/>{T('live')}</Pill>}
                </div>
              );
            })}
          </Card>
        </Section>
      )}

      {/* Students glimpse */}
      {!isEmpty && (
        <Section eyebrow={T('students')} title="At a glance" action={<button onClick={()=>go('students')} className="tap" style={{ border:0, background:'transparent', color:'var(--ink)', fontSize:12, fontWeight:600, cursor:'pointer' }}>All →</button>}>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 2px 10px', margin: '0 -20px', paddingLeft: 20, paddingRight: 20 }} className="no-scrollbar">
            {activeStudents.slice(0, 6).map(s => {
              const st = window.STATS_BY_USER[s.id] || {streak:0, progress:0};
              return (
              <Card key={s.id} onClick={() => go('student-profile')} padded={false} style={{ minWidth: 140, padding: '14px 14px 16px', cursor: 'pointer', flexShrink: 0 }}>
                <Avatar hue={s.hue} initials={s.initials} size={38} />
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 8 }}>{s.level} · {st.streak}d streak</div>
                <div style={{ height: 3, background: 'var(--hair)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${st.progress}%`, height: '100%', background: `oklch(0.6 0.14 ${s.hue})`, borderRadius: 999 }} />
                </div>
              </Card>
            );})}
          </div>
        </Section>
      )}

      {isEmpty && (
        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✺</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>A quiet day</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>No lessons scheduled. Create one to get started.</div>
        </div>
      )}
    </div>
  );
}

function TeacherStudents({ T, state, go }) {
  const students = window.PEOPLE.filter(p => p.role === 'student');
  const [q, setQ] = React.useState('');
  const filtered = students.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{T('students')}</div>
        <div className="serif" style={{ fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.02em' }}>{students.length} learners<span style={{ color: 'var(--accent)' }}>.</span></div>
      </div>

      {/* Search */}
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--card)', border: '1px solid var(--hair)', borderRadius: 999, padding: '10px 16px' }}>
          <span className="ms" style={{ fontSize: 18, color: 'var(--ink-3)' }}>search</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search students" style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 14, color: 'var(--ink)', fontFamily: 'inherit' }} />
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <Card padded={false}>
          {filtered.map((s, i) => {
            const st = window.STATS_BY_USER[s.id] || {streak:0, progress:0};
            return (
            <div key={s.id} onClick={() => go('student-profile')} style={{ padding: '14px 18px', borderBottom: i < filtered.length - 1 ? '1px solid var(--hair)' : 0, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
              <Avatar hue={s.hue} initials={s.initials} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{s.level} · {st.streak}d streak</div>
              </div>
              <div style={{ width: 80, height: 4, background: 'var(--hair)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${st.progress}%`, height: '100%', background: `oklch(0.6 0.14 ${s.hue})`, borderRadius: 999 }} />
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', minWidth: 28, textAlign: 'right' }}>{st.progress}%</div>
            </div>
          );})}
        </Card>
      </div>
    </div>
  );
}

function TeacherStudentProfile({ T, state, go }) {
  const s = window.PEOPLE[0]; // Lina
  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: '8px 20px 0' }}>
        <button onClick={() => go('students')} className="tap" style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--card)', border: '1px solid var(--hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span className="ms" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
      </div>
      <div style={{ padding: '16px 20px 20px', textAlign: 'center' }}>
        <Avatar hue={s.hue} initials={s.initials} size={88} />
        <div className="serif" style={{ fontSize: 28, marginTop: 12, letterSpacing: '-0.02em' }}>{s.name}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>{s.level} · joined Mar 2026</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
          <button className="tap" style={{ border: 0, background: 'var(--ink)', color: 'var(--bg)', padding: '9px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', display:'inline-flex', gap:6, alignItems:'center' }}>
            <span className="ms" style={{ fontSize: 16 }}>add</span> {T('add_lesson')}
          </button>
          <button className="tap" style={{ border: '1px solid var(--hair-strong)', background: 'transparent', color: 'var(--ink)', padding: '9px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', display:'inline-flex', gap:6, alignItems:'center' }}>
            <span className="ms" style={{ fontSize: 16 }}>chat</span> Message
          </button>
        </div>
      </div>

      {/* Stat grid */}
      <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        <Card padded={false} style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>18</div>
          <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lessons</div>
        </Card>
        <Card padded={false} style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>143</div>
          <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Words</div>
        </Card>
        <Card padded={false} style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'oklch(0.55 0.18 25)' }}>{(window.STATS_BY_USER[s.id]||{}).streak || 0}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Streak</div>
        </Card>
      </div>

      {/* Mini sparkline/progress */}
      <Section eyebrow="Overall progress" title="Confidence by skill">
        <Card>
          {[
            { label: 'Speaking',  v: 78 },
            { label: 'Listening', v: 82 },
            { label: 'Grammar',   v: 54 },
            { label: 'Vocabulary',v: 68 },
          ].map((r,i) => (
            <div key={r.label} style={{ marginTop: i===0?0:12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.v}</div>
              </div>
              <div style={{ height: 4, background: 'var(--hair)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${r.v}%`, height: '100%', background: `oklch(0.62 0.14 ${172 + i*30})`, borderRadius: 999, transition: 'width .6s var(--ease)' }} />
              </div>
            </div>
          ))}
        </Card>
      </Section>

      <Section eyebrow="Upcoming" title="Next lessons">
        {window.LESSONS.filter(l => (l.studentIds||[]).includes(s.id)).slice(0, 2).map(l => <LessonRow key={l.id} lesson={l} T={T} go={go} />)}
      </Section>
    </div>
  );
}

Object.assign(window, { TeacherHome, TeacherStudents, TeacherStudentProfile });
