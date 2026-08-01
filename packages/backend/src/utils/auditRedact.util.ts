// Claves que jamas deben guardarse en el log de auditoria, sin importar en que modelo aparezcan.
const SENSITIVE_KEYS = new Set([
    'password', 'twoFactorSecret', 'twoFactorBackupCodes', 'token', 'accessToken', 'preAuthToken'
])

// Recorre un objeto/array recursivamente y elimina las claves sensibles antes de guardarlo
// en el campo "changes" (Json) del AuditLog. Pasa por JSON.stringify/parse para dejar el
// resultado serializable (por ejemplo, convierte instancias de Date a string ISO).
export function redact(value: unknown): unknown {
    if (value === null || value === undefined) return null

    const plain = JSON.parse(JSON.stringify(value))
    return stripSensitive(plain)
}

function stripSensitive(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(stripSensitive)
    }

    if (value !== null && typeof value === 'object') {
        const result: Record<string, unknown> = {}
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            if (SENSITIVE_KEYS.has(key)) continue
            result[key] = stripSensitive(val)
        }
        return result
    }

    return value
}
