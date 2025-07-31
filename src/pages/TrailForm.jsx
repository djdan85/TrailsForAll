import React, { useState } from "react";

export default function TrailForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gpxFile, setGpxFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Trail submitted (not yet functional): " + name);
    // TODO: Upload GPX, send to backend for review
  };

  return (
    <section>
      <h2>Add New Trail</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Trail Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Description:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>GPX File:</label>
          <input type="file" accept=".gpx" onChange={(e) => setGpxFile(e.target.files[0])} required />
        </div>
        <button type="submit">Submit for Approval</button>
      </form>
    </section>
  );
}
