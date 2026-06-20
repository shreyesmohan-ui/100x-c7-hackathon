import { useState } from 'react';
import { createChangeLog } from '../services/db';

export default function ChangeLogPanel({ selectedFeatureId, runs, changeLogs, reload }) {
  const [beforeRunId, setBeforeRunId] = useState('');
  const [afterRunId, setAfterRunId] = useState('');
  const [changeType, setChangeType] = useState('prompt');
  const [changeDescription, setChangeDescription] = useState('Added instruction: fail if answer is not grounded in retrieved source.');
  const [evidenceNote, setEvidenceNote] = useState('Before run failed a source-grounding case. After run passed the same case.');

  async function save() {
    if (!selectedFeatureId) return alert('Select a feature first.');
    if (!changeDescription.trim()) return alert('Change description required.');

    const { error } = await createChangeLog({
      featureId: selectedFeatureId,
      beforeRunId,
      afterRunId,
      changeType,
      changeDescription,
      evidenceNote,
    });

    if (error) return alert(error.message);

    setBeforeRunId('');
    setAfterRunId('');
    setChangeDescription('');
    setEvidenceNote('');
    reload();
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>6. Change log</h2>
        <span>Connect failure → fix → re-run</span>
      </div>

      <label>Before run</label>
      <select value={beforeRunId} onChange={(e) => setBeforeRunId(e.target.value)}>
        <option value="">Select before run</option>
        {runs.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
      </select>

      <label>After run</label>
      <select value={afterRunId} onChange={(e) => setAfterRunId(e.target.value)}>
        <option value="">Select after run</option>
        {runs.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
      </select>

      <label>Change type</label>
      <select value={changeType} onChange={(e) => setChangeType(e.target.value)}>
        <option value="prompt">Prompt</option>
        <option value="guardrail">Guardrail</option>
        <option value="retrieval">Retrieval</option>
        <option value="schema">Schema</option>
        <option value="model">Model</option>
        <option value="other">Other</option>
      </select>

      <label>Concrete change made</label>
      <textarea value={changeDescription} onChange={(e) => setChangeDescription(e.target.value)} />

      <label>Evidence note</label>
      <textarea value={evidenceNote} onChange={(e) => setEvidenceNote(e.target.value)} />

      <button onClick={save}>Save change evidence</button>

      <div className="list">
        {changeLogs.map((log) => (
          <div className="mini-card" key={log.id}>
            <strong>{log.change_type.toUpperCase()}</strong>
            <p>{log.change_description}</p>
            <p className="hint">{log.evidence_note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
