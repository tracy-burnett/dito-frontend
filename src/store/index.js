// import Vue from 'vue'
import Vuex from 'vuex'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, } from "firebase/auth";


export default new Vuex.Store({
  state: {
    // It's like data, but for your store.
    user: null, // currently logged-in user
    selected: "",
    checkedFilters: ["owner"],
    sidebar: false, // sidebar displayed or not
    playerRerender: "", // ID of audio file as it finishes uploading to AWS S3
    consoles: [], // array of ID's of interpretations for which there should be a viewer column currently displayed in the browser
    incomingCurrentTime: 0, // Viewer.vue can update this, and when it is updated, Player will start playing audio from this time
    incomingEndTime: 0,
    currentTimeUpdated: 0, // tells audio player to play again from incomingCurrentTime
    audioplayertime: 0, // the current time of the audio player
    idToken: null, // the idToken of the currently logged-in user
    consoleswidth: 0,
    prompterID: null, // the id of the interpretation currently using Prompter (there can only be one at a time)
    peaksData: [],
    infobit: "InfoRevitalize",
    infobitToBe: "InfoRevitalize",
    regionRerender: 0,
    dashboardRerender: 0,
    startTimePrompter: 0, // in s with hundredth of a second precision
    endTimePrompter: 0, // in s with hundredth of a second precision
    showStorybookModal: "",
    showAddViewersModal: "",
    showIntCollabModal: "", // this is shown to ownersofinterpretations when they manage the editors and viewers
    showIntViewersModal: "", // this is shown to editors of interpretations when they manage the viewers
    consolesheight: 0,
    audioDuration: 0,
    cardlistscrollposition: 0,
    triggerNewText: 0, // audio player uses this to tell prompter to generate new text into the text box for the new audio range
    renewViewer: 0, // makes Viewer load new associations, e.g. after resyncing text to audio
    checkViewerHighlight: 0, // makes Viewer redo current highlighting scheme
    authCompleted: false,
    playnoPausecounter: 0, // used to play audio player
    audioArray: [],
    audioArrayChanged: 0,
    lastParam: "last_updated_at",
    sortOrder: true,
    // getNewStorybooks: 0,
    searchterm: "",
    promptsObject: { name: "English", code: "en" },
    consoleschanged: 0,
    portalname: "",

  },
  getters: {
    // it's like computed properties, but for your store.
    maxsize(state) {
      return state.consoleswidth / state.consoles.length / 12 - 3
    },
  },
  mutations: {
    //Can be tracked by Vue dev tools in (at least Chrome) browser.
    //Try to avoid using asynchronous code in here.  If you want to use one of these functions asynchronously, call it from actions.

    mutateAudioArray(state, params) {
      let audioIndex = state.audioArray.map((audio) => audio.id).indexOf(params.id)
      // console.log(state.audioArray[audioIndex],title,description,publictf)

      // console.log(state.audioArray[audioIndex])
      state.audioArray[audioIndex] = params
      // console.log(state.audioArray)
      state.audioArrayChanged++
    },

    removeFromAudioArray(state, aid) {
      let audioIndex = state.audioArray.map((audio) => audio.id).indexOf(aid)


      state.audioArray.splice(audioIndex, 1)

      state.audioArrayChanged++

    },

    addToAudioArray(state, params) {
      if (
        state.audioArray &&
        state.audioArray.length > 0
      ) { state.audioArray.unshift(params) } else { state.audioArray.push(params) }
    },
    // mutateAudioArrayArchive(state, params) {
    //   // console.log(state.audioArray)
    //   let audioIndex = state.audioArray.map((audio) => audio.id).indexOf(params.audio_id)

    //   // console.log(state.audioArray)
    //   // console.log(audioIndex)
    //   state.audioArray[audioIndex].archived = params.archived
    //   state.audioArray[audioIndex].public = false

    //   state.audioArrayChanged++
    // },

    // getNewStorybooks(state) {
    //   state.getNewStorybooks++
    // },

    sortBy(state, param) {
      // console.log("sorting by " + param)
      if (param == "1") {
        param = "title";
      } else if (param == "2") {
        param = "description";
      } else if (param == "3") {
        param = "uploaded_by.display_name";
      } else if (param == "4") {
        param = "last_updated_at";
      } else if (param == "5") {
        param = "public";
      }

      if (param == state.lastParam) {
        // console.log(this.sortOrder)
        state.sortOrder = state.sortOrder ? false : true;
      }
      state.lastParam = param;
      // console.log(this.sortOrder)
      if (state.sortOrder) {
        state.audioArray.sort(function (a, b) {
          // console.log(a[param])
          // console.log(b[param])
          if (param == "uploaded_by.display_name") {
            if (a["uploaded_by"]["display_name"] < b["uploaded_by"]["display_name"]) {
              // console.log("yes")
              return -1;
            }
            if (a["uploaded_by"]["display_name"] > b["uploaded_by"]["display_name"]) {
              // console.log("no")
              return 1;
            }

          } else {
            if (a[param] < b[param]) {
              // console.log("yes")
              return -1;
            }
            if (a[param] > b[param]) {
              // console.log("no")
              return 1;
            }
          }
          return 0;
        });
      } else {
        state.audioArray.sort(function (a, b) {

          if (param == "uploaded_by.display_name") {
            if (a["uploaded_by"]["display_name"] < b["uploaded_by"]["display_name"]) {
              return 1;
            }
            if (a["uploaded_by"]["display_name"] > b["uploaded_by"]["display_name"]) {
              return -1;
            }

          }

          if (a[param] < b[param]) {
            return 1;
          }
          if (a[param] > b[param]) {
            return -1;
          }
          return 0;
        });
      }
      state.audioArrayChanged++
    },

    setAudioArray(state, array) {
      state.audioArray = array
      if (state.audioArray && state.audioArray.length > 0) {
        state.audioArray.sort(function (a, b) {
          if (a.last_updated_at < b.last_updated_at) {
            return 1;
          }
          if (a.last_updated_at > b.last_updated_at) {
            return -1;
          }
          return 0;
        });
      }
      state.audioArrayChanged++
    },

    Logout_User(state) {
      state.user = null
    },

    Login_User(state, user) {

      state.user = user
      state.infobit = state.infobitToBe
    },

    SetIdToken(state, token) {
      state.idToken = token
    },

    ClearIDToken(state) {
      state.idToken = null
    },

    toggleSidebar(state, visibility) {
      state.sidebar = visibility;
    },


    toggleInfobit(state, infobit) {
      if (infobit == "InfoRevitalize") { state.infobit = infobit; }
      else if (infobit == "Login") {
        state.infobit = "Login"
        state.infobitToBe = "PublicCardList"
      }
      else if (!state.user) {
        state.infobit = "Login"
        state.infobitToBe = infobit
      }
      else if (state.user) { state.infobit = infobit }
    },

    updateCheckedFilters(state, checkedFilters) {
      state.checkedFilters = checkedFilters
    },

    updateSelected(state, selected) {
      state.selected = selected
    },
    updateSearchTerm(state, searchterm) {
      state.searchterm = searchterm
    },

    confirmAuth(state) {
      state.authCompleted = true
    },

    reloadViewer(state) {
      state.renewViewer++
    },

    updateHighlights(state) {
      state.checkViewerHighlight++
    },

    updateIncomingCurrentTime(state, { timestamp, timestampEnd }) {
      // state.substringText = text
      if (timestamp <= 0) {

        state.incomingCurrentTime = 0
      }
      else {
        state.incomingCurrentTime = timestamp
      }
      state.incomingEndTime = timestampEnd
      state.currentTimeUpdated += 1
    },

    updateAudioTime(state, audiotime) {
      state.audioplayertime = audiotime;
    },

    updatePortalName(state, portalname) {
      state.portalname = portalname
    },

    updateStartTimePrompter(state, starttimeprompter) {
      // console.log("start time updated " + starttimeprompter)
      state.startTimePrompter = starttimeprompter;
    },

    forceTriggerNewText(state) {
      // console.log("start time updated")
      state.triggerNewText++
    },

    updateEndTimePrompter(state, endtimeprompter) {
      // console.log("end time updated " + endtimeprompter)
      state.endTimePrompter = endtimeprompter;
    },

    updateConsolesWidth(state, newwidth) {
      state.consoleswidth = newwidth
    },
    updatePrompterID(state, id) {
      state.prompterID = id
    },

    removePrompterID(state) {
      state.prompterID = null
    },

    updateConsolesHeight(state, newheight) {
      state.consolesheight = newheight
    },

    changeLanguage(state, promptsObject) {
      state.promptsObject = promptsObject
    },

    exchangeConsole(state, tempObject) {
      let index = state.consoles.indexOf(tempObject.formerinterpretation);

      if (index > -1) {
        state.consoles[index] = tempObject.newID
      }

      state.consoleschanged++

    },

    addConsolesCount(state, interpretation_id) {
      state.consoles.push(interpretation_id)
      state.consoleschanged++
    },

    deleteConsole(state, interpretation_id) {
      let index = state.consoles.indexOf(interpretation_id);
      // console.log(state.consoles)
      // console.log(state.index)

      if (index > -1) {
        state.consoles.splice(index, 1); // 2nd parameter means remove one item only
      }

      state.consoleschanged++

      // console.log(state.consoles)
    },

    updateAudioDuration(state, duration) {
      // console.log("updated in store")
      state.audioDuration = duration
    },

    clearConsoles(state) {
      state.consoles.length = 0
      state.consoleschanged++
    },


    forcePlayerRerender(state, interpretation_id) {
      state.playerRerender = interpretation_id
    },

    forceDashboardRerender(state) {
      state.dashboardRerender++
    },

    forceRegionRerender(state) {
      // console.log("rerender player")
      state.regionRerender++
      state.playnoPausecounter++
    },


    showStorybookModal(state, audio_id) {
      state.showStorybookModal = audio_id
    },

    hideStorybookModal(state) {
      state.showStorybookModal = null
    },


    showAddViewersModal(state, audio_id) {
      state.showAddViewersModal = audio_id
    },

    hideAddViewersModal(state) {
      state.showAddViewersModal = null
    },

    updatePeaksData(state, peaks) {
      state.peaksData = peaks
    },

    removePeaksData(state) {
      state.peaksData = []
    },

    showIntCollabModal(state, int_id) {
      state.showIntCollabModal = int_id
    },

    hideIntCollabModal(state) {
      state.showIntCollabModal = null
    },

    showIntViewersModal(state, int_id) {
      state.showIntViewersModal = int_id
    },

    hideIntViewersModal(state) {
      state.showIntViewersModal = null
    },


    updatescrollposition(state, scrollpos) {
      state.cardlistscrollposition = scrollpos
    },

  },
  actions: {


    Login_User: (context, { email, password }) => {
      // const email2 = email
      // const password2 = password
      return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => { return userCredential })
        .then((data) => {
          // onAuthStateChanged listener will handle user assignment
          context.commit('Login_User', data.user)
        })
        .catch((error) => {
          console.log("Oops. " + error.code + ": " + error.message);
        });




    },

    Logout_User: (context) => {
      context.commit('setAudioArray', [])
      signOut(auth)
        // .then(() => {
        // onAuthStateChanged listener will handle user assignment
        // context.commit('Logout_User')
        // })
        .then(() => {
          context.commit('toggleInfobit', "InfoRevitalize")
          // this.$router.replace("/");
        })
        .catch((error) => {
          // An error happened.
          console.log("Oops. " + error.code + ": " + error.message);
        });


    },

    Register_User: (context, { reg_email, reg_password, reg_display_name, reg_description, reg_anonymous, newinfobit }) => {
      return createUserWithEmailAndPassword(auth, reg_email, reg_password)
        .then((userCredential) => { return userCredential })
        // .then((data) => {
        // onAuthStateChanged listener will handle user assignment
        // console.log(data)
        // context.commit('Login_User', {email, password})
        // })
        .then(
          // setTimeout(

          (data) => {
            fetch(process.env.VUE_APP_api_URL + "user/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: data.user.accessToken,
              },
              body: JSON.stringify({
                display_name: reg_display_name.normalize('NFC'),
                description: reg_description.normalize('NFC'),
                anonymous: reg_anonymous,
                email: reg_email,
              }),
            })
              .then((response) => response.json())
              .then((response) => {
                console.log(response)

                // this.$router.replace("/");
                context.commit('toggleInfobit', newinfobit)

              })
              .catch(function (error) {
                console.log("Oops. " + error.code + ": " + error.message);
              });
          })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("Oops. " + error.code + ": " + error.message);
        }



          // , 2000)

        );



    },

  },
  modules: {
  }
})
