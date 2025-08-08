import React from "react";

export default function AddTrail() {
  return (
    <div>
      <h2>Přidat nový trail</h2>
      <form>
        <label>Název traily: <input type="text" /></label><br />
        <label>Délka v km: <input type="number" /></label><br />
        <label>Náročnost: 
          <select>
            <option>Easy</option>
            <option>Intermediate</option>
            <option>Hard</option>
          </select>
        </label><br />
        <label>GPX soubor: <input type="file" /></label><br />
        <button type="submit">Odeslat</button>
      </form>
    </div>
  );
}
