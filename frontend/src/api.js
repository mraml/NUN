export async function runModel(payload) {
  const response = await fetch('/api/llm/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}
