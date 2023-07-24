import React from "react";

export default function extractTextFromChildren(children) {
  if (typeof children === "string") {
    return children; // Base case: return the string itself
  } else if (React.isValidElement(children)) {
    // If children is a React element, recursively extract text from its props.children
    return extractTextFromChildren(children.props.children);
  } else if (Array.isArray(children)) {
    // If children is an array, process each child recursively and concatenate the results
    return children.map((child) => extractTextFromChildren(child)).join("");
  } else {
    return ""; // For cases where children is null, undefined, or other non-text components
  }
} 
