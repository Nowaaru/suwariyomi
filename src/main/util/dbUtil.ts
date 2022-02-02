import Enmap from 'enmap';
import { app } from 'electron';

const MangaDatabase = new Enmap({
  name: 'library',
  dataDir: app.getPath('userData'),
});

// Hierarchy:
/*
  MangaDatabase {
    Sources {
      SourceName {
        Enabled: boolean - If enabled, it will be shown in library (if manga from the source is in library) and in search results
        Manga [ - Is an array so we can have sorting methods
          {
            Name: string,
            MangaID: string,
            Author: string,

            Added: Date, - When the manga was added to the library
            LastRead: Date,
            Chapters: [
              {
                ChapterID: string,
                ChapterNumber: number,
                VolumeNumber: number,
                ChapterTitle: string,
                PageCount: number,
                CurrentPage: number,
              }
            ]
          }
        ]
      }
    }
  }
*/

export type Chapter = {
  ChapterID: string;
  Chapter: number | string;
  Volume: number | string;
  ChapterTitle: string;
  PageCount: number;
  CurrentPage: number;
  Groups: string[];
};

/**
 * @typedef {Object} Manga
 * @property {string} Name - The name of the manga.
 * @property {string} MangaID - Manga ID. Format varies depending on the source.
 * @property {string} SourceID - The source name of the manga.
 * @property {string[] | undefined} Authors - Array of authors. By default it's undefined; but the authors can be obtained by calling getAuthors on its source. Depending on the source, it could also be present in the manga object initially.
 * @property {string} Synopsis - Description of the manga.
 * @property {string[]} Tags - Array of tags.
 * @property {string | undefined} CoverURL - URL to the cover image.
 * @property {Date | undefined} Added - When the manga was added to the library. Null if not added.
 * @property {Date | undefined} LastRead - When the manga was last read.
 * @property {Chapter[] | undefined} Chapters - Array of chapters. By default it's undefined; but the chapters can be obtained by calling getChapters() on its source.
 */

/**
 * @type {Manga}
 */
export type Manga = {
  Name: string;
  MangaID: string;
  SourceID: string;
  Authors?: string[]; // Null, can be obtained by calling getAuthors()
  Synopsis: string;

  Tags: string[];
  CoverURL?: string;
  Added?: Date; // Null if never added to library
  LastRead?: Date; // Null if never read
  Chapters?: Chapter[];
};

export type MangaWithAuthors = Manga & Pick<Required<Manga>, 'Authors'>;

export type FullManga = MangaWithAuthors &
  Pick<Required<MangaWithAuthors>, 'Chapters'>;

export type LibraryManga = FullManga & Pick<Required<Manga>, 'Added'>;

export type Source = {
  Name: string;
  Enabled: boolean;
  Manga: Manga[];
};
export type Sources = {
  [sourceName: string]: Source;
};

