#!/usr/bin/env sh

echo "🚀 Running Quality Gates (pre-push)..."

# Gate 1: Security Audit
echo "🛡️ Checking for security vulnerabilities..."
# Usamos --audit-level=high para fallar solo en vulnerabilidades Altas o Críticas.
npm audit --audit-level=high || {
  echo "❌ Security audit failed! High or Critical vulnerabilities found."
  exit 1
}

echo "✅ All pre-push gates passed!"
