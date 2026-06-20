import { supabase } from '../lib/supabaseClient';

export async function fetchFeatures() {
  return supabase.from('features').select('*').order('created_at', { ascending: false });
}

export async function createFeature({ name, description }) {
  return supabase.from('features').insert({ name, description }).select().single();
}

export async function deleteFeature(id) {
  return supabase.from('features').delete().eq('id', id);
}

export async function fetchCases(featureId) {
  return supabase
    .from('golden_cases')
    .select('*')
    .eq('feature_id', featureId)
    .order('created_at', { ascending: true });
}

export async function createCase({ featureId, title, input, expectedOutput, notes }) {
  return supabase.from('golden_cases').insert({
    feature_id: featureId,
    title,
    input,
    expected_output: expectedOutput,
    notes,
  });
}

export async function deleteCase(id) {
  return supabase.from('golden_cases').delete().eq('id', id);
}

export async function fetchRubric(featureId) {
  return supabase.from('rubrics').select('*').eq('feature_id', featureId).maybeSingle();
}

export async function upsertRubric({ featureId, rubricText }) {
  return supabase.from('rubrics').upsert(
    { feature_id: featureId, rubric_text: rubricText, updated_at: new Date().toISOString() },
    { onConflict: 'feature_id' }
  );
}

export async function createRun({ featureId, label, modelProvider, modelName, notes }) {
  return supabase
    .from('eval_runs')
    .insert({
      feature_id: featureId,
      label,
      model_provider: modelProvider,
      model_name: modelName,
      notes,
    })
    .select()
    .single();
}

export async function createGrades(rows) {
  return supabase.from('case_grades').insert(rows);
}

export async function fetchRuns(featureId) {
  return supabase
    .from('eval_runs')
    .select('*')
    .eq('feature_id', featureId)
    .order('created_at', { ascending: false });
}

export async function fetchGrades(runIds) {
  if (!runIds.length) return { data: [], error: null };
  return supabase
    .from('case_grades')
    .select('*, golden_cases(title, input, expected_output)')
    .in('run_id', runIds)
    .order('created_at', { ascending: false });
}

export async function createChangeLog({ featureId, beforeRunId, afterRunId, changeType, changeDescription, evidenceNote }) {
  return supabase.from('change_logs').insert({
    feature_id: featureId,
    before_run_id: beforeRunId || null,
    after_run_id: afterRunId || null,
    change_type: changeType,
    change_description: changeDescription,
    evidence_note: evidenceNote,
  });
}

export async function fetchChangeLogs(featureId) {
  return supabase
    .from('change_logs')
    .select('*')
    .eq('feature_id', featureId)
    .order('created_at', { ascending: false });
}

export async function fetchPromptVersions(featureId) {
  return supabase.from('prompt_versions').select('*').eq('feature_id', featureId).order('created_at', { ascending: false });
}
export async function createPromptVersion({ featureId, label, modelName, promptText, retrievalConfig, notes }) {
  return supabase.from('prompt_versions').insert({ feature_id: featureId, label, model_name: modelName, prompt_text: promptText, retrieval_config: retrievalConfig, notes });
}
export async function deletePromptVersion(id) {
  return supabase.from('prompt_versions').delete().eq('id', id);
}
export async function fetchAssertions(featureId) {
  return supabase.from('assertions').select('*').eq('feature_id', featureId).order('created_at', { ascending: false });
}
export async function createAssertion({ featureId, name, assertionType, value, severity }) {
  return supabase.from('assertions').insert({ feature_id: featureId, name, assertion_type: assertionType, value, severity });
}
export async function deleteAssertion(id) {
  return supabase.from('assertions').delete().eq('id', id);
}
export async function fetchProductionTraces(featureId) {
  return supabase.from('production_traces').select('*').eq('feature_id', featureId).order('created_at', { ascending: false });
}
export async function createProductionTrace({ featureId, title, input, badOutput, whyWrong, expectedBehavior }) {
  return supabase.from('production_traces').insert({ feature_id: featureId, title, input, bad_output: badOutput, why_wrong: whyWrong, expected_behavior: expectedBehavior });
}
export async function markTraceConverted({ traceId, caseId }) {
  return supabase.from('production_traces').update({ converted_to_case_id: caseId }).eq('id', traceId);
}
