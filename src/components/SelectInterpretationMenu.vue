<template>
	<div>
		<div class="dropdown" style="float: right">
			<button class="dropbtn border-sky-600 bg-sky-700 hover:bg-sky-600" :class="{ tibetan: $store.state.promptsObject.name=='བོད་ཡིག', nottibetan: $store.state.promptsObject.name!='བོད་ཡིག' }">{{$store.state.promptsObject.bInterpretation}}</button>

			<div class="z-50 dropdown-content">
				<!-- for each interpretation in the list of interpretations to show in the menu, create a menu option that displays the language name -->
				<span v-for="interpretation in interpretationsList" :key="interpretation.id">
					<a @click="selectInterpretationMenu(interpretation.id)">{{ interpretation.title }}, in {{
						interpretation.language_name
					}}</a>
				</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "SelectInterpretationMenu",
	data: () => {
		return {};
	},
	props: {
		// the list of interpretations available to be selected in the Dropdown menu (does not include the interpretations currently being viewed)
		interpretationsList: {
			default: [],
		},
	},

	methods: {
		// tell the parent component that we are swapping the interpretation currently in the viewer with the one the User just selected from the Dropdown menu
		selectInterpretationMenu(interpretationselection) {
			this.$emit("changeInterpretationID", interpretationselection);
		},
	},
};
</script>

<style scoped>
.dropbtn {
	/* background-color: #7833ff; */
	border: none;
	color: white;
	padding: 1vh 1vh;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	/* margin: 4px 2px; */
	cursor: pointer;
	border-radius: 16px;
}

.dropdown {
	position: relative;
	display: inline-block;
}

.dropdown-content {
	display: none;
	position: absolute;
	right: 0;
	background-color: #f9f9f9;
	min-width: 160px;
	box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
	z-index: 1;
}

.dropdown-content a {
	color: black;
	padding: 12px 16px;
	text-decoration: none;
	display: block;
}



.dropdown-content a:hover {
	background-color: #f1f1f1;
}

.dropdown:hover .dropdown-content {
	display: block;
}

.tibetan {
	font-size: 1.25rem/* 14px */;
    line-height: 1.75rem/* 20px */;
}
.nottibetan {
	font-size: 0.875rem/* 14px */;
    line-height: 1.25rem/* 20px */;
}
@media (min-width: 768px) {
    .nottibetan {
        font-size: 1rem/* 16px */;
        line-height: 1.5rem/* 24px */;
    }
	.tibetan {
	font-size: 1.5rem/* 14px */;
    line-height: 2rem/* 20px */;
}
}

/* .dropdown:hover .dropbtn { */
/* background-color: #7833ff; */
/* } */
</style>

