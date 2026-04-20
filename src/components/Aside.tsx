import LineChart from "./LineChart";

interface AsideProps {
  selectedState: string | null;
  lineCategory: string;
  onLineCategoryChange: (category: string) => void;
}

const CATEGORIES = ["Age Group", "Race/Ethnicity", "Education Attained", "Gender", "Household Income"];

export default function Aside({ selectedState, lineCategory, onLineCategoryChange }: AsideProps) {
  return (
    <aside>
      <div id="aside-content">
        {!selectedState && (
          <p id="aside-instruction">Click on the map to see how obesity has changed over the past two decades</p>
        )}

        <div id="line-chart-panel">
          {selectedState && (
            <>
              <h2 id="line-heading" style={{ display: "block" }}>
                How do different factors correlate with Obesity for {selectedState}?
              </h2>
              <form name="radios" id="lineChart-radioInputs" style={{ display: "block" }}>
                {CATEGORIES.map((cat) => (
                  <span key={cat}>
                    <input
                      type="radio"
                      name="btn"
                      id={cat}
                      value={cat}
                      checked={lineCategory === cat}
                      onChange={(e) => onLineCategoryChange(e.currentTarget.value)}
                    />
                    <label htmlFor={cat}>{cat}</label>
                  </span>
                ))}
              </form>
              <LineChart state={selectedState} category={lineCategory} />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
