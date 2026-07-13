"use client";
import React from "react";
import EditPageComponent from "../../components/EditPageComponent";
import withAuth from "../../components/withAuth";

const page = () => {
  return (
    <div className="bg-[#fefdf8] relative z-10">
      <EditPageComponent />
    </div>
  );
};

export default page;
