// Mock data matching parleyroom-portal domain model (src/types/*)
// Fields mirror: User, Lesson, Homework, VocabularyWord, LearningGoal, Material, Notification

const I18N = {
  en: {
    home:'Home', lessons:'Lessons', vocab:'Vocabulary', materials:'Materials', calendar:'Calendar',
    students:'Students', settings:'Settings', homework:'Homework', goals:'Goals',
    good_morning:'Good morning', next_lesson:'Your next lesson', today:'Today', tomorrow:'Tomorrow',
    join_now:'Join now', open:'Open', live:'Live', practice:'Practice', streak:'day streak',
    words_learned:'words learned', lessons_done:'lessons done', due:'Due', overdue:'Overdue',
    reschedule:'Reschedule', cancel:'Cancel', review_due:'Review due',
    mark_learned:'Mark learned', active_students:'Active students', requests:'Requests',
    accept:'Accept', reject:'Reject', room_live:'Room is live',
    start_lesson:'Start lesson', you_know_this:'I know this', still_learning:'Still learning',
    again:'Again', good:'Good', easy:'Easy', next_up:'Next up', this_week:'This week',
    level:'Level', notes:'Notes',
    all:'All', new:'New', review:'Review', learned:'Learned',
    set_goal:'Set a goal', empty_lessons_title:'No lessons yet',
    empty_lessons_sub:'Book your first session with a teacher',
    empty_vocab_title:'Your glossary is empty', empty_vocab_sub:'Words you encounter will collect here',
    book:'Book a lesson', ok_submit:'Submit', submitted:'Submitted', in_review:'In review', rejected:'Rejected', done:'Done',
  },
  de: {
    home:'Start', lessons:'Stunden', vocab:'Vokabeln', materials:'Material', calendar:'Kalender',
    students:'Schüler', settings:'Einstellungen', homework:'Hausaufgaben', goals:'Ziele',
    good_morning:'Guten Morgen', next_lesson:'Deine nächste Stunde', today:'Heute', tomorrow:'Morgen',
    join_now:'Jetzt beitreten', open:'Öffnen', live:'Live', practice:'Üben', streak:'Tage Serie',
    words_learned:'Wörter gelernt', lessons_done:'Stunden', due:'Fällig', overdue:'Überfällig',
    reschedule:'Verschieben', cancel:'Absagen', review_due:'Wiederholung',
    mark_learned:'Gelernt', active_students:'Aktive Schüler', requests:'Anfragen',
    accept:'Annehmen', reject:'Ablehnen', room_live:'Raum ist live',
    start_lesson:'Stunde starten', you_know_this:'Ich kenne das', still_learning:'Am Lernen',
    again:'Nochmal', good:'Gut', easy:'Leicht', next_up:'Als Nächstes', this_week:'Diese Woche',
    level:'Niveau', notes:'Notizen',
    all:'Alle', new:'Neu', review:'Wiederh.', learned:'Gelernt',
    set_goal:'Ziel setzen', empty_lessons_title:'Noch keine Stunden',
    empty_lessons_sub:'Buche deine erste Stunde',
    empty_vocab_title:'Dein Glossar ist leer', empty_vocab_sub:'Neue Wörter erscheinen hier',
    book:'Stunde buchen', ok_submit:'Senden', submitted:'Eingereicht', in_review:'In Prüfung', rejected:'Abgelehnt', done:'Erledigt',
  }
};

