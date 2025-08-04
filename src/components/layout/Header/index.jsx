import { Link } from "react-router-dom";

import "./style.less";

import {
  LINK_HOME,
  LINK_POLICY_TABLE,
  PROJECT_NAME,
} from "../../../static/static.jsx";

function Header() {
  return (
    <div className="Header">
      <div className="HeaderContent">
        <div className="HeaderLogo">
          <Link to={LINK_HOME}>{PROJECT_NAME}</Link>
        </div>

        <div className="HeaderLinks">
          <Link to={LINK_HOME}>Главная</Link>
          <Link to={LINK_POLICY_TABLE}>Таблица полисов</Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
