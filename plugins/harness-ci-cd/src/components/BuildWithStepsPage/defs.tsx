/* eslint-disable @typescript-eslint/no-use-before-define */
import { isEmpty, camelCase, defaultTo } from 'lodash-es';
import { CSSProperties, useContext, createContext } from 'react';
import { IconName as BIconName, IPopoverProps } from '@blueprintjs/core';
import type { StringsMap } from './stringTypes';
import type { FormikErrors, FormikProps } from 'formik';
import { HTMLAttributes } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import qs from 'qs';
import type { IStringifyOptions, IParseOptions } from 'qs';
import React from 'react';

export function getIconDataBasedOnType(nodeData?: ExecutionNode): {
  icon: IconName;
  iconSize: number;
  iconStyle?: { marginBottom: string };
} {
  if (nodeData) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    if (nodeData.stepType === StepType.Barrier) {
      return nodeData.status === 'Success'
        ? { icon: 'barrier-close', iconSize: 57 }
        : {
            icon: 'barrier-open',
            iconSize: 70,
            iconStyle: { marginBottom: '38px' },
          };
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    if (nodeData.stepType === StepType.ResourceConstraint) {
      return { icon: 'traffic-lights', iconSize: 40 };
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const icon =
      StepTypeIconsMap[nodeData?.stepType as NodeType] ||
      factory.getStepIcon(nodeData?.stepType || '');
    return {
      icon,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      iconSize: cloudFormationSteps.includes(nodeData.stepType as StepType)
        ? 32
        : 20,
    };
  }

  return {
    icon: 'cross',
    iconSize: 20,
  };
}

export const processExecutionData = (
  graph?: ExecutionGraph,
): Array<ExecutionPipelineNode<ExecutionNode>> => {
  const items: Array<ExecutionPipelineNode<ExecutionNode>> = [];

  /* istanbul ignore else */
  if (graph?.nodeAdjacencyListMap && graph?.rootNodeId) {
    const nodeAdjacencyListMap = graph.nodeAdjacencyListMap;
    const rootNode = graph.rootNodeId;
    // Ignore the graph when its fqn is pipeline, as this doesn't render pipeline graph
    if (graph?.nodeMap?.[rootNode].baseFqn === 'pipeline') {
      return items;
    }
    let nodeId = nodeAdjacencyListMap[rootNode].children?.[0];
    while (nodeId && nodeAdjacencyListMap[nodeId]) {
      const nodeData = graph?.nodeMap?.[nodeId];
      /* istanbul ignore else */
      if (nodeData) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const isRollback =
          nodeData.name?.endsWith(StepGroupRollbackIdentifier) ?? false;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (
          nodeData.stepType &&
          (TopLevelNodes.indexOf(nodeData.stepType as NodeType) > -1 ||
            isRollback)
        ) {
          // NOTE: exception if we have only lite task engine in Execution group
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          if (
            hasOnlyLiteEngineTask(nodeAdjacencyListMap[nodeId].children, graph)
          ) {
            const liteTaskEngineId =
              nodeAdjacencyListMap?.[nodeId]?.children?.[0] || '';
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            processLiteEngineTask(
              graph?.nodeMap?.[liteTaskEngineId],
              items,
              nodeData,
            );
          } else if (!isEmpty(nodeAdjacencyListMap[nodeId].children)) {
            if (nodeData.identifier === 'execution') {
              items.push(
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                ...processNodeData(
                  nodeAdjacencyListMap[nodeId].children ||
                    /* istanbul ignore next */ [],
                  graph?.nodeMap,
                  graph?.nodeAdjacencyListMap,
                  items,
                ),
              );
            } else {
              items.push({
                group: {
                  name: nodeData.name || /* istanbul ignore next */ '',
                  identifier: nodeId,
                  data: nodeData,
                  skipCondition: nodeData.skipInfo?.evaluatedCondition
                    ? nodeData.skipInfo.skipCondition
                    : undefined,
                  when: nodeData.nodeRunInfo,
                  containerCss: {
                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
                    ...(RollbackIdentifier === nodeData.identifier || isRollback
                      ? RollbackContainerCss
                      : {}),
                  },
                  status: nodeData.status as ExecutionStatus,
                  isOpen: true,
                  ...getIconDataBasedOnType(nodeData),
                  // eslint-disable-next-line @typescript-eslint/no-use-before-define
                  items: processNodeData(
                    nodeAdjacencyListMap[nodeId].children ||
                      /* istanbul ignore next */ [],
                    graph?.nodeMap,
                    graph?.nodeAdjacencyListMap,
                    items,
                  ),
                },
              });
            }
          }
        } else if (nodeData.stepType === NodeType.FORK) {
          items.push({
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            parallel: processNodeData(
              nodeAdjacencyListMap[nodeId].children ||
                /* istanbul ignore next */ [],
              graph?.nodeMap,
              graph?.nodeAdjacencyListMap,
              items,
            ),
          });
        } else {
          items.push({
            item: {
              name: nodeData.name || /* istanbul ignore next */ '',
              skipCondition: nodeData.skipInfo?.evaluatedCondition
                ? nodeData.skipInfo.skipCondition
                : undefined,
              when: nodeData.nodeRunInfo,
              ...getIconDataBasedOnType(nodeData),
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              showInLabel:
                nodeData.stepType === NodeType.SERVICE ||
                nodeData.stepType === NodeType.INFRASTRUCTURE,
              identifier: nodeId,
              status: nodeData.status as ExecutionStatus,
              type: getExecutionPipelineNodeType(nodeData?.stepType),
              data: nodeData,
            },
          });
        }
      }
      nodeId = nodeAdjacencyListMap[nodeId].nextIds?.[0];
    }
  }
  return items;
};

