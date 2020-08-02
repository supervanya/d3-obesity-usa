// States
var unitedStatesArray = "Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|District of Columbia|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming";

function populateStates(stateElementId) {
	var stateSelector = document.getElementById(stateElementId);

	stateSelector.length = 0;
	stateSelector.options[0] = new Option('Select State', '');
	stateSelector.selectedIndex = 0;

	var state_arr = unitedStatesArray.split("|");
	for (var i = 0; i < state_arr.length; i++) {
		stateSelector.options[stateSelector.length] = new Option(state_arr[i], state_arr[i]);
	}
}

populateStates("state")