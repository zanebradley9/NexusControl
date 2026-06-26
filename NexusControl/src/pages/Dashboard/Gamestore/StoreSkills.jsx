import React from "react";

const skills = [
{ id: 1, name: "Speed Boost", price: 100 },
{ id: 2, name: "Double Jump", price: 250 },
{ id: 3, name: "Shield", price: 500 },
];

export default function StoreSkills() {
const buySkill = (skill) => {
alert(`Purchased ${skill.name}`);
};

return ( <div className="p-6"> <h1 className="text-2xl font-bold mb-4">Skill Store</h1>

  {skills.map((skill) => (
    <div
      key={skill.id}
      className="border p-4 rounded mb-3 flex justify-between"
    >
      <div>
        <h2>{skill.name}</h2>
        <p>{skill.price} Coins</p>
      </div>

      <button
        className="px-3 py-2 bg-green-600 text-white rounded"
        onClick={() => buySkill(skill)}
      >
        Buy
      </button>
    </div>
  ))}
</div>

);
}