const defaultData = {
  Sources: {
    MangaDex: {
      Enabled: true,
      Name: 'MangaDex',
      Manga: [
        {
          Name: 'LaLa',
          MangaID: '719e258b-e2aa-4f6b-9676-50118ad27f28',
          Authors: ['橘姬社', 'y神'],
          Synopsis:
            "Xia Yu Xun é uma estudante que por ter faltado em uma prova, teve que repetir um ano. Para todos os seus colegas de classe que são um ano menor que ela, Xia Yu Xun é uma Xue Jie (senpai, veterana) genial, alta, decidida, muito bela e muito “cool”. Claro que ela não pensa assim, adoraria ser mais baixa pois assim conseguiria usar roupas mais bonitas. Sua obsessão é tanta que desenha suas próprias criações, com intenção de algum dia surgir alguém com o “estilo” dos seus sonhos. Na escola acaba encontrando uma pessoa adequada para isso, mas fazer amizade com ela vai ser um pouco difícil…   \n  \n[Author's social media page](https://weibo.com/u/2120952702)  \n[Aminoapps Release Tracker for this series](https://aminoapps.com/c/yuri-manga-and-anime/page/item/lala/8BW5_lW1hXInDj8WxQb8W76N2a475JLKpKv)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            'Comedy',
            "Girls' Love",
            'School Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Lily',
          MangaID: '19daf6ef-6d95-46e5-9e1a-f4e5b655902f',
          Authors: ['橘姬社', 'y神'],
          Synopsis:
            "Yilin bumps into the tomboy Rouxi, sparking an interest between each other that slowly blooms.  \n  \nLinks:  \n[Author's social media page](https://weibo.com/u/2120952702)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Long Strip', "Girls' Love", 'School Life'],
          Chapters: [],
        },
        {
          Name: 'Her Lies',
          MangaID: 'acade594-f346-4f5f-acd0-3b5f936f4239',
          Authors: ['Lily Club', 'Fei Li'],
          Synopsis:
            "Zhao Fugui, a high school girl who can see everybody's score in life, puts herself at the frontline every day to find the perfect boyfriend. However, she never imagined that someone by her side already held a perfect score, and that she's deeply in love with her...",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Long Strip', "Girls' Love"],
          Chapters: [],
        },
        {
          Name: 'My Food Looks Very Cute',
          MangaID: 'b98c4daf-be1a-46c8-ad83-21d532995240',
          Authors: ['西凌萝卜'],
          Synopsis:
            'A vampire who has been sleeping for nearly two hundred years, Maria is awakened by a passing werewolf girl by a chance, and the moment the coffin is opened, the curse falls on the werewolf girl. The two girls set foot on the journey to the city',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Monsters',
            'Long Strip',
            "Girls' Love",
            'Fantasy',
            'Vampires',
            'Monster Girls',
            'Web Comic',
            'Supernatural',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'The Incapable Married Princess',
          MangaID: '0e217a9a-5302-4704-a6f7-06fa1d00d62c',
          Authors: ['石头人'],
          Synopsis:
            'For my country, I was prepared to sacrifice myself, even for marriage. But the one I had to marry happened to be a girl. I had thought I had pranked the goddess pranker, but unexpectedly the goddess had pranked me.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Official Colored',
            'Historical',
            'Long Strip',
            'Comedy',
            "Girls' Love",
          ],
          Chapters: [],
        },
        {
          Name: 'Baili Jin Among Mortals',
          MangaID: '5746bbb3-445d-4c31-948b-065098052b77',
          Authors: ['Viva'],
          Synopsis:
            "Baili Jin, a fairy who was living in heaven, eating and drinking without a care, broke her Majesty’s colourful, stained-glass plate at her birthday and got banished to the mortal realm. Now she has to begin her adventures in the mortal realm with all of her spiritual powers gone! In order to survive, the former fairy has to deliver take-out….  \n  \nAn endearingly silly fairy, a gentle restaurant manager, a reserved top student and a hard to resist yandere onee-san (kind on the outside, dark/possessive on the inside) , let the story of their beautiful friendship and youthful days begin!  \n  \nAuthor's weibo: [@Viva喂娃酱](https://weibo.com/vivaandjulys)   \nArtist's weibo: [@Julys橘奶司](https://weibo.com/julys0723) ",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            'Comedy',
            "Girls' Love",
            'Fantasy',
            'Web Comic',
          ],
          Chapters: [],
        },
        {
          Name: 'Working Overtime to Destroy the World!',
          MangaID: 'c55ae98b-bf28-4f50-b3b8-f11051556a1c',
          Authors: ['Stray Reed Workshop'],
          Synopsis:
            'Limbo is a shut-in girl who doesn\'t care for anything except her tentacle comics. Aside from that, everything else is meaningless. On her birthday she wished for the "destruction of the world" and was instead met with a demonic female programmer!   \r\n  \r\nThe two instantly hit it off, bonding over their common goal of world destruction, the two "project partners" hustle hard everyday to bring the world to an end with hilarious effect.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Long Strip', 'Comedy', "Girls' Love", 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: "What Should I Do If I've Signed a Marriage Contract with the Elven Princess",
          MangaID: 'd76d1db5-3488-4f1b-a5e1-10288056e531',
          Authors: ['Lily Club', 'Man Lin'],
          Synopsis:
            'Nan Yue was only in transit in the Kingdom of Elven. But she found that she signed a marriage contract with Ah Sha, the elven princess. Wait, I am a girl! How could I marry the princess? Wait, why am I wanted by the world after I sign the marriage contract?? To survive, I have to take the princess for a leap of faith – As expected of an uptown girl, you are pretty hot! – Get lost, you perv!!',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Comedy',
            "Girls' Love",
            'Slice of Life',
            'Cooking',
          ],
          Chapters: [],
        },
        {
          Name: 'Straight Girl Trap',
          MangaID: '0c8abbe9-ae3b-4591-a378-9eaaf9ddec18',
          Authors: ['去冰仙草冻'],
          Synopsis:
            "The regular office worker Zhan Ying, who is drama-queen at heart, recently encountered a question that made her face flush, heart pound, and become embarrassed at a complete loss. That is, she suddenly wondered if her cold queen boss Zhou Yuanyou, who is always taking care of her, has feelings for her?! Is it heartfelt, or is it just a straight trap? Zhan Ying didn't even have time to really think about it when she found herself already caught in the trap…",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            'Office Workers',
            "Girls' Love",
            'Drama',
            'Web Comic',
          ],
          Chapters: [],
        },
        {
          Name: "For Her, I'd Give It My All",
          MangaID: '9707d784-8619-4b82-bfda-d1e343763301',
          Authors: ['Jitai', '橘姬社'],
          Synopsis:
            'Jiaxia is a new editor for the comic company BliBli. Ever since high school she has admired comic artist Taiji-sensei, who inspired her to pursue a career in the 2D world. Although Taiji-sensei has a bad reputation in the publishing world for being lazy and troublesome, Jiaxia is determined to be her new editor. But will she be able to get Taiji-sensei to finally get motivated to draw a new comic?',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Long Strip', 'Comedy', "Girls' Love", 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: "I'm More Dangerous Than You",
          MangaID: 'b788e331-aa77-475d-819a-2f7b58561dc2',
          Authors: ['An De'],
          Synopsis:
            'When Jiang Wanshu met Ren Pingsheng, what she thought was her light, became the beginning of her nightmare. As a teacher, Ren Pingsheng seems gentle and considerate on the outside, but is secretly an extremely passionate reader of Jiang Wanshu\'s book. What seemed to be a "coincidental" first encounter was in truth calculated and planned.   \n  \nBehind the peaceful days, the crazy reader has begun her hunt…  \n  \n\n\n---',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Thriller',
            'Long Strip',
            'Romance',
            "Girls' Love",
            'School Life',
            'Mystery',
          ],
          Chapters: [],
        },
        {
          Name: 'Xian Chan Nu',
          MangaID: 'eb9ad4bd-3a08-4471-8c17-0e397e4e25a8',
          Authors: ['橘姬社', 'y神'],
          Synopsis:
            'Liu Shiqing, the lady in charge of the escort who loves to play, encounters a cicada to save her when she is out of danger and falls in love at first sight. A story of revenge and loyalty is about to unfold around humans and demons, masters and servants.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            "Girls' Love",
            'Fantasy',
            'Web Comic',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Housewife X JK',
          MangaID: '093a607f-5e60-454c-ad23-16797e6bec4b',
          Authors: ['Yakiniku Teishoku'],
          Synopsis:
            'A housewife and her daughter\'s friend have a little affair. Will they be caught or will it end as just "sex-friends"?',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ["Girls' Love", 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Liar Satsuki Can See Death',
          MangaID: 'fac1870c-2ca1-439c-bd97-020dbbd732f0',
          Authors: ['Ryouko'],
          Synopsis:
            '"You… are going to die tomorrow."  \n  \nMinadzuki Satsuki, 16 years old. Apart from being antisocial and declaring the death of her classmates, she is a normal high school second-year student. Her nickname is "Liar Satsuki".  \n  \nHowever, her eyes alone are abnormal. What she is gazing at is…  \n  \nTwitter of the author : <https://twitter.com/ryo_ichips>',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Thriller',
            'Psychological',
            "Girls' Love",
            'Gore',
            'School Life',
            'Horror',
            'Web Comic',
            'Slice of Life',
            'Supernatural',
            'Mystery',
          ],
          Chapters: [],
        },
        {
          Name: "Ami-chan's Diary",
          MangaID: '8ccc1bb2-b3d1-4f59-84d6-e4b0375a6d77',
          Authors: ['Yatosaki Haru'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'School Life', 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Kobayashi-san Chi no Maid Dragon',
          MangaID: '67b35ba4-9c53-4957-91e7-4f7884e4b412',
          Authors: ['Cool Kyoushinsha'],
          Synopsis:
            'Kobayashi lives alone in an apartment, until one day, Tooru appears and they end up living together. Tooru looks down on humans as inferior and foolish, but having been saved by Kobayashi-san, she does everything she can to repay the debt and help her with various things, although not everything goes according to plan.  \nA mythical everyday life comedy about a hard working office lady living with a dragon girl.  \n\n\n---',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Loli',
            'Monsters',
            'Action',
            'Comedy',
            'Magic',
            "Girls' Love",
            'Drama',
            'Fantasy',
            'Monster Girls',
            'Shota',
            'Slice of Life',
            'Supernatural',
          ],
          Chapters: [],
        },
        {
          Name: 'Kuchibeta Shokudou',
          MangaID: 'cd8c0cda-debe-40e4-a0ea-462046a97697',
          Authors: ['Bonkara'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ["Girls' Love", 'Web Comic', 'Slice of Life', 'Cooking'],
          Chapters: [],
        },
        {
          Name: 'I Favor the Villainess',
          MangaID: '22d6d048-9f9f-4c3a-95c2-3b145f110e20',
          Authors: ['Inori.', 'Aono Shimo'],
          Synopsis:
            "Ordinary office worker Oohashi Rei wakes up in the body of the protagonist of her favorite otome game, *Revolution*. To her delight, the first person to greet her is also her favorite character, Claire Francois–the main antagonist of the story! Now, Rei is determined to romance Claire instead of the game’s male leads. But how will her villainous lady love react to this new courtship?!\r\n\r\n---\r\n\r\n**Links:**  \r\n- [Author's Twitter](https://twitter.com/inori_narou) - Tweets in English, Japanese, and Korean.  \r\n- [Artist's Twitter](https://twitter.com/aonoesu) - Tweets only in Japanese.  \r\n- [Official English Novel](https://sevenseasentertainment.com/series/im-in-love-with-the-villainess-light-novel/)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Reincarnation',
            'Romance',
            'Comedy',
            'Video Games',
            'Magic',
            "Girls' Love",
            'Isekai',
            'Drama',
            'School Life',
            'Fantasy',
            'Villainess',
            'Adaptation',
          ],
          Chapters: [],
        },
        {
          Name: "There's No Way I Can Have a Lover! *Or Maybe There Is!?",
          MangaID: 'e160a8e3-304f-4dca-838b-ee1821c490d8',
          Authors: ['Musshu', 'Mikami Teren'],
          Synopsis:
            "Longing to be a normie, I, Renako Amaori, am finally making my high school debut after working so hard for it. However due to my communication impairment, I have a gloomy aura. And after being in the normie group day in day out, I got so exhausted and said “I can't do this anymore,” and reached my limit!  \r\n  \r\nDuring that time, I accidentally met the top student of our school. Perfect in face and figure unrivaled in sword and pen, our school's best high school girl: Mai Odzuka. We found in each other someone who we could open to and talk about our own troubles. What a nice friend I made, now I can surely get back on my own feet…is what I thought!  \r\n  \r\n“It seems that you, even as a girl, have made me fall in love with you.”  \r\n“…What!” Mai suddenly confessed to me. Wait! What about our friendship?  \r\n  \r\nAnd so, we now have different feelings we can’t tell each other: friendship or a romantic relationship. We’re now presenting each other its benefits and put them into practice to see what kind of relationship works best for us. Will I succeed with a successful high school life…?  \r\n  \r\nArt/Manga adaptation by Monsieur, original light novel by Mikami Teren. Light novel illustrations by Takeshima Eku.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            'Comedy',
            "Girls' Love",
            'School Life',
            'Adaptation',
          ],
          Chapters: [],
        },
        {
          Name: 'Us, The End of The World, And The Rest of Our Life',
          MangaID: 'd5516cef-0b92-4e7b-8c17-585ee3d73ace',
          Authors: ['Koruse'],
          Synopsis: '',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Sci-Fi',
            'Post-Apocalyptic',
            "Girls' Love",
            'Doujinshi',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Oshigoto desu yo! Akane-san',
          MangaID: '97eb5ee2-58e2-4f1e-9937-86723576a858',
          Authors: ['Kimura Matsuri'],
          Synopsis:
            "Crazy office 4-koma starring Akane, a programmer constantly haunted by encroaching deadlines, and Yamagami, a salesperson hunting for Akane's love by bringing her even more jobs!",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Comedy',
            'Office Workers',
            "Girls' Love",
            '4-Koma',
            'Web Comic',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Delinquent and Cooking Club',
          MangaID: '2353a4a2-c23d-49ef-88fb-811a83e26c7b',
          Authors: ['Yogentei'],
          Synopsis:
            'A delinquent asks the head of the cooking club to teach her how to make something as a present for the person she likes.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Oneshot',
            'Romance',
            'Comedy',
            "Girls' Love",
            'School Life',
            'Slice of Life',
            'Cooking',
          ],
          Chapters: [],
        },
        {
          Name: 'Hisokana Hana Emi',
          MangaID: '07938e06-15c9-4d56-87eb-f69e204d41d6',
          Authors: ['Yume Mitsuki'],
          Synopsis:
            "\"If I were to be honest, it would have been better if I were like everyone else.\"  \n  \nBecause of her eye-catching looks, there are rumors that Yohira Shino plays around with men. Thus, she is both treated as a nuisance and feared by those around her.  \n  \nOne day, she meets Yozakura Yuui, a sophomore upperclassman who Shino remembers disliking due to the former being an honors student. Howeover, due to some circumstances, they start to live together in the same dorm room. Though Shino initially opposes, she finds that there's something about Yuui that separates her from everyone she's encountered until now.   \n  \n[Artist's Twitter](https://twitter.com/Yumemitsuki125)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            "Girls' Love",
            'Drama',
            'School Life',
            'Web Comic',
            'Slice of Life',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: "Resonant Blue—Girl's Best Time",
          MangaID: '14adbe56-19fe-4cda-a870-47a14562ad1e',
          Authors: ['Yorumo'],
          Synopsis:
            '"I haven\'t been able to convey the tantalizing feeling that you gave me, this time I\'ll definitely ―" Nagi, a high school girl who likes beautiful voices, and Michiru, her classmate with the ideal clear and beautiful voice. When nobody was watching, their story started with letters exchanged during class. \n\nThe author\'s long-awaited first short stories collection dedicated to nine pairs of girls, including the title "Resonant Blue" - a lively and youthful relationship between two clumsy and straight-forward high school girls.\n\n─────────────────────\n\n**Contains:**\n\nResonant Blue\nUnravelling Your Magic in 30cm\nCigarette Kiss\nRefrain Kiss\nHeart On Sleeve\nThe Theory of Fate with You \nThe Echo of Us (Pt. 1)\nThe Echo of Us (Pt. 2)\nA Flash of Summer',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            'Anthology',
            'Office Workers',
            "Girls' Love",
            'School Life',
            'Slice of Life',
            'Gyaru',
          ],
          Chapters: [],
        },
        {
          Name: 'My Best Friend Who I Love Fell Completely in Love With My Vtuber Self',
          MangaID: '65361a37-9f9a-4f95-92fa-d6810f0fab17',
          Authors: ['Hikawa Shou'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', 'Comedy', "Girls' Love", 'Web Comic'],
          Chapters: [],
        },
        {
          Name: 'Akumu no Rakuen',
          MangaID: '770881e1-90cd-4e2b-8b72-3c938d267ad3',
          Authors: ['Sekihara Umina'],
          Synopsis:
            "First part of the doujinshi series. Do not mix the titles, Paradise of Nightmare (this one) is followed by Nightmare of Paradise (楽園の悪夢). Attendant's Vacation (従者の休日) is the spin-off.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Demons', "Girls' Love", 'Doujinshi', 'Fantasy'],
          Chapters: [],
        },
        {
          Name: 'Slime Taoshite 300-nen, Shiranai Uchi ni Level MAX ni Nattemashita',
          MangaID: '14610263-264a-4c22-8928-e4183e7d4719',
          Authors: ['Morita Kisetsu'],
          Synopsis:
            'A very ordinary company OL (Office Lady), Azusa Aizawa died from overwork.  \n  \nBecause of that, she decided to live a leisurely life in a house in the mountains as an immortal, 17 year old witch in her next life.  \n  \nHer main source of income is to defeat slimes in the nearby field to acquire magic stones, which she sells at the nearby village\'s guild. Other than that, she passes the time collecting medicinal herbs, and became known as the respected and trusted "Witch of the Highlands."  \n  \nHowever, as a result of farming slimes every day for 300 years, she gained too much experience, and unknowingly became level 99 – the world\'s strongest witch.  \n  \n\n\n---',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Reincarnation',
            'Loli',
            'Monsters',
            'Action',
            'Demons',
            'Ghosts',
            'Comedy',
            'Adventure',
            'Magic',
            "Girls' Love",
            'Harem',
            'Isekai',
            'Fantasy',
            'Monster Girls',
            'Web Comic',
            'Slice of Life',
            'Supernatural',
            'Adaptation',
          ],
          Chapters: [],
        },
        {
          Name: 'Watashi o Tabetai, Hitodenashi',
          MangaID: '48863213-086b-4dfb-8103-8e279b8e5f5d',
          Authors: ['Naekawa Sai'],
          Synopsis:
            'High school girl Hinako is living a quiet life in a seaside town, but she feels somewhat detached from her friends during the summer months when she is reminded of when her family died years ago. One day, she meets Shiori, a mysterious girl who reminds her of the ocean, especially when it comes to her translucent blue eyes, but Shiori soon reveals that she is actually a mermaid who has been looking for Hinako for a long time.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Monsters',
            'Romance',
            "Girls' Love",
            'Drama',
            'Monster Girls',
            'Slice of Life',
            'Supernatural',
            'Mystery',
            'Tragedy',
          ],
          Chapters: [],
        },
        {
          Name: 'Dekisokonai no Himegimi-tachi',
          MangaID: 'a44afe37-24fd-44b8-874e-17e8a24ca3ca',
          Authors: ['Ajiichi'],
          Synopsis:
            'Fujishiro Nanaki is super cute, super popular, and super annoyed with anyone as plain as her classmate Kurokawa Kanade. When Nanaki finds out her boyfriend’s cheating on her, however, her life makes a complete 180—as does her relationship with Kanade. This all-new yuri manga series explores the budding romance between the cool girl in school and the “plain” girl she once brushed off!',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            "Girls' Love",
            'Drama',
            'School Life',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Himegami no Miko',
          MangaID: '05e20804-3b41-4830-a1d3-a8a553a8be5a',
          Authors: ['Kaishaku'],
          Synopsis:
            "Himeko Kurusugawa and Chikane Himemiya are two high-school girls at the prestigious Ototachibana Academy in the fictional Japanese village of Mahoroba. They are also the reincarnations of the solar and lunar mikos. When their ancient enemy the Orochi (the eight-headed Yamata no Orochi of Japanese folklore) rises once more the girls’ long-sealed personas awaken to defend the world!  \n  \n'Kannazuki no Miko' Spin-off Manga and 4th alternate reincarnation of Himeko and Chikane.  \n  \nKannazuki No Miko - 1st alternate reincarnation  \nKyoushiro To Towa No Sora - 2nd alternate reincarnation  \nZettai Shoujo Seiiki Amnesian - 3rd alternate reincarnation",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Action', 'Romance', "Girls' Love", 'Drama', 'Supernatural'],
          Chapters: [],
        },
        {
          Name: 'ONCE',
          MangaID: '30392f21-b5ec-4446-b36d-ef0323c5961f',
          Authors: ['MIAOW嗷'],
          Synopsis:
            "Mo Li's appearance is Bai Jiu's salvation, and the hope and light in Bai Jiu's eyes are treasures that Mo Li is willing to do her best to protect. ...Can we give each other another chance?\n\n[Original Webcomic](https://www.kuaikanmanhua.com/web/topic/10925/)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            "Girls' Love",
            'School Life',
            'Web Comic',
            'Slice of Life',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Winter to Summer',
          MangaID: '6a2ca903-08ca-4c06-b004-d92a89240d80',
          Authors: ['Xiao Chu Chu'],
          Synopsis: '',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            'Comedy',
            "Girls' Love",
            'School Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Yuri Behavior Guide',
          MangaID: 'ce4c7a0d-3931-4931-bd9b-39c1a69668f5',
          Authors: ['MOMO636'],
          Synopsis: 'The lovely lives of yuri girls!',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            'Comedy',
            "Girls' Love",
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Kitanai Kimi ga Ichiban Kawaii',
          MangaID: '25632c2e-90d3-4a9f-9cfd-3132d52ca5ee',
          Authors: ['Manio'],
          Synopsis:
            "Sezaki Airi and Hanamura Hinako. In the class they are in different groups and castes with no interaction, but they have a secret that they cannot tell anyone else. The girls' secret is that of love, selfishness and fetishes….  \n\n\n---",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Psychological',
            'Romance',
            "Girls' Love",
            'Drama',
            'School Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Machikado Mazoku',
          MangaID: 'd4ff7502-b5d4-4fd2-845f-c8754b14dd8d',
          Authors: ['Ito Izumo'],
          Synopsis:
            "Awakening her dormant abilities as a demon one day, Yoshida Yuko aka Shadow Mistress Yuko, is entrusted with the mission to defeat the Light clan's priestess, a magical girl, by her ancestor Lilith. Yuko meets magical girl Chiyoda Momo through her classmate Sata Anri, and challenges her to a duel, but loses quickly due to her lack of strength.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Demons',
            'Comedy',
            'Magical Girls',
            'Magic',
            "Girls' Love",
            '4-Koma',
            'Monster Girls',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Protagonist x Rival (Webcomic)',
          MangaID: 'deaf8760-521c-40cb-941b-dad8515a6d94',
          Authors: ['kuu_u_'],
          Synopsis:
            "***\"Don't you DARE try get close to Mizushima-kun!\"***  \n  \nKimura-san wants to get close to her crush Mizushima-kun, but the beautiful and confrontational Hiyama-san has a problem with that… though it's not the kind of problem you'd expect from this scenario.  \n  \n- [Artist's Twitter](https://twitter.com/kuu_u_)\n",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            'Comedy',
            "Girls' Love",
            'School Life',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'New Lily Apartment',
          MangaID: '2aa26afb-475f-4e67-bfc4-7bc8e6cca544',
          Authors: ['河伯'],
          Synopsis:
            'In a small apartment within the magical city of Shanghai, by fate or coincidence, live six girls. Although they have different occupations, personalities, and even nationalities, they support and care for one another. What kind of hilarious, sweet, and heart-warming stories will happen between the three couples?',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            'Comedy',
            "Girls' Love",
            '4-Koma',
            'Slice of Life',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Please Bully Me, Miss Villainess!',
          MangaID: '8b34f37a-0181-4f0b-8ce3-01217e9a602c',
          Authors: ['Chise', 'Ciwei Mao Yuedu'],
          Synopsis:
            "I, Yvonne, reincarnated into an otome game as the rich villainess. According to the game's plot, a character loathed by everyone such as myself has the main role of bullying the heroine, pushing her towards the various love interests' romantic routes. But it seems like there's something wrong with Elsa, the heroine! She's getting too close to me!",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Reincarnation',
            'Long Strip',
            'Romance',
            'Magic',
            "Girls' Love",
            'Isekai',
            'School Life',
            'Villainess',
            'Web Comic',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Water.',
          MangaID: '781dee86-5fab-48da-a1e8-c45023c8d0ee',
          Authors: ['Nananan Kiriko'],
          Synopsis:
            "Mangaupdates:  \n- Colour  \nStory about two girls who question if it's right to be together.  \n  \n- Heartless Bitch  \nTwo girls are talking about one of them playing with a younger man.  \n  \n- Ikazu Onna (Cool Lady)  \nA man sets out to search the identity of a kinky dream woman from a drawing he drew of her.  \n  \n- Kisses  \nStory about a young woman who leaves her boyfriend and moves to her best friend apartment not knowing that her friend loves her.  \n  \n- Painful Love  \nA girl, who has just broken up with her boyfriend, is thinking about him.  \n  \nPainful Love and Heartless Bitch are featured in Secret Comic Japan.\n",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ["Girls' Love", 'Drama', 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Your True Color',
          MangaID: '7875975e-b88e-4629-9ea2-feb495b73793',
          Authors: ['Fuyume Saya'],
          Synopsis:
            "Hinata idolizes the dazzling actress Sumika, until one day she happens to meet the real deal, who is not at all like her ideal.  \n[Author's Twitter](https://twitter.com/fuyume_saya)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ["Girls' Love", 'Drama'],
          Chapters: [],
        },
        {
          Name: 'Re-Blooming',
          MangaID: '284c1452-cddf-4fd0-b12e-272100608b4d',
          Authors: ['letINK'],
          Synopsis:
            'Dinner with friends takes a turn when Yeonji’s coldhearted college ex shows up. After all those years, Ava wants to try again… and to date like they used to. Should Yeonji give it a second chance, when all Ava did was leave her broken and humiliated? And why is Ava reaching out now, just as their old college friend, Mojoo, has returned from abroad? The timing’s peculiar, but something’s different about Ava. Will the two rekindle a broken love? Or will dark secrets of the past stand in their way?\n\n---\n- [Official Simplified Chinese Translation](https://manga.bilibili.com/detail/mc30848)',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            "Girls' Love",
            'Drama',
            'Web Comic',
            'Slice of Life',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Tadokoro-san (Web Comic)',
          MangaID: '8ffbfa2f-23fa-4490-848e-942581a4d873',
          Authors: ['Tatsubon'],
          Synopsis:
            'Shy and introverted, Kageko Tadokoro passes her free time in class drawing instead of hanging out with her classmates. But even when her classmates approach her, it’s only to make fun of her drawings and appearance. In stark contrast, Nikaido is well-liked among her peers as she has both beauty and smarts. And while everyone makes fun of Tadokoro, Sakurako Nikaido on the other hand, is totally infatuated with her. Just one look at one of Tadokoro’s drawings and Nikaido fell in love with the art and eventually, the artist herself. When Tadokoro offers to draw Nikaido a portrait, Nikaido becomes ecstatic as this may be her chance to get closer with the girl she has been obsessing over.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Action',
            'Romance',
            "Girls' Love",
            'Doujinshi',
            'Drama',
            'School Life',
            'Web Comic',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Sayonara Rose Garden',
          MangaID: '3e7cd288-b982-45c5-bcae-f9fa7e902c4d',
          Authors: ['Dokuta Pepako'],
          Synopsis:
            'England, the early 1900s. Alice, a young noblewoman, has a Japanese maid named Hanako working in her household. The two have a fairly typical relationship…until the day Alice begs Hanako to kill her. As Hanako tries to figure out why her mistress would make such a terrible request, she and Alice grow closer until an entirely new feeling begins to blossom between them. Don’t miss this poignant tale about women falling in love in historical Britain.  \n\n\n---\n\n',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Historical', 'Romance', "Girls' Love", 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Suicide Girl',
          MangaID: 'b0bbc905-20d7-44e4-b42b-e2b483a68539',
          Authors: ['Nakayama Atsushi'],
          Synopsis:
            'A story where a girl of light fights against the darkness of the world.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Thriller',
            'Monsters',
            'Action',
            'Demons',
            'Magical Girls',
            'Magic',
            "Girls' Love",
            'Gore',
            'Drama',
            'Horror',
          ],
          Chapters: [],
        },
        {
          Name: 'Adachi to Shimamura',
          MangaID: 'a1620de1-6eb6-4948-b228-b232f910155a',
          Authors: ['Iruma Hitoma'],
          Synopsis:
            "In the middle of the school day, on the second floor of the gym.  \r\nThis is where the two came to skip class, and it's where their friendship began.  \r\nA story of two high school girls, playing ping-pong and chatting as they spend the heydays of their youth.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'School Life', 'Adaptation'],
          Chapters: [],
        },
        {
          Name: '1 Only Reason',
          MangaID: '67fbef53-9bf6-4f95-8fc1-ab1084d2d8ea',
          Authors: ['Clancey Fajardo'],
          Synopsis:
            "This is the story of Elishé, an asexual succubus who deals with depression once she's disinherited for the deserting her own race.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            'Comedy',
            'User Created',
            "Girls' Love",
            'Drama',
            'Fantasy',
            'Monster Girls',
            'Web Comic',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Lily Love 2',
          MangaID: '724dd143-c35c-478a-9cd8-fa8b58eca714',
          Authors: ['Ratana Satis'],
          Synopsis:
            "Ploy has been avoiding her family and anything that's related to her family's business as long as she could. She is now, however, forced to be part of the business and dreads what her parents have in store for her. Hopefully, there is one thing that could help her bear all of it as a certain student applies for an internship at the hotel Ploy is at.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'Drama'],
          Chapters: [],
        },
        {
          Name: 'Pulse',
          MangaID: 'c4c40def-4324-46bb-84fa-8c4792d31ef8',
          Authors: ['Ratana Satis'],
          Synopsis:
            'Mel, a renowned heart surgeon, lives a carefree life with sex being a tool for joy rather than a show of affection. Then she meets someone that turns her view of love and life upside down. This story is about two people that meet with minimal expectations but soon become enthralled in a relationship that changes everything about themselves',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Long Strip', 'Romance', "Girls' Love", 'Drama', 'Medical'],
          Chapters: [],
        },
        {
          Name: 'Tamen de Gushi',
          MangaID: '3f1453fb-9dac-4aca-a2ea-69613856c952',
          Authors: ['Tan Jiu'],
          Synopsis:
            'The funny romantic story of how Qiu Tong and Sun Jing met and fell in love.  \n  \nAlso contains insert art of the characters by the author.  \n  \nCatalà:  \nLa Sun Jing té una missió: parlar amb la noia de cabells rossos de la parada de bus… si aconsegueix no espantar-la abans de saber el seu nom.  \nLa història de com es van conèixer i enamorar Sun Jing i Qiu Tong.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            'Comedy',
            "Girls' Love",
            'Drama',
            'School Life',
            'Web Comic',
            'Slice of Life',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Take Responsibility For My Stomach!',
          MangaID: '1d87d7a5-edae-4f0e-a430-8893bb1255b1',
          Authors: ['Nikumaru'],
          Synopsis:
            "Ritsu, who has gotten somewhat chubby from eating her roommate Ruka's cooking, becomes determined to get down to lost 7.5kg in three months. When Ritsu's attempt at a salad-only diet proves destructive, Ruka sets her on a new diet that allows her to eat delicious meals that are under 400kcal each.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Comedy',
            "Girls' Love",
            'Web Comic',
            'Slice of Life',
            'Cooking',
          ],
          Chapters: [],
        },
        {
          Name: 'YuruYuri',
          MangaID: '6306c976-d776-48c3-b29f-d345e65f272b',
          Authors: ['Namori'],
          Synopsis:
            'Four mischievous girls illegally occupy the former Traditional Tea Ceremony clubroom, in order to create the "Amusement Club." These scamps…who ignore repeated warnings—in direct rebellion with the righteous directives of the Student Council—decide to remain in the room until they finally get off their bums and do something! In this slightly sluggish manga, full of fits and starts, the four girls set off from their homes for a walk together with days full of a little this and that!',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Comedy',
            "Girls' Love",
            'Drama',
            'School Life',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'METEOROID',
          MangaID: '1f2418e8-b28a-490a-ba42-ded66a867a26',
          Authors: ['Various'],
          Synopsis:
            "A Compilation of 3 Stories depicting 3 different aspects of Tendou Maya and Saijou Claudine's everyday life at Seisho Music Academy, as actresses-in-training.\n\n[ Yuri MayaKuro (Maya x Claudine) One-Shot Doujinshi ]\n\nSource Anime: Shoujo Kageki Revue Starlight\n\nPairing: Tendou Maya and Saijou Claudine",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Oneshot',
            'Action',
            'Romance',
            'Magical Girls',
            'Magic',
            "Girls' Love",
            'Doujinshi',
            'School Life',
            'Fantasy',
            'Slice of Life',
            'Supernatural',
          ],
          Chapters: [],
        },
        {
          Name: 'Touhou - MEIRIN SAIKO (Doujinshi)',
          MangaID: '27872479-19b3-407f-8988-f3b268e19f62',
          Authors: [
            'Yatsu Wa Kamei (Circle)',
            'Banpai Akira',
            'Minakata Sunao',
            'Pure (Circle)',
          ],
          Synopsis: 'A Meiling x Sakuya doujin.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', "Girls' Love", 'Doujinshi'],
          Chapters: [],
        },
        {
          Name: 'Fate/Grand Order - Alter Suite (Doujinshi)',
          MangaID: '2d7c2bab-559a-47fc-a3e8-9fe2cbe5f20d',
          Authors: ['Burakuradou (Circle)', 'Takeshisu'],
          Synopsis:
            "Saber Alter x Jeanne Alter  \n  \n**Links:**  \n- [Author's Pixiv](https://www.pixiv.net/member.php?id=3309496)\n",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ["Girls' Love", 'Doujinshi'],
          Chapters: [],
        },
        {
          Name: 'Yuri to hitsugi',
          MangaID: '3cb067f8-d042-4fa0-bd83-86ca7a4e04e8',
          Authors: ['Haruhana Aya'],
          Synopsis: '3 pages pixiv oneshot from the author.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', "Girls' Love", 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Asumi-chan is Interested in Lesbian Brothels!',
          MangaID: 'af66b380-623e-4dfc-9fbb-8ca093b9d5a9',
          Authors: ['Itsuki Kuro'],
          Synopsis:
            'Asumi-chan uses a lesbian brothel to try to find her childhood friend.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', 'Comedy', "Girls' Love"],
          Chapters: [],
        },
        {
          Name: 'Tsuki ga Kirei Desu ne',
          MangaID: 'b9797c5b-642e-44d9-ac40-8b31b9ae110a',
          Authors: ['Itou Hachi'],
          Synopsis:
            '"This is a story of a country far, far away. What distinguished the citizens of this country apart from others was the animal ears on their heads and also, their acceptance of same-sex marriage."  \n  \nKasuga Chiru is the only daughter of a powerful and wealthy family. At seven years old she was engaged to Shinonome Senri, a girl from a family of much lower status. But besides that day, the two never met again. Now sixteen, Chiru prepares to marry her betrothed, yet she wonders if the kind Senri has changed over the years they\'ve been apart, and whether they can become a happy family even though their union is arranged. Upon visiting Senri\'s town, Chiru is overwhelmed by all the love and fondness the townspeople have for their apothecary, Senri. Chiru begins to feel a stirring in her heart, that same wonderful feeling the night Senri rescued her, the night they met. A tender love story of arranged marriages and fox girls begins!',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'Fantasy', 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Gohoubi Ni Kisu Shite Yo',
          MangaID: '5f2a148c-64b4-45ad-ab82-e40e6ca35f5a',
          Authors: ['Yuama'],
          Synopsis:
            '...Does that mean that Hina will kiss me 15 times? Handsome girl x Kouhai girl pure yuri side story to Ikemen Sugidesu Shiki-senpai!',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            'Comedy',
            "Girls' Love",
            'Doujinshi',
            'School Life',
          ],
          Chapters: [],
        },
        {
          Name: 'I Want to Be Called a Vampire!',
          MangaID: 'a75acdcf-11cd-447b-921e-b9d32141bee2',
          Authors: ['Pyaa'],
          Synopsis:
            'Aoi wants to go to the same school as her childhood friend Yuuna so she transfers to Vlad Academy, but everyone except Aoi is actually a vampire!?',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            "Girls' Love",
            'School Life',
            'Vampires',
            'Supernatural',
          ],
          Chapters: [],
        },
        {
          Name: 'Yawahada',
          MangaID: '241dffb2-3f0d-4e28-b5c9-d06fc7a75010',
          Authors: ['Harumi Chihiro'],
          Synopsis: 'Collection released in 2019.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            'Anthology',
            "Girls' Love",
            'Drama',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Apple Parfait Onee-Loli Yuri Anthology',
          MangaID: 'd638b6a7-35a2-4f11-9deb-4fc394f2712d',
          Authors: [
            'Kawaku',
            'Sakasana',
            'Kurimo',
            'Itou Hachi',
            'Terayama Den',
            'Haduki',
            'Izumi Kirifu',
            'Canno',
            'Masanaga',
          ],
          Synopsis: 'Onee-sans doing questionable things to lolis.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Loli',
            'Romance',
            'Anthology',
            'Incest',
            "Girls' Love",
            'Harem',
            'Drama',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'After the Curtain Call',
          MangaID: '65f631d8-3965-435b-94c1-4c1808e36157',
          Authors: ['아쌈'],
          Synopsis:
            'Soyoung is devastated when her favorite musical actor is swallowed up by the world of TV. Just after she quits supporting him, she discovers charismatic actress Jaeyi in a theater performance of "Macbeth" and becomes a fan at first sight. By meeting Jaeyi after her shows and even doing her a favor, Soyoung goes from a mere fan to her good friend. But when Jaeyi has to work with celebrity actress Hyesun, who she has a troubled past with, it unexpectedly sours their friendship. All Soyoung wanted was to support her favorite actress… so why does this new development bother her so much?',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            "Girls' Love",
            'Drama',
            'Web Comic',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Graphite',
          MangaID: '83084ee5-6a83-4ab7-a709-6b56bcbdebe3',
          Authors: ['Takemiya Jin'],
          Synopsis:
            'A girl bullying the class rep or is that really all that is going on?',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', "Girls' Love", 'School Life'],
          Chapters: [],
        },
        {
          Name: 'Neta Chara Tensei Toka Anmarida!',
          MangaID: 'fd41659a-e4ce-458f-b087-8032b7a5fab9',
          Authors: ['Otonashi Kanade'],
          Synopsis:
            'Toru Aikawa, a college student who spends his days immersing himself in games because his daily life is so boring, was standing alone in a forest in a different world before he even could realize why.   \nMoreover, it seems that he has reincarnated into the "Neta character(Meaning:||A Neta character is a character whose action has captured the hearts of viewers and players and has been turned into a important part of the story.|| )" he made in a game.   \n  \nThe Genderswap reincarnation of the strongest heroine packed with overflowing Chuunibyo and ideals!   \n  \nThe strongest genderswap reincarnation fantasy begins here !!',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Reincarnation',
            'Genderswap',
            'Monsters',
            'Action',
            'Demons',
            'Comedy',
            'Adventure',
            'Video Games',
            'Magic',
            "Girls' Love",
            'Isekai',
            'Fantasy',
            'Supernatural',
            'Adaptation',
          ],
          Chapters: [],
        },
        {
          Name: "Coppelia's Coffin",
          MangaID: '0d7c9c49-701c-4fc6-a94a-537ba604abd4',
          Authors: ['Jeong Shira'],
          Synopsis:
            "On a snowy day, a beautiful transfer student named Anna, joined the boarding school. With Anna's captivating beauty, she became the object of everyone's envy. While Colette, who was the opposite of Anna in every way, builds a delicate love-hate relationship with her. All of a sudden, Anna leaves the school. A long time passes before Colette reunites with Anna, at the place where she starts working as a tutor for a noble family...",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Historical',
            'Long Strip',
            "Girls' Love",
            'Drama',
            'Web Comic',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'When I Woke up, Next to Me Was...',
          MangaID: '2a976ae1-4fe0-4af7-8b0d-37021d5437a9',
          Authors: ['Sakuragi Akira'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', "Girls' Love"],
          Chapters: [],
        },
        {
          Name: 'Yuri Brought to You Live by Mob Boys',
          MangaID: '33edc1cf-1005-4441-be86-eba3d57c83f2',
          Authors: ['Sakuragi Akira'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', "Girls' Love"],
          Chapters: [],
        },
        {
          Name: 'Majime Girl to Seishun Lingerie',
          MangaID: '5f75ee55-534d-4169-b70e-a494081fd90c',
          Authors: ['Tachi'],
          Synopsis:
            'If you are pretty into lingerie, and that’s what this series is all about. Our main characters are named Ran and Geraldine, or put another way, “Ran” and “Gerry” or uh, lingerie.  \r\n  \r\n  \r\nsource: <http://www.someanithing.com/10168#majime>',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love", 'School Life', 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Beast of Blue Obsidian',
          MangaID: 'ac2a3e07-ab94-438e-aab8-986e0124b85f',
          Authors: ['Bing Zi'],
          Synopsis:
            'In Year 3574 of the Lista calendar, the world was set on the path toward destruction. 500 years later, in this dilapidated world, the black-robed elf Ariman Campbell accidentally took in a beastman slave, Eve. Their chance encounter pushed the wheel of fate into motion and, perhaps, bringing about a not insignificant storm.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Action',
            'Adventure',
            'Sexual Violence',
            'Magic',
            "Girls' Love",
            'Gore',
            'Drama',
            'Fantasy',
            'Web Comic',
            'Supernatural',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Make the Best of It: Advance or Fall Behind',
          MangaID: '6645a8b4-02c2-4f62-9985-1cfaf8831425',
          Authors: ['寂燃_Ceci'],
          Synopsis:
            "In order to avenge her sister, a demon snuck into the land of the celestials all alone. In an unexpected turn of events, she was rescued by her nemesis' fiancee! Originally, she wanted to get close to her nemesis through his fiancee, but she soon discovered that his fiancee was hiding a secret that could change everything.\n",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Official Colored',
            'Historical',
            'Action',
            'Demons',
            'Long Strip',
            "Girls' Love",
            'Fantasy',
            'Supernatural',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Shoujo-tachi no Kizuato ni Kuchizuke wo',
          MangaID: 'cfd5a759-63ce-4b63-8edb-870267622e6b',
          Authors: ['Haruhana Aya'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ["Girls' Love", 'School Life', 'Fantasy', 'Vampires'],
          Chapters: [],
        },
        {
          Name: "It's Okay, Senpai",
          MangaID: '6f8a5884-b75e-4d30-b9d4-1861f85bf0a4',
          Authors: ['Hoshizoranosita'],
          Synopsis:
            'A daily routine of relationship between Senior and Junior highschool students after a kiss…..  \n  \n"It\'s okay, Senpai"',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'School Life', 'Web Comic'],
          Chapters: [],
        },
        {
          Name: 'Wood and Snow',
          MangaID: '22c4f109-caa9-45f3-8458-f99c6e597de1',
          Authors: ['Minami'],
          Synopsis:
            "A collection of art and short comics of Minami's OCs, Wood and Snow.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Monsters', 'Long Strip', "Girls' Love", 'School Life'],
          Chapters: [],
        },
        {
          Name: 'Komada-san wo Komarasetai',
          MangaID: 'd7c7da95-d1b3-4db9-9155-98c5547d08b9',
          Authors: ['Suzuki Senpai', 'Suzuki-Senpai'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love", 'School Life'],
          Chapters: [],
        },
        {
          Name: 'With that Forbidden Girl in a Forbidden Place',
          MangaID: 'f763dfa2-0316-4697-b828-4bb125955ded',
          Authors: ['Yorita Miyuki'],
          Synopsis: '',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'Drama', 'School Life', 'Gyaru'],
          Chapters: [],
        },
        {
          Name: 'Beauty and the Beast Girl',
          MangaID: 'ece511da-3461-421a-8275-7af48a642aa5',
          Authors: ['Neji'],
          Synopsis:
            'A lonely monster, living in seclusion in the forest, wishes she could live amidst humans despite her frightening appearance. Everything changes when she starts getting a visitor–a blind human girl who’s fascinated with her mysterious forest friend. As the monster and the girl grow attached in their secluded world, their love proves that beauty is in the eye of the beholder.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            'Comedy',
            "Girls' Love",
            'Fantasy',
            'Monster Girls',
            'Web Comic',
          ],
          Chapters: [],
        },
        {
          Name: 'Sekai de Ichiban Oppai ga Suki!',
          MangaID: 'af906856-ef0c-4c7a-aa61-27edebe9e834',
          Authors: ['Konbu Wakame'],
          Synopsis:
            "From the author of [*Jahy-sama wa Kujikenai!*](https://mangadex.org/title/22369) comes the story of the cool Ichihara Chiaki and her big breasted friend, Harumi Hana. Chiaki is a member of the archery club and is also a huge breast fetishist. If she doesn't fondle breasts, she can't perform at her best in archery. The big breasted tsundere named Hana attends a different school than Chiaki, but still goes along with Chiaki's requests.  \n  \nJust how far will Hana go for Chiaki?!",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love", '4-Koma', 'School Life'],
          Chapters: [],
        },
        {
          Name: 'Omeshi Asobase',
          MangaID: '692413d5-0b8a-4467-aba7-a2f1e4f3a1c9',
          Authors: ['Kasuga Sunao'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', 'Loli', "Girls' Love"],
          Chapters: [],
        },
        {
          Name: 'Touhou Project - I Can Hear That Night (Doujinshi)',
          MangaID: 'e23f5f01-4a8d-469a-8ed8-c2357cce7fdb',
          Authors: ['Yonu'],
          Synopsis:
            "In which Sakuya can't live without the sounds of bell from a special someone.\n\nArtist's pixiv: https://www.pixiv.net/en/users/\nArtist's twitter: https://twitter.com/nyonu",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', "Girls' Love", 'Doujinshi'],
          Chapters: [],
        },
        {
          Name: 'Hummingbird Effect',
          MangaID: '8558b5d2-3292-48ce-b2d7-d7b26e520dfd',
          Authors: ['육미리즈'],
          Synopsis:
            "[Winner of Bomtoon's BL & GL Contest]  \n  \nA few generations ago, a mysterious phenomenon occurred. Humans now die after 1.5 billion heart beats; half the heart rate they originally had. Schools began teaching students how to control their emotions and regularly preformed heart rate tests.   \nNo one is allowed to use more than the number assigned per week.  \n  \nThis is the story of 2 girls that chose to love in this world regardless of their heartbeats.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Award Winning',
            'Long Strip',
            'Romance',
            "Girls' Love",
            'Drama',
            'School Life',
            'Web Comic',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'The Sisterly Situation of the Bakeneko Hazuki',
          MangaID: 'e2994de2-c898-4693-bef2-18cdf3bf6582',
          Authors: ['Matsubara Tsuyoshi'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love", 'Supernatural'],
          Chapters: [],
        },
        {
          Name: 'Shoujo Manga Protagonist x Rival-San (Magazine)',
          MangaID: '16ca7db9-1a9f-43ec-acac-985ae487f663',
          Authors: ['kuu_u_'],
          Synopsis:
            "***“Don't you DARE try to get close to Mizushima-kun!”***  \r\n  \r\nKimura-san wants to get close to her crush Mizushima-kun, but the beautiful and confrontational Hiyama-san has a problem with that… though it's not the kind of problem you'd expect from this scenario.  \r\n  \r\n- [![](https://i.imgur.com/dQCXZkU.png) Artist's Twitter](https://twitter.com/kuu_u_)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            'Comedy',
            "Girls' Love",
            'School Life',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Goshujinsama to Yukinohi',
          MangaID: 'f7cdab3c-7615-456c-a1bc-f8b06c92c2bb',
          Authors: ['Itou Hachi'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', 'Loli', "Girls' Love", 'Doujinshi'],
          Chapters: [],
        },
        {
          Name: 'Mage & Demon Queen',
          MangaID: '005b7e3c-2927-45ae-87db-bb3aa04c65e0',
          Authors: ['Color-LES'],
          Synopsis:
            "In a world where Humans and Demons are in constant wars. Human adventurers seek to challenge the demon tower, home of the demons, which boast over a hundred floors, thousands of strong demons and generals. and at the top of towers lair the mightiest demon lord.   \nAll adventurers seek to take the demon lord’s head to ends the never ending war and restore peace to mandkind. However, a young mage girl wishes to take her hand and propose her.  \n  \n* [Author's Patreon](https://www.patreon.com/Color_LES)\n",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            'Comedy',
            'Adventure',
            "Girls' Love",
            'Fantasy',
          ],
          Chapters: [],
        },
        {
          Name: 'Miss Angel and Miss Devil',
          MangaID: '34f043ef-a423-422a-8e26-a54720645ee5',
          Authors: ['매우맑음 (Maeu Malgeum)'],
          Synopsis:
            "The story of angels who don't behave like angels and devils who are kinder than them. A new romance begins!",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Comedy',
            "Girls' Love",
            'Fantasy',
            'Web Comic',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Demoness and Runaway Girl',
          MangaID: '3ec245eb-e592-4009-b1fb-630cbdc677b4',
          Authors: ['Nagori Yu'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ["Girls' Love", 'Fantasy'],
          Chapters: [],
        },
        {
          Name: 'Satanophany',
          MangaID: 'ba8767ca-a8c6-4e80-a371-b220a7813bd0',
          Authors: ['Yamada Yoshinobu'],
          Synopsis:
            'A mysterious syndrome turns schoolgirls into homicidal monsters behind numerous atrocities in Japan. However, nothing is what it seems and when Chika Amagi is arrested for the brutal murder of five people, a journey into uncharted, troubled waters begins!  \n\n\n---',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Sci-Fi',
            'Action',
            'Psychological',
            'Sexual Violence',
            "Girls' Love",
            'Gore',
            'Drama',
            'Horror',
            'Mystery',
            'Tragedy',
          ],
          Chapters: [],
        },
        {
          Name: 'Strictly Professional Yuri',
          MangaID: '5b739420-6ce9-4f49-bb36-84503394b5a1',
          Authors: ['Kawamura Taku'],
          Synopsis:
            'The two idols, who are on the verge of losing their jobs, see a chance by playing "yuri" characters. They were supposed to be doing it just for the job, but they are slowly reaching a limit…  \n  \n',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', 'Romance', 'Comedy', "Girls' Love", 'Web Comic'],
          Chapters: [],
        },
        {
          Name: 'Baseball Yuri',
          MangaID: '5cd7d37f-8305-4ac7-b10f-ca5bd24bab93',
          Authors: ['Shimi Iriko'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Oneshot',
            'Romance',
            "Girls' Love",
            'School Life',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: "I Really Like You, so I Won't Kiss You",
          MangaID: 'a9968016-1c08-43cd-857d-5511a0b49448',
          Authors: ['Kosuzume'],
          Synopsis: '',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', "Girls' Love", 'School Life', 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Kill Switch',
          MangaID: '6c0669f3-c500-4759-afe7-c8e9e4e2d685',
          Authors: ['1172'],
          Synopsis:
            "Jeongwon, who is traumatized by four-wheeled vehicles because of a car accident, got a ride from Kim Jisoo's bike by chance during the new semester. She falls in love with Jisoo at the first sight together and gains an unknown sense of freedom. Hwayeon, one of Jeongwon’s close friends, is aware of Jeongwon's feelings and panics. The more she tries to separate them from each other, the more Jeongwon wants to get closer to Jisoo…  \nHowever, Jisoo avoids Jeongwon, and Hwayeon interferes with Jeongwon's growing feelings because of her unpredictable attitude…",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            "Girls' Love",
            'Drama',
            'School Life',
            'Web Comic',
            'Slice of Life',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Kimi ga Shinu Made Koi wo Shitai',
          MangaID: '0c44cf39-3d6c-4472-815b-9e163613cfe9',
          Authors: ['Aono Nachi'],
          Synopsis:
            'There\'s an orphanage which trains its charges to be weapons of war, assassins specialized in magic. At this "school" Shiina has been having a difficult time coping with her roommate\'s death. She completely ignores rumours, including that of a supposedly impervious student by the name of "Mimi," who is thought to be even stronger than the teachers and isn\'t part of any group. While taking a breather, she encounters an overly cheerful young girl covered in blood, and they chat for a while before the child is hauled away by the school nurse. Shiina thought that they wouldn\'t meet again, but the next day, the girl transfers into her class and cheerfully introduces herself as Mimi.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Action',
            'Romance',
            'Magic',
            "Girls' Love",
            'Drama',
            'School Life',
            'Fantasy',
            'Tragedy',
          ],
          Chapters: [],
        },
        {
          Name: 'Kimi to Tsuzuru Utakata',
          MangaID: '6ecc62e4-25ad-4102-b0d8-580a8023d2fb',
          Authors: ['Yuama'],
          Synopsis:
            'Shizuku Hoshikawa, a high school girl who lives avoiding contact with people, writes a novel which is accidentally read by her classmate Kaori Asaka.  \r\nShe loves it but finds out Hoshikawa wasn\'t planning to write anymore due to lack of ideas, to which she ends up saying:  \r\n"Let\'s start going out, you and me… You can write a story about our own love."  \r\n  \r\n[![](https://i.imgur.com/dQCXZkU.png) Author’s Twitter](https://twitter.com/maymaymay7523)  \r\n[![](https://i.imgur.com/oiVINmy.png) Author’s Pixiv](https://www.pixiv.net/en/users/5701254)',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'School Life', 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Lily System',
          MangaID: '2a9acae2-48f7-42ce-a58d-3a20c8e72ecf',
          Authors: ['Yoshitomi Akihito'],
          Synopsis:
            'Two high school girls discover a shabby machine in the back of a shed and it leads them to a strange world.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Sci-Fi',
            'Romance',
            'Virtual Reality',
            "Girls' Love",
            'Mystery',
          ],
          Chapters: [],
        },
        {
          Name: 'Hino-san no Baka',
          MangaID: 'af737f18-6d40-4537-b0e6-ad32f2054daa',
          Authors: ['Kinniku Tarou'],
          Synopsis:
            "Class president and overall good girl Koguma is concerned that her classmate Hino often skips classes by spending her time behind one of the school buildings. Koguma feels it's her duty to guide Hino down a better path, even if it means going along with Hino's unusual requests.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love", 'School Life', 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Nightingale and the Rose',
          MangaID: '0bd57ae7-6eab-4fdc-a323-2e6c752a217d',
          Authors: ['橘姬社'],
          Synopsis:
            'One day, streamer Bai Xinxin is transmigrated into the prince\'s daughter, Bai Yueguang of the suspense game "Nightingale and the Rose". But everyone in this game is hell-bent on killing Bai Yueguang, and Lan Sha—who is controlled by the player—is the only one who can protect her.\n\nWhilst fighting for her life against enemies known and unknown, in her struggle to survive from the jealousy of a bunch of yanderes, from the killing intent emanating from political opponents who object to the marriage alliance... Bai Yueguang tries to find a way to survive with Lan Sha by her side, too.\n\nHowever, the main character "Lan Sha" doesn\'t seem to be a mere NPC...',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Historical',
            'Long Strip',
            "Girls' Love",
            'Isekai',
            'Fantasy',
            'Villainess',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Half',
          MangaID: '316f816a-5de2-4eff-ad04-4c308574b13e',
          Authors: ['Kao Shitou'],
          Synopsis:
            'The heartwarming story of two different girls brought together over a cat, as they learn about each other, spend time together, and heal one another.  \n  \n[ Español ]  \nUna conmovedora historia de dos chicas, diferente una de la otra, que se conocen por un encuentro con un gato y desde entonces han estado acompañándose y consolándose .',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            "Girls' Love",
            'Drama',
            'Web Comic',
            'Slice of Life',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Toki',
          MangaID: '04d4dcd8-c009-476e-86f5-d00ddb2057bd',
          Authors: ['Meki Meki', 'Kobayashi Ritz'],
          Synopsis:
            'A Saki spin-off series. It follows the characters Toki Onjouji, Ryuuka Shimizudani and other girls from Osaka during their elementary and middle school years.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Traditional Games',
            'Comedy',
            'Sports',
            "Girls' Love",
            'Drama',
            'School Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Gyaru Yuri',
          MangaID: 'e1b97dc2-d37a-4e68-a467-710a345c80c6',
          Authors: ['Ahiru'],
          Synopsis:
            'Erika is a normal student, who one day due to special circumstances will live with another girl named Yuri! But Yuri dreams of "marrying" her and will do anything to fulfill that dream.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Loli', 'Long Strip', 'Comedy', "Girls' Love", 'Gyaru'],
          Chapters: [],
        },
        {
          Name: 'Saki to Chika',
          MangaID: 'e33d8af1-8cc9-489a-b2f4-7fe2cd0ecf34',
          Authors: ['Omuhayashi'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ["Girls' Love", 'School Life'],
          Chapters: [],
        },
        {
          Name: 'What are the Chances',
          MangaID: '360db6f2-18df-4fc4-9952-41de50ba0721',
          Authors: ['Chantsky'],
          Synopsis:
            'Tricia cree que el amor está sobrevalorado. Pero cuando Elise entró en la librería familiar en la que trabaja, las cosas empezaron a cambiar. Después del encuentro, comenzó a ver recuerdos de su vida anterior y sueños sobre Elise todas las noches. ¿Quién era Tricia en la vida de Elise antes? Siente que el universo sigue jugando con ella. Sea testigo de este viaje improbable de amistad, aceptación, amor y de vida y muerte.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'Drama', 'Web Comic'],
          Chapters: [],
        },
        {
          Name: 'Wake Ari na Kanojo-tachi',
          MangaID: '8936e2ff-c721-4d9f-b820-6707e3463ab5',
          Authors: ['Neji'],
          Synopsis:
            'A story set in a world where non-humans live among normal humans, focusing on a titan named Kara and a vampire name Vivi.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            "Girls' Love",
            'Monster Girls',
            'Web Comic',
            'Slice of Life',
            'Supernatural',
          ],
          Chapters: [],
        },
        {
          Name: 'Between the Sea of Clouds',
          MangaID: '2a472a35-17e8-45b1-abfb-cb68be31c964',
          Authors: ['廿晚'],
          Synopsis:
            "In a world with only the sky and the sea, there exist two opposing tribes. After Iona from the winged sky tribe meets Helen from the scaled water tribe by happenstance at the water's edge, a deep bond starts to form between the two.\n\n[Author Weibo](https://weibo.com/u/7189187167)\n[Author Twitter](https://twitter.com/nianwanwanwan)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Historical',
            'Long Strip',
            "Girls' Love",
            'Fantasy',
            'Monster Girls',
            'Web Comic',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Hatsukoi, Tokimeki Usuihon',
          MangaID: 'f660d11a-fdc7-41a0-82d3-b7df2b00ec07',
          Authors: ['Takahashi Tetsuya'],
          Synopsis:
            "Hime is a cute and petite high school girl,  \nshe has feelings towards Itoha, a playful girl who is also cute, pretty, and whose charm can dazzle the eyes.  \nWhen Hime made up her mind and confessed her feelings to Itoha, she didn't think that Itoha also felt the same towards her. That's how the love story (with an Ero-Manga twist) began.  \n  \nIndonesian: ||  \nHime adalah gadis SMA yang manis imut nan mungil,  \ndia sangat berprasangka gay pada Itoha, gadis sepermainannya yang juga manis imut nan cantik jelita yang pesonanya dapat menyilaukan mata,  \nsuatu ketika Hime membulatkan niat dan tekadnya untuk menyatakan perasaan gay nya pada Itoha,  \nnamun siapa sangka Itoha juga merasa gay pada Hime,  \nItoha pun menerima Hime dengan suka cita,  \ndan di hari itu pula, kisah gay dua sejoli itu pun dimulai.||",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Loli', 'Romance', "Girls' Love", 'School Life'],
          Chapters: [],
        },
        {
          Name: "JK-chan and Her Classmate's Mom",
          MangaID: '24c2e0fc-e381-4e84-b011-1a11887ee6f0',
          Authors: ['Muromaki'],
          Synopsis:
            "Nakashima Yuka falls in love with her male classmate Toi Takuya's mother, Mihoko. Gay hilarity ensues.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love", 'School Life', 'Web Comic'],
          Chapters: [],
        },
        {
          Name: "Tsubaki-sama Hasn't Bloomed Yet!",
          MangaID: '0ba436da-5a7b-4b74-bb07-cbb99fbc3834',
          Authors: ['Geshumaro'],
          Synopsis:
            "\"Be pure! Be just! Be beautiful!\" That is Tsubaki's motto! She's cute and tries very hard, but sometimes she's just wide open. Aiming to be a graceful woman in the future, her ideas clash with reality! Let's explore Tsubaki's daily life in this comedy!  \n  \nArtist's twitter: <https://twitter.com/mashumaro_00>",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love", 'School Life', 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Shouraiteki ni Shinde Kure',
          MangaID: '37e6a45f-3eda-4f27-93d0-84ec8e8c34a7',
          Authors: ['Nagato Chihiro'],
          Synopsis: 'A girl tries to "buy" her female classmate with money.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love", 'School Life'],
          Chapters: [],
        },
        {
          Name: 'I like you, so I get it.',
          MangaID: '2c34090a-2427-4ff2-89eb-4a24d3c88818',
          Authors: ['Sal Jiang'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Oneshot',
            'Romance',
            "Girls' Love",
            'Drama',
            'Web Comic',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Senpai ga Oyobidesu!',
          MangaID: '023736fb-746c-4e7c-b093-f92700f49cd2',
          Authors: ['Musshu'],
          Synopsis:
            "One day, Yoriko Souma comes across the school Madonna, student council president Urushijima Kinako, collapsed from hunger. This event leads to a strange relationship between them that when Kinako finds herself in trouble, she only needs to blow on a dog whistle for Yoriko to come to her aid.  \n  \n[Author's twitter](https://twitter.com/omu001)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love", '4-Koma', 'School Life'],
          Chapters: [],
        },
        {
          Name: 'Double Your Pleasure – A Twin Yuri Anthology',
          MangaID: '7d852cb6-1879-43b5-a294-5d4cfc71cdb2',
          Authors: [
            'Hinahara Emi',
            'Bonryu',
            'Yakiniku Teishoku',
            'Kodama Naoko',
            'Suto',
            'Shiratama Moti',
            'Kanroame',
            'Aoto Hibiki',
          ],
          Synopsis:
            'This risqué collection of yuri short romances features beautiful twins in love with third parties and one another.\n\nTwins: endlessly fascinating and tantalizing. This anthology of yuri manga stories features some of the hottest twins by today’s hottest artists. Sexy tales, from the story of a single twin seducing her literal mirror image, to a pair of girls finding satisfaction only when they seduce a third. Erotic adventures await and surprises abound in this exploration of forbidden fantasies.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Anthology', 'Incest', "Girls' Love"],
          Chapters: [],
        },
        {
          Name: 'Uso no Tsukenai Otoshi Goro',
          MangaID: '92578ef8-6984-4828-8118-100dba4d9a73',
          Authors: ['Harushion'],
          Synopsis:
            'The world is plagued with the strange illness, [Voice] that affects teenagers. But when one\'s feeling is disrupted, a "bunshin" or a clone will appear and it will say everything you truly feel.  \r\nHowever, this illness does not pose any danger to one\'s life. Satsuki, a 2nd year high school developed this illness during that "incident" during her junior high school. Ever since then, Sayoi became protective of Satsuki and keeps anyone from approaching her. One day, they met Hiyama, another teenage boy who has the same illness. After meeting him, the twin\'s relationship started to change?!',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            'Comedy',
            "Girls' Love",
            'Medical',
            'School Life',
            'Web Comic',
            'Slice of Life',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Pink Ribbon',
          MangaID: '06a82d4f-65af-4f56-93c0-1d47ec570b6e',
          Authors: ['星期一回收日/MONDAY RECOVER'],
          Synopsis:
            'Lumiao is a senior high school student who loves to dress up in frilly dresses and bows. One day she passes another student, the petite Yuxuan, on campus, and becomes convinced she has the perfect frame for the same style. But Yuxuan, a shy and short-haired sports-lover, resists her new friend’s attempts to both persuade and trick her into a new look.\n\nBut as time goes on, Lumiao realizes her feelings for Yuxuan go beyond friendship and she becomes obsessed with everything Yuxuan does and thinks. What is Lumiao to do when she learns Yuxuan has a crush on a boy in her class? She wants Yuxuan to be happy, but she doesn’t want to lose her. What will happen if she tells Yuxuan how she feels?\n\n___\n\n[Artist website](https://lufbsis.wixsite.com/mondayrecover)\n[Artist instagram](https://www.instagram.com/monday_recover)\n[Artist pixiv](https://www.pixiv.net/en/users/2179028)\n\n[Purchase the raws, support the author](https://www.bookwalker.com.tw/product/85166)',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Award Winning', 'Romance', "Girls' Love", 'School Life'],
          Chapters: [],
        },
        {
          Name: 'The Glasses Girl Question',
          MangaID: 'cbee77ce-bf5d-4c1d-ae43-e9a7f651ffb1',
          Authors: ['Watagiri Saya'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', "Girls' Love", 'Philosophical', 'Web Comic'],
          Chapters: [],
        },
        {
          Name: 'A Fruitless Betrothal',
          MangaID: 'b2571bd3-ca56-4f6e-8aed-cd66e03e5130',
          Authors: ['奇三三Geedsai', 'Kao Shitou'],
          Synopsis:
            'Dai Yi is a female geography teacher who has just transferred to high school. She has a crush on her colleague, the popular female teacher, Zhang Guo, and she was about to grow closer with her crush. However, Zhang Guo unexpectedly announced that she was engaged。',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Long Strip',
            'Romance',
            'Comedy',
            'Office Workers',
            "Girls' Love",
            'Slice of Life',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Yagate Kimi ni Naru',
          MangaID: '69060a67-1d4e-4110-9d29-838bfd99917f',
          Authors: ['Nakatani Nio'],
          Synopsis:
            "Yuu has always loved shoujo manga and awaits the day she gets a love confession that sends her heart aflutter with bubbles and blushes, and yet when a junior high classmate confesses his feelings to her… she feels nothing. Disappointed and confused, Yuu enters high school still unsure how to respond. That's when Yuu sees the beautiful student council president Nanami turn down a suitor with such maturity that she's inspired to ask her for help. But when the next person to confess to Yuu is Nanami herself, has her shoujo romance finally begun?  \n  \n\n\n---\n\n- The author worked on one of the chapters in the anthology (Vol.2 Ch.13); check it out after finishing this manga for some extra content",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            "Girls' Love",
            'Drama',
            'School Life',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Stealing Candy From My Friend',
          MangaID: 'cfcf5a88-0a19-4ecc-a15a-61efb0976205',
          Authors: ['Mochi Au Lait'],
          Synopsis:
            'Kumi was eating her last candy, but her friend, who really wanted that candy, decides to use some unconventional methods to steal it.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', "Girls' Love"],
          Chapters: [],
        },
        {
          Name: 'Shimeji Simulation',
          MangaID: '28b5d037-175d-4119-96f8-e860e408ebe9',
          Authors: ['Tsukumizu'],
          Synopsis:
            "A surreal yet heartwarming 4-koma series about everyday life.  \n  \nFrom the author of Shoujo Shuumatsu Ryokou/Girls' Last Tour.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Sci-Fi',
            'Comedy',
            "Girls' Love",
            '4-Koma',
            'Philosophical',
            'School Life',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Vampeerz',
          MangaID: 'c431712b-231c-4d25-85fa-7ca6bf460f15',
          Authors: ['Higashiyama Shou'],
          Synopsis:
            "On the day of her grandmother's funeral, Ichika meets Aria, a beautiful foreigner who claims to be her grandmother's friend.\r\nBut Ichika soon finds that Aria is no normal human ; she is a vampire, and their relationship has just begun...\r\n\r\nAuthor socials:\r\n- Twitter: [@akilim85000](https://twitter.com/akilim85000)  \r\n- Instagram: [@aklkwl](https://www.instagram.com/aklkwl/)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            'Comedy',
            "Girls' Love",
            'Drama',
            'School Life',
            'Vampires',
            'Supernatural',
          ],
          Chapters: [],
        },
        {
          Name: 'Hagure Idol Jigokuhen',
          MangaID: 'b6116025-1a94-4f32-9c9b-aa341f3950f0',
          Authors: ['Takatou Rui'],
          Synopsis:
            "This is the story of Misora Haebaru, an 18-year-old karate expert from Okinawa who went to Tokyo to enter the entertainment industry in hopes of supporting her family. She gets tricked into being a gravure idol who wears lewd clothing and is forced eventually to enter the AV world, but she won't go down without a fight!",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Action',
            'Comedy',
            'Survival',
            'Sports',
            'Martial Arts',
            'Sexual Violence',
            "Girls' Love",
            'Gore',
            'Drama',
            'Gyaru',
          ],
          Chapters: [],
        },
        {
          Name: 'Gyaru to Otaku wa Wakari Aenai.',
          MangaID: 'ef97c4a5-035e-4726-8ddc-cbec21f991a7',
          Authors: ['Kawai Rou'],
          Synopsis:
            "Saotome is the top Gyaru in class - she's loud, known by everyone, and stylish. Otonashi, on the other hand, is the complete opposite. These two carry their own baggage that would ruin their built up identities… but what happens if they were to discover each other's secret?  \r\n  \r\nRead now to see the humorous life of how they do their best to avoid spilling the other's secret!  \r\n  \r\nAdditional Links:  \r\n[Twitter](https://twitter.com/kawai_roh)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            'Comedy',
            "Girls' Love",
            '4-Koma',
            'School Life',
            'Slice of Life',
            'Gyaru',
          ],
          Chapters: [],
        },
        {
          Name: 'The Two of Them Are Pretty Much Like This',
          MangaID: 'b77668ed-0810-4327-9684-46ca371e370e',
          Authors: ['Ikeda Takashi'],
          Synopsis:
            'Scriptwriter Sakuma Elly and rookie voice actress Inuzuka Wako. The two of them are pretty much like this.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love", 'Web Comic', 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Toshishita no Senpai',
          MangaID: 'd0a48877-176b-4f60-8f4d-2ae47fbb2e9c',
          Authors: ['Hinohara Fuki'],
          Synopsis:
            'Nanasawa Nana, 25, has had a long unrequited crush on her senpai, Seto Aya, who she learns has just gotten a divorce. After an "incident" causes her to travel back in time to ten years ago, when Aya was 16, Nana, taking on the alias of Sasaki Mai, decides to make an effort to date Aya in this timeline, soon finding herself competing with her past self.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Time Travel',
            'Romance',
            'Comedy',
            "Girls' Love",
            'School Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Uso to Kiss wa Houkago ni',
          MangaID: 'f9e8e828-7000-4f8a-b394-6d552aed0e98',
          Authors: ['Medamayaki'],
          Synopsis:
            'Thanks to a bad mother obsessed with men, Rin lost a warm house when she was young. The one who supported her at that time was the family of her childhood friend, Momoka.\n\n...but, at some point Momoka began dating men, one after another, as she indulged in the feeling of love. Almost exactly like the mother that had left Rin behind.\n"I won\'t be satisfied if I\'m not loved" Momoka boasts. After she\'s admonished by Rin, she suggests "Then, you do it Rin. Love me, in place of a boyfriend".\nAnd thus, from kisses and lies, begins a girls\' love story.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'Drama', 'School Life'],
          Chapters: [],
        },
        {
          Name: 'Throw Away the Suit Together',
          MangaID: 'd006f413-bad9-4f82-a0aa-901ef2d0ece6',
          Authors: ['keyyang'],
          Synopsis:
            'University, job hunting, then future prospects. Trying to keep up with what we take as a given, "having to do like everyone else does", can wear you down. What path are you meant to take when you start losing sight of what\'s truly important to you... This is the story of two college girls, Haru and Hii-chan, caught in the thick of it, looking to throw away those common expectations and start a new life on an island!',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'K-ON! - Valentine (Doujinshi)',
          MangaID: '4b3ca8df-b95c-4b99-a43d-d09fe386a43b',
          Authors: ['errant'],
          Synopsis: 'Azusa x Yui',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ["Girls' Love", 'Doujinshi'],
          Chapters: [],
        },
        {
          Name: 'Kawaii Onna no Ko to Tonari ni Natta Yuri',
          MangaID: '8396156d-f8be-4f1f-93ef-5eb51bc42092',
          Authors: ['Hachiko'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', "Girls' Love", 'School Life'],
          Chapters: [],
        },
        {
          Name: 'Hibike! Euphonium - Asuka-senpai to Kaori-senpai no Hyaku Gappon desu (Doujinshi)',
          MangaID: '4d4f508f-fd61-44bb-891b-30cf33e39599',
          Authors: ['Fukuroumori', 'Bird Forest (Circle)'],
          Synopsis: '',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Oneshot', "Girls' Love", 'Doujinshi'],
          Chapters: [],
        },
        {
          Name: 'The Results of My Author/Classmate Discovering My Yuri Obsession',
          MangaID: '8c3ec304-b5d3-41d9-864c-b53e98729c25',
          Authors: ['KoniroSango'],
          Synopsis:
            "What happens when a classmate finds out about another girl's secret yuri obsession/feelings? A yuri comedy ensues!",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Comedy',
            "Girls' Love",
            '4-Koma',
            'School Life',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: "My Stepsister's Social Media",
          MangaID: 'c37378e0-3b02-433a-bd56-b76fa918a085',
          Authors: ['Suzumi Raika'],
          Synopsis:
            "About a little sister who is secretly taking a peek at her stepsister's social media account.\r\n  \r\n**Links:**  \r\n- [Creator Pixiv](https://www.pixiv.net/en/users/8375334)  \r\n- [Creator Twitter](https://twitter.com/raika_suzumi)  \r\n- [Support Suzumi-sensei on Fanbox!](https://www.pixiv.net/fanbox/creator/8375334)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love", 'Web Comic', 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'The Popular Girl and the Artist Otako-chan',
          MangaID: '5b33a0a8-e7dd-4fc8-bff1-f75770fe3971',
          Authors: ['Chiyomaru'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Oneshot',
            'Comedy',
            "Girls' Love",
            'School Life',
            'Web Comic',
            'Slice of Life',
            'Gyaru',
          ],
          Chapters: [],
        },
        {
          Name: 'Citrus +',
          MangaID: '4a30061a-bc66-4efd-9c4b-87daf8313381',
          Authors: ['Saburouta'],
          Synopsis:
            'High schoolers (and stepsisters) Yuzu and Mei have gone public with their relationship! The two are happy to be dating out in the open, but friends and family keep trying to butt in with advice. Can Yuzu and Mei figure things out on their own?',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            'Incest',
            "Girls' Love",
            'School Life',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'School Zone',
          MangaID: '5227abca-3d3d-4456-92ff-e67f6e8eb0ee',
          Authors: ['Ningiyau'],
          Synopsis:
            "Volume 1 description:  \nYokoe Rei and Sugiura Kei have always been together ever since middle school. As these two go through their days, drama kicks off around every corner of their daily life. Watch these miserable high school girls frolic about in their miserable school life. A devilishly priceless yuri comedy!  \n  \n**Links:**  \n- [Author's Twitter](https://twitter.com/oe22p)  \n- [Alt Raws](https://comic.pixiv.net/works/4617)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Comedy',
            "Girls' Love",
            'Drama',
            'School Life',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Aoi Hana',
          MangaID: '7e9ea5e7-7dc0-4907-b79c-5b66605ef955',
          Authors: ['Shimura Takako'],
          Synopsis:
            "Fumi and Akira were best friends when they were little, with Akira always looking after the crybaby Fumi, but that all ended when Fumi's family moved away. Several years later, Fumi's family returned, and she and Akira happened to bump into each other on their way to school. They became friends again, quickly slipping back into old patterns. Shortly after, Fumi began dating a cool, attractive upperclassman who, coincidentally enough, had ties to Akira's current school, the prestigious Fujigaya Girls' Academy.  \n  \nLink:  \n[AnimeNewsNetwork](https://www.animenewsnetwork.com/encyclopedia/anime.php?id=10672) (anime)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            "Girls' Love",
            'Drama',
            'School Life',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Isekai Yuusha Mizuki',
          MangaID: '41242f60-3866-4961-ab15-de1c3abc56b5',
          Authors: ['Kimura Matsuri'],
          Synopsis:
            'A completely ordinary girl gets summoned into another world to become the hero.  \nHilarity ensues.  \n  \nNote: Is actually a 3-koma',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Loli',
            'Monsters',
            'Action',
            'Comedy',
            'Adventure',
            'Magic',
            "Girls' Love",
            'Isekai',
            '4-Koma',
            'Fantasy',
            'Web Comic',
            'Slice of Life',
            'Full Color',
          ],
          Chapters: [],
        },
        {
          Name: 'Ienai Himitsu No Aishikata',
          MangaID: 'f395bfc6-e52f-4f64-9cfb-87037215d214',
          Authors: ['Ukaniuka'],
          Synopsis:
            'Highschool teacher Saeki Nao is secretly a hardcore otaku who loves yuri manga.\n\nOne day, at a doujinshi convention they participate in, Nao is eager to convey her feelings to "Nyapoleon", an artist she worships ; however, it turned out to be a girl from her school, Kurumizawa Haruka, and moreover, she had to help her.\n\nAfter the event, they decided to go out for a meal, at Haruka\'s suggestion….\nWhen she wakes up in the morning, there is Haruka in the bed…?!',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', 'Comedy', "Girls' Love", 'Drama', 'School Life'],
          Chapters: [],
        },
        {
          Name: 'Akaiito Anthology Comic',
          MangaID: '01075765-3503-4d0a-a08e-f733a56cced6',
          Authors: [
            'Fuuju Mizuki',
            'Inugami Naoyuki',
            'Mizuki Haruto',
            'Kuribara Ichimi',
            'Mikaki Mikako',
            'Takegami Setsuna',
            'Hasei Agana',
            'Watase Nozomi',
            'Muttri Moony',
          ],
          Synopsis:
            'Official Comic Anthology for Akaiito that came with the limited edition version of the PS2 game.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Action',
            'Comedy',
            'Anthology',
            'Adventure',
            "Girls' Love",
            '4-Koma',
            'Supernatural',
            'Adaptation',
          ],
          Chapters: [],
        },
        {
          Name: "I'm an Elite Angel, but I'm Troubled by an Impregnable High School Girl!",
          MangaID: 'edcfac00-58df-4c70-be79-308d26cd3b28',
          Authors: ['Noyama'],
          Synopsis:
            'The role of angels is to evaluate the good deeds performed by humans and grant them "small wishes" in return. Ariel is one of these angels. However, what appeared in front of her was a high school girl who didn\'t have a "small wish" despite having performed over 10,000 good deeds. Ariel tries to approach this high school girl, and then… Angel (♀) × JK (♀) a somewhat naughtly slapstick romantic comedy ♡  \n\n\n---\n\n[Author\'s Twitter](https://twitter.com/noyama8888)  \n[Author\'s Pixiv](https://www.pixiv.net/en/users/44290315)',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love", 'Fantasy'],
          Chapters: [],
        },
        {
          Name: 'Cat Maid and Mistress',
          MangaID: '750ae38c-9bc4-4a5d-9026-af1eea44ed3b',
          Authors: ['Zanka'],
          Synopsis:
            'A young lady employs the services of a feline maid, but they both come to realize that the lines dividing them between "mistress" and "servant" are becoming increasingly blurry.  \r\n  \r\n\r\n\r\n---\r\n\r\n**Links**:  \r\n- [![](https://i.imgur.com/oiVINmy.png) Mangaka’s Pixiv](https://www.pixiv.net/member.php?id=14188490)  \r\n- [![](https://i.imgur.com/dQCXZkU.png) Mangaka’s Twitter](https://twitter.com/yuruyunaZNK)\r\n',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'Monster Girls', 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'My Favorite Idol Became My Little Sister',
          MangaID: 'b6784e2b-f31d-4f29-8dc7-7e2e414bbae1',
          Authors: ['Kawai Rou'],
          Synopsis:
            'Ichika Kojima is a high schooler obsessed with the idol "Kanon", beautiful and popular with her (girl) underclassmen, Ichika really only spends her time as an idol fan; her life changes when one day her father remarries and she gets a step-sister, none other than her beloved "little sister of humanity" Kanon, or rather, Akane?! \r\nThis Hyper Yuri Love Comedy begins now☆!',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Comedy', "Girls' Love"],
          Chapters: [],
        },
        {
          Name: 'Tadokoro-san',
          MangaID: '5ab2e6ce-d371-4f0b-aff2-504dfcc93c9f',
          Authors: ['Tatsubon'],
          Synopsis:
            'Shy and introverted, Kageko Tadokoro passes her free time in class drawing instead of hanging out with her classmates. But even when her classmates approach her, it’s only to make fun of her drawings and appearance. In stark contrast, Nikaido is well-liked among her peers as she has both beauty and smarts. And while everyone makes fun of Tadokoro, Sakurako Nikaido on the other hand, is totally infatuated with her. Just one look at one of Tadokoro’s drawings and Nikaido fell in love with the art and eventually, the artist herself. When Tadokoro offers to draw Nikaido a portrait, Nikaido becomes ecstatic as this may be her chance to get closer with the girl she has been obsessing over.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ["Girls' Love", 'School Life', 'Slice of Life'],
          Chapters: [],
        },
        {
          Name: 'Karaoke Box de Ecchi Gokko shi Tetara Tenin-san ni Mirareta Hanashi',
          MangaID: 'cf2c6c5a-8187-48f7-8780-cb7aed17b45b',
          Authors: ['Aweida'],
          Synopsis: 'No synopsis available.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ["Girls' Love"],
          Chapters: [],
        },
        {
          Name: 'Shoujo Manga Protagonist x Rival-San (Serialization)',
          MangaID: 'b48eb409-e85f-4ca2-a1cc-4df560e59752',
          Authors: ['kuu_u_'],
          Synopsis:
            "***“Don't you DARE try to get close to Mizushima-kun!”***  \n  \nKimura-san wants to get close to her crush Mizushima-kun, but the beautiful and confrontational Hiyama-san has a problem with that… though it's not the kind of problem you'd expect from this scenario.  \n  \n- [![](https://i.imgur.com/dQCXZkU.png) Artist's Twitter](https://twitter.com/kuu_u_)",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Romance',
            'Comedy',
            "Girls' Love",
            'School Life',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Dark Arts Master',
          MangaID: '18512a9e-1fc0-4adb-93e5-dc718ff8d604',
          Authors: ['Kanbara Erika'],
          Synopsis:
            "Bella, a girl with poor magic skills, attends the magic academy Anziffollon. Desperately following the footsteps of a certain person's dream, she eventually gets her hands on a forbidden magic…  \n\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Monsters',
            'Action',
            'Demons',
            'Adventure',
            'Magic',
            "Girls' Love",
            'Gore',
            'Fantasy',
          ],
          Chapters: [],
        },
        {
          Name: 'Fuzoroi no Renri',
          MangaID: '153779b6-0d55-4681-99ba-f42ca58de385',
          Authors: ['Mikanuji'],
          Synopsis:
            "From Newtype site:  \n  \nOur ages are different, our ways of life are different, everything is different. But… I just want to be with you!  \nBecause I've never been in a miserable, tragic romance, I can say that unrequited love is fine…  \nI don't know why I fell in love with this person…it's a mystery!  \n  \nThey have different personalities, different ages, different ways of thinking, different looks, different everything.  \nThis is the story of girls who clumsily make up for what's lacking in the other.  \n  \nT/N:  \nThese are new side stories. Not a rewrite of the original serialized twitter comic. As of now, it's mostly flashbacks into the lives of the characters of the main story.  \n   \nThe kind of stories these are is all in the title!  \n  \n不揃 (fuzoroi) means uneven, irregular, but also incomplete. 連理 (renri) is \"entwined relationship\".  \nSo, these are stories of intimate relationships between \"incomplete\" girls that somehow complete each other, against all odds.",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Comedy',
            'Office Workers',
            "Girls' Love",
            'Drama',
            'School Life',
            'Delinquents',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: "The Sheep Princess In Wolf's Clothing",
          MangaID: '6fe56296-e980-4321-8a7b-bc8b4e2750c8',
          Authors: ['Mito'],
          Synopsis:
            '"Wolf" Rikujo Aki is working as a butler in the Land of the Sheep.  \r\n  \r\nShe loved the quiet and peaceful life there, but by chance, she fell in love with Momo Siudafares, the third princess of the Sheep Kingdom, and became her tutor.  \r\n  \r\nThe princess and the butler\'s animal-eared girls love affair is about to begin!',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'Fantasy', 'Monster Girls'],
          Chapters: [],
        },
        {
          Name: 'Princess, Is That Holy Water?',
          MangaID: '01fb86df-973e-4309-9dc1-028bbdea1a70',
          Authors: ['Gyuunyuu No Mio'],
          Synopsis:
            'Yes it is.  \n[NicoNico Raws](http://seiga.nicovideo.jp/comic/43318)  \n[Shounen Jump Rookie Raws](https://rookie.shonenjump.com/series/X1vJnKYHQqk)',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: [
            'Award Winning',
            'Loli',
            'Comedy',
            'Magic',
            "Girls' Love",
            'Fantasy',
            'Slice of Life',
          ],
          Chapters: [],
        },
        {
          Name: 'Kyou Kara Mirai',
          MangaID: 'a42c3990-b766-4543-a002-260996ebce15',
          Authors: ['Yoshitomi Akihito'],
          Synopsis:
            'High school girl Miku confesses to her childhood friend Kyouko, asking that she give her reply before they graduate. Until that happens, however, Miku gives Kyouko the freedom to do whatever she wants with her.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', 'Comedy', "Girls' Love", 'School Life'],
          Chapters: [],
        },
        {
          Name: 'Anemone Is in Heat',
          MangaID: 'c5d731f9-c1cf-4a69-a797-cd9c2a58316b',
          Authors: ['Sakuragi Ren'],
          Synopsis:
            'Nagisa Ootsuki shed her former self out of shame from failing her highschool entrance exams. On her first day in her new highschool, who does she meet but the girl who made her fail the exam! How does Nagisa deal with these complicated emotions?  \r\n  \r\n\r\n\r\n---',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', "Girls' Love", 'Drama', 'School Life'],
          Chapters: [],
        },
        {
          Name: 'Joshi-man',
          MangaID: '69f0ece7-d8c1-4971-b977-837d7d8195df',
          Authors: ['Yoshidamaru Yuu'],
          Synopsis:
            "Two high school girls spring into erotic manga! Tanaka is a pure-hearted gal who likes to draw Shoujo Manga, and Terao is a plain, expressionless girl who is active as an erotic manga artist. Watch two complete opposites step into the depth and potential of the of erotic manga world!\nFrom the author of 'Oogami-san, it's a leak!' Comes a manga about adolescent girls and their desires!",
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Romance', 'Comedy', 'Office Workers', "Girls' Love"],
          Chapters: [],
        },
        {
          Name: 'Solar Eclipse',
          MangaID: '54cebfbe-a749-4f6d-833a-2adf2366f439',
          Authors: ['Mimiillu'],
          Synopsis:
            'Los ángeles y los demonios han estado en guerra durante siglos. Pero cuando Anthéia se encuentra con un misterioso demonio con cabello dorado, todos estos siglos de conflicto parecen desaparecer en un solo instante. ¿Quién es esta mujer y por qué es tan diferente a las demás? Solar Eclipse cuenta la historia de dos almas que desafían las leyes.',
          CoverURL: '',
          Added: undefined,
          LastRead: undefined,
          Tags: ['Demons', 'Romance', "Girls' Love", 'Web Comic'],
          Chapters: [],
        },
      ],
    },
  },
};
const enforce = () => {
  MangaDatabase.ensure('Library', defaultData);
};

