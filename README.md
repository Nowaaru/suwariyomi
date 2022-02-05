<center><h1><b>座り読み</b></h1></center>

|issues|forks|stars|license|share|
|------|-----|-----|-------|-----|
|<img src="https://img.shields.io/github/issues/Nowaaru/suwariyomi" />|<img src="https://img.shields.io/github/forks/Nowaaru/suwariyomi" />|<img src="https://img.shields.io/github/stars/Nowaaru/suwariyomi" />|<img src="https://img.shields.io/github/license/Nowaaru/suwariyomi" />|<img src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fgithub.com%2FNowaaru%2Fsuwariyomi" />

similarly to [Tachiyomi](https://github.com/tachiyomiorg/tachiyomi), suwariyomi is a free and open-source manga reader for <b>windows</b>, <b>linux</b>, and <b>macOS.</b>
<br />

this application is **_incomplete._** some features are bound to change; and some could be removed **entirely.**

<h2><b>downloads</b></h2>

downloads currently do not exist. <br />
if you wish to test the application, please observe the "how to build" section.

<h2><b>features</b></h2>

user features:

- online reading from one source. it is mangadex.
- tracker support: [MyAnimeList](https://www.myanimelist.com) and [AniList](https://anilist.co). more soon to come!
- its all in dark mode

developer features:

- modular sources (i did it in react, be proud.)
- it's fast
- i made it fast as well
- why doesn't it build
- very segmented for easy understanding; hopefully inviting for new contributors
- the code is pretty
- made in react. i don't know how to react

planned features:

- online reading from **all the sources.**
- support **Kitsu**, **Shikimori**, and **Bangumi** similarly to Tachiyomi
- library organization via categories
- custom themes; hopefully a theme repository!
- plugins to further extend user experience
- downloading

in short, i aim to accomplish what Tachiyomi can do and then some.

<h2><b>how to build</b></h2>
clone the repository and install the dependencies:

```
git clone --depth 1 --branch main https://github.com/Nowaaru/suwariyomi.git <your project name>
```

navigate into your new folder (if you didn't clone in the current directory) and run `npm install`.

```
cd <your project name>
npm install
```

to test the program, run `npm start`.
if you have a port conflict, change the port in `.erb/scripts/check-port-in-use.js` (or figure out command line args in node)

###### powered by [electron](https://github.com/electron/electron), [electron-react-boilerplate](https://github.com/electron-react-boilerplate), [Material UI](https://mui.com/), and [react](https://github.com/facebook/react). thank you.
