<template>
  <div class="flex flex-col items-center justify-center mt-32">
    
    <router-link  to="/user/">
    <button
					class="dropbtn border-sky-600 bg-sky-700 hover:bg-sky-600"
				>
					Manage Your Existing Audio & Interpretations
				</button></router-link>
  </div>
</template>

<script>

export default {
  data() {
    return {
    };
  },
  name: "InfoPublish",
  props: {


},
  // watch: {
  //   "$store.state.idToken": function () {
  //     this.getStorybooks();
  //   },
    
  // },
  components: {
  },
  mounted() {

  },
  methods: {},
};
</script>

<style scoped>

.dropbtn {
	/* background-color: #7833ff; */
	border: none;
	color: white;
	padding: 10px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	margin: 4px 2px;
	cursor: pointer;
	border-radius: 16px;
}
</style>