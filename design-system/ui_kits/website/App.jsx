function App() {
  const [modal, setModal] = useState(null); // null | 'join' | 'mentor'
  useLucide([modal]);
  return (
    <React.Fragment>
      <Nav onJoin={() => setModal("join")} />
      <Hero onJoin={() => setModal("join")} />
      <Pillars />
      <Impact />
      <Mentor onMentor={() => setModal("mentor")} />
      <Steps />
      <Footer />
      {modal && <JoinModal mode={modal} onClose={() => setModal(null)} />}
    </React.Fragment>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
