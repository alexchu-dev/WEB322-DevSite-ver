/* Script to restore data on MongoDB */
db.a6_books_collections.find().lean();
db.a6_books_collections.deleteMany({});
db.a6_books_collections.insertMany([
  {
    author: "Carissa Broadbent",
    title: "The Serpent and the Wings of Night (Crowns of Nyaxia Book 1)",
    borrowBy: "",
    img: "book1.jpg",
    desc: "The adopted human daughter of the Nightborn vampire king, Oraya carved her place in a world designed to kill her. Her only chance to become something more than prey is entering the Kejari: a legendary tournament held by the goddess of death herself.",
  },
  {
    author: "Nisha J Tuli",
    title:
      "Rule of the Aurora King: An enemies to lovers fae fantasy romance (Artefacts of Ouranos Book 2)",
    borrowBy: "",
    img: "book2.jpg",
    desc: "Freed from the golden clutches of the Sun King, Lor now finds herself in the hands of Nadir, the Aurora Prince. Convinced she’s hiding something, he’s willing to do whatever it takes to make her talk. But Lor knows the value of secrets—she’s been keeping them her entire life—and she’s not letting hers go without a fight.",
  },
  {
    author: "J.K. Rowling",
    title: "Harry Potter and the Philosopher's Stone",
    borrowBy: "",
    img: "book3.jpg",
    desc: "Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive. Addressed in green ink on yellowish parchment with a purple seal, they are swiftly confiscated by his grisly aunt and uncle. Then, on Harry's eleventh birthday, a great beetle-eyed giant of a man called Rubeus Hagrid bursts in with some astonishing news: Harry Potter is a wizard, and he has a place at Hogwarts School of Witchcraft and Wizardry. An incredible adventure is about to begin!",
  },
  {
    author: "Carissa Broadbent",
    title: "The Ashes and the Star-Cursed King (Crowns of Nyaxia Book 2)",
    borrowBy: "",
    img: "book4.jpg",
    desc: "Love is a sacrifice at the altar of power.In the wake of the Kejari, everything Oraya once thought to be true has been destroyed. A prisoner in her own kingdom, grieving the only family she ever had, and reeling from a gutting betrayal, she no longer even knows the truth of her own blood. She’s left only with one certainty: she cannot trust anyone, least of all Raihn.",
  },
  {
    author: "Will Wight",
    title: "The Captain (The Last Horizon Book 1)",
    borrowBy: "",
    img: "book5.jpg",
    desc: "On a little-known planet, Archmage Varic Vallenar casts a grand spell to empower himself with the magical abilities of his alternate selves. The ritual works too well, granting Varic not only the magic but also the memories from six lives.",
  },
]);
db.a6_users_collections.insertMany([
  { libCardNum: "0000" },
  { libCardNum: "1234" },
]);
