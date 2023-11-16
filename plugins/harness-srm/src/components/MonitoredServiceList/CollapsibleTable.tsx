import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import RenderChangeComponent from '../RenderChangeComponent';
import useSLOList from '../../hooks/useSLOList';
import { CircularProgress, Link } from '@material-ui/core';
import { AsyncStatus } from '../types';
import { EvaluationType, getEvaluationType, getStatusBackgroundColor, getTextColor, objectLength, getRiskColorLogo } from '../../util/SloUtils';
import { DownIcon, UpIcon } from '../Icons';
import { getRiskColorValue, getRiskLabelStringId } from '../../util/MonitoredServiceUtils';

export interface TableData {
    id: string
    name: string,
    identifier: string,
    environmentName: string,
    environmentRef: string,
    serviceName: string,
    serviceRef: string,
    changeSummary: object,
    currentHealthScore: object
    sloHealthIndicators: object
    evaluationType: string
    sloTargetPercentage: string,
    userJourneyName: string,
    burnRate: string,
    errorBudgetRisk: string,
    errorBudgetRemainingPercentage: string,
    errorBudgetRemaining: string,
    sloIdentifier: string
}

const RenderErrorBudgetRemainingPercentage: React.FC<any> = ({ row }) => {
    const { evaluationType = ' ', errorBudgetRemainingPercentage = ' ', errorBudgetRemaining } = row
    const isRequest = evaluationType === EvaluationType.REQUEST;

    return (
        <div style={{ display: 'flex', alignItems: 'center', margin: '0 8px' }} >
            <div>
                <span style={{ font: 'serif' }}>{isRequest ? "NA" : ` ${Number(errorBudgetRemainingPercentage || 0).toFixed(2)}%`}</span>
            </div>
            {!isRequest && <span
                style={{
                    fontSize: '12px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    font: 'serif',
                    padding: '3px',
                    marginLeft: '8px',
                    backgroundColor: '#f3f3fa'
                }}
            >
                {`${errorBudgetRemaining} m`}
            </span>
            }
        </div>
    )
}

const RenderHealthScore = ({ riskStatus, healthScore }: { riskStatus: String, healthScore: Number }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', margin: '0 8px' }} >
            <span
                style={{
                    height: '31px',
                    minWidth: '34px',
                    border: 'none !important',
                    fontSize: 'var(--font-size-small)',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    font: 'serif',
                    padding: '6px',
                    marginRight: '8px',
                    backgroundColor: getRiskColorValue(riskStatus)
                }}
            >
                {healthScore || healthScore === 0 ? healthScore : '-'}
            </span>
            <div>
                {getRiskLabelStringId(riskStatus)}
            </div>
        </div>
    )
}


const RenderSloStatus: React.FC<any> = ({ errorBudgetRisk }) => {
    const IconComponent = getRiskColorLogo(errorBudgetRisk);
    const bgColor = getStatusBackgroundColor(errorBudgetRisk);
    const textColor = getTextColor(errorBudgetRisk);

    return (
        <div style={{ display: 'flex', alignItems: 'center', margin: '0 8px' }}>
            <p style={{ display: 'flex', alignItems: 'center', backgroundColor: bgColor, borderRadius: '5px', padding: '4px 10px', margin: '0px' }}>
                <span style={{ marginTop: '4px' }}>{IconComponent && React.createElement(IconComponent)}</span>
                <span style={{ marginLeft: '4px', color: textColor }}>
                    {errorBudgetRisk}
                </span>
            </p>
        </div>
    );
}


const DropdownRow: React.FC<any> = ({ accountId, orgId, projectId, monitoredServiceId, baseUrl1, backendBaseUrl, env }) => {

    const {
        status: state,
        currTableData,
        flag,
    } = useSLOList({
        accountId,
        orgId,
        projectId,
        monitoredServiceId,
        env: env,
        backendBaseUrl,
    });

    if (
        state === AsyncStatus.Init ||
        state === AsyncStatus.Loading ||
        (state === AsyncStatus.Success && !flag)
    ) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '10px'
            }}>
                <CircularProgress />
            </div>
        );
    }

    const link2 = `${baseUrl1}/ng/account/${accountId}/cv/orgs/${orgId}/projects/${projectId}/slos/`
    return (
        <>
            {
                currTableData.map((row) => (
                    <TableRow key={row.id} >
                        <TableCell component="th" scope="row" >
                            <Link href={link2 + row.sloIdentifier} style={{ textDecoration: 'none' }} target="_blank">
                                {row.name}
                            </Link>

                        </TableCell>
                        <TableCell>{getEvaluationType(row.evaluationType)}</TableCell>
                        <TableCell align="left"><RenderSloStatus errorBudgetRisk={row.errorBudgetRisk} /> </TableCell>
                        <TableCell align="left">
                            <RenderErrorBudgetRemainingPercentage row={row} />
                        </TableCell>
                        <TableCell align="left">
                            {` ${Number((Number(row.sloTargetPercentage) || 0).toFixed(2))}%`}
                        </TableCell>
                        <TableCell align="left">
                            {` ${Number((Number(row.burnRate) || 0).toFixed(2))}%`}
                        </TableCell>
                        <TableCell align="left">
                            {row.userJourneyName !== "undefined" ? row.userJourneyName : ''}
                        </TableCell>
                    </TableRow>
                ))

            }
        </>
    );
}

