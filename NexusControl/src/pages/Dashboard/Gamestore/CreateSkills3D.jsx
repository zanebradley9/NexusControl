import React, { useState } from "react";

export default function CreateSkills3D() {
const [skillName, setSkillName] = useState("");
const [effect, setEffect] = useState("");

const handleCreate = () => {
if (!skillName) return;

alert(`Created skill: ${skillName} (${effect})`);
setSkillName("");
setEffect("");

};

return ( <div className="p-6"> <h1 className="text-2xl font-bold mb-4">Create 3D Skill</h1>

  <input
    className="border p-2 rounded w-full mb-3"
    placeholder="Skill Name"
    value={skillName}
    onChange={(e) => setSkillName(e.target.value)}
  />

  <input
    className="border p-2 rounded w-full mb-3"
    placeholder="Effect (Fire, Ice, Speed)"
    value={effect}
    onChange={(e) => setEffect(e.target.value)}
  />

  <button
    className="px-4 py-2 bg-blue-500 text-white rounded"
    onClick={handleCreate}
  >
    Create Skill
  </button>
</div>
);
}
