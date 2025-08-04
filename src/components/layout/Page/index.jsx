import classnames from "classnames";

import "./style.less";

import Footer from "../Footer";

function Page({ children, className }) {
  return (
    <div className="Page">
      <div className={classnames("PageContent", className)}>{children}</div>

      <Footer />
    </div>
  );
}

export default Page;
