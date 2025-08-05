import React, { useState } from "react";

export default function AddTrail() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Trail submitted: " + name);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Trail</h2>
      <label>Trail Name:</label>
      <input value={name} onChange={(e) => setName(e.target.value)} required />
      <label>Upload GPX:</label>
      <input type="file" accept=".gpx" onChange={(e) => setFile(e.target.files[0])} required />
      <button type="submit">Submit</button>
    </form>
  );
}
