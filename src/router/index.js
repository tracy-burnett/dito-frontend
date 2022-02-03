import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import About from '../views/About.vue'
import User from '../views/User.vue'
import Editor from '../views/Editor.vue'
import Storybook from '../views/Storybook.vue'
import Register from '../views/Register.vue'
import { initializeApp } from 'firebase/app';



Vue.use(VueRouter)



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

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: "/contact",
    name: "Contact",
    component: () => import('../views/Contact.vue')
  },
  {
    path: "/faq",
    name: "FAQ",
    component: () => import('../views/FAQ.vue')
  },
  {
    path: "/statement",
    name: "Statement",
    component: () => import('../views/Statement.vue')
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User
  },
  {
    path: '/storybook/:id',
    name: 'Storybook',
    component: Storybook
  },
  {
    path: "/editor",
    name: "Editor",
    component: Editor
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
