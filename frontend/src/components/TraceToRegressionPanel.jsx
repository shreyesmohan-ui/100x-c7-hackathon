import { useState } from 'react';
import { createCase, createProductionTrace, markTraceConverted } from '../services/db';

export default function TraceToRegressionPanel({ selectedFeatureId, traces, reload }) {
  const [title, setTitle] = useState('Production failure: unsupported answer');
  const [input, setInput] = useState('Paste the real user input that caused a bad AI output.');
  const [badOutput, setBadOutput] = useState('Paste the bad AI output here.');
  const [whyWrong, setWhyWrong] = useState('The output made a claim that was not supported by retrieved context.');
  const [expectedBehavior, setExpectedBehavior] = useState('The AI should cite supporting context or say evidence is insufficient.');

  async function saveTrace() {
    if (!selectedFeatureId) return alert('Select a feature first.');
    if (!input.trim() || !badOutput.trim() || !whyWrong.trim()) return alert('Input, bad output, and why wrong are required.');
    const { error } = await createProductionTrace({ featureId: selectedFeatureId, title, input, badOutput, whyWrong, expectedBehavior });
    if (error) return alert(error.message);
    reload();
  }

  async function convert(trace) {
    const { error } = await createCase({
      featureId: selectedFeatureId,
      title: `Regression: ${trace.title}`,
      input: trace.input,
      expectedOutput: trace.expected_behavior || trace.why_wrong,
      notes: `Created from production failure. Bad output: ${trace.bad_output}`,
    });
    if (error) return alert(error.message);
    await markTraceConverted({ traceId: trace.id, caseId: null });
    reload();
    alert('Converted trace into a regression golden case.');
  }

  return (
    <section className="card">
      <div className="section-title"><h2>Trace → regression case</h2><span>Turn real failures into future protection</span></div>
      <label>Failure title</label><input value={title} onChange={(e) => setTitle(e.target.value)} />
      <label>Real user input</label><textarea value={input} onChange={(e) => setInput(e.target.value)} />
      <label>Bad AI output</label><textarea value={badOutput} onChange={(e) => setBadOutput(e.target.value)} />
      <label>Why it was wrong</label><textarea value={whyWrong} onChange={(e) => setWhyWrong(e.target.value)} />
      <label>Expected behavior next time</label><textarea value={expectedBehavior} onChange={(e) => setExpectedBehavior(e.target.value)} />
      <button onClick={saveTrace}>Save production failure</button>
      <div className="list">
        {traces.map((t) => (
          <div className="mini-card" key={t.id}>
            <div className="row spread"><strong>{t.title}</strong><button className="secondary" onClick={() => convert(t)}>Convert to regression case</button></div>
            <p><b>Why wrong:</b> {t.why_wrong}</p><p><b>Expected:</b> {t.expected_behavior}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
