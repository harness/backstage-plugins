import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import fetch from 'node-fetch';
import * as yaml from 'js-yaml';

type PollStatus =
  | 'Queued'
  | 'Running'
  | 'AsyncWaiting'
  | 'TaskWaiting'
  | 'TimedWaiting'
  | 'ResourceWaiting'
  | 'InterventionWaiting'
  | 'ApprovalWaiting'
  | 'InputWaiting'
  | 'WaitStepRunning'
  | 'Success'
  | 'IgnoreFailed'
  | 'Failed'
  | 'Errored'
  | 'Aborted'
  | 'Expired'
  | 'Suspended';

const RUNNING_STATES: PollStatus[] = [
  'Queued',
  'Running',
  'AsyncWaiting',
  'TaskWaiting',
  'TimedWaiting',
  'ResourceWaiting',
  'InterventionWaiting',
  'ApprovalWaiting',
  'InputWaiting',
  'WaitStepRunning',
];

const SUCCESS_STATES: PollStatus[] = ['Success', 'IgnoreFailed'];
const FAILED_STATES: PollStatus[] = [
  'Failed',
  'Errored',
  'Aborted',
  'Expired',
  'Suspended',
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function buildYamlInputset(inputset: Record<string, unknown>) {
  const pipeline = {
    identifier: 'pipelineIdentifier',
    variables: Object.entries(inputset).map(([name, value]) => ({
      name,
      type: 'String',
      value: typeof value === 'object' ? JSON.stringify(value) : `${value}`,
    })),
  };

  return yaml.dump({ pipeline });
}

function resolveHarnessToken(
  apikey: string | undefined,
  secrets: Record<string, string | undefined> | undefined,
): string | undefined {
  return apikey && apikey === 'user.token'
    ? (secrets || {}).harnessToken
    : apikey;
}

async function pollExecutionStatus(options: {
  pollingUrl: string;
  token: string;
  ctx: any;
  pollIntervalMs: number;
}) {
  const { pollingUrl, token, ctx, pollIntervalMs } = options;

  let lastStatus = '';
  while (true) {
    await sleep(pollIntervalMs);

    const response = await fetch(pollingUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/yaml',
        authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    const status = data?.data?.pipelineExecutionSummary?.status as PollStatus;

    if (!status) {
      throw new Error(
        `Could not read pipeline execution status: ${data?.message ?? 'unknown error'}`,
      );
    }

    if (status !== lastStatus) {
      ctx.logger.info(`Pipeline status: ${status}`);
      lastStatus = status;
    }

    if (SUCCESS_STATES.includes(status)) return;
    if (FAILED_STATES.includes(status)) {
      throw new Error(`Pipeline execution ${status}`);
    }
    if (!RUNNING_STATES.includes(status)) {
      throw new Error(`Unexpected pipeline status: ${status}`);
    }
  }
}

export async function createHarnessTriggerSimpleAction() {
  return createTemplateAction<{
    url: string;
    inputset: Record<string, unknown>;
    apikey?: string;
    pollIntervalMs?: number;
  }>({
    id: 'trigger:harness-custom-pipeline-simple',
    description:
      'Simple Harness trigger action: trigger pipeline and poll status',
    schema: {
      input: {
        type: 'object',
        required: ['url', 'inputset'],
        properties: {
          url: {
            title: 'Pipeline URL',
            type: 'string',
            description: 'Harness pipeline URL',
          },
          inputset: {
            title: 'Pipeline inputset',
            type: 'object',
            description: 'Key/value runtime variables for pipeline execution',
          },
          apikey: {
            title: 'Harness API Key',
            type: 'string',
            description: 'Override HARNESS_API_KEY for this execution',
          },
          pollIntervalMs: {
            title: 'Polling interval (ms)',
            type: 'number',
            description: 'Status polling interval; defaults to 5000',
          },
        },
      },
    },
    async handler(ctx) {
      const inputUrl = new URL(ctx.input.url);
      const urlParts = ctx.input.url.split('/');
      const accountIdentifier = urlParts[urlParts.indexOf('account') + 1];
      const orgIdentifier = urlParts[urlParts.indexOf('orgs') + 1];
      const projectIdentifier = urlParts[urlParts.indexOf('projects') + 1];
      const pipelineIdentifier = urlParts[urlParts.indexOf('pipelines') + 1];
      const branch = inputUrl.searchParams.get('branch');
      const repoIdentifier = inputUrl.searchParams.get('repoName');

      const token =
        resolveHarnessToken(ctx.input.apikey, ctx.secrets) ??
        process.env.HARNESS_API_KEY;
      if (!token) {
        throw new Error(
          'Missing Harness API key. Pass input.apikey or HARNESS_API_KEY.',
        );
      }

      const executeQuery = new URLSearchParams({
        accountIdentifier,
        routingId: accountIdentifier,
        orgIdentifier,
        projectIdentifier,
      });
      if (branch) executeQuery.set('branch', branch);
      if (repoIdentifier) executeQuery.set('repoIdentifier', repoIdentifier);

      const executeResponse = await fetch(
        `${inputUrl.origin}/gateway/pipeline/api/pipeline/execute/${pipelineIdentifier}?${executeQuery}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/yaml',
            authorization: `Bearer ${token}`,
          },
          body: buildYamlInputset(ctx.input.inputset ?? {}),
        },
      );

      const executeData = await executeResponse.json();
      const executionId = executeData?.data?.planExecution?.uuid;
      if (!executionId) {
        throw new Error(
          `Pipeline trigger failed: ${executeData?.message ?? 'unknown error'}`,
        );
      }

      const pipelineUrl = `${inputUrl.origin}/ng/account/${accountIdentifier}/home/orgs/${orgIdentifier}/projects/${projectIdentifier}/pipelines/${pipelineIdentifier}/executions/${executionId}/pipeline`;
      const pollingUrl = `${inputUrl.origin}/gateway/pipeline/api/pipelines/execution/v2/${executionId}?routingId=${accountIdentifier}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&accountIdentifier=${accountIdentifier}`;

      ctx.output('PipelineUrl', pipelineUrl);
      ctx.logger.info(`Triggered pipeline. Logs: ${pipelineUrl}`);

      await pollExecutionStatus({
        pollingUrl,
        token,
        ctx,
        pollIntervalMs: ctx.input.pollIntervalMs ?? 5000,
      });

      ctx.logger.info('Pipeline completed successfully');
    },
  });
}
