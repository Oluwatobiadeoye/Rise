function Footer() {
  useLucide();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="top">
          <div className="brand-col">
            <a className="brand" href="#top">
              <img src={LOGO} alt="RISE" style={{ width: 40, height: 40 }} />
              <span className="wm" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 23, letterSpacing: "-.03em", color: "#fff" }}>RISE</span>
            </a>
            <p>Identify, develop and connect young people through leadership, mentorship and access to opportunities.</p>
          </div>
          <div>
            <h5>Programs</h5>
            <ul>
              <li><a href="#programs">Leadership cohort</a></li>
              <li><a href="#mentor">Mentorship</a></li>
              <li><a href="#impact">Opportunities</a></li>
            </ul>
          </div>
          <div>
            <h5>Get involved</h5>
            <ul>
              <li><a href="#top">Join a cohort</a></li>
              <li><a href="#mentor">Become a mentor</a></li>
              <li><a href="#top">Partner with us</a></li>
              <li><a href="#top">Donate</a></li>
            </ul>
          </div>
          <div>
            <h5>About</h5>
            <ul>
              <li><a href="#top">Our story</a></li>
              <li><a href="#impact">Impact</a></li>
              <li><a href="#top">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="bot">
          <span>© 2026 RISE Initiative. A registered non-profit.</span>
          <div className="social">
            <a href="#top" aria-label="Instagram"><i data-lucide="instagram"></i></a>
            <a href="#top" aria-label="LinkedIn"><i data-lucide="linkedin"></i></a>
            <a href="#top" aria-label="YouTube"><i data-lucide="youtube"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
window.Footer = Footer;
