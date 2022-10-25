import React, { useEffect, useState } from 'react';
import { LogViewer } from '@backstage/core-components';
import type { LogSectionData, LogLineData } from './types'
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from "@backstage/plugin-catalog-react";
import { isExecutionRunningLike, isExecutionWaitingForIntervention } from '../BuildWithStepsPage/defs';


const formatDatetoLocale = (date: number | string): string => {
  return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`
}
function sanitizeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\u00a0/g, ' ')
    .replace(/\u001b/g, '')
    .replace(/[\r\n]/g, '' )
}


function processLogsData(data: string): LogLineData[] {
  return String(data)
    .split('\n')
    .reduce<LogSectionData['data']>((accumulator, line) => {
      /* istanbul ignore else */
      if (line.length > 0) {
        try {
          const { level, time, out } = JSON.parse(line) as Record<string, string>

          accumulator.push({
            text: {
              level: sanitizeHTML(level),
              time: formatDatetoLocale(time),
              out: sanitizeHTML(out)
            }
          })
        } catch (e) {
          //
        }
      }

      return accumulator
    }, [])
}



function ExampleLogViewer(props : any){
  const [log,setLog]=useState("");
  const discoveryApi= useApi(discoveryApiRef);
  const backendBaseUrl=discoveryApi.getBaseUrl('proxy');
  const{ entity } = useEntity();

  let logKeys = '';
  if(props.row.logKeys) {
    logKeys = props.row.logKeys;
  }
  else if(Object.keys(props.row?.executableResponses).length){
    const key = Object.keys(props?.row?.executableResponses?.[0])[0];
    logKeys = props.row?.executableResponses?.[0]?.[key]?.logKeys;
  }
    
  useEffect(() => {
    async function run() {
      const accid = entity?.metadata?.annotations?.['accountIdentifier'];
      const unitStatus = props.row.status;
      const isRunning = isExecutionRunningLike(unitStatus);
      const isIntereventionWaiting = isExecutionWaitingForIntervention(unitStatus);
  
      let dataSource = 'blob';
  
      if(isRunning && !isIntereventionWaiting) {
        dataSource = 'stream';
      }
      
  
      if(logKeys.length) {
        const logTokenResponse = await fetch(`${await backendBaseUrl}/harness/gateway/log-service/token?routingId=${accid}&accountID=${accid}`, {
          headers: {
            'authorization' : 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdXRoVG9rZW4iOiI2MzU3ODgyMGY4Mzg3YTNlYTk2OWU5NTYiLCJpc3MiOiJIYXJuZXNzIEluYyIsImV4cCI6MTY2Njc2NzI2NCwiZW52IjoiZ2F0ZXdheSIsImlhdCI6MTY2NjY4MDgwNH0.pOQ5Yl0Cx20l45jlUJIbG6ayd3hBsB02aFLyu7VtZYQ'
          }
        });
        const logTokenData = await logTokenResponse.text();
        const response = await fetch(`${await backendBaseUrl}/harness/gateway/log-service/${dataSource}?accountID=${accid}&X-Harness-Token=&key=${logKeys}`, {
          headers: {
            'x-harness-token': `${logTokenData}`
          }
        });
        const data = await response.text();
        setLog(data);
      }
    };
    run();
  }, [])
  
  let arr=[];
  arr=processLogsData(log);
  let i=0;
  let finalLog=[];
  while(i<arr.length)
  {
    finalLog.push(arr[i].text.level+"\t"+arr[i].text.time+"\t\t"+arr[i].text.out);
    i++;
  }
  if(!finalLog.length) {
    finalLog.push("No logs found");
  }
  return (
    <div style={{ height: '35vh', width: '100%' }}>
      <LogViewer text={finalLog.join('\n')}/>
    </div>
  )
};

export default ExampleLogViewer;
