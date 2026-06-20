import { useState } from 'react';
import { createAssertion, deleteAssertion } from '../services/db';

export default function AssertionPanel({ selectedFeatureId, assertions, reload }) {
  const [name, setName] = useState('Must cite source id');
  const [assertionType, setAssertionType] = useState('contains');
  const [value, setValue] = useState('source');
  const [severity, setSeverity] = useState('critical');

  async function save() {
    if (!selectedFeatureId) return alert('Select a feature first.');
    if (!name.trim()) return alert('Assertion name required.');
    const { error } = await createAssertion({ featureId: selectedFeatureId, name, assertionType, value, severity });
    if (error) return alert(error.message);
    setName(''); setValue('');
    reload();
  }

  async function remove(id) {
    const { error } = await deleteAssertion(id);
    if (error) return alert(error.message);
    reload();
  }

  return (
    <section className="card">
      <div className="section-title"><h2>Deterministic assertions</h2><span>Checks the LLM judge should not decide</span></div>
      <label>Assertion name</label><input value={name} onChange={(e) => setName(e.target.value)} />
      <label>Type</label>
      <select value={assertionType} onChange={(e) => setAssertionType(e.target.value)}>
        <option value="contains">Output must contain</option>
        <option value="not_contains">Output must NOT contain</option>
        <option value="max_length">Max character length</option>
        <option value="valid_json">Valid JSON</option>
      </select>
      <label>Value</label><input value={value} onChange={(e) => setValue(e.target.value)} placeholder="For valid_json, leave blank" />
      <label>Severity</label>
      <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
        <option value="critical">Critical: fail release</option><option value="warning">Warning: review only</option>
      </select>
      <button onClick={save}>Add assertion</button>
      <div className="list">
        {assertions.map((a) => (
          <div className="mini-card" key={a.id}>
            <div className="row spread"><strong>{a.name}</strong><button className="link danger-text" onClick={() => remove(a.id)}>Delete</button></div>
            <p><b>Type:</b> {a.assertion_type} {a.value ? `→ ${a.value}` : ''}</p><p><b>Severity:</b> {a.severity}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