/* Class Methods
  getSource(sourceName: string): Source | undefined
  getManga(sourceName: string, mangaID: string): Manga | undefined
  getMangas(sourceName: string): Manga[]
  getMangaByName(sourceName: string, mangaName: string): Manga | undefined
  getMangaByAuthor(sourceName: string, author: string): Manga[]
*/

// this literally should not be a class but i'm too lazy to reverse my horrible mistakes
enforce();
export default class MangaDB {
  static flush = () => {
    MangaDatabase.deleteAll();
    enforce();
  };

  static getSource(sourceName: string): Source | false {
    return MangaDatabase.get(`Library`, `Sources.${sourceName}`) ?? false;
  }

  static getSources(): Sources {
    return MangaDatabase.get('Library', 'Sources') ?? false;
  }

  static getManga(sourceName: string, mangaID: string): Manga | false {
    const source = MangaDB.getSource(sourceName);
    if (!source) return false;

    return source.Manga.find((manga) => manga.MangaID === mangaID) ?? false;
  }

  static getMangas(sourceName: string): Manga[] {
    const source = MangaDB.getSource(sourceName);
    if (!source) return [];

    return source.Manga;
  }

  static getMangaByName(sourceName: string, mangaName: string): Manga | false {
    const source = MangaDB.getSource(sourceName);
    if (!source) return false;

    return (
      source.Manga.find(
        (manga) => manga.Name.toLowerCase() === mangaName.toLowerCase()
      ) ?? false
    );
  }

