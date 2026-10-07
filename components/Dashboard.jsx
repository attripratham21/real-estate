'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDb, AGENTS, COMM, cr, today, getUser, logout } from '../lib/data';

const TABS = ['Overview', 'Listings', 'Sold', 'Leads', 'Agents'];
const Badge = ({ s }) => <span className={`bd ${s.replace(/\s/g, '').toLowerCase()}`}>{s}</span>;
const Kpi = ({ l, v, sub }) => <div className="panel kpi"><p>{l}</p><strong>{v}</strong>{sub && <small>{sub}</small>}</div>;

function Overview({ db }) {
  const vol = db.sold.reduce((a, s) => a + s.soldPrice, 0);
  const active = db.listings.length;
  const newLeads = db.leads.filter((l) => l.status === 'New').length;
  return (
    <>
      <div className="kpis">
        <Kpi l="Active listings" v={active} sub={`${db.listings.filter((l) => l.status === 'Under offer').length} under offer`} />
        <Kpi l="Homes sold" v={db.sold.length} sub="all time" />
        <Kpi l="Sales volume" v={cr(vol)} />
        <Kpi l="Commission earned" v={cr((vol * COMM) / 100)} sub={`at ${COMM}%`} />
        <Kpi l="New leads" v={newLeads} sub={`${db.leads.length} total`} />
      </div>
      <h3 className="sec">Recent sales</h3>
      <div className="panel tw"><table><thead><tr><th>Property</th><th>Sold to</th><th>Sold by</th><th>Price</th><th>Date</th></tr></thead>
        <tbody>{db.sold.slice(0, 5).map((s) => <tr key={s.id}><td>{s.title}</td><td>{s.buyer}</td><td>{s.agent}</td><td>{cr(s.soldPrice)}</td><td>{s.date}</td></tr>)}</tbody></table></div>
    </>
  );
}

function Listings({ db, set }) {
  const [q, setQ] = useState(''), [st, setSt] = useState('All'), [add, setAdd] = useState(false), [sell, setSell] = useState(null);
  const rows = db.listings.filter((l) => (st === 'All' || l.status === st) && (l.title + l.city).toLowerCase().includes(q.toLowerCase()));
  const form = (e) => { e.preventDefault(); return Object.fromEntries(new FormData(e.target)); };
  const onAdd = (e) => {
    const f = form(e);
    set({ listings: [{ id: Date.now(), title: f.title, city: f.city, type: f.type, price: +f.price, beds: +f.beds, area: +f.area, status: 'Available', agent: f.agent, listed: today() }, ...db.listings] });
    setAdd(false);
  };
  const onSell = (e) => {
    const f = form(e);
    set({ listings: db.listings.filter((x) => x.id !== sell.id), sold: [{ id: Date.now(), title: sell.title, city: sell.city, listPrice: sell.price, soldPrice: +f.price, buyer: f.buyer, agent: f.agent, date: today() }, ...db.sold] });
    setSell(null);
  };
  const agentSel = (d) => <select name="agent" defaultValue={d}>{AGENTS.map((a) => <option key={a}>{a}</option>)}</select>;
  return (
    <>
      <div className="bar">
        <input placeholder="Search title or city" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={st} onChange={(e) => setSt(e.target.value)}>{['All', 'Available', 'Under offer', 'Reserved'].map((s) => <option key={s}>{s}</option>)}</select>
        <button className="pri" onClick={() => setAdd(!add)}>{add ? 'Cancel' : '+ Add listing'}</button>
      </div>
      {add && (
        <form className="panel row" onSubmit={onAdd}>
          <input name="title" placeholder="Title" required /><input name="city" placeholder="City" required />
          <select name="type">{['Residence', 'Penthouse', 'Land', 'Commercial'].map((t) => <option key={t}>{t}</option>)}</select>
          <input name="price" type="number" step="0.01" min="0" placeholder="Price (₹ Cr)" required />
          <input name="beds" type="number" min="0" placeholder="Beds" required /><input name="area" type="number" min="0" placeholder="Area (sq ft)" required />
          {agentSel(AGENTS[0])}<button className="pri">Save listing</button>
        </form>
      )}
      {sell && (
        <form className="panel row" onSubmit={onSell}>
          <strong>Mark “{sell.title}” as sold</strong>
          <input name="buyer" placeholder="Buyer name" required />
          <input name="price" type="number" step="0.01" defaultValue={sell.price} required />
          {agentSel(sell.agent)}<button className="pri">Confirm sale</button><button type="button" onClick={() => setSell(null)}>Cancel</button>
        </form>
      )}
      <div className="panel tw"><table><thead><tr><th>Property</th><th>City</th><th>Type</th><th>Beds</th><th>Area</th><th>Price</th><th>Agent</th><th>Status</th><th></th></tr></thead>
        <tbody>{rows.map((l) => (
          <tr key={l.id}><td>{l.title}</td><td>{l.city}</td><td>{l.type}</td><td>{l.beds || '–'}</td><td>{l.area.toLocaleString('en-IN')}</td><td>{cr(l.price)}</td><td>{l.agent}</td>
            <td><select value={l.status} onChange={(e) => set({ listings: db.listings.map((x) => (x.id === l.id ? { ...x, status: e.target.value } : x)) })}>{['Available', 'Under offer', 'Reserved'].map((s) => <option key={s}>{s}</option>)}</select></td>
            <td className="act"><button onClick={() => setSell(l)}>Mark sold</button><button onClick={() => confirm('Delete this listing?') && set({ listings: db.listings.filter((x) => x.id !== l.id) })}>Delete</button></td></tr>
        ))}</tbody></table>{!rows.length && <p className="empty">No listings match.</p>}</div>
    </>
  );
}

