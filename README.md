<center><h1><b>座り読み</b></h1></center>

| issues                                                                | forks                                                                | stars                                                                | license                                                                | codefactor                                                                                                                                                                                          | share                                                                                                |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| <img src="https://img.shields.io/github/issues/Nowaaru/suwariyomi" /> | <img src="https://img.shields.io/github/forks/Nowaaru/suwariyomi" /> | <img src="https://img.shields.io/github/stars/Nowaaru/suwariyomi" /> | <img src="https://img.shields.io/github/license/Nowaaru/suwariyomi" /> | <a href="https://www.codefactor.io/repository/github/nowaaru/suwariyomi/overview/main"><img src="https://www.codefactor.io/repository/github/nowaaru/suwariyomi/badge/main" alt="CodeFactor" /></a> | <img src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fgithub.com%2FNowaaru%2Fsuwariyomi" /> |

similarly to [Tachiyomi](https://github.com/tachiyomiorg/tachiyomi), suwariyomi is a free and open-source manga reader for <b>windows</b>.
<br />

this application is **_incomplete._** some features are bound to change; and some could be removed **entirely.**

<h2><b>downloads</b></h2>

downloads are available [here](https://github.com/Nowaaru/suwariyomi/releases).

found a bug or problem? make an issue!

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

<h2><b>styling</b></h2>
<h6><code>work in progress!</code></h6>
all pages have a series of dummy stylings that allow you to change the general format of the page:
these stylings look something among the lines of

- `...`Container
- `...`Inner

with enough experience, this alone gives you enough experience
to create an entirely different look and feel of the app,
you could even say that you're essentially making your own
application at that rate!

you can also style already-existing elements if you so
desire. anything that i style is what you can style!

<h2><b>"how do i contribute?"</b></h2>
as you know, doing everything alone all the time is unrealistic.
suwariyomi endeavors to be a community-driven application; those who
want something to be implemented can implement it themselves with ease and in order to generate that ease, people have to point out flaws in
the application; so <b>get to making issues</b> and <b>pull requests</b>!
<br/><br/>

<h3><b><i>if you are comitting...</i></b></h3>
follow these guidelines!
<h6><code>(some things might not be applicable)</code></h6>

- please make sure that your code is **clear and concise.**
  - if you disable linter rules, give an explanation why!
    it doesn't need to be an essay, but a short reason, i.e. '`Module is typed incorrectly.`' is preferable.
- if your code can be **abstracted into a component**, please do so!
  - a page should be a list of components. if a page itself
    is starting to look like a component, maybe you should start to do some splicing!
- use **comments** when it gets rough!
  - sometimes you'd have the occasional nested ternary or a snippet of code that simply looks weird or might go against standard. if something might be hard to understand to an intermediate or novice programmer, you probably want to **use a comment**.
- when updating pages or implementing components, give everything a style!
  - this is to ensure that everything can be styled to the user's liking in case we make a design choice that might not be for everyone's liking.
- if you are commenting or proposing changes to a PR, be **respectful** and clearly state your gripe.

  - being rude or passive-aggressive does nothing to help; all it does is brew unwanted argument. if you are unable to successfully follow this guideline, **you will be blocked from collaborating in this repository.** be kind!
    <br/>

<h3><b><i>if you are making an issue...</i></b></h3>
follow these guidelines!
<h6><code>(some things might not be applicable)</code></h6>

- make sure your issue is in the right spot!
  - if you're looking to report an issue or suggest a feature for an extension, we don't do that here! you should instead check the **extensions repository** instead of looking here.
- tag your issue correctly!
  - this allows us to focus on specific things at specific times and allows us to designate varying severities and other auxiliary tags to help production.
- if you're making a feature request, be **clear and concise**; as if you're coding.
  - we don't want to misinterpret what you say and close your issue despite it being a valid or necessary addition to the app. **be clear!**
- if you're reporting a bug, once again, be **clear and concise**.
  - give us as much information as possible, **treat us as if we're babies**! if we can't reproduce something after a handful of attempts, we'll mark it as **`invalid`** and **close it**. to reduce room for error, tell us everything!
  - if you have a clue as to why this might be happening, **let us know**! it doesn't matter whether you're wrong or not, it would at least narrow down what the issue could possibly be. everyone is knowledgeable! 😁

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