  static getMangasByAuthor(sourceName: string, author: string): Manga[] {
    const source = MangaDB.getSource(sourceName);
    if (!source) return [];

    return source.Manga.filter((manga) => {
      if (!manga.Authors) return false;
      return manga.Authors.map((x) => x.toLowerCase()).includes(
        author.toLowerCase()
      );
    });
  }

  static addManga(sourceName: string, manga: Manga): boolean {
    const source = MangaDB.getSource(sourceName);
    if (!source) return false;

    source.Manga.push(manga);
    MangaDatabase.set(`Library`, source, `Sources.${sourceName}`);
    return true;
  }

  static removeManga(sourceName: string, mangaID: string): boolean {
    const source = MangaDB.getSource(sourceName);
    if (!source) return false;

    source.Manga = source.Manga.filter((manga) => manga.MangaID !== mangaID);
    MangaDatabase.set(`Library`, source, `Sources.${sourceName}`);
    return true;
  }

  static updateManga(
    sourceName: string,
    mangaID: string,
    manga: Manga
  ): boolean {
    const source = MangaDB.getSource(sourceName);
    if (!source) return false;

    source.Manga = source.Manga.map((m) => (m.MangaID === mangaID ? manga : m));
    MangaDatabase.set(`Library`, source, `Sources.${sourceName}`);
    return true;
  }
}
