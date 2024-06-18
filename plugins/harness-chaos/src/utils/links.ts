import { InfrastructureType } from '../api/types';

interface CommonProps {
  accountId: string;
  orgId: string;
  projectId: string;
  baseUrl: string;
}

export const getExperimentLink = (props: CommonProps, expId: string) =>
  `${props.baseUrl}/ng/account/${props.accountId}/chaos/orgs/${props.orgId}/projects/${props.projectId}/experiments/${expId}/chaos-studio?tab=BUILDER`;

export const getInfrastructureLink = (
  props: CommonProps,
  infraId?: string,
  environmentId?: string,
  infraType?: InfrastructureType,
) => {
  if (!infraId || !environmentId || !infraType) return '#';
  return `${props.baseUrl}/ng/account/${props.accountId}/chaos/orgs/${
    props.orgId
  }/projects/${
    props.projectId
  }/environments/${environmentId}/${infraType?.toLowerCase()}/${infraId}`;
};
