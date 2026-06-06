function Nav({ onJoin }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useLucide([open]);
  return (
    <header className={"nav" + (scrolled ? " scrolled" : "")}>
      <div className="wrap bar">
        <a className="brand" href="#top">
          <img src={LOGO} alt="RISE" />
          <span className="wm">RISE</span>
        </a>
        <nav className="nav-links">
          <a href="#programs">Programs</a>
          <a href="#impact">Impact</a>
          <a href="#mentor">Mentor</a>
          <a href="#how">How it works</a>
        </nav>
        <div className="right">
          <a className="btn btn-ghost" href="#mentor">Become a mentor</a>
          <button className="btn btn-primary" onClick={onJoin}>
            Join a cohort <i data-lucide="arrow-right"></i>
          </button>
          <button className="menu-btn" onClick={() => setOpen(o => !o)} aria-label="Menu">
            <i data-lucide={open ? "x" : "menu"}></i>
          </button>
        </div>
      </div>
    </header>
  );
}
window.Nav = Nav;
