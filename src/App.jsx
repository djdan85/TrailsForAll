import React from "react";
import TrailForm from "./pages/TrailForm";
import Contact from "./pages/Contact";
import CodeOfConduct from "./pages/CodeOfConduct";
import GDPR from "./pages/GDPR";

export default function App() {
  return (
    <div>
      <h1>TrailsForAll</h1>
      <p>Welcome to the community app for bikers! Add trails, GPX, reviews and more.</p>
      <TrailForm />
      <CodeOfConduct />
      <GDPR />
      <Contact />
    </div>
  );
}
