import React from "react";
import ReactTooltip from "react-tooltip";
function ToolTip(props) {
  const { place, effect } = props;
  return (
    <ReactTooltip
      effect={effect ? effect : "float"}
      place={place ? place : "top"}
      offset={{ top: 10, left: 10 }}
      type="dark"
      multiline
      backgroundColor="#EBF4FB"
      textColor="#2167AD"
    ></ReactTooltip>
  );
}

export default ToolTip;
