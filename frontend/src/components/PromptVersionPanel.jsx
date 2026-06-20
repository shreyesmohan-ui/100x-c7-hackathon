import { useState } from 'react';
import { createPromptVersion, deletePromptVersion } from '../services/db';

export default function PromptVersionPanel({ selectedFeatureId, promptVersions, reload }) {
  const [label, setLabel] = useState('Prompt v1');
  const [modelName, setModelName] = useState('llama-3.3-70b-versatile');
  const [promptText, setPromptText] = useState('Answer only from retrieved context. If evidence is missing, say evidence is insufficient.');
  const [retrievalConfig, setRetrievalConfig] = useState('top_k=5; reranker=false');
  const [notes, setNotes] = useState('Baseline prompt before fix.');

  async function save() {
    if (!selectedFeatureId) return alert('Select a feature first.');
    if (!label.trim() || !promptText.trim()) return alert('Label and prompt text are required.');
    const { error } = await createPromptVersion({ featureId: selectedFeatureId, label, modelName, promptText, retrievalConfig, notes });
    if (error) return alert(error.message);
    setLabel(''); setPromptText(''); setNotes('');
    reload();
  }

  async function remove(id) {
    const { error } = await deletePromptVersion(id);
    if (error) return alert(error.message);
    reload();
  }

  return (
    <section className="card">
      <div className="section-title"><h2>Prompt versions</h2><span>Track what changed between runs</span></div>
      <label>Version label</label><input value={label} onChange={(e) => setLabel(e.target.value)} />
      <label>Model name</label><input value={modelName} onChange={(e) => setModelName(e.target.value)} />
      <label>Prompt text</label><textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} />
      <label>Retrieval/model config</label><input value={retrievalConfig} onChange={(e) => setRetrievalConfig(e.target.value)} />
      <label>Notes</label><input value={notes} onChange={(e) => setNotes(e.target.value)} />
      <button onClick={save}>Save prompt version</button>
      <div className="list">
        {promptVersions.map((p) => (
          <div className="mini-card" key={p.id}>
            <div className="row spread"><strong>{p.label}</strong><button className="link danger-text" onClick={() => remove(p.id)}>Delete</button></div>
            <p><b>Model:</b> {p.model_name || '—'}</p><p><b>Config:</b> {p.retrieval_config || '—'}</p><p className="hint">{p.notes}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
