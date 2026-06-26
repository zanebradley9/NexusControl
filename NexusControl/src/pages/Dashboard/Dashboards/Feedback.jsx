import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
export default function Feedback() {
const [formData, setFormData] = useState({
name: '',
feedback: ''
});
const handleSubmit = (e) => {
e.preventDefault();
console.log('Feedback Submitted:', formData);
alert('Thank you for your feedback!');
setFormData({
name: '',
feedback: ''
});
};
return (
<div className="min-h-screen bg-black text-white p-6">
<div className="max-w-2xl mx-auto bg-zinc-900 rounded-2xl p-8 border
border-zinc-800">
3
<div className="flex items-center gap-3 mb-6">
<MessageSquare className="w-8 h-8 text-cyan-400" />
<h1 className="text-3xl font-bold">Feedback</h1>
</div>
<form onSubmit={handleSubmit} className="space-y-5">
<input
type="text"
placeholder="Your Name"
value={formData.name}
onChange={(e) =>
setFormData({ ...formData, name: e.target.value })
}
className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3
outline-none"
/>
<textarea
placeholder="Write your feedback..."
rows="6"
value={formData.feedback}
onChange={(e) =>
setFormData({ ...formData, feedback: e.target.value })
}
className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3
outline-none"
/>
<button
type="submit"
className="bg-cyan-400 hover:bg-cyan-300 text-black px-6 py-3
rounded-xl font-semibold"
>
Submit Feedback
</button>
</form>
</div>
</div>
);
}
