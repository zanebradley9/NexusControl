const rules = {
  blockedPatterns: [
    "<script>",
    "</script>",
    "DROP TABLE",
    "SELECT * FROM",
    "UNION SELECT",
    "INSERT INTO",
    "DELETE FROM",
    "UPDATE ",
    "../",
    "..\\",
    "/etc/passwd",
    "cmd.exe",
    "powershell",
    "eval(",
    "document.cookie",
    "javascript:",
    "onerror=",
    "onload=",
    "alert(",
    "wget ",
    "curl ",
    "chmod ",
    "rm -rf",
    "base64,"
  ],

  blockedUserAgents: [
    "sqlmap",
    "nikto",
    "nmap",
    "curl",
    "wget",
    "python-requests",
    "postmanruntime"
  ],

  protectedRoutes: [
    "/api/admin",
    "/api/auth",
    "/api/billing",
    "/api/agents",
    "/api/users",
    "/api/security"
  ],

  maxBodySize: 5 * 1024 * 1024,

  suspiciousExtensions: [
    ".php",
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".ps1"
  ]
};

export default rules;