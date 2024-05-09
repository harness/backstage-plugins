import React from 'react';
import { Routes, Route } from 'react-router';
import { Entity } from '@backstage/catalog-model';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { isV1Compatible, isV2Compatible } from '../utils/getCompatibleVersion';
import ChaosExperimentsV1 from './ChaosExperimentsV1';
import ChaosExperimentsV2 from './ChaosExperimentsV2';

/** @public */
export const isHarnessChaosAvailable = (entity: Entity | undefined) => {
  if (!entity) return true;
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

  if (isV2Compatible(entity))
    return (
      <Routes>
        <Route path="/" element={<ChaosExperimentsV2 />} />
      </Routes>
    );

  return (
    <Routes>
      <Route path="/" element={<ChaosExperimentsV1 />} />
    </Routes>
  );
};
