# Dialect Interpretation and Translation Tool Front End

This is the front end repo for Dito (dialect interpretation and translation online), a project by Tracy Burnett.  Dito -
- lets public and private teams collaboratively annotate audio data
- includes an auto-segmenter for transcribing audio data
- calculates explicit phrase alignment between written translations
- auto-highlights nested aligned phrases simultaneously in multiple written translations
- uses phrase alignment information to automatically generate language lessons

Visit [Rain Story](https://dev.dito.live/storybook/8F43-Wdn_gU.wav?open=7h70ZiG6bwEavy1PMVUL8w) to see a sample project created for a software demonstration (video below) of Dito.  
Visit [Little Horse Crosses River](https://yakaloco.dito.live/storybook/S65cMnPPpJA.m4a?open=aQ_XB5yrA6QkB8X4sUIHyc) to see a sample project created by an undergraduate student team using Dito.

Dito backend was created using Vue, a JavaScript framework.  The [components/](https://github.com/skysnolimit08/dito-frontend/tree/main/src/components) and [views/](https://github.com/skysnolimit08/dito-frontend/tree/main/src/views) folders contain most of the handwritten code.

## User Interface Demo Videos

[Part 1](https://www.dropbox.com/scl/fi/qpckg5la7yd9254k1gmn7/points-1-3-Audio-Leveled.mp4?rlkey=o1lq8m5nzbuleywbgxa2v8e2v&dl=0 "Demo Video Part 1") (7:31)  
[Part 2](https://www.dropbox.com/scl/fi/ehfri9kken39v2y40eg7g/points-4-6-Audio-Leveled.mp4?rlkey=i2424wnwi3uhlhang3epz7d1g&dl=0 "Demo Video Part 2") (10:44)

## Status

Dito is live and can be [used/sampled online](https://dev.dito.live "Dito"), and Tracy Burnett offers unique subdomains to users for larger projects.  Tracy Burnett makes Dito free to users as a tool for revitalizing low-resource languages, especially those with no dedicated orthography/written script.  However, Tracy Burnett reserves the right to terminate these services at any point.

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

### Notes

Note: two separate pieces of code in Navbar_Sparse must be updated to accommodate new viewing languages (one has the displayed name and one has the language code).  
Note: main branch auto-deploys to live subdomains for users of dito.live. 

### 04/07/2022 Audio Player Functionality (working on Windows Chrome)

- % loaded is displayed until the audio file is ready to be played
- the audio file can be played once it is loaded (and the loading timer stops), even before the waveform is completely rendered
- the entire audio file is initially highlighted
- the highlighted area can be adjusted in multiple ways
- - you can manually change the topmost and bottommost timestamp displayed
- - you can drag and drop the edges of the highlighted portion independently
- - you can drag and drop the entire highlighted area to a different part of the waveform
- - you can click the "clear highlight" button and then drag-select a new portion of the audio to highlight
- you cannot listen to audio that is outside of the highlighted region (except in the case where you adjusted the highlight away from where the audio was already playing)
- clicking the play button while the audio cursor is somewhere outside of the highlighted region will start playing the audio file from the beginning of the highlighted region
- you can click anywhere on the audio waveform to move the audio cursor to that place
- while the audio is paused, you can manually edit the "currently playing" timestamp to move the cursor to a different place
- you can use your scrollwheel or trackpad to zoom in and out on the audio waveform.  The cursor will always be centered as you are zooming in and out.
