import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, Target, Map, BarChart3, Mic2,
  Settings, CheckCircle2, AlertCircle,
  Loader2, FileText, Cpu, Upload, Briefcase, Clock, ChevronDown, X, Search
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ─── JOB LISTINGS DATABASE ───────────────────────────────────────────────────
const JOB_LISTINGS = [
  { id: 1, title: "Full Stack Developer", company: "Zoho Corp", location: "Chennai", type: "Software", skills: ["React", "Node.js", "SQL", "REST APIs", "TypeScript"], description: "Build scalable web applications using modern JS stack. Work with cross-functional teams to deliver enterprise solutions." },
  { id: 2, title: "Data Scientist", company: "Infosys", location: "Bangalore", type: "Data", skills: ["Python", "ML", "TensorFlow", "SQL", "Statistics"], description: "Develop ML models and data pipelines. Analyze large datasets to drive business insights." },
  { id: 3, title: "Cloud Engineer", company: "TCS", location: "Hyderabad", type: "Cloud", skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"], description: "Design and maintain cloud infrastructure. Implement DevOps practices and automation pipelines." },
  { id: 4, title: "Frontend Developer", company: "Freshworks", location: "Chennai", type: "Software", skills: ["React", "TypeScript", "CSS", "Redux", "Jest"], description: "Craft pixel-perfect UIs with high performance. Collaborate with design and backend teams." },
  { id: 5, title: "Embedded Systems Engineer", company: "L&T Technology", location: "Pune", type: "Embedded", skills: ["C", "C++", "RTOS", "IoT", "ESP32", "PCB Design"], description: "Develop firmware and embedded software for industrial IoT devices." },
  { id: 6, title: "Backend Developer (Java)", company: "Wipro", location: "Bangalore", type: "Software", skills: ["Java", "Spring Boot", "Microservices", "Kafka", "PostgreSQL"], description: "Build and maintain backend services for banking and fintech platforms." },
  { id: 7, title: "ML Engineer", company: "Samsung R&D", location: "Bangalore", type: "Data", skills: ["Python", "PyTorch", "Computer Vision", "NLP", "MLOps"], description: "Research and deploy ML models for consumer electronics applications." },
  { id: 8, title: "DevOps Engineer", company: "HCL Tech", location: "Noida", type: "Cloud", skills: ["Jenkins", "Docker", "Linux", "Python", "Ansible", "Git"], description: "Automate deployment pipelines and manage infrastructure at scale." },
  { id: 9, title: "UI/UX + React Developer", company: "Razorpay", location: "Bangalore", type: "Software", skills: ["React", "Figma", "JavaScript", "CSS", "Node.js"], description: "Design and implement intuitive user experiences for fintech products." },
  { id: 10, title: "VLSI Design Engineer", company: "Qualcomm", location: "Hyderabad", type: "Hardware", skills: ["Verilog", "VHDL", "ASIC", "RTL", "Cadence"], description: "Design and verify digital circuits for next-gen chipsets." },
  { id: 11, title: "Android Developer", company: "Swiggy", location: "Bangalore", type: "Mobile", skills: ["Kotlin", "Java", "Android SDK", "Firebase", "REST"], description: "Build and optimize Android apps serving millions of users." },
  { id: 12, title: "Cybersecurity Analyst", company: "Deloitte", location: "Mumbai", type: "Security", skills: ["Network Security", "SIEM", "Python", "Penetration Testing", "SOC"], description: "Monitor and respond to security threats for enterprise clients." },
  { id: 13, title: "Product Manager - Tech", company: "Flipkart", location: "Bangalore", type: "Management", skills: ["Agile", "Scrum", "SQL", "Data Analysis", "Product Strategy"], description: "Define product roadmap and work with engineering to ship impactful features." },
  { id: 14, title: "Network Engineer", company: "Airtel", location: "Delhi", type: "Networking", skills: ["Cisco", "CCNA", "BGP", "OSPF", "Linux", "Python"], description: "Design and maintain telecom network infrastructure across India." },
  { id: 15, title: "Salesforce Developer", company: "Accenture", location: "Hyderabad", type: "Software", skills: ["Salesforce", "Apex", "LWC", "SOQL", "REST APIs"], description: "Develop Salesforce solutions for global CRM implementations." }
];

const JOB_TYPES = ["All", "Software", "Data", "Cloud", "Embedded", "Hardware", "Mobile", "Security", "Management", "Networking"];

const DEFAULT_PROFILE = {
  name: "Leo",
  branch: "ECE",
  targetRole: "Full Stack Developer",
  cgpa: "8.5",
  resumeText: "Projects:\n- IoT Smart Supply Chain using ESP32\n- React-based Portfolio\n\nExperience:\n- 3 months internship at TechCorp\n\nSkills: Python, C++, React, SQL"
};

// ─── AI CALL ─────────────────────────────────────────────────────────────────
const callAI = async (systemPrompt, userPrompt, provider, apiKeys) => {
  const key = apiKeys[provider];
  if (!key) throw new Error(`${provider.toUpperCase()} API Key Missing. Set it in Settings.`);
  let text = "";
  try {
    if (provider === 'gemini') {
      const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      const modelsData = await modelsRes.json();
      if (modelsData.error || !modelsData.models) throw new Error("Invalid Gemini API Key or API is blocked in your network.");
      const validModel = modelsData.models.find(m =>
        m.supportedGenerationMethods.includes('generateContent') &&
        (m.name.includes('gemini-1.5-flash') || m.name.includes('gemini-1.0') || m.name.includes('gemini'))
      );
      if (!validModel) throw new Error("No compatible Gemini models found for your API key.");
      const combined = `CRITICAL INSTRUCTIONS:\n${systemPrompt}\n\nUSER DATA:\n${userPrompt}`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: combined }] }] })
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error.message);
      text = d.candidates[0].content.parts[0].text;
    } else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] })
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error.message);
      text = d.choices[0].message.content;
    } else if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: "claude-3-5-sonnet-20240620", max_tokens: 3000, system: systemPrompt, messages: [{ role: "user", content: userPrompt }] })
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error.message);
      text = d.content[0].text;
    }
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (err) {
    throw new Error(`${provider.toUpperCase()} failed: ${err.message}`);
  }
};

