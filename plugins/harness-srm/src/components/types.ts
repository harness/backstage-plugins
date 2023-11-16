export type MonitoredServiceListItemDTO = {
  changeSummary?: ChangeSummaryDTO;
  currentHealthScore?: RiskData;
  dependentHealthScore?: RiskData[];
  environmentName?: string;
  environmentRef?: string;
  environmentRefList?: string[];
  healthMonitoringEnabled?: boolean;
  historicalTrend?: HistoricalTrend;
  identifier?: string;
  name?: string;
  serviceMonitoringEnabled?: boolean;
  serviceName?: string;
  serviceRef?: string;
  sloHealthIndicators?: SloHealthIndicatorDTO[];
  tags?: {
    [key: string]: string;
  };
  type?: 'Application' | 'Infrastructure';
};

export interface ChangeSummaryDTO {
  categoryCountMap?: {
    [key: string]: CategoryCountDetails;
  };
  total?: CategoryCountDetails;
}

export interface CategoryCountDetails {
  count?: number;
  countInPrecedingWindow?: number;
  percentageChange?: number;
}

export interface RiskData {
  endTime?: number;
  healthScore?: number;
  riskStatus?:
    | 'NO_DATA'
    | 'NO_ANALYSIS'
    | 'HEALTHY'
    | 'OBSERVE'
    | 'NEED_ATTENTION'
    | 'UNHEALTHY'
    | 'CUSTOMER_DEFINED_UNHEALTHY';
  startTime?: number;
  timeRangeParams?: TimeRangeParams;
}

export interface TimeRangeParams {
  endTime?: number;
  startTime?: number;
}

export interface HistoricalTrend {
  healthScores?: RiskData[];
}

export interface SloHealthIndicatorDTO {
  errorBudgetBurnRate?: number;
  errorBudgetRemainingMinutes?: number;
  errorBudgetRemainingPercentage?: number;
  errorBudgetRisk?:
    | 'EXHAUSTED'
    | 'UNHEALTHY'
    | 'NEED_ATTENTION'
    | 'OBSERVE'
    | 'HEALTHY';
  monitoredServiceIdentifier?: string;
  serviceLevelObjectiveIdentifier?: string;
}

export enum AsyncStatus {
  Init,
  Loading,
  Success,
  Error,
  Unauthorized,
}

export type TableProps = {
  monitoredService: MonitoredServiceListItemDTO[];
};

export interface TableData {
  id: string;
  name: string;
  identifier: string;
  environmentName: string;
  environmentRef: string;
  serviceName: string;
  serviceRef: string;
  changeSummary: object;
  currentHealthScore: object;
  sloHealthIndicators: object;
}
