export function buildTicketName(name) {
  return `partner-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
}