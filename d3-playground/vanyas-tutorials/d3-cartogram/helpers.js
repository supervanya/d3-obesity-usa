export const parseRow = (row) => {
    for (let key in row) {
        if (key === "name") {
            const [county, state] = row.name.split(", ");
            row.state = state;
            row.county = county;
            delete row.name;
        } else if (key !== "geoid") {
            row[key] = Number(row[key]);
        }
    }
    return row;
}

export const createStatePacks = (data) => {
    const statesPacked = new Map();

    for (let [k, v] of data) {
        v.sort((a, b) => (b.total_households - a.total_households)); // step 0
        v = v.map(d => ({ data: d, r: radius(d.total_households) })); // step 1
        const nodes = packSiblings(v) // step 1
        const { r } = packEnclose(nodes) // step 2
        const state = states.features.find(d => d.properties.name === k); // step 3
        const { x, y } = state.properties; // step 3
        statesPacked.set(k, { nodes, r, x, y }); // step 4
    }
    return statesPacked;
}