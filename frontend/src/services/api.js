import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function gradeCases({ featureName, featureDescription, rubric, cases }) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  if (!token) {
    throw new Error('You must be logged in before running an eval.');
  }

  const response = await fetch(`${API_BASE_URL}/api/grade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      feature_name: featureName,
      feature_description: featureDescription,
      rubric,
      cases,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API error: ${response.status}`);
  }

  return response.json();
}
