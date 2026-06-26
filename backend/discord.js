export async function fetchRoles(TOKEN, GUILD_ID) {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/roles`,
    {
      method: "GET",
      headers: {
        Authorization: `Bot ${TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord API Error: ${res.status} ${text}`);
  }

  const roles = await res.json();

  return roles.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    position: r.position, // ⭐ useful for sorting
    permissions: r.permissions,
    hoist: r.hoist,
  }));
}