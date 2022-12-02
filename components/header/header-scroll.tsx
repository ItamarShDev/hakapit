"use client";
import React, { useEffect } from "react";
function scrollFunction() {
  if (window.pageYOffset || document.documentElement.scrollTop > 30) {
    document.getElementById("page-header")?.classList.add("scrolled");
  } else {
    document.getElementById("page-header")?.classList.remove("scrolled");
  }
}

export default function HeaderScroll() {
  useEffect(() => {
    window.onscroll = () => scrollFunction();
  }, []);
  return <></>;
}
