import React, { useState, useEffect } from "react";
import FrmInput from "../common-components/frminput/FrmInput";
import FrmToggleSwitch from "../common-components/frmtoggelswitch/FrmToggleSwitch";

import FrmDatePicker from "../common-components/frmdatepicker/FrmDatePicker";
import FrmSelect from "../common-components/frmselect/FrmSelect";
import FrmTextArea from "../common-components/frmtextarea/FrmTextArea";

import { connect } from "react-redux";
import FrmInputSearch from "../common-components/frmpeoplepicker/FrmInputSearch";
import FrmFileUpload from "../common-components/frmfileupload/FrmFileUpload";
import Loading from "../common-components/Loading";
import moment from "moment";
import parse from "html-react-parser";
import "./Style.css";
import {
  BREACH_LOG_OPEN_STATUS,
  BREACH_LOG_CLOSE_STATUS,
  REGION_EMEA,
} from "../../constants";
import {
  userActions,
  lookupActions,
  lobActions,
  segmentActions,
  sublobActions,
  breachlogActions,
} from "../../actions";
import FrmRadio from "../common-components/frmradio/FrmRadio";
import FrmRichTextEditor from "../common-components/frmrichtexteditor/FrmRichTextEditor";
import { alertMessage, dynamicSort, formatDate } from "../../helpers";
import PeoplePickerPopup from "./PeoplePickerPopup";

