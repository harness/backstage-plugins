import React from "react";
import { ChangeTypes, calculateTotalChangePercentage, getChangeIcon, getChangeTooltipText, numberFormatter } from "../util/MonitoredServiceUtils";
import { CategoryCountDetails } from "./types";
import { Tooltip } from "@material-ui/core";

const RenderChangePercentage: React.FC<any> = ({ color, icon, text }) => {
  const iconStyle = {
    fill: color,
    marginRight: '4px',
    marginTop: '4px'
  };
  if (icon === "symbol-triangle-up") {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <svg style={iconStyle} data-icon="symbol-triangle-up" width="10" height="10" viewBox="0 0 16 16"><desc>symbol-triangle-up</desc><path d="M12.89 11.56l-3.99-8h-.01c-.17-.32-.5-.55-.89-.55s-.72.23-.89.55H7.1l-4 8h.01c-.06.14-.11.29-.11.45 0 .55.45 1 1 1h8c.55 0 1-.45 1-1 0-.16-.05-.31-.11-.45z" fillRule="evenodd" /></svg>
        </div>
        <div style={{ color: color, fontSize: '12px' }}>{text}</div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <svg style={iconStyle} data-icon="symbol-triangle-down" width="10" height="10" viewBox="0 0 16 16"><desc>symbol-triangle-down</desc><path d="M13 4.01c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 .16.05.31.11.44H3.1l4 8h.01c.16.33.49.56.89.56s.72-.23.89-.56h.01l4-8h-.01c.06-.14.11-.28.11-.44z" fillRule="evenodd" /></svg>
      </div>
      <div style={{ color: color, fontSize: '12px' }}>{text}</div>
    </div>
  );
}



const TextWithIcon = ({ icon, text }: { icon: ChangeTypes, text: Number }) => {
  return (
    <div style={{ margin: '0 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Tooltip title={<h3 style={{ color: "white" }}>{getChangeTooltipText(icon)}</h3>} placement="top">
          <div style={{ marginTop: '4px', marginRight: '4px' }}>
            {React.createElement(getChangeIcon(icon))}
          </div>
        </Tooltip>
        <div>{text}</div>
      </div>
    </div>
  );
}

const RenderChangeComponent: React.FC<any> = (props) => {

  const { categoryCountMap, total } = props.row.changeSummary;

  const { color, percentage, icon } = calculateTotalChangePercentage(total)

  const totalPercentage = numberFormatter(Math.abs(percentage), {
    truncate: false
  })
  const percentageText = Math.abs(percentage) > 100 ? `100+ %` : `${totalPercentage}%`
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '0 -8px' }} >
      {Object.entries(categoryCountMap).map(([changeCategory, categoryCountDetails]) => (
        <TextWithIcon key={changeCategory} icon={changeCategory as ChangeTypes} text={(categoryCountDetails as CategoryCountDetails).count ?? 0} />
      ))}
      <div style={{ margin: '0 12px' }}>
        <RenderChangePercentage color={color} icon={icon} text={percentageText} />
      </div>
    </div>
  )
}




export default RenderChangeComponent;

