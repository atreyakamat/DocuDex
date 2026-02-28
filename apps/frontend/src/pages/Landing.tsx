import { Link } from 'react-router-dom';
import {
  FileText,
  Brain,
  Bell,
  GitBranch,
  Shield,
  Upload,
  Search,
  CheckCircle,
  ChevronRight,
  Zap,
  Database,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

// ─── Data ────────────────────────────────────────────────

const STEPS = [
  {
    step: '01',
    title: 'Upload Your Documents',
    desc: 'Drag and drop any document — Aadhaar, PAN, Passport, bank statements, degree certificates, property deeds, and more. Supports PDF, JPG, PNG, TIFF up to 50 MB.',
    icon: Upload,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    step: '02',
    title: 'AI Classifies & Extracts',
    desc: "Our OCR engine reads every document. A rule-based classifier identifies the document type and category. Field extraction pulls structured data — document numbers, dates, names — automatically.",
    icon: Brain,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    step: '03',
    title: 'Manage, Track & Act',
    desc: 'Your vault stays organised automatically. Get alerted 30 days and 7 days before any document expires. Launch guided workflows for Home Loan, Passport Renewal, GST Registration, and more.',
    icon: CheckCircle,
    color: 'bg-green-50 text-green-600',
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Document Classification',
    desc: 'Tesseract OCR + keyword-rule engine automatically identifies 12+ document types across 7 categories — no manual tagging needed.',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    icon: Search,
    title: 'Smart Field Extraction',
    desc: 'Extracts Aadhaar UID, PAN number, passport number, DL number, EPIC, IFSC, net salary, and more without any configuration.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Bell,
    title: 'Expiry Tracking & Alerts',
    desc: 'A nightly cron job scans every document with an expiry date. You see EXPIRING_SOON at 30 days and get in-app notifications at 7 days.',
    color: 'text-yellow-600 bg-yellow-50',
  },
  {
    icon: GitBranch,
    title: 'Guided Workflow Templates',
    desc: '5 pre-built workflows (Home Loan, Business Incorporation, Passport Renewal, GST Registration, DL Renewal) tell you exactly which documents to gather.',
    color: 'text-green-600 bg-green-50',
  },
  {
    icon: Shield,
    title: 'Secure JWT Auth',
    desc: 'Access tokens expire in 15 minutes. Refresh tokens rotate automatically. Logout is instant — tokens are blacklisted so even if intercepted, they cannot be reused.',
    color: 'text-red-600 bg-red-50',
  },
  {
    icon: Zap,
    title: 'Bulk Upload & Processing',
    desc: 'Upload multiple files at once via the drag-and-drop zone. Each document is processed asynchronously — the UI stays responsive while AI runs in the background.',
    color: 'text-orange-600 bg-orange-50',
  },
];

const DOC_TYPES = [
  { label: 'Aadhaar Card', cat: 'Identity', color: 'border-blue-200 bg-blue-50 text-blue-800' },
  { label: 'PAN Card', cat: 'Identity', color: 'border-blue-200 bg-blue-50 text-blue-800' },
  { label: 'Passport', cat: 'Identity', color: 'border-indigo-200 bg-indigo-50 text-indigo-800' },
  { label: 'Driving License', cat: 'Identity', color: 'border-indigo-200 bg-indigo-50 text-indigo-800' },
  { label: 'Voter ID', cat: 'Identity', color: 'border-violet-200 bg-violet-50 text-violet-800' },
  { label: 'Birth Certificate', cat: 'Identity', color: 'border-violet-200 bg-violet-50 text-violet-800' },
  { label: 'Bank Statement', cat: 'Financial', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { label: 'Salary Slip', cat: 'Financial', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { label: 'ITR Form', cat: 'Financial', color: 'border-teal-200 bg-teal-50 text-teal-800' },
  { label: 'Property Deed', cat: 'Property', color: 'border-amber-200 bg-amber-50 text-amber-800' },
  { label: 'Degree Certificate', cat: 'Education', color: 'border-orange-200 bg-orange-50 text-orange-800' },
  { label: 'Medical Report', cat: 'Medical', color: 'border-rose-200 bg-rose-50 text-rose-800' },
];

const WORKFLOWS = [
  {
    name: 'Home Loan',
    docs: ['Aadhaar', 'PAN', 'Bank Statement (6 months)', 'Salary Slips (3)', 'Property Deed', 'ITR (2 years)'],
    color: 'from-blue-500 to-blue-700',
  },
  {
    name: 'Passport Renewal',
    docs: ['Aadhaar / Voter ID', 'Existing Passport', 'Birth Certificate', 'Address Proof'],
    color: 'from-indigo-500 to-indigo-700',
  },
  {
    name: 'GST Registration',
    docs: ['PAN Card', 'Aadhaar', 'Bank Statement', 'Address Proof', 'Partnership Deed / MoA'],
    color: 'from-emerald-500 to-emerald-700',
  },
  {
    name: 'Business Incorporation',
    docs: ['Director PAN', 'Director Aadhaar', 'Address Proof', 'DIN Certificate', 'MoA / AoA'],
    color: 'from-violet-500 to-violet-700',
  },
  {
    name: 'DL Renewal',
    docs: ['Existing DL', 'Aadhaar / Passport', 'Medical Certificate', 'Passport Photo'],
    color: 'from-amber-500 to-amber-700',
  },
];

const TECH_STACK = [
  { label: 'React + Vite', desc: 'Fast SPA with HMR', icon: '⚛️' },
  { label: 'TypeScript', desc: 'End-to-end type safety', icon: '🔷' },
  { label: 'Tailwind CSS', desc: 'Utility-first styling', icon: '🎨' },
  { label: 'Node.js + Express', desc: 'REST API backend', icon: '🟢' },
  { label: 'PostgreSQL', desc: 'Primary data store', icon: '🐘' },
  { label: 'FastAPI + Python', desc: 'AI & OCR service', icon: '🐍' },
  { label: 'TanStack Query', desc: 'Server state management', icon: '🔄' },
  { label: 'JWT Auth', desc: 'Secure token rotation', icon: '🔐' },
];

// ─── Component ───────────────────────────────────────────

export default function Landing() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">DocuDex</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#documents" className="hover:text-gray-900 transition-colors">Documents</a>
            <a href="#workflows" className="hover:text-gray-900 transition-colors">Workflows</a>
            <a href="#stack" className="hover:text-gray-900 transition-colors">Tech Stack</a>
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-sm">
                Go to App <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-indigo-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.08)_0%,_transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            <Zap className="h-3 w-3" /> AI-Powered · OCR · Auto Classification
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Your Documents,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
              Organised by AI
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            DocuDex is an AI-powered document vault. Upload any document — the AI reads it, classifies it,
            extracts key fields, tracks expiry dates, and guides you through real-world workflows like
            Home Loans, Passport Renewals, and GST Registration.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary px-8 py-3 text-base">
                Open Dashboard <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary px-8 py-3 text-base">
                  Start Free <ChevronRight className="h-4 w-4" />
                </Link>
                <a href="#how-it-works" className="inline-flex items-center gap-2 text-base text-gray-600 hover:text-gray-900 px-6 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  See How It Works
                </a>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-16 pt-10 border-t border-gray-100">
            {[
              { num: '12+', label: 'Document Types' },
              { num: '5', label: 'Workflow Templates' },
              { num: '100%', label: 'Open Source' },
            ].map(({ num, label }) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-primary-600">{num}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How DocuDex Works</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Three steps from raw files to a fully organised, AI-annotated document vault.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%_-_16px)] w-8 border-t-2 border-dashed border-gray-200 z-10" />
                )}
                <div className="bg-gray-50 rounded-2xl p-7 h-full border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${s.color}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="text-4xl font-black text-gray-100">{s.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Architecture callout */}
          <div className="mt-12 bg-gray-900 text-white rounded-2xl p-8 grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-primary-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm mb-1">PostgreSQL (required)</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  All users, documents, workflows, notifications, and audit logs live in a single
                  relational database. Tables are created automatically on first startup.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm mb-1">Redis (optional)</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Used only for token blacklisting on logout and OTP caching. The app starts and runs
                  fully without Redis — logout just skips the blacklist step gracefully.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm mb-1">AI Service (optional)</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  A separate Python FastAPI process with Tesseract OCR. If it's offline, documents
                  upload and save normally — they just stay in PROCESSING status until AI comes up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">What You Get</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Core Features</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all">
                <div className={`inline-flex p-2.5 rounded-xl mb-4 ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Document Types ── */}
      <section id="documents" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Supported Documents</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Every Indian Document, Covered</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              The AI classifier recognises these document types automatically. Just upload — no manual category selection needed.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {DOC_TYPES.map((d) => (
              <div
                key={d.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${d.color}`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{d.label}</span>
                <span className="text-xs opacity-60">· {d.cat}</span>
              </div>
            ))}
          </div>

          {/* Data flow diagram */}
          <div className="mt-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-100">
            <h3 className="text-center font-semibold text-gray-800 mb-8 text-lg">AI Processing Pipeline</h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {[
                { label: 'File Upload', sub: 'PDF / Image', color: 'bg-gray-200 text-gray-700' },
                { label: 'OCR Engine', sub: 'Tesseract', color: 'bg-purple-100 text-purple-700' },
                { label: 'Classifier', sub: 'Keyword Rules', color: 'bg-blue-100 text-blue-700' },
                { label: 'Extractor', sub: 'Regex Fields', color: 'bg-indigo-100 text-indigo-700' },
                { label: 'Document Saved', sub: 'PostgreSQL', color: 'bg-green-100 text-green-700' },
              ].map((node, i, arr) => (
                <div key={node.label} className="flex items-center gap-2 md:gap-4 flex-col md:flex-row">
                  <div className={`px-5 py-3 rounded-xl text-center min-w-[110px] ${node.color}`}>
                    <p className="text-sm font-semibold">{node.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{node.sub}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-gray-300 shrink-0 rotate-90 md:rotate-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflows ── */}
      <section id="workflows" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Guided Checklists</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Built-in Workflow Templates</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Never wonder which documents you need. Start a workflow and DocuDex tracks exactly what's missing.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WORKFLOWS.map((wf) => (
              <div key={wf.name} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className={`bg-gradient-to-r ${wf.color} px-5 py-4`}>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-white/80" />
                    <h3 className="font-semibold text-white">{wf.name}</h3>
                  </div>
                </div>
                <ul className="p-4 space-y-1.5">
                  {wf.docs.map((doc) => (
                    <li key={doc} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section id="stack" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Built With</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Modern Tech Stack</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TECH_STACK.map((t) => (
              <div key={t.label} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-primary-200 hover:bg-primary-50 transition-all">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to organise your documents with AI?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
            Start with just PostgreSQL. No Redis or AI service required to get up and running in minutes.
          </p>
          {isAuthenticated ? (
            <Link to="/dashboard" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Open Dashboard <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
                Create Account <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 bg-primary-700/50 text-white border border-white/20 font-semibold px-8 py-3 rounded-xl hover:bg-primary-700/80 transition-colors">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1 rounded">
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">DocuDex</span>
            <span className="text-xs">— AI-Powered Document Management</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <Link to="/register" className="hover:text-white transition-colors">Get Started</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <a href="#stack" className="hover:text-white transition-colors">Tech Stack</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