// ---- USERS (type: User) ----
// lessonTypes: LessonType[] = ('one-on-one'|'speaking-club'|'reading-club')[]
// status: 'active'|'request'|'inactive'
const USERS = [
  { id:'u1', name:'Lina Weber',      initials:'LW', role:'student', level:'B1', points: 840, lessonTypes:['one-on-one','reading-club'], status:'active', locale:'de', hue:172 },
  { id:'u2', name:'Mateo Alves',     initials:'MA', role:'student', level:'A2', points: 210, lessonTypes:['one-on-one'], status:'active', hue:75 },
  { id:'u3', name:'Priya Shah',      initials:'PS', role:'student', level:'B2', points: 1340, lessonTypes:['one-on-one','speaking-club','reading-club'], status:'active', hue:290 },
  { id:'u4', name:'Yuki Tanaka',     initials:'YT', role:'student', level:'A1', points: 40, lessonTypes:['one-on-one'], status:'request', hue:25 },
  { id:'u5', name:'Noa Ben-Ami',     initials:'NB', role:'student', level:'C1', points: 2410, lessonTypes:['one-on-one','speaking-club'], status:'active', hue:210 },
  { id:'u6', name:'Sören Krüger',    initials:'SK', role:'student', level:'B1', points: 520, lessonTypes:['one-on-one'], status:'active', hue:140 },
  { id:'u7', name:'Farah Haddad',    initials:'FH', role:'student', level:'B2', points: 1130, lessonTypes:['speaking-club'], status:'active', hue:330 },
  { id:'u8', name:'Elias Strandberg',initials:'ES', role:'student', level:'A2', points: 80, lessonTypes:['one-on-one'], status:'inactive', hue:50 },
  { id:'t1', name:'Helena König',    initials:'HK', role:'teacher', level:null, lessonTypes:['one-on-one','speaking-club','reading-club'], status:'active', hue:172 },
];
const STUDENT_ME = USERS[0];
const TEACHER_ME = USERS[8];

// derive streak & progress locally for UI only (not on portal types)
const STATS_BY_USER = {
  u1:{ streak:12, progress:68 }, u2:{ streak:4, progress:32 }, u3:{ streak:21, progress:82 },
  u4:{ streak:2, progress:14 }, u5:{ streak:35, progress:93 }, u6:{ streak:7, progress:54 },
  u7:{ streak:18, progress:76 }, u8:{ streak:0, progress:22 },
};

// ---- LESSONS (type: Lesson) ----
// status: 'confirmed'|'request'|'in-progress'|'cancelled'|'completed'
// type: 'one-on-one'|'speaking-club'|'reading-club'
const LESSONS = [
  { id:'l1', title:'Perfekt vs. Präteritum', topic:'Perfekt vs. Präteritum', type:'one-on-one', date:'2026-03-16', time:'09:30', duration:60, teacherId:'t1', studentIds:['u1'], students:[{id:'u1',firstName:'Lina',lastName:'Weber',status:'confirmed'}], status:'in-progress', level:'B1', hasAiSummary:false, startedAt:'2026-03-16T09:30:00Z', pendingReschedule:null, teacherNotes:null, studentNotes:null, teacherWentWell:null, teacherWorkingOn:null, studentReflection:null, studentHardToday:null },
  { id:'l2', title:'Reisevokabular', topic:'Reisevokabular', type:'one-on-one', date:'2026-03-16', time:'11:00', duration:45, teacherId:'t1', studentIds:['u2'], students:[{id:'u2',firstName:'Mateo',lastName:'Alves',status:'confirmed'}], status:'confirmed', level:'A2', hasAiSummary:false, startedAt:null, pendingReschedule:null, teacherNotes:null, studentNotes:null, teacherWentWell:null, teacherWorkingOn:null, studentReflection:null, studentHardToday:null },
  { id:'l3', title:'Lesezirkel: Kafka', topic:'Lesezirkel: Kafka', type:'reading-club', date:'2026-03-16', time:'14:00', duration:90, teacherId:'t1', studentIds:['u3','u5','u7','u6','u1'], students:[{id:'u3',firstName:'Priya',lastName:'Shah',status:'confirmed'}], status:'confirmed', level:'B2', hasAiSummary:false, maxParticipants:8, startedAt:null, pendingReschedule:null, teacherNotes:null, studentNotes:null, teacherWentWell:null, teacherWorkingOn:null, studentReflection:null, studentHardToday:null },
  { id:'l4', title:'Erste Gespräche', topic:'Erste Gespräche', type:'one-on-one', date:'2026-03-16', time:'16:30', duration:45, teacherId:'t1', studentIds:['u4'], students:[{id:'u4',firstName:'Yuki',lastName:'Tanaka',status:'requested'}], status:'request', level:'A1', hasAiSummary:false, startedAt:null, pendingReschedule:null, teacherNotes:null, studentNotes:null, teacherWentWell:null, teacherWorkingOn:null, studentReflection:null, studentHardToday:null },
  { id:'l5', title:'Konjunktiv II', topic:'Konjunktiv II', type:'one-on-one', date:'2026-03-17', time:'10:00', duration:60, teacherId:'t1', studentIds:['u5'], students:[{id:'u5',firstName:'Noa',lastName:'Ben-Ami',status:'confirmed'}], status:'confirmed', level:'C1', hasAiSummary:false, startedAt:null, pendingReschedule:null, teacherNotes:null, studentNotes:null, teacherWentWell:null, teacherWorkingOn:null, studentReflection:null, studentHardToday:null },
  { id:'l6', title:'Modalverben', topic:'Modalverben', type:'one-on-one', date:'2026-03-17', time:'15:00', duration:60, teacherId:'t1', studentIds:['u1'], students:[{id:'u1',firstName:'Lina',lastName:'Weber',status:'confirmed'}], status:'confirmed', level:'B1', hasAiSummary:false, startedAt:null, pendingReschedule:null, teacherNotes:null, studentNotes:null, teacherWentWell:null, teacherWorkingOn:null, studentReflection:null, studentHardToday:null },
  { id:'l7', title:'Speaking Club: Kunst', topic:'Speaking Club: Kunst', type:'speaking-club', date:'2026-03-18', time:'18:00', duration:60, teacherId:'t1', studentIds:['u7','u3','u5','u1'], students:[], status:'confirmed', level:'B2', hasAiSummary:false, maxParticipants:6, startedAt:null, pendingReschedule:null, teacherNotes:null, studentNotes:null, teacherWentWell:null, teacherWorkingOn:null, studentReflection:null, studentHardToday:null },
];

