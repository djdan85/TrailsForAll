import React from 'react';
import { useTranslation } from 'react-i18next';

function TrailList({ trails }) {
  const { t } = useTranslation();

  return (
    <div className="trail-list">
      {trails.map((trail) => (
        <div key={trail.id} className="trail-item">
          <h2 className="trail-name">{trail.name}</h2>
          <p>{t('trail.difficulty')}: {trail.difficulty}</p>
          <p>{t('trail.length')}: {trail.length} km</p>
        </div>
      ))}
    </div>
  );
}

export default TrailList;