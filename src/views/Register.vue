<template>
   <div class="flex-auto">
       <SidebarAlt />
    <div class="flex-1 flex-col h-full overflow-hidden">
        <Navbar />
        <div class="flex justify-center items-center h-full mt-10">
            <div class="flex flex-col items-center border border-gray-300 bg-white shadow-md rounded-xl p-8 xl:w-1/5 lg:w-1/4 md:w-1/3">
                <h1 class="text-2xl font-bold">Register</h1>

                <input class="border border-gray-300 rounded w-full mt-12 mb-3 px-3 py-1" placeholder="Email" v-model="email" />
                <input class="border border-gray-300 rounded w-full px-3 py-1" placeholder="Password" type="password" v-model="password" />
                <button type="submit" class="bg-indigo-500 border border-indigo-400 w-full text-sm px-3 py-2 mt-16 rounded font-medium text-white hover:bg-indigo-400 transition-colors" @click="register(email, password)">Register</button>

                <router-link to="/login"><button class="bg-indigo-500 border border-indigo-400 w-full text-sm px-3 py-2 mt-16 rounded font-medium text-white hover:bg-indigo-400 transition-colors">Login</button></router-link>
            </div>
        </div>
    </div>
   </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import SidebarAlt from "@/components/SidebarAlt.vue";
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyDzNlYb6KECB-rBnKUhb9t1am75ifIvGrw",
  authDomain: "dito-4b412.firebaseapp.com",
  projectId: "dito-4b412",
  storageBucket: "dito-4b412.appspot.com",
  messagingSenderId: "69037442589",
  appId: "1:69037442589:web:e4d9aa6d36ca42648228f4",
  measurementId: "G-Q4MK1SYW8X"
};

// For production apps, the config details are added in a separate file and referred to in the main file.  Do I need to do this with the above data?
const app = initializeApp(firebaseConfig);
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

export default {
    name: "Register",

    components: {
        Navbar,
        SidebarAlt
    },

    data() {
        return {
            email: "",
            password: ""
        };
    },
  methods: {
    register: function(email, password) {

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
    alert('success');
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    
alert('error');
    // ..
  });



        // firebase.auth().createUserWithEmailAndPassword(email, password)
        // .then((userCredential) => {
        //     // Signed in 
        //     var user = userCredential.user;
        //     // ...
        //     alert('success');
        // })
        // .catch((error) => {
        //     var errorCode = error.code;
        //     var errorMessage = error.message;
        //     // ..
        //     alert('error');
        // });
        // alert('bye');
    }
  }
}
</script>

<style scoped>

</style>