// ---- HOMEWORK (type: Homework) ----
// category: 'writing'|'reading'|'grammar'|'vocabulary'|'listening'
// status: 'open'|'submitted'|'in-review'|'done'|'rejected'
const HOMEWORK = [
  { id:'h1', lessonId:'l1', studentId:'u1', teacherId:'t1', title:'Write: A day in Berlin', description:'Write 150–200 words using at least 4 Perfekt verbs.', category:'writing',    dueDate:'2026-03-16', status:'open',      submissionText:null, submissionUrl:null, teacherFeedback:null, attachmentType:null, attachmentUrl:null, attachmentName:null, createdAt:'2026-03-10', updatedAt:'2026-03-14' },
  { id:'h2', lessonId:'l1', studentId:'u1', teacherId:'t1', title:'Grammar: Trennbare Verben', description:'Complete exercises 1–12 in the workbook.', category:'grammar',    dueDate:'2026-03-20', status:'open',      submissionText:null, submissionUrl:null, teacherFeedback:null, attachmentType:null, attachmentUrl:null, attachmentName:null, createdAt:'2026-03-10', updatedAt:'2026-03-12' },
  { id:'h3', lessonId:null, studentId:'u1', teacherId:'t1', title:'Reading: Der Prozess, Ch.1', description:'Read chapter 1 and note 5 new words.', category:'reading',    dueDate:'2026-03-12', status:'open',      submissionText:null, submissionUrl:null, teacherFeedback:null, attachmentType:null, attachmentUrl:null, attachmentName:null, createdAt:'2026-03-05', updatedAt:'2026-03-05' },
  { id:'h4', lessonId:'l6', studentId:'u1', teacherId:'t1', title:'Listening: DW Tagesschau', description:'Listen and transcribe the first 2 minutes.', category:'listening', dueDate:'2026-03-13', status:'done',      submissionText:'Eingereicht.', submissionUrl:null, teacherFeedback:'Very good! Small note on Umlaute.', attachmentType:'file', attachmentUrl:'#', attachmentName:'transcript.pdf', createdAt:'2026-03-04', updatedAt:'2026-03-13' },
  { id:'h5', lessonId:'l1', studentId:'u1', teacherId:'t1', title:'Vocab: Essen & Trinken', description:'Create 10 example sentences.', category:'vocabulary', dueDate:'2026-03-18', status:'in-review', submissionText:'Alle 10 Sätze im Anhang.', submissionUrl:null, teacherFeedback:null, attachmentType:'link', attachmentUrl:'#', attachmentName:'docs.google.com/…', createdAt:'2026-03-09', updatedAt:'2026-03-15' },
  { id:'h6', lessonId:null, studentId:'u1', teacherId:'t1', title:'Writing: Brief an einen Freund', description:'Write a short personal letter.', category:'writing', dueDate:'2026-03-11', status:'rejected', submissionText:'Hallo, …', submissionUrl:null, teacherFeedback:'Bitte nochmal — mehr Struktur.', attachmentType:null, attachmentUrl:null, attachmentName:null, createdAt:'2026-03-02', updatedAt:'2026-03-11' },
];

