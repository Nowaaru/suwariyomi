## You want to help translate Suwariyomi? That's great!

#### Translating this application is easier than one might think.

---

1. First, you'll have to clone the repository (see README.md).
2. After cloning the repository, make your way to `src/shared/locale`. This folder holds all of the languages.
3. Clone the base `en.json` and rename it to your target language's corresponding [`ISO 639-1 Code`](https://www.loc.gov/standards/iso639-2/php/code_list.php). ISO 639-2 works as well, but ISO 639-1 is preferred.
4. In the "`$meta`" field, change the `name` field to the full name of your target language. This is used for the dropdown label in Settings.
5. After making your translations by changing the text in the string, add your language in `src/shared/intl.ts` on the `mainTranslator` definition.
6. Do the same for the `locale` schema enum in `src/main/util/settings.ts`.
7. Commit your changes and make a pull request!

Thank you for your help!
