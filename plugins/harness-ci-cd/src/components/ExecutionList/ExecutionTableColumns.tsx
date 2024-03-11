import React from 'react';
import { Box, Link, Typography } from '@material-ui/core';
// eslint-disable-next-line no-restricted-imports
import { Grid, Tooltip } from '@mui/material';
import { OverflowTooltip } from '@backstage/core-components';

export function PrintCard(props: any) {
  const row = props.props;
  if (row.cdser === '') {
    return (
      <>
        <Box>
          <Grid
            container
            justifyContent="center"
            alignItems="flex-start"
            columns={20}
          >
            {row.branch === 'undefined' &&
            row.sourcebranch === 'undefined' &&
            row.tag === 'undefined' ? null : (
              <>
                <Grid
                  item
                  md={2}
                  alignItems="center"
                  sx={{ paddingTop: '2px' }}
                >
                  <Tooltip title="Continuous Integration" arrow>
                    <svg
                      viewBox="0 0 32 32"
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M29 16a13.02 13.02 0 01-.854 4.6.387.387 0 01-.637.13l-3.99-3.94a.534.534 0 01-.085-.628c.432-.827.649-1.773.649-2.762.056-3.222-2.6-5.878-5.879-5.878-1.04 0-1.994.26-2.823.706a.53.53 0 01-.623-.08l-3.551-3.504a.48.48 0 01.154-.794A12.79 12.79 0 0116 3c7.178 0 13 5.822 13 13zM8.476 5.42a.582.582 0 01.746.072l4.035 4.035c.179.178.194.46.054.67a5.829 5.829 0 00-.985 3.26 5.934 5.934 0 005.935 5.934 5.829 5.829 0 003.26-.985.531.531 0 01.67.054l4.367 4.368a.582.582 0 01.065.756C24.225 26.86 20.4 29 16 29 8.822 29 3 23.178 3 16c0-4.403 2.144-8.231 5.476-10.58zm9.785 11.71a3.932 3.932 0 003.956-3.956 3.932 3.932 0 00-3.956-3.957 3.932 3.932 0 00-3.957 3.957 3.932 3.932 0 003.957 3.956z"
                        fill="url(#ci-main_svg__a)"
                      />
                      <defs>
                        <linearGradient
                          id="ci-main_svg__a"
                          x1="-5.398"
                          y1="11.398"
                          x2="11.398"
                          y2="37.398"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#73DFE7" />
                          <stop offset="1" stopColor="#0095F7" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </Tooltip>
                </Grid>
                <Grid sx={{ paddingLeft: '5px' }} item md={18}>
                  <PrintCI props={row} />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </>
    );
  }
  return (
    <>
      <Box>
        <Grid
          container
          justifyContent="center"
          alignItems="flex-start"
          columns={20}
        >
          {row.branch === 'undefined' &&
          row.sourcebranch === 'undefined' &&
          row.tag === 'undefined' ? null : (
            <>
              <Grid item md={2} alignItems="center" sx={{ paddingTop: '2px' }}>
                <Tooltip title="Continuous Integration" arrow>
                  <svg
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M29 16a13.02 13.02 0 01-.854 4.6.387.387 0 01-.637.13l-3.99-3.94a.534.534 0 01-.085-.628c.432-.827.649-1.773.649-2.762.056-3.222-2.6-5.878-5.879-5.878-1.04 0-1.994.26-2.823.706a.53.53 0 01-.623-.08l-3.551-3.504a.48.48 0 01.154-.794A12.79 12.79 0 0116 3c7.178 0 13 5.822 13 13zM8.476 5.42a.582.582 0 01.746.072l4.035 4.035c.179.178.194.46.054.67a5.829 5.829 0 00-.985 3.26 5.934 5.934 0 005.935 5.934 5.829 5.829 0 003.26-.985.531.531 0 01.67.054l4.367 4.368a.582.582 0 01.065.756C24.225 26.86 20.4 29 16 29 8.822 29 3 23.178 3 16c0-4.403 2.144-8.231 5.476-10.58zm9.785 11.71a3.932 3.932 0 003.956-3.956 3.932 3.932 0 00-3.956-3.957 3.932 3.932 0 00-3.957 3.957 3.932 3.932 0 003.957 3.956z"
                      fill="url(#ci-main_svg__a)"
                    />
                    <defs>
                      <linearGradient
                        id="ci-main_svg__a"
                        x1="-5.398"
                        y1="11.398"
                        x2="11.398"
                        y2="37.398"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#73DFE7" />
                        <stop offset="1" stopColor="#0095F7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </Tooltip>
              </Grid>
              <Grid
                sx={{ paddingLeft: '5px', paddingBottom: '10px' }}
                item
                md={18}
              >
                <PrintCI props={row} />
              </Grid>
            </>
          )}
          <Grid item md={2} alignItems="top" sx={{ paddingTop: '10px' }}>
            <Tooltip title="Continuous Delivery" arrow>
              <svg
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M26.427 7.06A5.073 5.073 0 0129 11.52l-.077 8.934a5.073 5.073 0 01-2.537 4.35l-8.002 4.618a5.073 5.073 0 01-5.035.021l-7.776-4.402A5.073 5.073 0 013 20.583l.077-8.935a5.073 5.073 0 012.537-4.35l8.002-4.619a5.073 5.073 0 015.035-.02l7.776 4.402zm-2.83 6.938c-.42 1.586-2.029 2.538-3.601 2.141l-7.489-2.026a4.696 4.696 0 00-3.62.48 4.773 4.773 0 00-2.222 2.925 4.835 4.835 0 00.479 3.664 4.757 4.757 0 002.905 2.251 4.696 4.696 0 003.62-.48 4.773 4.773 0 002.222-2.924l.26-1.047a.25.25 0 00-.177-.302l-1.258-.34a.25.25 0 00-.307.18l-.256 1.025c-.426 1.602-2.064 2.556-3.651 2.127-1.582-.428-2.523-2.073-2.1-3.67.421-1.586 2.03-2.538 3.602-2.142l7.489 2.027a4.696 4.696 0 003.62-.48 4.773 4.773 0 002.222-2.925 4.835 4.835 0 00-.479-3.664 4.757 4.757 0 00-2.905-2.251 4.696 4.696 0 00-3.62.48 4.773 4.773 0 00-2.222 2.924l-.247.828a.25.25 0 00.174.312l1.259.34a.25.25 0 00.304-.169l.248-.827c.426-1.602 2.064-2.557 3.651-2.127 1.582.428 2.523 2.073 2.1 3.67z"
                  fill="url(#cd-main_svg__a)"
                />
                <defs>
                  <linearGradient
                    id="cd-main_svg__a"
                    x1="6.774"
                    y1="2"
                    x2="21.5"
                    y2="30"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#62F91F" />
                    <stop offset="1" stopColor="#45BD35" />
                  </linearGradient>
                </defs>
              </svg>
            </Tooltip>
          </Grid>
          <Grid sx={{ paddingLeft: '5px' }} item md={18}>
            <PrintCD props={row} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
function PrintCI(props: any) {
  const row = props.props;
  return (
    <>
      <PrintBranch props={row} />
      <PrintCommit props={row} />
      <PrintPR props={row} />
    </>
  );
}
function PrintBranch(props: any) {
  const row = props.props;
  if (row.tag !== 'undefined') {
    return (
      <>
        <div>
          <span style={{ padding: '3px' }}>
            <svg
              viewBox="0 0 13 14"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
            >
              <path
                d="M12.438 2.452l-.006-.017a.367.367 0 00-.067-.114l-.004-.007L10.409.125a.374.374 0 00-.28-.125H2.327a.376.376 0 00-.28.125L.095 2.314l-.005.008a.374.374 0 00-.066.113l-.006.017a.37.37 0 00-.018.11v11.064c0 .206.168.374.374.374h11.707a.375.375 0 00.375-.374V2.563a.369.369 0 00-.018-.111zm-7.91 7.86h3.4v.357a.318.318 0 01-.318.318H4.846a.318.318 0 01-.318-.318v-.357zM.75 9.563V6.625h3.03v.357c0 .588.479 1.066 1.067 1.066H7.61c.588 0 1.066-.478 1.066-1.066v-.357h3.03v2.938H.75zm3.03-6.626v.357c0 .588.479 1.067 1.067 1.067H7.61c.589 0 1.067-.479 1.067-1.067v-.357h3.03v2.939H.75V2.937h3.03zm4.15 0v.357a.318.318 0 01-.318.318H4.846a.318.318 0 01-.318-.318v-.357h3.4zm-3.4 3.688h3.4v.357a.318.318 0 01-.319.317H4.846a.317.317 0 01-.318-.317v-.357zM2.493.749h7.468l1.284 1.44H1.21L2.494.748zm9.213 12.502H.75v-2.939h3.03v.357c0 .589.479 1.067 1.067 1.067H7.61c.588 0 1.066-.478 1.066-1.067v-.357h3.03v2.94z"
                fill="currentColor"
              />
            </svg>
            <Typography
              style={{
                display: 'inline',
                padding: '2px 8px 2px 2px',
                fontSize: '0.9rem',
              }}
            >
              {row.reponame}
            </Typography>
            <svg data-icon="tag" width="15" height="15" viewBox="0 0 16 16">
              <desc>tag</desc>
              <path
                d="M1 3a2 2 0 012-2h4.584a2 2 0 011.414.586l5.413 5.412a2 2 0 010 2.829L9.827 14.41a2 2 0 01-2.829 0L1.586 8.998A2 2 0 011 7.584V3zm3.487-.007a1.494 1.494 0 100 2.988 1.494 1.494 0 000-2.988z"
                fillRule="evenodd"
                fill="#25b5ba"
              />
            </svg>
            <Typography
              style={{ display: 'inline', padding: '3px', fontSize: '0.9rem' }}
            >
              {row.tag}
            </Typography>
          </span>
        </div>
      </>
    );
  }
  if (row.branch === 'undefined' && row.sourcebranch === 'undefined') {
    return null;
  } else if (row.targetbranch === 'undefined') {
    return (
      <>
        <div>
          <span style={{ padding: '3px' }}>
            <svg
              viewBox="0 0 13 14"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
            >
              <path
                d="M12.438 2.452l-.006-.017a.367.367 0 00-.067-.114l-.004-.007L10.409.125a.374.374 0 00-.28-.125H2.327a.376.376 0 00-.28.125L.095 2.314l-.005.008a.374.374 0 00-.066.113l-.006.017a.37.37 0 00-.018.11v11.064c0 .206.168.374.374.374h11.707a.375.375 0 00.375-.374V2.563a.369.369 0 00-.018-.111zm-7.91 7.86h3.4v.357a.318.318 0 01-.318.318H4.846a.318.318 0 01-.318-.318v-.357zM.75 9.563V6.625h3.03v.357c0 .588.479 1.066 1.067 1.066H7.61c.588 0 1.066-.478 1.066-1.066v-.357h3.03v2.938H.75zm3.03-6.626v.357c0 .588.479 1.067 1.067 1.067H7.61c.589 0 1.067-.479 1.067-1.067v-.357h3.03v2.939H.75V2.937h3.03zm4.15 0v.357a.318.318 0 01-.318.318H4.846a.318.318 0 01-.318-.318v-.357h3.4zm-3.4 3.688h3.4v.357a.318.318 0 01-.319.317H4.846a.317.317 0 01-.318-.317v-.357zM2.493.749h7.468l1.284 1.44H1.21L2.494.748zm9.213 12.502H.75v-2.939h3.03v.357c0 .589.479 1.067 1.067 1.067H7.61c.588 0 1.066-.478 1.066-1.067v-.357h3.03v2.94z"
                fill="currentColor"
              />
            </svg>
            <Typography
              style={{
                display: 'inline',
                padding: '2px 8px 2px 2px',
                fontSize: '0.9rem',
              }}
            >
              {row.reponame}
            </Typography>
            <svg
              viewBox="0 0 448 512"
              id="IconChangeColor"
              height="15"
              width="15"
            >
              <path
                d="M160 80C160 112.8 140.3 140.1 112 153.3V241.1C130.8 230.2 152.7 224 176 224H272C307.3 224 336 195.3 336 160V153.3C307.7 140.1 288 112.8 288 80C288 35.82 323.8 0 368 0C412.2 0 448 35.82 448 80C448 112.8 428.3 140.1 400 153.3V160C400 230.7 342.7 288 272 288H176C140.7 288 112 316.7 112 352V358.7C140.3 371 160 399.2 160 432C160 476.2 124.2 512 80 512C35.82 512 0 476.2 0 432C0 399.2 19.75 371 48 358.7V153.3C19.75 140.1 0 112.8 0 80C0 35.82 35.82 0 80 0C124.2 0 160 35.82 160 80V80zM80 104C93.25 104 104 93.25 104 80C104 66.75 93.25 56 80 56C66.75 56 56 66.75 56 80C56 93.25 66.75 104 80 104zM368 56C354.7 56 344 66.75 344 80C344 93.25 354.7 104 368 104C381.3 104 392 93.25 392 80C392 66.75 381.3 56 368 56zM80 456C93.25 456 104 445.3 104 432C104 418.7 93.25 408 80 408C66.75 408 56 418.7 56 432C56 445.3 66.75 456 80 456z"
                id="mainIconPathAttribute"
                fill="#03989e"
              />
            </svg>
            <Typography
              style={{ display: 'inline', padding: '2px', fontSize: '0.9rem' }}
            >
              {row.branch}
            </Typography>
          </span>
        </div>
      </>
    );
  }
  return (
    <>
      <div>
        <span style={{ padding: '3px' }}>
          <svg
            viewBox="0 0 13 14"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
          >
            <path
              d="M12.438 2.452l-.006-.017a.367.367 0 00-.067-.114l-.004-.007L10.409.125a.374.374 0 00-.28-.125H2.327a.376.376 0 00-.28.125L.095 2.314l-.005.008a.374.374 0 00-.066.113l-.006.017a.37.37 0 00-.018.11v11.064c0 .206.168.374.374.374h11.707a.375.375 0 00.375-.374V2.563a.369.369 0 00-.018-.111zm-7.91 7.86h3.4v.357a.318.318 0 01-.318.318H4.846a.318.318 0 01-.318-.318v-.357zM.75 9.563V6.625h3.03v.357c0 .588.479 1.066 1.067 1.066H7.61c.588 0 1.066-.478 1.066-1.066v-.357h3.03v2.938H.75zm3.03-6.626v.357c0 .588.479 1.067 1.067 1.067H7.61c.589 0 1.067-.479 1.067-1.067v-.357h3.03v2.939H.75V2.937h3.03zm4.15 0v.357a.318.318 0 01-.318.318H4.846a.318.318 0 01-.318-.318v-.357h3.4zm-3.4 3.688h3.4v.357a.318.318 0 01-.319.317H4.846a.317.317 0 01-.318-.317v-.357zM2.493.749h7.468l1.284 1.44H1.21L2.494.748zm9.213 12.502H.75v-2.939h3.03v.357c0 .589.479 1.067 1.067 1.067H7.61c.588 0 1.066-.478 1.066-1.067v-.357h3.03v2.94z"
              fill="currentColor"
            />
          </svg>
          <Typography
            style={{
              display: 'inline',
              padding: '2px 8px 2px 2px',
              fontSize: '0.9rem',
            }}
          >
            {row.reponame}
          </Typography>
          <svg
            viewBox="0 0 448 512"
            id="IconChangeColor"
            height="15"
            width="15"
          >
            <path
              d="M160 80C160 112.8 140.3 140.1 112 153.3V241.1C130.8 230.2 152.7 224 176 224H272C307.3 224 336 195.3 336 160V153.3C307.7 140.1 288 112.8 288 80C288 35.82 323.8 0 368 0C412.2 0 448 35.82 448 80C448 112.8 428.3 140.1 400 153.3V160C400 230.7 342.7 288 272 288H176C140.7 288 112 316.7 112 352V358.7C140.3 371 160 399.2 160 432C160 476.2 124.2 512 80 512C35.82 512 0 476.2 0 432C0 399.2 19.75 371 48 358.7V153.3C19.75 140.1 0 112.8 0 80C0 35.82 35.82 0 80 0C124.2 0 160 35.82 160 80V80zM80 104C93.25 104 104 93.25 104 80C104 66.75 93.25 56 80 56C66.75 56 56 66.75 56 80C56 93.25 66.75 104 80 104zM368 56C354.7 56 344 66.75 344 80C344 93.25 354.7 104 368 104C381.3 104 392 93.25 392 80C392 66.75 381.3 56 368 56zM80 456C93.25 456 104 445.3 104 432C104 418.7 93.25 408 80 408C66.75 408 56 418.7 56 432C56 445.3 66.75 456 80 456z"
              id="mainIconPathAttribute"
              fill="#03989e"
            />
          </svg>
          <Typography
            style={{ display: 'inline', padding: '2px', fontSize: '0.9rem' }}
          >
            {row.sourcebranch}
          </Typography>
          <svg
            width="18"
            height="18"
            fill="currentColor"
            className="bi bi-arrow-right"
            viewBox="0 -3 16 16"
            id="IconChangeColor"
          >
            {' '}
            <path
              fillRule="evenodd"
              d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
              id="mainIconPathAttribute"
            />{' '}
          </svg>{' '}
          <svg
            viewBox="0 0 448 512"
            id="IconChangeColor"
            height="15"
            width="15"
          >
            <path
              d="M160 80C160 112.8 140.3 140.1 112 153.3V241.1C130.8 230.2 152.7 224 176 224H272C307.3 224 336 195.3 336 160V153.3C307.7 140.1 288 112.8 288 80C288 35.82 323.8 0 368 0C412.2 0 448 35.82 448 80C448 112.8 428.3 140.1 400 153.3V160C400 230.7 342.7 288 272 288H176C140.7 288 112 316.7 112 352V358.7C140.3 371 160 399.2 160 432C160 476.2 124.2 512 80 512C35.82 512 0 476.2 0 432C0 399.2 19.75 371 48 358.7V153.3C19.75 140.1 0 112.8 0 80C0 35.82 35.82 0 80 0C124.2 0 160 35.82 160 80V80zM80 104C93.25 104 104 93.25 104 80C104 66.75 93.25 56 80 56C66.75 56 56 66.75 56 80C56 93.25 66.75 104 80 104zM368 56C354.7 56 344 66.75 344 80C344 93.25 354.7 104 368 104C381.3 104 392 93.25 392 80C392 66.75 381.3 56 368 56zM80 456C93.25 456 104 445.3 104 432C104 418.7 93.25 408 80 408C66.75 408 56 418.7 56 432C56 445.3 66.75 456 80 456z"
              id="mainIconPathAttribute"
              fill="#03989e"
            />
          </svg>
          <Typography
            style={{ display: 'inline', padding: '2px', fontSize: '0.9rem' }}
          >
            {row.targetbranch}
          </Typography>
        </span>
      </div>
    </>
  );
}
function PrintCommit(props: any) {
  const row = props.props;
  if (row.commitId === 'undefined') {
    return null;
  }
  return (
    <>
      <div style={{ display: 'block' }}>
        <svg
          style={{ display: 'inline' }}
          viewBox="0 -150 640 512"
          id="IconChangeColor"
          height="18"
          width="18"
        >
          <path
            d="M476.8 288C461.1 361 397.4 416 320 416C242.6 416 178 361 163.2 288H32C14.33 288 0 273.7 0 256C0 238.3 14.33 224 32 224H163.2C178 150.1 242.6 96 320 96C397.4 96 461.1 150.1 476.8 224H608C625.7 224 640 238.3 640 256C640 273.7 625.7 288 608 288H476.8zM320 336C364.2 336 400 300.2 400 256C400 211.8 364.2 176 320 176C275.8 176 240 211.8 240 256C240 300.2 275.8 336 320 336z"
            id="mainIconPathAttribute"
            stroke="#0b3724"
            strokeWidth="0"
            fill="#000000"
          />
        </svg>
        <Box
          style={{ display: 'inline-block', padding: '5px' }}
          maxWidth="200px"
        >
          <OverflowTooltip text={row.message} />
        </Box>
        <Link
          style={{ display: 'inline' }}
          href={row.commitlink}
          target="_blank"
        >
          {row.commitId?.substring(0, 6)}
        </Link>
      </div>
    </>
  );
}
function PrintPR(props: any) {
  const row = props.props;
  if (row.prId === 'undefined') {
    return null;
  }
  return (
    <>
      <div>
        <div style={{ display: 'block' }}>
          <svg
            viewBox="-2 -3 24 24"
            fill="none"
            id="IconChangeColor"
            height="21"
            width="21"
          >
            <path
              stroke="#248ea8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0v10m12-6a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 0V9a2 2 0 0 0-2-2h-1m-2 0 2-2v2m-2 0h2m-2 0 2 2V7"
              id="mainIconPathAttribute"
            />
          </svg>
          <Box
            maxWidth="200px"
            style={{ display: 'inline-block', padding: '5px' }}
          >
            <OverflowTooltip text={row.prmessage} />
          </Box>
          <Link style={{ display: 'inline' }} href={row.prlink} target="_blank">
            #{row.prId?.substring(0, 6)}
          </Link>
        </div>
      </div>
    </>
  );
}

function PrintCD(props: any) {
  const row = props.props;
  return (
    <div style={{ display: 'block' }}>
      <Typography
        component="span"
        style={{ paddingTop: '5px', fontSize: '0.9rem' }}
      >
        Service Deployed:
        <OverflowTooltip text={row?.cdser} />
      </Typography>
      <Typography component="span" style={{ fontSize: '0.9rem' }}>
        Environments:
        <OverflowTooltip text={row?.cdenv} />
      </Typography>
    </div>
  );
}
