function Pillars() {
  useLucide();
  const items = [
    { ic: "compass", c: "c-evergreen", t: "Identify", d: "We find ambitious young people with the drive to lead — wherever they're starting from." },
    { ic: "sprout", c: "c-emerald", t: "Develop", d: "A structured leadership program: workshops, real projects, and one-to-one mentorship." },
    { ic: "users-round", c: "c-charcoal", t: "Connect", d: "Access to a network of professionals, opportunities, and a community that has your back." },
  ];
  return (
    <section className="section" id="programs">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">What we do</p>
          <h2>Three steps to lead — identify, develop, connect.</h2>
          <p>Every young person in RISE moves through the same journey, supported the whole way.</p>
        </div>
        <div className="pillars">
          {items.map((it, i) => (
            <article className="pillar" key={i}>
              <div className={"ic " + it.c}><i data-lucide={it.ic}></i></div>
              <h3>{it.t}</h3>
              <p>{it.d}</p>
              <a className="lnk" href="#how">Learn more <i data-lucide="arrow-right"></i></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
window.Pillars = Pillars;