const Row: React.FC<any> = ({ row, accountId, projectId, orgId, backendBaseUrl, baseUrl1, env }) => {
    const [open, setOpen] = React.useState(false);
    const link = `${baseUrl1}/ng/account/${accountId}/cv/orgs/${orgId}/projects/${projectId}/monitoringservices/edit/${row.identifier}`
    if (objectLength(row.sloHealthIndicators) > 0) {
        return (
            <React.Fragment>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell align="left">
                        <button style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            textAlign: 'inherit'
                        }}
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <span>{React.createElement(UpIcon)}</span> : <span>{React.createElement(DownIcon)}</span>}
                        </button>
                    </TableCell>
                    <TableCell component="th" scope="row" >
                        <>
                            <Link href={link} style={{ textDecoration: 'none' }} target="_blank">
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                                    <div style={{ margin: '4px 0' }}>
                                        <b>{row.serviceRef}</b>
                                    </div>
                                    <div style={{ margin: '4px 0' }}>
                                        {row.environmentRef}
                                    </div>
                                </div>
                            </Link>
                        </>
                    </TableCell>
                    <TableCell align="left">{objectLength(row.sloHealthIndicators)}</TableCell>
                    <TableCell align="left"><RenderChangeComponent row={row} /></TableCell>
                    <TableCell align="left"><RenderHealthScore riskStatus={row.currentHealthScore.riskStatus} healthScore={row.currentHealthScore.healthScore} /></TableCell>
                </TableRow>

                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Typography variant="h6" gutterBottom component="div">
                                    SLOs Configured
                                </Typography>
                                <Table aria-label="purchases" >
                                    <colgroup>
                                        <col style={{ width: '15%' }} />
                                        <col style={{ width: '10%' }} />
                                        <col style={{ width: '15%' }} />
                                        <col style={{ width: '20%' }} />
                                        <col style={{ width: '10%' }} />
                                        <col style={{ width: '15%' }} />
                                        <col style={{ width: '15%' }} />
                                    </colgroup>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>SLO NAME</b></TableCell>
                                            <TableCell><b>EVALUATION</b></TableCell>
                                            <TableCell align="left"><b>STATUS</b></TableCell>
                                            <TableCell align="left"><b>ERROR BUDGET REMAINING</b></TableCell>
                                            <TableCell align="left"><b>TARGET</b></TableCell>
                                            <TableCell align="left"><b>BURN RATE/DAY</b></TableCell>
                                            <TableCell align="left"><b>USER JOURNEY</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <DropdownRow accountId={accountId} projectId={projectId} orgId={orgId} backendBaseUrl={backendBaseUrl} monitoredServiceId={row.identifier} baseUrl1={baseUrl1} env={env} />
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </React.Fragment>
        );
    }
    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell align="left">
                    <button style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        textAlign: 'inherit'
                    }}
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <span>{React.createElement(UpIcon)}</span> : <span>{React.createElement(DownIcon)}</span>}
                    </button>
                </TableCell>

                <TableCell component="th" scope="row">
                    <>
                        <Link href={link} style={{ textDecoration: 'none' }} target="_blank">
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                                <div style={{ margin: '4px 0' }}>
                                    <b>{row.serviceRef}</b>
                                </div>
                                <div style={{ margin: '4px 0' }}>
                                    {row.environmentRef}
                                </div>
                            </div>
                        </Link>
                    </>
                </TableCell>
                <TableCell align="left">{objectLength(row.sloHealthIndicators)}</TableCell>
                <TableCell align="left"><RenderChangeComponent row={row} /></TableCell>
                <TableCell align="left"><RenderHealthScore riskStatus={row.currentHealthScore.riskStatus} healthScore={row.currentHealthScore.healthScore} /></TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }} p={2}>
                            <Typography variant="h6" gutterBottom component="div" >
                                No SLOs have been configured for this Monitored Service
                            </Typography>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );


}


const CollapsibleTable: React.FC<any> = ({
    baseUrl1,
    accountId,
    orgId,
    currProject,
    backendBaseUrl,
    data,
    env
}) => {
    return (
        <TableContainer component={Paper} >
            <Table >
                <colgroup>
                    <col style={{ width: '5%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '35%' }} />
                    <col style={{ width: '20%' }} />
                </colgroup>
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell align="left"><h3>Monitored Service Name</h3></TableCell>
                        <TableCell align="left"><h3>SLO Count</h3></TableCell>
                        <TableCell align="left"><h3>Changes</h3></TableCell>
                        <TableCell align="left"><h3>Health Score</h3></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row: any) => (
                        <Row key={row.id} row={row} accountId={accountId} orgId={orgId} projectId={currProject} backendBaseUrl={backendBaseUrl} baseUrl1={baseUrl1} env={env} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default CollapsibleTable;