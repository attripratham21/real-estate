'use client';
import { useEffect, useState } from 'react';
import { ui } from './store';

const HOMES = [
  { n: 'The Aurelian, 24th floor', t: 'Residence', loc: 'Chandigarh', price: '₹14.5 Cr', spec: '5 bed · 8,200 sq ft', c: '#ffffff', note: 'Corner residence with a 9 m balcony and city views on two sides.' },
  { n: 'Seawall Penthouse', t: 'Penthouse', loc: 'Mumbai', price: '₹42 Cr', spec: '4 bed · 5,600 sq ft', c: '#7a8088', note: 'Full-floor, wraparound glazing, private lift lobby.' },
  { n: 'Laterite Villa', t: 'Residence', loc: 'Goa', price: '₹9.8 Cr', spec: '4 bed · 4,900 sq ft', c: '#d9b48a', note: 'Courtyard plan built around a 90-year-old mango tree.' },
  { n: 'Orchard Plot, 2 acres', t: 'Land', loc: 'Kasauli', price: '₹6.2 Cr', spec: '2 acres · clear title', c: '#8fc4ae', note: 'South-facing slope with approved building footprint.' },
  { n: 'Skyline Duplex', t: 'Penthouse', loc: 'Gurugram', price: '₹21 Cr', spec: '4 bed · 6,100 sq ft', c: '#7a8088', note: 'Double-height living room and rooftop terrace.' },
];
const TABS = ['All', 'Residence', 'Penthouse', 'Land'];

function Card({ h }) {
  const tilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(8px)`;
  };
  const leave = (e) => { e.currentTarget.style.transform = ''; ui.hover = null; };
  return (
    <article className="panel home" onMouseMove={tilt} onMouseEnter={() => (ui.hover = h.c)} onMouseLeave={leave}>
      <p className="loc">{h.loc}</p>
      <h3>{h.n}</h3>
      <p>{h.note}</p>
      <p className="spec">{h.spec}</p>
      <p className="price">{h.price}</p>
    </article>
  );
}

export default function Properties() {
  const [f, setF] = useState({ tab: 'All', city: 'All', max: 0 });
  useEffect(() => {
    const on = (e) => setF((s) => ({ ...s, ...e.detail }));
    window.addEventListener('aurelian-search', on);
    return () => window.removeEventListener('aurelian-search', on);
  }, []);
  const num = (h) => parseFloat(h.price.replace(/[^\d.]/g, ''));
  const list = HOMES.filter((h) => (f.tab === 'All' || h.t === f.tab) && (f.city === 'All' || h.loc === f.city) && (!f.max || num(h) <= f.max));
  const filtered = f.city !== 'All' || f.max > 0;
  return (
    <div>
      <div className="tabs" role="tablist">
        {TABS.map((x) => <button key={x} role="tab" aria-selected={f.tab === x} className={f.tab === x ? 'on' : ''} onClick={() => setF({ ...f, tab: x })}>{x}</button>)}
      </div>
      <p className="hint">
        {list.length} home{list.length === 1 ? '' : 's'} shown{f.city !== 'All' ? ` in ${f.city}` : ''}{f.max ? ` up to ₹${f.max} Cr` : ''}. Hover a home and the 3D building takes on its facade tint.
        {filtered && <button className="auto" onClick={() => setF({ ...f, city: 'All', max: 0 })}>Clear filters</button>}
      </p>
      <div className="grid">{list.map((h) => <Card key={h.n} h={h} />)}</div>
      {!list.length && <p className="panel">No homes match. Try a wider budget or another city, or call us for off-market options.</p>}
    </div>
  );
}