function Sold({ db }) {
  const vol = db.sold.reduce((a, s) => a + s.soldPrice, 0);
  return (
    <>
      <div className="kpis"><Kpi l="Homes sold" v={db.sold.length} /><Kpi l="Total sales" v={cr(vol)} /><Kpi l="Commission" v={cr((vol * COMM) / 100)} /></div>
      <div className="panel tw"><table><thead><tr><th>Property</th><th>City</th><th>Asking</th><th>Sold for</th><th>Sold to (buyer)</th><th>Sold by (agent)</th><th>Date</th><th>Commission</th></tr></thead>
        <tbody>{db.sold.map((s) => <tr key={s.id}><td>{s.title}</td><td>{s.city}</td><td>{cr(s.listPrice)}</td><td>{cr(s.soldPrice)}</td><td>{s.buyer}</td><td>{s.agent}</td><td>{s.date}</td><td>{cr((s.soldPrice * COMM) / 100)}</td></tr>)}</tbody></table></div>
    </>
  );
}

function Leads({ db, set }) {
  return (
    <div className="panel tw"><table><thead><tr><th>Name</th><th>Phone</th><th>Interested in</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>{db.leads.map((l) => (
        <tr key={l.id}><td>{l.name}</td><td>{l.phone}</td><td>{l.interest}</td><td>{l.date}</td>
          <td><select value={l.status} onChange={(e) => set({ leads: db.leads.map((x) => (x.id === l.id ? { ...x, status: e.target.value } : x)) })}>{['New', 'Contacted', 'Visit booked', 'Closed'].map((s) => <option key={s}>{s}</option>)}</select> <Badge s={l.status} /></td></tr>
      ))}</tbody></table>
      <p className="hint pad">Requests from the website “Book a private visit” form appear here automatically.</p></div>
  );
}

function Agents({ db }) {
  return (
    <div className="kpis">
      {AGENTS.map((a) => {
        const s = db.sold.filter((x) => x.agent === a);
        const vol = s.reduce((t, x) => t + x.soldPrice, 0);
        return <div key={a} className="panel kpi"><p>{a}</p><strong>{s.length} sold</strong><small>{cr(vol)} volume · {db.listings.filter((l) => l.agent === a).length} active listings</small></div>;
      })}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { db, ready, save, reset } = useDb();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('Overview');
  useEffect(() => { const u = getUser(); if (!u) router.replace('/login'); else setUser(u); }, [router]);
  if (!user || !ready) return <p className="dash-load">Loading…</p>;
  const set = (patch) => save({ ...db, ...patch });
  return (
    <div className="dash">
      <aside className="side">
        <a href="/" className="logo">Aurelian</a>
        <nav>{TABS.map((t) => <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</nav>
        <div className="side-b"><p>{user.email}</p><button onClick={() => { logout(); router.push('/login'); }}>Sign out</button><button onClick={() => confirm('Reset all data to the sample set?') && reset()}>Reset demo data</button></div>
      </aside>
      <section className="dmain">
        <h1>{tab}</h1>
        {tab === 'Overview' && <Overview db={db} />}
        {tab === 'Listings' && <Listings db={db} set={set} />}
        {tab === 'Sold' && <Sold db={db} />}
        {tab === 'Leads' && <Leads db={db} set={set} />}
        {tab === 'Agents' && <Agents db={db} />}
      </section>
    </div>
  );
}
