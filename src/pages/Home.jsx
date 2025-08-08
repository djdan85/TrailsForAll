import React from "react";

export default function Home() {
  const trails = [
    {
      name: "Plzeň - Bolevec A",
      length: 3.2,
      difficulty: "Easy",
      reviews: ["Pěkná projížďka pro začátečníky."],
    },
    {
      name: "Plzeň - Bolevec B",
      length: 4.7,
      difficulty: "Intermediate",
      reviews: ["Trochu náročnější, ale zábava!"],
    },
    {
      name: "Klínovec Trail",
      length: 9.5,
      difficulty: "Hard",
      reviews: ["Výborný sjezd a výhledy."],
    },
    {
      name: "Špičák Trail",
      length: 6.8,
      difficulty: "Intermediate",
      reviews: ["Technicky zajímavé úseky."],
    },
    {
      name: "Amber Trail",
      length: 5.0,
      difficulty: "Easy",
      reviews: ["Skvělé na rodinnou vyjížďku."],
    },
  ];

  return (
    <div>
      <h2>Trail Map & List</h2>
      <ul>
        {trails.map((trail, index) => (
          <li key={index}>
            <strong>{trail.name}</strong> – {trail.length} km, {trail.difficulty}
            <ul>
              {trail.reviews.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