// ─── GAUGE CHART ──────────────────────────────────────────────────────────────
const GaugeChart = ({ value, label, color = '#00B4D8', size = 180 }) => {
  const r = 70;
  const cx = size / 2;
  const cy = size / 2 + 15;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const valueAngle = startAngle + (value / 100) * totalAngle;

  const polarToXY = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const describeArc = (startA, endA, rad) => {
    const s = polarToXY(startA, rad);
    const e = polarToXY(endA, rad);
    const largeArc = endA - startA > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${rad} ${rad} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const needle = polarToXY(valueAngle, r - 10);
  const needleBase1 = polarToXY(valueAngle - 90, 8);
  const needleBase2 = polarToXY(valueAngle + 90, 8);

  const zones = [
    { start: -210, end: -130, color: '#FF6B6B' },
    { start: -130, end: -50, color: '#F59E0B' },
    { start: -50, end: 30, color: '#00C896' },
  ];

  return (
    <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
      <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="#1A2E44" strokeWidth="2" />
      {zones.map((z, i) => (
        <path key={i} d={describeArc(z.start, z.end, r)} fill="none" stroke={z.color} strokeWidth="12" strokeLinecap="round" opacity="0.25" />
      ))}
      <path d={describeArc(startAngle, valueAngle, r)} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
      <polygon
        points={`${needle.x},${needle.y} ${needleBase1.x},${needleBase1.y} ${cx},${cy} ${needleBase2.x},${needleBase2.y}`}
        fill={color} opacity="0.9"
      />
      <circle cx={cx} cy={cy} r={8} fill="#1A2E44" stroke={color} strokeWidth="2" />
      <text x={cx} y={cy + 28} textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">{value}%</text>
      <text x={cx} y={cy + 44} textAnchor="middle" fill="#6B8A9E" fontSize="10" fontWeight="bold">{label}</text>
    </svg>
  );
};

// ─── RESUME UPLOAD ────────────────────────────────────────────────────────────
const ResumeUploader = ({ profile, setProfile }) => {
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const inputRef = useRef(null);

  const parseFile = async (file) => {
    setParsing(true);
    setFileName(file.name);
    try {
      if (file.type === 'text/plain') {
        const text = await file.text();
        setProfile(p => ({ ...p, resumeText: text }));
      } else if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const arr = new Uint8Array(e.target.result);
          let str = '';
          for (let i = 0; i < arr.length; i++) {
            if (arr[i] > 31 && arr[i] < 127) str += String.fromCharCode(arr[i]);
            else if (arr[i] === 10 || arr[i] === 13) str += '\n';
          }
          const lines = str.split('\n').map(l => l.trim()).filter(l => l.length > 3 && /[a-zA-Z]/.test(l) && !/^[^a-zA-Z]*$/.test(l));
          const cleaned = [...new Set(lines)].slice(0, 80).join('\n');
          setProfile(p => ({ ...p, resumeText: cleaned || 'Could not parse PDF text. Please paste your resume text manually.' }));
        };
        reader.readAsArrayBuffer(file);
      }
    } finally {
      setParsing(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${drag ? 'border-[#00B4D8] bg-[#00B4D8]/10' : 'border-[#00B4D8]/30 hover:border-[#00B4D8]/60 hover:bg-[#00B4D8]/5'}`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => e.target.files[0] && parseFile(e.target.files[0])} />
        {parsing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-[#00B4D8]" size={32} />
            <p className="text-[#00B4D8] font-bold text-sm">Parsing resume...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload size={32} className="text-[#00B4D8]" />
            <p className="text-white font-bold">Drop your Resume here</p>
            <p className="text-[#6B8A9E] text-xs">PDF or TXT · Click to browse</p>
            {fileName && <p className="text-[#00C896] text-xs font-bold">✓ {fileName} loaded</p>}
          </div>
        )}
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#00B4D8]/10" /></div>
        <div className="relative flex justify-center"><span className="bg-[#1A2E44] px-3 text-[#6B8A9E] text-xs font-bold">OR PASTE MANUALLY</span></div>
      </div>
      <textarea
        className="w-full h-36 bg-[#0D1B2A] border border-[#00B4D8]/20 rounded-xl p-4 text-[#EEF4F7] focus:border-[#00B4D8] outline-none text-sm resize-none"
        placeholder="Paste your resume, projects, experience, and skills here..."
        value={profile.resumeText}
        onChange={e => setProfile(p => ({ ...p, resumeText: e.target.value }))}
      />
    </div>
  );
};

// ─── JOB SELECTOR ─────────────────────────────────────────────────────────────
const JobSelector = ({ onSelect, selectedJob }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = JOB_LISTINGS.filter(j =>
    (filter === 'All' || j.type === filter) &&
    (j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()) || j.skills.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[#00B4D8] text-xs font-bold uppercase tracking-wider">Select Target Job</label>
        <button onClick={() => setOpen(!open)} className="text-xs text-[#6B8A9E] hover:text-[#00B4D8] font-bold flex items-center gap-1">
          {open ? 'Close' : 'Browse All Jobs'} <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {selectedJob && !open && (
        <div className="bg-[#0D1B2A] border border-[#00C896]/30 rounded-xl p-4 flex items-start gap-3">
          <Briefcase size={18} className="text-[#00C896] mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">{selectedJob.title}</p>
            <p className="text-[#6B8A9E] text-xs">{selectedJob.company} · {selectedJob.location}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedJob.skills.slice(0, 4).map(s => <span key={s} className="px-2 py-0.5 bg-[#00B4D8]/10 text-[#00B4D8] text-xs rounded-full font-bold">{s}</span>)}
            </div>
          </div>
          <button onClick={() => onSelect(null)} className="text-[#6B8A9E] hover:text-[#FF6B6B]"><X size={16} /></button>
        </div>
      )}

      {open && (
        <div className="bg-[#0D1B2A] border border-[#00B4D8]/20 rounded-2xl p-4 space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8A9E]" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs, companies, skills..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#1A2E44] border border-[#00B4D8]/20 rounded-xl text-white text-sm outline-none focus:border-[#00B4D8]"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {JOB_TYPES.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${filter === t ? 'bg-[#00B4D8] text-[#0D1B2A]' : 'bg-[#1A2E44] text-[#6B8A9E] hover:text-[#00B4D8]'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filtered.map(job => (
              <button key={job.id} onClick={() => { onSelect(job); setOpen(false); }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedJob?.id === job.id ? 'border-[#00C896] bg-[#00C896]/5' : 'border-[#00B4D8]/10 hover:border-[#00B4D8]/40 bg-[#1A2E44]'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-white font-bold text-sm">{job.title}</p>
                    <p className="text-[#6B8A9E] text-xs">{job.company} · {job.location}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-[#00B4D8]/10 text-[#00B4D8] rounded-full font-bold shrink-0">{job.type}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {job.skills.slice(0, 5).map(s => <span key={s} className="px-2 py-0.5 bg-[#0D1B2A] text-[#B0C4D8] text-xs rounded font-bold">{s}</span>)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TIMELINE PICKER ───────────────────────────────────────────────────────────
const TimelinePicker = ({ value, onChange }) => {
  const options = [
    { months: 1, label: '1 Month', icon: '⚡', desc: 'Intensive', intensity: 'High' },
    { months: 2, label: '2 Months', icon: '🎯', desc: 'Focused', intensity: 'Medium-High' },
    { months: 3, label: '3 Months', icon: '📅', desc: 'Balanced', intensity: 'Medium' },
    { months: 6, label: '6 Months', icon: '🌱', desc: 'Steady', intensity: 'Low' },
  ];

  return (
    <div className="space-y-3">
      <label className="text-[#00B4D8] text-xs font-bold uppercase tracking-wider block">Time to Prepare</label>
      <div className="grid grid-cols-4 gap-2">
        {options.map(opt => (
          <button key={opt.months} onClick={() => onChange(opt.months)}
            className={`p-3 rounded-xl border text-center transition-all ${value === opt.months ? 'border-[#00B4D8] bg-[#00B4D8]/15' : 'border-[#00B4D8]/15 bg-[#0D1B2A] hover:border-[#00B4D8]/40'}`}>
            <div className="text-2xl mb-1">{opt.icon}</div>
            <p className={`text-xs font-bold ${value === opt.months ? 'text-[#00B4D8]' : 'text-white'}`}>{opt.label}</p>
          </button>
        ))}
      </div>
      {value && (
        <div className="bg-[#0D1B2A] border border-[#00B4D8]/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <Clock size={16} className="text-[#00B4D8] shrink-0" />
          <p className="text-sm text-[#B0C4D8]">
            AI will construct a unique <span className="text-white font-bold">{value * 4}-week</span> roadmap based on your skill gaps.
          </p>
        </div>
      )}
    </div>
  );
};

// ─── STUDY TIMER MODAL ────────────────────────────────────────────────────────
const StudyTimerModal = ({ day, onClose, onComplete }) => {
  const [mins, setMins] = useState(30);
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(null);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const pct = remaining !== null ? ((mins * 60 - remaining) / (mins * 60)) * 100 : 0;

  useEffect(() => { if (started) setRemaining(mins * 60); }, [started, mins]);
  useEffect(() => {
    if (remaining === null || !started) return;
    if (remaining === 0) { onComplete(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, started, onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0D1B2A]/95 z-[60] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-[#1A2E44] rounded-3xl p-10 border border-[#00B4D8]/20 w-full max-w-sm text-center space-y-6">
        <h3 className="text-xl font-bold text-white">Focus Timer</h3>
        <p className="text-[#B0C4D8] text-sm">Day {day.day}: {day.topic}</p>
        {!started ? (
          <>
            <div className="space-y-2">
              <label className="text-[#00B4D8] text-xs font-bold uppercase">Set Timer (minutes)</label>
              <input type="range" min="1" max="120" step="1" value={mins} onChange={e => setMins(Number(e.target.value))} className="w-full accent-[#00B4D8]" />
              <p className="text-white font-bold text-2xl">{mins} min</p>
            </div>
            <button onClick={() => setStarted(true)} className="w-full py-3 bg-[#00B4D8] text-[#0D1B2A] font-bold rounded-xl">Start Focus 🔒</button>
            <button onClick={onClose} className="text-[#6B8A9E] text-sm font-bold">Cancel</button>
          </>
        ) : (
          <>
            <div className="relative w-36 h-36 mx-auto">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#1A2E44" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="#00B4D8" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 52}`} strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
                  strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">{fmt(remaining ?? mins * 60)}</span>
              </div>
            </div>
            {remaining === 0 && <p className="text-[#00C896] font-bold">✅ Session complete!</p>}
          </>
        )}
      </div>
    </div>
  );
};

