import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.less";

import { LINK_ANKETA, LINK_POLICY_TABLE } from "../../../static/static.jsx";

import MainLayout from "../MainLayout/index.jsx";
import Home from "../../pages/Home/index.jsx";
import NoteFound from "../../pages/NoteFound/index.jsx";
import PolicyTable from "../../pages/PolicyTable/index.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path={LINK_ANKETA} element={<Home />} />
          <Route path={LINK_POLICY_TABLE} element={<PolicyTable />} />
          <Route path="*" element={<NoteFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
