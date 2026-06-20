import { useState } from 'react';
import { createFeature, deleteFeature } from '../services/db';

export default function FeatureManager({ features, selectedFeatureId, setSelectedFeatureId, reload }) {
  const [name, setName] = useState('NCCN RAG Answerer');
  const [description, setDescription] = useState('Answers clinical workflow questions from source documents and FHIR context.');

  async function onCreate() {
    if (!name.trim()) return alert('Feature name is required.');
    const { data, error } = await createFeature({ name, description });
    if (error) return alert(error.message);
    setName('');
    setDescription('');
    await reload();
    if (data?.id) setSelectedFeatureId(data.id);
  }

  async function onDelete() {
    if (!selectedFeatureId) return;
    if (!confirm('Delete this feature and all related cases/runs?')) return;
    const { error } = await deleteFeature(selectedFeatureId);
    if (error) return alert(error.message);
    setSelectedFeatureId('');
    reload();
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>1. AI feature</h2>
        <span>Create the thing under test</span>
      </div>

      <label>Feature name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />

      <label>Description</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

      <div className="row">
        <button onClick={onCreate}>Create feature</button>
        <button className="danger" onClick={onDelete} disabled={!selectedFeatureId}>Delete selected</button>
      </div>

      <label>Selected feature</label>
      <select value={selectedFeatureId} onChange={(e) => setSelectedFeatureId(e.target.value)}>
        <option value="">Select feature</option>
        {features.map((f) => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>
    </section>
  );
}