export function getPipelineStagesMap(
  layoutNodeMap: PipelineExecutionSummary['layoutNodeMap'],
  startingNodeId?: string,
): Map<string, GraphLayoutNode> {
  const map = new Map<string, GraphLayoutNode>();

  function recursiveSetInMap(node: GraphLayoutNode): void {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    if (
      node.nodeType === NodeTypes.Parallel ||
      isNodeTypeMatrixOrFor(node.nodeType)
    ) {
      node.edgeLayoutList?.currentNodeChildren?.forEach(item => {
        if (item && layoutNodeMap?.[item]) {
          // register nodes in case of strategy
          if (isNodeTypeMatrixOrFor(layoutNodeMap?.[item]?.nodeType)) {
            recursiveSetInMap(layoutNodeMap[item]);
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          const nodeId = isNodeTypeMatrixOrFor(node.nodeType)
            ? defaultTo(
                layoutNodeMap[item]?.nodeExecutionId,
                layoutNodeMap[item].nodeUuid,
              )
            : layoutNodeMap[item].nodeUuid;
          map.set(nodeId || '', layoutNodeMap[item]);
          return;
        }
      });
    } else {
      map.set(node.nodeUuid || '', node);
    }

    node.edgeLayoutList?.nextIds?.forEach(item => {
      if (item && layoutNodeMap?.[item]) {
        recursiveSetInMap(layoutNodeMap[item]);
        return;
      }
    });
  }

  if (startingNodeId && layoutNodeMap?.[startingNodeId]) {
    const node = layoutNodeMap[startingNodeId];
    recursiveSetInMap(node);
  }

  return map;
}

const processNodeData = (
  children: string[],
  nodeMap: ExecutionGraph['nodeMap'],
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap'],
  rootNodes: Array<ExecutionPipelineNode<ExecutionNode>>,
): Array<ExecutionPipelineNode<ExecutionNode>> => {
  const items: Array<ExecutionPipelineNode<ExecutionNode>> = [];
  children?.forEach(item => {
    const nodeData = nodeMap?.[item] as ExecutionNode;
    const isRollback =
      nodeData?.name?.endsWith(StepGroupRollbackIdentifier) ?? false;
    const nodeStrategyType =
      nodeData?.stepType === NodeType.STRATEGY
        ? ((nodeData?.stepParameters?.strategyType || 'MATRIX') as string)
        : (nodeData?.stepType as string);
    if (nodeStrategyType === NodeType.FORK) {
      items.push({
        parallel: processNodeData(
          nodeAdjacencyListMap?.[item].children ||
            /* istanbul ignore next */ [],
          nodeMap,
          nodeAdjacencyListMap,
          rootNodes,
        ),
      });
    } else if (
      nodeStrategyType === NodeType.STEP_GROUP ||
      nodeStrategyType === NodeType.NG_SECTION ||
      isNodeTypeMatrixOrFor(nodeStrategyType) ||
      (nodeData && isRollback)
    ) {
      items.push({
        group: {
          name: nodeData.name || /* istanbul ignore next */ '',
          identifier: item,
          data: nodeData,
          containerCss: {
            ...(isRollback ? RollbackContainerCss : {}),
          },
          status: nodeData.status as ExecutionStatus,
          isOpen: true,
          skipCondition: nodeData.skipInfo?.evaluatedCondition
            ? nodeData.skipInfo.skipCondition
            : undefined,
          when: nodeData.nodeRunInfo,
          ...getIconDataBasedOnType(nodeData),
          items: processNodeData(
            nodeAdjacencyListMap?.[item].children ||
              /* istanbul ignore next */ [],
            nodeMap,
            nodeAdjacencyListMap,
            rootNodes,
          ),
        },
      });
    } else {
      if (nodeStrategyType === LITE_ENGINE_TASK) {
        const parentNodeId =
          Object.entries(nodeAdjacencyListMap || {}).find(([_, val]) => {
            return (val?.children?.indexOf(nodeData.uuid!) ?? -1) >= 0;
          })?.[0] || '';
        processLiteEngineTask(nodeData, rootNodes, nodeMap?.[parentNodeId]);
      } else {
        items.push({
          item: {
            name: nodeData?.name || /* istanbul ignore next */ '',
            ...getIconDataBasedOnType(nodeData),
            identifier: item,
            skipCondition: nodeData?.skipInfo?.evaluatedCondition
              ? nodeData?.skipInfo.skipCondition
              : undefined,
            when: nodeData?.nodeRunInfo,
            status: nodeData?.status as ExecutionStatus,
            type: getExecutionPipelineNodeType(nodeStrategyType),
            data: nodeData,
          },
        });
      }
    }
    const nextIds =
      nodeAdjacencyListMap?.[item].nextIds || /* istanbul ignore next */ [];
    nextIds.forEach(id => {
      const nodeDataNext = nodeMap?.[id] as ExecutionNode;
      const isRollbackNext =
        nodeDataNext?.name?.endsWith(StepGroupRollbackIdentifier) ?? false;
      const nodeNextStrategyType =
        nodeDataNext?.stepType === NodeType.STRATEGY
          ? ((nodeDataNext?.stepParameters?.strategyType || 'MATRIX') as string)
          : (nodeDataNext?.stepType as string);
      if (nodeNextStrategyType === NodeType.FORK) {
        items.push({
          parallel: processNodeData(
            nodeAdjacencyListMap?.[id].children ||
              /* istanbul ignore next */ [],
            nodeMap,
            nodeAdjacencyListMap,
            rootNodes,
          ),
        });
      } else if (
        nodeNextStrategyType === NodeType.STEP_GROUP ||
        isNodeTypeMatrixOrFor(nodeNextStrategyType) ||
        (isRollbackNext && nodeDataNext)
      ) {
        items.push({
          group: {
            name: nodeDataNext.name || /* istanbul ignore next */ '',
            identifier: id,
            data: nodeDataNext,
            containerCss: {
              ...(isRollbackNext ? RollbackContainerCss : {}),
            },
            skipCondition: nodeDataNext.skipInfo?.evaluatedCondition
              ? nodeDataNext.skipInfo.skipCondition
              : undefined,
            when: nodeDataNext.nodeRunInfo,
            status: nodeDataNext.status as ExecutionStatus,
            isOpen: true,
            ...getIconDataBasedOnType(nodeDataNext),
            items: processNodeData(
              nodeAdjacencyListMap?.[id].children ||
                /* istanbul ignore next */ [],
              nodeMap,
              nodeAdjacencyListMap,
              rootNodes,
            ),
          },
        });
      } else {
        items.push({
          item: {
            name: nodeDataNext?.name || /* istanbul ignore next */ '',
            ...getIconDataBasedOnType(nodeDataNext),
            identifier: id,
            skipCondition: nodeDataNext?.skipInfo?.evaluatedCondition
              ? nodeDataNext.skipInfo.skipCondition
              : undefined,
            when: nodeDataNext?.nodeRunInfo,
            status: nodeDataNext?.status as ExecutionStatus,
            type: getExecutionPipelineNodeType(nodeNextStrategyType),
            data: nodeDataNext,
          },
        });
      }
      const nextLevels = nodeAdjacencyListMap?.[id].nextIds;
      if (nextLevels) {
        items.push(
          ...processNodeData(
            nextLevels,
            nodeMap,
            nodeAdjacencyListMap,
            rootNodes,
          ),
        );
      }
    });
  });
  return items;
};

export const hasOnlyLiteEngineTask = (
  children?: string[],
  graph?: ExecutionGraph,
): boolean => {
  return (
    !!children &&
    children.length === 1 &&
    graph?.nodeMap?.[children[0]]?.stepType === LITE_ENGINE_TASK &&
    graph?.nodeAdjacencyListMap?.[children[0]]?.nextIds?.length === 0
  );
};

export const processLiteEngineTask = (
  nodeData: ExecutionNode | undefined,
  rootNodes: ExecutionPipelineNode<ExecutionNode>[],
  parentNode?: ExecutionNode,
): void => {
  // NOTE: liteEngineTask contains information about dependencies
  const serviceDependencyList: ServiceDependency[] =
    // Array check is required for legacy support
    (Array.isArray(nodeData?.outcomes)
      ? nodeData?.outcomes?.find((_item: any) => !!_item.serviceDependencyList)
          ?.serviceDependencyList
      : nodeData?.outcomes?.dependencies?.serviceDependencyList) || [];

  // 1. Add dependency services
  addDependencies(serviceDependencyList, rootNodes);

  // 2. Exclude Initialize duration from the parent
  if (nodeData && parentNode) {
    const taskDuration = nodeData.endTs! - nodeData.startTs!;
    parentNode.startTs = Math.min(
      parentNode.startTs! + taskDuration,
      parentNode.endTs!,
    );
  }

  // 3. Add Initialize step ( at the first place in array )
  const stepItem: ExecutionPipelineItem<ExecutionNode> = {
    identifier: nodeData?.uuid as string,
    name: 'Initialize',
    type: getExecutionPipelineNodeType(nodeData?.stepType),
    status: nodeData?.status as ExecutionStatus,
    icon: 'initialize-step',
    data: nodeData as ExecutionNode,
    itemType: 'service-dependency',
  };
  const stepNode: ExecutionPipelineNode<ExecutionNode> = { item: stepItem };
  rootNodes.unshift(stepNode);
};

export const isNodeTypeMatrixOrFor = (nodeType?: string): boolean => {
  return [NodeTypes.Matrix, NodeTypes.Loop, NodeTypes.Parallelism].includes(
    nodeType as NodeTypes,
  );
};

const addDependencies = (
  dependencies: ServiceDependency[],
  stepsPipelineNodes: ExecutionPipelineNode<ExecutionNode>[],
): void => {
  if (dependencies && dependencies.length > 0) {
    const items: ExecutionPipelineNode<ExecutionNode>[] = [];

    dependencies.forEach(_service => addDependencyToArray(_service, items));

    const dependenciesGroup: ExecutionPipelineGroupInfo<ExecutionNode> = {
      identifier: STATIC_SERVICE_GROUP_NAME,
      name: 'Dependencies', // TODO: use getString('execution.dependencyGroupName'),
      status: dependencies[0].status as ExecutionStatus, // use status of first service
      data: {},
      icon: 'step-group',
      verticalStepGroup: true,
      isOpen: true,
      items: [{ parallel: items }],
    };

    // dependency goes at the beginning
    stepsPipelineNodes.unshift({ group: dependenciesGroup });
  }
};

const addDependencyToArray = (
  service: ServiceDependency,
  arr: ExecutionPipelineNode<ExecutionNode>[],
): void => {
  const stepItem: ExecutionPipelineItem<ExecutionNode> = {
    identifier: service.identifier as string,
    name: service.name as string,
    type: ExecutionPipelineNodeType.NORMAL,
    status: service.status as ExecutionStatus,
    icon: 'dependency-step',
    data: service as ExecutionNode,
    itemType: 'service-dependency',
  };

  // add step node
  const stepNode: ExecutionPipelineNode<ExecutionNode> = { item: stepItem };
  arr.push(stepNode);
};

export function getExecutionPipelineNodeType(
  stepType?: string,
): ExecutionPipelineNodeType {
  if (
    stepType === StepType.Barrier ||
    stepType === StepType.ResourceConstraint
  ) {
    return ExecutionPipelineNodeType.ICON;
  }
  if (isApprovalStep(stepType)) {
    return ExecutionPipelineNodeType.DIAMOND;
  }

  return ExecutionPipelineNodeType.NORMAL;
}

export function isHarnessApproval(stepType?: string): boolean {
  return stepType === StepType.HarnessApproval;
}

export function isJiraApproval(stepType?: string): boolean {
  return stepType === StepType.JiraApproval;
}

export function isApprovalStep(stepType?: string): boolean {
  return (
    isHarnessApproval(stepType) ||
    isJiraApproval(stepType) ||
    isServiceNowApproval(stepType)
  );
}

export function isServiceNowApproval(stepType?: string): boolean {
  return stepType === StepType.ServiceNowApproval;
}

export const StepGroupRollbackIdentifier = '(Rollback)';
export const STATIC_SERVICE_GROUP_NAME = 'static_service_group';
export const LITE_ENGINE_TASK = 'liteEngineTask';
export const RollbackIdentifier = 'Rollback';
export const RollbackContainerCss: React.CSSProperties = {
  borderColor: 'var(--red-450)',
};

export const ExecutionStatusEnum: Readonly<
  Record<ExecutionStatus, ExecutionStatus>
> = {
  Aborted: 'Aborted',
  Expired: 'Expired',
  Failed: 'Failed',
  NotStarted: 'NotStarted',
  Paused: 'Paused',
  Queued: 'Queued',
  Running: 'Running',
  Success: 'Success',
  Suspended: 'Suspended',
  ResourceWaiting: 'ResourceWaiting',
  AsyncWaiting: 'AsyncWaiting',
  Skipped: 'Skipped',
  TaskWaiting: 'TaskWaiting',
  TimedWaiting: 'TimedWaiting',
  Errored: 'Errored',
  IgnoreFailed: 'IgnoreFailed',
  Discontinuing: 'Discontinuing',
  ApprovalRejected: 'ApprovalRejected',
  InterventionWaiting: 'InterventionWaiting',
  ApprovalWaiting: 'ApprovalWaiting',
  Pausing: 'Pausing',
  InputWaiting: 'InputWaiting',
  WaitStepRunning: 'WaitStepRunning',
};

const changeCase = (status?: string): string => {
  const temp = camelCase(status);

  return temp.charAt(0).toUpperCase() + temp.slice(1);
};
export function isExecutionRunning(status?: string): boolean {
  const st = changeCase(status);
  return (
    st === ExecutionStatusEnum.Running ||
    st === ExecutionStatusEnum.AsyncWaiting ||
    st === ExecutionStatusEnum.TimedWaiting ||
    st === ExecutionStatusEnum.TaskWaiting
  );
}

export function isExecutionCompletedWithBadState(status?: string): boolean {
  return (
    isExecutionAborted(status) ||
    isExecutionExpired(status) ||
    isExecutionFailed(status) ||
    isExecutionSuspended(status) ||
    isExecutionApprovalRejected(status)
  );
}

export function isExecutionWaiting(status?: string): boolean {
  return (
    isExecutionOnlyWaiting(status) ||
    isExecutionWaitingForApproval(status) ||
    isExecutionWaitingForWaitStep(status) ||
    isExecutionWaitingForIntervention(status) ||
    isExecutionWaitingForInput(status)
  );
}

export function isExecutionOnlyWaiting(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.ResourceWaiting;
}

export function isExecutionWaitingForApproval(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.ApprovalWaiting;
}
export function isExecutionWaitingForWaitStep(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.WaitStepRunning;
}

export function isExecutionWaitingForIntervention(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.InterventionWaiting;
}

export function isExecutionWaitingForInput(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.InputWaiting;
}

export function isExecutionPausing(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.Pausing;
}

export function isExecutionPaused(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.Paused;
}

export function isExecutionAborted(status?: string): boolean {
  const st = changeCase(status);
  return (
    st === ExecutionStatusEnum.Aborted ||
    st === ExecutionStatusEnum.Discontinuing
  );
}

export function isExecutionFailed(status?: string): boolean {
  const st = changeCase(status);
  return (
    st === ExecutionStatusEnum.Failed || st === ExecutionStatusEnum.Errored
  );
}

export function isExecutionExpired(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.Expired;
}

export function isExecutionSuspended(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.Suspended;
}

export function isExecutionApprovalRejected(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.ApprovalRejected;
}

export function isExecutionRunningLike(status?: string): boolean {
  return (
    isExecutionRunning(status) ||
    isExecutionPaused(status) ||
    isExecutionPausing(status) ||
    isExecutionWaiting(status)
  );
}

export function isExecutionSuccess(status?: string): boolean {
  const st = changeCase(status);
  return (
    st === ExecutionStatusEnum.Success ||
    st === ExecutionStatusEnum.IgnoreFailed
  );
}

export function isExecutionNotStarted(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.NotStarted;
}

export function isExecutionQueued(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.Queued;
}

export function isExecutionSkipped(status?: string): boolean {
  return changeCase(status) === ExecutionStatusEnum.Skipped;
}

export const getBackgroundStepStatus = ({
  allNodeMap,
  identifier,
}: {
  allNodeMap: Record<string, ExecutionNode>;
  identifier: string;
}): Omit<ExecutionStatus, 'NOT_STARTED'> | undefined => {
  return allNodeMap[identifier]?.status;
};

export declare function timeToDisplayText(time: number): string;

export const getStepsTreeStatus = ({
  allNodeMap,
  step,
}: {
  allNodeMap: Record<string, ExecutionNode>;
  step: ExecutionPipelineNode<ExecutionNode>;
  // eslint-disable-next-line consistent-return
}): undefined | Omit<ExecutionStatus, 'NOT_STARTED, undefinde'> => {
  const stepIdentifier = step?.item?.identifier;
  const groupIdentifier = step?.group?.identifier;
  if (stepIdentifier && step.item?.data) {
    return (
      (step.item.data?.stepType === StepType.Background &&
        getBackgroundStepStatus({
          identifier: step.item.identifier,
          allNodeMap,
        })) ||
      step.item.status
    );
  } else if (groupIdentifier && step.group?.data) {
    return (
      (step.group.data?.stepType === StepType.Background &&
        getBackgroundStepStatus({
          identifier: step.group.identifier,
          allNodeMap,
        })) ||
      step.group.status
    );
  }
};

export enum NodeType {
  SERVICE = 'SERVICE',
  SERVICE_CONFIG = 'SERVICE_CONFIG',
  SERVICE_SECTION = 'SERVICE_SECTION',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  GENERIC_SECTION = 'GENERIC_SECTION',
  STEP_GROUP = 'STEP_GROUP',
  NG_SECTION = 'NG_SECTION',
  ROLLBACK_OPTIONAL_CHILD_CHAIN = 'ROLLBACK_OPTIONAL_CHILD_CHAIN',
  FORK = 'NG_FORK',
  INFRASTRUCTURE_SECTION = 'INFRASTRUCTURE_SECTION',
  DEPLOYMENT_STAGE_STEP = 'DEPLOYMENT_STAGE_STEP',
  APPROVAL_STAGE = 'APPROVAL_STAGE',
  NG_SECTION_WITH_ROLLBACK_INFO = 'NG_SECTION_WITH_ROLLBACK_INFO',
  NG_EXECUTION = 'NG_EXECUTION',
  StepGroupNode = 'StepGroupNode',
  'GITOPS_CLUSTERS' = 'GITOPS CLUSTERS',
  STRATEGY = 'STRATEGY',
  RUNTIME_INPUT = 'RUNTIME_INPUT', // virtual node
  INFRASTRUCTURE_V2 = 'INFRASTRUCTURE_V2',
  INFRASTRUCTURE_TASKSTEP_V2 = 'INFRASTRUCTURE_TASKSTEP_V2',
  SERVICE_V3 = 'SERVICE_V3',
}

enum NodeTypes {
  Parallel = 'parallel',
  Stage = 'stage',
  Matrix = 'MATRIX',
  Loop = 'LOOP',
  Parallelism = 'PARALLELISM',
}

export const TopLevelNodes: NodeType[] = [
  NodeType.NG_SECTION,
  NodeType.ROLLBACK_OPTIONAL_CHILD_CHAIN,
  NodeType.INFRASTRUCTURE_SECTION,
  NodeType.NG_SECTION_WITH_ROLLBACK_INFO,
  NodeType.NG_EXECUTION,
];

export enum ExecutionPipelineNodeType {
  DIAMOND = 'DIAMOND',
  NORMAL = 'NORMAL',
  ICON = 'ICON',
  MATRIX = 'MATRIX',
}

export interface ExecutionSummaryInfo {
  deployments?: number[];
  lastExecutionId?: string;
  lastExecutionStatus?:
    | 'Running'
    | 'AsyncWaiting'
    | 'TaskWaiting'
    | 'TimedWaiting'
    | 'Failed'
    | 'Errored'
    | 'IgnoreFailed'
    | 'NotStarted'
    | 'Expired'
    | 'Aborted'
    | 'Discontinuing'
    | 'Queued'
    | 'Paused'
    | 'ResourceWaiting'
    | 'InterventionWaiting'
    | 'ApprovalWaiting'
    | 'WaitStepRunning'
    | 'Success'
    | 'Suspended'
    | 'Skipped'
    | 'Pausing'
    | 'ApprovalRejected'
    | 'InputWaiting'
    | 'NOT_STARTED'
    | 'INTERVENTION_WAITING'
    | 'APPROVAL_WAITING'
    | 'APPROVAL_REJECTED'
    | 'WAITING';
  lastExecutionTs?: number;
  numOfErrors?: number[];
}

export interface ExecutionPipeline<T> {
  items: Array<ExecutionPipelineNode<T>>;
  identifier: string;
  status?: ExecutionStatus;
  allNodes: string[];
}

export interface ExecutionPipelineItem<T> {
  [x: string]: any;
  iconStyle?: CSSProperties;
  iconSize?: number;
  identifier: string;
  name: string;
  type: ExecutionPipelineNodeType;
  status: ExecutionStatus;
  icon: IconName;
  skipCondition?: string;
  when?: NodeRunInfo;
  barrierFound?: boolean;
  disableClick?: boolean;
  cssProps?: CSSProperties;
  data?: T;
  pipeline?: ExecutionPipeline<T>;
  itemType?: 'step' | 'service-dependency' | string;
}
export type ExecutionStatus = Exclude<
  Required<ExecutionSummaryInfo>['lastExecutionStatus'],
  | 'NOT_STARTED'
  | 'INTERVENTION_WAITING'
  | 'APPROVAL_WAITING'
  | 'APPROVAL_REJECTED'
  | 'WAITING'
>;

export interface Intent {
  NONE: 'none';
  PRIMARY: 'primary';
  SUCCESS: 'success';
  WARNING: 'warning';
  DANGER: 'danger';
}

export declare type Spacing =
  | 'none'
  | 'xsmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge'
  | 'xxlarge'
  | 'xxxlarge'
  | 'huge'
  | 'dialog'
  | 'form'
  | 'form-section'
  | 'form-panel'
  | 'form-subsection'
  | 'form-panel-subsection'
  | 'form-action-buttons'
  | any;

export interface MarginProps {
  top?: Spacing;
  right?: Spacing;
  bottom?: Spacing;
  left?: Spacing;
}

export interface PaddingProps {
  top?: Spacing;
  right?: Spacing;
  bottom?: Spacing;
  left?: Spacing;
}

export declare type FontSize =
  | 'xsmall'
  | 'small'
  | 'normal'
  | 'medium'
  | 'large';

export interface FontProps {
  size?: FontSize;
  mono?: boolean;
  italic?: boolean;
  weight?: FontWeight;
  align?: TextAlignment;
  variation?: FontVariation;
}

export declare type FontWeight = 'light' | 'bold' | 'semi-bold';
export declare type TextAlignment = 'left' | 'center' | 'right';
export declare enum FontVariation {
  DISPLAY1 = 'display1',
  DISPLAY2 = 'display2',
  H1 = 'h1',
  H1_SEMI = 'h1-semi',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
  LEAD = 'lead',
  BODY = 'body',
  BODY1 = 'body1',
  BODY2 = 'body2',
  BODY2_SEMI = 'body2-semi',
  BLOCKQUOTE = 'blockquote',
  UPPERCASED = 'uppercased',
  SMALL = 'small',
  SMALL_BOLD = 'small-bold',
  SMALL_SEMI = 'small-semi',
  TABLE_HEADERS = 'table-headers',
  TINY = 'tiny',
  TINY_SEMI = 'tiny-semi',
  YAML = 'yaml',
  CARD_TITLE = 'card-title',
  FORM_TITLE = 'form-title',
  FORM_SUB_SECTION = 'form-sub-section',
  FORM_INPUT_TEXT = 'form-input-text',
  FORM_LABEL = 'form-label',
  FORM_HELP = 'form-help',
  FORM_MESSAGE_DANGER = 'form-message-danger',
  FORM_MESSAGE_WARNING = 'form-message-warning',
  FORM_MESSAGE_SUCCESS = 'form-message-success',
}

export interface StyledProps {
  /** Component intent */
  intent?: Intent;
  /** Component width */
  width?: string | number;
  /** Component height*/
  height?: string | number;
  /** Component margin. Usually used for containers */
  margin?: Spacing | MarginProps;
  /** Component padding. Usually used for containers */
  padding?: Spacing | PaddingProps;
  /** Component font size */
  font?: FontSize | FontProps;
  /** Render component as inline block */
  inline?: boolean;
  /** Text color */
  color?: Color;
  /** Background color */
  background?: Color;
  /**
   * Component border. Support boolean (default 1px grey solid) or BorderProps
   *  border={true}
   *  border={{ top: true, color: 'red500' }}
   */
  border?: boolean | BorderProps;
  /** Component flex layout */
  flex?: boolean | FlexProps;
  /** Optional class name */
  className?: string;
}

export declare type IconName = HarnessIconName | BIconName;
export declare function Icon(props: IconProps): React.ReactElement;

export interface IconProps
  extends HTMLAttributes<HTMLHeadingElement>,
    Omit<StyledProps, 'children'> {
  name: IconName;
  inverse?: boolean;
  size?: number;
}

export interface FlexProps {
  inline?: boolean;
  /** Component children flex layout content alignment */
  align?: 'center-center';
  alignItems?:
    | 'stretch'
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'baseline'
    | 'start'
    | 'end'
    | 'self-start'
    | 'self-end';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | 'start'
    | 'end'
    | 'left'
    | 'right';
  /** Component children flex layout content distribution */
  distribution?: 'space-between';
}

export interface OptionalTooltip {
  /** Optional tooltip */
  tooltip?: JSX.Element | string;
  /** Optional props for Popover component used to render tooltip - Usually used to pass dark theme */
  tooltipProps?: PopoverProps;
}

export interface PopoverProps extends IPopoverProps {
  /** If true, render BPopover in dark background and light font color */
  isDark?: boolean;
  /** Popover target element */
  children?: React.ReactNode;
  /** data-tooltip-id to be attached and used by docs team */
  dataTooltipId?: string;
}

export interface BorderProps {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  color?: Color;
  style?: string;
  width?: number;
  radius?: number;
}

export declare const Color: {
  PRIMARY_BG: string;
  PRIMARY_10: string;
  PRIMARY_9: string;
  PRIMARY_8: string;
  PRIMARY_7: string;
  PRIMARY_6: string;
  PRIMARY_5: string;
  PRIMARY_4: string;
  PRIMARY_3: string;
  PRIMARY_2: string;
  PRIMARY_1: string;
  GREY_1000: string;
  GREY_900: string;
  GREY_800: string;
  GREY_700: string;
  GREY_600: string;
  GREY_500: string;
  GREY_400: string;
  GREY_300: string;
  GREY_200: string;
  GREY_100: string;
  GREY_50: string;
  GREY_0: string;
  GREEN_900: string;
  GREEN_800: string;
  GREEN_700: string;
  GREEN_600: string;
  GREEN_500: string;
  GREEN_400: string;
  GREEN_300: string;
  GREEN_200: string;
  GREEN_100: string;
  GREEN_50: string;
  BLUE_900: string;
  BLUE_800: string;
  BLUE_700: string;
  BLUE_600: string;
  BLUE_500: string;
  BLUE_400: string;
  BLUE_300: string;
  BLUE_200: string;
  BLUE_100: string;
  BLUE_50: string;
  YELLOW_900: string;
  YELLOW_800: string;
  YELLOW_700: string;
  YELLOW_600: string;
  YELLOW_500: string;
  YELLOW_400: string;
  YELLOW_300: string;
  YELLOW_200: string;
  YELLOW_100: string;
  YELLOW_50: string;
  ORANGE_900: string;
  ORANGE_800: string;
  ORANGE_700: string;
  ORANGE_600: string;
  ORANGE_500: string;
  ORANGE_400: string;
  ORANGE_300: string;
  ORANGE_200: string;
  ORANGE_100: string;
  ORANGE_50: string;
  RED_900: string;
  RED_800: string;
  RED_700: string;
  RED_600: string;
  RED_500: string;
  RED_400: string;
  RED_300: string;
  RED_200: string;
  RED_100: string;
  RED_50: string;
  TEAL_900: string;
  TEAL_800: string;
  TEAL_700: string;
  TEAL_600: string;
  TEAL_500: string;
  TEAL_400: string;
  TEAL_300: string;
  TEAL_200: string;
  TEAL_100: string;
  TEAL_50: string;
  LIME_900: string;
  LIME_800: string;
  LIME_700: string;
  LIME_600: string;
  LIME_500: string;
  LIME_400: string;
  LIME_300: string;
  LIME_200: string;
  LIME_100: string;
  LIME_50: string;
  PURPLE_900: string;
  PURPLE_800: string;
  PURPLE_700: string;
  PURPLE_600: string;
  PURPLE_500: string;
  PURPLE_400: string;
  PURPLE_300: string;
  PURPLE_200: string;
  PURPLE_100: string;
  PURPLE_50: string;
  MAGENTA_900: string;
  MAGENTA_800: string;
  MAGENTA_700: string;
  MAGENTA_600: string;
  MAGENTA_500: string;
  MAGENTA_400: string;
  MAGENTA_300: string;
  MAGENTA_200: string;
  MAGENTA_100: string;
  MAGENTA_50: string;
  AQUA_500: string;
  BLACK: string;
  BLACK_100: string;
  WHITE: string;
  FORM_BG: string;
  FORM_SECTION_BG: string;
  FORM_PANEL_BG: string;
  FORM_SUBSECTION_BG: string;
  ERROR: string;
  WARNING: string;
  SUCCESS: string;
  GREY_450: string;
  GREY_350: string;
  GREY_250: string;
  BLUE_450: string;
  BLUE_350: string;
  RED_450: string;
  RED_350: string;
  YELLOW_450: string;
  YELLOW_350: string;
  GREEN_450: string;
  GREEN_350: string;
  SEA_GREEN_500: string;
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export declare type Color = (typeof Color)[keyof typeof Color];

export interface ExecutionPipelineGroupInfo<T> {
  identifier: string;
  name: string;
  data: T;
  cssProps?: CSSProperties;
  icon: IconName;
  skipCondition?: string;
  when?: NodeRunInfo;
  containerCss?: CSSProperties;
  textCss?: CSSProperties;
  verticalStepGroup?: boolean;
  status: ExecutionStatus;
  isOpen: boolean;
  items: Array<ExecutionPipelineNode<T>>;
}
export interface ExecutionPipelineNode<T> {
  item?: ExecutionPipelineItem<T>;
  parallel?: Array<ExecutionPipelineNode<T>>;
  group?: ExecutionPipelineGroupInfo<T>;
}

export interface ExecutionGraph {
  nodeAdjacencyListMap?: {
    [key: string]: ExecutionNodeAdjacencyList;
  };
  nodeMap?: {
    [key: string]: ExecutionNode;
  };
  representationStrategy?: 'camelCase';
  rootNodeId?: string;
}

export interface DelegateInfo {
  id?: string;
  name?: string;
  taskId?: string;
  taskName?: string;
}

export interface ExecutableResponse {
  [key: string]: any;
}

export interface AdviserIssuer {
  adviseType:
    | 'UNKNOWN'
    | 'NEXT_STEP'
    | 'RETRY'
    | 'INTERVENTION_WAIT'
    | 'END_PLAN'
    | 'MARK_SUCCESS'
    | 'IGNORE_FAILURE'
    | 'PROCEED_WITH_DEFAULT'
    | 'UNRECOGNIZED';
}

export interface ManualIssuer {
  email_id: string;
  identifier: string;
  type: string;
  user_id: string;
}

export interface TimeoutIssuer {
  timeoutInstanceId: string;
}

export interface TriggerIssuer {
  abortPrevConcurrentExecution: boolean;
  triggerRef: string;
}

export interface IssuedBy {
  adviserIssuer?: AdviserIssuer;
  issueTime: number;
  manualIssuer?: ManualIssuer;
  timeoutIssuer?: TimeoutIssuer;
  triggerIssuer?: TriggerIssuer;
}

export interface RetryInterruptConfig {
  retryId: string;
}

export interface InterruptConfig {
  issuedBy: IssuedBy;
  retryInterruptConfig?: RetryInterruptConfig;
}

export interface InterruptEffectDTO {
  interruptConfig: InterruptConfig;
  interruptId: string;
  interruptType:
    | 'UNKNOWN'
    | 'ABORT'
    | 'ABORT_ALL'
    | 'PAUSE'
    | 'PAUSE_ALL'
    | 'RESUME'
    | 'RESUME_ALL'
    | 'RETRY'
    | 'IGNORE'
    | 'WAITING_FOR_MANUAL_INTERVENTION'
    | 'MARK_FAILED'
    | 'MARK_SUCCESS'
    | 'NEXT_STEP'
    | 'END_EXECUTION'
    | 'MARK_EXPIRED'
    | 'CUSTOM_FAILURE'
    | 'EXPIRE_ALL'
    | 'PROCEED_WITH_DEFAULT'
    | 'UNRECOGNIZED';
  tookEffectAt: number;
}

export interface ServiceDependency {
  identifier: string;
  name: string | null;
  image: string;
  status: string;
  startTime: string;
  endTime: string | null;
  errorMessage: string | null;
  errorReason: string | null;
}

export interface NodeRunInfo {
  [key: string]: any;
}

export interface SkipInfo {
  [key: string]: any;
}

export interface ExecutionNode {
  baseFqn?: string;
  delegateInfoList?: DelegateInfo[];
  endTs?: number;
  executableResponses?: ExecutableResponse[];
  executionInputConfigured?: boolean;
  failureInfo?: FailureInfoDTO;
  identifier?: string;
  interruptHistories?: InterruptEffectDTO[];
  name?: string;
  nodeRunInfo?: NodeRunInfo;
  outcomes?: {
    [key: string]: {
      [key: string]: { [key: string]: any };
    };
  };
  progressData?: {
    [key: string]: { [key: string]: any };
  };
  setupId?: string;
  skipInfo?: SkipInfo;
  startTs?: number;
  status?:
    | 'Running'
    | 'AsyncWaiting'
    | 'TaskWaiting'
    | 'TimedWaiting'
    | 'Failed'
    | 'Errored'
    | 'IgnoreFailed'
    | 'NotStarted'
    | 'Expired'
    | 'Aborted'
    | 'Discontinuing'
    | 'Queued'
    | 'Paused'
    | 'ResourceWaiting'
    | 'InterventionWaiting'
    | 'ApprovalWaiting'
    | 'WaitStepRunning'
    | 'Success'
    | 'Suspended'
    | 'Skipped'
    | 'Pausing'
    | 'ApprovalRejected'
    | 'InputWaiting'
    | 'NOT_STARTED'
    | 'INTERVENTION_WAITING'
    | 'APPROVAL_WAITING'
    | 'APPROVAL_REJECTED'
    | 'WAITING';
  stepDetails?: {
    [key: string]: {
      [key: string]: { [key: string]: any };
    };
  };
  stepParameters?: {
    [key: string]: { [key: string]: any };
  };
  stepType?: string;
  strategyMetadata?: StrategyMetadata;
  unitProgresses?: UnitProgress[];
  uuid?: string;
}

export interface UnitProgress {
  [key: string]: any;
}

export interface StrategyMetadata {
  [key: string]: any;
}

export interface FailureInfoDTO {
  failureTypeList?: (
    | 'EXPIRED'
    | 'DELEGATE_PROVISIONING'
    | 'CONNECTIVITY'
    | 'AUTHENTICATION'
    | 'VERIFICATION_FAILURE'
    | 'APPLICATION_ERROR'
    | 'AUTHORIZATION_ERROR'
    | 'TIMEOUT_ERROR'
    | 'POLICY_EVALUATION_FAILURE'
    | 'INPUT_TIMEOUT_FAILURE'
  )[];
  message?: string;
  responseMessages?: ResponseMessage[];
}

export interface ExecutionNodeAdjacencyList {
  children?: string[];
  nextIds?: string[];
}

export interface ResponseMessage {
  code?:
    | 'DEFAULT_ERROR_CODE'
    | 'INVALID_ARGUMENT'
    | 'INVALID_EMAIL'
    | 'DOMAIN_NOT_ALLOWED_TO_REGISTER'
    | 'COMMNITY_EDITION_NOT_FOUND'
    | 'DEPLOY_MODE_IS_NOT_ON_PREM'
    | 'USER_ALREADY_REGISTERED'
    | 'USER_INVITATION_DOES_NOT_EXIST'
    | 'USER_DOES_NOT_EXIST'
    | 'USER_INVITE_OPERATION_FAILED'
    | 'USER_DISABLED'
    | 'ACCOUNT_DOES_NOT_EXIST'
    | 'INACTIVE_ACCOUNT'
    | 'ACCOUNT_MIGRATED'
    | 'USER_DOMAIN_NOT_ALLOWED'
    | 'MAX_FAILED_ATTEMPT_COUNT_EXCEEDED'
    | 'RESOURCE_NOT_FOUND'
    | 'INVALID_FORMAT'
    | 'ROLE_DOES_NOT_EXIST'
    | 'EMAIL_NOT_VERIFIED'
    | 'EMAIL_VERIFICATION_TOKEN_NOT_FOUND'
    | 'INVALID_TOKEN'
    | 'REVOKED_TOKEN'
    | 'INVALID_CAPTCHA_TOKEN'
    | 'NOT_ACCOUNT_MGR_NOR_HAS_ALL_APP_ACCESS'
    | 'EXPIRED_TOKEN'
    | 'INVALID_AGENT_MTLS_AUTHORITY'
    | 'TOKEN_ALREADY_REFRESHED_ONCE'
    | 'ACCESS_DENIED'
    | 'NG_ACCESS_DENIED'
    | 'INVALID_CREDENTIAL'
    | 'INVALID_CREDENTIALS_THIRD_PARTY'
    | 'INVALID_KEY'
    | 'INVALID_CONNECTOR_TYPE'
    | 'INVALID_KEYPATH'
    | 'INVALID_VARIABLE'
    | 'UNKNOWN_HOST'
    | 'UNREACHABLE_HOST'
    | 'INVALID_PORT'
    | 'SSH_SESSION_TIMEOUT'
    | 'SOCKET_CONNECTION_ERROR'
    | 'CONNECTION_ERROR'
    | 'SOCKET_CONNECTION_TIMEOUT'
    | 'WINRM_COMMAND_EXECUTION_TIMEOUT'
    | 'CONNECTION_TIMEOUT'
    | 'SSH_CONNECTION_ERROR'
    | 'USER_GROUP_ERROR'
    | 'INVALID_EXECUTION_ID'
    | 'ERROR_IN_GETTING_CHANNEL_STREAMS'
    | 'UNEXPECTED'
    | 'UNKNOWN_ERROR'
    | 'UNKNOWN_EXECUTOR_TYPE_ERROR'
    | 'DUPLICATE_STATE_NAMES'
    | 'TRANSITION_NOT_LINKED'
    | 'TRANSITION_TO_INCORRECT_STATE'
    | 'TRANSITION_TYPE_NULL'
    | 'STATES_WITH_DUP_TRANSITIONS'
    | 'BARRIERS_NOT_RUNNING_CONCURRENTLY'
    | 'NON_FORK_STATES'
    | 'NON_REPEAT_STATES'
    | 'INITIAL_STATE_NOT_DEFINED'
    | 'FILE_INTEGRITY_CHECK_FAILED'
    | 'INVALID_URL'
    | 'FILE_DOWNLOAD_FAILED'
    | 'PLATFORM_SOFTWARE_DELETE_ERROR'
    | 'INVALID_CSV_FILE'
    | 'INVALID_REQUEST'
    | 'SCHEMA_VALIDATION_FAILED'
    | 'FILTER_CREATION_ERROR'
    | 'INVALID_YAML_ERROR'
    | 'PLAN_CREATION_ERROR'
    | 'INVALID_INFRA_STATE'
    | 'PIPELINE_ALREADY_TRIGGERED'
    | 'NON_EXISTING_PIPELINE'
    | 'DUPLICATE_COMMAND_NAMES'
    | 'INVALID_PIPELINE'
    | 'COMMAND_DOES_NOT_EXIST'
    | 'DUPLICATE_ARTIFACTSTREAM_NAMES'
    | 'DUPLICATE_HOST_NAMES'
    | 'STATE_NOT_FOR_TYPE'
    | 'STATE_MACHINE_ISSUE'
    | 'STATE_DISCONTINUE_FAILED'
    | 'STATE_PAUSE_FAILED'
    | 'PAUSE_ALL_ALREADY'
    | 'RESUME_ALL_ALREADY'
    | 'ROLLBACK_ALREADY'
    | 'ABORT_ALL_ALREADY'
    | 'EXPIRE_ALL_ALREADY'
    | 'RETRY_FAILED'
    | 'UNKNOWN_ARTIFACT_TYPE'
    | 'UNKNOWN_STAGE_ELEMENT_WRAPPER_TYPE'
    | 'INIT_TIMEOUT'
    | 'LICENSE_EXPIRED'
    | 'NOT_LICENSED'
    | 'REQUEST_TIMEOUT'
    | 'WORKFLOW_ALREADY_TRIGGERED'
    | 'JENKINS_ERROR'
    | 'INVALID_ARTIFACT_SOURCE'
    | 'INVALID_ARTIFACT_SERVER'
    | 'INVALID_CLOUD_PROVIDER'
    | 'UPDATE_NOT_ALLOWED'
    | 'DELETE_NOT_ALLOWED'
    | 'APPDYNAMICS_CONFIGURATION_ERROR'
    | 'APM_CONFIGURATION_ERROR'
    | 'SPLUNK_CONFIGURATION_ERROR'
    | 'ELK_CONFIGURATION_ERROR'
    | 'LOGZ_CONFIGURATION_ERROR'
    | 'SUMO_CONFIGURATION_ERROR'
    | 'INSTANA_CONFIGURATION_ERROR'
    | 'APPDYNAMICS_ERROR'
    | 'STACKDRIVER_ERROR'
    | 'STACKDRIVER_CONFIGURATION_ERROR'
    | 'NEWRELIC_CONFIGURATION_ERROR'
    | 'NEWRELIC_ERROR'
    | 'DYNA_TRACE_CONFIGURATION_ERROR'
    | 'DYNA_TRACE_ERROR'
    | 'CLOUDWATCH_ERROR'
    | 'CLOUDWATCH_CONFIGURATION_ERROR'
    | 'PROMETHEUS_CONFIGURATION_ERROR'
    | 'DATA_DOG_CONFIGURATION_ERROR'
    | 'SERVICE_GUARD_CONFIGURATION_ERROR'
    | 'ENCRYPTION_NOT_CONFIGURED'
    | 'UNAVAILABLE_DELEGATES'
    | 'WORKFLOW_EXECUTION_IN_PROGRESS'
    | 'PIPELINE_EXECUTION_IN_PROGRESS'
    | 'AWS_ACCESS_DENIED'
    | 'AWS_CLUSTER_NOT_FOUND'
    | 'AWS_SERVICE_NOT_FOUND'
    | 'IMAGE_NOT_FOUND'
    | 'ILLEGAL_ARGUMENT'
    | 'IMAGE_TAG_NOT_FOUND'
    | 'DELEGATE_NOT_AVAILABLE'
    | 'INVALID_YAML_PAYLOAD'
    | 'AUTHENTICATION_ERROR'
    | 'AUTHORIZATION_ERROR'
    | 'UNRECOGNIZED_YAML_FIELDS'
    | 'COULD_NOT_MAP_BEFORE_YAML'
    | 'MISSING_BEFORE_YAML'
    | 'MISSING_YAML'
    | 'NON_EMPTY_DELETIONS'
    | 'GENERAL_YAML_ERROR'
    | 'GENERAL_YAML_INFO'
    | 'YAML_GIT_SYNC_ERROR'
    | 'GIT_CONNECTION_ERROR'
    | 'GIT_ERROR'
    | 'ARTIFACT_SERVER_ERROR'
    | 'ENCRYPT_DECRYPT_ERROR'
    | 'SECRET_MANAGEMENT_ERROR'
    | 'SECRET_NOT_FOUND'
    | 'KMS_OPERATION_ERROR'
    | 'GCP_KMS_OPERATION_ERROR'
    | 'VAULT_OPERATION_ERROR'
    | 'AWS_SECRETS_MANAGER_OPERATION_ERROR'
    | 'AZURE_KEY_VAULT_OPERATION_ERROR'
    | 'UNSUPPORTED_OPERATION_EXCEPTION'
    | 'FEATURE_UNAVAILABLE'
    | 'GENERAL_ERROR'
    | 'BASELINE_CONFIGURATION_ERROR'
    | 'SAML_IDP_CONFIGURATION_NOT_AVAILABLE'
    | 'INVALID_AUTHENTICATION_MECHANISM'
    | 'INVALID_SAML_CONFIGURATION'
    | 'INVALID_OAUTH_CONFIGURATION'
    | 'INVALID_LDAP_CONFIGURATION'
    | 'USER_GROUP_SYNC_FAILURE'
    | 'USER_GROUP_ALREADY_EXIST'
    | 'INVALID_TWO_FACTOR_AUTHENTICATION_CONFIGURATION'
    | 'EXPLANATION'
    | 'HINT'
    | 'NOT_WHITELISTED_IP'
    | 'INVALID_TOTP_TOKEN'
    | 'EMAIL_FAILED'
    | 'SSL_HANDSHAKE_FAILED'
    | 'NO_APPS_ASSIGNED'
    | 'INVALID_INFRA_CONFIGURATION'
    | 'TEMPLATES_LINKED'
    | 'USER_HAS_NO_PERMISSIONS'
    | 'USER_NOT_AUTHORIZED'
    | 'USER_ALREADY_PRESENT'
    | 'EMAIL_ERROR'
    | 'INVALID_USAGE_RESTRICTION'
    | 'USAGE_RESTRICTION_ERROR'
    | 'STATE_EXECUTION_INSTANCE_NOT_FOUND'
    | 'DELEGATE_TASK_RETRY'
    | 'KUBERNETES_API_TASK_EXCEPTION'
    | 'KUBERNETES_TASK_EXCEPTION'
    | 'KUBERNETES_YAML_ERROR'
    | 'SAVE_FILE_INTO_GCP_STORAGE_FAILED'
    | 'READ_FILE_FROM_GCP_STORAGE_FAILED'
    | 'FILE_NOT_FOUND_ERROR'
    | 'USAGE_LIMITS_EXCEEDED'
    | 'EVENT_PUBLISH_FAILED'
    | 'CUSTOM_APPROVAL_ERROR'
    | 'JIRA_ERROR'
    | 'EXPRESSION_EVALUATION_FAILED'
    | 'KUBERNETES_VALUES_ERROR'
    | 'KUBERNETES_CLUSTER_ERROR'
    | 'INCORRECT_SIGN_IN_MECHANISM'
    | 'OAUTH_LOGIN_FAILED'
    | 'INVALID_TERRAFORM_TARGETS_REQUEST'
    | 'TERRAFORM_EXECUTION_ERROR'
    | 'FILE_READ_FAILED'
    | 'FILE_SIZE_EXCEEDS_LIMIT'
    | 'CLUSTER_NOT_FOUND'
    | 'MARKETPLACE_TOKEN_NOT_FOUND'
    | 'INVALID_MARKETPLACE_TOKEN'
    | 'INVALID_TICKETING_SERVER'
    | 'SERVICENOW_ERROR'
    | 'PASSWORD_EXPIRED'
    | 'USER_LOCKED'
    | 'PASSWORD_STRENGTH_CHECK_FAILED'
    | 'ACCOUNT_DISABLED'
    | 'INVALID_ACCOUNT_PERMISSION'
    | 'PAGERDUTY_ERROR'
    | 'HEALTH_ERROR'
    | 'SAML_TEST_SUCCESS_MECHANISM_NOT_ENABLED'
    | 'DOMAIN_WHITELIST_FILTER_CHECK_FAILED'
    | 'INVALID_DASHBOARD_UPDATE_REQUEST'
    | 'DUPLICATE_FIELD'
    | 'INVALID_AZURE_VAULT_CONFIGURATION'
    | 'USER_NOT_AUTHORIZED_DUE_TO_USAGE_RESTRICTIONS'
    | 'INVALID_ROLLBACK'
    | 'DATA_COLLECTION_ERROR'
    | 'SUMO_DATA_COLLECTION_ERROR'
    | 'DEPLOYMENT_GOVERNANCE_ERROR'
    | 'BATCH_PROCESSING_ERROR'
    | 'GRAPHQL_ERROR'
    | 'FILE_CREATE_ERROR'
    | 'ILLEGAL_STATE'
    | 'GIT_DIFF_COMMIT_NOT_IN_ORDER'
    | 'FAILED_TO_ACQUIRE_PERSISTENT_LOCK'
    | 'FAILED_TO_ACQUIRE_NON_PERSISTENT_LOCK'
    | 'POD_NOT_FOUND_ERROR'
    | 'COMMAND_EXECUTION_ERROR'
    | 'REGISTRY_EXCEPTION'
    | 'ENGINE_INTERRUPT_PROCESSING_EXCEPTION'
    | 'ENGINE_IO_EXCEPTION'
    | 'ENGINE_OUTCOME_EXCEPTION'
    | 'ENGINE_SWEEPING_OUTPUT_EXCEPTION'
    | 'CACHE_NOT_FOUND_EXCEPTION'
    | 'ENGINE_ENTITY_UPDATE_EXCEPTION'
    | 'SHELL_EXECUTION_EXCEPTION'
    | 'TEMPLATE_NOT_FOUND'
    | 'AZURE_SERVICE_EXCEPTION'
    | 'AZURE_CLIENT_EXCEPTION'
    | 'GIT_UNSEEN_REMOTE_HEAD_COMMIT'
    | 'TIMEOUT_ENGINE_EXCEPTION'
    | 'NO_AVAILABLE_DELEGATES'
    | 'NO_GLOBAL_DELEGATE_ACCOUNT'
    | 'NO_INSTALLED_DELEGATES'
    | 'DUPLICATE_DELEGATE_EXCEPTION'
    | 'GCP_MARKETPLACE_EXCEPTION'
    | 'MISSING_DEFAULT_GOOGLE_CREDENTIALS'
    | 'INCORRECT_DEFAULT_GOOGLE_CREDENTIALS'
    | 'OPTIMISTIC_LOCKING_EXCEPTION'
    | 'NG_PIPELINE_EXECUTION_EXCEPTION'
    | 'NG_PIPELINE_CREATE_EXCEPTION'
    | 'RESOURCE_NOT_FOUND_EXCEPTION'
    | 'PMS_INITIALIZE_SDK_EXCEPTION'
    | 'UNEXPECTED_SNIPPET_EXCEPTION'
    | 'UNEXPECTED_SCHEMA_EXCEPTION'
    | 'CONNECTOR_VALIDATION_EXCEPTION'
    | 'TIMESCALE_NOT_AVAILABLE'
    | 'MIGRATION_EXCEPTION'
    | 'REQUEST_PROCESSING_INTERRUPTED'
    | 'SECRET_MANAGER_ID_NOT_FOUND'
    | 'GCP_SECRET_MANAGER_OPERATION_ERROR'
    | 'GCP_SECRET_OPERATION_ERROR'
    | 'GIT_OPERATION_ERROR'
    | 'TASK_FAILURE_ERROR'
    | 'INSTANCE_STATS_PROCESS_ERROR'
    | 'INSTANCE_STATS_MIGRATION_ERROR'
    | 'DEPLOYMENT_MIGRATION_ERROR'
    | 'CG_LICENSE_USAGE_ERROR'
    | 'INSTANCE_STATS_AGGREGATION_ERROR'
    | 'UNRESOLVED_EXPRESSIONS_ERROR'
    | 'KRYO_HANDLER_NOT_FOUND_ERROR'
    | 'DELEGATE_ERROR_HANDLER_EXCEPTION'
    | 'UNEXPECTED_TYPE_ERROR'
    | 'EXCEPTION_HANDLER_NOT_FOUND'
    | 'CONNECTOR_NOT_FOUND_EXCEPTION'
    | 'GCP_SERVER_ERROR'
    | 'HTTP_RESPONSE_EXCEPTION'
    | 'SCM_NOT_FOUND_ERROR'
    | 'SCM_CONFLICT_ERROR'
    | 'SCM_CONFLICT_ERROR_V2'
    | 'SCM_UNPROCESSABLE_ENTITY'
    | 'PROCESS_EXECUTION_EXCEPTION'
    | 'SCM_UNAUTHORIZED'
    | 'SCM_BAD_REQUEST'
    | 'SCM_INTERNAL_SERVER_ERROR'
    | 'DATA'
    | 'CONTEXT'
    | 'PR_CREATION_ERROR'
    | 'URL_NOT_REACHABLE'
    | 'URL_NOT_PROVIDED'
    | 'ENGINE_EXPRESSION_EVALUATION_ERROR'
    | 'ENGINE_FUNCTOR_ERROR'
    | 'JIRA_CLIENT_ERROR'
    | 'SCM_NOT_MODIFIED'
    | 'APPROVAL_STEP_NG_ERROR'
    | 'BUCKET_SERVER_ERROR'
    | 'GIT_SYNC_ERROR'
    | 'TEMPLATE_EXCEPTION'
    | 'ENTITY_REFERENCE_EXCEPTION'
    | 'INVALID_INPUT_SET'
    | 'INVALID_OVERLAY_INPUT_SET'
    | 'RESOURCE_ALREADY_EXISTS'
    | 'INVALID_JSON_PAYLOAD'
    | 'POLICY_EVALUATION_FAILURE'
    | 'POLICY_SET_ERROR'
    | 'INVALID_ARTIFACTORY_REGISTRY_REQUEST'
    | 'INVALID_NEXUS_REGISTRY_REQUEST'
    | 'ENTITY_NOT_FOUND'
    | 'INVALID_AZURE_CONTAINER_REGISTRY_REQUEST'
    | 'AZURE_AUTHENTICATION_ERROR'
    | 'AZURE_CONFIG_ERROR'
    | 'DATA_PROCESSING_ERROR'
    | 'INVALID_AZURE_AKS_REQUEST'
    | 'AWS_IAM_ERROR'
    | 'AWS_CF_ERROR'
    | 'AWS_INSTANCE_ERROR'
    | 'AWS_VPC_ERROR'
    | 'AWS_TAG_ERROR'
    | 'AWS_ASG_ERROR'
    | 'AWS_LOAD_BALANCER_ERROR'
    | 'SCM_INTERNAL_SERVER_ERROR_V2'
    | 'SCM_UNAUTHORIZED_ERROR_V2'
    | 'TOO_MANY_REQUESTS'
    | 'INVALID_IDENTIFIER_REF'
    | 'SPOTINST_NULL_ERROR'
    | 'SCM_UNEXPECTED_ERROR'
    | 'DUPLICATE_FILE_IMPORT'
    | 'AZURE_APP_SERVICES_TASK_EXCEPTION'
    | 'AZURE_ARM_TASK_EXCEPTION'
    | 'AZURE_BP_TASK_EXCEPTION'
    | 'MEDIA_NOT_SUPPORTED'
    | 'AWS_ECS_ERROR'
    | 'AWS_APPLICATION_AUTO_SCALING'
    | 'AWS_ECS_SERVICE_NOT_ACTIVE'
    | 'AWS_ECS_CLIENT_ERROR'
    | 'AWS_STS_ERROR'
    | 'FREEZE_EXCEPTION'
    | 'DELEGATE_TASK_EXPIRED';
  exception?: Throwable;
  failureTypes?: (
    | 'EXPIRED'
    | 'DELEGATE_PROVISIONING'
    | 'CONNECTIVITY'
    | 'AUTHENTICATION'
    | 'VERIFICATION_FAILURE'
    | 'APPLICATION_ERROR'
    | 'AUTHORIZATION_ERROR'
    | 'TIMEOUT_ERROR'
    | 'POLICY_EVALUATION_FAILURE'
    | 'INPUT_TIMEOUT_FAILURE'
  )[];
  level?: 'INFO' | 'ERROR';
  message?: string;
}

export interface Throwable {
  cause?: Throwable;
  detailMessage?: string;
  localizedMessage?: string;
  message?: string;
  stackTrace?: StackTraceElement[];
  suppressed?: Throwable[];
}

export interface StackTraceElement {
  classLoaderName?: string;
  className?: string;
  fileName?: string;
  lineNumber?: number;
  methodName?: string;
  moduleName?: string;
  moduleVersion?: string;
  nativeMethod?: boolean;
}

export enum StepType {
  StageRuntimeInput = 'StageRuntimeInput', // UI level step, only used in execution view
  HTTP = 'Http',
  SHELLSCRIPT = 'ShellScript',
  GitOpsUpdateReleaseRepo = 'GitOpsUpdateReleaseRepo',
  Command = 'Command',
  CustomApproval = 'CustomApproval',
  Barrier = 'Barrier',
  Queue = 'Queue',
  K8sRollingRollback = 'K8sRollingRollback',
  K8sBlueGreenDeploy = 'K8sBlueGreenDeploy',
  K8sCanaryDeploy = 'K8sCanaryDeploy',
  K8sBGSwapServices = 'K8sBGSwapServices',
  K8sScale = 'K8sScale',
  K8sApply = 'K8sApply',
  K8sCanaryDelete = 'K8sCanaryDelete',
  K8sDelete = 'K8sDelete',
  StepGroup = 'StepGroup',
  DeployServiceEntity = 'DeployServiceEntity',
  DeployService = 'DeployService',
  DeployEnvironment = 'DeployEnvironment',
  DeployEnvironmentEntity = 'DeployEnvironmentEntity',
  DeployInfrastructure = 'DeployInfrastructure',
  DeployInfrastructureEntity = 'DeployInfrastructureEntity',
  KubernetesDirect = 'KubernetesDirect',
  K8sServiceSpec = 'K8sServiceSpec',
  K8sRollingDeploy = 'K8sRollingDeploy',
  CustomVariable = 'CustomVariable',
  ServerlessAwsLambda = 'ServerlessAwsLambda',
  ServerlessGCP = 'ServerlessGCP',
  ServerlessAzure = 'ServerlessAzure',
  Dependency = 'Service',
  Plugin = 'Plugin',
  GitClone = 'GitClone',
  Run = 'Run',
  GCR = 'BuildAndPushGCR',
  ACR = 'BuildAndPushACR',
  PDC = 'Pdc',
  SshWinRmAws = 'SshWinRmAws',
  ECR = 'BuildAndPushECR',
  SaveCacheGCS = 'SaveCacheGCS',
  RestoreCacheGCS = 'RestoreCacheGCS',
  SaveCacheS3 = 'SaveCacheS3',
  RestoreCacheS3 = 'RestoreCacheS3',
  DockerHub = 'BuildAndPushDockerRegistry',
  GCS = 'GCSUpload',
  S3 = 'S3Upload',
  JFrogArtifactory = 'ArtifactoryUpload',
  RunTests = 'RunTests',
  HelmDeploy = 'HelmDeploy',
  HelmRollback = 'HelmRollback',
  HarnessApproval = 'HarnessApproval',
  JiraApproval = 'JiraApproval',
  ServiceNowApproval = 'ServiceNowApproval',
  ServiceNowCreate = 'ServiceNowCreate',
  ServiceNowUpdate = 'ServiceNowUpdate',
  Verify = 'Verify',
  JiraCreate = 'JiraCreate',
  JiraUpdate = 'JiraUpdate',
  TerraformRollback = 'TerraformRollback',
  TerraformDestroy = 'TerraformDestroy',
  TerraformPlan = 'TerraformPlan',
  TerraformApply = 'TerraformApply',
  InfraProvisioning = 'InfraProvisioning',
  KubernetesGcp = 'KubernetesGcp',
  ResourceConstraint = 'ResourceConstraint',
  FlagConfiguration = 'FlagConfiguration',
  Template = 'Template',
  Policy = 'Policy',
  ZeroNorth = 'Security',
  KubernetesAzure = 'KubernetesAzure',
  SshWinRmAzure = 'SshWinRmAzure',
  AzureWebApp = 'AzureWebApp',
  AzureWebAppServiceSpec = 'AzureWebAppServiceSpec',
  ServerlessAwsLambdaDeploy = 'ServerlessAwsLambdaDeploy',
  ServerlessAwsLambdaRollback = 'ServerlessAwsLambdaRollback',
  ServerlessAwsInfra = 'ServerlessAwsInfra',
  CloudFormationRollbackStack = 'RollbackStack',
  CloudFormationDeleteStack = 'DeleteStack',
  CloudFormationCreateStack = 'CreateStack',
  SshServiceSpec = 'SshServiceSpec',
  WinRmServiceSpec = 'WinRmServiceSpec',
  CreatePR = 'CreatePR',
  MergePR = 'MergePR',
  AzureWebAppsRollback = 'AzureWebAppRollback',
  AzureSlotDeployment = 'AzureSlotDeployment',
  JenkinsBuild = 'JenkinsBuild',
  AzureTrafficShift = 'AzureTrafficShift',
  AzureSwapSlot = 'AzureSwapSlot',
  EcsInfra = 'EcsInfra',
  EcsService = 'EcsService',
  EcsRollingDeploy = 'EcsRollingDeploy',
  EcsRollingRollback = 'EcsRollingRollback',
  EcsCanaryDeploy = 'EcsCanaryDeploy',
  EcsCanaryDelete = 'EcsCanaryDelete',
  AzureArmRollback = 'AzureARMRollback',
  Background = 'Background',
  AzureBlueprint = 'AzureCreateBPResource',
  EcsBlueGreenCreateService = 'EcsBlueGreenCreateService',
  EcsBlueGreenSwapTargetGroups = 'EcsBlueGreenSwapTargetGroups',
  EcsBlueGreenRollback = 'EcsBlueGreenRollback',
  CreateAzureARMResource = 'AzureCreateARMResource',
  CustomDeploymentServiceSpec = 'CustomDeploymentServiceSpec',
  CustomDeployment = 'CustomDeployment',
  FetchInstanceScript = 'FetchInstanceScript',
  Wait = 'Wait',
  ShellScriptProvision = 'ShellScriptProvision',
}

export const cloudFormationSteps: StepType[] = [
  StepType.CloudFormationCreateStack,
  StepType.CloudFormationDeleteStack,
  StepType.CloudFormationRollbackStack,
];

export const StepTypeIconsMap: { [key in NodeType]: IconName } = {
  SERVICE: 'services',
  SERVICE_CONFIG: 'services',
  SERVICE_SECTION: 'services',
  SERVICE_V3: 'services',
  GENERIC_SECTION: 'step-group',
  NG_SECTION_WITH_ROLLBACK_INFO: 'step-group',
  NG_SECTION: 'step-group',
  NG_EXECUTION: 'step-group',
  ROLLBACK_OPTIONAL_CHILD_CHAIN: 'step-group',
  INFRASTRUCTURE_SECTION: 'step-group',
  STEP_GROUP: 'step-group',
  INFRASTRUCTURE: 'infrastructure',
  INFRASTRUCTURE_V2: 'infrastructure',
  INFRASTRUCTURE_TASKSTEP_V2: 'infrastructure',
  NG_FORK: 'fork',
  DEPLOYMENT_STAGE_STEP: 'circle',
  APPROVAL_STAGE: 'approval-stage-icon',
  StepGroupNode: 'step-group',
  'GITOPS CLUSTERS': 'gitops-clusters',
  STRATEGY: 'step-group',
  RUNTIME_INPUT: 'runtime-input',
};

declare type HarnessIconName =
  | 'Account'
  | 'CustomDeployment'
  | 'Edit'
  | 'Inline'
  | 'Options'
  | 'Stroke'
  | 'access-control'
  | 'accordion-collapsed'
  | 'accordion-expanded'
  | 'activity'
  | 'add-stage'
  | 'adminRole'
  | 'advanced'
  | 'api-docs'
  | 'app-aws-code-deploy'
  | 'app-aws-lambda'
  | 'app-kubernetes'
  | 'approval-stage-icon'
  | 'approval-stage'
  | 'approval-step'
  | 'argo'
  | 'arm'
  | 'arrow'
  | 'audit-log-created'
  | 'audit-trail'
  | 'autostopping'
  | 'aws-codecommit'
  | 'aws-ectwo-service'
  | 'aws-kms'
  | 'aws-rds'
  | 'aws-secret-manager'
  | 'azure-arm-rollback'
  | 'azure-arm'
  | 'azure-blob'
  | 'azure-blueprints'
  | 'azure-container-registry'
  | 'azure-key-vault'
  | 'azure-kubernetes-service'
  | 'azure-vm'
  | 'azurewebapp'
  | 'background-step'
  | 'banned'
  | 'bar-chart'
  | 'barrier-close'
  | 'barrier-open-with-links'
  | 'barrier-open'
  | 'baseline-target'
  | 'basic-deployment'
  | 'bin-main'
  | 'bitbucket-blue'
  | 'bitbucket-new'
  | 'bitbucket-selected'
  | 'bitbucket-unselected'
  | 'bitbucket'
  | 'blank-canvas-card-icon'
  | 'blank-canvas-header-icon'
  | 'blue-black-cluster'
  | 'blue-green'
  | 'bluegreen-inverse'
  | 'bluegreen'
  | 'budget-alert-light'
  | 'build-stage'
  | 'canary-delete-inverse'
  | 'canary-delete'
  | 'canary-grey'
  | 'canary-icon'
  | 'canary-inverse'
  | 'canary-outline'
  | 'canary'
  | 'canvas-position'
  | 'canvas-reset'
  | 'canvas-selector'
  | 'ccm-sketch'
  | 'ccm-solid'
  | 'ccm-with-dark-text'
  | 'ccm-with-text'
  | 'cd-hover'
  | 'cd-main-inverse'
  | 'cd-main'
  | 'cd-sketch'
  | 'cd-solid'
  | 'cd-with-dark-text'
  | 'cd-with-text'
  | 'cd'
  | 'ce-application'
  | 'ce-beta'
  | 'ce-budget_colored'
  | 'ce-budget_grey'
  | 'ce-cloud'
  | 'ce-cluster'
  | 'ce-hover'
  | 'ce-main-colored'
  | 'ce-main-grey'
  | 'ce-main-inverse'
  | 'ce-main'
  | 'ce-optimization'
  | 'ce-visibility'
  | 'cf-hover'
  | 'cf-main-inverse'
  | 'cf-main'
  | 'chained-pipeline-hover'
  | 'chained-pipeline'
  | 'change-log'
  | 'chaos-cube'
  | 'chaos-experiment-weight'
  | 'chaos-hubs'
  | 'chaos-litmuschaos'
  | 'chaos-main'
  | 'chaos-scenario-builder-faded'
  | 'chaos-scenario-builder'
  | 'chat'
  | 'check-alt'
  | 'check'
  | 'ci-active-build'
  | 'ci-build-pipeline'
  | 'ci-dev-exp'
  | 'ci-execution'
  | 'ci-gov'
  | 'ci-hover'
  | 'ci-infra-support'
  | 'ci-infra'
  | 'ci-integrated'
  | 'ci-language'
  | 'ci-main-inverse'
  | 'ci-main'
  | 'ci-parameterization'
  | 'ci-pending-build'
  | 'ci-sketch'
  | 'ci-solid-current-color'
  | 'ci-solid'
  | 'ci-ti'
  | 'ci-try-pipeline'
  | 'ci-with-dark-text'
  | 'ci-with-text'
  | 'circle-cross'
  | 'circle-stop'
  | 'clipboard-alt'
  | 'cloud-accounts'
  | 'cloud-dark'
  | 'cloud-formation-create'
  | 'cloud-formation-delete'
  | 'cloud-formation-rollback'
  | 'cloud-light'
  | 'cloud-sso'
  | 'cloudformation'
  | 'codebase-invalid'
  | 'codebase-not-configured'
  | 'codebase-valid'
  | 'codebase-validating'
  | 'codebase-zero-state'
  | 'command-approval'
  | 'command-artifact-check'
  | 'command-barrier'
  | 'command-calendar'
  | 'command-echo'
  | 'command-email'
  | 'command-http'
  | 'command-icon'
  | 'command-install'
  | 'command-resource-constraint'
  | 'command-rollback'
  | 'command-shell-script'
  | 'command-start'
  | 'command-stop'
  | 'command-swap'
  | 'command-switch'
  | 'command-winrm'
  | 'compare-version'
  | 'conditional-execution'
  | 'conditional-skip-filled'
  | 'conditional-skip-new'
  | 'conditional-skip'
  | 'conditional-when'
  | 'config-change'
  | 'config-file'
  | 'configure'
  | 'connectivity-mode'
  | 'connectors-blue'
  | 'connectors-icon'
  | 'connectthroughdelegate'
  | 'connectthroughmanager'
  | 'contact-support'
  | 'copy-alt'
  | 'copy-doc'
  | 'copy'
  | 'cost-data-collection'
  | 'coverage-status-error'
  | 'coverage-status-success'
  | 'create-pr'
  | 'create-via-existing-yaml'
  | 'create-via-pipeline-template'
  | 'create-via-starter-pipeline'
  | 'cs-hover'
  | 'custom-approval'
  | 'custom-artifact'
  | 'custom-remote-manifest'
  | 'custom-service'
  | 'custom-sm'
  | 'custom-stage-icon'
  | 'custom-stage'
  | 'customRole'
  | 'customize'
  | 'cv-hover'
  | 'cv-main-inverse'
  | 'cv-main'
  | 'cv-sketch'
  | 'cv-solid-current-color'
  | 'cv-solid'
  | 'cv-with-text'
  | 'danger-icon'
  | 'dashboard-selected'
  | 'dashboard'
  | 'data-fetch-error'
  | 'default-dashboard'
  | 'delegates-blue'
  | 'delegates-icon'
  | 'dependency-default-icon'
  | 'dependency-step'
  | 'deploy-stage'
  | 'deployment-aborted-legacy'
  | 'deployment-aborted-new'
  | 'deployment-failed-legacy'
  | 'deployment-failed-new'
  | 'deployment-incomplete-legacy'
  | 'deployment-incomplete-new'
  | 'deployment-inprogress-legacy'
  | 'deployment-inprogress-new'
  | 'deployment-paused-legacy'
  | 'deployment-paused-new'
  | 'deployment-queued-legacy'
  | 'deployment-queued-new'
  | 'deployment-rejected-legacy'
  | 'deployment-rejected-new'
  | 'deployment-success-legacy'
  | 'deployment-success-new'
  | 'deployment-timeout-legacy'
  | 'deployment-timeout-new'
  | 'description'
  | 'digital-ocean'
  | 'docker-hub-step'
  | 'docker-step-inverse'
  | 'docker-step'
  | 'docs'
  | 'dotnet'
  | 'down'
  | 'ecr-step-inverse'
  | 'ecr-step'
  | 'elastic-kubernetes-service'
  | 'elk'
  | 'email-inline'
  | 'email-step'
  | 'entity'
  | 'environment-group-outline'
  | 'environment-group'
  | 'environment'
  | 'environments-outline'
  | 'environments'
  | 'error-outline'
  | 'error-tracking'
  | 'error-transparent-no-outline'
  | 'evaluate-policy'
  | 'execution-abort'
  | 'execution-history'
  | 'execution-input'
  | 'execution-rollback'
  | 'execution-success'
  | 'execution-warning'
  | 'execution'
  | 'expired'
  | 'expression-input'
  | 'failure-strategy'
  | 'fat-arrow-up'
  | 'feature-flag-stage'
  | 'feedback-given'
  | 'ff-sketch'
  | 'ff-solid'
  | 'ff-with-dark-text'
  | 'ff-with-text'
  | 'file'
  | 'filestore'
  | 'fixed-input'
  | 'flag-tick'
  | 'flag'
  | 'flash'
  | 'folder-upload'
  | 'full-screen-exit'
  | 'full-screen'
  | 'functions'
  | 'gcp-engine'
  | 'gcp-kms'
  | 'gcp-secret-manager'
  | 'gcp'
  | 'gcr-step-inverse'
  | 'gcr-step'
  | 'gcs-step-inverse'
  | 'gcs-step'
  | 'gear'
  | 'git-branch-existing'
  | 'git-clone-step'
  | 'git-configure'
  | 'git-landing-page'
  | 'git-new-branch'
  | 'git-popover'
  | 'github-selected'
  | 'github-unselected'
  | 'github'
  | 'gitlab-selected'
  | 'gitlab-unselected'
  | 'gitlab'
  | 'gitops-agent-blue'
  | 'gitops-agent'
  | 'gitops-agents-blue-circle'
  | 'gitops-application-white'
  | 'gitops-application'
  | 'gitops-applications-blue-circle'
  | 'gitops-blue-circle'
  | 'gitops-blue'
  | 'gitops-clusters-blue-circle'
  | 'gitops-clusters-blue'
  | 'gitops-clusters'
  | 'gitops-gnupg-key-blue-circle'
  | 'gitops-gnupg-key-blue'
  | 'gitops-green'
  | 'gitops-missing'
  | 'gitops-no'
  | 'gitops-repo-cert-blue'
  | 'gitops-repository-blue-circle'
  | 'gitops-repository-blue'
  | 'gitops-repository-certificates-blue-circle'
  | 'gitops-suspended'
  | 'gitops-unknown'
  | 'gitops-yes'
  | 'golang'
  | 'google-kubernetes-engine'
  | 'google'
  | 'governance-policy-set'
  | 'governance-shield'
  | 'governance'
  | 'graph'
  | 'grey-cluster'
  | 'grid'
  | 'harness-logo-black'
  | 'harness-logo-white-bg-blue'
  | 'harness-logo-white'
  | 'harness-with-color'
  | 'harness'
  | 'hashiCorpVault'
  | 'health'
  | 'helm-oci'
  | 'helm-rollback'
  | 'help'
  | 'hourglass'
  | 'http-step'
  | 'infinityTrend'
  | 'info-message'
  | 'info-messaging'
  | 'info'
  | 'infrastructure'
  | 'initialize-step-inverse'
  | 'initialize-step'
  | 'insight-view'
  | 'integration'
  | 'java'
  | 'jira-approve-inverse'
  | 'jira-approve'
  | 'jira-create-inverse'
  | 'jira-create'
  | 'jira-update-inverse'
  | 'jira-update'
  | 'key-main'
  | 'key'
  | 'kustamize'
  | 'kustomizeparam'
  | 'launch'
  | 'layout-bottom'
  | 'layout-float'
  | 'layout-right'
  | 'library'
  | 'line-chart'
  | 'linkedin'
  | 'list-entity-infographic'
  | 'list-view'
  | 'loading'
  | 'looping'
  | 'main-abort'
  | 'main-account-notifications'
  | 'main-add'
  | 'main-applications'
  | 'main-apply'
  | 'main-baseline'
  | 'main-calendar'
  | 'main-canary'
  | 'main-caret-down'
  | 'main-caret-left'
  | 'main-caret-right'
  | 'main-caret-up'
  | 'main-changelog'
  | 'main-chevron-down'
  | 'main-chevron-left'
  | 'main-chevron-right'
  | 'main-chevron-up'
  | 'main-clone'
  | 'main-close'
  | 'main-cloud-providers'
  | 'main-cloud'
  | 'main-code-yaml'
  | 'main-dashboard'
  | 'main-delegates'
  | 'main-delete'
  | 'main-depricate'
  | 'main-destroy'
  | 'main-download'
  | 'main-email'
  | 'main-environments'
  | 'main-feedback'
  | 'main-filter'
  | 'main-flag'
  | 'main-folder-new'
  | 'main-folder-open'
  | 'main-folder'
  | 'main-fullscreen'
  | 'main-help'
  | 'main-info'
  | 'main-infrastructure-provisioners'
  | 'main-issue-filled'
  | 'main-issue'
  | 'main-like'
  | 'main-link'
  | 'main-list'
  | 'main-listener-update'
  | 'main-lock'
  | 'main-main-zoom_in'
  | 'main-maximize'
  | 'main-minimize'
  | 'main-more'
  | 'main-move'
  | 'main-notes'
  | 'main-notifications'
  | 'main-pause'
  | 'main-pin'
  | 'main-pipelines'
  | 'main-popularity'
  | 'main-refresh'
  | 'main-reorder'
  | 'main-rerun'
  | 'main-resume'
  | 'main-rollback'
  | 'main-saved'
  | 'main-scope'
  | 'main-search'
  | 'main-service-ami'
  | 'main-services'
  | 'main-setup'
  | 'main-share'
  | 'main-sort'
  | 'main-start'
  | 'main-tags'
  | 'main-template-library'
  | 'main-thumbsdown'
  | 'main-thumbsup'
  | 'main-tick'
  | 'main-trash'
  | 'main-unlock'
  | 'main-unpin'
  | 'main-upload'
  | 'main-user-groups'
  | 'main-user'
  | 'main-view'
  | 'main-workflows'
  | 'main-zoom-out'
  | 'memberRole'
  | 'merge-pr'
  | 'microsoft-azure'
  | 'money-icon'
  | 'multi-service'
  | 'nav-account-admin-hover'
  | 'nav-account-admin-selected'
  | 'nav-account-admin'
  | 'nav-cd-hover'
  | 'nav-cd-selected'
  | 'nav-cd'
  | 'nav-cf'
  | 'nav-cv-hover'
  | 'nav-cv-selected'
  | 'nav-cv'
  | 'nav-dashboard-hover'
  | 'nav-dashboard-selected'
  | 'nav-dashboard'
  | 'nav-deployments-hover'
  | 'nav-deployments-selected'
  | 'nav-deployments'
  | 'nav-git-sync'
  | 'nav-governance-hover'
  | 'nav-governance-selected'
  | 'nav-governance'
  | 'nav-harness-hover'
  | 'nav-harness-selected'
  | 'nav-harness'
  | 'nav-help'
  | 'nav-infrastructure-hover'
  | 'nav-infrastructure-selected'
  | 'nav-organization'
  | 'nav-pipelines-selected'
  | 'nav-pipelines'
  | 'nav-project'
  | 'nav-resources-hover'
  | 'nav-resources-selected'
  | 'nav-resources'
  | 'nav-settings'
  | 'nav-user-profile-hover'
  | 'nav-user-profile-selected'
  | 'nav-user-profile'
  | 'network'
  | 'new-artifact'
  | 'new-decoration'
  | 'new-notification'
  | 'ng-filter'
  | 'no-deployments'
  | 'no-feedback-given'
  | 'no-instances'
  | 'nodejs'
  | 'not-synced'
  | 'notification'
  | 'offline-outline'
  | 'onprem-dark'
  | 'onprem-light'
  | 'openshift-params'
  | 'openshift'
  | 'other-workload'
  | 'pdc-inverse'
  | 'pdc'
  | 'pending'
  | 'pipeline-advanced'
  | 'pipeline-approval'
  | 'pipeline-build-select'
  | 'pipeline-build'
  | 'pipeline-custom'
  | 'pipeline-deploy'
  | 'pipeline-deployment'
  | 'pipeline-executor'
  | 'pipeline-ng'
  | 'pipeline-stage-selection-caret'
  | 'pipeline-variables'
  | 'pipeline'
  | 'placeholder-hover'
  | 'placeholder-selected'
  | 'placeholder'
  | 'play-circle'
  | 'play-outline'
  | 'plugin-step'
  | 'pod'
  | 'polygon'
  | 'profile'
  | 'projects-wizard'
  | 'prune-skipped'
  | 'pruned'
  | 'publish-step'
  | 'python'
  | 'question'
  | 'queue-step'
  | 'queued'
  | 'remote-setup'
  | 'remote'
  | 'remotefile'
  | 'remove-minus'
  | 'remove'
  | 'report-gear-grey'
  | 'report-gear'
  | 'report-icon'
  | 'repository'
  | 'res-connectors'
  | 'res-delegates'
  | 'res-environments'
  | 'res-resourceGroups'
  | 'res-roles'
  | 'res-secrets'
  | 'res-userGroups'
  | 'res-users'
  | 'reset-icon'
  | 'resource-center-community-icon'
  | 'resource-center-docs-icon'
  | 'resources-icon'
  | 'restore-cache-gcs-step-inverse'
  | 'restore-cache-gcs-step'
  | 'restore-cache-gcs'
  | 'restore-cache-s3-step-inverse'
  | 'restore-cache-s3-step'
  | 'restore-cache-s3'
  | 'restore-cache-step'
  | 'right-bar-notification'
  | 'rollback-execution'
  | 'rolling-inverse'
  | 'rolling-update'
  | 'rolling'
  | 'run-pipeline'
  | 'run-step'
  | 'run-tests-step'
  | 'runtime-input'
  | 's3-step-inverse'
  | 's3-step'
  | 'save-cache-gcs-step-inverse'
  | 'save-cache-gcs-step'
  | 'save-cache-gcs'
  | 'save-cache-s3-step-inverse'
  | 'save-cache-s3-step'
  | 'save-cache-s3'
  | 'save-cache-step'
  | 'scm'
  | 'script'
  | 'search-applications'
  | 'search-connectors'
  | 'search-environments'
  | 'search-infra-prov'
  | 'search-list'
  | 'search-pipelines'
  | 'search-services'
  | 'search-tips'
  | 'search-triggers'
  | 'search-user-groups'
  | 'search-users'
  | 'search-workflow'
  | 'secret-manager'
  | 'secret-ssh'
  | 'secrets-blue'
  | 'secrets-icon'
  | 'security-stage'
  | 'send-data'
  | 'serverless-deploy-step'
  | 'service-amazon-ecs'
  | 'service-appdynamics'
  | 'service-artifactory-inverse'
  | 'service-artifactory'
  | 'service-aws-code-deploy'
  | 'service-aws-lamda'
  | 'service-aws-sam'
  | 'service-aws'
  | 'service-azdevops'
  | 'service-azure-functions'
  | 'service-azure'
  | 'service-bamboo'
  | 'service-bugsnag'
  | 'service-circleci'
  | 'service-cloudformation'
  | 'service-cloudwatch'
  | 'service-custom-connector'
  | 'service-datadog'
  | 'service-deployment'
  | 'service-dockerhub'
  | 'service-dynatrace'
  | 'service-ecs'
  | 'service-elastigroup'
  | 'service-elk'
  | 'service-gar'
  | 'service-gcp-with-text'
  | 'service-gcp'
  | 'service-github-package'
  | 'service-github'
  | 'service-gotlab'
  | 'service-helm'
  | 'service-instana'
  | 'service-jenkins-inverse'
  | 'service-jenkins'
  | 'service-jira-inverse'
  | 'service-jira'
  | 'service-kubernetes'
  | 'service-microsoft-teams'
  | 'service-mongodb'
  | 'service-msteams'
  | 'service-mydatacenter'
  | 'service-newrelic'
  | 'service-nexus'
  | 'service-ogz'
  | 'service-okta'
  | 'service-onelogin'
  | 'service-pagerduty'
  | 'service-pivotal'
  | 'service-prometheus'
  | 'service-redis'
  | 'service-serverless-aws'
  | 'service-serverless-azure'
  | 'service-serverless-gcp'
  | 'service-serverless'
  | 'service-service-s3'
  | 'service-servicenow-inverse'
  | 'service-servicenow'
  | 'service-slack'
  | 'service-splunk-with-name'
  | 'service-splunk'
  | 'service-spotinst'
  | 'service-stackdriver'
  | 'service-sumologic'
  | 'service-terraform'
  | 'service-vm'
  | 'service'
  | 'servicenow-approve-inverse'
  | 'servicenow-approve'
  | 'servicenow-create-inverse'
  | 'servicenow-create'
  | 'servicenow-update-inverse'
  | 'servicenow-update'
  | 'services'
  | 'setup-api'
  | 'setup-tags'
  | 'shield-gears'
  | 'skipped'
  | 'slider-trigger'
  | 'slot-deployment'
  | 'smtp-configuration-blue'
  | 'smtp'
  | 'spinner'
  | 'srm-with-dark-text'
  | 'stars'
  | 'status-pending'
  | 'status-running'
  | 'step-group'
  | 'step-jira'
  | 'step-kubernetes'
  | 'steps-spinner'
  | 'sto-color-filled'
  | 'sto-grey'
  | 'success-tick'
  | 'support-account'
  | 'support-api'
  | 'support-code'
  | 'support-dashboard'
  | 'support-deployment'
  | 'support-gitops'
  | 'support-onprem'
  | 'support-pipeline'
  | 'support-security'
  | 'support-start'
  | 'support-tour'
  | 'support-troubleshoot'
  | 'support-verification'
  | 'support-videos'
  | 'swap-services'
  | 'sync-failed'
  | 'synced'
  | 'syncing'
  | 'template-inputs'
  | 'template-library'
  | 'templates-blue'
  | 'templates-icon'
  | 'terraform-apply-inverse'
  | 'terraform-apply-new'
  | 'terraform-apply'
  | 'terraform-destroy-inverse'
  | 'terraform-destroy'
  | 'terraform-plan-inverse'
  | 'terraform-plan'
  | 'terraform-rollback-inverse'
  | 'terraform-rollback'
  | 'test-connection'
  | 'test-verification'
  | 'text'
  | 'thinner-search'
  | 'timeout'
  | 'tooltip-icon'
  | 'traffic-lights'
  | 'trigger-artifact'
  | 'trigger-execution'
  | 'trigger-github'
  | 'trigger-pipeline'
  | 'trigger-schedule'
  | 'union'
  | 'university'
  | 'up'
  | 'upgrade-bolt'
  | 'upload-box'
  | 'user-groups'
  | 'user'
  | 'utility'
  | 'valuesFIle'
  | 'variable'
  | 'variables-blue'
  | 'view-json'
  | 'viewerRole'
  | 'waiting'
  | 'warning-icon'
  | 'warning-outline'
  | 'white-cluster'
  | 'white-full-cluster'
  | 'x'
  | 'yaml-builder-env'
  | 'yaml-builder-input-sets'
  | 'yaml-builder-notifications'
  | 'yaml-builder-stages'
  | 'yaml-builder-steps'
  | 'yaml-builder-trigger'
  | 'zoom-in'
  | 'zoom-out';

export interface StepData {
  name: string;
  icon: IconName;
  type: string;
  visible?: boolean;
  referenceId?: string;
}

export interface CompletionItemInterface {
  label: string;
  kind: CompletionItemKind;
  insertText: string;
}

export declare namespace CompletionItemKind {
  const Text: 1;
  const Method: 2;
  const Function: 3;
  const Constructor: 4;
  const Field: 5;
  const Variable: 6;
  const Class: 7;
  const Interface: 8;
  const Module: 9;
  const Property: 10;
  const Unit: 11;
  const Value: 12;
  const Enum: 13;
  const Keyword: 14;
  const Snippet: 15;
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const Color: 16;
  const File: 17;
  const Reference: 18;
  const Folder: 19;
  const EnumMember: 20;
  const Constant: 21;
  const Struct: 22;
  const Event: 23;
  const Operator: 24;
  const TypeParameter: 25;
}
// eslint-disable-next-line @typescript-eslint/no-redeclare
export declare type CompletionItemKind =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25;

export abstract class AbstractStepFactory {
  /**
   * Couples the factory with the steps it generates
   */
  protected abstract type: string;

  protected stepBank: Map<string, Step<unknown>>;
  protected stepIconMap: Map<string, StepData>;
  protected invocationMap: Map<
    RegExp,
    (
      path: string,
      yaml: string,
      params: Record<string, unknown>,
    ) => Promise<CompletionItemInterface[]>
  > = new Map();

  constructor() {
    this.stepBank = new Map();
    this.stepIconMap = new Map();
  }

  getType(): string {
    return this.type;
  }

  registerStep<T>(step: Step<T>): void {
    this.stepBank.set(step.getType(), step as Step<unknown>);
    this.stepIconMap.set(step.getType(), {
      name: step.getStepName(),
      icon: step.getIconName(),
      type: step.getType(),
      visible: step.getStepPaletteVisibility(),
      referenceId: step.getReferenceId(),
    });
    const stepMap = step.getInvocationMap();
    if (stepMap) {
      this.invocationMap = new Map([...this.invocationMap, ...stepMap]);
    }
  }

  deregisterStep(type: string): void {
    const deletedStep = this.stepBank.get(type);
    if (deletedStep) {
      this.stepBank.delete(type);
      this.stepIconMap.delete(type);
      if (deletedStep.getInvocationMap()) {
        this.invocationMap = new Map();
        this.stepBank.forEach(step => {
          const stepMap = step.getInvocationMap();
          if (stepMap) {
            this.invocationMap = new Map([...this.invocationMap, ...stepMap]);
          }
        });
      }
    }
  }

  getStep<T>(type?: string): Step<T> | undefined {
    if (type && !isEmpty(type)) {
      return this.stepBank.get(type) as Step<T>;
    }
    // eslint-disable-next-line consistent-return
    return;
  }

  getStepDescription(type: string): keyof StringsMap | undefined {
    return this.stepBank.get(type)?.getDescription();
  }

  getStepAdditionalInfo(type: string): keyof StringsMap | undefined {
    return this.stepBank.get(type)?.getAdditionalInfo();
  }

  getStepName(type: string): string | undefined {
    return this.stepBank.get(type)?.getStepName();
  }

  getStepReferenceId(type: string): string | undefined {
    return this.stepBank.get(type)?.getReferenceId();
  }
  getStepIcon(type: string): IconName {
    return this.stepBank.get(type)?.getIconName() || 'disable';
  }

  getStepIconColor(type: string): string | undefined {
    return this.stepBank.get(type)?.getIconColor() || undefined;
  }

  getStepIconSize(type: string): number | undefined {
    return this.stepBank.get(type)?.getIconSize() || undefined;
  }

  getStepIsHarnessSpecific(type: string): boolean {
    return this.stepBank.get(type)?.getIsHarnessSpecific() || false;
  }

  getIsStepNonDeletable(type: string): boolean | undefined {
    return this.stepBank.get(type)?.getIsNonDeletable();
  }

  getStepData(type: string): StepData | undefined {
    return this.stepIconMap.get(type);
  }

  getInvocationMap(): Map<
    RegExp,
    (
      path: string,
      yaml: string,
      params: Record<string, unknown>,
    ) => Promise<CompletionItemInterface[]>
  > {
    return this.invocationMap;
  }

  getAllStepsDataList(): Array<StepData> {
    return Array.from(this.stepIconMap, ([_key, value]) => value).filter(
      step => step.visible,
    );
  }
}

class PipelineStepFactory extends AbstractStepFactory {
  protected type = 'pipeline-factory';
}

const factory = new PipelineStepFactory();

export abstract class Step<T> {
  protected abstract type: StepType;
  protected abstract defaultValues: T;
  protected referenceId?: string;
  protected abstract stepIcon: IconName;
  protected stepIconColor?: string;
  protected stepIconSize?: number;
  protected abstract stepName: string;
  protected stepDescription: keyof StringsMap | undefined;
  protected stepAdditionalInfo?: keyof StringsMap;
  protected _hasStepVariables = false;
  protected _hasDelegateSelectionVisible = false;
  protected isHarnessSpecific = false;
  protected isStepNonDeletable = false; // If true, the step can not be deleted from pipeline execution tab view
  protected invocationMap?: Map<
    RegExp,
    (
      path: string,
      yaml: string,
      params: Record<string, unknown>,
    ) => Promise<CompletionItemInterface[]>
  >;
  abstract validateInputSet(args: ValidateInputSetProps<T>): FormikErrors<T>;

  protected stepPaletteVisible?: boolean; // default to true

  getType(): string {
    return this.type;
  }

  getDefaultValues(initialValues: T, _stepViewType: StepViewType): T {
    return { ...this.defaultValues, ...initialValues };
  }

  getIsHarnessSpecific(): boolean {
    return this.isHarnessSpecific;
  }

  getIsNonDeletable(): boolean {
    return this.isStepNonDeletable;
  }

  getReferenceId(): string | undefined {
    return this.referenceId;
  }

  getIconName(): IconName {
    return this.stepIcon;
  }

  getIconColor(): string | undefined {
    return this.stepIconColor;
  }

  getIconSize(): number | undefined {
    return this.stepIconSize;
  }

  getDescription(): keyof StringsMap | undefined {
    return this.stepDescription;
  }

  getAdditionalInfo(): keyof StringsMap | undefined {
    return this.stepAdditionalInfo;
  }

  getStepName(): string {
    return this.stepName;
  }

  getInvocationMap():
    | Map<
        RegExp,
        (
          path: string,
          yaml: string,
          params: Record<string, unknown>,
        ) => Promise<CompletionItemInterface[]>
      >
    | undefined {
    return this.invocationMap;
  }

  getStepPaletteVisibility(): boolean {
    return this.stepPaletteVisible ?? true;
  }

  get hasDelegateSelectionVisible(): boolean {
    return this._hasDelegateSelectionVisible;
  }

  get hasStepVariables(): boolean {
    return this._hasStepVariables;
  }

  abstract renderStep(props: StepProps<T>): JSX.Element;
}

export interface StepProps<T, U = unknown> {
  initialValues: T;
  onUpdate?: (data: T) => void;
  onChange?: (data: T) => void;
  isNewStep?: boolean;
  stepViewType?: StepViewType;
  inputSetData?: InputSetData<T>;
  factory: AbstractStepFactory;
  path: string;
  readonly?: boolean;
  formikRef?: StepFormikFowardRef<T>;
  customStepProps?: U;
  allowableTypes: AllowedTypes;
}

export enum StepViewType {
  InputSet = 'InputSet',
  InputVariable = 'InputVariable',
  DeploymentForm = 'DeploymentForm',
  TriggerForm = 'TriggerForm',
  StageVariable = 'StageVariable',
  Edit = 'Edit',
  Template = 'Template',
  TemplateUsage = 'TemplateUsage',
}

export interface InputSetData<T> {
  template?: T;
  allValues?: T;
  path: string;
  readonly?: boolean;
}

export const ExecutionStatusIconMap: Record<ExecutionStatus, IconName> = {
  Success: 'tick-circle',
  Running: 'main-more',
  AsyncWaiting: 'main-more',
  TaskWaiting: 'main-more',
  TimedWaiting: 'main-more',
  Failed: 'circle-cross',
  Errored: 'circle-cross',
  IgnoreFailed: 'tick-circle',
  Expired: 'expired',
  Aborted: 'banned',
  Discontinuing: 'banned',
  Suspended: 'banned',
  Queued: 'queued',
  NotStarted: 'pending',
  Paused: 'pause',
  ResourceWaiting: 'waiting',
  Skipped: 'skipped',
  ApprovalRejected: 'circle-cross',
  InterventionWaiting: 'waiting',
  ApprovalWaiting: 'waiting',
  Pausing: 'pause',
  InputWaiting: 'waiting',
  WaitStepRunning: 'waiting',
};

export type StepFormikRef<T> = Pick<FormikProps<T>, 'submitForm' | 'errors'>;

export type StepFormikFowardRef<T = unknown> =
  | ((instance: StepFormikRef<T> | null) => void)
  | React.MutableRefObject<StepFormikRef<T> | null>
  | null;

export declare type AllowedTypesWithExecutionTime = Exclude<
  MultiTypeInputType,
  MultiTypeInputType.RUNTIME
>;
export declare type AllowedTypesWithRunTime = Exclude<
  MultiTypeInputType,
  MultiTypeInputType.EXECUTION_TIME
>;
export declare type AllowedTypes =
  | AllowedTypesWithExecutionTime[]
  | AllowedTypesWithRunTime[];

export declare enum MultiTypeInputType {
  FIXED = 'FIXED',
  RUNTIME = 'RUNTIME',
  EXECUTION_TIME = 'EXECUTION_TIME',
  EXPRESSION = 'EXPRESSION',
}

export interface ValidateInputSetProps<T> {
  data: T;
  template?: T;
  getString?: UseStringsReturn['getString'];
  viewType: StepViewType;
}

export interface UseStringsReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getString(key: StringKeys, vars?: Record<string, any>): string;
}

export type StringKeys = keyof StringsMap;

export interface UseUpdateQueryParamsReturn<T> {
  updateQueryParams(
    values: T,
    options?: IStringifyOptions,
    replaceHistory?: boolean,
  ): void;
  replaceQueryParams(
    values: T,
    options?: IStringifyOptions,
    replaceHistory?: boolean,
  ): void;
}

export function useUpdateQueryParams<
  T = Record<string, string>,
>(): UseUpdateQueryParamsReturn<T> {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryParams = useQueryParams<T>();

  return {
    updateQueryParams(
      values: T,
      options?: IStringifyOptions,
      replaceHistory?: boolean,
    ): void {
      const path = `${pathname}?${qs.stringify(
        { ...queryParams, ...values },
        options,
      )}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      replaceHistory ? navigate(path, { replace: true }) : navigate(path);
    },
    replaceQueryParams(
      values: T,
      options?: IStringifyOptions,
      replaceHistory?: boolean,
    ): void {
      const path = `${pathname}?${qs.stringify(values, options)}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      replaceHistory ? navigate(path, { replace: true }) : navigate(path);
    },
  };
}

export interface UseQueryParamsOptions<T> extends IParseOptions {
  processQueryParams?(data: any): T;
}

export function useQueryParams<T = unknown>(
  options?: UseQueryParamsOptions<T>,
): T {
  const { search } = useLocation();

  const queryParams = React.useMemo(() => {
    const params = qs.parse(search, { ignoreQueryPrefix: true, ...options });

    if (typeof options?.processQueryParams === 'function') {
      return options.processQueryParams(params);
    }

    return params;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, options, options?.processQueryParams]);

  return queryParams as unknown as T;
}

export interface NGTag {
  key: string;
  value: string;
}

export interface ExecutionTriggerInfo {
  [key: string]: any;
}

export interface EntityGitDetails {
  branch?: string;
  commitId?: string;
  filePath?: string;
  fileUrl?: string;
  objectId?: string;
  repoIdentifier?: string;
  repoName?: string;
  repoUrl?: string;
  rootFolder?: string;
}

export interface GovernanceMetadata {
  [key: string]: any;
}

export interface PipelineExecutionSummary {
  allowStageExecutions?: boolean;
  canRetry?: boolean;
  connectorRef?: string;
  createdAt?: number;
  endTs?: number;
  executionErrorInfo?: ExecutionErrorInfo;
  executionInputConfigured?: boolean;
  executionTriggerInfo?: ExecutionTriggerInfo;
  failedStagesCount?: number;
  failureInfo?: FailureInfoDTO;
  gitDetails?: EntityGitDetails;
  governanceMetadata?: GovernanceMetadata;
  layoutNodeMap?: {
    [key: string]: GraphLayoutNode;
  };
  moduleInfo?: {
    [key: string]: {
      [key: string]: { [key: string]: any };
    };
  };
  modules?: string[];
  name?: string;
  pipelineIdentifier?: string;
  planExecutionId?: string;
  runSequence?: number;
  runningStagesCount?: number;
  showRetryHistory?: boolean;
  stagesExecuted?: string[];
  stagesExecutedNames?: {
    [key: string]: string;
  };
  stagesExecution?: boolean;
  startTs?: number;
  startingNodeId?: string;
  status?:
    | 'Running'
    | 'AsyncWaiting'
    | 'TaskWaiting'
    | 'TimedWaiting'
    | 'Failed'
    | 'Errored'
    | 'IgnoreFailed'
    | 'NotStarted'
    | 'Expired'
    | 'Aborted'
    | 'Discontinuing'
    | 'Queued'
    | 'Paused'
    | 'ResourceWaiting'
    | 'InterventionWaiting'
    | 'ApprovalWaiting'
    | 'WaitStepRunning'
    | 'Success'
    | 'Suspended'
    | 'Skipped'
    | 'Pausing'
    | 'ApprovalRejected'
    | 'InputWaiting'
    | 'NOT_STARTED'
    | 'INTERVENTION_WAITING'
    | 'APPROVAL_WAITING'
    | 'APPROVAL_REJECTED'
    | 'WAITING';
  storeType?: 'INLINE' | 'REMOTE';
  successfulStagesCount?: number;
  tags?: NGTag[];
  totalStagesCount?: number;
}

export interface EdgeLayoutList {
  currentNodeChildren?: string[];
  nextIds?: string[];
}

export interface ExecutionErrorInfo {
  [key: string]: any;
}

export interface GraphLayoutNode {
  barrierFound?: boolean;
  edgeLayoutList?: EdgeLayoutList;
  endTs?: number;
  executionInputConfigured?: boolean;
  failureInfo?: ExecutionErrorInfo;
  failureInfoDTO?: FailureInfoDTO;
  hidden?: boolean;
  module?: string;
  moduleInfo?: {
    [key: string]: {
      [key: string]: { [key: string]: any };
    };
  };
  name?: string;
  nodeExecutionId?: string;
  nodeGroup?: string;
  nodeIdentifier?: string;
  nodeRunInfo?: NodeRunInfo;
  nodeType?: string;
  nodeUuid?: string;
  skipInfo?: SkipInfo;
  startTs?: number;
  status?:
    | 'Running'
    | 'AsyncWaiting'
    | 'TaskWaiting'
    | 'TimedWaiting'
    | 'Failed'
    | 'Errored'
    | 'IgnoreFailed'
    | 'NotStarted'
    | 'Expired'
    | 'Aborted'
    | 'Discontinuing'
    | 'Queued'
    | 'Paused'
    | 'ResourceWaiting'
    | 'InterventionWaiting'
    | 'ApprovalWaiting'
    | 'WaitStepRunning'
    | 'Success'
    | 'Suspended'
    | 'Skipped'
    | 'Pausing'
    | 'ApprovalRejected'
    | 'InputWaiting'
    | 'NOT_STARTED'
    | 'INTERVENTION_WAITING'
    | 'APPROVAL_WAITING'
    | 'APPROVAL_REJECTED'
    | 'WAITING';
  stepDetails?: {
    [key: string]: {
      [key: string]: { [key: string]: any };
    };
  };
  strategyMetadata?: StrategyMetadata;
}

export interface PipelineExecutionDetail {
  executionGraph?: ExecutionGraph;
  pipelineExecutionSummary?: PipelineExecutionSummary;
}

export interface GraphCanvasState {
  offsetX?: number;
  offsetY?: number;
  zoom?: number;
}

export interface ExecutionPageQueryParams {
  view?: 'log' | 'graph';
  stage?: string;
  step?: string;
  retryStep?: string;
  stageExecId?: string; // strategy nodes require stageExecId + stageID
}

export interface ExecutionContextParams {
  pipelineExecutionDetail: PipelineExecutionDetail | null;
  allNodeMap: { [key: string]: ExecutionNode };
  pipelineStagesMap: Map<string, GraphLayoutNode>;
  isPipelineInvalid?: boolean;
  selectedStageId: string;
  selectedStepId: string;
  selectedStageExecutionId: string;
  loading: boolean;
  isDataLoadedForSelectedStage: boolean;
  queryParams: ExecutionPageQueryParams;
  logsToken: string;
  setLogsToken: (token: string) => void;
  refetch?: (() => Promise<void>) | undefined;
  addNewNodeToMap(id: string, node: ExecutionNode): void;
  setStepsGraphCanvasState?: (canvasState: GraphCanvasState) => void;
  stepsGraphCanvasState?: GraphCanvasState;
  setSelectedStepId: (step: string) => void;
  setSelectedStageId: (stage: string) => void;
  setSelectedStageExecutionId: (stage: string) => void;
  setIsPipelineInvalid?: (flag: boolean) => void;
}

export const ExecutionContext = createContext<ExecutionContextParams>({
  pipelineExecutionDetail: null,
  allNodeMap: {},
  pipelineStagesMap: new Map(),
  isPipelineInvalid: false,
  selectedStageId: '',
  selectedStepId: '',
  selectedStageExecutionId: '',
  loading: false,
  isDataLoadedForSelectedStage: false,
  queryParams: {},
  logsToken: '',
  setLogsToken: () => void 0,
  refetch: undefined,
  addNewNodeToMap: () => void 0,
  setStepsGraphCanvasState: () => undefined,
  stepsGraphCanvasState: { offsetX: 0, offsetY: 0, zoom: 100 },
  setSelectedStepId: () => void 0,
  setSelectedStageId: () => void 0,
  setSelectedStageExecutionId: () => void 0,
  setIsPipelineInvalid: () => void 0,
});

export default ExecutionContext;

export function useExecutionContext(): ExecutionContextParams {
  return useContext(ExecutionContext);
}

export interface PopoverProps extends IPopoverProps {
  /** If true, render BPopover in dark background and light font color */
  isDark?: boolean;
  /** Popover target element */
  children?: React.ReactNode;
  /** data-tooltip-id to be attached and used by docs team */
  dataTooltipId?: string;
}
export declare function Popover(props: PopoverProps): React.ReactElement;
