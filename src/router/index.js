// import Vue from 'vue'
import { createWebHistory, createRouter } from "vue-router";
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import About from '../views/About.vue'
import User from '../views/User.vue'
import StorybookHorizontal from '../views/StorybookHorizontal.vue' // eventually may need to remove this
import Storybook from '../views/Storybook.vue' // eventually may need to remove this
import CreateStorybook from '../views/CreateStorybook.vue'
import Register from '../views/Register.vue';
import Profile from '../views/Profile.vue'



// Vue.use(VueRouter)





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
    path: '/user/',
    name: 'User',
    component: User
  },
  {
    path: '/profile/',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/storybook/',
    name: 'Storybook',
    component: Storybook,
    props: true
  },
  {
    path: "/createstorybook",
    name: "CreateStorybook",
    component: CreateStorybook
  }
]

const router = new createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