// ─── RESOURCE MODAL ────────────────────────────────────────────────────────────
const ResourceModal = ({ data, onClose, onQuizPass, apiProvider, apiKeys }) => {
  const [phase, setPhase] = useState('read');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const scrollRef = useRef(null);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => { if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setCanProceed(true); };
    el.addEventListener('scroll', handler);
    if (el.scrollHeight <= el.clientHeight + 40) setCanProceed(true);
    return () => el.removeEventListener('scroll', handler);
  }, [phase]);

  const loadQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const sys = `Generate exactly 3 MCQs about "${data.day.topic}". Return ONLY JSON: { "questions": [{ "q":"text","options":["A","B","C","D"],"answer":"A" }] }`;
      const result = await callAI(sys, `Topic: ${data.day.topic}`, apiProvider, apiKeys);
      setQuestions(result.questions); setPhase('quiz');
    } catch (e) { alert(e.message); } finally { setLoadingQuiz(false); }
  };

  const submitQuiz = () => {
    const correct = questions.filter((q, i) => answers[i] === q.answer).length;
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct); setPhase(pct >= 67 ? 'pass' : 'fail');
  };

  return (
    <div className="fixed inset-0 bg-[#0D1B2A] z-[70] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#00B4D8]/20 bg-[#1A2E44]">
        <div>
          <p className="text-[#00B4D8] text-xs font-bold uppercase">Day {data.day.day} · {data.day.topic}</p>
          <h2 className="text-white font-bold">{data.resource}</h2>
        </div>
        <button onClick={onClose} className="text-[#B0C4D8] hover:text-white text-2xl font-bold">✕</button>
      </div>
      {phase === 'read' && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
            <div className="bg-[#1A2E44] rounded-2xl p-6 border border-[#00B4D8]/10 space-y-4">
              <p className="text-[#EEF4F7] leading-relaxed">This resource covers key concepts for <strong>{data.day.topic}</strong>. Read carefully before the quiz.</p>
              <div className="rounded-xl overflow-hidden border border-[#00B4D8]/20" style={{ height: '400px' }}>
                <iframe src={`https://www.google.com/search?q=${encodeURIComponent(data.resource + ' ' + data.day.topic)}&igu=1`} className="w-full h-full bg-white" title={data.resource} sandbox="allow-scripts allow-same-origin" />
              </div>
              <div className="pt-8 h-32" />
            </div>
          </div>
          <div className="p-6 border-t border-[#00B4D8]/20 bg-[#1A2E44] flex items-center justify-between">
            <p className="text-[#6B8A9E] text-sm font-bold">{canProceed ? '✅ Ready for quiz' : '📜 Scroll to continue'}</p>
            <button onClick={loadQuiz} disabled={!canProceed || loadingQuiz}
              className={`px-6 py-3 rounded-xl font-bold ${canProceed ? 'bg-[#00B4D8] text-[#0D1B2A]' : 'bg-[#1A2E44] text-[#6B8A9E] border border-[#6B8A9E]/20 cursor-not-allowed'}`}>
              {loadingQuiz ? '⏳ Generating...' : 'Take Quiz →'}
            </button>
          </div>
        </>
      )}
      {phase === 'quiz' && (
        <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full space-y-8">
          <h3 className="text-white text-xl font-bold">Quick Check — {data.day.topic}</h3>
          {questions.map((q, i) => (
            <div key={i} className="bg-[#1A2E44] rounded-2xl p-6 border border-[#00B4D8]/10 space-y-3">
              <p className="text-white font-bold">Q{i + 1}: {q.q}</p>
              {q.options.map((opt, j) => (
                <button key={j} onClick={() => setAnswers({ ...answers, [i]: opt })}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all font-bold ${answers[i] === opt ? 'bg-[#00B4D8]/20 border-[#00B4D8] text-[#00B4D8]' : 'border-[#00B4D8]/10 text-[#B0C4D8] hover:border-[#00B4D8]/30'}`}>{opt}</button>
              ))}
            </div>
          ))}
          <button onClick={submitQuiz} disabled={Object.keys(answers).length < questions.length} className="w-full py-4 bg-[#00B4D8] text-[#0D1B2A] font-bold rounded-xl disabled:opacity-50">Submit Answers</button>
        </div>
      )}
      {phase === 'pass' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <div className="text-6xl">🎉</div>
            <h3 className="text-2xl font-bold text-white">Excellent! {score}% correct</h3>
            <button onClick={() => { onQuizPass(data.day.day); onClose(); }} className="px-8 py-3 bg-[#00C896] text-[#0D1B2A] font-bold rounded-xl">Mark Complete ✓</button>
          </div>
        </div>
      )}
      {phase === 'fail' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <div className="text-6xl">📚</div>
            <h3 className="text-2xl font-bold text-white">Score: {score}% — Need 67% to pass</h3>
            <button onClick={() => setPhase('read')} className="px-8 py-3 bg-[#00B4D8] text-[#0D1B2A] font-bold rounded-xl">Read Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MOCK INTERVIEW ────────────────────────────────────────────────────────────
const TOPIC_GROUPS = [
  { id: 'dsa', label: 'Data Structures & Algorithms', icon: '🧩' },
  { id: 'oop', label: 'OOP & Design Patterns', icon: '🏗️' },
  { id: 'dbms', label: 'Databases & SQL', icon: '🗃️' },
  { id: 'os', label: 'Operating Systems', icon: '💾' },
  { id: 'cn', label: 'Computer Networks', icon: '🌐' },
  { id: 'webdev', label: 'Web Development', icon: '🌍' },
  { id: 'ml', label: 'Machine Learning & AI', icon: '🤖' },
  { id: 'embedded', label: 'Embedded Systems & IoT', icon: '🔌' },
  { id: 'system', label: 'System Design', icon: '⚙️' },
  { id: 'hr', label: 'HR & Behavioral', icon: '🤝' },
];

const MockInterviewPage = ({ profile, apiProvider, apiKeys }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState('topic_select');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [interviewType, setInterviewType] = useState('Mixed');
  const [difficulty, setDifficulty] = useState('Medium');
  const [qCount, setQCount] = useState(5);
  const [cameraOn, setCameraOn] = useState(false);

  const [chatLog, setChatLog] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const chatEndRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [camMetrics, setCamMetrics] = useState({ eyeContact: 100, confidence: 100 });
  const metricsRef = useRef({ lookAwayFrames: 0, totalFrames: 0 });

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatLog]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraOn(true);
      startFaceTracking();
    } catch (e) { console.log('Camera unavailable'); }
  };

  const startFaceTracking = () => {
    const detect = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
      ctx.drawImage(videoRef.current, 0, 0);
      metricsRef.current.totalFrames++;
      const imageData = ctx.getImageData(canvasRef.current.width * 0.3, canvasRef.current.height * 0.2, canvasRef.current.width * 0.4, canvasRef.current.height * 0.4);
      const avg = imageData.data.reduce((s, v, i) => i % 4 !== 3 ? s + v : s, 0) / (imageData.data.length * 0.75);
      if (avg < 30 || avg > 230) metricsRef.current.lookAwayFrames++;
      const eyeContact = Math.max(0, Math.round(100 - (metricsRef.current.lookAwayFrames / metricsRef.current.totalFrames) * 100));
      const confidence = Math.round(eyeContact * 0.6 + (Math.random() * 10 + 70) * 0.4);
      setCamMetrics({ eyeContact, confidence });
      requestAnimationFrame(detect);
    };
    requestAnimationFrame(detect);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) { videoRef.current.srcObject.getTracks().forEach(t => t.stop()); setCameraOn(false); }
  };

  const startIntroChat = async () => {
    if (selectedTopics.length === 0) { alert('Please select at least one topic.'); return; }
    setPhase('intro_chat');
    await startCamera();
    const greeting = `Hi ${profile.name}! 👋 I'm your interviewer today. I see you're comfortable with: **${selectedTopics.map(t => TOPIC_GROUPS.find(g => g.id === t)?.label).join(', ')}**.

Before we begin the main interview, let me ask you a quick warm-up question:

Can you briefly tell me about yourself and what excites you most about the **${profile.targetRole}** role?`;
    setChatLog([{ role: 'interviewer', text: greeting }]);
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatLog(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const history = [...chatLog, { role: 'user', text: userMsg }];
      const sys = `You are a warm, professional interviewer conducting a pre-interview conversation. 
The candidate is ${profile.name}, targeting ${profile.targetRole} role.
Comfortable topics: ${selectedTopics.map(t => TOPIC_GROUPS.find(g => g.id === t)?.label).join(', ')}.
Ask 1-2 casual warm-up questions to understand their background, confidence level, and depth in their chosen topics.
After 2-3 exchanges, wrap up with a motivating message and say "Great! Let's now begin the formal interview. Type 'ready' when you are!"
Keep responses conversational, encouraging, and under 100 words. Return plain text only.`;
      const historyText = history.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.text}`).join('\n');
      if (userMsg.toLowerCase().includes('ready') && history.length > 4) {
        setChatLog(prev => [...prev, { role: 'interviewer', text: "Perfect! Let's go 🚀 Generating your personalized interview questions now..." }]);
        setIntroComplete(true);
        setTimeout(() => startFormalInterview(), 1500);
        return;
      }
      const response = await callAI(sys, historyText, apiProvider, apiKeys);
      const text = typeof response === 'string' ? response : (response.message || response.text || JSON.stringify(response));
      setChatLog(prev => [...prev, { role: 'interviewer', text }]);
    } catch (e) {
      const fallbacks = [
        `That's great! Tell me about your most challenging project in these areas.`,
        `Interesting! How confident are you with ${selectedTopics[0]}? Type 'ready' when you're set to begin!`
      ];
      setChatLog(prev => [...prev, { role: 'interviewer', text: fallbacks[Math.floor(Math.random() * fallbacks.length)] }]);
    } finally {
      setChatLoading(false);
    }
  };

  const startFormalInterview = async () => {
    setLoading(true);
    try {
      const topicLabels = selectedTopics.map(t => TOPIC_GROUPS.find(g => g.id === t)?.label).join(', ');
      const sys = `Generate ${qCount} interview questions. Topics MUST be from: ${topicLabels}. Mix difficulty around ${difficulty}.
Return ONLY JSON: { "questions": [{ "id":1, "question":"text","topic":"DSA","difficulty":"Medium","keyPoints":["p1","p2"] }] }`;
      const result = await callAI(sys, `Role: ${profile.targetRole}\nType: ${interviewType}`, apiProvider, apiKeys);
      setQuestions(result.questions);
      setCurrentQ(0);
      setScores([]);
      setPhase('interview');
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    setLoading(true);
    try {
      const q = questions[currentQ];
      const sys = `Score this interview answer. Return ONLY JSON: { "clarity":8,"technical":7,"communication":8,"overall":7.5,"good":["point"],"improve":["point"],"modelAnswer":"brief ideal answer" }`;
      const result = await callAI(sys, `Question: ${q.question}\nExpected: ${q.keyPoints?.join(', ')}\nAnswer: ${answer}`, apiProvider, apiKeys);
      const enriched = { ...result, question: q.question, userAnswer: answer, eyeContact: camMetrics.eyeContact, confidence: camMetrics.confidence };
      setScores(prev => [...prev, enriched]);
      setAnswer('');
      if (currentQ < questions.length - 1) setCurrentQ(c => c + 1);
      else { setPhase('results'); stopCamera(); }
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  };

  if (phase === 'topic_select') return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-[#1A2E44] p-8 rounded-3xl border border-[#00B4D8]/10 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#00B4D8]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#00B4D8]"><Mic2 size={32} /></div>
          <h2 className="text-2xl font-bold text-white">AI Mock Interview</h2>
          <p className="text-[#B0C4D8] text-sm mt-1">Tell us what you know — we'll tailor the interview to you</p>
        </div>
        <div>
          <label className="text-[#00B4D8] text-xs font-bold uppercase tracking-wider block mb-3">Select topics you're comfortable with</label>
          <div className="grid grid-cols-2 gap-2">
            {TOPIC_GROUPS.map(t => (
              <button key={t.id} onClick={() => setSelectedTopics(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${selectedTopics.includes(t.id) ? 'border-[#00B4D8] bg-[#00B4D8]/10' : 'border-[#00B4D8]/10 bg-[#0D1B2A] hover:border-[#00B4D8]/30'}`}>
                <span className="text-xl">{t.icon}</span>
                <span className={`text-xs font-bold leading-tight ${selectedTopics.includes(t.id) ? 'text-[#00B4D8]' : 'text-[#B0C4D8]'}`}>{t.label}</span>
                {selectedTopics.includes(t.id) && <CheckCircle2 size={14} className="text-[#00B4D8] ml-auto shrink-0" />}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[#00B4D8] text-xs font-bold uppercase block mb-2">Type</label>
            <div className="flex gap-1">
              {['Technical', 'HR', 'Mixed'].map(o => (
                <button key={o} onClick={() => setInterviewType(o)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${interviewType === o ? 'bg-[#00B4D8] text-[#0D1B2A] border-[#00B4D8]' : 'border-[#00B4D8]/20 text-[#B0C4D8]'}`}>{o}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[#00B4D8] text-xs font-bold uppercase block mb-2">Difficulty</label>
            <div className="flex gap-1">
              {['Easy', 'Medium', 'Hard'].map(o => (
                <button key={o} onClick={() => setDifficulty(o)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${difficulty === o ? 'bg-[#00B4D8] text-[#0D1B2A] border-[#00B4D8]' : 'border-[#00B4D8]/20 text-[#B0C4D8]'}`}>{o}</button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="text-[#00B4D8] text-xs font-bold uppercase block mb-2">Number of Questions: {qCount}</label>
          <input type="range" min="3" max="10" value={qCount} onChange={e => setQCount(Number(e.target.value))} className="w-full accent-[#00B4D8]" />
        </div>
        {selectedTopics.length > 0 && (
          <div className="bg-[#0D1B2A] rounded-xl p-3 border border-[#00B4D8]/10">
            <p className="text-xs text-[#6B8A9E] font-bold mb-2">SELECTED TOPICS ({selectedTopics.length})</p>
            <div className="flex flex-wrap gap-1">
              {selectedTopics.map(t => <span key={t} className="px-2 py-1 bg-[#00B4D8]/10 text-[#00B4D8] text-xs rounded-full font-bold">{TOPIC_GROUPS.find(g => g.id === t)?.icon} {TOPIC_GROUPS.find(g => g.id === t)?.label}</span>)}
            </div>
          </div>
        )}
        <button onClick={startIntroChat} disabled={selectedTopics.length === 0} className="w-full py-4 bg-[#00B4D8] text-[#0D1B2A] font-bold rounded-xl text-lg disabled:opacity-40">
          Meet Your Interviewer 👋
        </button>
      </div>
    </div>
  );

  if (phase === 'intro_chat') return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[#1A2E44] rounded-3xl border border-[#00B4D8]/10 overflow-hidden">
        <div className="bg-[#0D1B2A] px-6 py-4 flex items-center gap-3 border-b border-[#00B4D8]/10">
          <div className="w-10 h-10 rounded-full bg-[#00B4D8]/20 flex items-center justify-center text-[#00B4D8] font-bold text-lg">🎙️</div>
          <div>
            <p className="text-white font-bold text-sm">Interviewer — AI Panel</p>
            <p className="text-[#00C896] text-xs font-bold">● Live · Camera Active</p>
          </div>
          {cameraOn && (
            <div className="ml-auto">
              <video ref={videoRef} className="w-20 h-14 object-cover rounded-lg border border-[#00B4D8]/20 transform scale-x-[-1]" muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>
        <div className="h-80 overflow-y-auto p-6 space-y-4">
          {chatLog.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${msg.role === 'user' ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-[#00B4D8]/20 text-[#00B4D8]'}`}>
                {msg.role === 'user' ? '👤' : '🎙️'}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#00B4D8]/15 text-[#EEF4F7] rounded-tr-none' : 'bg-[#0D1B2A] text-[#EEF4F7] rounded-tl-none'}`}>
                {msg.text.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-[#00B4D8]">{part}</strong> : part)}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00B4D8]/20 flex items-center justify-center text-sm">🎙️</div>
              <div className="bg-[#0D1B2A] px-4 py-3 rounded-2xl rounded-tl-none"><Loader2 size={16} className="text-[#00B4D8] animate-spin" /></div>
            </div>
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00B4D8]/20 flex items-center justify-center text-sm">🎙️</div>
              <div className="bg-[#0D1B2A] px-4 py-3 rounded-2xl rounded-tl-none text-sm text-[#B0C4D8]">
                <Loader2 size={16} className="text-[#00B4D8] animate-spin inline mr-2" /> Generating your interview...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        {!introComplete && (
          <div className="p-4 border-t border-[#00B4D8]/10 flex gap-3">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !chatLoading && sendChat()}
              placeholder="Type your response... (type 'ready' to begin the interview)"
              className="flex-1 bg-[#0D1B2A] border border-[#00B4D8]/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00B4D8]" />
            <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
              className="px-5 py-3 bg-[#00B4D8] text-[#0D1B2A] font-bold rounded-xl disabled:opacity-40">Send</button>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={() => { stopCamera(); setPhase('topic_select'); setChatLog([]); }}
          className="flex-1 py-3 border border-[#00B4D8]/20 text-[#B0C4D8] rounded-xl font-bold text-sm">← Back</button>
        {!introComplete && (
          <button onClick={() => { setIntroComplete(true); startFormalInterview(); }}
            className="flex-1 py-3 bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30 rounded-xl font-bold text-sm">Skip to Interview →</button>
        )}
      </div>
    </div>
  );

  if (phase === 'interview') return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#1A2E44] rounded-full h-2">
            <div className="bg-[#00B4D8] h-2 rounded-full transition-all" style={{ width: `${(currentQ / questions.length) * 100}%` }} />
          </div>
          <span className="text-[#B0C4D8] text-sm font-bold">Q{currentQ + 1}/{questions.length}</span>
        </div>
        <div className="bg-[#1A2E44] p-8 rounded-3xl border border-[#00B4D8]/10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[#00B4D8]/10 text-[#00B4D8] text-xs font-bold rounded-full">{questions[currentQ]?.topic}</span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${questions[currentQ]?.difficulty === 'Easy' ? 'bg-[#00C896]/10 text-[#00C896]' : questions[currentQ]?.difficulty === 'Hard' ? 'bg-[#FF6B6B]/10 text-[#FF6B6B]' : 'bg-yellow-500/10 text-yellow-400'}`}>{questions[currentQ]?.difficulty}</span>
          </div>
          <p className="text-white text-xl font-bold leading-relaxed">{questions[currentQ]?.question}</p>
        </div>
        <div className="bg-[#1A2E44] p-6 rounded-3xl border border-[#00B4D8]/10">
          <label className="text-[#00B4D8] text-xs font-bold uppercase block mb-3">Your Answer</label>
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={6} placeholder="Walk through your thought process step by step..." className="w-full bg-[#0D1B2A] border border-[#00B4D8]/20 rounded-xl p-4 text-white focus:border-[#00B4D8] outline-none resize-none" />
          <button onClick={submitAnswer} disabled={!answer.trim() || loading} className="mt-4 w-full py-4 bg-[#00B4D8] text-[#0D1B2A] font-bold rounded-xl disabled:opacity-50">
            {loading ? '⏳ Evaluating...' : currentQ < questions.length - 1 ? 'Submit & Next →' : 'Submit & Finish 🎉'}
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-[#1A2E44] rounded-2xl overflow-hidden border border-[#00B4D8]/10">
          <video ref={videoRef} className="w-full aspect-video object-cover transform scale-x-[-1]" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
          <div className="p-4 space-y-3">
            <p className="text-[#00B4D8] text-xs font-bold uppercase">Live Analysis</p>
            {[
              { label: 'Eye Contact', val: camMetrics.eyeContact, color: camMetrics.eyeContact > 70 ? '#00C896' : '#FF6B6B' },
              { label: 'Confidence', val: camMetrics.confidence, color: '#00B4D8' },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1"><span className="text-[#B0C4D8] font-bold">{m.label}</span><span className="font-bold" style={{ color: m.color }}>{m.val}%</span></div>
                <div className="h-1.5 bg-[#0D1B2A] rounded-full"><div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${m.val}%`, background: m.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (phase === 'results') {
    const avg = key => Math.round(scores.reduce((a, s) => a + (s[key] || 0), 0) / scores.length * 10) / 10;
    const overall = avg('overall');
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-[#1A2E44] p-8 rounded-3xl border border-[#00B4D8]/10 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Interview Complete!</h2>
          <div className="flex justify-center gap-8 flex-wrap">
            <GaugeChart value={Math.round(overall * 10)} label="Overall Score" color={overall >= 7 ? '#00C896' : overall >= 5 ? '#F59E0B' : '#FF6B6B'} />
            <GaugeChart value={avg('eyeContact')} label="Eye Contact" color="#00B4D8" />
            <GaugeChart value={avg('confidence')} label="Confidence" color="#A78BFA" />
          </div>
          <button onClick={() => { setPhase('topic_select'); setScores([]); setCurrentQ(0); setChatLog([]); setSelectedTopics([]); setIntroComplete(false); }}
            className="mt-6 px-8 py-3 bg-[#00B4D8] text-[#0D1B2A] font-bold rounded-xl">New Interview</button>
        </div>
        {scores.map((s, i) => (
          <div key={i} className="bg-[#1A2E44] p-6 rounded-2xl border border-[#00B4D8]/10 space-y-3">
            <p className="text-[#00B4D8] text-xs font-bold uppercase">Question {i + 1}</p>
            <p className="text-white font-bold">{s.question}</p>
            <div className="grid grid-cols-3 gap-3">
              {[['Clarity', s.clarity], ['Technical', s.technical], ['Communication', s.communication]].map(([l, v]) => (
                <div key={l} className="bg-[#0D1B2A] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#6B8A9E] font-bold">{l}</p>
                  <p className="text-xl font-bold text-white">{v}/10</p>
                </div>
              ))}
            </div>
            {s.improve?.length > 0 && <div className="text-xs text-[#FF6B6B]">💡 Improve: {s.improve.join(' · ')}</div>}
            {s.good?.length > 0 && <div className="text-xs text-[#00C896]">✅ Good: {s.good.join(' · ')}</div>}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SPGSApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spgs_profile')) || DEFAULT_PROFILE; } catch { return DEFAULT_PROFILE; }
  });
  const [selectedJob, setSelectedJob] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spgs_selected_job')) || null; } catch { return null; }
  });
  const [timeline, setTimeline] = useState(() => parseInt(localStorage.getItem('spgs_timeline') || '3'));
  const [lastMatch, setLastMatch] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spgs_last_match')) || null; } catch { return null; }
  });
  const [roadmap, setRoadmap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spgs_roadmap')) || null; } catch { return null; }
  });
  const [roadmapProgress, setRoadmapProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spgs_roadmap_progress')) || {}; } catch { return {}; }
  });
  const [apiProvider, setApiProvider] = useState(localStorage.getItem('spgs_api_provider') || 'gemini');
  const [apiKeys, setApiKeys] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spgs_api_keys')) || { anthropic: '', openai: '', gemini: '' }; } catch { return { anthropic: '', openai: '', gemini: '' }; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [studyTimerDay, setStudyTimerDay] = useState(null);
  const [resourceModal, setResourceModal] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('spgs_profile', JSON.stringify(profile));
      localStorage.setItem('spgs_api_provider', apiProvider);
      localStorage.setItem('spgs_api_keys', JSON.stringify(apiKeys));
      localStorage.setItem('spgs_last_match', JSON.stringify(lastMatch));
      localStorage.setItem('spgs_roadmap', JSON.stringify(roadmap));
      localStorage.setItem('spgs_roadmap_progress', JSON.stringify(roadmapProgress));
      localStorage.setItem('spgs_selected_job', JSON.stringify(selectedJob));
      localStorage.setItem('spgs_timeline', String(timeline));
    } catch (e) {}
  }, [profile, apiProvider, apiKeys, lastMatch, roadmap, roadmapProgress, selectedJob, timeline]);

  const handleMatch = async () => {
    if (!selectedJob && !profile.resumeText) { alert('Please upload your resume and select a job.'); return; }
    setIsLoading(true);
    try {
      const jdText = selectedJob
        ? `${selectedJob.title} at ${selectedJob.company}\n\nRequired Skills: ${selectedJob.skills.join(', ')}\n\nJob Description: ${selectedJob.description}`
        : 'General Software Role';
      const sys = `You are an expert ATS. Compare JD with Resume. Return ONLY valid JSON: { "matchScore": Number, "strongSkills": ["skill"], "skillGaps": ["gap"], "insights": ["tip"] }`;
      const userMsg = `JD:\n${jdText}\n\nPROFILE:\nCGPA: ${profile.cgpa}\nResume:\n${profile.resumeText}`;
      const result = await callAI(sys, userMsg, apiProvider, apiKeys);
      setLastMatch(result);
      if (selectedJob) setProfile(p => ({ ...p, targetRole: selectedJob.title }));
    } catch (e) { alert(e.message); } finally { setIsLoading(false); }
  };

  // ── ROADMAP: EXACT TIMELINE SCALING ──
  const handleGenerateRoadmap = async () => {
    setIsLoading(true);
    try {
      // 1 month = 4 weeks, 2 months = 8 weeks, etc.
      const weeks = timeline * 4;
      // Assuming 5 study days per week
      const totalDays = weeks * 5;

      const jobContext = selectedJob
        ? `Target Role: ${selectedJob.title} at ${selectedJob.company}
Required Skills: ${selectedJob.skills.join(', ')}
Job Description: ${selectedJob.description}
Skill Gaps to address: ${lastMatch?.skillGaps?.join(', ') || 'General improvement'}`
        : `Target Role: ${profile.targetRole}
Skill Gaps to address: ${lastMatch?.skillGaps?.join(', ') || 'General improvement'}`;

      const sys = `You are a career coach building a highly specific, personalized study plan.
The user needs a roadmap lasting EXACTLY ${timeline} months, which means exactly ${weeks} weeks.
You must generate exactly ${weeks} weeks of content, and each week must have exactly 5 days.
Every day's topic MUST directly address the user's skill gaps and the required skills of the target job.
Make the topics progressive (basics first, advanced later).
Return ONLY valid JSON in this exact structure:
{ 
  "roadmapTitle":"${timeline}-Month Plan for ${selectedJob ? selectedJob.title : profile.targetRole}",
  "weeks":[
    {
      "weekNumber":1,
      "theme":"String",
      "days":[
        {"day":1,"topic":"String","resources":["Specific Resource Name or Topic"],"difficulty":"Easy|Medium|Hard"}
      ]
    }
  ] 
}`;

      const result = await callAI(sys, jobContext, apiProvider, apiKeys);
      setRoadmap(result);
      setRoadmapProgress({});
      setActiveTab('roadmap');
    } catch (e) { alert(e.message); } finally { setIsLoading(false); }
  };

  const completedDays = Object.keys(roadmapProgress).length;
  const totalDays = roadmap ? roadmap.weeks.reduce((acc, w) => acc + w.days.length, 0) : 0;
  const progressPct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const readiness = Math.round(((lastMatch?.matchScore ?? 0) * 0.4) + (progressPct * 0.35) + (75 * 0.25));

  return (
    <div className="bg-[#0D1B2A] min-h-screen text-[#EEF4F7] font-sans flex">
      {/* SIDEBAR */}
      <div className="hidden md:flex flex-col w-64 bg-[#1A2E44] h-screen fixed left-0 top-0 border-r border-[#00B4D8]/20 z-40">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00B4D8] rounded-lg flex items-center justify-center font-bold text-[#0D1B2A] text-sm">SP</div>
          <span className="text-white font-bold text-xl tracking-tight">GS CORE</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'matcher', label: 'JD Matcher', icon: <Target size={20} /> },
            { id: 'roadmap', label: 'Roadmap', icon: <Map size={20} /> },
            { id: 'progress', label: 'Progress', icon: <BarChart3 size={20} /> },
            { id: 'interview', label: 'Mock Interview', icon: <Mic2 size={20} /> },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#00B4D8] text-[#0D1B2A] font-bold' : 'text-[#B0C4D8] hover:bg-[#00B4D8]/10 hover:text-[#00B4D8] font-bold'}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => setShowSettings(true)} className="m-6 flex items-center gap-3 text-[#B0C4D8] hover:text-white font-bold">
          <Settings size={20} /> Settings
        </button>
      </div>

      {/* MAIN */}
      <main className="flex-1 md:ml-64 p-6 md:p-12 pb-32 max-h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#00B4D8]/10 to-transparent p-8 rounded-3xl border border-[#00B4D8]/20">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome, {profile.name}</h2>
                <p className="text-[#B0C4D8] mb-6">Your AI placement prep system is online.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#1A2E44] p-6 rounded-2xl border border-[#00B4D8]/20 text-center">
                    <p className="text-xs text-[#00B4D8] font-bold uppercase mb-2">Readiness</p>
                    <p className="text-4xl font-bold text-[#00C896]">{readiness}%</p>
                  </div>
                  <div className="bg-[#1A2E44] p-6 rounded-2xl border border-[#00B4D8]/20 text-center">
                    <p className="text-xs text-[#00B4D8] font-bold uppercase mb-2">JD Match</p>
                    <p className="text-4xl font-bold">{lastMatch ? `${lastMatch.matchScore}%` : '--'}</p>
                  </div>
                  <div className="bg-[#1A2E44] p-6 rounded-2xl border border-[#00B4D8]/20 text-center">
                    <p className="text-xs text-[#00B4D8] font-bold uppercase mb-2">Roadmap</p>
                    <p className="text-4xl font-bold">{roadmap ? `${completedDays}/${totalDays}` : '--'}</p>
                  </div>
                  <div className="bg-[#1A2E44] p-6 rounded-2xl border border-[#00B4D8]/20 flex items-center justify-center">
                    <button onClick={() => setActiveTab('interview')} className="w-full py-3 bg-[#00B4D8] text-[#0D1B2A] font-bold rounded-xl text-sm">Start Interview</button>
                  </div>
                </div>
              </div>
              {selectedJob && (
                <div className="bg-[#1A2E44] p-6 rounded-2xl border border-[#00C896]/20">
                  <p className="text-xs text-[#00C896] font-bold uppercase mb-2">🎯 Current Target</p>
                  <p className="text-white font-bold">{selectedJob.title} at {selectedJob.company}</p>
                  <p className="text-[#6B8A9E] text-sm">{selectedJob.location} · Timeline: {timeline} month{timeline > 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          )}

          {/* MATCHER */}
          {activeTab === 'matcher' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-[#1A2E44] p-6 rounded-3xl border border-[#00B4D8]/10">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FileText className="text-[#00B4D8]" size={20} /> Your Resume</h2>
                  <ResumeUploader profile={profile} setProfile={setProfile} />
                </div>
                <div className="bg-[#1A2E44] p-6 rounded-3xl border border-[#00B4D8]/10 space-y-5">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase className="text-[#00B4D8]" size={20} /> Job & Timeline</h2>
                  <JobSelector onSelect={setSelectedJob} selectedJob={selectedJob} />
                  <TimelinePicker value={timeline} onChange={setTimeline} />
                  <button disabled={isLoading || !profile.resumeText} onClick={handleMatch}
                    className="w-full py-4 bg-[#00B4D8] text-[#0D1B2A] font-bold rounded-xl flex justify-center gap-2 disabled:opacity-40">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'ANALYSE PROFILE VS JD'}
                  </button>
                </div>
              </div>
              {lastMatch && (
                <div className="bg-[#1A2E44] p-8 rounded-3xl border border-[#00B4D8]/10 space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-[#00B4D8] mb-2">{lastMatch.matchScore || 0}%</div>
                    <p className="text-[#B0C4D8] uppercase text-xs tracking-widest font-bold">Match Index</p>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-[#00C896]" /> Strong Skills</h4>
                    <div className="flex flex-wrap gap-2">{lastMatch.strongSkills?.map(s => <span key={s} className="px-3 py-1 bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20 rounded-full text-xs font-bold">{s}</span>)}</div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2"><AlertCircle size={16} className="text-[#FF6B6B]" /> Skill Gaps</h4>
                    <div className="flex flex-wrap gap-2">{lastMatch.skillGaps?.map(s => <span key={s} className="px-3 py-1 bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/20 rounded-full text-xs font-bold">{s}</span>)}</div>
                  </div>
                  {lastMatch.insights?.length > 0 && (
                    <div>
                      <h4 className="text-white font-bold mb-3">💡 Insights</h4>
                      <ul className="space-y-2">{lastMatch.insights.map((tip, i) => <li key={i} className="text-[#B0C4D8] text-sm flex gap-2"><span className="text-[#00B4D8]">→</span>{tip}</li>)}</ul>
                    </div>
                  )}
                  <button onClick={handleGenerateRoadmap} disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-[#00B4D8] to-[#0096B7] text-[#0D1B2A] font-bold rounded-xl flex justify-center gap-2 disabled:opacity-40">
                    {isLoading ? <Loader2 className="animate-spin" /> : `GENERATE ${timeline}-MONTH ROADMAP →`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              {!roadmap ? (
                <div className="text-center py-20 text-[#B0C4D8] bg-[#1A2E44] rounded-3xl border border-[#00B4D8]/10">
                  <Map size={48} className="mx-auto mb-4 opacity-50 text-[#00B4D8]" />
                  <p className="font-bold">No active roadmap. Go to JD Matcher to generate one!</p>
                </div>
              ) : (
                <div className="bg-[#1A2E44] p-8 rounded-3xl border border-[#00B4D8]/10">
                  <h2 className="text-2xl font-bold text-white mb-1">{roadmap.roadmapTitle}</h2>
                  {selectedJob && (
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase size={14} className="text-[#00B4D8]" />
                      <p className="text-[#00B4D8] text-xs font-bold">{selectedJob.title} · {selectedJob.company}</p>
                      <div className="flex flex-wrap gap-1 ml-2">
                        {selectedJob.skills.slice(0, 4).map(s => <span key={s} className="px-2 py-0.5 bg-[#00B4D8]/10 text-[#00B4D8] text-xs rounded-full font-bold">{s}</span>)}
                      </div>
                    </div>
                  )}
                  <p className="text-[#00B4D8] font-bold text-xs uppercase mb-8">Complete days to increase your Readiness score</p>
                  <div className="space-y-8">
                    {roadmap.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-[#00B4D8]/20 pb-2">
                          Week {week.weekNumber}: <span className="text-[#B0C4D8]">{week.theme}</span>
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {week.days.map((day, dIdx) => {
                            const dayId = `${week.weekNumber}-${day.day}`;
                            const isDone = roadmapProgress[dayId];
                            return (
                              <div key={dIdx} className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${isDone ? 'bg-[#00C896]/5 border-[#00C896]/30' : 'bg-[#0D1B2A] border-[#00B4D8]/10'}`}>
                                <button onClick={() => !isDone && setResourceModal({ day, resource: day.resources?.[0] || 'Topic Overview', dayId })}
                                  disabled={isDone}
                                  className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all mt-1 ${isDone ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30 cursor-default' : 'bg-[#00B4D8]/10 text-[#00B4D8] border-[#00B4D8]/30 hover:bg-[#00B4D8]/20 cursor-pointer'}`}>
                                  {isDone ? '✓ Done' : '📖 Study'}
                                </button>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className="text-xs font-bold text-[#00B4D8] bg-[#00B4D8]/10 px-2 py-1 rounded">Day {day.day}</span>
                                    <h4 className={`font-bold ${isDone ? 'text-[#00C896] line-through' : 'text-white'}`}>{day.topic}</h4>
                                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${day.difficulty === 'Easy' ? 'bg-[#00C896]/10 text-[#00C896]' : day.difficulty === 'Hard' ? 'bg-[#FF6B6B]/10 text-[#FF6B6B]' : 'bg-yellow-500/10 text-yellow-400'}`}>{day.difficulty}</span>
                                  </div>
                                  {!isDone && (
                                    <button onClick={() => setStudyTimerDay({ ...day, dayId })} className="mt-2 text-[#00B4D8] text-xs font-bold flex items-center gap-1 hover:text-white transition-colors">
                                      ⏱️ Start Focus Timer
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROGRESS — GAUGE CHARTS */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="bg-[#1A2E44] p-8 rounded-3xl border border-[#00B4D8]/10">
                <h2 className="text-2xl font-bold text-white mb-8">Performance Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-[#0D1B2A] rounded-2xl p-6 border border-[#00B4D8]/10 flex flex-col items-center gap-2">
                    <GaugeChart value={readiness} label="Overall Readiness" color="#00C896" size={200} />
                    <p className="text-[#6B8A9E] text-xs text-center">Composite score based on JD match, roadmap progress, and interview performance</p>
                  </div>
                  <div className="bg-[#0D1B2A] rounded-2xl p-6 border border-[#00B4D8]/10 flex flex-col items-center gap-2">
                    <GaugeChart value={lastMatch?.matchScore ?? 0} label="JD Match Score" color="#00B4D8" size={200} />
                    <p className="text-[#6B8A9E] text-xs text-center">How well your resume matches the selected job description</p>
                  </div>
                  <div className="bg-[#0D1B2A] rounded-2xl p-6 border border-[#00B4D8]/10 flex flex-col items-center gap-2">
                    <GaugeChart value={progressPct} label="Roadmap Progress" color="#A78BFA" size={200} />
                    <p className="text-[#6B8A9E] text-xs text-center">{completedDays} of {totalDays} days completed in your study plan</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1A2E44] p-6 rounded-2xl border border-[#00B4D8]/10">
                  <h3 className="text-white font-bold mb-4">Strong Skills</h3>
                  {lastMatch?.strongSkills?.length ? (
                    <div className="flex flex-wrap gap-2">{lastMatch.strongSkills.map(s => <span key={s} className="px-3 py-1.5 bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20 rounded-full text-xs font-bold">{s}</span>)}</div>
                  ) : <p className="text-[#6B8A9E] text-sm">Run a JD match to see your strengths.</p>}
                </div>
                <div className="bg-[#1A2E44] p-6 rounded-2xl border border-[#00B4D8]/10">
                  <h3 className="text-white font-bold mb-4">Skills to Develop</h3>
                  {lastMatch?.skillGaps?.length ? (
                    <div className="flex flex-wrap gap-2">{lastMatch.skillGaps.map(s => <span key={s} className="px-3 py-1.5 bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/20 rounded-full text-xs font-bold">{s}</span>)}</div>
                  ) : <p className="text-[#6B8A9E] text-sm">Run a JD match to see skill gaps.</p>}
                </div>
              </div>
            </div>
          )}

          {/* MOCK INTERVIEW */}
          {activeTab === 'interview' && (
            <MockInterviewPage profile={profile} apiProvider={apiProvider} apiKeys={apiKeys} />
          )}

        </div>
      </main>

      {/* MODALS */}
      {studyTimerDay && (
        <StudyTimerModal day={studyTimerDay} onClose={() => setStudyTimerDay(null)}
          onComplete={() => { setRoadmapProgress(p => ({ ...p, [studyTimerDay.dayId]: true })); setStudyTimerDay(null); }} />
      )}
      {resourceModal && (
        <ResourceModal data={resourceModal} onClose={() => setResourceModal(null)}
          apiProvider={apiProvider} apiKeys={apiKeys}
          onQuizPass={(dayId) => setRoadmapProgress(p => ({ ...p, [dayId]: true }))} />
      )}

      {/* SETTINGS */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-[#0D1B2A]/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#1A2E44] w-full max-w-md p-8 rounded-3xl border border-[#00B4D8]/20 shadow-2xl space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Cpu className="text-[#00B4D8]" /> API Setup</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[#00B4D8] text-xs font-bold uppercase block mb-2">Your Name</label>
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full bg-[#0D1B2A] border border-[#00B4D8]/20 rounded-xl p-3 text-white outline-none focus:border-[#00B4D8]" />
              </div>
              <div>
                <label className="text-[#00B4D8] text-xs font-bold uppercase block mb-2">Branch / Major</label>
                <input value={profile.branch} onChange={e => setProfile(p => ({ ...p, branch: e.target.value }))} className="w-full bg-[#0D1B2A] border border-[#00B4D8]/20 rounded-xl p-3 text-white outline-none focus:border-[#00B4D8]" />
              </div>
              <div>
                <label className="text-[#00B4D8] text-xs font-bold uppercase block mb-2">CGPA</label>
                <input value={profile.cgpa} onChange={e => setProfile(p => ({ ...p, cgpa: e.target.value }))} className="w-full bg-[#0D1B2A] border border-[#00B4D8]/20 rounded-xl p-3 text-white outline-none focus:border-[#00B4D8]" />
              </div>
            </div>
            <div className="border-t border-[#00B4D8]/10 pt-4">
              <label className="text-[#00B4D8] text-xs font-bold uppercase block mb-2">AI Provider</label>
              <div className="flex gap-2 bg-[#0D1B2A] p-2 rounded-xl mb-4">
                {['gemini', 'openai', 'anthropic'].map(prov => (
                  <button key={prov} onClick={() => setApiProvider(prov)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wider ${apiProvider === prov ? 'bg-[#00B4D8] text-[#0D1B2A]' : 'text-[#B0C4D8] hover:text-white'}`}>{prov}</button>
                ))}
              </div>
              <input type="password" placeholder={`Enter ${apiProvider} API key...`}
                className="w-full bg-[#0D1B2A] border border-[#00B4D8]/20 rounded-xl p-4 text-white outline-none focus:border-[#00B4D8]"
                value={apiKeys[apiProvider]} onChange={e => setApiKeys({ ...apiKeys, [apiProvider]: e.target.value })} />
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-[#00B4D8] text-[#0D1B2A] font-bold rounded-xl">Save Config ✓</button>
          </div>
        </div>
      )}

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#1A2E44] border-t border-[#00B4D8]/20 px-6 py-4 flex justify-between items-center z-50">
        {[
          { id: 'dashboard', icon: <LayoutDashboard size={24} /> },
          { id: 'matcher', icon: <Target size={24} /> },
          { id: 'roadmap', icon: <Map size={24} /> },
          { id: 'progress', icon: <BarChart3 size={24} /> },
          { id: 'interview', icon: <Mic2 size={24} /> },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={activeTab === item.id ? 'text-[#00B4D8]' : 'text-[#6B8A9E]'}>{item.icon}</button>
        ))}
      </nav>
    </div>
  );
}