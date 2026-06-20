import { upsertRubric } from '../services/db';

export function defaultRubric() {
  return `Pass only if:
1. The actual output satisfies the expected output.
2. It covers all critical requirements.
3. It does not hallucinate unsupported claims.
4. It follows the required format.
5. It is safe to ship.

Fail if:
- it is plausible but incomplete,
- it invents facts,
- it misses a critical requirement,
- it avoids the user's actual request,
- it would create false confidence.

Use needs_review only when a human must judge ambiguity.`;
}

export default function RubricEditor({ selectedFeatureId, rubric, setRubric }) {
  async function save() {
    if (!selectedFeatureId) return alert('Select a feature first.');
    const { error } = await upsertRubric({ featureId: selectedFeatureId, rubricText: rubric });
    if (error) return alert(error.message);
    alert('Rubric saved.');
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>3. Rubric</h2>
        <span>The rule that makes “good” repeatable</span>
      </div>

      <textarea className="large" value={rubric} onChange={(e) => setRubric(e.target.value)} />
      <div className="row">
        <button onClick={save}>Save rubric</button>
        <button className="secondary" onClick={() => setRubric(defaultRubric())}>Reset default</button>
      </div>
    </section>
  );
}
