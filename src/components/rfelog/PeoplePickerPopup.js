import React, { useState, useEffect } from "react";
import Popup from "../common-components/Popup";
import FrmInputSearch from "../common-components/frmpeoplepicker/FrmInputSearch";
import { userActions, lobActions } from "../../actions";
import { connect } from "react-redux";
function PeoplePickerPopup(props) {
  const {
    title,
    name,
    actionResponsible,
    hideAddPopup,
    usertype,
    assignPeoplepikerUser,
    userState,
    getAllUsers,
    lobId,
    getallLobApprovers,
  } = props;
  const [formfield, setformfield] = useState({});
  const [issubmitted, setissubmitted] = useState(false);
  const [suggestedapprovers, setsuggestedapprovers] = useState([]);
  const handleInputSearchChange = (e) => {
    const searchval = e.target.value ? e.target.value : "#$%";
    getAllUsers({ UserName: searchval });
  };
  const handleAddUser = (e) => {
    e.preventDefault();
    setissubmitted(true);
    if (!formfield[name].length) {
      return;
    }
    assignPeoplepikerUser(name, formfield[name], usertype);
    hideAddPopup();
  };
  const handleApproverChange = (name, value) => {
    setformfield({ ...formfield, [name]: value });
  };
  useEffect(async () => {
    let tempapprover = [];
    if (lobId) {
      tempapprover = await getallLobApprovers({ lobid: lobId });
      setsuggestedapprovers([...tempapprover]);
    }
  }, []);

  return (
    <Popup {...props}>
      <div className="popup-box">
        <div className="popup-header-container">
          <div className="popup-header-title">{title}</div>
          <div className="popup-close" onClick={() => hideAddPopup()}>
            X
          </div>
        </div>

        <div className="popup-formitems">
          <form onSubmit={handleAddUser} id="peoplepickerfrm">
            <>
              <FrmInputSearch
                title={"Search User"}
                name={name}
                value={actionResponsible}
                type={"text"}
                handleChange={handleApproverChange}
                singleSelection={false}
                isRequired={true}
                validationmsg={"Mandatory field"}
                issubmitted={issubmitted}
                handleInputSearchChange={handleInputSearchChange}
                searchItems={userState.userItems ? userState.userItems : []}
                suggestedapprovers={suggestedapprovers}
              />
            </>
          </form>
        </div>
        <div className="popup-footer-container">
          <div className="btn-container">
            <button className="btn-blue" type="submit" form="peoplepickerfrm">
              Submit
            </button>
            <div className="btn-blue" onClick={() => hideAddPopup()}>
              Cancel
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
}
const mapStateToProp = (state) => {
  return {
    userState: state.userState,
  };
};
const mapActions = {
  getAllUsers: userActions.getAllUsers,
  getallLobApprovers: lobActions.getallLobApprovers,
};
export default connect(mapStateToProp, mapActions)(PeoplePickerPopup);
