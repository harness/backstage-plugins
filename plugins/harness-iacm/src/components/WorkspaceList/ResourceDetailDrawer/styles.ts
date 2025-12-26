import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
  drawerContent: {
    width: 1000,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: theme.spacing(2),
    overflow: 'hidden',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    flexShrink: 0,
  },
  drawerTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  drawerSubHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    gap: theme.spacing(1),
    flexShrink: 0,
  },
  subHeaderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  subHeaderLabel: {
    color: theme.palette.text.secondary,
  },
  subHeaderValue: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  subHeaderDivider: {
    height: 16,
    margin: `0 ${theme.spacing(0.5)}`,
  },
  drawerBody: {
    flex: 1,
    minHeight: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  searchFieldSticky: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 10,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(-2),
    marginRight: theme.spacing(-2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  valueHeader: {
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  attributeRow: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1.5),
    paddingBottom: theme.spacing(1),
    position: 'relative',
  },
  attributeRowDrift: {
    backgroundColor:
      theme.palette.type === 'dark' ? 'rgba(255, 183, 77, 0.1)' : '#fff3e0',
    borderColor: '#ffb74d',
  },
  attributeKey: {
    fontWeight: 500,
    marginBottom: theme.spacing(0.75),
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontFamily: 'inherit',
  },
  attributeValue: {
    fontWeight: 400,
    color: theme.palette.text.primary,
    flex: 1,
    wordBreak: 'break-word',
    fontFamily: 'inherit',
  },
  jsonValue: {
    padding: theme.spacing(1),
    borderRadius: 4,
    overflow: 'auto',
    marginTop: theme.spacing(0.5),
    border: `1px solid ${theme.palette.divider}`,
    fontFamily: 'inherit',
  },
  deletedBadge: {
    fontWeight: 600,
    textTransform: 'uppercase',
    backgroundColor:
      theme.palette.type === 'dark' ? 'rgba(244, 67, 54, 0.2)' : '#ffebee',
    color:
      theme.palette.type === 'dark' ? '#ffcdd2' : theme.palette.text.primary,
    padding: '2px 6px',
    borderRadius: 4,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    marginLeft: theme.spacing(0.5),
  },
  valueComparison: {
    marginTop: theme.spacing(1),
  },
  valueLabel: {
    fontWeight: 600,
    marginRight: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  divider: {
    margin: 0,
  },
  copyButtonWrapper: {
    position: 'absolute',
    top: theme.spacing(1),
    right: 0,
    zIndex: 1,
  },
  iconContainer: {
    marginRight: theme.spacing(1),
    display: 'inline-flex',
    alignItems: 'center',
  },
  iconContainerInline: {
    display: 'inline-flex',
    alignItems: 'center',
    marginRight: theme.spacing(0.5),
  },
}));
