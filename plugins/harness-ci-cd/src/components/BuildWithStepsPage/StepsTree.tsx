/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react';
import { defaultTo } from 'lodash-es';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import type { ExecutionNode } from './defs';
import { String } from './String';
import type {
  ExecutionPipelineNode
} from './defs';

import {
  isExecutionRunning,
  isExecutionSuccess,
  ExecutionStatusEnum,
  ExecutionStatus
} from './defs';
import { getStepsTreeStatus } from './defs';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@material-ui/core';
import ExampleLogViewer from '../LogTexts/ExampleLogViewer';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  neutral: {
    position: 'relative',
    '&:after': {
      pointerEvents: 'none',
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      left: 10,
      bottom: 0,
      boxShadow: `inset 4px 0px 0px #78909c`,
    },
  },
  failed: {
    position: 'relative',
    '&:after': {
      pointerEvents: 'none',
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      left: 10,
      bottom: 0,
      boxShadow: `inset 4px 0px 0px ${theme.palette.error.main}`,
    },
  },
  running: {
    position: 'relative',
    '&:after': {
      pointerEvents: 'none',
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      left: 10,
      bottom: 0,
      boxShadow: `inset 4px 0px 0px ${theme.palette.info.main}`,
    },
  },
  success: {
    position: 'relative',
    '&:after': {
      pointerEvents: 'none',
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      left: 10,
      bottom: 0,
      boxShadow: `inset 4px 0px 0px ${theme.palette.success.main}`,
    },
  },
  aborted: {
    position: 'relative',
    '&:after': {
      pointerEvents: 'none',
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      left: 10,
      bottom: 0,
      boxShadow: `inset 4px 0px 0px ${theme.palette.warning.light}`,
    },
  },
}));

const pickClassName = (
  classes: ReturnType<typeof useStyles>,
  status: string,
) => {
  if (status === 'failed') return classes.failed;
  if (status === 'running' || status === 'asyncwaiting' || status === 'taskwaiting') return classes.running;
  if (status === 'success') return classes.success;
  if (status === 'aborted' || status === 'approvalwaiting') return classes.aborted;

  return classes.neutral;
};


export interface StepsTreeProps {
  nodes: Array<ExecutionPipelineNode<ExecutionNode>>
  allNodeMap: Record<string, ExecutionNode>
}

export function StepsTree(props: StepsTreeProps): React.ReactElement {
  const { nodes, allNodeMap } = props

  const commonProps: Omit<StepsTreeProps, 'nodes' | 'isRoot'> = {
    allNodeMap,
  }
  const classes = useStyles();

  return (
    <Grid>
      {nodes.map((step, i) => {
        if (step.item) {
          const status : any = getStepsTreeStatus({ step, allNodeMap }) || step.item.status
          const statusLower = status.toLowerCase()
      
          return (
            <Accordion className={pickClassName(classes, statusLower)} key={step.item.identifier} TransitionProps={{ unmountOnExit: true }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1d-content" id="panel1d-header">
                <div
                  data-status={statusLower}
                >
                  <Typography>
                    <b>{step.item.name}</b>
                  </Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails >
                <Grid container spacing={3} direction="column">
                  <ExampleLogViewer row={step?.item?.data}/>
                </Grid>
              </AccordionDetails>
            </Accordion> 
          )
        }
      
        if (step.group) {
          const status = getStepsTreeStatus({ step, allNodeMap }) || step.group.status
          const statusLower = status.toLowerCase()
      
          return (
            <Accordion className={pickClassName(classes, statusLower)} key={step.group.identifier} TransitionProps={{ unmountOnExit: true }}>
              <AccordionSummary  expandIcon={<ExpandMoreIcon />} aria-controls="panel1d-content" id="panel1d-header">
                <div data-status={statusLower}>
                  <div>
                    {step.group.name ? (
                      <Typography>
                        <b>{step.group.name}</b>
                      </Typography>
                    ) : (
                      <String stringID="stepGroup" />
                    )}
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3} direction="column">
                  <StepsTree nodes={step.group.items} {...commonProps} />
                </Grid>
              </AccordionDetails>
            </Accordion>  
          )
        }
      
        /* istanbul ignore else */
        if (step.parallel) {
          // here assumption is that parallel steps cannot have nested parallel steps
          const isRunning =
            step.parallel.some(pStep => isExecutionRunning(defaultTo(pStep.item?.status, pStep.group?.status))) ||
            step.parallel.some(pStep =>
              isExecutionRunning(
                getStepsTreeStatus({
                  step: pStep,
                  allNodeMap
                }) as ExecutionStatus
              )
            )
          const isSuccess = step.parallel.every(pStep =>
            isExecutionSuccess(defaultTo(pStep.item?.status, pStep.group?.status))
          )
      
          let status = ''
      
          if (isRunning) {
            status = ExecutionStatusEnum.Running
          } else if (isSuccess) {
            status = ExecutionStatusEnum.Success
          } else {
            // find first non success state
            const nonSuccessStep = step.parallel.find(
              pStep => !isExecutionSuccess(defaultTo(pStep.item?.status, pStep.group?.status))
            )
      
            /* istanbul ignore else */
            if (nonSuccessStep) {
              status = defaultTo(defaultTo(nonSuccessStep.item?.status, nonSuccessStep.group?.status), '')
            }
          }

          const statusLower = status.toLowerCase();
          
          return (
            <Accordion key={i} className={pickClassName(classes, statusLower)} TransitionProps={{ unmountOnExit: true }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1d-content" id="panel1d-header">
                <div data-status={status.toLowerCase()}>
                  <div>
                    <Typography><b>parallelSteps</b></Typography>
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3} direction="column">
                  <StepsTree nodes={step.parallel} {...commonProps} />
                </Grid>
              </AccordionDetails>
            </Accordion>
          )
        }
      
        /* istanbul ignore next */
        return null      
      }
      )}
    </Grid>
  )
}


