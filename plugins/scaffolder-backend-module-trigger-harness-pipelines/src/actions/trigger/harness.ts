/*
 * Copyright 2021 The Backstage Authors
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

import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import fetch from 'node-fetch';

/**
 * Creates an `acme:example` Scaffolder action.
 *
 * @remarks
 *
 * See {@link https://example.com} for more information.
 *
 * @public
 */
export function createHarnessTriggerAction() {
  // For more information on how to define custom actions, see
  //   https://backstage.io/docs/features/software-templates/writing-custom-actions
  return createTemplateAction<{
    url: string;
    inputset: any;
    apikey?: string;
  }>({
    id: 'trigger:harness-custom-pipeline',
    description: 'Triggers Harness Pipelines with required input set',
    schema: {
      input: {
        type: 'object',
        required: ['inputset', 'url'],
        properties: {
          url: {
            title: 'Pipeline URL',
            description: 'URL of the pipeline you want to execute',
            type: 'string',
          },
          inputset: {
            title: 'Pipeline Inputset',
            description: 'Required input set for the pipeline to execute',
            type: 'object',
          },
          apikey: {
            title: 'Harness x-api-key',
            description: 'Harness Token to Authenticate Pipeline Execution',
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      ctx.logger.info(
        `Running Harness Pipeline with inputset: ${ctx.input.inputset}`,
      );
      const urlParts = ctx.input.url.split('/');
      const query = new URLSearchParams({
        accountIdentifier: `${urlParts[urlParts.indexOf('account') + 1]}`,
        routingId: `${urlParts[urlParts.indexOf('account') + 1]}`,
        orgIdentifier: `${urlParts[urlParts.indexOf('orgs') + 1]}`,
        projectIdentifier: `${urlParts[urlParts.indexOf('projects') + 1]}`,
      });
      const pipelineIdentifier = urlParts[urlParts.indexOf('pipelines') + 1];

      const HARNESS_API_KEY = ctx.input.apikey ?? process.env.HARNESS_API_KEY;
      const yaml = require('js-yaml');
      type Pipeline = {
        identifier: string;
        variables: {
          name: string;
          type: string;
          value: any;
        }[];
      };

      function generateYaml(inputset: any) {
        const pipeline: Pipeline = {
          identifier: 'pipelineIdentifier',
          variables: [],
        };

        // Iterate over each variable in the inputset and generate a variable object
        for (const variableName in inputset) {
          if (inputset.hasOwnProperty(variableName)) {
            const variableValue = inputset[variableName];
            const variableObject = {
              name: variableName,
              type: 'String',
              value: variableValue,
            };
            pipeline.variables.push(variableObject);
          }
        }
        const yamlString = yaml.dump({ pipeline });
        return yamlString;
      }
      const harnessInputset = generateYaml(ctx.input.inputset);

      const response = await fetch(
        `https://app.harness.io/gateway/pipeline/api/pipeline/execute/${pipelineIdentifier}?${query}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/yaml',
            'x-api-key': `${HARNESS_API_KEY}`,
          },
          body: `${harnessInputset}`,
        },
      );
      const data = await response.json();
      ctx.logger.info(response.status);
      const pipeurl = `https://app.harness.io/ng/account/${
        urlParts[urlParts.indexOf('account') + 1]
      }/home/orgs/${urlParts[urlParts.indexOf('orgs') + 1]}/projects/${
        urlParts[urlParts.indexOf('projects') + 1]
      }/pipelines/${pipelineIdentifier}/executions/${
        data?.data?.planExecution?.uuid
      }/pipeline`;
      ctx.output('PipelineUrl', pipeurl);
    },
  });
}
