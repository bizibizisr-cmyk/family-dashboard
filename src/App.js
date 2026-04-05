import { useState, useMemo } from "react";
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

export default function Dashboard() {
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
            <div key={i} style={{ color: p.color, fontSize: 13 }}>{p.name}: {fmt(p.value)}</div>
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
          <div style={{ color: "#fff", fontSize: 13 }}>{payload[0].name}: {fmt(payload[0].value)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      direction: "rtl", fontFamily: "'Segoe UI', 'Arial Hebrew', Arial, sans-serif",
      background: "#0d1117", minHeight: "100vh", color: "#e6edf3", padding: "0 0 40px 0"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #161b27 0%, #1a2235 100%)",
        borderBottom: "1px solid #21262d", padding: "20px 28px 0 28px",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>
              💰 ניהול כלכלת המשפחה
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#8b949e" }}>
              {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}
            </p>
          </div>
          <button onClick={() => setShowForm(true)} style={{
            background: "linear-gradient(135deg, #238636, #2ea043)",
            color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px",
            fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> עסקה חדשה
          </button>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { id: "overview", label: "סקירה" },
            { id: "transactions", label: "עסקאות" },
            { id: "budget", label: "תקציב" },
            { id: "trends", label: "מגמות" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: activeTab === tab.id ? "#21262d" : "transparent",
              color: activeTab === tab.id ? "#4f8ef7" : "#8b949e",
              border: "none", borderBottom: activeTab === tab.id ? "2px solid #4f8ef7" : "2px solid transparent",
              padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", borderRadius: "6px 6px 0 0"
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "הכנסות החודש", value: fmt(totalIncome), color: "#4fd9a3", bg: "rgba(79,217,163,0.08)", icon: "📈" },
            { label: "הוצאות החודש", value: fmt(totalExpense), color: "#f74f7a", bg: "rgba(247,79,122,0.08)", icon: "📉" },
            { label: "יתרה", value: fmt(balance), color: balance >= 0 ? "#4fd9a3" : "#f74f7a", bg: balance >= 0 ? "rgba(79,217,163,0.08)" : "rgba(247,79,122,0.08)", icon: "💼" },
            { label: "אחוז חיסכון", value: savingsRate + "%", color: "#4f8ef7", bg: "rgba(79,142,247,0.08)", icon: "🎯" },
          ].map((kpi, i) => (
            <div key={i} style={{
              background: kpi.bg, border: `1px solid ${kpi.color}30`,
              borderRadius: 12, padding: "18px 20px"
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{kpi.icon}</div>
              <div style={{ fontSize: 12, color: "#8b949e", marginBottom: 4 }}>{kpi.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, color: "#fff" }}>התפלגות הוצאות</h3>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                        dataKey="value" paddingAngle={3}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<PIE_TOOLTIP />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 8 }}>
                    {pieData.map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8b949e" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                        {d.name}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ color: "#8b949e", textAlign: "center", paddingTop: 60 }}>אין נתוני הוצאות החודש</div>
              )}
            </div>

            <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, color: "#fff" }}>ניצול תקציב</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {byCategory.map(cat => {
                  const pct = Math.min(Math.round((cat.spent / cat.budget) * 100), 100);
                  const over = cat.spent > cat.budget;
                  return (
                    <div key={cat.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13 }}>{cat.icon} {cat.label}</span>
                        <span style={{ fontSize: 12, color: over ? "#f74f7a" : "#8b949e" }}>
                          {fmt(cat.spent)} / {fmt(cat.budget)}
                        </span>
                      </div>
                      <div style={{ background: "#21262d", borderRadius: 4, height: 8, overflow: "hidden" }}>
                        <div style={{
                          width: pct + "%", height: "100%", borderRadius: 4,
                          background: over ? "#f74f7a" : cat.color,
                          transition: "width 0.6s ease"
                        }} />
                      </div>
                      <div style={{ fontSize: 11, color: over ? "#f74f7a" : "#8b949e", marginTop: 3, textAlign: "left" }}>
                        {over ? `חריגה של ${fmt(cat.spent - cat.budget)}` : `נותר ${fmt(cat.budget - cat.spent)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: 20, gridColumn: "1 / -1" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, color: "#fff" }}>עסקאות אחרונות</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {transactions.slice(0, 5).map(t => {
                  const cat = CATEGORIES.find(c => c.id === t.category);
                  return (
                    <div key={t.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", background: "#0d1117", borderRadius: 8, border: "1px solid #21262d"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{cat ? cat.icon : "💰"}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{t.description}</div>
                          <div style={{ fontSize: 11, color: "#8b949e" }}>{t.date} {cat ? "· " + cat.label : ""}</div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 15, color: t.type === "income" ? "#4fd9a3" : "#f74f7a" }}>
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
          <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 15, color: "#fff" }}>כל העסקאות</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {transactions.map(t => {
                const cat = CATEGORIES.find(c => c.id === t.category);
                return (
                  <div key={t.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", background: "#0d1117", borderRadius: 8, border: "1px solid #21262d"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 22 }}>{cat ? cat.icon : "💰"}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{t.description}</div>
                        <div style={{ fontSize: 11, color: "#8b949e" }}>{t.date}{cat ? " · " + cat.label : ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: t.type === "income" ? "#4fd9a3" : "#f74f7a" }}>
                        {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                      </span>
                      <button onClick={() => deleteTransaction(t.id)} style={{
                        background: "rgba(247,79,122,0.1)", border: "1px solid #f74f7a30", color: "#f74f7a",
                        borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer"
                      }}>מחק</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "budget" && (
          <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: 15, color: "#fff" }}>עריכת תקציב חודשי</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {CATEGORIES.map(cat => (
                <div key={cat.id} style={{
                  background: "#0d1117", border: "1px solid #21262d", borderRadius: 10, padding: 16
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 22 }}>{cat.icon}</span>
                    <span style={{ fontWeight: 600 }}>{cat.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#8b949e", fontSize: 13 }}>תקציב: ₪</span>
                    <input
                      type="number"
                      value={budgets[cat.id]}
                      onChange={e => setBudgets(prev => ({ ...prev, [cat.id]: Number(e.target.value) }))}
                      style={{
                        background: "#161b27", border: "1px solid #30363d", borderRadius: 6,
                        color: "#e6edf3", padding: "6px 10px", fontSize: 14, width: 100,
                        textAlign: "right"
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: "#8b949e" }}>
                    הוצאה בפועל: <span style={{ color: cat.color }}>{fmt(byCategory.find(c => c.id === cat.id)?.spent || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(79,142,247,0.08)", border: "1px solid #4f8ef730", borderRadius: 10 }}>
              <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 4 }}>סה"כ תקציב חודשי מתוכנן</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#4f8ef7" }}>
                {fmt(Object.values(budgets).reduce((a, b) => a + b, 0))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "trends" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, color: "#fff" }}>הכנסות מול הוצאות – חודשי</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={MONTHLY_TREND} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="month" tick={{ fill: "#8b949e", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => "₪" + (v / 1000) + "k"} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Bar dataKey="income" name="הכנסות" fill="#4fd9a3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="הוצאות" fill="#f74f7a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: "#161b27", border: "1px solid #21262d", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, color: "#fff" }}>מגמת יתרה חודשית</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={MONTHLY_TREND.map(m => ({ month: m.month, יתרה: m.income - m.expense }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="month" tick={{ fill: "#8b949e", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => "₪" + (v / 1000) + "k"} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Line type="monotone" dataKey="יתרה" stroke="#4f8ef7" strokeWidth={2.5} dot={{ fill: "#4f8ef7", r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#161b27", border: "1px solid #30363d", borderRadius: 14,
            padding: 28, width: 380, direction: "rtl"
          }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: 17, color: "#fff" }}>הוספת עסקה</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["expense", "income"].map(type => (
                <button key={type} onClick={() => setForm(f => ({ ...f, type }))} style={{
                  flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  border: "none",
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
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 5 }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  style={{
                    width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8,
                    color: "#e6edf3", padding: "9px 12px", fontSize: 14, boxSizing: "border-box", textAlign: "right"
                  }}
                />
              </div>
            ))}
            {form.type === "expense" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#8b949e", display: "block", marginBottom: 5 }}>קטגוריה</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{
                    width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8,
                    color: "#e6edf3", padding: "9px 12px", fontSize: 14
                  }}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={addTransaction} style={{
                flex: 1, background: "linear-gradient(135deg, #238636, #2ea043)",
                color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 15, fontWeight: 600, cursor: "pointer"
              }}>שמור</button>
              <button onClick={() => setShowForm(false)} style={{
                flex: 1, background: "#21262d", color: "#8b949e", border: "none",
                borderRadius: 8, padding: "11px 0", fontSize: 15, cursor: "pointer"
              }}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
