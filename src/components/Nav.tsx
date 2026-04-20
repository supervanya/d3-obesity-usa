import type { CorrelationKey } from "../types";

interface NavProps {
  activeAxis: CorrelationKey | null;
  onSelectAxis: (axis: CorrelationKey) => void;
  onBackToMap: () => void;
  axisLabels: Record<CorrelationKey, string>;
}

const AXES: CorrelationKey[] = ["smokes", "poverty", "healthcare", "age", "income"];

export default function Nav({ activeAxis, onSelectAxis, onBackToMap, axisLabels }: NavProps) {
  return (
    <nav>
      <div id="main-logo">
        <svg width="50" height="88" className="nav-icon">
          <use xlinkHref="#obesity" />
        </svg>
        <span>
          <h1 id="main-logo-title">
            USA
            <br />
            Obesity
          </h1>
          <p id="main-logo-subtitle">The Story</p>
        </span>
      </div>

      <div className="nav-links">
        <p>Obesity is on the rise</p>
        <p>Factors that affect obesity</p>
      </div>

      <div id="correlation_selection">
        {AXES.map((axis) => (
          <span
            key={axis}
            className={`scatter-x-axis${activeAxis === axis ? " selected-axis" : ""}`}
            id={axis}
            onClick={() => onSelectAxis(axis)}
          >
            {axisLabels[axis]}
          </span>
        ))}
        <span className="scatter-x-axis" id="backToMap" onClick={onBackToMap}>
          Return to Cartogram
        </span>
      </div>

      <footer>
        <span id="umich-attribution">
          <p>
            Made with passion by the students of{" "}
            <a href="https://www.si.umich.edu/programs/courses/649">SI 649</a> University of Michigan -{" "}
            <a href="https://www.si.umich.edu/">School of Information</a>
          </p>
          <svg width="36" height="28" className="nav-icon">
            <use xlinkHref="#umich" />
          </svg>
        </span>
        <span id="github-link">
          <svg width="24" height="24" className="nav-icon">
            <use xlinkHref="#github" />
          </svg>
          <a href="https://github.com/supervanya/d3-obesity-usa">GitHub Repo</a>
        </span>
      </footer>
    </nav>
  );
}
