export async function sendPartnershipApplication(data) {
  const res = await fetch(
    "https://your-backend-url.up.railway.app/api/partnership",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to submit application");
  }

  return res.json();
}