/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ReactNode } from 'react';

/**
 * different statues for loading of log data
 */
export type UnitLoadingStatus = 'SUCCESS' | 'FAILURE' | 'RUNNING' | 'NOT_STARTED' | 'LOADING' | 'QUEUED'

/**
 * Actions for reducder
 */
export enum ActionType {
  CreateSections = 'CreateSections',
  FetchSectionData = 'FetchSectionData',
  FetchingSectionData = 'FetchingSectionData',
  UpdateSectionData = 'UpdateSectionData',
  ToggleSection = 'ToggleSection',
  ResetSection = 'ResetSection',
  Search = 'Search',
  ResetSearch = 'ResetSearch',
  GoToNextSearchResult = 'GoToNextSearchResult',
  GoToPrevSearchResult = 'GoToPrevSearchResult'
}

/**
 * Search related metadata
 */
export interface SearchData {
  /**
   * Text being searched for
   */
  text: string
  /**
   * active index for current highlighted search result
   */
  currentIndex: number
  /**
   * List of all the line numbers in which result is found
   */
  linesWithResults: number[]
}

/**
 * Keys in the json from server
 */
export type TextKeys = 'level' | 'out' | 'time'

/**
 *
 */
export interface LogLineData {
  /**
   * Text for the line
   */
  text: Partial<Record<TextKeys, string>>
  /**
   * Indices of the search result with in the current line.
   * This will be a continous list
   *
   * If this values is `[3, 4]`, it means the result number 3 and 4 will be found in this line
   */
  searchIndices?: Partial<Record<TextKeys, number[]>>
}

/**
 * Data for a log unit/section
 */
export interface LogSectionData {
  /**
   * Title to shown on accordion
   */
  title: ReactNode
  /**
   * The log data
   */
  data: LogLineData[]
  /**
   * Start time for the section
   */
  startTime?: number
  /**
   * End time for the section
   */
  endTime?: number
  /**
   * Status of Unit. Used to show icons on the UI.
   * This will only take subset of the statues
   */
  status: UnitLoadingStatus
  /**
   * Flag for accordion open?
   */
  isOpen?: boolean
  /**
   * Data source for the logs
   */
  dataSource: 'blob' | 'stream'
  /**
   * Status of data loading
   */
  unitStatus: UnitLoadingStatus
  /**
   * Flag for if the unit/section has been toggled manually by the user
   */
  manuallyToggled?: boolean
}

export interface State {
  /**
   * List of unit/section names
   */
  units: string[]
  /**
   * List of logKeys which are used in APIs
   * These will have 1:1 mapping with units
   */
  logKeys: string[]
  /**
   * Map of logKeys to its data.
   */
  dataMap: Record<string, LogSectionData>
  /**
   * Current selected step
   */
  selectedStep: string
  /**
   * Current selected stage
   */
  selectedStage: string
  /**
   * Search related data
   */
  searchData: SearchData
}

export interface ProgressMapValue {
  status: UnitLoadingStatus
  startTime?: number
  endTime?: number
}
