import React, { useEffect, useMemo, useState } from 'react';

import AuthView from './components/AuthView';
import CaseManager from './components/CaseManager';
import ChangeLogPanel from './components/ChangeLogPanel';
import EvalRunner from './components/EvalRunner';
import FeatureManager from './components/FeatureManager';
import ResultsPanel from './components/ResultsPanel';
import RubricEditor, { defaultRubric } from './components/RubricEditor';
import AssertionPanel from './components/AssertionPanel';
import PromptVersionPanel from './components/PromptVersionPanel';
import ReleaseGatePanel from './components/ReleaseGatePanel';
import TraceToRegressionPanel from './components/TraceToRegressionPanel';

import { supabase } from './lib/supabaseClient';
import { fetchAssertions, fetchCases, fetchChangeLogs, fetchFeatures, fetchGrades, fetchProductionTraces, fetchPromptVersions, fetchRubric, fetchRuns } from './services/db';

export default function App() {
  const [session, setSession] = useState(null);
  const [features, setFeatures] = useState([]);
  const [selectedFeatureId, setSelectedFeatureId] = useState('');
  const [cases, setCases] = useState([]);
  const [rubric, setRubric] = useState(defaultRubric());
  const [runs, setRuns] = useState([]);
  const [grades, setGrades] = useState([]);
  const [changeLogs, setChangeLogs] = useState([]);
  const [promptVersions, setPromptVersions] = useState([]);
  const [assertions, setAssertions] = useState([]);
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedFeature = useMemo(
    () => features.find((f) => f.id === selectedFeatureId) || null,
    [features, selectedFeatureId]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) reloadFeatures();
  }, [session]);

  useEffect(() => {
    if (selectedFeatureId) {
      reloadFeatureData();
    } else {
      setCases([]);
      setRubric(defaultRubric());
      setRuns([]);
      setGrades([]);
      setChangeLogs([]);
      setPromptVersions([]);
      setAssertions([]);
      setTraces([]);
    }
  }, [selectedFeatureId]);

  async function reloadFeatures() {
    setLoading(true);
    const { data, error } = await fetchFeatures();
    setLoading(false);

    if (error) return alert(error.message);

    setFeatures(data || []);
    if (!selectedFeatureId && data?.length) {
      setSelectedFeatureId(data[0].id);
    }
  }

  async function reloadFeatureData() {
    if (!selectedFeatureId) return;

    const [caseResult, rubricResult, runResult, changeResult, promptVersionResult, assertionResult, traceResult] = await Promise.all([
      fetchCases(selectedFeatureId),
      fetchRubric(selectedFeatureId),
      fetchRuns(selectedFeatureId),
      fetchChangeLogs(selectedFeatureId),
      fetchPromptVersions(selectedFeatureId),
      fetchAssertions(selectedFeatureId),
      fetchProductionTraces(selectedFeatureId),
    ]);

    if (caseResult.error) return alert(caseResult.error.message);
    if (rubricResult.error) return alert(rubricResult.error.message);
    if (runResult.error) return alert(runResult.error.message);
    if (changeResult.error) return alert(changeResult.error.message);
    if (promptVersionResult.error) return alert(promptVersionResult.error.message);
    if (assertionResult.error) return alert(assertionResult.error.message);
    if (traceResult.error) return alert(traceResult.error.message);

    setCases(caseResult.data || []);
    setRubric(rubricResult.data?.rubric_text || defaultRubric());
    setRuns(runResult.data || []);
    setChangeLogs(changeResult.data || []);
    setPromptVersions(promptVersionResult.data || []);
    setAssertions(assertionResult.data || []);
    setTraces(traceResult.data || []);

    const runIds = (runResult.data || []).map((r) => r.id);
    const gradeResult = await fetchGrades(runIds);
    if (gradeResult.error) return alert(gradeResult.error.message);
    setGrades(gradeResult.data || []);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (!session) return <AuthView />;

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <div className="badge">Eval Co-pilot</div>
          <h1>Make AI quality observable.</h1>
          <p>
            Golden cases, rubrics, eval runs, failure evidence, and re-run proof for Track B.
          </p>
        </div>
        <div className="header-actions">
          <span>{session.user?.email}</span>
          <button className="secondary" onClick={signOut}>Sign out</button>
        </div>
      </header>

      {loading && <div className="notice">Loading...</div>}

      <div className="two-col">
        <FeatureManager
          features={features}
          selectedFeatureId={selectedFeatureId}
          setSelectedFeatureId={setSelectedFeatureId}
          reload={reloadFeatures}
        />

        <CaseManager
          selectedFeatureId={selectedFeatureId}
          cases={cases}
          reload={reloadFeatureData}
        />
      </div>

      <RubricEditor
        selectedFeatureId={selectedFeatureId}
        rubric={rubric}
        setRubric={setRubric}
      />

      <PromptVersionPanel selectedFeatureId={selectedFeatureId} promptVersions={promptVersions} reload={reloadFeatureData} />

      <AssertionPanel selectedFeatureId={selectedFeatureId} assertions={assertions} reload={reloadFeatureData} />

      <TraceToRegressionPanel selectedFeatureId={selectedFeatureId} traces={traces} reload={reloadFeatureData} />

      <EvalRunner
        selectedFeature={selectedFeature}
        cases={cases}
        rubric={rubric}
        assertions={assertions}
        onRunSaved={reloadFeatureData}
      />

      <ReleaseGatePanel runs={runs} grades={grades} assertions={assertions} changeLogs={changeLogs} />

      <ResultsPanel runs={runs} grades={grades} />

      <ChangeLogPanel
        selectedFeatureId={selectedFeatureId}
        runs={runs}
        changeLogs={changeLogs}
        reload={reloadFeatureData}
      />

      <section className="card">
        <div className="section-title">
          <h2>Move 4 RLS proof</h2>
          <span>Two-user isolation test</span>
        </div>
        <p>
          Login as User A and create data. Then login as User B. User B should see an empty dashboard or only their own data.
          Screenshot both states for the submission.
        </p>
      </section>
    </main>
  );
}
