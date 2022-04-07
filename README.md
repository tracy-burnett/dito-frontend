# Dialect Translation Tool Frontend

Note: main branch auto-deploys to www.xygil.net.

## Project setup

Make sure you have both the latest version of NodeJS installed and npm installed.
You can find the link to install these here: https://nodejs.org/en/download/

Then, to get started with vue.js, clone the repository then run ```npm install```.

Once installed, run ```npm run serve``` and open https://localhost:8080 in your browser to view a local version of the site.
Vue.js has hot reloading enabled by default. Any changes will be reflected immediately.

To build and minify for production, run ```npm run build```.

### A note on project structure

```/public``` contains index.html and other public static files such as robots.txt

```/assets``` contains static assets such as images and fonts

```/components``` contains vue components which are imported by the files in ```/views```

```/router``` contains routing logic

```/store``` contains vuex, which is used to store the application state in local storage

```/views``` contains the pages

### Assigning tasks

There is a GitHub project board located in the ```Projects``` tab of this repository. Please refer to this for individual tasks and check it frequenty to keep up to date with development progress.

### Compiles and hot-reloads for development
```npm run serve```

### Compiles and minifies for production
```npm run build```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 04/07/2022 Audio Player Functionality (working on Windows Chrome)

- % loaded is displayed until the audio file is ready to be played
- the entire audio file is initially highlighted
- the highlighted area can be adjusted in multiple ways
-- you can manually change the topmost and bottommost timestamp displayed
-- you can drag and drop the edges of the highlighted portion independently
-- you can drag and drop the entire highlighted area to a different part of the waveform
-- you can click the "clear highlight" button and then drag-select a new portion of the audio to highlight
- you cannot listen to audio that is outside of the highlighted region (unless you adjusted the highlight away from where the audio was already playing)
- clicking the play button while the audio cursor is somewhere outside of the highlighted region will start playing the audio file from the beginning of the highlighted region
- you can click anywhere on the audio waveform to move the audio cursor to the place
- while the audio is paused, you can manually edit the "currently playing" timestamp to move the cursor to a different place
- you can use your scrollwheel or trackpad to zoom in and out on the audio waveform.  The cursor will always be centered while you are doing that.
