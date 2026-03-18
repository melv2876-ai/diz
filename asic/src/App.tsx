import React, { useState, createContext, useContext } from 'react';
import { Shield, Globe, CreditCard, Laptop, Settings, LifeBuoy, Zap, Clock, ShieldCheck, ChevronRight, Download, FileJson, CheckCircle2, AlertCircle, Sun, Moon, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- THEME & ACCENT DICTIONARIES ---

const ACCENTS = {
  emerald: {
    color: 'bg-emerald-500',
    text: 'text-emerald-500',
    textLight: 'text-emerald-400',
    bgSoft: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    navBg: 'from-emerald-500/15',
    blur1: 'bg-emerald-500/20',
    button: 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    buttonOutline: 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10',
    iconGlow: 'bg-emerald-400',
    selection: 'selection:bg-emerald-500/30',
    glowCard: 'to-emerald-500/10',
    planBg: 'from-emerald-400 to-emerald-900/20 shadow-emerald-900/20',
    planDivider: 'via-emerald-400',
  },
  orange: {
    color: 'bg-orange-500',
    text: 'text-orange-500',
    textLight: 'text-orange-400',
    bgSoft: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    navBg: 'from-orange-500/15',
    blur1: 'bg-orange-500/20',
    button: 'bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    buttonOutline: 'border-orange-500/30 text-orange-500 hover:bg-orange-500/10',
    iconGlow: 'bg-orange-400',
    selection: 'selection:bg-orange-500/30',
    glowCard: 'to-orange-500/10',
    planBg: 'from-orange-400 to-orange-900/20 shadow-orange-900/20',
    planDivider: 'via-orange-400',
  },
  blue: {
    color: 'bg-blue-500',
    text: 'text-blue-500',
    textLight: 'text-blue-400',
    bgSoft: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    navBg: 'from-blue-500/15',
    blur1: 'bg-blue-500/20',
    button: 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    buttonOutline: 'border-blue-500/30 text-blue-500 hover:bg-blue-500/10',
    iconGlow: 'bg-blue-400',
    selection: 'selection:bg-blue-500/30',
    glowCard: 'to-blue-500/10',
    planBg: 'from-blue-400 to-blue-900/20 shadow-blue-900/20',
    planDivider: 'via-blue-400',
  },
  pink: {
    color: 'bg-pink-500',
    text: 'text-pink-500',
    textLight: 'text-pink-400',
    bgSoft: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    navBg: 'from-pink-500/15',
    blur1: 'bg-pink-500/20',
    button: 'bg-pink-500 hover:bg-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]',
    buttonOutline: 'border-pink-500/30 text-pink-500 hover:bg-pink-500/10',
    iconGlow: 'bg-pink-400',
    selection: 'selection:bg-pink-500/30',
    glowCard: 'to-pink-500/10',
    planBg: 'from-pink-400 to-pink-900/20 shadow-pink-900/20',
    planDivider: 'via-pink-400',
  }
};

const THEMES = {
  dark: {
    bg: 'bg-[#050505]',
    textStrong: 'text-white',
    text: 'text-zinc-200',
    textMuted: 'text-zinc-400',
    textSubtle: 'text-zinc-500',
    border: 'border-white/[0.05]',
    borderHover: 'hover:border-white/[0.1]',
    sidebar: 'bg-black/20',
    card: 'bg-white/[0.02]',
    cardHover: 'hover:bg-white/[0.04]',
    cardSolid: 'bg-[#0a0a0a]',
    divider: 'bg-gradient-to-r from-white/[0.08] via-white/[0.02] to-transparent',
    navHover: 'hover:bg-white/[0.05]',
    navActiveText: 'text-white',
    tableHeader: 'bg-white/[0.02]',
  },
  milky: {
    bg: 'bg-[#faf8f5]',
    textStrong: 'text-zinc-900',
    text: 'text-zinc-800',
    textMuted: 'text-zinc-500',
    textSubtle: 'text-zinc-400',
    border: 'border-black/[0.05]',
    borderHover: 'hover:border-black/[0.1]',
    sidebar: 'bg-white/40',
    card: 'bg-black/[0.02]',
    cardHover: 'hover:bg-black/[0.04]',
    cardSolid: 'bg-white',
    divider: 'bg-gradient-to-r from-black/[0.08] via-black/[0.02] to-transparent',
    navHover: 'hover:bg-black/[0.05]',
    navActiveText: 'text-black',
    tableHeader: 'bg-black/[0.02]',
  }
};

type ThemeType = keyof typeof THEMES;
type AccentType = keyof typeof ACCENTS;

const ThemeContext = createContext({
  theme: 'dark' as ThemeType,
  accent: 'emerald' as AccentType,
  t: THEMES.dark,
  a: ACCENTS.emerald,
  setTheme: (t: ThemeType) => {},
  setAccent: (a: AccentType) => {}
});

// --- MOCK DATA ---
const DEVICES = [
  { id: 1, name: "MacBook Pro 16\"", os: "macOS", location: "Frankfurt, DE", ip: "192.168.1.12", lastActive: "2 mins ago", status: "active" },
  { id: 2, name: "iPhone 14 Pro", os: "iOS", location: "London, UK", ip: "10.0.0.5", lastActive: "1 hour ago", status: "offline" },
  { id: 3, name: "Windows Desktop", os: "Windows 11", location: "New York, US", ip: "172.16.0.8", lastActive: "3 days ago", status: "offline" },
];

const PLANS = [
  { id: 'basic', name: 'Basic', price: '$4.99', period: '/mo', features: ['1 Device', 'Standard Speed', '10 Locations'], recommended: false },
  { id: 'pro', name: 'Pro', price: '$9.99', period: '/mo', features: ['5 Devices', 'Max Speed (10Gbps)', 'All Locations', 'Ad Blocker'], recommended: true },
  { id: 'ultra', name: 'Ultra', price: '$14.99', period: '/mo', features: ['Unlimited Devices', 'Max Speed', 'Dedicated IP', '24/7 Priority Support'], recommended: false },
];

const BILLING_HISTORY = [
  { id: 'INV-2024-001', date: 'Oct 15, 2024', amount: '$9.99', status: 'Paid', plan: 'Pro Plan' },
  { id: 'INV-2024-002', date: 'Nov 15, 2024', amount: '$9.99', status: 'Paid', plan: 'Pro Plan' },
  { id: 'INV-2024-003', date: 'Dec 15, 2024', amount: '$9.99', status: 'Pending', plan: 'Pro Plan' },
];

// --- COMPONENTS ---

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => {
  const { t, a } = useContext(ThemeContext);
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium group",
        active ? t.navActiveText : cn(t.textMuted, t.navHover)
      )}
    >
      {active && (
        <motion.div 
          layoutId="activeNavBg"
          className={cn("absolute inset-0 rounded-xl bg-gradient-to-r to-transparent opacity-80", a.navBg)}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className="relative z-10 flex items-center gap-3">
        <Icon className={cn("w-5 h-5 transition-colors", active ? a.textLight : t.textMuted)} />
        {label}
      </div>
    </button>
  );
};

const GlowCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const { t, a } = useContext(ThemeContext);
  return (
    <div className={cn(
      "relative group rounded-2xl border transition-all duration-500 overflow-hidden",
      t.card, t.border, t.borderHover, className
    )}>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        a.glowCard
      )} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

const OverviewTab = () => {
  const { t, a } = useContext(ThemeContext);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Hero Stats */}
      <div className={cn("rounded-3xl border p-8 relative overflow-hidden", t.cardSolid, t.border)}>
        <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none", a.blur1)} />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div>
            <div className={cn("flex items-center gap-2 text-sm font-medium mb-4", a.text)}>
              <ShieldCheck className="w-4 h-4" />
              <span>Subscription Active</span>
            </div>
            <h2 className={cn("text-6xl font-light tracking-tight mb-2", t.textStrong)}>243</h2>
            <p className={t.textMuted}>Days remaining on <span className={t.textStrong}>Pro Plan</span></p>
          </div>
          <button className={cn("px-6 py-3 rounded-xl font-medium transition-all", a.button)}>
            Renew Subscription
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Devices List */}
        <GlowCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className={cn("text-lg font-medium", t.textStrong)}>Active Devices</h3>
            <span className={cn("text-xs px-2 py-1 rounded-full border", t.border, t.textMuted)}>3 / 5 Used</span>
          </div>
          
          <div className="space-y-4">
            {DEVICES.map((device) => (
              <div key={device.id} className={cn("flex items-center justify-between p-4 rounded-xl border transition-colors", t.card, t.border, t.borderHover)}>
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border", t.cardSolid, t.border)}>
                    {device.os.includes('mac') || device.os.includes('Windows') ? 
                      <Laptop className={cn("w-5 h-5", t.textMuted)} /> : 
                      <Globe className={cn("w-5 h-5", t.textMuted)} />
                    }
                  </div>
                  <div>
                    <h4 className={cn("font-medium text-sm", t.textStrong)}>{device.name}</h4>
                    <div className={cn("flex items-center gap-2 text-xs mt-1", t.textSubtle)}>
                      <span>{device.location}</span>
                      <span>•</span>
                      <span className="font-mono">{device.ip}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {device.status === 'active' && (
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-2 h-2 rounded-full", a.color, a.iconGlow)} />
                      <span className={cn("text-xs font-medium", a.text)}>Active</span>
                    </div>
                  )}
                  <button className={cn("text-xs px-3 py-1.5 rounded-lg border transition-colors", t.border, t.textMuted, t.cardHover)}>
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>

        {/* Quick Actions */}
        <div className="space-y-6">
          <GlowCard className="p-6">
            <h3 className={cn("text-lg font-medium mb-4", t.textStrong)}>Quick Access</h3>
            <div className="space-y-3">
              <button className={cn("w-full flex items-center justify-between p-3 rounded-xl border transition-colors group", t.card, t.border, t.borderHover)}>
                <div className="flex items-center gap-3">
                  <Download className={cn("w-5 h-5", t.textMuted, "group-hover:" + a.text)} />
                  <span className={cn("text-sm font-medium", t.textStrong)}>Download App</span>
                </div>
                <ChevronRight className={cn("w-4 h-4", t.textSubtle)} />
              </button>
              <button className={cn("w-full flex items-center justify-between p-3 rounded-xl border transition-colors group", t.card, t.border, t.borderHover)}>
                <div className="flex items-center gap-3">
                  <FileJson className={cn("w-5 h-5", t.textMuted, "group-hover:" + a.text)} />
                  <span className={cn("text-sm font-medium", t.textStrong)}>WireGuard Configs</span>
                </div>
                <ChevronRight className={cn("w-4 h-4", t.textSubtle)} />
              </button>
            </div>
          </GlowCard>

          <GlowCard className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", a.bgSoft, a.text)}>
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className={cn("text-sm font-medium mb-1", t.textStrong)}>Auto-Renewal is ON</h4>
                <p className={cn("text-xs leading-relaxed", t.textMuted)}>Your subscription will automatically renew on Oct 15, 2025.</p>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </motion.div>
  );
};

const BillingTab = () => {
  const { t, a } = useContext(ThemeContext);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Plans Grid */}
      <div>
        <h3 className={cn("text-xl font-medium mb-6", t.textStrong)}>Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={cn(
                "relative p-6 rounded-2xl border transition-all duration-300 flex flex-col",
                plan.recommended ? t.cardSolid : t.card,
                plan.recommended ? a.border : t.border,
                plan.recommended ? `shadow-[0_0_30px_rgba(0,0,0,0.1)]` : t.borderHover
              )}
            >
              {plan.recommended && (
                <div className={cn("absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", a.planBg, t.textStrong)}>
                  Recommended
                </div>
              )}
              
              <div className="mb-6">
                <h4 className={cn("text-lg font-medium mb-2", t.textStrong)}>{plan.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-4xl font-light tracking-tight", t.textStrong)}>{plan.price}</span>
                  <span className={t.textMuted}>{plan.period}</span>
                </div>
              </div>

              <div className={cn("h-px w-full mb-6", plan.recommended ? `bg-gradient-to-r from-transparent ${a.planDivider} to-transparent opacity-20` : t.divider)} />

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className={cn("w-4 h-4", plan.recommended ? a.text : t.textSubtle)} />
                    <span className={cn("text-sm", t.text)}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={cn(
                "w-full py-3 rounded-xl font-medium transition-all",
                plan.recommended ? a.button : cn("border", t.border, t.textStrong, t.cardHover)
              )}>
                {plan.recommended ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <GlowCard className="p-0">
        <div className={cn("p-6 border-b", t.border)}>
          <h3 className={cn("text-lg font-medium", t.textStrong)}>Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className={cn("text-xs uppercase", t.textSubtle, t.tableHeader)}>
              <tr>
                <th className="px-6 py-4 font-medium">Invoice ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", t.border)}>
              {BILLING_HISTORY.map((invoice) => (
                <tr key={invoice.id} className={cn("transition-colors", t.cardHover)}>
                  <td className={cn("px-6 py-4 font-mono", t.textStrong)}>{invoice.id}</td>
                  <td className={cn("px-6 py-4", t.textMuted)}>{invoice.date}</td>
                  <td className={cn("px-6 py-4", t.text)}>{invoice.plan}</td>
                  <td className={cn("px-6 py-4 font-medium", t.textStrong)}>{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border",
                      invoice.status === 'Paid' 
                        ? cn(a.bgSoft, a.text, a.border)
                        : cn("bg-yellow-500/10 text-yellow-500 border-yellow-500/20")
                    )}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [accent, setAccent] = useState<AccentType>('emerald');

  const t = THEMES[theme];
  const a = ACCENTS[accent];

  return (
    <ThemeContext.Provider value={{ theme, accent, t, a, setTheme, setAccent }}>
      <div className={cn("flex h-screen font-sans overflow-hidden transition-colors duration-500 relative", t.bg, t.text, a.selection)}>
        


        {/* Sidebar */}
        <div className={cn("relative z-10 w-64 border-r flex flex-col transition-colors duration-500", t.border, t.sidebar, theme === 'dark' ? 'backdrop-blur-xl' : 'backdrop-blur-md')}>
          <div className="p-6 flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.2)]", a.color)}>
              <Shield className={cn("w-5 h-5", theme === 'dark' ? 'text-black' : 'text-white')} />
            </div>
            <span className={cn("font-semibold text-lg tracking-tight", t.textStrong)}>SecureVPN</span>
          </div>

          <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
            <div>
              <div className={cn("px-4 mb-3 text-[10px] font-bold uppercase tracking-wider", t.textSubtle)}>Management</div>
              <div className="space-y-1">
                <NavItem icon={Globe} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <NavItem icon={CreditCard} label="Billing & Plans" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                <NavItem icon={Laptop} label="Devices" active={activeTab === 'devices'} onClick={() => setActiveTab('devices')} />
              </div>
            </div>

            <div>
              <div className={cn("px-4 mb-3 text-[10px] font-bold uppercase tracking-wider", t.textSubtle)}>Settings</div>
              <div className="space-y-1">
                <NavItem icon={Settings} label="Preferences" active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} />
                <NavItem icon={LifeBuoy} label="Support" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          {/* Smooth Corner Wash Gradient */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div 
              className={cn(
                "absolute -top-[500px] -left-[500px] w-[1000px] h-[1000px] rounded-full blur-[180px] transition-colors duration-1000", 
                a.color,
                theme === 'dark' ? 'opacity-20' : 'opacity-[0.15]'
              )} 
            />
          </div>
          
          {/* Header */}
          <header className={cn("h-20 border-b flex items-center justify-between px-8 shrink-0 transition-colors duration-500 relative z-10", t.border, theme === 'dark' ? 'bg-black/10 backdrop-blur-md' : 'bg-white/40 backdrop-blur-md')}>
            <h1 className={cn("text-xl font-medium", t.textStrong)}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
            </h1>
            
            <div className="flex items-center gap-6">
              {/* Theme & Accent Controls */}
              <div className="flex items-center gap-3">
                <div className={cn("flex items-center gap-1.5 p-1.5 rounded-full border transition-colors", t.border, t.cardSolid)}>
                  {(Object.keys(ACCENTS) as Array<AccentType>).map(key => (
                    <button 
                      key={key} 
                      onClick={() => setAccent(key)}
                      className={cn(
                        "w-4 h-4 rounded-full transition-all duration-300", 
                        ACCENTS[key].color, 
                        accent === key ? "scale-110 ring-2 ring-offset-2 ring-current" : "scale-90 opacity-60 hover:opacity-100 hover:scale-100",
                        theme === 'dark' ? "ring-offset-[#0a0a0a]" : "ring-offset-white"
                      )}
                    />
                  ))}
                </div>
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'milky' : 'dark')} 
                  className={cn("p-2 rounded-full border transition-colors", t.border, t.cardSolid, t.textMuted, "hover:text-" + t.textStrong)}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
                </button>
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-inherit">
                <div className="text-right hidden md:block">
                  <div className={cn("text-sm font-medium", t.textStrong)}>Alex.</div>
                  <div className={cn("text-xs", a.text)}>Pro Plan</div>
                </div>
                <div className={cn("w-10 h-10 rounded-full border flex items-center justify-center", t.border, t.cardSolid)}>
                  <span className={cn("text-sm font-medium", t.textStrong)}>A</span>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-5xl mx-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && <OverviewTab key="overview" />}
                {activeTab === 'billing' && <BillingTab key="billing" />}
                {/* Placeholders for other tabs */}
                {['devices', 'preferences', 'support'].includes(activeTab) && (
                  <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn("flex flex-col items-center justify-center py-20 text-center", t.textMuted)}
                  >
                    <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                    <h3 className={cn("text-lg font-medium mb-2", t.textStrong)}>Coming Soon</h3>
                    <p className="max-w-sm">This section is currently under development. Check back later for updates.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
