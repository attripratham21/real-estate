'use client';
import { useEffect, useRef, useState } from 'react';
import { useDb, AGENTS, cr } from '../lib/data';

export function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`rv ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
const Head = ({ k, t, p }) => <Reveal className="head"><p className="eyebrow">{k}</p><h2>{t}</h2>{p && <p className="lead">{p}</p>}</Reveal>;
const initials = (n) => n.split(' ').filter((w) => /^[A-Z]/.test(w) && !w.endsWith('.')).map((w) => w[0]).slice(0, 2).join('');

function Count({ to, prefix = '', suffix = '' }) {
  const ref = useRef(); const [v, setV] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const tick = (t) => { const k = Math.min(1, (t - t0) / 1600); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{v.toLocaleString('en-IN')}{suffix}</span>;
}

export function Stats() {
  const S = [[18, '', ' yrs', 'in business since 2008'], [1240, '', '+', 'homes sold'], [4800, '₹', ' Cr', 'sales volume'], [96, '', '%', 'clients by referral']];
  return (
    <section className="block stats">
      {S.map(([n, p, s, l], i) => <Reveal key={l} delay={i * 80} className="stat"><strong><Count to={n} prefix={p} suffix={s} /></strong><span>{l}</span></Reveal>)}
    </section>
  );
}

export function HeroStats() {
  const S = [[18, '', ' yrs', 'in business'], [1240, '', '+', 'homes sold'], [4800, '₹', ' Cr', 'sales volume'], [96, '', '%', 'by referral']];
  return <div className="hstats">{S.map(([n, p, x, l]) => <div key={l}><strong><Count to={n} prefix={p} suffix={x} /></strong><span>{l}</span></div>)}</div>;
}

export function RecentlySold() {
  const { db } = useDb();
  return (
    <section id="sold" className="block">
      <Head k="Track record" t="Recently sold" p="Real closings, with the price achieved against the asking price. Buyer names are kept private." />
      <div className="grid">
        {db.sold.slice(0, 6).map((s, i) => (
          <Reveal key={s.id} delay={i * 60}>
            <article className="panel home soldc">
              <span className="tag">Sold · {s.date}</span>
              <h3>{s.title}</h3>
              <p className="loc">{s.city}</p>
              <p className="price">{cr(s.soldPrice)}</p>
              <p className="spec">{Math.round((s.soldPrice / s.listPrice) * 100)}% of asking · sold by {s.agent}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const SERVICES = [
  ['Buying', 'Shortlists built around your brief, not our inventory. We check title, approvals and society dues before you see a home.'],
  ['Selling', 'Professional photography, a pricing study and a private buyer list. Most homes are under offer within 45 days.'],
  ['Luxury & penthouses', 'Off-market access to high-rise and architect-designed homes, with discreet, appointment-only viewings.'],
  ['Land & farmhouses', 'Hill and orchard plots with verified ownership, mutation records and clear building rights.'],
  ['NRI desk', 'Remote viewings, power-of-attorney support and handover coordination across time zones.'],
  ['Valuation & legal', 'Independent valuation reports and in-house legal review of agreements, registry and stamp duty.'],
];
export function Services() {
  return (
    <section id="services" className="block">
      <Head k="What we do" t="Services" p="One team handles the whole transaction, from the first call to the day you get the keys." />
      <div className="grid">{SERVICES.map(([t, d], i) => <Reveal key={t} delay={i * 60}><div className="panel svc"><span className="num">0{i + 1}</span><h3>{t}</h3><p>{d}</p></div></Reveal>)}</div>
    </section>
  );
}

const TIMELINE = [['2008', 'Founded in Chandigarh by two partners and a rented office.'], ['2013', 'First ₹10 Cr+ penthouse sale; luxury desk opens.'], ['2016', 'Mumbai office opens for sea-facing and high-rise homes.'], ['2020', 'Virtual tours and NRI desk launched.'], ['2023', 'Crossed 1,000 homes sold with zero registry disputes.'], ['2026', 'Gurugram and Goa offices open.']];
export function About() {
  return (
    <section id="about" className="block">
      <Head k="About us" t="A family-run agency that still answers its own phone" />
      <div className="split">
        <Reveal>
          <div className="panel prose">
            <p>Aurelian Estates began in 2008 with a simple rule: never list a home we would not walk through ourselves. Eighteen years later, every property still gets a site visit by a partner or senior advisor before it reaches the website.</p>
            <p>We are a boutique firm. That means fewer listings, more time per client, and one advisor who stays with you from enquiry to handover. We do not run call centres or sell leads to third parties.</p>
            <p><strong>Our promise:</strong> clear titles, published fees and honest advice, including telling you when not to buy.</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <ol className="panel timeline">{TIMELINE.map(([y, t]) => <li key={y}><b>{y}</b><span>{t}</span></li>)}</ol>
        </Reveal>
      </div>
    </section>
  );
}

const OWNERS = [
  ['Harjot Singh Bedi', 'Founder & Managing Director', '30 years in real estate', 'Started Aurelian in 2008 after a decade in commercial development. Leads strategy, partnerships and every ₹25 Cr+ negotiation.', 'A good sale is one both sides are still happy about in five years.'],
  ['Meera Kapoor', 'Co-founder & Director, Sales', '22 years in residential sales', 'Built the luxury desk and trains every advisor. Personally closed over 200 homes.', 'We earn trust one honest viewing at a time.'],
  ['Arvind Khanna', 'Head of Legal & Compliance', 'Advocate, 20 years', 'Reviews every agreement, title chain and registry before a deal is signed.', 'Paperwork is where deals are won or lost.'],
  ['Ishita Rao', 'Head of Design & Valuation', 'B.Arch, registered valuer', 'Advises on layouts, renovation value and independent valuation reports.', 'Good design holds its value.'],
];
export function Leadership() {
  return (
    <section id="leadership" className="block">
      <Head k="Leadership" t="Meet the owners" p="The people whose names are on the door, and who sign off on every deal." />
      <div className="grid">
        {OWNERS.map(([n, r, c, b, q], i) => (
          <Reveal key={n} delay={i * 80}>
            <article className="panel person">
              <div className="avatar" aria-hidden="true">{initials(n)}</div>
              <h3>{n}</h3>
              <p className="loc">{r}</p>
              <p className="spec">{c}</p>
              <p>{b}</p>
              <blockquote>“{q}”</blockquote>
            </article>
          </Reveal>
        ))}
      </div>
      <p className="hint">Sample profiles. Replace with your real owners and add their photographs.</p>
    </section>
  );
}

const ROLES = ['Senior Property Advisor', 'Head of Luxury Sales', 'Land & Hills Specialist', 'NRI & Investment Advisor'];
export function Team() {
  const { db } = useDb();
  return (
    <section id="team" className="block">
      <Head k="Our advisors" t="The team behind the sales" p="Live figures from our own sales records." />
      <div className="grid">
        {AGENTS.map((a, i) => {
          const s = db.sold.filter((x) => x.agent === a);
          const vol = s.reduce((t, x) => t + x.soldPrice, 0);
          return (
            <Reveal key={a} delay={i * 80}>
              <article className="panel person">
                <div className="avatar sm" aria-hidden="true">{initials(a)}</div>
                <h3>{a}</h3><p className="loc">{ROLES[i]}</p>
                <p className="spec">{s.length} homes sold · {cr(vol)} · {db.listings.filter((l) => l.agent === a).length} active listings</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

const STEPS = [['Consult', 'A free 30-minute call to understand budget, timing and must-haves.'], ['Shortlist', 'Three to five verified homes, with title and approval checks done.'], ['Visit', 'Private viewings at the times of day that matter, with honest notes.'], ['Negotiate & legal', 'We negotiate, our legal team reviews every document, and you sign with confidence.'], ['Handover', 'Registry, utilities, keys and a 90-day after-care call.']];
export function Process() {
  return (
    <section id="approach" className="block">
      <Head k="How we work" t="From first call to keys in hand" />
      <div className="steps5">
        {STEPS.map(([t, d], i) => <Reveal key={t} delay={i * 70}><div className="panel step"><span className="num">{i + 1}</span><h3>{t}</h3><p>{d}</p></div></Reveal>)}
      </div>
      <Reveal><p className="panel fees">Fixed, published fees: <strong>1% for buyers</strong>, <strong>1.5% for sellers</strong>. No retainers, no hidden add-ons.</p></Reveal>
    </section>
  );
}

const QUOTES = [['Our flat sold in 19 days, above asking. They told us the price to ask and they were right.', 'Rakesh & Sunita Arora', 'Sold in Mohali'], ['Living in Canada, I bought a villa in Goa without flying in once. The video tours and legal check were thorough.', 'Neelam Dhillon', 'Bought in Goa'], ['They talked us out of a plot with a title problem. That saved us ₹3 Cr and a lot of stress.', 'Dr. Anil Chawla', 'Bought in Kasauli']];
export function Testimonials() {
  return (
    <section className="block">
      <Head k="Clients" t="What our clients say" />
      <div className="grid">{QUOTES.map(([q, n, w], i) => <Reveal key={n} delay={i * 80}><figure className="panel quote"><blockquote>“{q}”</blockquote><figcaption><b>{n}</b><span>{w}</span></figcaption></figure></Reveal>)}</div>
      <p className="hint">Sample testimonials. Replace with real, permissioned client reviews.</p>
    </section>
  );
}

const AREAS = [['Chandigarh', 420], ['Mohali', 210], ['Gurugram', 190], ['Mumbai', 160], ['Goa', 130], ['Kasauli & Shimla', 130]];
export function Areas() {
  return (
    <section className="block">
      <Head k="Where we work" t="Cities we serve" p="Homes sold by location since 2008." />
      <Reveal><div className="chips">{AREAS.map(([c, n]) => <span key={c} className="panel chip"><b>{c}</b>{n} homes</span>)}</div></Reveal>
      <Reveal><ul className="panel badges">{['RERA-registered agency', '4.9 / 5 from 600+ reviews', 'Zero registry disputes', 'Top boutique agency 2025'].map((b) => <li key={b}>{b}</li>)}</ul></Reveal>
    </section>
  );
}

const POSTS = [['Pricing', 'What a 2.5% commission should actually cover', '6 min read'], ['Land', 'Buying in the hills: five title checks before you pay a token', '8 min read'], ['NRI', 'A first-time NRI buyer’s checklist for India', '7 min read']];
export function Insights() {
  return (
    <section className="block">
      <Head k="Insights" t="Guides from our advisors" />
      <div className="grid">{POSTS.map(([t, h, r], i) => <Reveal key={h} delay={i * 80}><a href="#contact" className="panel post"><span className="tag">{t}</span><h3>{h}</h3><p className="spec">{r}</p></a></Reveal>)}</div>
    </section>
  );
}

const FAQS = [['How much do you charge?', 'Buyers pay 1% and sellers 1.5% of the final price. Fees are written into the agreement before we start.'], ['How long does a sale take?', 'Well-priced homes are usually under offer in 30 to 60 days. We give you an honest estimate after the first visit.'], ['Can you help with a home loan?', 'Yes. We introduce you to bank partners and help with documentation, but you choose the lender.'], ['Do you work with NRIs?', 'Yes. Our NRI desk handles remote viewings, power of attorney, registry and handover.'], ['What checks do you do on a property?', 'Title chain, encumbrance, approvals, society dues and land-use status, reviewed by our in-house legal team.'], ['Can I view a home at night or on a weekend?', 'Yes. We encourage viewing at different times of day, and weekend slots are available.']];
export function FAQ() {
  return (
    <section id="faq" className="block narrow">
      <Head k="FAQ" t="Questions we hear most" />
      <Reveal><div className="panel faq">{FAQS.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></Reveal>
    </section>
  );
}

const OFFICES = [['Chandigarh (HQ)', 'SCO 12, Sector 17, Chandigarh 160017', '+91 98765 00001'], ['Mumbai', 'Nariman Point, Mumbai 400021', '+91 98765 00002'], ['Gurugram', 'Golf Course Road, Gurugram 122002', '+91 98765 00003'], ['Goa', 'Porvorim, North Goa 403521', '+91 98765 00004']];
export function Offices() {
  return (
    <div className="offices">
      {OFFICES.map(([c, a, p]) => <div key={c} className="panel"><h3>{c}</h3><p>{a}</p><p className="loc">{p}</p></div>)}
      <div className="panel"><h3>Hours</h3><p>Mon–Sat 9:30 am – 7 pm<br />Sunday by appointment</p><p className="loc">hello@aurelian-estates.com</p></div>
    </div>
  );
}

export function Newsletter() {
  const [ok, setOk] = useState(false);
  return (
    <section className="block narrow">
      <Reveal>
        <div className="panel news">
          <h3>New listings, first</h3><p>One email a month with off-market homes and market notes. No spam.</p>
          {ok ? <p className="loc">Thank you, you are subscribed.</p> : (
            <form className="bar" onSubmit={(e) => { e.preventDefault(); setOk(true); }}>
              <input type="email" required placeholder="you@email.com" aria-label="Email" /><button className="pri">Subscribe</button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  const col = (t, items) => <div><h4>{t}</h4>{items.map(([l, h]) => <a key={l} href={h}>{l}</a>)}</div>;
  return (
    <footer className="foot">
      <div className="fgrid">
        <div><a href="#top" className="logo">Aurelian</a><p>Architect-designed homes, penthouses and land. Boutique real estate since 2008.</p><p className="spec">RERA reg. no. PBRERA-XXXX-XXXX (replace)</p></div>
        {col('Company', [['About', '#about'], ['Leadership', '#leadership'], ['Our team', '#team'], ['Careers', '#contact']])}
        {col('Services', [['Buy', '#services'], ['Sell', '#services'], ['NRI desk', '#services'], ['Valuation', '#services']])}
        {col('Explore', [['Collection', '#collection'], ['Recently sold', '#sold'], ['FAQ', '#faq'], ['Agent login', '/login']])}
        <div><h4>Contact</h4><a href="tel:+919876500001">+91 98765 00001</a><a href="mailto:hello@aurelian-estates.com">hello@aurelian-estates.com</a><p>SCO 12, Sector 17, Chandigarh 160017</p></div>
      </div>
      <p className="legal">© {new Date().getFullYear()} Aurelian Estates · Privacy · Terms · Sample content: replace with your own.</p>
    </footer>
  );
}
