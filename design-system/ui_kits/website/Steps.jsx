function Steps() {
  const steps = [
    { t: "Apply", d: "Tell us about yourself in a short application. No grades or CV required." },
    { t: "Get matched", d: "Join a cohort and get paired with a mentor in your field of interest." },
    { t: "Rise", d: "Complete the program, build your project, and step into new opportunities." },
  ];
  return (
    <section className="section" id="how" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="section-head center">
          <p className="eyebrow">How it works</p>
          <h2>From application to leadership in three steps.</h2>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div className="step" key={i}>
              <div className="num">{i + 1}</div>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
window.Steps = Steps;
