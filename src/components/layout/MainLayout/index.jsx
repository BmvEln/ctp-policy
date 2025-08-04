import React from "react";
import { Outlet } from "react-router-dom";

import "./style.less";

import Header from "../Header/index.jsx";

function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default MainLayout;