// ---- VOCAB (type: VocabularyWord) ----
const VOCAB = [
  { id:'v1', studentId:'u1', german:'die Gemütlichkeit', english:'coziness', exampleSentence:'In dieser Kneipe herrscht eine echte Gemütlichkeit.', exampleTranslation:'This pub has real coziness.', category:'noun',       status:'new',     addedDate:'2026-03-14', lessonId:null, nextReviewAt:null, reviewCount:0 },
  { id:'v2', studentId:'u1', german:'beiläufig',         english:'casual, in passing', exampleSentence:'Er erwähnte es beiläufig.', exampleTranslation:'He mentioned it in passing.', category:'adjective', status:'review', addedDate:'2026-03-11', lessonId:'l1', nextReviewAt:'2026-03-16', reviewCount:2 },
  { id:'v3', studentId:'u1', german:'der Augenblick',    english:'the moment', exampleSentence:'Einen Augenblick, bitte.', exampleTranslation:'One moment, please.', category:'noun', status:'learned', addedDate:'2026-03-02', lessonId:'l1', nextReviewAt:null, reviewCount:5 },
  { id:'v4', studentId:'u1', german:'verschwinden',      english:'to disappear', exampleSentence:'Die Wolken verschwinden.', exampleTranslation:'The clouds disappear.', category:'verb', status:'review', addedDate:'2026-03-09', lessonId:null, nextReviewAt:'2026-03-16', reviewCount:1 },
  { id:'v5', studentId:'u1', german:'das Lieblingsbuch', english:'favorite book', exampleSentence:'Mein Lieblingsbuch ist „Der Prozess".', exampleTranslation:'My favorite book is "The Trial".', category:'noun', status:'new', addedDate:'2026-03-15', lessonId:null, nextReviewAt:null, reviewCount:0 },
  { id:'v6', studentId:'u1', german:'schwärmen',         english:'to rave about', exampleSentence:'Sie schwärmt von Berlin.', exampleTranslation:'She raves about Berlin.', category:'verb', status:'new', addedDate:'2026-03-13', lessonId:null, nextReviewAt:null, reviewCount:0 },
  { id:'v7', studentId:'u1', german:'die Sehnsucht',     english:'longing', exampleSentence:'Eine tiefe Sehnsucht.', exampleTranslation:'A deep longing.', category:'noun', status:'review', addedDate:'2026-03-12', lessonId:'l1', nextReviewAt:'2026-03-17', reviewCount:2 },
  { id:'v8', studentId:'u1', german:'umständlich',       english:'cumbersome', exampleSentence:'Das ist umständlich.', exampleTranslation:'That is cumbersome.', category:'adjective', status:'new', addedDate:'2026-03-15', lessonId:null, nextReviewAt:null, reviewCount:0 },
  { id:'v9', studentId:'u1', german:'erreichen',         english:'to reach, achieve', exampleSentence:'Wir erreichen das Ziel.', exampleTranslation:'We reach the goal.', category:'verb', status:'learned', addedDate:'2026-02-24', lessonId:null, nextReviewAt:null, reviewCount:6 },
  { id:'v10',studentId:'u1', german:'die Aussicht',      english:'view, prospect', exampleSentence:'Eine schöne Aussicht.', exampleTranslation:'A nice view.', category:'noun', status:'learned', addedDate:'2026-03-02', lessonId:null, nextReviewAt:null, reviewCount:5 },
  { id:'v11',studentId:'u1', german:'vorhaben',          english:'to plan, intend', exampleSentence:'Was hast du heute vor?', exampleTranslation:'What are you planning today?', category:'verb', status:'review', addedDate:'2026-03-10', lessonId:'l6', nextReviewAt:'2026-03-16', reviewCount:1 },
  { id:'v12',studentId:'u1', german:'behaupten',         english:'to claim', exampleSentence:'Sie behauptet, es zu wissen.', exampleTranslation:'She claims to know.', category:'verb', status:'new', addedDate:'2026-03-15', lessonId:null, nextReviewAt:null, reviewCount:0 },
];

