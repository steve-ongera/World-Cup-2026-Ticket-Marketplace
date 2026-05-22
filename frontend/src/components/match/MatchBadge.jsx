import React from "react";
import { stageLabel, stageCssClass } from "../../utils/formatters.js";

export default function MatchBadge({ stage, group }) {
  return (
    <span className={`badge-ko ${stageCssClass(stage)}`}>
      {stageLabel(stage)}
      {group ? ` · Group ${group}` : ""}
    </span>
  );
}