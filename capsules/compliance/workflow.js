export default {
  name: "compliance.pii_check",
  description: "Scans input for PII/Secrets before execution.",
  steps: [
    { 
      id: "scan",
      action: "scan_sensitive_data", 
      llm: "gemini", 
      // We inject a specific "System Instruction" via a modifier for the scan step
      modifiers: ["security-audit-scan"],
      context: "deep-work" 
    },
    { 
      id: "execute",
      action: "safe_execution", 
      llm: "claude", 
      modifiers: ["regulatory-compliant-tone"] 
    },
    { 
      id: "audit",
      action: "generate_report", 
      llm: "gemini",
      modifiers: ["summarize-log"]
    }
  ]
};