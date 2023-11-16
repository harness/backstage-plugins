import { CategoryCountDetails } from '../components/types';
import {
  AlertIcon,
  ChaosIcon,
  DeploymentIcon,
  FFIcon,
  InfraIcon,
} from '../components/Icons';

export interface NumberFormatterOptions {
  truncate?: boolean;
}

export enum ChangeTypes {
  DEPLOYMENT = 'Deployment',
  INFRASTRUCTURE = 'Infrastructure',
  ALERT = 'Alert',
  FEATURE_FLAG = 'FeatureFlag',
  CHAOS_EXPERIMENT = 'ChaosExperiment',
}

enum RiskValues {
  NO_DATA = 'NO_DATA',
  NO_ANALYSIS = 'NO_ANALYSIS',
  HEALTHY = 'HEALTHY',
  OBSERVE = 'OBSERVE',
  NEED_ATTENTION = 'NEED_ATTENTION',
  WARNING = 'WARNING',
  UNHEALTHY = 'UNHEALTHY',
  FAILED = 'FAILED',
  PASSED = 'PASSED',
  CUSTOMER_DEFINED_UNHEALTHY = 'CUSTOMER_DEFINED_UNHEALTHY',
}

export const getRiskColorValue = (
  riskStatus?: String,
  dark = false,
): string => {
  const COLOR_NO_DATA = dark ? '#9293ab' : '#f3f3fa';

  switch (riskStatus) {
    case RiskValues.HEALTHY:
    case RiskValues.PASSED:
      return '#299b2c';
    case RiskValues.OBSERVE:
    case RiskValues.WARNING:
      return '#fcb519';
    case RiskValues.NEED_ATTENTION:
      return '#ff7020';
    case RiskValues.UNHEALTHY:
    case RiskValues.FAILED:
    case RiskValues.CUSTOMER_DEFINED_UNHEALTHY:
      return '#b41710';
    default:
      return COLOR_NO_DATA;
  }
};

export const getFixed = (value: number, places = 1): number => {
  if (value % 1 === 0) {
    return value;
  }
  return parseFloat(value.toFixed(places));
};

export const numberFormatter: (
  value?: number,
  options?: NumberFormatterOptions,
) => string = (value?: number, options = { truncate: true }) => {
  if (value === undefined) {
    return '';
  }
  const truncateOptions = [
    { value: 1000000, suffix: 'm' },
    { value: 1000, suffix: 'k' },
  ];
  if (options.truncate) {
    for (const truncateOption of truncateOptions) {
      if (value >= truncateOption.value) {
        const truncatedValue = value / truncateOption.value;

        if (truncatedValue % 1 !== 0) {
          return `${truncatedValue.toFixed(1)}${truncateOption.suffix}`;
        }
        return `${truncatedValue}${truncateOption.suffix}`;
      }
    }
  }
  return `${getFixed(value)}`;
};

export const DefaultChangePercentage = {
  color: '#0b0b0d',
  percentage: 0,
  icon: 'symbol-triangle-up',
};

export const calculateTotalChangePercentage = (
  changeSummaryTotal?: CategoryCountDetails,
): { color: string; percentage: number; icon: String } => {
  if (changeSummaryTotal?.percentageChange) {
    const { percentageChange } = changeSummaryTotal;
    return {
      color: percentageChange > 0 ? '#4dc952' : '#e43326',
      percentage: Math.abs(percentageChange),
      icon:
        percentageChange > 0 ? 'symbol-triangle-up' : 'symbol-triangle-down',
    };
  }
  return DefaultChangePercentage;
};

export const getChangeIcon = (changeCategory?: ChangeTypes) => {
  switch (changeCategory) {
    case ChangeTypes.DEPLOYMENT:
      return DeploymentIcon;
    case ChangeTypes.INFRASTRUCTURE:
      return InfraIcon;
    case ChangeTypes.ALERT:
      return AlertIcon;
    case ChangeTypes.CHAOS_EXPERIMENT:
      return ChaosIcon;
    case ChangeTypes.FEATURE_FLAG:
      return FFIcon;
    default:
      return DeploymentIcon;
  }
};

export const getChangeTooltipText = (changeCategory?: ChangeTypes) => {
  switch (changeCategory) {
    case ChangeTypes.DEPLOYMENT:
      return 'Deployment';
    case ChangeTypes.INFRASTRUCTURE:
      return 'Infrastructure Change';
    case ChangeTypes.ALERT:
      return 'Incident';
    case ChangeTypes.CHAOS_EXPERIMENT:
      return 'Chaos Event';
    case ChangeTypes.FEATURE_FLAG:
      return 'Feature Flag Change';
    default:
      return 'Change';
  }
};

export const getRiskLabelStringId = (riskStatus?: String) => {
  switch (riskStatus) {
    case RiskValues.NO_DATA:
      return 'No Data';
    case RiskValues.NO_ANALYSIS:
      return 'No Analysis';
    case RiskValues.HEALTHY:
      return 'Healthy';
    case RiskValues.OBSERVE:
      return 'Observe';
    case RiskValues.WARNING:
      return 'Warning';
    case RiskValues.NEED_ATTENTION:
      return 'Need Attention';
    case RiskValues.UNHEALTHY:
      return 'Unhealthy';
    default:
      return 'NA';
  }
};
