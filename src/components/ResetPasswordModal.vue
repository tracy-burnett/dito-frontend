<template>
    <div class="flex flex-col items-center justify-center flex-auto h-full backdrop" @mousedown.self="closeModal()">
        <div
            class="flex flex-col items-center p-8 overflow-y-scroll bg-white border border-gray-300 shadow-md modal rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
            <button class="mx-4 my-2 text-xl text-gray-500" @click.prevent="closeModal()">
                ×
            </button>
            <h1 class="text-2xl font-bold">Reset Password</h1>
            <br />

            <div v-if="emailFailed & emailSent==false" class="text-red-600">Email not recognized. {{ $store.state.passwordresetretry }}
            </div>
            <br>

            Which email address did you use to register?
            <input class="w-full px-3 py-1 mt-4 mb-3 border border-gray-300 rounded" v-model="email_mixedcase"
                @keyup.enter="sendEmail(email)" />
            <button v-if="emailSent == false"
                class="w-full px-3 py-2 mt-8 text-sm font-medium text-white transition-colors border rounded bg-cyan-700 border-cyan-600 hover:bg-cyan-600"
                @click="sendEmail(email)">
                Request Email Link to Reset Password
            </button>
            <button v-if="emailSent == true"
                class="w-full px-3 py-2 mt-8 text-sm font-medium text-white transition-colors border rounded cursor-default bg-cyan-700 border-cyan-600">
                Email Sent
            </button>
        </div>
    </div>
</template>

<script>
import { getIdToken } from "firebase/auth";

export default {
    name: "ResetPasswordModal",
    components: {},
    data() {
        return {
            email_mixedcase: "",
            emailSent: false,
            emailFailed: false,
        };
    },
    props: {

    },
    watch: {
        "$store.state.passwordreset": function () {
            this.emailSent = true
        },
        "$store.state.passwordresetretry": function () {
            this.emailFailed = true
        },
    },

    computed: {
        email() {
            return this.email_mixedcase.toLowerCase().trim()
        },
    },

    methods: {


        async sendEmail(email) {
            if (this.emailSent == false) {
                this.$store.dispatch("Reset_Password", { email })
                .then((answer) => console.log(answer))
                .catch((error) => {
                    console.log("Oops. " + error.code + ": " + error.message);
                })
            }
        },



        closeModal() {
            this.$emit("closeResetPasswordModal");
        },
    },
};
</script>

<style scoped>
.backdrop {
    background: rgba(0, 0, 0, 0.5);
    position: fixed;
    width: 100%;
    height: 100%;
}

.modal {
    -ms-overflow-style: none;
    /* for Internet Explorer, Edge */
    scrollbar-width: none;
    /* for Firefox */
    overflow-y: scroll;
}

.modal::-webkit-scrollbar {
    display: none;
    /* for Chrome, Safari, and Opera */
}
</style>