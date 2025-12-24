import { DataSource, Resource } from '../../../hooks/useGetResources';

export interface ResourceDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  width?: number;
  resource: Resource | DataSource | null;
  title?: string;
}

export interface AttributeItem {
  key: string;
  value: any;
  driftValue?: any;
  hasDrift: boolean;
}

export interface AttributeListProps {
  attributes: AttributeItem[];
  driftStatus?: string;
  isDeleted: boolean;
  allDeleted: boolean;
}

