function Hero({ onJoin }) {
  useLucide();
  return (
    <section className="hero" id="top">
      <div className="wrap grid">
        <div className="copy">
          <p className="eyebrow">Youth leadership · est. 2024</p>
          <h1>Rise into your <em>potential.</em></h1>
          <p className="lead">
            Leadership development, mentorship and real opportunities for young
            people ready to lead — backed by professionals driving change in
            their communities.
          </p>
          <div className="cta-row">
            <button className="btn btn-primary btn-lg" onClick={onJoin}>
              Join the next cohort <i data-lucide="arrow-right"></i>
            </button>
            <a className="btn btn-outline btn-lg" href="#programs">See our programs</a>
          </div>
          <div className="trust">
            <div className="avatars">
              <span></span><span></span><span></span><span></span>
            </div>
            <span>1,200+ young people rising with us</span>
          </div>
        </div>
        <Placeholder id="hero-photo" className="hero-photo" style={{ height: "440px" }} src={window.RISE_HERO || "../../assets/photo-hero.jpg"} label="Drop a hero photo — young leaders at a workshop" />
      </div>
    </section>
  );
}
window.Hero = Hero;
