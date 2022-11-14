import React, { useEffect, useState } from 'react';
import { Accordion,AccordionDetails, AccordionSummary, Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Breadcrumbs, InfoCard, Link } from '@backstage/core-components';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useEntity } from "@backstage/plugin-catalog-react";
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { processExecutionData, ExecutionNode, GraphLayoutNode, ExecutionPipelineNode, getPipelineStagesMap } from './defs';
import { StepsTree } from './StepsTree';
import LaunchIcon from '@material-ui/icons/Launch';
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
      left: 0,
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
      left: 0,
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
      left: 0,
      bottom: 0,
      boxShadow: `inset 4px 0px 0px ${theme.palette.info.main}`,
    },
  },
  cardContent: {
    backgroundColor: theme.palette.background.default,
  },
  success: {
    position: 'relative',
    '&:after': {
      pointerEvents: 'none',
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
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
      left: 0,
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

interface ExecutionBuildStageProps {
    id: string,
    stage : GraphLayoutNode,
    allNodeMap: { [key: string]: ExecutionNode },
    tree: ExecutionPipelineNode<ExecutionNode>[]
    stageId: string,
}

const IconLink = IconButton as any as typeof Link;


const BuildName = (props : any) => (
  <Box display="flex" alignItems="center">
    <Typography variant="h3">{props.name}</Typography>
    <IconLink target="_blank" href={props.url} to={''}>
      <LaunchIcon />
    </IconLink>
  </Box>
);

export const BuildWithStepsPage = () => {
  const [pipelineData, setPipelineData] = useState();
  const [count, setCount] = useState(0);
  const{ entity } = useEntity();
  const [ExecutionBuildStage, setExecutionBuildStage] = useState<ExecutionBuildStageProps[]>([]);
  const discoveryApi= useApi(discoveryApiRef);
  const backendBaseUrl=discoveryApi.getBaseUrl('proxy');
  const classes = useStyles();
  const [buildUrl, setBuildUrl] = useState('');

  useEffect(() => {
    const projectid = 'harness.io/cicd-projectIdentifier';
    const orgid = 'harness.io/cicd-orgIdentifier';
    const accid = 'harness.io/cicd-accountIdentifier';
    const query = new URLSearchParams({
    routingId: `${entity.metadata.annotations?.[accid]}`,
    accountIdentifier: `${entity.metadata.annotations?.[accid]}`,
    orgIdentifier: `${entity.metadata.annotations?.[orgid]}` ,
    projectIdentifier: `${entity.metadata.annotations?.[projectid]}`,
  }).toString();
  const url = window.location.pathname;
  const planExecutionId = url.split("/").pop();
  async function run()
  {
  const response = await fetch(`${await backendBaseUrl}/harness/gateway/pipeline/api/pipelines/execution/v2/${planExecutionId}?${query}`);
  const data = await response.json();
  setBuildUrl(`https://app.harness.io/ng/#/account/${entity.metadata.annotations?.['harness.io/cicd-accountIdentifier']}/ci/orgs/${entity.metadata.annotations?.['harness.io/cicd-orgIdentifier']}/projects/${entity.metadata.annotations?.['harness.io/cicd-projectIdentifier']}/pipelines/${data.data.pipelineExecutionSummary.pipelineIdentifier}/deployments/${planExecutionId}/pipeline`);
  setPipelineData(data.data.pipelineExecutionSummary);
  };
  run();
  }, []);
  const pipelineSummary : any = pipelineData || {};
  const pipelineStagesMap = React.useMemo(() => {
    return getPipelineStagesMap(
      pipelineSummary.layoutNodeMap,
      pipelineSummary.startingNodeId
    )
  }, [pipelineSummary.layoutNodeMap, pipelineSummary.startingNodeId])
  let builds: Array<string> = [];

  pipelineStagesMap.forEach((_value, key) => {
    builds.push(key);
  });

  let datanode : string = builds[count];
  
  useEffect(() => {
    const projectid = 'harness.io/cicd-projectIdentifier';
    const orgid = 'harness.io/cicd-orgIdentifier';
    const accid = 'harness.io/cicd-accountIdentifier';
    const querynode = new URLSearchParams({
    routingId: `${entity.metadata.annotations?.[accid]}`,
    accountIdentifier: `${entity.metadata.annotations?.[accid]}`,
    orgIdentifier: `${entity.metadata.annotations?.[orgid]}` ,
    projectIdentifier: `${entity.metadata.annotations?.[projectid]}`,
    stageNodeId: `${datanode}`
    }).toString();
  const url = window.location.pathname;
  const planExecutionId = url.split("/").pop();
  async function runnode()
  {
  const response = await fetch(`${await backendBaseUrl}/harness/gateway/pipeline/api/pipelines/execution/v2/${planExecutionId}?${querynode}`);
  const data = await response.json();
  const json2 = data.data.executionGraph.nodeMap || {};
  const tree =  processExecutionData(data?.data?.executionGraph);
  let allNodeMap: { [key: string]: ExecutionNode } = {};
  Object.keys(json2).forEach(function(key) {
    allNodeMap[key] = json2[key];
  });


  if(datanode) {
    const stageObj = {
      id: `${count+1}`,
      stage: pipelineStagesMap.get(datanode) || {},
      allNodeMap: allNodeMap,
      tree: tree,
      stageId: datanode,
    }
    setExecutionBuildStage(prev => [...prev, stageObj]);
  }
};
  runnode();
  if (count < builds.length - 1) {
    setCount(count + 1);
  }
  }, [datanode]);
  ExecutionBuildStage.sort((a, b) => {
    return Number(a.id) - Number(b.id)
  });


  return (
    <>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="..">All builds</Link>
          <Typography>Build details</Typography>
        </Breadcrumbs>
      </Box>
      <InfoCard className={pickClassName(classes, pipelineSummary.status?.toLocaleLowerCase())} title={<BuildName name={pipelineSummary.name} url={buildUrl}/>} cardClassName={classes.cardContent}>
        <Grid container spacing={3} direction="column">
          <Grid item>
          {ExecutionBuildStage.map((stage) => 
            <Accordion className={pickClassName(classes, stage?.stage?.status?.toLowerCase() || '')} key={stage.id} TransitionProps={{ unmountOnExit: true }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1d-content" id="panel1d-header">
              <Typography><b>{stage.stage.name}</b></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3} direction="column">
                  <StepsTree
                    allNodeMap={stage.allNodeMap}
                    nodes={stage.tree}
                  />
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
          </Grid>
        </Grid>
      </InfoCard>
    </>
  );
};




