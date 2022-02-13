import React from "react";
import "./Style.css";
import ToolTip from "../tooltip/ToolTip";
function FrmToggleSwitch(props) {
  const {
    title,
    name,
    value,
    handleChange,
    selectopts,
    isRequired,
    validationmsg,
    issubmitted,
    hasInformation,
    informationmsg,
    isToolTip,
    tooltipmsg,
  } = props;
  const swithChange = (e) => {
    let { name, value } = e.target;
    if (e.target.type === "checkbox") {
      value = e.target.checked;
    }
    handleChange(name, value);
  };
  return (
    <div className={`frm-field ${isRequired ? "mandatory" : ""}`}>
      <label htmlFor={name}>
        <div className="label">{title}</div>
        {isToolTip ? (
          <>
            <div className="icon info-icon" data-tip={tooltipmsg}></div>
            <ToolTip />
          </>
        ) : (
          ""
        )}
      </label>
      <div className="toggle-switch-container">
        <div className="option-title">{selectopts[0]["label"]}</div>
        <div className="toggle-switch">
          <input
            type="checkbox"
            className="checkbox"
            name={name}
            id={name}
            checked={value}
            onChange={swithChange}
          />
          <label className="switch-box" htmlFor={name}>
            <span className="inner" />
            <span className="switch" />
          </label>
        </div>
        <div className="option-title">{selectopts[1]["label"]}</div>
      </div>
      {isRequired && issubmitted && !value ? (
        <div className="validationError">{validationmsg}</div>
      ) : (
        ""
      )}
    </div>
  );
}

export default FrmToggleSwitch;
