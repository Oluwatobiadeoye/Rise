function Mentor({ onMentor }) {
  useLucide();
  const points = [
    "Give 2 hours a month — mentor one young person.",
    "Share your network, skills, and the doors you can open.",
    "Drive real impact in your own community.",
  ];
  return (
    <section className="section" id="mentor" style={{ background: "var(--rise-white)" }}>
      <div className="wrap mentor">
        <Placeholder id="mentor-photo" className="mentor-photo" style={{ height: "380px" }} src={window.RISE_MENTOR || "../../assets/photo-mentor.jpg"} label="Drop a photo — mentor & mentee" />
        <div>
          <p className="eyebrow">For professionals</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(28px,3.4vw,40px)", lineHeight: 1.1, letterSpacing: "-.02em", margin: "0 0 18px", color: "var(--rise-ink)" }}>
            Your experience could change a young person's path.
          </h2>
          <ul className="list">
            {points.map((p, i) => (
              <li key={i}><i data-lucide="check-circle-2"></i><span>{p}</span></li>
            ))}
          </ul>
          <button className="btn btn-secondary btn-lg" onClick={onMentor}>
            Become a mentor <i data-lucide="arrow-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
window.Mentor = Mentor;
