export default function ResultsPanel({ runs, grades }) {
  function gradesForRun(runId) {
    return grades.filter((g) => g.run_id === runId);
  }

  function stats(runGrades) {
    const total = runGrades.length;
    const pass = runGrades.filter((g) => g.status === 'pass').length;
    const fail = runGrades.filter((g) => g.status === 'fail').length;
    const review = runGrades.filter((g) => g.status === 'needs_review').length;
    return { total, pass, fail, review };
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>5. Results</h2>
        <span>Use this as Move 5 evidence</span>
      </div>

      {runs.length === 0 && <p className="empty">No eval runs yet.</p>}

      {runs.map((run) => {
        const runGrades = gradesForRun(run.id);
        const s = stats(runGrades);

        return (
          <article className="run-card" key={run.id}>
            <div className="row spread">
              <div>
                <h3>{run.label}</h3>
                <p className="hint">{new Date(run.created_at).toLocaleString()} • {run.model_provider} / {run.model_name}</p>
              </div>
              <div className="score-pill">
                {s.pass}/{s.total} pass
              </div>
            </div>

            <div className="metrics">
              <span className="pass">Pass: {s.pass}</span>
              <span className="fail">Fail: {s.fail}</span>
              <span className="review">Review: {s.review}</span>
            </div>

            {runGrades.map((g) => (
              <div className={`grade-card ${g.status}`} key={g.id}>
                <div className="row spread">
                  <strong>{g.status.toUpperCase()} — score {Number(g.score).toFixed(2)}</strong>
                  {g.is_unknown_failure && <span className="tag">unknown failure</span>}
                </div>

                <p><b>Case:</b> {g.golden_cases?.title}</p>
                <p><b>Reason:</b> {g.reason}</p>

                {g.missing_requirements?.length > 0 && (
                  <p><b>Missing:</b> {g.missing_requirements.join(', ')}</p>
                )}

                {g.suggested_fix && <p><b>Suggested fix:</b> {g.suggested_fix}</p>}
              </div>
            ))}
          </article>
        );
      })}
    </section>
  );
}
