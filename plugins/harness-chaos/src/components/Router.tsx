import React from 'react';
import { Routes, Route } from 'react-router';
import { Entity } from '@backstage/catalog-model';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import ChaosExperiments from './ChaosExperiments';
import { isV1Compatible, isV2Compatible } from '../utils/getCompatibleVersion';

/** @public */
export const isHarnessChaosAvailable = (entity: Entity | undefined) => {
  if (!entity) return false;
  return isV1Compatible(entity) || isV2Compatible(entity);
};
/** @public */

export const Router = () => {
  const { entity } = useEntity();
  if (!isHarnessChaosAvailable(entity)) {
    return (
      <>
        <MissingAnnotationEmptyState
          annotation={[
            'harness.io/project-url',
            'harness.io/service-tags',
            'harness.io/network-map-tags',
          ]}
        />
      </>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<ChaosExperiments />} />
    </Routes>
  );
};
