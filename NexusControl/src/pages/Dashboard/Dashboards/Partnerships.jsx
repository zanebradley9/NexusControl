import { useState } from "react";
import { sendPartnershipApplication } from "@/lib/partnership";

export default function Partnerships() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    discord: "",
    server: "",
    members: "",
    reason: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await sendPartnershipApplication(form);

    alert("Application sent!");
  };

  return (
    <div className="p-4">
      <h1>Partnership Application</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          name="discord"
          placeholder="Discord Username"
          onChange={handleChange}
        />

        <input
          name="server"
          placeholder="Server Name"
          onChange={handleChange}
        />

        <input
          name="members"
          placeholder="Member Count"
          onChange={handleChange}
        />

        <textarea
          name="reason"
          placeholder="Reason for partnership"
          onChange={handleChange}
        />

        <textarea
          name="message"
          placeholder="Message"
          onChange={handleChange}
        />

        <button type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}