// ---- MATERIALS (type: Material) ----
// type: 'pdf'|'audio'|'video'|'link'
const MATERIALS = [
  { id:'m1', teacherId:'t1', studentId:null, lessonId:null, name:'A day in the Black Forest.pdf',      type:'pdf',   contentType:'application/pdf', fileSize:540000,  downloadUrl:'#', createdAt:'2026-03-01', hue:140, level:'B1', minutes:8 },
  { id:'m2', teacherId:'t1', studentId:null, lessonId:null, name:'German news: a gentle intro.mp3',    type:'audio', contentType:'audio/mpeg',       fileSize:3200000, downloadUrl:'#', createdAt:'2026-02-24', hue:25,  level:'A2', minutes:12 },
  { id:'m3', teacherId:'t1', studentId:'u1', lessonId:'l1', name:'Perfekt vs. Präteritum (slides)',    type:'pdf',   contentType:'application/pdf', fileSize:820000,  downloadUrl:'#', createdAt:'2026-03-10', hue:172, level:'B1', minutes:6 },
  { id:'m4', teacherId:'t1', studentId:null, lessonId:null, name:'Kaffeehaus conversations (video)',   type:'video', contentType:'video/mp4',        fileSize:12400000,downloadUrl:'#', createdAt:'2026-02-20', hue:290, level:'B2', minutes:15 },
  { id:'m5', teacherId:'t1', studentId:null, lessonId:null, name:'Ordering at a restaurant',           type:'link',  contentType:null,               fileSize:null,    downloadUrl:'https://dw.com', createdAt:'2026-02-14', hue:75,  level:'A1', minutes:5 },
  { id:'m6', teacherId:'t1', studentId:'u1', lessonId:null, name:'Letters between friends.pdf',        type:'pdf',   contentType:'application/pdf', fileSize:410000,  downloadUrl:'#', createdAt:'2026-03-07', hue:210, level:'B1', minutes:20 },
];

// ---- GOALS (type: LearningGoal) ----
// setBy: 'teacher'|'student';  status: 'active'|'completed'|'abandoned'
const GOALS = [
  { id:'g1', studentId:'u1', teacherId:'t1', description:'Speak 30 minutes a day', progress:72, setBy:'teacher', targetDate:'2026-04-30', status:'active', createdAt:'2026-03-01', updatedAt:'2026-03-15' },
  { id:'g2', studentId:'u1', teacherId:null, description:'Learn 10 new words this week', progress:60, setBy:'student', targetDate:'2026-03-22', status:'active', createdAt:'2026-03-14', updatedAt:'2026-03-15' },
  { id:'g3', studentId:'u1', teacherId:'t1', description:'Finish 3 reading tasks', progress:33, setBy:'teacher', targetDate:'2026-03-30', status:'active', createdAt:'2026-03-01', updatedAt:'2026-03-15' },
];

// ---- NOTIFICATIONS (type: Notification) ----
const NOTIFICATIONS = [
  { id:'n1', type:'reschedule-accepted', referenceId:'l5', viewed:false, actor:{ id:'t1', firstName:'Helena', lastName:'König', role:'teacher' }, createdAt:'2026-03-16T09:20:00Z' },
  { id:'n2', type:'lesson-completed',    referenceId:'l6', viewed:false, actor:{ id:'t1', firstName:'Helena', lastName:'König', role:'teacher' }, createdAt:'2026-03-16T08:10:00Z' },
  { id:'n3', type:'vocab-review-due',    referenceId:null, viewed:true,  actor:{ id:'u1', firstName:'Lina',   lastName:'Weber', role:'student' }, createdAt:'2026-03-16T06:00:00Z' },
];

const WEEK = [
  { key:'mon', label:'Mon', n:14 }, { key:'tue', label:'Tue', n:15 }, { key:'wed', label:'Wed', n:16 },
  { key:'thu', label:'Thu', n:17 }, { key:'fri', label:'Fri', n:18 }, { key:'sat', label:'Sat', n:19 },
  { key:'sun', label:'Sun', n:20 },
];

// Back-compat aliases so existing screens keep working; PEOPLE -> USERS, LESSON.date mapping helpers:
const PEOPLE = USERS;
// helper: today/tomorrow labels used in UI
const TODAY_ISO = '2026-03-16';
const TOMORROW_ISO = '2026-03-17';

Object.assign(window, { I18N, USERS, PEOPLE, STUDENT_ME, TEACHER_ME, STATS_BY_USER, LESSONS, HOMEWORK, VOCAB, MATERIALS, GOALS, NOTIFICATIONS, WEEK, TODAY_ISO, TOMORROW_ISO });
