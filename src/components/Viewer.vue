<template>
  <div class="flex-auto">
    Display text here for {{ interpretation_id }} {{ title }}, in
    {{ language_name }}.<br /><br />
    <!-- {{ relevantCharacters }}<br /><br /> -->
    <!-- {{ parsedAssociations }}<br /><br /> -->
    <!-- {{ substringArray }}<br /><br /> -->

    <span
      v-for="substring in substringArray"
      :key="substring.startingcharacter"
    >
      <span
        v-if="highlight(substring.startingcharacter)"
        class="text-red-600"
        @click="snapToTimestamp(substring.startingcharacter)"
        >{{ substring.text }}</span
      >
      <!-- <span v-if="true" class="text-red-600">{{substring.text}}</span> -->
      <span v-else @click="snapToTimestamp(substring.startingcharacter)">{{
        substring.text
      }}</span>
    </span>
    <br />

    <!-- {{ $store.state.audioplayertime }} -->
    <br />
    <!-- {{displayed_latest_text}} -->
    <!-- raw associations: {{ associations }}<br /> -->
    <!-- number of trigger timestamps: {{ numberOfRelevantTimestamps }}<br /> -->
    <br />
    <!-- next timestamp to change highlight at: {{ $store.state.nextTimestamp
    }}<br /> -->
    <!-- next next timestamp to change highlight at:
    {{ $store.state.nextnextTimestamp }} -->
  </div>
</template>

