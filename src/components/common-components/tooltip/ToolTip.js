import React from "react";
import ReactTooltip from "react-tooltip";
function ToolTip() {
  return (
    <ReactTooltip
      effect="float"
      place="top"
      type="dark"
      multiline
      backgroundColor="#EBF4FB"
      textColor="#2167AD"
    ></ReactTooltip>
  );
}

export default ToolTip;
