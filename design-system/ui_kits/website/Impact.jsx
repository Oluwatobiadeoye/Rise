function Impact() {
  const stats = [
    { n: "1,200", l: "young people developed" },
    { n: "180", l: "professional mentors" },
    { n: "40+", l: "partner organisations", em: "+" },
    { n: "92%", l: "report new opportunities" },
  ];
  return (
    <section className="section" id="impact">
      <div className="wrap">
        <div className="impact">
          <div className="head">
            <p className="eyebrow" style={{ color: "var(--rise-gold)" }}>Our impact</p>
            <h2>Since 2024, RISE has helped young people step into leadership — and stay there.</h2>
          </div>
          <div className="stats">
            {stats.map((s, i) => (
              <div className="stat" key={i}>
                <div className="n">{s.n.replace("+", "")}{s.em && <em>+</em>}</div>
                <div className="l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
window.Impact = Impact;
