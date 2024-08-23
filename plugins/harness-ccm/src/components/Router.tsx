import React from 'react';
import { Routes, Route } from 'react-router';

import PerspectivesPage from './PerspectivesPage';
import { Entity } from '@backstage/catalog-model';

/** @public */
export const isHarnessCcmAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.['harness.io/perspective-url']);

/** @public */
export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<PerspectivesPage />} />
    </Routes>
  );
};
