/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { Routes, Route } from 'react-router';
//import { harnessCIBuildRouteRef } from '../route-refs';
import MyComponent from './MyComponent/MyComponent';
import { Entity } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
/** @public */
export const isHarnessCiCdAvailable = (entity: Entity) =>
Boolean(entity.metadata.annotations?.["harness.io/cicd-accountId"]);
export const isHarnessCIOrgAvailable = (entity: Entity) =>
Boolean(entity.metadata.annotations?.["harness.io/cicd-orgId"]);
export const isHarnessCIProjectAvailable = (entity: Entity) =>
Boolean(entity.metadata.annotations?.["harness.io/cicd-projectId"]);
/** @public */
export const Router = () => {
const { entity } = useEntity();
function MissingAnnotationAccount(){
    if (!isHarnessCiCdAvailable(entity)) {
    return (<><MissingAnnotationEmptyState annotation={"harness.io/cicd-accountId"} /></>);
    }
    else return(<></>)
}
function MissingAnnotationOrg(){
    if (!isHarnessCIOrgAvailable(entity)) {
    return (<><MissingAnnotationEmptyState annotation={"harness.io/cicd-orgId"} /></>);
    }
    else return(<></>)
}
function MissingAnnotationProject(){
    if (!isHarnessCIProjectAvailable(entity)) {
    return (<><MissingAnnotationEmptyState annotation={"harness.io/cicd-projectId"} /></>);
    }
    else return(<></>)
}
if(!(isHarnessCiCdAvailable(entity)&&isHarnessCIOrgAvailable(entity)&&isHarnessCIProjectAvailable(entity)))
{
    return(<><MissingAnnotationAccount/><MissingAnnotationOrg/><MissingAnnotationProject/></>)
}
return (
<Routes>
    <Route path="/" element={<MyComponent />} />
</Routes>
);
};
