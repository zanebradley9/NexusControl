import React from "react";

const guns = [
{ id: 1, name: "Pistol", price: 200, damage: 10 },
{ id: 2, name: "Shotgun", price: 500, damage: 25 },
{ id: 3, name: "Sniper Rifle", price: 1000, damage: 75 },
{ id: 4, name: "Assault Rifle", price: 750, damage: 20 },
{ id: 5, name: "Rocket Launcher", price: 1500, damage: 100 },
{ id: 6, name: "SMG", price: 300, damage: 15 },
{ id: 7, name: "Crossbow", price: 400, damage: 18 },
{ id: 8, name: "Flamethrower", price: 1200, damage: 35 },
{ id: 9, name: "Laser Gun", price: 2000, damage: 50 },
{ id: 10, name: "Grenade Launcher", price: 800, damage: 60 },
{ id: 11, name: "Minigun", price: 2500, damage: 40 },
{ id: 12, name: "Plasma Rifle", price: 1800, damage: 55 },
{ id: 13, name: "Railgun", price: 2200, damage: 80 },
{ id: 14, name: "Bow", price: 150, damage: 8 },
];

export default function StoreGun() {
const buyGun = (gun) => {
alert(`Purchased ${gun.name}`);
};

return ( <div className="p-6"> <h1 className="text-2xl font-bold mb-4">Gun Store</h1>

  {guns.map((gun) => (
    <div
      key={gun.id}
      className="border p-4 rounded mb-3"
    >
      <h2 className="text-lg font-semibold">
        {gun.name}
      </h2>

      <p>Damage: {gun.damage}</p>
      <p>Price: {gun.price} Coins</p>

      <button
        className="mt-3 px-3 py-2 bg-red-600 text-white rounded"
        onClick={() => buyGun(gun)}
      >
        Buy
      </button>
    </div>
  ))}
</div>

);
}
