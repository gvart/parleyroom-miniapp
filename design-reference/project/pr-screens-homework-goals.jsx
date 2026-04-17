// Homework + Goals screens for Parleyroom

function StudentHomework({ T, state, go }) {
  const me = window.STUDENT_ME;
  const hw = window.HOMEWORK.filter(h => h.studentId === me.id);
  const [openTask, setOpenTask] = React.useState(null);
  const [tab, setTab] = React.useState('open');

  const groups = {
    open: hw.filter(h => h.status === 'open'),
    review: hw.filter(h => h.status === 'submitted' || h.status === 'in-review' || h.status === 'rejected'),
    done: hw.filter(h => h.status === 'done'),
  };
  const computeDue = (dueDate) => {
    if (!dueDate) return { key: 'soon', label: 'soon' };
    if (dueDate < window.TODAY_ISO) return { key: 'overdue' };
    if (dueDate === window.TODAY_ISO) return { key: 'today' };
    if (dueDate === window.TOMORROW_ISO) return { key: 'tomorrow', label: 'tomorrow' };
    return { key: 'date', label: dueDate.slice(5) };
  };
  const list = groups[tab];
  const isEmpty = !state.populated;

  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{T('homework')}</div>
        <div className="serif" style={{ fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.02em' }}>Tasks<span style={{ color: 'var(--accent)' }}>.</span></div>
      </div>

      {/* Summary band */}
      {!isEmpty && (
        <div style={{ padding: '0 20px 18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <StatChip icon="pending_actions" value={groups.open.length} label="open" hue={25} />
          <StatChip icon="rate_review" value={groups.review.length} label="reviewed" hue={210} />
          <StatChip icon="task_alt" value={groups.done.length} label="done" hue={172} />
        </div>
      )}

      {/* Tabs */}
      {!isEmpty && (
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['open','Open'],['review','Reviewed'],['done','Done']].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)} className="tap" style={{
                flex: 1, padding: '9px 10px', borderRadius: 999,
                border: '1px solid var(--hair)',
                background: tab === k ? 'var(--ink)' : 'transparent',
                color: tab === k ? 'var(--bg)' : 'var(--ink-2)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>{l} · {groups[k].length}</button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {!isEmpty ? (
        list.length > 0 ? (
          <div style={{ padding: '0 20px' }}>
            <Card padded={false}>
              {list.map((h, i) => {
                const due = computeDue(h.dueDate);
                const tone = due.key === 'overdue' ? 'live' : due.key === 'today' ? 'warn' : 'neutral';
                const pillLabel = due.key === 'overdue' ? T('overdue') : due.key === 'today' ? T('today') : `${T('due')} ${due.label}`;
                const statusLabel = h.status === 'submitted' ? T('submitted') : h.status === 'in-review' ? T('in_review') : h.status === 'rejected' ? T('rejected') : h.status === 'done' ? T('done') : h.category;
                return (
                <div key={h.id} onClick={() => setOpenTask(h)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 18px', borderBottom: i < list.length-1 ? '1px solid var(--hair)' : 0, cursor: 'pointer' }}>
                  <CategoryDot cat={h.category} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{h.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Pill tone={tone}>{pillLabel}</Pill>
                      <span style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'capitalize' }}>· {statusLabel}</span>
                    </div>
                  </div>
                  <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }}>chevron_right</span>
                </div>
              );})}
            </Card>
          </div>
        ) : (
          <div style={{ padding: '40px 30px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✓</div>
            <div className="serif" style={{ fontSize: 20, marginBottom: 4 }}>All caught up</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Nothing in this stack.</div>
          </div>
        )
      ) : (
        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>◌</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>No tasks assigned</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Your teacher will send tasks after your next lesson.</div>
        </div>
      )}

      <HomeworkSubmitSheet open={!!openTask} task={openTask} onClose={() => setOpenTask(null)} T={T} state={state} />
    </div>
  );
}

function HomeworkSubmitSheet({ open, task, onClose, T, state }) {
  const [text, setText] = React.useState('');
  const [attached, setAttached] = React.useState([]);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => { if (open) { setText(''); setAttached([]); setSubmitted(false); } }, [open, task]);

  if (!task) return null;

  const addFile = (kind) => {
    setAttached(prev => [...prev, { id: Date.now(), kind, name: kind === 'audio' ? `Recording ${prev.length+1}.m4a` : kind === 'image' ? `Photo ${prev.length+1}.jpg` : `Draft ${prev.length+1}.pdf`, size: kind === 'audio' ? '0:47' : '1.2 MB' }]);
  };

  const submit = () => { setSubmitted(true); setTimeout(onClose, 1400); };

  return (
    <Sheet open={open} onClose={onClose} dark={state.dark}>
      <div style={{ padding: '0 22px 10px' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '36px 10px' }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', animation: 'scale-in .4s var(--spring)' }}>
              <span className="ms fill" style={{ fontSize: 36 }}>check</span>
            </div>
            <div className="serif" style={{ fontSize: 26, marginBottom: 4 }}>Submitted</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Helena will review in the next 24 hours</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 18 }}>
              <CategoryDot cat={task.category} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 3 }}>{task.category}{task.dueDate ? ` · ${task.dueDate < window.TODAY_ISO ? T('overdue') : task.dueDate === window.TODAY_ISO ? T('today') : `${T('due')} ${task.dueDate.slice(5)}`}` : ''}</div>
                <div className="serif" style={{ fontSize: 24, lineHeight: 1.15, letterSpacing: '-0.01em' }}>{task.title}</div>
              </div>
            </div>

            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 16, padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 12 }}>
              {task.description || '—'}
            </div>

            <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>{T('notes')}</div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Schreibe hier…"
              style={{
                width: '100%', minHeight: 110, padding: '12px 14px',
                background: 'var(--card)', color: 'var(--ink)',
                border: '1px solid var(--hair)', borderRadius: 14,
                fontSize: 14, lineHeight: 1.5, fontFamily: 'inherit',
                resize: 'vertical', outline: 'none', marginBottom: 10,
              }}
            />
            <div style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right', marginBottom: 18 }}>{text.trim().split(/\s+/).filter(Boolean).length} / 200 words</div>

            {attached.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {attached.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 12, marginBottom: 6 }}>
                    <span className="ms" style={{ fontSize: 20, color: 'var(--accent-deep)' }}>{a.kind === 'audio' ? 'graphic_eq' : a.kind === 'image' ? 'image' : 'description'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{a.size}</div>
                    </div>
                    <button onClick={() => setAttached(prev => prev.filter(x => x.id !== a.id))} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--ink-3)' }}>
                      <span className="ms" style={{ fontSize: 18 }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              <AttachBtn icon="mic" label="Record" onClick={() => addFile('audio')} />
              <AttachBtn icon="add_photo_alternate" label="Photo" onClick={() => addFile('image')} />
              <AttachBtn icon="attach_file" label="File" onClick={() => addFile('file')} />
            </div>

            <button onClick={submit} disabled={!text.trim() && attached.length === 0} className="tap" style={{
              width: '100%', border: 0, cursor: 'pointer',
              background: (!text.trim() && attached.length === 0) ? 'var(--hair-strong)' : 'var(--ink)',
              color: (!text.trim() && attached.length === 0) ? 'var(--ink-3)' : 'var(--bg)',
              padding: '14px', borderRadius: 999, fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <span className="ms fill" style={{ fontSize: 18 }}>send</span>
              {T('ok_submit')}
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}

function AttachBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="tap" style={{ flex: 1, border: '1px solid var(--hair)', background: 'var(--card)', color: 'var(--ink)', padding: '12px 8px', borderRadius: 14, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span className="ms" style={{ fontSize: 20, color: 'var(--accent-deep)' }}>{icon}</span>
      {label}
    </button>
  );
}

function StudentGoals({ T, state, go }) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const isEmpty = !state.populated;
  const goals = window.GOALS;

  // Weekly stripe: last 7 days of practice minutes
  const week = [28, 42, 15, 55, 34, 0, 25];

  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: '8px 20px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{T('goals')}</div>
          <div className="serif" style={{ fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.02em' }}>Your rhythm<span style={{ color: 'var(--accent)' }}>.</span></div>
        </div>
        <button onClick={() => setSheetOpen(true)} className="tap" style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--ink)', color: 'var(--bg)', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span className="ms" style={{ fontSize: 20 }}>add</span>
        </button>
      </div>

      {!isEmpty ? (
        <>
          {/* Weekly chart */}
          <div style={{ padding: '0 20px 18px' }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{T('this_week')}</div>
                  <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 2 }}>{week.reduce((a,b)=>a+b,0)} <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>min practiced</span></div>
                </div>
                <Pill tone="accent">+24% vs last</Pill>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                {week.map((v, i) => {
                  const max = Math.max(...week, 1);
                  const h = (v / max) * 100;
                  const isToday = i === 4;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{
                          width: '100%',
                          height: `${Math.max(h, 4)}%`,
                          background: isToday ? 'var(--accent)' : (v === 0 ? 'var(--hair)' : 'linear-gradient(180deg, var(--ink) 0%, oklch(0.35 0.04 var(--accent-h)) 100%)'),
                          borderRadius: 8,
                          transition: 'height .6s var(--ease)',
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: isToday ? 'var(--accent-deep)' : 'var(--ink-3)', fontWeight: isToday ? 700 : 500 }}>
                        {['M','T','W','T','F','S','S'][i]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Goal cards */}
          <Section eyebrow="Active goals">
            {goals.map((g, i) => {
              const hue = [172, 290, 75][i] || 172;
              return (
                <Card key={g.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <Ring value={g.progress} size={58} stroke={5} hue={hue} label={`${g.progress}%`} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{g.description}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                        Set by {g.setBy} · target {g.targetDate.slice(5)}
                      </div>
                    </div>
                    <button className="tap" style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--bg-2)', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <span className="ms" style={{ fontSize: 16, color: 'var(--ink-2)' }}>more_horiz</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </Section>

          {/* Streak card */}
          <Section eyebrow="Streak">
            <Card style={{ background: 'linear-gradient(135deg, oklch(0.95 0.07 25) 0%, var(--card) 70%)', border: 0 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 58, height: 58, borderRadius: 16, background: 'oklch(0.55 0.18 25)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px oklch(0.55 0.18 25 / 0.35)' }}>
                  <span className="ms fill" style={{ fontSize: 28 }}>local_fire_department</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>12 days</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 3 }}>Your longest streak is 27 days</div>
                </div>
              </div>
            </Card>
          </Section>
        </>
      ) : (
        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>◌</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>Set your first goal</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>Small daily targets build momentum.</div>
          <button onClick={() => setSheetOpen(true)} className="tap" style={{ border: 0, background: 'var(--ink)', color: 'var(--bg)', padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{T('set_goal')}</button>
        </div>
      )}

      <GoalSheet open={sheetOpen} onClose={() => setSheetOpen(false)} T={T} state={state} />
    </div>
  );
}

function GoalSheet({ open, onClose, T, state }) {
  const [type, setType] = React.useState('speak');
  const [target, setTarget] = React.useState(30);
  const options = [
    { k: 'speak', icon: 'mic', label: 'Speak daily', unit: 'min' },
    { k: 'words', icon: 'menu_book', label: 'Learn new words', unit: 'words/wk' },
    { k: 'read',  icon: 'auto_stories', label: 'Read tasks', unit: 'tasks/wk' },
    { k: 'lesson',icon: 'videocam', label: 'Take lessons', unit: 'per wk' },
  ];

  return (
    <Sheet open={open} onClose={onClose} dark={state.dark}>
      <div style={{ padding: '0 22px 10px' }}>
        <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 4 }}>New goal</div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 18 }}>Pick a shape that fits your week.</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22 }}>
          {options.map(o => (
            <button key={o.k} onClick={() => setType(o.k)} className="tap" style={{
              border: `1.5px solid ${type === o.k ? 'var(--ink)' : 'var(--hair)'}`,
              background: type === o.k ? 'var(--bg-2)' : 'transparent',
              padding: '14px 12px', borderRadius: 16,
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 8,
              color: 'var(--ink)',
            }}>
              <span className={`ms ${type === o.k ? 'fill' : ''}`} style={{ fontSize: 22, color: type === o.k ? 'var(--accent-deep)' : 'var(--ink-2)' }}>{o.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{o.label}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{o.unit}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>Target</div>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div className="serif" style={{ fontSize: 64, letterSpacing: '-0.04em', lineHeight: 1 }}>{target}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{options.find(o=>o.k===type).unit}</div>
        </div>
        <input type="range" min={5} max={120} step={5} value={target} onChange={e => setTarget(+e.target.value)}
          style={{ width: '100%', accentColor: 'var(--accent)', marginBottom: 18 }} />

        <button onClick={onClose} className="tap" style={{ width: '100%', border: 0, background: 'var(--ink)', color: 'var(--bg)', padding: '14px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Start tracking
        </button>
      </div>
    </Sheet>
  );
}

Object.assign(window, { StudentHomework, StudentGoals, HomeworkSubmitSheet, GoalSheet, AttachBtn });
