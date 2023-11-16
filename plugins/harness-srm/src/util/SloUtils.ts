import {
  AttentionIcon,
  ExhaustedIcon,
  HeartIcon,
  ObserveIcon,
  UnhealthyIcon,
} from '../components/Icons';

export enum EvaluationType {
  WINDOW = 'Window',
  REQUEST = 'Request',
}

export enum RiskValues {
  NO_DATA = 'NO_DATA',
  NO_ANALYSIS = 'NO_ANALYSIS',
  HEALTHY = 'HEALTHY',
  OBSERVE = 'OBSERVE',
  NEED_ATTENTION = 'NEED_ATTENTION',
  EXHAUSTED = 'EXHAUSTED',
  WARNING = 'WARNING',
  UNHEALTHY = 'UNHEALTHY',
  FAILED = 'FAILED',
  PASSED = 'PASSED',
  CUSTOMER_DEFINED_UNHEALTHY = 'CUSTOMER_DEFINED_UNHEALTHY',
}

export type RiskTypes = keyof typeof RiskValues;
export enum SLOErrorBudget {}

export function getEvaluationType(evaluationType: string) {
  let evaluationLabel = '';
  switch (evaluationType) {
    case EvaluationType.WINDOW:
      evaluationLabel = 'Time Window';
      break;
    case EvaluationType.REQUEST:
      evaluationLabel = 'Request';
      break;
    default:
      break;
  }

  return evaluationLabel;
}

export function getStatusBackgroundColor(riskStatus?: RiskTypes) {
  switch (riskStatus) {
    case RiskValues.HEALTHY:
      return '#e4f7e1';
    case RiskValues.OBSERVE:
      return '#fff9e7';
    case RiskValues.NEED_ATTENTION:
      return '#fff0e6';
    case RiskValues.UNHEALTHY:
      return '#fcedec';
    case RiskValues.EXHAUSTED:
      return '#fcedec';
    default:
      return '#fafbfc';
  }
}

export function getTextColor(riskStatus?: RiskTypes) {
  switch (riskStatus) {
    case RiskValues.HEALTHY:
      return '#299b2c';
    case RiskValues.OBSERVE:
      return '#fcb519';
    case RiskValues.NEED_ATTENTION:
      return '#ff7020';
    case RiskValues.UNHEALTHY:
      return '#b41710';
    case RiskValues.EXHAUSTED:
      return '#b41710';
    default:
      return '#383946';
  }
}

export function objectLength(obj: any) {
  let result = 0;
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      result++;
    }
  }
  return result;
}

export const getRiskColorLogo = (riskStatus?: RiskTypes) => {
  switch (riskStatus) {
    case RiskValues.HEALTHY:
      return HeartIcon;
    case RiskValues.OBSERVE:
      return ObserveIcon;
    case RiskValues.NEED_ATTENTION:
      return AttentionIcon;
    case RiskValues.UNHEALTHY:
      return UnhealthyIcon;
    case RiskValues.EXHAUSTED:
      return ExhaustedIcon;
    default:
      return HeartIcon;
  }
};
