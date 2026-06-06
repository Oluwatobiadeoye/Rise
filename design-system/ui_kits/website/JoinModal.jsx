function JoinModal({ mode, onClose }) {
  const [sent, setSent] = useState(false);
  useLucide([sent]);
  const isMentor = mode === "mentor";
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close"><i data-lucide="x"></i></button>
        {sent ? (
          <div className="done">
            <div className="check"><i data-lucide="check"></i></div>
            <h3>You're in motion.</h3>
            <p className="sub">Thanks — we'll be in touch soon with the next steps. Welcome to RISE.</p>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
            <h3>{isMentor ? "Become a mentor" : "Join the next cohort"}</h3>
            <p className="sub">{isMentor
              ? "Give a few hours a month and help a young person rise."
              : "Applications for the 2026 cohort are open. Tell us a little about you."}</p>
            <label>Full name</label>
            <input className="field" placeholder="Your name" required />
            <label>Email</label>
            <input className="field" type="email" placeholder="you@email.com" required />
            <label>{isMentor ? "Your field / expertise" : "What do you want to develop?"}</label>
            <input className="field" placeholder={isMentor ? "e.g. Marketing, Engineering" : "e.g. Public speaking, starting a project"} />
            <button className="btn btn-primary btn-lg" type="submit" style={{ width: "100%" }}>
              {isMentor ? "Apply to mentor" : "Submit application"} <i data-lucide="arrow-right"></i>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
window.JoinModal = JoinModal;
