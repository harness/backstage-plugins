import React, { useEffect, useState } from 'react';
import { LogViewer } from '@backstage/core-components';
import type { LogSectionData, LogLineData } from './types';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  isExecutionRunningLike,
  isExecutionWaitingForIntervention,
} from '../BuildWithStepsPage/defs';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { PQueue } from './PQueue';

const formatDatetoLocale = (date: number | string): string => {
  return `${new Date(date).toLocaleDateString()} ${new Date(
    date,
  ).toLocaleTimeString()}`;
};
function sanitizeHTML(str: string): string {
  return (
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/\u00a0/g, ' ')
      // eslint-disable-next-line no-control-regex
      .replace(/\u001b/g, '')
      .replace(/[\r\n]/g, '')
  );
}

function processLogsData(data: string): LogLineData[] {
  // console.log(data);
  return String(data)
    .split('\n')
    .reduce<LogSectionData['data']>((accumulator, line) => {
      /* istanbul ignore else */
      if (line.length > 0) {
        try {
          const { level, time, out } = JSON.parse(line) as Record<
            string,
            string
          >;
          accumulator.push({
            text: {
              level: sanitizeHTML(level),
              time: formatDatetoLocale(time),
              out: sanitizeHTML(out),
            },
          });
        } catch (e) {
          //
        }
      }

      return accumulator;
    }, []);
}

function ExampleLogViewer(props: any) {
  const [log, setLog] = useState('');
  const [logToken, setLogToken] = useState('');
  const [logStream, setLogStream] = useState<Array<any>>([]);
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');
  const { entity } = useEntity();
  const eventSource = React.useRef<null | EventSource>(null);
  const timerRef = React.useRef<null | number>(null);
  const requestQueue = React.useRef(new PQueue());

  let logKeys = '';
  if (props.row.logKeys) {
    logKeys = props.row.logKeys;
  } else if (Object.keys(props.row?.executableResponses).length) {
    const key = Object.keys(props?.row?.executableResponses?.[0])[0];
    logKeys = props.row?.executableResponses?.[0]?.[key]?.logKeys;
  }
  const accid =
    entity?.metadata?.annotations?.['harness.io/cicd-accountIdentifier'];
  const unitStatus = props.row.status;
  const isRunning = isExecutionRunningLike(unitStatus);
  const isIntereventionWaiting = isExecutionWaitingForIntervention(unitStatus);
  let dataSource = 'blob';

  if (isRunning && !isIntereventionWaiting) {
    dataSource = 'stream';
  }

  useEffect(() => {
    async function getLogToken() {
      const logTokenResponse = await fetch(
        `${await backendBaseUrl}/harness/gateway/log-service/token?routingId=${accid}&accountID=${accid}`,
        {
          headers: {
            authorization: '{Bearer Token}',
          },
        },
      );
      const logTokenData = await logTokenResponse.text();
      setLogToken(logTokenData);
    }
    getLogToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function run() {
      if (logKeys.length && logToken) {
        const response = await fetch(
          `${await backendBaseUrl}/harness/gateway/log-service/${dataSource}?accountID=${accid}&X-Harness-Token=&key=${logKeys}`,
          {
            headers: {
              'x-harness-token': `${logToken}`,
            },
          },
        );
        const data = await response.text();
        setLog(data);
      }
    }

    if (dataSource === 'blob') run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logToken]);

  const closeStream = React.useCallback(() => {
    eventSource.current?.close();
    eventSource.current = null;
  }, []);

  const startStream = React.useCallback(async () => {
    closeStream();

    const currentEventSource: EventSource = new EventSourcePolyfill(
      `${await backendBaseUrl}/harness/gateway/log-service/${dataSource}?accountID=${accid}&X-Harness-Token=&key=${logKeys}`,
      {
        headers: {
          'x-harness-token': `${logToken}`,
        },
      },
    );

    eventSource.current = currentEventSource;

    currentEventSource.onmessage = (e: MessageEvent) => {
      if (e.type === 'error') {
        currentEventSource.close();
      }

      /* istanbul ignore else */
      if (e.data) {
        const parsedData = processLogsData(e.data)[0].text;
        const parsedString: string = `${parsedData.level}\t${parsedData.time}\t\t${parsedData.out}`;
        setLogStream(data => [...data, parsedString]);
      }
    };

    currentEventSource.onerror = (e: Event) => {
      /* istanbul ignore else */
      if (e.type === 'error') {
        closeStream();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeStream, logToken]);

  useEffect(() => {
    function getStream(): void {
      // if token is not found, schedule the call for later
      // console.log(logToken);
      if (!logToken) {
        timerRef.current = window.setTimeout(() => getStream(), 300);
        return;
      }
      // console.log("started");
      startStream();
    }
    // console.log(dataSource);
    if (dataSource === 'stream') getStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, logToken]);

  React.useEffect(() => {
    const queue = requestQueue.current;

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      queue.cancel();
      closeStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line prefer-const
  let finalLog: string[] = [];

  if (dataSource === 'blob') {
    let arr = [];
    arr = processLogsData(log);
    let i = 0;
    while (i < arr.length) {
      finalLog.push(
        `${arr[i].text.level}\t${arr[i].text.time}\t\t${arr[i].text.out}`,
      );
      i++;
    }
    if (!finalLog.length) {
      finalLog.push('No logs found');
    }
  }
  return (
    <div style={{ height: '35vh', width: '100%' }}>
      <LogViewer
        text={
          dataSource === 'blob' ? finalLog.join('\n') : logStream.join('\n')
        }
      />
    </div>
  );
}

export default ExampleLogViewer;
