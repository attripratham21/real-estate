import SceneLoader from '../components/SceneLoader';
import Properties from '../components/Properties';
import Contact from '../components/Contact';
import Configurator from '../components/Configurator';
import AuthButton from '../components/AuthButton';
import HeroSearch from '../components/HeroSearch';
import { Reveal, HeroStats, RecentlySold, Services, About, Leadership, Team, Process, Testimonials, Areas, Insights, FAQ, Offices, Newsletter, Footer } from '../components/Sections';

export default function Home() {
  return (
    <main>
      <SceneLoader />
      <Configurator />
      <header className="nav">
        <a href="#top" className="logo">Aurelian</a>
        <nav>
          <a href="#collection">Collection</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#team">Team</a>
          <a href="#contact">Contact</a>
          <AuthButton />
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="hero-l">
          <p className="eyebrow">Real estate since 2008 · Chandigarh · Mumbai · Gurugram · Goa</p>
          <h1>Homes drawn by architects, sold by people who have lived in them.</h1>
          <p className="hero-sub">Aurelian Estates is a family-run agency with 1,240+ homes sold across North and West India. Every property is visited by a partner, every title is checked by our own legal team, and our fees are fixed and published.</p>
          <ul className="pills"><li>Verified titles</li><li>1% buyer / 1.5% seller fee</li><li>Private viewings</li><li>NRI desk</li></ul>
          <div className="cta"><a className="pri" href="#collection">View collection</a><a className="ghost" href="#contact">Book a private visit</a></div>
        </div>
        <div className="hero-r"><HeroSearch /></div>
        <HeroStats />
        <p className="scrollcue">Scroll to walk around the building from day to night ↓</p>
      </section>

      <section id="tour" className="tour">
        <div className="cap l panel"><h3>Street view</h3><p>Sixteen storeys above a six-metre podium. Every apartment has its own front-facing balcony.</p></div>
        <div className="cap r panel"><h3>Skyline</h3><p>Vertical concrete fins shade the glass in the afternoon and cut cooling load.</p></div>
        <div className="cap l panel"><h3>Entrance</h3><p>A brass canopy and double-height lobby open straight onto a tree-lined pavement.</p></div>
        <div className="cap r panel"><h3>Evening lights</h3><p>Watch the building come alive. Use the time-of-day slider, bottom right, to see it at any hour.</p></div>
      </section>

      <div className="after">
        <section id="collection" className="block">
          <Reveal className="head"><p className="eyebrow">Current collection</p><h2>Homes available now</h2></Reveal>
          <Properties />
        </section>
        <RecentlySold />
        <Services />
        <About />
        <Leadership />
        <Team />
        <Process />
        <Testimonials />
        <Areas />
        <Insights />
        <FAQ />
        <section id="contact" className="block">
          <Reveal className="head"><p className="eyebrow">Contact</p><h2>Book a private visit</h2><p className="lead">Tell us what you are looking for. An advisor will call within one working day.</p></Reveal>
          <div className="split"><Offices /><Contact /></div>
        </section>
        <Newsletter />
        <Footer />
      </div>
    </main>
  );
}