function AddEditForm(props) {
  const {
    breachlogState,
    segmentState,
    lobState,
    sublobState,
    userState,
  } = props.state;
  const {
    title,
    hideAddPopup,
    postItem,
    putItem,
    isEditMode,
    formIntialState,
    frmCountrySelectOpts,
    frmRegionSelectOpts,
    countrymapping,
    countryAllOpts,
    getAllUsers,
    getLookupByType,
    getAlllob,
    getAllSegment,
    getAllSublob,
    uploadFile,
    deleteFile,
    isReadMode,
  } = props;
  //console.log(sublobState);
  const selectInitiVal = { label: "Select", value: "" };
  const closeStatusValue = BREACH_LOG_CLOSE_STATUS;
  const emeaRegionValue = REGION_EMEA;
  const [formfield, setformfield] = useState(formIntialState);
  const [issubmitted, setissubmitted] = useState(false);
  const [countryopts, setcountryopts] = useState([]);
  const [regionopts, setregionopts] = useState([]);
  const [isdisabled, setisdisabled] = useState(false);
  const [yesnoopts, setyesnoopts] = useState([
    {
      label: "No",
      value: false,
    },
    {
      label: "Yes",
      value: true,
    },
  ]);
  const [frmSegmentOpts, setfrmSegmentOpts] = useState([]);
  const [frmSegmentOptsAll, setfrmSegmentOptsAll] = useState([]);
  const [frmLoB, setfrmLoB] = useState([]);
  const [frmSublob, setfrmSublob] = useState([]);
  const [frmSublobAll, setfrmSublobAll] = useState([]);
  const [frmSeverity, setfrmSeverity] = useState([]);
  const [frmTypeOfBreach, setfrmTypeOfBreach] = useState([]);
  const [frmRootCauseBreach, setfrmRootCauseBreach] = useState([]);
  const [frmNatureOfBreach, setfrmNatureOfBreach] = useState([]);
  const [frmRangeFinImpact, setfrmRangeFinImpact] = useState([]);
  const [frmHowDetected, setfrmHowDetected] = useState([]);
  const [frmBreachStatus, setfrmBreachStatus] = useState([]);

  const [mandatoryFields, setmandatoryFields] = useState([
    "title",
    "countryId",
    "regionId",
    "customerSegment",
    "lobid",
    "severity",
    "typeOfBreach",
    "natureOfBreach",
    "dateBreachOccurred",
    "howDetected",
    "actionPlan",
    "dueDate",
    "actionResponsibleName",
  ]);
  useEffect(() => {
    setcountryopts([selectInitiVal, ...frmCountrySelectOpts]);
    setregionopts([selectInitiVal, ...frmRegionSelectOpts]);
    /*if (formIntialState.countryId) {
      let region = frmCountrySelectOpts.filter(
        (item) => item.value === formIntialState.countryId
      );
      let regionOpts = frmRegionSelectOpts.filter(
        (item) => item.value === region[0].regionId
      );
      setregionopts([...regionOpts]);
    } else {
      setregionopts([...frmRegionSelectOpts]);
    }*/
  }, []);

  const [loading, setloading] = useState(true);
  useEffect(async () => {
    let tempSeverity = await getLookupByType({
      LookupType: "BreachClassification",
    });
    let tempTypeOfBreach = await getLookupByType({
      LookupType: "BreachType",
    });
    let tempRootCauseBreach = await getLookupByType({
      LookupType: "BreachRootCause",
    });
    let tempNatureOfBreach = await getLookupByType({
      LookupType: "BreachNature",
    });
    let tempRangeFinImpact = await getLookupByType({
      LookupType: "BreachFinancialRange",
    });
    let tempHowDetected = await getLookupByType({
      LookupType: "BreachDetection",
    });
    let tempBreachStatus = await getLookupByType({
      LookupType: "BreachStatus",
    });

    tempSeverity = tempSeverity.map((item) => ({
      label: item.lookUpValue,
      value: item.lookupID,
    }));
    tempTypeOfBreach = tempTypeOfBreach.map((item) => ({
      label: item.lookUpValue,
      value: item.lookupID,
    }));
    tempRootCauseBreach = tempRootCauseBreach.map((item) => ({
      label: item.lookUpValue,
      value: item.lookupID,
    }));
    tempNatureOfBreach = tempNatureOfBreach.map((item) => ({
      label: item.lookUpValue,
      value: item.lookupID,
    }));
    tempRangeFinImpact = tempRangeFinImpact.map((item) => ({
      label: item.lookUpValue,
      value: item.lookupID,
    }));
    tempHowDetected = tempHowDetected.map((item) => ({
      label: item.lookUpValue,
      value: item.lookupID,
    }));
    let frmbreachstatus = [];
    tempBreachStatus.forEach((item) => {
      if (!isEditMode && item.lookUpValue === "Open") {
        frmbreachstatus.push({
          label: item.lookUpValue,
          value: item.lookupID,
        });
        setformfield({ ...formfield, breachStatus: item.lookupID });
      } else if (isEditMode) {
        frmbreachstatus.push({
          label: item.lookUpValue,
          value: item.lookupID,
        });
      }
    });

    setfrmSeverity([...tempSeverity]);
    setfrmTypeOfBreach([selectInitiVal, ...tempTypeOfBreach]);
    setfrmRootCauseBreach([selectInitiVal, ...tempRootCauseBreach]);
    setfrmNatureOfBreach([selectInitiVal, ...tempNatureOfBreach]);
    setfrmRangeFinImpact([selectInitiVal, ...tempRangeFinImpact]);
    setfrmHowDetected([selectInitiVal, ...tempHowDetected]);

    setfrmBreachStatus([selectInitiVal, ...frmbreachstatus]);
    setloading(false);
  }, []);

  useEffect(() => {
    getAlllob({ isActive: true });
    getAllSegment({ isActive: true });
    getAllSublob({ isActive: true });
  }, []);

  useEffect(() => {
    let tempItems = segmentState.segmentItems.map((item) => ({
      label: item.segmentName,
      value: item.segmentID,
      country: item.countryList,
    }));
    tempItems.sort(dynamicSort("label"));
    setfrmSegmentOpts([selectInitiVal, ...tempItems]);
    setfrmSegmentOptsAll(tempItems);
  }, [segmentState.segmentItems]);

  useEffect(() => {
    let tempItems = lobState.lobItems.map((item) => ({
      label: item.lobName,
      value: item.lobid,
    }));
    tempItems.sort(dynamicSort("label"));
    setfrmLoB([selectInitiVal, ...tempItems]);
  }, [lobState.lobItems]);

  useEffect(() => {
    let tempItems = sublobState.sublobitems.map((item) => ({
      label: item.subLOBName,
      value: item.subLOBID,
      lob: item.lobid,
    }));
    tempItems.sort(dynamicSort("label"));
    setfrmSublobAll(tempItems);

    if (formfield.lobid) {
      let sublobopts = tempItems.filter((item) => item.lob === formfield.lobid);
      setfrmSublob([...sublobopts]);
    }
  }, [sublobState.sublobitems]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (e.target.type === "checkbox") {
      value = e.target.checked;
    }
    setformfield({ ...formfield, [name]: value });
  };
  const handleSelectChange = (name, value) => {
    setformfield({
      ...formfield,
      [name]: value,
    });

    //map country and region fields

    if (name === "regionId" && value !== "") {
      let countryopts = frmCountrySelectOpts.filter(
        (item) => item.regionId === value
      );
      setcountryopts([selectInitiVal, ...countryopts]);
      setformfield({
        ...formfield,
        [name]: value,
        countryId: "",
      });
    } else if (name === "regionId" && value === "") {
      setcountryopts([selectInitiVal, ...frmCountrySelectOpts]);
      setregionopts([selectInitiVal, ...frmRegionSelectOpts]);
      setformfield({
        ...formfield,
        [name]: value,
        countryId: "",
      });
    }
    if (name === "countryId" && value !== "") {
      let country = frmCountrySelectOpts.filter((item) => item.value === value);
      let regionOpts = frmRegionSelectOpts.filter(
        (item) => item.value === country[0].regionId
      );
      let segmentOpts = frmSegmentOptsAll.filter((item) => {
        if (!item.country) {
          return true;
        } else if (item.country.indexOf(country[0].label) !== -1) {
          return true;
        } else {
          return false;
        }
      });
      setfrmSegmentOpts([selectInitiVal, ...segmentOpts]);
      setregionopts([selectInitiVal, ...regionOpts]);
      setformfield({
        ...formfield,
        [name]: value,
        regionId: regionOpts[0].value,
        customerSegment: "",
      });
    } else if (name === "countryId" && value === "") {
      setregionopts([selectInitiVal, ...frmRegionSelectOpts]);
      setfrmSegmentOpts([selectInitiVal, ...frmSegmentOptsAll]);
      setformfield({
        ...formfield,
        [name]: value,
        regionId: "",
      });
    }
    //map lob and sublob fields
    if (name === "lobid" && value !== "") {
      let sublobopts = frmSublobAll.filter((item) => item.lob === value);
      setfrmSublob([selectInitiVal, ...sublobopts]);
    } else if (name === "lobid" && value === "") {
      setfrmSublob([]);
      setformfield({
        ...formfield,
        [name]: value,
        sublobid: "",
      });
    }
    if (
      name === "breachStatus" &&
      value === closeStatusValue &&
      !formfield.dateActionClosed
    ) {
      setformfield({
        ...formfield,
        [name]: value,
        dateActionClosed: moment().format("YYYY-MM-DD"),
      });
    }
  };

  const handleMultiSelectChange = (name, value) => {
    //const tempval = value.map((item) => item.value);
    setformfield({ ...formfield, [name]: value });
  };
  const handleDateSelectChange = (name, value) => {
    let dateval = moment(value).format("YYYY-MM-DD");
    setformfield({ ...formfield, [name]: dateval });
  };
  const handleFileUpload = async (name, selectedfile) => {
    const formData = new FormData();
    if (selectedfile) {
      // Update the formData object
      for (let i = 0; i < selectedfile.length; i++) {
        let file = selectedfile[i];
        formData.append("files", file, file.name);
      }
      let folderID = formfield.breachLogID
        ? formfield.breachLogID
        : formfield.folderID
        ? formfield.folderID
        : "";

      formData.append("TempId", folderID);
      formData.append("LogType", "BreachLogs");
    }
    let response = await uploadFile(formData);
    if (response) {
      if (!formfield.breachLogID) {
        formfield.folderID = response.tempId;
      }
      let tempattachementfiles = [...formfield.breachAttachmentList];

      response.attachmentFiles.forEach((item) => {
        tempattachementfiles.push({
          filePath: item,
          logAttachmentId: "",
        });
      });
      setformfield({
        ...formfield,
        breachAttachmentList: [...tempattachementfiles],
      });
    }
  };
  const handleFileDelete = async (id, url) => {
    if (!window.confirm(alertMessage.breachlog.deleteAttachmentConfirm)) {
      return;
    }
    const requestParam = {
      id: id,
      uploadedFile: url,
    };
    const response = await deleteFile(requestParam);
    if (response) {
      alert(alertMessage.breachlog.deleteAttachment);
      let tempattachementfiles = [...formfield.breachAttachmentList];
      tempattachementfiles = tempattachementfiles.filter(
        (item) => item.filePath !== url
      );
      setformfield({
        ...formfield,
        breachAttachmentList: [...tempattachementfiles],
      });
    }
  };
  useEffect(() => {
    let tempfullPathArr = formfield.breachAttachmentList.map(
      (item) => item.filePath
    );
    let fullFilePath = tempfullPathArr.join(",");
    setformfield({ ...formfield, fullFilePath: fullFilePath });
  }, [formfield.breachAttachmentList]);

  const [scrollPosition, setScrollPosition] = useState(0);
  const [showpeoplepicker, setshowpeoplepicker] = useState(false);
  const handleshowpeoplepicker = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
    setshowpeoplepicker(true);
  };
  const hidePeoplePickerPopup = () => {
    setshowpeoplepicker(false);
    window.scrollTo({ top: scrollPosition, behavior: "smooth" });
  };
  const assignPeoplepikerUser = (name, value) => {
    let displayname = value[0].firstName + " " + value[0].lastName;
    let email = value[0]["emailAddress"];
    setformfield({
      ...formfield,
      [name]: email,
      actionResponsibleName: displayname,
      actionResponsibleAD: value[0],
    });
  };
  const validateform = () => {
    let isvalidated = true;
    for (let key in formfield) {
      if (mandatoryFields.includes(key) && isvalidated) {
        let value = formfield[key];
        if (key === "actionPlan") {
          value = formfield[key].replace(/<\/?[^>]+(>|$)/g, "");
        }
        if (!value) {
          isvalidated = false;
        }
      }
    }
    return isvalidated;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setissubmitted(true);
    if (validateform()) {
      //added below code to set date action closed value
      /*if (
        formfield.breachStatus === closeStatusValue &&
        !formfield.dateActionClosed
      ) {
        formfield.dateActionClosed = moment().format("YYYY-MM-DD");
      }*/
      //end of code
      if (formfield.breachStatus)
        if (isEditMode) {
          putItem(formfield);
        } else {
          postItem({ ...formfield, isSubmit: true });
        }
    }
  };
  const handleSaveLog = () => {
    setissubmitted(true);
    if (validateform()) {
      postItem({ ...formfield, isSubmit: false });
    }
    // hideAddPopup();
  };
  return loading ? (
    <Loading />
  ) : (
    <div className="addedit-logs-container">
      <div className="addedit-header-container">
        <div className="addedit-header-title">{title}</div>
        <div className="addedit-close btn-blue" onClick={() => hideAddPopup()}>
          Back
        </div>
      </div>

      <div className="popup-formitems">
        <form onSubmit={handleSubmit} id="myForm">
          <>
            <div className="frm-field-bggray">
              <div className="row">
                <div className="col-md-3">
                  <FrmInput
                    title={"Title of the Breach"}
                    name={"title"}
                    value={formfield.title}
                    type={"text"}
                    handleChange={handleChange}
                    isReadMode={isReadMode}
                    isRequired={true}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                  />
                </div>
                <div className="col-md-3">
                  <FrmSelect
                    title={"Country"}
                    name={"countryId"}
                    value={formfield.countryId}
                    handleChange={handleSelectChange}
                    isRequired={true}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={countryopts}
                  />
                </div>
                <div className="col-md-3">
                  <FrmSelect
                    title={"Region"}
                    name={"regionId"}
                    value={formfield.regionId}
                    isReadMode={isReadMode}
                    handleChange={handleSelectChange}
                    isRequired={true}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={regionopts}
                  />
                </div>
                <div className="col-md-3">
                  <FrmSelect
                    title={"Customer Segment"}
                    name={"customerSegment"}
                    value={formfield.customerSegment}
                    handleChange={handleSelectChange}
                    isRequired={true}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={frmSegmentOpts}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-3">
                  <FrmSelect
                    title={"LoB"}
                    name={"lobid"}
                    value={formfield.lobid}
                    handleChange={handleSelectChange}
                    isRequired={true}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={frmLoB}
                  />
                </div>
                <div className="col-md-3">
                  <FrmSelect
                    title={"Sub-LoB"}
                    name={"sublobid"}
                    value={formfield.sublobid}
                    handleChange={handleSelectChange}
                    isRequired={false}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={frmSublob}
                  />
                </div>
                <div className="col-md-3">
                  {
                    <FrmRadio
                      title={"Classification"}
                      name={"classification"}
                      value={formfield.classification}
                      handleChange={handleChange}
                      isRequired={true}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      isToolTip={true}
                      tooltipmsg={"Tooltip text"}
                      issubmitted={issubmitted}
                      selectopts={frmSeverity}
                      isdisabled={isdisabled}
                    />
                  }
                </div>
                <div className="col-md-3">
                  <FrmSelect
                    title={"Type of Breach"}
                    name={"typeOfBreach"}
                    value={formfield.typeOfBreach}
                    handleChange={handleSelectChange}
                    isRequired={true}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={frmTypeOfBreach}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-3">
                  <FrmSelect
                    title={"Root Cause of the Breach"}
                    name={"rootCauseOfTheBreach"}
                    value={formfield.rootCauseOfTheBreach}
                    handleChange={handleSelectChange}
                    isRequired={false}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={frmRootCauseBreach}
                  />
                </div>
                <div className="col-md-3">
                  <FrmSelect
                    title={
                      <>
                        Nature of Breach <i>(Keywords)</i>
                      </>
                    }
                    name={"natureOfBreach"}
                    value={formfield.natureOfBreach}
                    handleChange={handleSelectChange}
                    isRequired={true}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={frmNatureOfBreach}
                  />
                </div>
                <div className="col-md-3">
                  <FrmToggleSwitch
                    title={
                      <>
                        Material breach <i>(as per ZUG)</i>
                      </>
                    }
                    name={"materialBreach"}
                    value={formfield.materialBreach}
                    handleChange={handleSelectChange}
                    isRequired={false}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={yesnoopts}
                    isdisabled={isdisabled}
                  />
                </div>
                <div className="col-md-3">
                  <FrmDatePicker
                    title={"Date Breach Occurred"}
                    name={"dateBreachOccurred"}
                    value={formfield.dateBreachOccurred}
                    type={"date"}
                    handleChange={handleDateSelectChange}
                    isRequired={true}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <FrmRichTextEditor
                    title={"Details"}
                    name={"breachDetails"}
                    value={formfield.breachDetails}
                    handleChange={handleSelectChange}
                    isRequired={false}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-3">
                  <FrmSelect
                    title={
                      <>
                        Range of financial impact <br></br>
                        <i>(In US Dollars $)</i>
                      </>
                    }
                    name={"rangeOfFinancialImpact"}
                    value={formfield.rangeOfFinancialImpact}
                    handleChange={handleSelectChange}
                    isRequired={false}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={frmRangeFinImpact}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <FrmTextArea
                    title={"Financial impact description"}
                    name={"financialImpactDescription"}
                    value={formfield.financialImpactDescription}
                    handleChange={handleChange}
                    isRequired={false}
                    isReadMode={isReadMode}
                    validationmsg={""}
                    issubmitted={issubmitted}
                  />
                </div>
              </div>
              <div className="row border-bottom">
                <div className="col-md-3">
                  <FrmSelect
                    title={"How detected"}
                    name={"howDetected"}
                    value={formfield.howDetected}
                    handleChange={handleSelectChange}
                    isRequired={true}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={frmHowDetected}
                  />
                </div>
                <div className="col-md-9">
                  {formfield.regionId === emeaRegionValue ? (
                    <FrmToggleSwitch
                      title={
                        <>
                          Near misses / OE <i>(Only EMEA)</i>
                        </>
                      }
                      name={"nearMisses"}
                      value={formfield.nearMisses}
                      handleChange={handleSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      isToolTip={true}
                      tooltipmsg={
                        "Has a loss naterialised as a result of the breach? If the answer is No, this is a near miss.<br>If the answer is Yes, this is an operational event."
                      }
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                      selectopts={yesnoopts}
                      isdisabled={isdisabled}
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-md-3">
                  <FrmInput
                    title={"Action Responsible"}
                    name={"actionResponsibleName"}
                    value={formfield.actionResponsibleName}
                    type={"text"}
                    handleChange={handleChange}
                    handleClick={handleshowpeoplepicker}
                    isRequired={true}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                  />
                </div>
                <div className="col-md-3">
                  <FrmDatePicker
                    title={"Due Date"}
                    name={"dueDate"}
                    value={formfield.dueDate}
                    type={"date"}
                    handleChange={handleDateSelectChange}
                    isRequired={true}
                    isReadMode={isReadMode}
                    minDate={moment().toDate()}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                  />
                </div>
                <div className="col-md-3">
                  <label>Original Due Date</label>
                  <div className="cls-orgduedate">
                    {formfield.originalDueDate
                      ? formatDate(formfield.originalDueDate)
                      : ""}
                  </div>
                </div>
              </div>
              <div className="row border-bottom">
                <div className="col-md-12">
                  <FrmRichTextEditor
                    title={"Action Plan"}
                    name={"actionPlan"}
                    value={formfield.actionPlan}
                    handleChange={handleSelectChange}
                    isRequired={true}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                  />
                </div>
              </div>
            </div>
            <div class="frm-container-bggray">
              <div className="row">
                <div className="col-md-3">
                  <FrmSelect
                    title={"Breach Status"}
                    name={"breachStatus"}
                    value={formfield.breachStatus}
                    handleChange={handleSelectChange}
                    isRequired={false}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={frmBreachStatus}
                  />
                </div>
                <div className="col-md-3">
                  <FrmDatePicker
                    title={"Date Action Closed"}
                    name={"dateActionClosed"}
                    value={formfield.dateActionClosed}
                    type={"date"}
                    handleChange={handleDateSelectChange}
                    isRequired={false}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    isdisabled={true}
                  />
                </div>
                <div className="col-md-3">
                  <FrmFileUpload
                    title={"Upload Attachment"}
                    name={"fullFilePath"}
                    uploadedfiles={formfield.breachAttachmentList}
                    value={""}
                    type={""}
                    handleFileUpload={handleFileUpload}
                    handleFileDelete={handleFileDelete}
                    isRequired={false}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                  />
                </div>
              </div>
              <div
                className={`row ${
                  isEditMode || isReadMode ? "border-bottom" : ""
                }`}
              >
                <div className="col-md-12">
                  <FrmRichTextEditor
                    title={"Action Update"}
                    name={"actionUpdate"}
                    value={formfield.actionUpdate}
                    handleChange={handleSelectChange}
                    isRequired={false}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                  />
                </div>
              </div>
            </div>
            {isEditMode || isReadMode ? (
              <div className="row mb20">
                <div className="col-md-3">
                  <label>Created by</label>
                  <br></br>
                  {formfield.creatorName}
                </div>
                <div className="col-md-3">
                  <label>Created Dated</label>
                  <br></br>
                  {formfield.createdDate
                    ? formatDate(formfield.createdDate)
                    : ""}
                </div>
                <div className="col-md-3">
                  <label>Modified By</label>
                  <br></br>
                  {formfield.lastModifiorName}
                </div>
                <div className="col-md-3">
                  <label>Modified Date</label>
                  <br></br>
                  {formfield.modifiedDate
                    ? formatDate(formfield.modifiedDate)
                    : ""}
                </div>
              </div>
            ) : (
              ""
            )}
          </>
        </form>
      </div>
      {!isReadMode ? (
        <div className="popup-footer-container">
          <div className="btn-container">
            {!isEditMode ? (
              <>
                <button className="btn-blue" onClick={handleSaveLog}>
                  Save
                </button>
              </>
            ) : (
              ""
            )}
            <button className="btn-blue" type="submit" form="myForm">
              Submit
            </button>
            <div className="btn-blue" onClick={() => hideAddPopup()}>
              Cancel
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {showpeoplepicker ? (
        <PeoplePickerPopup
          title={"Action Responsible"}
          name={"actionResponsible"}
          actionResponsible={
            formfield.actionResponsible ? [formfield.actionResponsibleAD] : []
          }
          assignPeoplepikerUser={assignPeoplepikerUser}
          hideAddPopup={hidePeoplePickerPopup}
        />
      ) : (
        ""
      )}
    </div>
  );
}
const mapStateToProp = (state) => {
  return {
    state: state,
  };
};
const mapActions = {
  getAllUsers: userActions.getAllUsers,
  getLookupByType: lookupActions.getLookupByType,
  getAlllob: lobActions.getAlllob,
  getAllSegment: segmentActions.getAllSegment,
  getAllSublob: sublobActions.getAllSublob,
  uploadFile: breachlogActions.uploadFile,
  deleteFile: breachlogActions.deleteFile,
  getAllUsers: userActions.getAllUsers,
};
export default connect(mapStateToProp, mapActions)(AddEditForm);
