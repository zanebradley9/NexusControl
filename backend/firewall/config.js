const config = {
  BLOCKED_PATTERNS: [
    "<script>",
    "</script>",
    "drop table",
    "select * from",
    "union select",
    "insert into",
    "delete from",
    "update ",
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

  BLOCKED_USER_AGENTS: [
    "sqlmap",
    "nikto",
    "nmap",
    "curl",
    "wget",
    "python-requests",
    "postmanruntime"
  ],

  PROTECTED_ROUTES: [
    "/api/admin",
    "/api/auth",
    "/api/billing",
    "/api/agents",
    "/api/users",
    "/api/security"
  ],

  MAX_BODY_SIZE: 5 * 1024 * 1024,

  SUSPICIOUS_EXTENSIONS: [
    ".php",
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".ps1"
  ]
};

export default config;