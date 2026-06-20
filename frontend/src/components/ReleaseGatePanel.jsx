export default function ReleaseGatePanel({ runs, grades, assertions, changeLogs }) {
  const latestRun = runs[0];
  const latestGrades = latestRun ? grades.filter((g) => g.run_id === latestRun.id) : [];
  const total = latestGrades.length;
  const pass = latestGrades.filter((g) => g.status === 'pass').length;
  const fail = latestGrades.filter((g) => g.status === 'fail').length;
  const passRate = total ? Math.round((pass / total) * 100) : 0;
  const canShip = total > 0 && fail === 0 && passRate >= 80;
  const decision = canShip ? 'SHIP CANDIDATE' : 'DO NOT SHIP YET';

  function exportMarkdown() {
    const lines = ['# AI Regression Firewall Evidence Report', '', `Latest run: ${latestRun?.label || 'No run'}`, `Decision: ${decision}`, `Pass rate: ${pass}/${total} (${passRate}%)`, `Assertions configured: ${assertions.length}`, '', '## Failed / review cases'];
    latestGrades.filter((g) => g.status !== 'pass').forEach((g) => {
      lines.push(`### ${g.golden_cases?.title || g.golden_case_id}`);
      lines.push(`Status: ${g.status}`);
      lines.push(`Reason: ${g.reason}`);
      if (g.suggested_fix) lines.push(`Suggested fix: ${g.suggested_fix}`);
      lines.push('');
    });
    lines.push('## Change logs');
    changeLogs.forEach((log) => lines.push(`- ${log.change_type}: ${log.change_description}`));
    const blob = new Blob([lines.join('\\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ai-regression-evidence-report.md'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className={`card release-gate ${canShip ? 'ship' : 'block'}`}>
      <div className="section-title"><h2>Release gate</h2><span>Decision based on latest run</span></div>
      <div className="release-decision">{decision}</div>
      <p>Latest run pass rate: <b>{pass}/{total}</b> ({passRate}%). {fail > 0 ? `${fail} failing case(s) still exist.` : 'No failing cases in latest run.'}</p>
      <p className="hint">Real value: preventing a known AI failure from shipping again.</p>
      <button onClick={exportMarkdown} disabled={!latestRun}>Export evidence report</button>
    </section>
  );
}