<script>
export default {
  name: "Viewer",
  data: () => {
    return {
      startslice: 0,
      language_name: "",
      title: "",
      endslice: 0,
      relevantCharacters: [],
      parsedAssociations: [],
      substringArray: [],
      latest_text: "",
      //   "Yesterday, as the two of us were talking, one thing I said was, ‘Wherever there is real living of life, there is beauty.’  If you want to experience the beauty of living life, your heart must be attentive to it. For example, in the system of my childhood, herding livestock on the grassland, if people had stayed distracted by such things as looking at phones and staying in outside teahouses—like children these days do—I don’t think they would have had any chance to see the beauty of life.  I think to myself, ‘In general these days, aren’t there very few nomads who see the beauty of their own lives and livelihoods?’  Something seems to be replacing it, and I wonder, ‘Could the most important thing be whether one’s heart is attentive to real life?’  It is difficult to say precisely whether or not this is the case. For example, reflecting on a single couple: in the past, after breakfast, the men would herd their livestock to far-off pastures, eat on the grassland and abide there in leisure.  When they were coming back home in the evening, their wives for their part saw them coming, herding animals, accompanied by the murmuring of livestock beneath sunset’s blushing clouds.  For one thing, they had been separated for the entire day.  For another, the beauty of their husbands drawing near—their particular form; their appearance on their horse; the scene of them herding livestock—brought with it a feeling like hope. It was like that whenever women drew near as well, like when I used to see my mother.  That too was beauty: black yak-hair tent, smoke, and yonder the motions of women at work carrying water jugs or baskets for yak dung on their backs.  The scene would slowly come to embody what seemed like a movie.  Then, when the couple gathered in their black yak-hair tent again—for example, coming back in from having gone outside and glanced around—and squeezed close to the glowing light there, that light was the waving, blazing hearth fire of their black yak-hair tent.  They would stretch up and down and sit, and if the husband told stories of the day and the far-off pastures, they would all be new.  Really, from this, sometimes I think there is one hundred percent the semblance of romance.  This is living life.  When not many people had interfered with the lifestyle of that time, it was an extremely good and enjoyable way to live.  However, these days, a variety of things like phones have strong propensity to obscure the beauty-perceiving heart.  ‘Once people cannot see beauty, has huge change arrived?’ I wonder.",
      associations: null,
      i: 0,
    };
  },

  watch: {
    interpretationStatus: function () {
      console.log("switched");
      this.fetchNewInterpretation();
    },
  },
  computed: {
    //     displayed_latest_text: function () {
    // const text = 'This is a test to see whether nested style spans work properly.'
    // const styling = [
    //   {start: 22, end: 54, type: "strong"},
    //   {start: 30, end: 36, type: "a"},
    //   {start: 37, end: 48, type: "em"},
    //   {start: 43, end: 48, type: "a"}
    // ];
    // const result = [...text].reduce((a, v, i) => {
    //   styling.filter(s => s.start === i).forEach(s => a += `<${s.type}>`);
    //   styling.filter(s => s.end === i).forEach(s => a += `</${s.type}>`);
    //   return a + v;
    // }, '');
    // return result;
    //     },
  },
  props: {
    audio_filename: {
      default: "",
    },
    audio_id: {
      default: "",
    },
    interpretation_id: { default: "" },
    interpretationStatus: { default: "" },
  },
  components: {},
  mounted() {
    if (this.interpretationStatus) {
      this.fetchNewInterpretation();
    }
    //     const temporarythis = this;
    // this.$nextTick(function () {
    // console.log('hi' + this.associations)
    // console.log(this.latest_text)

    // })
  },

  //   updated(){      this.parsedAssociations.forEach((element) => {
  //  if (element.endTime == "end") {
  //               element.endTime = this.$store.state.audioDuration
  //             }})},

  methods: {
    fetchNewInterpretation() {
      // console.log("hi");
      console.log("status " + this.interpretationStatus);
      const apiUrl =
        process.env.VUE_APP_api_URL +
        "interpretations/" +
        this.interpretation_id +
        "/audio/" +
        this.audio_id +
        "/" +
        this.interpretationStatus +
        "/";
      // console.log(apiUrl);
      fetch(apiUrl, {
        method: "GET",

        headers: {
          "Content-Type": "application/json",

          Authorization: this.$store.state.idToken,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.title = data.interpretation.title;
          this.language_name = data.interpretation.language_name;
          this.latest_text = data.interpretation.latest_text;

          //   this.$store.commit(
          //   "updateLatestText",
          //   data.interpretation.latest_text
          // )
        })

        .then(() => {
          fetch(
            process.env.VUE_APP_api_URL +
              "content/" +
              this.audio_id +
              "/" +
              this.interpretation_id,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",

                Authorization: this.$store.state.idToken,
              },
            }
          )
            .then((response) => response.json())
            .then((data) => {
              this.associations = data.associations;
            })
            .then(() => this.clearTriggerTimestamps())
            // .then(() =>
            //   console.log(JSON.stringify(this.$store.state.triggerTimestamps))
            // )
            .then(() => this.assignTriggerTimestamps())
            .then(() => this.parsed_associations())
            .then(() => {
              this.latest_text_slices();
            })
            .catch((error) => console.error("Error:", error));
        })

        .catch((error) => console.error("Error:", error));
    },

    clearTriggerTimestamps() {
      this.$store.commit("clearTriggerTimestamp");

      // console.log(this.$store.state.triggerTimestamps)
      for (let i = 0; i < Object.keys(this.associations).length; i++) {
        let startTime = Object.keys(this.associations)[i].split("-")[0];
        let endTime = Object.keys(this.associations)[i].split("-")[1];
        this.$store.commit("addTriggerTimestamp", startTime);
        this.$store.commit("addTriggerTimestamp", endTime);
      }
    },

    snapToTimestamp(startingcharacter) {
      // console.log("starting character is " + startingcharacter);
      let potentialSnapArray = [];
      this.parsedAssociations.forEach((element) => {
        //  if (element.endTime == "end") {
        //               element.endTime = this.$store.state.audioDuration
        //             }
        // console.log(element.endTime)

        if (
          startingcharacter >= element.startCharacter &&
          startingcharacter < element.endCharacter
        ) {
          //         console.log(this.$store.state.audioplayertime + " >= " + element.startTime)
          // console.log(this.$store.state.audioplayertime + " <= " + element.endTime)
          // console.log(startingcharacter + " >= " + element.startCharacter)
          // console.log(startingcharacter + " <= " + element.endCharacter)

          potentialSnapArray.push(element.startTime);
        }
      });
      potentialSnapArray.sort((a, b) => a - b);
      let playFromTimestamp =
        potentialSnapArray[potentialSnapArray.length - 1] / 100;
      // throw an event to make playervertical start playing from playFromTimestamp

      this.$store.commit("updateIncomingCurrentTime", playFromTimestamp);
      // console.log(
      //   "potential snap array is " +
      //     potentialSnapArray +
      //     ", all in milliseconds"
      // );
      // console.log(
      //   "potential snap array length is " + potentialSnapArray.length
      // );
      // console.log("start playing from " + playFromTimestamp + " seconds");
      potentialSnapArray.length = 0;
    },

    highlight(startingcharacter) {
      // console.log("highlight starting character " + startingcharacter);
      let k = 0;
      this.parsedAssociations.forEach((element) => {
        //  if (element.endTime == "end") {
        //               element.endTime = this.$store.state.audioDuration
        //             }
        // console.log(element.endTime)
        if (
          this.$store.state.audioplayertime >= element.startTime &&
          (this.$store.state.audioplayertime < element.endTime ||
            element.endTime == "end")
        ) {
          // console.log(this.$store.state.audioplayertime + " >= " + element.startTime)
          // console.log(this.$store.state.audioplayertime + " <= " + element.endTime + " or " + element.endTime + " = end")
          if (
            startingcharacter >= element.startCharacter &&
            startingcharacter < element.endCharacter
          ) {
            // console.log(
            //   this.$store.state.audioplayertime + " >= " + element.startTime
            // );
            // console.log(
            //   this.$store.state.audioplayertime + " < " + element.endTime
            // );
            // console.log(startingcharacter + " >= " + element.startCharacter);
            // console.log(startingcharacter + " <= " + element.endCharacter);

            k++;
          }
        }
      });
      // console.log(k + " is greater than 0");
      return k;
    },

    assignTriggerTimestamps() {
      for (let i = 0; i < Object.keys(this.associations).length; i++) {
        let startTime = parseInt(
          Object.keys(this.associations)[i].split("-")[0]
        );
        let endTime = parseInt(Object.keys(this.associations)[i].split("-")[1]);
        if (startTime != 0) {
          this.$store.commit("addTriggerTimestamp", startTime);
        }
        if (Number.isInteger(endTime)) {
          this.$store.commit("addTriggerTimestamp", endTime);
        }
      }

      //   console.log(JSON.stringify(this.$store.state.triggerTimestamps));
      this.$store.commit("orderTriggerTimestamp");
      //   console.log(JSON.stringify(this.$store.state.triggerTimestamps));
    },

    assignRelevantCharacters() {
      Object.values(this.associations).forEach((element) => {
        // for each character substring
        for (let i = 0; i < element.length; i++) {
          let startCharacter = parseInt(element[i].split("-")[0]);
          let endCharacter = parseInt(element[i].split("-")[1]) + 1;
          this.relevantCharacters.push(startCharacter);
          this.relevantCharacters.push(endCharacter);
        }
      });
    },

    latest_text_slices() {
      this.relevantCharacters.length = 0;
      this.assignRelevantCharacters();
      this.relevantCharacters.sort((a, b) => a - b);
      this.relevantCharacters = [...new Set(this.relevantCharacters)];
      this.substringArray = [];
      // console.log(JSON.stringify(this.relevantCharacters));
      // let beginningslice={}
      // this.startslice = 0;
      // this.endslice = this.relevantCharacters[0];
      // beginningslice.text = this.latest_text.substring(
      //   this.startslice,
      //   this.endslice
      // );
      // beginningslice.interval = 1;
      // this.substringArray.push(beginningslice);
      // console.log("slice " + this.startslice + " - " + this.endslice + ": " + this.slice)
      // console.log(this.substringArray[0])
      // console.log(JSON.stringify(this.substringArray));
      this.i = 0;
      while (this.i + 2 < this.relevantCharacters.length) {
        // console.log("in while loop")
        // console.log(this.i)
        let slice = {};
        this.startslice = this.relevantCharacters[this.i];
        this.endslice = this.relevantCharacters[this.i + 1];
        slice.text = this.latest_text.substring(this.startslice, this.endslice);
        slice.startingcharacter = this.startslice;
        this.substringArray.push(slice);
        // console.log(JSON.stringify(this.substringArray))
        // console.log("slice " + this.startslice + " - " + this.endslice + ": " + this.latest_text.substring(this.startslice,this.endslice))
        this.i++;
      }
      let finalslice = {};
      this.startslice = this.relevantCharacters[this.i];
      finalslice.text = this.latest_text.substring(this.startslice);
      finalslice.startingcharacter = this.startslice;
      this.substringArray.push(finalslice);
      // console.log("slice " + this.startslice + " - end: " + this.latest_text.substring(this.startslice))
    },

    parsed_associations: function () {
      this.parsedAssociations.length = 0;
      // this.associations.forEach(element => console.log(element))
      if (this.associations) {
        // console.log(Object.entries(this.associations))

        for (let i = 0; i < Object.keys(this.associations).length; i++) {
          let startTime = Object.keys(this.associations)[i].split("-")[0];
          let endTime = Object.keys(this.associations)[i].split("-")[1];
          // this.$store.commit("addTriggerTimestamp", startTime);
          // this.$store.commit("addTriggerTimestamp", endTime);
          let intervalsCount = Object.values(this.associations)[i].length;

          for (let j = 0; j < intervalsCount; j++) {
            // console.log(Object.values(this.associations)[i][j]) // this is the character interval, and the time interval is described above.
            let startCharacter = Object.values(this.associations)[i][j].split(
              "-"
            )[0];
            let endCharacter = Object.values(this.associations)[i][j].split(
              "-"
            )[1];

            let associationsObject = {};
            associationsObject.startTime = startTime;
            associationsObject.endTime = endTime;

            associationsObject.startCharacter = startCharacter;
            associationsObject.endCharacter = Number.parseInt(endCharacter) + 1;
            this.parsedAssociations.push(associationsObject);

            // console.log("start time: " + startTime);
            // console.log("end time: " + endTime);
            // console.log("start character: " + startCharacter);
            // console.log("end character: " + endCharacter);

            // if (
            //   this.$store.state.audioplayertime >= startTime &&
            //   this.$store.state.audioplayertime <= endTime
            // ) {
            //   //highlight the text between startCharacter and endCharacter
            // }
          }
        }
        // console.log(JSON.stringify(this.parsedAssociations));
      } else {
        // console.log("no associations fetched yet");
      }
      // return JSON.stringify(this.associations)
    },
  },
};
</script>
