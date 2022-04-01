import React, { useState, useEffect, useLayoutEffect } from "react";
import { connect } from "react-redux";
import FrmInput from "../common-components/frminput/FrmInput";
import FrmDatePicker from "../common-components/frmdatepicker/FrmDatePicker";
import FrmSelect from "../common-components/frmselect/FrmSelect";
import FrmToggleSwitch from "../common-components/frmtoggelswitch/FrmToggleSwitch";
import FrmFileUpload from "../common-components/frmfileupload/FrmFileUpload";
import Loading from "../common-components/Loading";
import moment from "moment";
import "./Style.css";
import {
  EXEMPTION_ZUG_LOG_STATUS,
  EXEMPTION_URPM_LOG_STATUS,
  EXEMPTION_CONSTANT,
} from "../../constants";
import {
  userActions,
  lookupActions,
  lobchapterActions,
  commonActions,
  countryActions,
} from "../../actions";

import FrmRichTextEditor from "../common-components/frmrichtexteditor/FrmRichTextEditor";
import { alertMessage, dynamicSort, formatDate } from "../../helpers";
import PeoplePickerPopup from "./PeoplePickerPopup";
function AddEditForm(props) {
  const { lobchapterState, userState, countryState } = props.state;
  const {
    title,
    hideAddPopup,
    postItem,
    putItem,
    isReadMode,
    isEditMode,
    setInEditMode,
    formIntialState,
    getAllUsers,
    getAllCountry,
    getLookupByType,
    getToolTip,
    getAlllobChapter,
    uploadFile,
    deleteFile,
    userProfile,
    queryparam,
    selectedExemptionLog,
    setExemLogTypeFn,
    exemptionlogsType,
  } = props;
  const selectInitiVal = { label: "Select", value: "" };
  const [formfield, setformfield] = useState(formIntialState);
  const [issubmitted, setissubmitted] = useState(false);
  const [countryopts, setcountryopts] = useState([]);
  const [isfrmdisabled, setisfrmdisabled] = useState(false);
  const [isstatusdisabled, setisstatusdisabled] = useState(false);
  const [frmLoBChapter, setfrmLoBChapter] = useState([]);
  const [frmTypeOfExemption, setfrmTypeOfExemption] = useState([]);
  const [frmTypeOfBusiness, setfrmTypeOfBusiness] = useState([]);
  const [frmFullTransitional, setfrmFullTransitional] = useState([]);
  const [frmURPMSection, setfrmURPMSection] = useState([]);
  const [frmZUGStatus, setfrmZUGStatus] = useState([]);
  const [frmURPMStatus, setfrmURPMStatus] = useState([]);
  const [frmstatus, setfrmstatus] = useState([]);
  const [tooltip, settooltip] = useState({});
  const zuglog_status = {
    Pending: EXEMPTION_ZUG_LOG_STATUS.Pending,
    Empowerment_granted: EXEMPTION_ZUG_LOG_STATUS.Empowerment_granted,
    Empowerment_not_granted: EXEMPTION_ZUG_LOG_STATUS.Empowerment_not_granted,
    Withdrawn: EXEMPTION_ZUG_LOG_STATUS.Withdrawn,
    Expired_Not_Needed: EXEMPTION_ZUG_LOG_STATUS.Expired_Not_Needed,
  };
  const urpmlog_status = {
    Pending: EXEMPTION_URPM_LOG_STATUS.Pending,
    More_information_needed: EXEMPTION_URPM_LOG_STATUS.More_information_needed,
    Empowerment_granted: EXEMPTION_URPM_LOG_STATUS.Empowerment_granted,
    Empowerment_granted_with_conditions:
      EXEMPTION_URPM_LOG_STATUS.Empowerment_granted_with_conditions,
    Empowerment_not_granted: EXEMPTION_URPM_LOG_STATUS.Empowerment_not_granted,
    Withdrawn: EXEMPTION_URPM_LOG_STATUS.Withdrawn,
    No_Relevant: EXEMPTION_URPM_LOG_STATUS.No_Relevant,
  };
  const exemptionType_Individual = EXEMPTION_CONSTANT.TypeExemption_Individual;
  const [userroles, setuserroles] = useState({
    issubmitter: false,
    isapprover: false,
    isadmin: false,
    issuperadmin: false,
    isgrantedempowrment: false,
  });

  const ZUGMandatoryFields = [
    "countryID",
    "typeOfExemption",
    "typeOfBusiness",
    "lobChapter",
    "approver",
    "status",
  ];
  const URPMMandatoryFields = [
    "countryID",
    "typeOfExemption",
    "typeOfBusiness",
    "globalUWApprover",
    "globalUWStatus",
  ];
  const [mandatoryFields, setmandatoryFields] = useState([]);
  const [fileuploadloader, setfileuploadloader] = useState(false);
  useEffect(() => {
    let selectOpts = [];
    countryState.countryItems.forEach((item) => {
      selectOpts.push({
        label: item.countryName.trim(),
        value: item.countryID,
        regionId: item.regionID,
      });
    });
    selectOpts.sort(dynamicSort("label"));
    setcountryopts([selectInitiVal, ...selectOpts]);
  }, [countryState.countryItems]);

  const [logStatus, setlogStatus] = useState({});

  const [pcurmpmopts, setpcurmpmopts] = useState([
    {
      label: "No",
      value: false,
    },
    {
      label: "Yes",
      value: true,
    },
  ]);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    const tempuserroles = {
      issubmitter: false,
      isapprover: false,
      isadmin: false,
      issuperadmin: false,
      isgrantedempowrment: false,
    };
    if (formfield.isSubmit) {
      if (
        formfield.individualGrantedEmpowerment &&
        formfield.individualGrantedEmpowerment.indexOf(
          userProfile.emailAddress
        ) !== -1
      ) {
        tempuserroles.isgrantedempowrment = true;
      }
      if (
        formfield.approver &&
        formfield.approver.indexOf(userProfile.emailAddress) !== -1
      ) {
        tempuserroles.isapprover = true;
      }
      if (
        formfield.empowermentRequestedBy &&
        formfield.empowermentRequestedBy.indexOf(userProfile.emailAddress) !==
          -1
      ) {
        tempuserroles.issubmitter = true;
      }
      if (userProfile.isAdmin) {
        tempuserroles.isadmin = true;
      }
      if (userProfile.userRoles[0].roleName === "SuperAdmin") {
        tempuserroles.issuperadmin = true;
      }
    }
    setuserroles({ ...userroles, ...tempuserroles });
  }, []);
  useEffect(async () => {
    if (userroles.isapprover || userroles.isgrantedempowrment) {
      getAllCountry();
    } else {
      getAllCountry({ IsLog: true });
    }
    let tempTypeOfExemption = await getLookupByType({
      LookupType: "EXMPTypeOfExemption",
    });
    let tempTypeOfBusiness = await getLookupByType({
      LookupType: "EXMPTypeOfBusiness",
    });
    let tempFullTransitional = await getLookupByType({
      LookupType: "EXMPFullTransitional",
    });
    let tempZUGStatus = await getLookupByType({
      LookupType: "EXMPZUGStatus",
    });
    let tempURPMStatus = await getLookupByType({
      LookupType: "EXMPGlobalUWStatus",
    });
    let tempURPMSection = await getLookupByType({
      LookupType: "EXMPURPMSection",
    });
    let tempToolTips = await getToolTip({ type: "ExemptionLogs" });
    let tooltipObj = {};
    tempToolTips.forEach((item) => {
      tooltipObj[item.toolTipField] = item.toolTipText;
    });
    settooltip(tooltipObj);

    tempTypeOfExemption = tempTypeOfExemption.map((item) => ({
      label: item.lookUpValue,
      value: item.lookupID,
    }));
    tempTypeOfBusiness = tempTypeOfBusiness.map((item) => ({
      label: item.lookUpValue,
      value: item.lookupID,
    }));
    tempFullTransitional = tempFullTransitional.map((item) => ({
      label: item.lookUpValue,
      value: item.lookupID,
    }));
    tempURPMSection = tempURPMSection.map((item) => ({
      label: item.lookUpValue,
      value: item.lookupID,
    }));

    let frmstatus = [];
    const statusArray =
      selectedExemptionLog === "zug" ? tempZUGStatus : tempURPMStatus;
    if (selectedExemptionLog === "zug") {
      setmandatoryFields([...ZUGMandatoryFields]);
    } else {
      setmandatoryFields([...URPMMandatoryFields]);
    }
    statusArray.forEach((item) => {
      let isshow = false;
      //status pending
      if (item.lookupID === logStatus.Pending) {
        if (!formfield.isSubmit || formfield.status === logStatus.Pending) {
          isshow = true;
        }
      }
      //status more information needed
      if (item.lookupID !== logStatus.Pending && formfield.isSubmit) {
        isshow = true;
        /* if (userroles.isapprover || userroles.issuperadmin) {
          
        }*/
      }

      if (isshow) {
        frmstatus.push({
          label: item.lookUpValue,
          value: item.lookupID,
        });
      }
    });
    tempTypeOfExemption.sort(dynamicSort("label"));
    tempTypeOfBusiness.sort(dynamicSort("label"));
    tempFullTransitional.sort(dynamicSort("label"));
    tempURPMSection.sort(dynamicSort("label"));

    setfrmTypeOfExemption([selectInitiVal, ...tempTypeOfExemption]);
    setfrmTypeOfBusiness([selectInitiVal, ...tempTypeOfBusiness]);
    setfrmFullTransitional([selectInitiVal, ...tempFullTransitional]);
    setfrmURPMSection([selectInitiVal, ...tempURPMSection]);
    setfrmZUGStatus([selectInitiVal, ...tempZUGStatus]);
    setfrmURPMStatus([selectInitiVal, ...tempURPMStatus]);
    if (frmstatus.length) {
      setfrmstatus([...frmstatus]);
    }
    setloading(false);
    setDefaultLogStatus();
  }, [userroles, isEditMode]);

  useEffect(() => {
    if (selectedExemptionLog === "zug") {
      setmandatoryFields([...ZUGMandatoryFields]);
    } else {
      setmandatoryFields([...URPMMandatoryFields]);
    }
    let logstatus =
      selectedExemptionLog === "zug" ? zuglog_status : urpmlog_status;
    setlogStatus(logstatus);
  }, [selectedExemptionLog]);

  useEffect(() => {
    const statusArray =
      selectedExemptionLog === "zug" ? [...frmZUGStatus] : [...frmURPMStatus];
    let tempstatus = [];
    statusArray.forEach((item) => {
      let isshow = false;

      //status pending
      if (item.lookupID === logStatus.Pending) {
        if (!formfield.isSubmit || formfield.status === logStatus.Pending) {
          isshow = true;
        }
      }
      //status more information needed
      if (item.lookupID !== logStatus.Pending && formfield.isSubmit) {
        isshow = true;
        /* if (userroles.isapprover || userroles.issuperadmin) {
          
        }*/
      }
      if (isshow) {
        tempstatus.push({
          label: item.lookUpValue,
          value: item.lookupID,
        });
      }
    });
    if (tempstatus.length) {
      setfrmstatus([...tempstatus]);
    }
    //setDefaultLogStatus();
  }, [logStatus]);

  useEffect(() => {
    if (frmstatus.length) {
      setDefaultLogStatus();
    }
  }, [frmstatus]);

  const setDefaultLogStatus = () => {
    if (formfield.isSubmit) {
      if (userroles.isapprover || userroles.issuperadmin) {
        setisstatusdisabled(false);
      } else if (
        userroles.isadmin ||
        userroles.issubmitter ||
        userroles.isgrantedempowrment
      ) {
        if (!isReadMode) setisstatusdisabled(true);
      }
      if (userroles.isapprover && !userroles.issuperadmin && !isReadMode) {
        //setisapprovermode(true);
      }
    } else {
      if (selectedExemptionLog === "zug") {
        setformfield({
          ...formfield,
          status: logStatus.Pending,
          globalUWStatus: "",
        });
      } else {
        setformfield({
          ...formfield,
          status: "",
          globalUWStatus: logStatus.Pending,
        });
      }
    }
  };

  useEffect(() => {
    getAlllobChapter({ isActive: true });
  }, []);

  useEffect(() => {
    let tempItems = lobchapterState.lobChapterItems.map((item) => ({
      label: item.lobChapterName,
      value: item.lobChapterID,
    }));
    tempItems.sort(dynamicSort("label"));
    setfrmLoBChapter([selectInitiVal, ...tempItems]);
  }, [lobchapterState.lobChapterItems]);

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
  };

  const handleMultiSelectChange = (name, value) => {
    //const tempval = value.map((item) => item.value);
    setformfield({ ...formfield, [name]: value });
  };
  const handleDateSelectChange = (name, value) => {
    let dateval = moment(value).format("YYYY-MM-DD");
    if (
      name === "receptionInformationDate" &&
      formfield.responseDate &&
      moment(value).isAfter(formfield.responseDate)
    ) {
      setformfield({ ...formfield, [name]: dateval, responseDate: null });
    } else {
      setformfield({ ...formfield, [name]: dateval });
    }
  };
  const handleFileUpload = async (name, selectedfile) => {
    const formData = new FormData();
    if (selectedfile) {
      // Update the formData object
      for (let i = 0; i < selectedfile.length; i++) {
        let file = selectedfile[i];
        formData.append("files", file, file.name);
      }
      let folderID = formfield.zugExemptionLogId
        ? formfield.rfeLogId
        : formfield.folderID
        ? formfield.folderID
        : "";

      formData.append("TempId", folderID);
      if (formfield.zugExemptionLogId) {
        formData.append("LogType", "zugLogs");
      }
    }
    setfileuploadloader(true);
    let response = await uploadFile(formData);
    if (response) {
      setfileuploadloader(false);
      if (!formfield.rfeLogId) {
        formfield.folderID = response.tempId;
      }
      let tempattachementfiles = [...formfield.exmpAttachmentList];

      response.attachmentFiles.forEach((item) => {
        let isExits = false;
        for (let j = 0; j < tempattachementfiles.length; j++) {
          let existfile = tempattachementfiles[j]["filePath"];
          existfile = existfile.split("\\")[existfile.split("\\").length - 1];
          let currentfile = item.split("\\")[item.split("\\").length - 1];
          if (existfile === currentfile) {
            isExits = true;
            break;
          }
        }
        if (!isExits) {
          tempattachementfiles.push({
            filePath: item,
            logAttachmentId: "",
          });
        }
      });
      setformfield({
        ...formfield,
        exmpAttachmentList: [...tempattachementfiles],
      });
    } else {
      setfileuploadloader(false);
      alert(alertMessage.commonmsg.fileuploaderror);
    }
  };
  const handleFileDelete = async (id, url) => {
    if (!window.confirm(alertMessage.rfelog.deleteAttachmentConfirm)) {
      return;
    }
    const requestParam = {
      id: id,
      uploadedFile: url,
    };
    const response = await deleteFile(requestParam);
    if (response) {
      alert(alertMessage.rfelog.deleteAttachment);
      let tempattachementfiles = [...formfield.exmpAttachmentList];
      tempattachementfiles = tempattachementfiles.filter(
        (item) => item.filePath !== url
      );
      setformfield({
        ...formfield,
        exmpAttachmentList: [...tempattachementfiles],
      });
    }
  };

  const [scrollPosition, setScrollPosition] = useState(0);
  const [showApprover, setshowApprover] = useState(false);
  const [showempowermentRequestedBy, setshowempowermentRequestedBy] = useState(
    false
  );
  const [showGrantedEmpowerment, setshowGrantedEmpowerment] = useState(false);
  const handleshowpeoplepicker = (usertype, e) => {
    e.target.blur();
    const position = window.pageYOffset;
    setScrollPosition(position);
    if (usertype === "approver") {
      setshowApprover(true);
    } else if (usertype === "empowermentRequestedBy") {
      setshowempowermentRequestedBy(true);
    } else if (usertype === "individualGrantedEmpowerment") {
      setshowGrantedEmpowerment(true);
    }
  };
  const hidePeoplePickerPopup = () => {
    setshowApprover(false);
    setshowempowermentRequestedBy(false);
    setshowGrantedEmpowerment(false);
    window.scrollTo({ top: scrollPosition, behavior: "smooth" });
  };
  const assignPeoplepikerUser = (name, value, usertype) => {
    let displayname = [];
    let email = [];

    value.forEach((item) => {
      displayname.push(item.firstName + " " + item.lastName);
      email.push(item["emailAddress"]);
    });
    let namefield = "";
    let adfield = "";
    let selvalue = value;

    if (usertype === "approver") {
      if (selectedExemptionLog === "zug") {
        namefield = "approverName";
        adfield = "approverAD";
      } else {
        namefield = "globalUWApproverName";
        adfield = "globalUWApproverAD";
      }
      selvalue = value[0];
    } else if (usertype === "empowermentRequestedBy") {
      namefield = "empowermentRequestedByName";
      adfield = "empowermentRequestedByAD";
      selvalue = value[0];
    } else if (usertype === "individualGrantedEmpowerment") {
      namefield = "individualGrantedEmpowermentName";
      adfield = "individualGrantedEmpowermentAD";
    }

    setformfield({
      ...formfield,
      [name]: email.join(","),
      [namefield]: displayname.join(","),
      [adfield]: selvalue,
    });
  };
  const validateform = () => {
    let isvalidated = true;
    for (let key in formfield) {
      if (mandatoryFields.includes(key) && isvalidated) {
        let value = formfield[key];
        if (key === "rfeLogDetails") {
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
    if (isfrmdisabled) {
      return;
    }
    setissubmitted(true);
    debugger;
    if (validateform()) {
      /*formfield.underwriterAD = {
        userName: formfield.underwriterName,
        emailAddress: formfield.underwriter,
      };*/
      let approverfieldname =
        selectedExemptionLog === "zug" ? "approver" : "globalUWApprover";
      if (
        formfield[approverfieldname].indexOf(formfield.empowermentRequestedBy) <
        0
      ) {
        if (isEditMode) {
          if (
            (userroles.isadmin || userroles.issubmitter) &&
            formfield.requestForEmpowermentStatus ===
              logStatus.More_information_needed
          ) {
            formfield.requestForEmpowermentStatus = logStatus.Pending;
          }
          putItem(formfield);
        } else {
          postItem({ ...formfield, isSubmit: true });
        }
      } else {
        alert(alertMessage.rfelog.invalidapprovermsg);
      }
    }
  };
  const handleSaveLog = () => {
    if (isfrmdisabled) {
      return;
    }
    if (formfield.countryID) {
      //setissubmitted(true);
      postItem({ ...formfield, isSubmit: false });
    } else {
      alert(alertMessage.rfelog.draftInvalid);
    }
    // }
    // hideAddPopup();
  };
  const hidePopup = () => {
    if (queryparam.id) {
      window.location = "/rfelogs";
    } else {
      hideAddPopup();
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="addedit-logs-container">
      <div className="addedit-header-container">
        <div className="addedit-header-title">{title}</div>
        <div className="header-btn-container">
          {!isEditMode && isReadMode && (
            <div
              className="btn-blue"
              onClick={() => setInEditMode()}
              style={{ marginRight: "10px" }}
            >
              Edit
            </div>
          )}
          <div className="addedit-close btn-blue" onClick={() => hidePopup()}>
            Back
          </div>
        </div>
      </div>
      {!formfield.zugExemptionLogId && !formfield.urpmExemptionLogId && (
        <div className="tabs-container">
          {exemptionlogsType.map((item) => (
            <div
              key={item.label}
              className={`tab-btn ${
                selectedExemptionLog === item.value ? "selected" : "normal"
              }`}
              onClick={() => setExemLogTypeFn(item.value)}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
      <div className="popup-formitems">
        <form onSubmit={handleSubmit} id="myForm">
          <>
            <div className="frm-field-bggray">
              <div className="row">
                <div className="col-md-3">
                  <FrmSelect
                    title={"Country"}
                    name={"countryID"}
                    value={formfield.countryID}
                    handleChange={handleSelectChange}
                    isRequired={true}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={countryopts}
                    isdisabled={isfrmdisabled}
                  />
                </div>
                <div className="col-md-3">
                  <FrmSelect
                    title={"Type of Exemption"}
                    name={"typeOfExemption"}
                    value={formfield.typeOfExemption}
                    handleChange={handleSelectChange}
                    isRequired={true}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    isToolTip={true}
                    tooltipmsg={tooltip["Classification"]}
                    issubmitted={issubmitted}
                    selectopts={frmTypeOfExemption}
                    isdisabled={isfrmdisabled}
                  />
                </div>
                <div className="col-md-3">
                  <FrmSelect
                    title={"Type of Business"}
                    name={"typeOfBusiness"}
                    value={formfield.typeOfBusiness}
                    handleChange={handleSelectChange}
                    isRequired={true}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    selectopts={frmTypeOfBusiness}
                    isdisabled={isfrmdisabled}
                  />
                </div>
                {formfield.typeOfExemption !== exemptionType_Individual && (
                  <div className="col-md-3">
                    <FrmInput
                      title={<>Individual Granted Empowerment</>}
                      name={"individualGrantedEmpowermentName"}
                      value={formfield.individualGrantedEmpowermentName}
                      type={"text"}
                      handleChange={handleChange}
                      handleClick={(e) =>
                        handleshowpeoplepicker(
                          "individualGrantedEmpowerment",
                          e
                        )
                      }
                      isReadMode={isReadMode}
                      isRequired={false}
                      isdisabled={isfrmdisabled}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                    />
                  </div>
                )}
              </div>
              <div className="row">
                {selectedExemptionLog === "zug" && (
                  <div className="col-md-3">
                    <FrmSelect
                      title={<>LoB Chapter / Document</>}
                      name={"lobChapter"}
                      value={formfield.lobChapter}
                      handleChange={handleSelectChange}
                      isRequired={true}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      isToolTip={false}
                      issubmitted={issubmitted}
                      selectopts={frmLoBChapter}
                      isdisabled={isfrmdisabled}
                    />
                  </div>
                )}

                <div className="col-md-3">
                  {selectedExemptionLog === "zug" ? (
                    <FrmInput
                      title={"Section"}
                      name={"section"}
                      value={formfield.section}
                      type={"text"}
                      handleChange={handleChange}
                      isReadMode={isReadMode}
                      isRequired={false}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                    />
                  ) : (
                    <FrmSelect
                      title={<>Section</>}
                      name={"section"}
                      value={formfield.section}
                      handleChange={handleSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      isToolTip={false}
                      issubmitted={issubmitted}
                      selectopts={frmURPMSection}
                      isdisabled={isfrmdisabled}
                    />
                  )}
                </div>

                <div className="col-md-6">
                  <FrmInput
                    title={"Section Subject"}
                    name={"sectionSubject"}
                    value={formfield.sectionSubject}
                    type={"text"}
                    handleChange={handleChange}
                    isReadMode={isReadMode}
                    isRequired={false}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                  />
                </div>
                {selectedExemptionLog !== "zug" && (
                  <div className="col-md-3">
                    <FrmDatePicker
                      title={"End Date of Temporary Request"}
                      name={"temporaryRequestEndDate"}
                      value={formfield.temporaryRequestEndDate}
                      type={"date"}
                      handleChange={handleDateSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      minDate={""}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                      isdisabled={isfrmdisabled}
                    />
                  </div>
                )}
              </div>
              <div
                className={`row ${selectedExemptionLog !== "zug" &&
                  "border-bottom"}`}
              >
                <div className="col-md-12">
                  {selectedExemptionLog === "zug" ? (
                    <FrmRichTextEditor
                      title={"Empowerment & Feedback Request"}
                      name={"empowermentAndFeedbackRequest"}
                      value={formfield.empowermentAndFeedbackRequest}
                      handleChange={handleSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                      isdisabled={isfrmdisabled}
                    />
                  ) : (
                    <FrmRichTextEditor
                      title={"Details of Request"}
                      name={"requestDetails"}
                      value={formfield.requestDetails}
                      handleChange={handleSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                      isdisabled={isfrmdisabled}
                    />
                  )}
                </div>
              </div>
              {selectedExemptionLog === "zug" && (
                <div className="row border-bottom">
                  <div className="col-md-3">
                    <FrmInput
                      title={<>Empowerment Requested By</>}
                      name={"empowermentRequestedByName"}
                      value={formfield.empowermentRequestedByName}
                      type={"text"}
                      handleChange={handleChange}
                      handleClick={(e) =>
                        handleshowpeoplepicker("empowermentRequestedBy", e)
                      }
                      isReadMode={isReadMode}
                      isRequired={true}
                      isdisabled={isfrmdisabled}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                    />
                  </div>
                  <div className="col-md-3">
                    <FrmSelect
                      title={<>Full/Transitional</>}
                      name={"fullTransitional"}
                      value={formfield.fullTransitional}
                      handleChange={handleSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      isToolTip={false}
                      issubmitted={issubmitted}
                      selectopts={frmFullTransitional}
                      isdisabled={isfrmdisabled}
                    />
                  </div>
                  <div className="col-md-3">
                    <FrmDatePicker
                      title={"Transitional Expiring Date of Empowerment"}
                      name={"transitionalExpireDate"}
                      value={formfield.transitionalExpireDate}
                      type={"date"}
                      handleChange={handleDateSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      minDate={""}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                      isdisabled={isfrmdisabled}
                    />
                  </div>
                  <div className="col-md-3">
                    <FrmToggleSwitch
                      title={"P&C URPM exemption required"}
                      name={"pC_URPMExemptionRequired"}
                      value={formfield.pC_URPMExemptionRequired}
                      handleChange={handleSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      isToolTip={true}
                      tooltipmsg={tooltip["MaterialBreach"]}
                      issubmitted={issubmitted}
                      selectopts={pcurmpmopts}
                      isdisabled={isfrmdisabled}
                    />
                  </div>
                </div>
              )}
            </div>
            <div class="frm-container-bggray">
              <div className="row">
                <div className="col-md-3">
                  {selectedExemptionLog === "zug" ? (
                    <FrmInput
                      title={"Approver"}
                      name={"approverName"}
                      value={formfield.approverName}
                      type={"text"}
                      handleChange={handleChange}
                      handleClick={(e) => handleshowpeoplepicker("approver", e)}
                      isRequired={true}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                      isdisabled={isfrmdisabled}
                    />
                  ) : (
                    <FrmInput
                      title={"Global UW Approver"}
                      name={"globalUWApproverName"}
                      value={formfield.globalUWApproverName}
                      type={"text"}
                      handleChange={handleChange}
                      handleClick={(e) => handleshowpeoplepicker("approver", e)}
                      isRequired={true}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                      isdisabled={isfrmdisabled}
                    />
                  )}
                </div>

                <div className="col-md-3">
                  {selectedExemptionLog === "zug" ? (
                    <FrmSelect
                      title={<>Status</>}
                      name={"status"}
                      value={formfield.status}
                      handleChange={handleSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                      selectopts={frmstatus}
                      isdisabled={isfrmdisabled || isstatusdisabled}
                    />
                  ) : (
                    <FrmSelect
                      title={<>Global UW Status</>}
                      name={"globalUWStatus"}
                      value={formfield.globalUWStatus}
                      handleChange={handleSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                      selectopts={frmstatus}
                      isdisabled={isfrmdisabled || isstatusdisabled}
                    />
                  )}
                </div>
                {selectedExemptionLog === "zug" && (
                  <div className="col-md-3">
                    <FrmDatePicker
                      title={"Expiring Date"}
                      name={"expiringDate"}
                      value={formfield.expiringDate}
                      type={"date"}
                      handleChange={handleDateSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      minDate={""}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                      isdisabled={isfrmdisabled}
                    />
                  </div>
                )}
              </div>

              <div className="row border-bottom">
                <div className="col-md-12">
                  {selectedExemptionLog === "zug" ? (
                    <FrmRichTextEditor
                      title={"Additional Approval Comments"}
                      name={"additionalApprovalComments"}
                      value={formfield.additionalApprovalComments}
                      handleChange={handleSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                      isdisabled={!isReadMode && isfrmdisabled}
                    />
                  ) : (
                    <FrmRichTextEditor
                      title={"Global UW Approver comments"}
                      name={"globalUWApproverComments"}
                      value={formfield.globalUWApproverComments}
                      handleChange={handleSelectChange}
                      isRequired={false}
                      isReadMode={isReadMode}
                      validationmsg={"Mandatory field"}
                      issubmitted={issubmitted}
                      isdisabled={!isReadMode && isfrmdisabled}
                    />
                  )}
                </div>
              </div>
            </div>

            <div class="">
              <div className="row ">
                <div className="col-md-6">
                  <FrmFileUpload
                    title={"Upload Attachment"}
                    name={"fullFilePath"}
                    uploadedfiles={formfield.exmpAttachmentList}
                    value={""}
                    type={""}
                    handleFileUpload={handleFileUpload}
                    handleFileDelete={handleFileDelete}
                    isRequired={false}
                    isReadMode={isReadMode}
                    validationmsg={"Mandatory field"}
                    issubmitted={issubmitted}
                    isshowloading={fileuploadloader ? fileuploadloader : false}
                    isdisabled={isfrmdisabled}
                  />
                </div>
              </div>
            </div>
            {isEditMode || isReadMode ? (
              <div className="row mb20 border-top pt10">
                <div className="col-md-3">
                  <label>Created by</label>
                  <br></br>
                  {formfield.creatorName}
                </div>
                <div className="col-md-3">
                  <label>Created Date</label>
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
                <button
                  className={`btn-blue ${isfrmdisabled && "disable"}`}
                  onClick={handleSaveLog}
                >
                  Save
                </button>
              </>
            ) : (
              ""
            )}
            <button
              className={`btn-blue ${isfrmdisabled && "disable"}`}
              type="submit"
              form="myForm"
            >
              Submit
            </button>
            <div className={`btn-blue`} onClick={() => hidePopup()}>
              Cancel
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {showApprover ? (
        <PeoplePickerPopup
          title={"Approver"}
          name={
            selectedExemptionLog === "zug" ? "approver" : "globalUWApprover"
          }
          usertype="approver"
          actionResponsible={
            selectedExemptionLog === "zug"
              ? formfield.approver
                ? [formfield.approverAD]
                : []
              : formfield.globalUWApprover
              ? [formfield.globalUWApproverAD]
              : []
          }
          assignPeoplepikerUser={assignPeoplepikerUser}
          hideAddPopup={hidePeoplePickerPopup}
          lobId={formfield.lobId}
          singleSelection={true}
        />
      ) : (
        ""
      )}
      {showempowermentRequestedBy ? (
        <PeoplePickerPopup
          title={"Empowerment Requested By"}
          name={"empowermentRequestedBy"}
          usertype="empowermentRequestedBy"
          actionResponsible={
            formfield.empowermentRequestedBy
              ? [formfield.empowermentRequestedByAD]
              : []
          }
          assignPeoplepikerUser={assignPeoplepikerUser}
          hideAddPopup={hidePeoplePickerPopup}
          singleSelection={true}
        />
      ) : (
        ""
      )}
      {showGrantedEmpowerment ? (
        <PeoplePickerPopup
          title={"individualGrantedEmpowerment"}
          name={"individualGrantedEmpowerment"}
          usertype="individualGrantedEmpowerment"
          actionResponsible={
            formfield.individualGrantedEmpowerment
              ? [...formfield.individualGrantedEmpowermentAD]
              : []
          }
          assignPeoplepikerUser={assignPeoplepikerUser}
          hideAddPopup={hidePeoplePickerPopup}
          singleSelection={false}
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
  getToolTip: commonActions.getToolTip,
  getAlllobChapter: lobchapterActions.getAlllobChapter,
  getAllCountry: countryActions.getAllCountry,
  uploadFile: commonActions.uploadFile,
  deleteFile: commonActions.deleteFile,
  getAllUsers: userActions.getAllUsers,
};
export default connect(mapStateToProp, mapActions)(AddEditForm);