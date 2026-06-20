import { useState } from 'react';
import { gradeCases } from '../services/api';
import { createGrades, createRun } from '../services/db';

export default function EvalRunner({ selectedFeature, cases, rubric, assertions = [], onRunSaved }) {
  const [actualOutputs, setActualOutputs] = useState({});
  const [label, setLabel] = useState('Run 1: before fix');
  const [busy, setBusy] = useState(false);


  function runDeterministicAssertions(actualOutput) {
    const failures = [];
    for (const assertion of assertions) {
      const type = assertion.assertion_type;
      const value = assertion.value || '';
      const name = assertion.name || type;

      if (type === 'contains' && !actualOutput.toLowerCase().includes(value.toLowerCase())) failures.push(`${name}: output does not contain "${value}"`);
      if (type === 'not_contains' && actualOutput.toLowerCase().includes(value.toLowerCase())) failures.push(`${name}: output contains forbidden text "${value}"`);

      if (type === 'max_length') {
        const max = Number(value);
        if (Number.isFinite(max) && actualOutput.length > max) failures.push(`${name}: output length ${actualOutput.length} exceeds ${max}`);
      }

      if (type === 'valid_json') {
        try { JSON.parse(actualOutput); } catch { failures.push(`${name}: output is not valid JSON`); }
      }
    }
    return failures;
  }

  async function runEval() {
    if (!selectedFeature) return alert('Select a feature first.');
    if (!cases.length) return alert('Add golden cases first.');
    if (!rubric.trim()) return alert('Save/write a rubric first.');

    const missing = cases.filter((c) => !actualOutputs[c.id]?.trim());
    if (missing.length) return alert('Paste actual output for every golden case.');

    setBusy(true);
    try {
      const payloadCases = cases.map((c) => ({
        case_id: c.id,
        title: c.title,
        input: c.input,
        expected_output: c.expected_output,
        actual_output: actualOutputs[c.id],
      }));

      const graded = await gradeCases({
        featureName: selectedFeature.name,
        featureDescription: selectedFeature.description,
        rubric,
        cases: payloadCases,
      });

      const { data: run, error: runError } = await createRun({
        featureId: selectedFeature.id,
        label,
        modelProvider: graded.provider,
        modelName: graded.model,
        notes: `Provider ${graded.provider}, model ${graded.model}`,
      });
      if (runError) throw runError;

      const gradeRows = graded.results.map((result) => {
        const assertionFailures = runDeterministicAssertions(actualOutputs[result.case_id]);
        const hasAssertionFailure = assertionFailures.length > 0;
        return {
          run_id: run.id,
          golden_case_id: result.case_id,
          actual_output: actualOutputs[result.case_id],
          status: hasAssertionFailure ? 'fail' : result.status,
          score: hasAssertionFailure ? Math.min(result.score, 0.4) : result.score,
          reason: hasAssertionFailure ? `${result.reason} Deterministic assertion failure(s): ${assertionFailures.join('; ')}` : result.reason,
          missing_requirements: [...(result.missing_requirements || []), ...assertionFailures],
          suggested_fix: hasAssertionFailure ? 'Fix the output contract first. Deterministic assertions failed before semantic quality can be trusted.' : result.suggested_fix,
          is_unknown_failure: Boolean(result.is_unknown_failure || hasAssertionFailure),
        };
      });

      const { error: gradesError } = await createGrades(gradeRows);
      if (gradesError) throw gradesError;

      setActualOutputs({});
      setLabel(label.includes('before') ? 'Run 2: after fix' : 'Follow-up run');
      await onRunSaved();
      alert('Eval run saved.');
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>4. Run eval</h2>
        <span>Paste actual AI outputs from the builder's app</span>
      </div>

      <label>Run label</label>
      <input value={label} onChange={(e) => setLabel(e.target.value)} />

      {cases.length === 0 && <p className="empty">No cases yet.</p>}

      {cases.map((c, index) => (
        <div className="case-runner" key={c.id}>
          <h3>Case {index + 1}: {c.title}</h3>
          <p><b>Input:</b> {c.input}</p>
          <p><b>Expected:</b> {c.expected_output}</p>

          <label>Actual output from AI feature</label>
          <textarea
            value={actualOutputs[c.id] || ''}
            onChange={(e) => setActualOutputs({ ...actualOutputs, [c.id]: e.target.value })}
            placeholder="Paste actual output here"
          />
        </div>
      ))}

      <button disabled={busy} onClick={runEval}>{busy ? 'Grading...' : 'Run and save eval'}</button>
    </section>
  );
}
