import React from 'react';
import { useTranslation } from 'react-i18next';
import TrailList from './components/TrailList';
import Map from './components/Map';
import './App.css';

function App() {
  const { t } = useTranslation();

  const mockTrails = [
    { id: '1', name: 'Šumava Trail', difficulty: 'Střední', length: 25, coords: [49.1122, 13.4767] },
    { id: '2', name: 'Krkonoše Loop', difficulty: 'Těžká', length: 40, coords: [50.7356, 15.7397] },
    { id: '3', name: 'Tatranská okružná', difficulty: 'Lehká', length: 15, coords: [49.1386, 20.2191] },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">{t('home.title')}</h1>
      <Map trails={mockTrails} />
      <TrailList trails={mockTrails} />
    </div>
  );
}

export default App;