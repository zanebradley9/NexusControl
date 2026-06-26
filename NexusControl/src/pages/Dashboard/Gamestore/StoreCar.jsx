import React from "react";

const cars = [
{ id: 1, name: "Sports Car", price: 5000, speed: 220 },
{ id: 2, name: "SUV", price: 3000, speed: 160 },
{ id: 3, name: "Motorcycle", price: 1500, speed: 180 },
{ id: 4, name: "Truck", price: 4000, speed: 140 },
{ id: 5, name: "Convertible", price: 6000, speed: 210 },
{ id: 6, name: "Van", price: 3500, speed: 150 },
{ id: 7, name: "Electric Car", price: 4500, speed: 200 },
{ id: 8, name: "Classic Car", price: 7000, speed: 170 },
{ id: 9, name: "Off-Road Vehicle", price: 5500, speed: 160 },
{ id: 10, name: "Limousine", price: 8000, speed: 180 },
{ id: 11, name: "Pickup Truck", price: 4000, speed: 150 },
{ id: 12, name: "Crossover", price: 3500, speed: 165 },
{ id: 13, name: "Hatchback", price: 2000, speed: 155 },
{ id: 14, name: "Coupe", price: 4500, speed: 210 },
{ id: 15, name: "Minivan", price: 3000, speed: 145 },
{ id: 16, name: "Roadster", price: 5500, speed: 230 },
{ id: 17, name: "Station Wagon", price: 2500, speed: 150 },
{ id: 18, name: "Microcar", price: 1000, speed: 90 },
{ id: 19, name: "Electric Scooter", price: 500, speed: 60 },
{ id: 20, name: "Bicycle", price: 200, speed: 25 },
];

export default function StoreCar() {
const buyCar = (car) => {
alert(`Purchased ${car.name}`);
};

return ( <div className="p-6"> <h1 className="text-2xl font-bold mb-4">Car Store</h1>

  {cars.map((car) => (
    <div
      key={car.id}
      className="border p-4 rounded mb-3"
    >
      <h2 className="text-lg font-semibold">
        {car.name}
      </h2>

      <p>Speed: {car.speed} MPH</p>
      <p>Price: {car.price} Coins</p>

      <button
        className="mt-3 px-3 py-2 bg-blue-600 text-white rounded"
        onClick={() => buyCar(car)}
      >
        Buy Car
      </button>
    </div>
  ))}
</div>

);
}
