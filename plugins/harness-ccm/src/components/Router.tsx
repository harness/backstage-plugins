import React from 'react';
import { Routes, Route } from 'react-router';
import { Entity } from '@backstage/catalog-model';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';

import PerspectivesPage from './PerspectivesPage';

/** @public */
export const isHarnessCcmAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.['harness.io/perspective-url']);

/** @public */
export const Router = () => {
  const { entity } = useEntity();

  if (!isHarnessCcmAvailable(entity)) {
    return (
      <>
        <MissingAnnotationEmptyState annotation="harness.io/perspective-url" />
      </>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<PerspectivesPage />} />
    </Routes>
  );
};
