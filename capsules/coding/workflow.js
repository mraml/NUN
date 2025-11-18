export default {
  name: "coding.fix",
  steps: [
    { action: "analyze", llm: "claude", modifiers: ["metacognitive"] },
    { action: "propose-fix", llm: "gemini", modifiers: ["test-first"] },
    { action: "review", llm: "claude" }
  ]
};
