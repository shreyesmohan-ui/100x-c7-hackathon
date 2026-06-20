import { useState } from 'react';
import { createCase, deleteCase } from '../services/db';

export default function CaseManager({ selectedFeatureId, cases, reload }) {
  const [title, setTitle] = useState('Join customers and orders');
  const [input, setInput] = useState('Show me all customers who spent more than $1000 in 2023.');
  const [expectedOutput, setExpectedOutput] = useState("SELECT * FROM customers JOIN orders ON customers.id = orders.customer_id WHERE orders.amount > 1000 AND orders.date BETWEEN '2023-01-01' AND '2023-12-31';");
  const [notes, setNotes] = useState('Tests JOIN query and date range filter.');

  async function onCreate() {
    if (!selectedFeatureId) return alert('Select a feature first.');
    if (!input.trim() || !expectedOutput.trim()) return alert('Input and expected output are required.');

    const { error } = await createCase({
      featureId: selectedFeatureId,
      title,
      input,
      expectedOutput,
      notes,
    });

    if (error) return alert(error.message);

    setTitle('');
    setInput('');
    setExpectedOutput('');
    setNotes('');
    reload();
  }

  async function onDelete(id) {
    const { error } = await deleteCase(id);
    if (error) return alert(error.message);
    reload();
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>2. Golden cases</h2>
        <span>{cases.length} case(s). Submission needs five per app in Move 1.</span>
      </div>

      <label>Case title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Input</label>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} />

      <label>Expected good output</label>
      <textarea value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)} />

      <label>Notes</label>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} />

      <button onClick={onCreate}>Add golden case</button>

      <div className="list">
        {cases.map((c, index) => (
          <div key={c.id} className="mini-card">
            <div className="row spread">
              <strong>{index + 1}. {c.title}</strong>
              <button className="link danger-text" onClick={() => onDelete(c.id)}>Delete</button>
            </div>
            <p><b>Input:</b> {c.input}</p>
            <p><b>Expected:</b> {c.expected_output}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
