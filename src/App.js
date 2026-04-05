import { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const CATEGORIES = [
  { id: "housing", label: "דיור", icon: "🏠", color: "#4f8ef7", budget: 5000 },
  { id: "food", label: "מזון וקניות", icon: "🛒", color: "#f7a34f", budget: 3000 },
  { id: "transport", label: "רכב ותחבורה", icon: "🚗", color: "#4fd9a3", budget: 2000 },
  { id: "health", label: "בריאות", icon: "💊", color: "#f74f7a", budget: 800 },
];

const MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

const SAMPLE_TRANSACTIONS = [
  { id: 1, date: "2026-04-01", category: "housing", description: "שכירות אפריל", amount: 4800, type: "expense" },
  { id: 2, date: "2026-04-02", category: "food", description: "שופרסל", amount: 620, type: "expense" },
  { id: 3, date: "2026-04-03", category: "transport", description: "דלק", amount: 280, type: "expense" },
  { id: 4, date: "2026-04-04", category: "health", description: "קופת חולים", amount: 150, type: "expense" },
  { id: 5, date: "2026-04-05", category: "food", description: "מסעדה", amount: 240, type: "expense" },
  { id: 6, date: "2026-04-01", category: null, description: "משכורת", amount: 18000, type: "income" },
  { id: 7, date: "2026-04-05", category: null, description: "החזר ביטוח לאומי", amount: 900, type: "income" },
];

const MONTHLY_TREND = [
  { month: "ינו", income: 18000, expense: 9800 },
  { month: "פבר", income: 18000, expense: 11200 },
  { month: "מרץ", income: 19500, expense: 10400 },
  { month: "אפר", income: 18900, expense: 6090 },
];

function fmt(n) {
  return "₪" + n.toLocaleString("he-IL");
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function Dashboard() {
  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState(SAMPLE_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState("overview");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", category: "housing", description: "", amount: "", type: "expense" });
  const [budgets, setBudgets] = useState({ housing: 5000, food: 3000, transport: 2000, health: 800 });

  const thisMonth = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [transactions]);

  const totalIncome = useMemo(() => thisMonth.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [thisMonth]);
  const totalExpense = useMemo(() => thisMonth.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [thisMonth]);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  const byCategory = useMemo(() =>
    CATEGORIES.map(cat => ({
      ...cat,
      spent: thisMonth.filter(t => t.category === cat.id).reduce((s, t) => s + t.amount, 0),
      budget: budgets[cat.id],
    })), [thisMonth, budgets]);

  const pieData = byCategory.map(c => ({ name: c.label, value: c.spent, color: c.color })).filter(c => c.value > 0);

  function addTransaction() {
    if (!form.description || !form.amount || !form.date) return;
    const newT = { ...form, id: Date.now(), amount: parseFloat(form.amount) };
    setTransactions(prev => [newT, ...prev]);
    setForm({ date: "", category: "housing", description: "", amount: "", type: "expense" });
    setShowForm(false);
  }

  function deleteTransaction(id) {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }

  const CUSTOM_TOOLTIP = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "#1a1f2e", border: "1px solid #2d3548", borderRadius: 8, padding: "8px 14px", direction: "rtl" }}>
          {payload.map((p, i) => (
            <div key={i} style={{ color: p.color, fontSize: 12 }}>{p.name}: {fmt(p.value)}</div>
          ))}
        </div>
      );
    }
    return null;
  };

  const PIE_TOOLTIP = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "#1a1f2e", border: "1px solid #2d3548", borderRadius: 8, padding: "8px 14px" }}>
          <div style={{ color: "#fff", fontSize: 12 }}>{payload[0].name}: {fmt(payload[0].value)}</div>
        </div>
      );
    }
    return null;
  };

  const tabs = [
    { id: "overview", label: "סקירה", icon: "📊" },
    { id: "transactions", label: "עסקאות", icon: "📋" },
    { id: "budget", label: "תקציב", icon: "🎯" },
    { id: "trends", label: "מגמות", icon: "📈" },
  ];

  return (
    <div style={{
      direction: "rtl",
      fontFamily: "'Segoe UI', 'Arial Hebrew', Arial, sans-serif",
      background: "#0d1117",
      minHeight: "100vh",
      color: "#e6edf3",
      paddingBottom: isMobile ? 80 : 40,
    }}>
      <div style={{
        background: "linear-gradient(135deg, #161b27 0%, #1a2235 100%)",
        borderBottom: "1px solid #21262d",
        padding: isMobile ? "16px 16px 0 16px" : "20px 28px 0 28px",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 22, fontWeight: 700, color: "#fff" }}>
              💰 כלכלת המשפחה
            </h1>
            <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#8b949e" }}>
              {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}
            </p>
          </div>
          <button onClick={() => setShowForm(true)} style={{
            background: "linear-gradient(135deg, #238636, #2ea043)",
            color: "#fff", border: "none", borderRadius: 8,
            padding: isMobile ? "8px 14px" : "9px 18px",
            fontSize: isMobile ? 13 : 14, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5
          }}>
            <span style={{ fontSize: 16 }}>+</span>
            {isMobile ? "הוסף" : "עסקה חדשה"}
          </button>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                background: activeTab === tab.id ? "#21262d" : "transparent",
                color: activeTab === tab.id ? "#4f8ef7" : "#8b949e",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid #4f8ef7" : "2px solid transparent",
                padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", borderRadius: "6px 6px 0 0"
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: isMobile ? "16px" : "24px 28px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: isMobile ? 10 : 16,
          marginBottom: isMobile ? 16 : 24
        }}>
          {[
            { label: "הכנסות", value: fmt(totalIncome), color: "#4fd9a3", bg: "rgba(79,217,163,0.08)", icon: "📈" },
            { label: "הוצאות", value: fmt(totalExpense), color: "#f74f7a", bg: "rgba(247,79,122,0.08)", icon: "📉" },
            { label: "יתרה", value: fmt(balance), color: balance >= 0 ? "#4fd9a3" : "#f74f7a", bg: balance >= 0 ? "rgba(79,217,163,0.08)" : "rgba(247,79,122,0.08)", icon: "💼" },
            { label: "חיסכון", value: savingsRate + "%", color: "#4f8ef7", bg: "rgba(79,142,247,0.08)", icon: "🎯" },
          ].map((kpi, i) => (
            <div key={i} style={{
              background: kpi.bg, border: `1px solid ${kpi.color}30`,
              borderRadius: 10, padding: isMobile ? "12px 14px" : "18px 20px"
            }}>
              <div style={{ fontSize: isMobile ? 18 : 22, marginBottom: 6 }}>{kpi.icon}</div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: "#8b949e", marginBottom: 3 }}>{kpi.label}</div>
              <div style={{ fontSize: isMobile ? 16 : 22, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: isMobile ? 14 : 20 }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: 14, color: "#fff" }}>התפלגות הוצאות</h3>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%"
                        innerRadius={isMobile ? 40 : 55} outerRadius={isMobile ? 65 : 85}
                        dataKey="value" paddingAngle={3}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<PIE_TOOLTIP />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
                    {pieData.map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#8b949e" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                        {d.name}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ color: "#8b949e", textAlign: "center", padding: "40px 0" }}>אין נתוני הוצאות החודש</div>
              )}
            </div>

            <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: isMobile ? 14 : 20 }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: 14, color: "#fff" }}>ניצול תקציב</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {byCategory.map(cat => {
                  const pct = Math.min(Math.round((cat.spent / cat.budget) * 100), 100);
                  const over = cat.spent > cat.budget;
                  return (
                    <div key={cat.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13 }}>{cat.icon} {cat.label}</span>
                        <span style={{ fontSize: 11, color: over ? "#f74f7a" : "#8b949e" }}>
                          {fmt(cat.spent)} / {fmt(cat.budget)}
                        </span>
                      </div>
                      <div style={{ background: "#21262d", borderRadius: 4, height: 7, overflow: "hidden" }}>
                        <div style={{ width: pct + "%", height: "100%", borderRadius: 4, background: over ? "#f74f7a" : cat.color, transition: "width 0.6s ease" }} />
                      </div>
                      <div style={{ fontSize: 11, color: over ? "#f74f7a" : "#8b949e", marginTop: 3, textAlign: "left" }}>
                        {over ? `חריגה של ${fmt(cat.spent - cat.budget)}` : `נותר ${fmt(cat.budget - cat.spent)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: isMobile ? 14 : 20 }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: 14, color: "#fff" }}>עסקאות אחרונות</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {transactions.slice(0, 5).map(t => {
                  const cat = CATEGORIES.find(c => c.id === t.category);
                  return (
                    <div key={t.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 12px", background: "#0d1117", borderRadius: 8, border: "1px solid #21262d"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{cat ? cat.icon : "💰"}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{t.description}</div>
                          <div style={{ fontSize: 10, color: "#8b949e" }}>{t.date}{cat ? " · " + cat.label : ""}</div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: t.type === "income" ? "#4fd9a3" : "#f74f7a" }}>
                        {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: isMobile ? 14 : 20 }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: 14, color: "#fff" }}>כל העסקאות</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {transactions.map(t => {
                const cat = CATEGORIES.find(c => c.id === t.category);
                return (
                  <div key={t.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "11px 12px", background: "#0d1117", borderRadius: 8, border: "1px solid #21262d"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{cat ? cat.icon : "💰"}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.description}</div>
                        <div style={{ fontSize: 10, color: "#8b949e" }}>{t.date}{cat ? " · " + cat.label : ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: t.type === "income" ? "#4fd9a3" : "#f74f7a" }}>
                        {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                      </span>
                      <button onClick={() => deleteTransaction(t.id)} style={{
                        background: "rgba(247,79,122,0.1)", border: "1px solid #f74f7a30", color: "#f74f7a",
                        borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer"
                      }}>מחק</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "budget" && (
          <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: isMobile ? 14 : 24 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 14, color: "#fff" }}>עריכת תקציב חודשי</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CATEGORIES.map(cat => (
                <div key={cat.id} style={{
                  background: "#0d1117", border: "1px solid #21262d", borderRadius: 10, padding: 14,
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{cat.label}</div>
                      <div style={{ fontSize: 11, color: "#8b949e" }}>
                        בפועל: <span style={{ color: cat.color }}>{fmt(byCategory.find(c => c.id === cat.id)?.spent || 0)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#8b949e", fontSize: 12 }}>₪</span>
                    <input type="number" value={budgets[cat.id]}
                      onChange={e => setBudgets(prev => ({ ...prev, [cat.id]: Number(e.target.value) }))}
                      style={{
                        background: "#161b27", border: "1px solid #30363d", borderRadius: 6,
                        color: "#e6edf3", padding: "6px 8px", fontSize: 14,
                        width: isMobile ? 80 : 100, textAlign: "right"
                      }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(79,142,247,0.08)", border: "1px solid #4f8ef730", borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: "#8b949e", marginBottom: 3 }}>סה"כ תקציב חודשי</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#4f8ef7" }}>
                {fmt(Object.values(budgets).reduce((a, b) => a + b, 0))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "trends" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: isMobile ? 14 : 20 }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: 14, color: "#fff" }}>הכנסות מול הוצאות</h3>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
                <BarChart data={MONTHLY_TREND} barGap={4} margin={{ right: 0, left: isMobile ? -10 : 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="month" tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8b949e", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => "₪" + (v / 1000) + "k"} width={38} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Bar dataKey="income" name="הכנסות" fill="#4fd9a3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="הוצאות" fill="#f74f7a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: isMobile ? 14 : 20 }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: 14, color: "#fff" }}>מגמת יתרה חודשית</h3>
              <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
                <LineChart data={MONTHLY_TREND.map(m => ({ month: m.month, יתרה: m.income - m.expense }))} margin={{ right: 0, left: isMobile ? -10 : 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="month" tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8b949e", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => "₪" + (v / 1000) + "k"} width={38} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Line type="monotone" dataKey="יתרה" stroke="#4f8ef7" strokeWidth={2.5} dot={{ fill: "#4f8ef7", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {isMobile && (
        <div style={{
          position: "fixed", bottom: 0, right: 0, left: 0,
          background: "#161b27", borderTop: "1px solid #21262d",
          display: "flex", zIndex: 100
        }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "10px 0 12px 0",
              background: "transparent", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3
            }}>
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span style={{ fontSize: 10, color: activeTab === tab.id ? "#4f8ef7" : "#8b949e", fontWeight: activeTab === tab.id ? 700 : 400 }}>
                {tab.label}
              </span>
              {activeTab === tab.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4f8ef7" }} />}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200,
          display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#161b27", border: "1px solid #30363d",
            borderRadius: isMobile ? "16px 16px 0 0" : 14,
            padding: isMobile ? "20px 16px 32px 16px" : 28,
            width: isMobile ? "100%" : 380,
            direction: "rtl"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, color: "#fff" }}>הוספת עסקה</h3>
              <button onClick={() => setShowForm(false)} style={{
                background: "#21262d", border: "none", color: "#8b949e",
                borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 16
              }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["expense", "income"].map(type => (
                <button key={type} onClick={() => setForm(f => ({ ...f, type }))} style={{
                  flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
                  background: form.type === type ? (type === "income" ? "#2ea043" : "#b91c1c") : "#21262d",
                  color: form.type === type ? "#fff" : "#8b949e"
                }}>
                  {type === "income" ? "📈 הכנסה" : "📉 הוצאה"}
                </button>
              ))}
            </div>
            {[
              { label: "תיאור", key: "description", type: "text", placeholder: "למה שולם?" },
              { label: "סכום (₪)", key: "amount", type: "number", placeholder: "0" },
              { label: "תאריך", key: "date", type: "date", placeholder: "" },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 13 }}>
                <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 5 }}>{field.label}</label>
                <input type={field.type} placeholder={field.placeholder} value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  style={{
                    width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8,
                    color: "#e6edf3", padding: "10px 12px", fontSize: 15, boxSizing: "border-box", textAlign: "right"
                  }} />
              </div>
            ))}
            {form.type === "expense" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 5 }}>קטגוריה</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{
                    width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8,
                    color: "#e6edf3", padding: "10px 12px", fontSize: 15
                  }}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
            )}
            <button onClick={addTransaction} style={{
              width: "100%", background: "linear-gradient(135deg, #238636, #2ea043)",
              color: "#fff", border: "none", borderRadius: 8, padding: "13px 0",
              fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 4
            }}>שמור עסקה</button>
          </div>
        </div>
      )}
    </div>
  );
}
