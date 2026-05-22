import React from "react";
import { categoryLabel, categoryCssClass } from "../../utils/formatters.js";

export default function CategoryBadge({ category }) {
  return (
    <span className={`badge-ko ${categoryCssClass(category)}`}>
      {categoryLabel(category)}
    </span>
  );
}