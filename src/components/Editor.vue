<template>
  <div class="flex-auto">
    <!-- <button style="padding-left: 10px;
  padding-top: 10px;
  padding-bottom: 2px;" @click="newInterpretation()">
      <div class="h-10 w-10 
        flex
        justify-center
        items-center
        bg-sky-700
        rounded-full
        play
        shadow-lg
        text-white
        mr-4">+
      </div>
    </button><br><br><br><br><br> -->
    Display text here for {{ title }}, in {{ language_name }}.<br /><br />
    <textarea v-model="latest_text"></textarea>

    <button
      class="
        bg-indigo-500
        border border-indigo-400
        w-full
        text-sm
        px-3
        py-2
        mt-16
        rounded
        font-medium
        text-white
        hover:bg-indigo-400
        transition-colors
      "
      @click="updateText()"
    >
      Save Edits
    </button>
  </div>
</template>

<script>
export default {
  name: "Editor",
  data: () => {
    return {
      language_name: "",
      title: "",
      latest_text: "",
      //   "Yesterday, as the two of us were talking, one thing I said was, ‘Wherever there is real living of life, there is beauty.’  If you want to experience the beauty of living life, your heart must be attentive to it. For example, in the system of my childhood, herding livestock on the grassland, if people had stayed distracted by such things as looking at phones and staying in outside teahouses—like children these days do—I don’t think they would have had any chance to see the beauty of life.  I think to myself, ‘In general these days, aren’t there very few nomads who see the beauty of their own lives and livelihoods?’  Something seems to be replacing it, and I wonder, ‘Could the most important thing be whether one’s heart is attentive to real life?’  It is difficult to say precisely whether or not this is the case. For example, reflecting on a single couple: in the past, after breakfast, the men would herd their livestock to far-off pastures, eat on the grassland and abide there in leisure.  When they were coming back home in the evening, their wives for their part saw them coming, herding animals, accompanied by the murmuring of livestock beneath sunset’s blushing clouds.  For one thing, they had been separated for the entire day.  For another, the beauty of their husbands drawing near—their particular form; their appearance on their horse; the scene of them herding livestock—brought with it a feeling like hope. It was like that whenever women drew near as well, like when I used to see my mother.  That too was beauty: black yak-hair tent, smoke, and yonder the motions of women at work carrying water jugs or baskets for yak dung on their backs.  The scene would slowly come to embody what seemed like a movie.  Then, when the couple gathered in their black yak-hair tent again—for example, coming back in from having gone outside and glanced around—and squeezed close to the glowing light there, that light was the waving, blazing hearth fire of their black yak-hair tent.  They would stretch up and down and sit, and if the husband told stories of the day and the far-off pastures, they would all be new.  Really, from this, sometimes I think there is one hundred percent the semblance of romance.  This is living life.  When not many people had interfered with the lifestyle of that time, it was an extremely good and enjoyable way to live.  However, these days, a variety of things like phones have strong propensity to obscure the beauty-perceiving heart.  ‘Once people cannot see beauty, has huge change arrived?’ I wonder.",
      associations: {
        "": [],
      },
    };
  },
  computed: {
    // latest_text: {
    //   get() {return this.$store.state.latest_text},
    //   set (value) {
    //     this.$store.commit('updateLatestText', value)
    //   }
    // },
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
  methods: {
    updateText() {
      console.log(this.interpretationStatus);
      fetch(
        process.env.VUE_APP_api_URL +
          "interpretations/" +
          this.interpretation_id +
          "/audio/" +
          this.audio_id +
          "/" +
          this.interpretationStatus +
          "/",
        {
          method: "PATCH",
          body: JSON.stringify({
            latest_text: this.latest_text,
          }),
          headers: {
            "Content-Type": "application/json",

            Authorization: this.$store.state.idToken,
          },
        }
      )
        .then((response) => console.log(response))
        .catch((error) => console.error("Error:", error));
    },

    // newInterpretation() {},
  },
  mounted() {
    fetch(
      process.env.VUE_APP_api_URL +
        "interpretations/" +
        this.interpretation_id +
        "/audio/" +
        this.audio_id +
        "/" +
        this.interpretationStatus +
        "/",
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
        this.title = data.interpretation.title;
        this.language_name = data.interpretation.language_name;
        this.latest_text = data.interpretation.latest_text;
      })
      .catch((error) => console.error("Error:", error));
  },
};
</script>
