// States
var unitedStatesArray = "Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|District of Columbia|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming";

function populateStates(stateElementId) {
	var stateElement = document.getElementById(stateElementId);
	var state_arr = unitedStatesArray.split("|");
	for (var i = 0; i < state_arr.length; i++) {
		stateElement.options[stateElement.length] = new Option(state_arr[i], state_arr[i]);
	}
}

populateStates("state")