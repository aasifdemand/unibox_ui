import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail, ChevronRight, Zap, Shield, BarChart3, ArrowRight, Globe, Users,
    CheckCircle2, Menu, X, Plus, Send, Target, Sparkles, MousePointer2,
    LayoutDashboard, Inbox, Workflow, ShieldCheck, LineChart, Bot, Clock,
    Repeat, Split, Gauge, Rocket, MessageSquare, Settings, TrendingUp,
    Award, Github, Twitter, Linkedin, Star, Play, Pause, RefreshCw,
    Filter, Download, Upload, Copy, Trash2, Edit3, Check, AlertCircle
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'motion/react';

/* ─────────────────────────── tiny helpers ─────────────────────────── */
const GradientText = ({ children, className = '' }) => (
    <span className={`bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 bg-clip-text text-transparent ${className}`}>
        {children}
    </span>
);

const Pill = ({ children, className = '' }) => (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full border ${className}`}>
        {children}
    </span>
);

/* ─────────────────────────── floating orbs bg ─────────────────────── */
const MeshBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-indigo-100/60 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-violet-100/50 blur-[100px]" />
        <div className="absolute -bottom-20 right-1/3 w-[400px] h-[400px] rounded-full bg-purple-100/40 blur-[90px]" />
        {/* grid overlay */}
        <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
                backgroundImage: `linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)`,
                backgroundSize: '60px 60px'
            }}
        />
    </div>
);

/* ─────────────────────────── noise card ──────────────────────────── */
const GlassCard = ({ children, className = '', hover = true }) => (
    <div
        className={`relative bg-white/70 backdrop-blur-sm border border-white/80 shadow-[0_4px_24px_-4px_rgba(99,102,241,0.12)] ${hover ? 'hover:shadow-[0_8px_40px_-4px_rgba(99,102,241,0.22)] hover:-translate-y-1 transition-all duration-300' : ''} ${className}`}
    >
        {children}
    </div>
);

/* ─────────────────────────── animated counter ──────────────────────── */
const Counter = ({ target, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const num = parseInt(target.replace(/\D/g, ''));
                const dur = 1800;
                const step = Math.ceil(num / (dur / 16));
                let cur = 0;
                const timer = setInterval(() => {
                    cur = Math.min(cur + step, num);
                    setCount(cur);
                    if (cur >= num) clearInterval(timer);
                }, 16);
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target]);

    const display = target.includes('M') ? `${(count / 1000000).toFixed(0)}M` :
        target.includes('K') ? `${(count / 1000).toFixed(0)}K` :
            target.includes('%') ? `${count}%` : count;

    return <span ref={ref}>{display}{suffix}</span>;
};

/* ══════════════════════════ MAIN COMPONENT ══════════════════════════ */
const Landing = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [demoPlaying, setDemoPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

    useEffect(() => {
        const fn = () => setIsScrolled(window.scrollY > 40);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    /* ── data ── */
    const mailboxFeatures = [
        {
            icon: <Globe className="w-5 h-5" />,
            title: 'Gmail & Google Workspace',
            desc: 'Native OAuth2 integration with automatic token refresh and full Gmail API optimisation.',
            bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100',
            accent: 'from-red-400 to-rose-500',
            stats: ['99.9 % uptime', 'Real-time sync', 'Label management'],
        },
        {
            icon: <Inbox className="w-5 h-5" />,
            title: 'Microsoft Outlook & 365',
            desc: 'Enterprise-grade integration with Azure AD, Graph API, and Exchange Online support.',
            bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100',
            accent: 'from-blue-400 to-indigo-500',
            stats: ['Azure AD SSO', 'Calendar sync', 'Folder management'],
        },
        {
            icon: <Zap className="w-5 h-5" />,
            title: 'Custom SMTP / IMAP',
            desc: 'Connect any email provider with advanced security protocols and connection pooling.',
            bg: 'bg-amber-50', text: 'text-amber-500', border: 'border-amber-100',
            accent: 'from-amber-400 to-orange-500',
            stats: ['SSL / TLS support', 'Connection pooling', 'Rate limiting'],
        },
    ];

    const campaignFeatures = [
        { icon: <Workflow className="w-5 h-5" />, title: 'Visual Sequence Builder', desc: 'Drag-and-drop workflow editor with conditional branching and A/B testing.', accent: 'from-indigo-500 to-violet-600', details: ['Time delays', 'Conditional logic', 'Split testing'] },
        { icon: <Repeat className="w-5 h-5" />, title: 'Smart Rotations', desc: 'Intelligent mailbox rotation with deliverability optimisation and cooldown periods.', accent: 'from-emerald-500 to-teal-600', details: ['Auto failover', 'Warm-up sequences', 'Health scoring'] },
        { icon: <LineChart className="w-5 h-5" />, title: 'Real-time Analytics', desc: 'Comprehensive tracking with campaign performance dashboards and custom reports.', accent: 'from-violet-500 to-purple-600', details: ['Open / click tracking', 'Reply detection', 'Revenue attribution'] },
        { icon: <Bot className="w-5 h-5" />, title: 'AI-Powered Optimisation', desc: 'Machine learning algorithms that optimise send times and content performance.', accent: 'from-blue-500 to-cyan-600', details: ['Send time optimisation', 'Content scoring', 'Spam prediction'] },
    ];

    const stats = [
        { value: '10M', suffix: '+', label: 'Emails sent', icon: <Send className="w-4 h-4" /> },
        { value: '98', suffix: '%', label: 'Delivery rate', icon: <CheckCircle2 className="w-4 h-4" /> },
        { value: '50K', suffix: '+', label: 'Active users', icon: <Users className="w-4 h-4" /> },
        { value: '24', suffix: '/7', label: 'Support', icon: <MessageSquare className="w-4 h-4" /> },
    ];

    const testimonials = [
        { name: 'Sarah Chen', role: 'Sales Director · TechFlow', content: 'Unibox transformed our outreach. We\'re seeing 3× reply rates with their smart rotation system.', avatar: 'SC', color: 'from-indigo-500 to-violet-600' },
        { name: 'Marcus Rodriguez', role: 'Founder · GrowthLabs', content: 'The unified inbox feature is a game-changer. Managing 50+ mailboxes has never been easier.', avatar: 'MR', color: 'from-violet-500 to-purple-600' },
        { name: 'Emily Watson', role: 'Marketing Lead · ScaleUp', content: 'Best deliverability tool we\'ve used. Our emails finally land in the inbox, not spam.', avatar: 'EW', color: 'from-purple-500 to-pink-500' },
    ];

    const plans = [
        { name: 'Starter', price: '$49', period: '/mo', desc: 'Perfect for small teams', features: ['5 mailboxes', '10,000 emails/mo', 'Basic sequences', 'Email support', 'Basic analytics'], popular: false },
        { name: 'Pro', price: '$99', period: '/mo', desc: 'Ideal for growing teams', features: ['25 mailboxes', '50,000 emails/mo', 'Advanced sequences', 'Priority support', 'Advanced analytics', 'AI optimisation', 'Custom branding'], popular: true },
        { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large organisations', features: ['Unlimited mailboxes', 'Unlimited emails', 'Custom workflows', 'Dedicated support', 'Custom reporting', 'API access', 'SLA guarantee'], popular: false },
    ];

    const integrations = [
        { name: 'Gmail', logo: 'G', color: 'bg-gradient-to-br from-red-400 to-rose-500' },
        { name: 'Outlook', logo: 'O', color: 'bg-gradient-to-br from-blue-400 to-indigo-500' },
        { name: 'Yahoo', logo: 'Y', color: 'bg-gradient-to-br from-purple-400 to-violet-500' },
        { name: 'iCloud', logo: 'I', color: 'bg-gradient-to-br from-slate-400 to-slate-500' },
        { name: 'Zoho', logo: 'Z', color: 'bg-gradient-to-br from-emerald-400 to-teal-500' },
        { name: 'Proton', logo: 'P', color: 'bg-gradient-to-br from-indigo-400 to-purple-500' },
    ];

    /* ═══════════════════ RENDER ═══════════════════ */
    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* ── NAV ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/85 backdrop-blur-2xl shadow-sm border-b border-slate-100 py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5 cursor-pointer select-none">
                        <div className="relative w-9 h-9">
                            <div className="absolute inset-0 bg-indigo-600 rounded-xl blur-md opacity-50" />
                            <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                                <Mail className="text-white w-4 h-4" />
                            </div>
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Unibox.</span>
                    </motion.div>

                    <div className="hidden md:flex items-center gap-1">
                        {['Features', 'Solutions', 'Pricing'].map(item => (
                            <a key={item} href={`#${item.toLowerCase()}`}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                                {item}
                            </a>
                        ))}
                        <div className="w-px h-5 bg-slate-200 mx-2" />
                        <Link to="/auth/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">Log in</Link>
                        <Link to="/auth/signup" className="ml-1 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95">
                            Get started →
                        </Link>
                    </div>

                    <button className="md:hidden p-2 hover:bg-slate-100 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl px-6 py-5 space-y-3">
                            {['Features', 'Solutions', 'Pricing'].map(item => (
                                <a key={item} href={`#${item.toLowerCase()}`} className="block py-2 text-slate-700 font-medium hover:text-indigo-600 transition-colors">{item}</a>
                            ))}
                            <div className="border-t border-slate-100 pt-4 space-y-3">
                                <Link to="/auth/login" className="block py-2 text-slate-700 font-medium">Log in</Link>
                                <Link to="/auth/signup" className="block w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-center hover:bg-indigo-700">Get started</Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ── HERO ── */}
            <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-20 px-6 overflow-hidden">
                <MeshBackground />

                <div className="max-w-7xl mx-auto w-full relative z-10">
                    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
                        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <Pill className="border-indigo-200 bg-indigo-50/80 text-indigo-700 mb-8">
                                    <Sparkles className="w-3 h-3" /> Unified Email Outreach Platform
                                </Pill>
                            </motion.div>

                            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
                                className="text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.0] tracking-tighter mb-7"
                                style={{ fontFamily: 'Outfit, sans-serif' }}>
                                Master Your<br />
                                <GradientText>Email&nbsp;Outreach</GradientText>
                            </motion.h1>

                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                                className="text-lg text-slate-500 leading-relaxed mb-10 max-w-md">
                                Connect Gmail, Outlook, and custom SMTP servers in one powerful platform.
                                Automate sequences, rotate mailboxes, and scale without limits.
                            </motion.p>

                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                                className="flex flex-col sm:flex-row gap-3 mb-10">
                                <button onClick={() => navigate('/auth/signup')}
                                    className="group relative overflow-hidden px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2">
                                    <span className="relative z-10">Start Free Trial</span>
                                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                                <button className="px-8 py-4 bg-white/80 backdrop-blur border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-white hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Play className="w-3 h-3 text-indigo-600 ml-0.5" />
                                    </div>
                                    Watch Demo
                                </button>
                            </motion.div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.36 }}
                                className="flex items-center gap-5 text-sm text-slate-400">
                                {['No credit card', '14-day trial', 'Cancel anytime'].map(t => (
                                    <div key={t} className="flex items-center gap-1.5">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>{t}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Hero visual */}
                        <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.15 }} className="relative">
                            {/* glow halo */}
                            <div className="absolute inset-8 bg-gradient-to-br from-indigo-400/30 to-purple-400/20 rounded-3xl blur-2xl" />

                            <GlassCard hover={false} className="rounded-3xl overflow-hidden p-1 bg-white/90">
                                {/* fake browser chrome */}
                                <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-3 rounded-t-2xl">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-1 text-xs text-slate-400">app.unibox.io/dashboard</div>
                                </div>

                                {/* Dashboard preview mockup */}
                                <div className="bg-white rounded-b-2xl p-5 space-y-4">
                                    {/* top bar */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-slate-400 mb-1">Campaign overview</div>
                                            <div className="text-xl font-black text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Q2 Outreach</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg">Active</div>
                                            <div className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">Export</div>
                                        </div>
                                    </div>

                                    {/* stat row */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Sent', value: '12,481', delta: '+12%', color: 'indigo' },
                                            { label: 'Opens', value: '8,234', delta: '+8%', color: 'violet' },
                                            { label: 'Replies', value: '1,072', delta: '+24%', color: 'purple' },
                                        ].map(s => (
                                            <div key={s.label} className={`bg-${s.color}-50/60 border border-${s.color}-100 rounded-xl p-3`}>
                                                <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                                                <div className="font-black text-slate-900 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                                                <div className={`text-xs text-${s.color}-600 font-semibold mt-0.5`}>{s.delta}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* sparkline bars */}
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <div className="text-xs text-slate-400 mb-3">Daily sends (last 7 days)</div>
                                        <div className="flex items-end gap-1.5 h-16">
                                            {[40, 65, 55, 80, 72, 90, 85].map((h, i) => (
                                                <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.6 + i * 0.07, duration: 0.4 }}
                                                    style={{ height: `${h}%`, transformOrigin: 'bottom' }}
                                                    className={`flex-1 rounded-t-sm ${i === 5 ? 'bg-indigo-500' : 'bg-indigo-200'}`} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* sequence list */}
                                    <div className="space-y-2">
                                        {[
                                            { name: 'Cold intro — SaaS', status: 'Running', sent: 4120, pct: 68 },
                                            { name: 'Follow-up wave 2', status: 'Scheduled', sent: 2890, pct: 45 },
                                        ].map(seq => (
                                            <div key={seq.name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${seq.status === 'Running' ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-semibold text-slate-700 truncate">{seq.name}</div>
                                                    <div className="h-1.5 bg-slate-200 rounded-full mt-1.5">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${seq.pct}%` }} transition={{ delay: 0.8, duration: 0.8 }}
                                                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-400 flex-shrink-0">{seq.sent.toLocaleString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>

                            {/* floating badge */}
                            <motion.div initial={{ opacity: 0, x: 20, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.9 }}
                                className="absolute -right-4 top-1/3 bg-white rounded-2xl shadow-2xl shadow-indigo-100 border border-slate-100 p-3 pr-5 flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Reply rate</div>
                                    <div className="text-lg font-black text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>+34%</div>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}
                                className="absolute -left-4 bottom-16 bg-white rounded-2xl shadow-2xl shadow-indigo-100 border border-slate-100 p-3 pr-5 flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Delivered</div>
                                    <div className="text-lg font-black text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>98.2%</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── LOGO BAR ── */}
            <section className="py-12 px-6 border-y border-slate-100 bg-white">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-8">Trusted by teams at</p>
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        {['Stripe', 'Notion', 'Linear', 'Vercel', 'Loom', 'Figma'].map(name => (
                            <div key={name} className="text-slate-300 text-xl font-black tracking-tight hover:text-slate-500 transition-colors cursor-default select-none"
                                style={{ fontFamily: 'Outfit, sans-serif' }}>
                                {name}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="relative bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm overflow-hidden group hover:border-indigo-200 hover:shadow-md transition-all">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10">
                                    <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-xl mb-4 text-indigo-500 group-hover:bg-indigo-100 transition-colors">
                                        {s.icon}
                                    </div>
                                    <div className="text-4xl font-black text-slate-900 tabular-nums" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                        <Counter target={s.value} suffix={s.suffix} />
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">{s.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── MAILBOX INTEGRATIONS ── */}
            <section id="features" className="py-28 px-6 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/30 rounded-full -translate-y-1/2 translate-x-1/3 blur-[80px]" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="max-w-2xl mb-16">
                        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}>
                            <Pill className="border-indigo-200 bg-indigo-50 text-indigo-700 mb-5">
                                <Globe className="w-3 h-3" /> Integrations
                            </Pill>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                Connect every<br /><GradientText>email provider</GradientText>
                            </h2>
                            <p className="text-lg text-slate-500">Seamlessly integrate with all major email platforms through a single, unified interface.</p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {mailboxFeatures.map((f, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                onHoverStart={() => setHoveredFeature(i)} onHoverEnd={() => setHoveredFeature(null)}
                                className="relative bg-white rounded-2xl border border-slate-200 p-7 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 group cursor-default overflow-hidden">
                                {/* gradient line top */}
                                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />

                                <div className={`w-12 h-12 rounded-2xl ${f.bg} ${f.text} flex items-center justify-center mb-5 border ${f.border}`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>{f.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-5">{f.desc}</p>
                                <ul className="space-y-2">
                                    {f.stats.map((s, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className={`w-4 h-4 rounded-full ${f.bg} ${f.text} flex items-center justify-center flex-shrink-0`}>
                                                <Check className="w-2.5 h-2.5" />
                                            </div>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    {/* coming soon strip */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        className="mt-8 bg-white border border-slate-200 rounded-2xl px-8 py-5 flex flex-wrap items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">More integrations coming soon</div>
                                <div className="text-sm text-slate-500">Yahoo, iCloud, Zoho, ProtonMail and more</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {integrations.map((int, i) => (
                                <div key={i} title={int.name}
                                    className={`w-9 h-9 ${int.color} rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm cursor-default`}>
                                    {int.logo}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── CAMPAIGN FEATURES ── */}
            <section className="py-28 px-6 bg-white relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-100/30 rounded-full translate-y-1/2 -translate-x-1/4 blur-[80px]" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}>
                            <Pill className="border-violet-200 bg-violet-50 text-violet-700 mb-5">
                                <Zap className="w-3 h-3" /> Campaign Tools
                            </Pill>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                Powerful tools built<br />for <GradientText>scale</GradientText>
                            </h2>
                            <p className="text-lg text-slate-500">Everything you need to create, manage, and optimise your email outreach campaigns.</p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {campaignFeatures.map((f, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.09 }}
                                className="group bg-slate-50 rounded-2xl border border-slate-200 p-6 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 cursor-default">
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center text-white mb-5 shadow-md`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-base font-black text-slate-900 mb-2 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>{f.title}</h3>
                                <p className="text-slate-500 text-sm mb-4 leading-relaxed">{f.desc}</p>
                                <ul className="space-y-1.5">
                                    {f.details.map((d, j) => (
                                        <li key={j} className="text-xs text-slate-500 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 flex-shrink-0" />
                                            {d}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    {/* Interactive demo panel */}
                    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                        className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 bg-white">
                            <h3 className="text-lg font-black text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Live simulation</h3>
                            <button onClick={() => setDemoPlaying(!demoPlaying)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                                {demoPlaying ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Play Demo</>}
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-0">
                            {/* steps */}
                            <div className="p-7 border-r border-slate-200 space-y-1">
                                {['Create Sequence', 'Add Mailboxes', 'Set Conditions', 'Launch & Track'].map((step, i) => (
                                    <div key={step}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${demoPlaying && activeTab === i ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-white hover:border hover:border-slate-200'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 transition-all ${demoPlaying && activeTab === i ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                                            style={{ fontFamily: 'Outfit, sans-serif' }}>
                                            {demoPlaying && activeTab > i ? <Check className="w-4 h-4 text-green-500" style={{ color: 'inherit' }} /> : i + 1}
                                        </div>
                                        <span className={`text-sm font-semibold ${demoPlaying && activeTab === i ? 'text-indigo-700' : 'text-slate-600'}`}>Step {i + 1}: {step}</span>
                                    </div>
                                ))}
                            </div>

                            {/* live panel */}
                            <div className="p-7">
                                <AnimatePresence mode="wait">
                                    {demoPlaying ? (
                                        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                                <span className="text-sm font-semibold text-slate-700">Campaign running…</span>
                                            </div>
                                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 5, repeat: Infinity }}
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[{ label: 'Emails sent', value: '1,247' }, { label: 'Replies', value: '312' }, { label: 'Open rate', value: '66%' }, { label: 'Bounce rate', value: '0.3%' }].map(m => (
                                                    <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-4">
                                                        <div className="text-xs text-slate-400 mb-1">{m.label}</div>
                                                        <div className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{m.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="h-full flex flex-col items-center justify-center text-center py-10">
                                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                                                <Play className="w-7 h-7 text-indigo-300 ml-1" />
                                            </div>
                                            <p className="text-slate-400 text-sm">Click Play to see a live simulation</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="py-28 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}>
                            <Pill className="border-purple-200 bg-purple-50 text-purple-700 mb-5">
                                <Star className="w-3 h-3" /> Testimonials
                            </Pill>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                Trusted by <GradientText>growth teams</GradientText>
                            </h2>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-2xl border border-slate-200 p-7 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-100/60 transition-colors" />

                                <div className="flex gap-1 mb-5">
                                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed mb-6 relative z-10">"{t.content}"</p>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}
                                        style={{ fontFamily: 'Outfit, sans-serif' }}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{t.name}</div>
                                        <div className="text-xs text-slate-400">{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section id="pricing" className="py-28 px-6 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-1/2 w-[800px] h-[400px] bg-indigo-50/60 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px]" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}>
                            <Pill className="border-indigo-200 bg-indigo-50 text-indigo-700 mb-5">
                                <Gauge className="w-3 h-3" /> Pricing
                            </Pill>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                Simple, <GradientText>transparent pricing</GradientText>
                            </h2>
                            <p className="text-lg text-slate-500">Choose the plan that fits your team's needs. All plans include a 14-day free trial.</p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 items-center">
                        {plans.map((plan, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className={`relative rounded-2xl border p-8 transition-all duration-300 ${plan.popular
                                    ? 'bg-gradient-to-b from-indigo-600 to-violet-700 border-transparent shadow-2xl shadow-indigo-200 scale-105 text-white'
                                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50'}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg"
                                            style={{ fontFamily: 'Outfit, sans-serif' }}>
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <div className={`text-sm font-bold mb-1 ${plan.popular ? 'text-indigo-200' : 'text-slate-500'}`}>{plan.name}</div>
                                <div className="flex items-end gap-1 mb-1">
                                    <span className="text-5xl font-black tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>{plan.price}</span>
                                    <span className={`text-sm mb-2 ${plan.popular ? 'text-indigo-200' : 'text-slate-400'}`}>{plan.period}</span>
                                </div>
                                <p className={`text-sm mb-7 ${plan.popular ? 'text-indigo-200' : 'text-slate-500'}`}>{plan.desc}</p>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-white/20' : 'bg-indigo-50'}`}>
                                                <Check className={`w-3 h-3 ${plan.popular ? 'text-white' : 'text-indigo-600'}`} />
                                            </div>
                                            <span className={plan.popular ? 'text-indigo-100' : 'text-slate-600'}>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button onClick={() => plan.name === 'Enterprise' ? navigate('/contact') : navigate('/auth/signup')}
                                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${plan.popular
                                        ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg'
                                        : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'}`}>
                                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="py-28 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
                        className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-16 text-white overflow-hidden text-center">
                        {/* grid texture */}
                        <div className="absolute inset-0 opacity-[0.06]"
                            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-400/20 rounded-full blur-2xl" />

                        <div className="relative z-10">
                            <Pill className="border-white/20 bg-white/10 text-white mb-7 backdrop-blur-sm">
                                <Rocket className="w-3 h-3" /> Ready to scale?
                            </Pill>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                Scale your outreach<br />to new heights
                            </h2>
                            <p className="text-lg text-indigo-200 mb-10 max-w-xl mx-auto">
                                Join thousands of teams using Unibox to automate and optimise their email campaigns.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button onClick={() => navigate('/auth/signup')}
                                    className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-xl flex items-center justify-center gap-2">
                                    Start Free Trial <ArrowRight className="w-4 h-4" />
                                </button>
                                <button onClick={() => navigate('/contact')}
                                    className="px-8 py-4 bg-indigo-500/60 backdrop-blur border border-white/20 text-white rounded-2xl font-bold hover:bg-indigo-500/80 transition-all">
                                    Contact Sales
                                </button>
                            </div>
                            <p className="text-sm text-indigo-300 mt-7">No credit card required · 14-day free trial · Cancel anytime</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                                    <Mail className="text-white w-4 h-4" />
                                </div>
                                <span className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Unibox.</span>
                            </div>
                            <p className="text-sm leading-relaxed mb-5">Unified email outreach for modern sales teams.</p>
                            <div className="flex gap-3">
                                {[Twitter, Github, Linkedin].map((Icon, i) => (
                                    <a key={i} href="#"
                                        className="w-8 h-8 bg-slate-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors">
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {[
                            { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
                            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
                            { title: 'Resources', links: ['Documentation', 'Guides', 'Support', 'Status'] },
                            { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
                        ].map(col => (
                            <div key={col.title}>
                                <h4 className="text-white font-bold text-sm mb-4">{col.title}</h4>
                                <ul className="space-y-3">
                                    {col.links.map(link => (
                                        <li key={link}><a href="#" className="text-sm hover:text-white transition-colors">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                        <div>© 2024 Unibox. All rights reserved.</div>
                        <div className="flex gap-6">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                                <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;