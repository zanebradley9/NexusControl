import { useState } from "react";
import { sendMessage } from "../services/api";
export default function AIChat() {
const [message, setMessage] = useState("");
const [messages, setMessages] = useState([]);
async function handleSend() {
const response = await sendMessage(message);
setMessages((prev) => [
...prev,
{
role: "user",
text: message
},
{
role: "jarvis",
text: JSON.stringify(response.response)
}
]);
setMessage("");
}
return (
<div className="p-4">
<div className="space-y-2 mb-4">
{messages.map((msg, index) => (
<div key={index}>
<b>{msg.role}:</b> {msg.text}
</div>
))}
</div>
<input
value={message}
onChange={(e) => setMessage(e.target.value)}
className="border p-2"
/>
<button
onClick={handleSend}
className="bg-black text-white p-2 ml-2"
>
Send
</button>
</div>
);
}
