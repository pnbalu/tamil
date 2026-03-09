/**
 * Seed culture: categories, items (subdivisions), and terms from vocabulary.
 * Target: up to 100 items total, each with up to 100 terms (subdivisions).
 * Run: npm run seed:culture
 */
const { createClient } = require('@supabase/supabase-js');
const LONG_STORIES = require('./culture-content/long-stories.js');

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const MAX_CATEGORIES = 10;
const MAX_ITEMS_TOTAL = 100;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const CATEGORY_NAMES = [
  { name_en: 'Festivals', name_ta: 'திருவிழாக்கள்' },
  { name_en: 'Food & Drink', name_ta: 'உணவு' },
  { name_en: 'Family & Home', name_ta: 'குடும்பம்' },
  { name_en: 'Nature', name_ta: 'இயற்கை' },
  { name_en: 'Body & Health', name_ta: 'உடல்' },
  { name_en: 'Time & Numbers', name_ta: 'நேரம்' },
  { name_en: 'Clothing & Colors', name_ta: 'துணி' },
  { name_en: 'Travel & Places', name_ta: 'பயணம்' },
  { name_en: 'Arts & Music', name_ta: 'கலை' },
  { name_en: 'Traditions', name_ta: 'பாரம்பரியம்' },
];

/**
 * Curated content: real story (info_en) and story-related keywords only.
 * Words in this story and the quiz use only these terms for these items.
 */
const CURATED = {
  Diwali: {
    name_ta: 'தீபாவளி',
    info_en: 'Diwali is the festival of lights, celebrated by Tamils and many others across the world. On the morning of Diwali, it is traditional to take an oil bath (ennaan kuli), wear new clothes, light oil lamps (diyas), burst firecrackers (pattasu), and share sweets with family and neighbours. The oil bath symbolizes purification and renewal. Lamps are lit to welcome prosperity and drive away darkness. Families gather to feast and exchange gifts.',
    terms: [
      { term_ta: 'எண்ணெய் குளிப்பு', term_en: 'Oil bath' },
      { term_ta: 'பட்டாசு', term_en: 'Firecracker' },
      { term_ta: 'விளக்கு', term_en: 'Oil lamp / Diya' },
      { term_ta: 'மிட்டாய்', term_en: 'Sweets' },
      { term_ta: 'புது உடை', term_en: 'New clothes' },
      { term_ta: 'தீபாவளி', term_en: 'Diwali' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'பரிசு', term_en: 'Gift' },
      { term_ta: 'உணவு', term_en: 'Food' },
    ],
  },
  Pongal: {
    name_ta: 'பொங்கல்',
    info_en: 'Pongal is Tamil Nadu\'s most beloved harvest festival. Celebrated in January, families cook the sweet rice dish "Pongal" in a new pot and let it boil over—symbolizing abundance. The festival lasts four days. People decorate their homes with kolam (rangoli), thank the sun and farm animals, and share the harvest. Key words include rice, milk, jaggery, and the kolam drawn at the doorstep.',
    terms: [
      { term_ta: 'பொங்கல்', term_en: 'Pongal (dish & festival)' },
      { term_ta: 'கொல்லம்', term_en: 'Kolam / Rangoli' },
      { term_ta: 'வெல்லம்', term_en: 'Jaggery' },
      { term_ta: 'அரிசி', term_en: 'Rice' },
      { term_ta: 'பால்', term_en: 'Milk' },
      { term_ta: 'விவசாயம்', term_en: 'Agriculture / Farming' },
      { term_ta: 'வெயில்', term_en: 'Sun' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'புது பானை', term_en: 'New pot' },
      { term_ta: 'விருந்து', term_en: 'Feast' },
    ],
  },
  'Tamil New Year': {
    name_ta: 'தமிழ் புத்தாண்டு',
    info_en: 'Tamil New Year (Puthandu) is celebrated in mid-April and marks the first day of the Tamil calendar. The day begins with viewing the kani—an auspicious sight prepared the night before. The kani typically includes fruits such as mango and jackfruit, flowers, betel leaves, gold, a mirror, and other items arranged on a tray. Waking to see the kani first thing is believed to bring good fortune for the year ahead. Families then gather for a special feast that often includes vadai, mango, jackfruit, and other seasonal dishes. People exchange greetings and wish one another a prosperous new year. Wearing new clothes is customary, and many visit temples to seek blessings. The kani ritual and the emphasis on fresh beginnings reflect the Tamil value of starting the year with gratitude and hope. In Tamil Nadu and among Tamils worldwide, the day is a public holiday and is celebrated with traditional foods, music, and family gatherings. The festival underscores the importance of the Tamil calendar and cultural identity.',
    terms: [
      { term_ta: 'காணி', term_en: 'Auspicious sight / Kani' },
      { term_ta: 'வடை', term_en: 'Vadai' },
      { term_ta: 'மா', term_en: 'Mango' },
      { term_ta: 'பலா', term_en: 'Jackfruit' },
      { term_ta: 'புத்தாண்டு', term_en: 'New Year' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings / Hello' },
      { term_ta: 'பழம்', term_en: 'Fruit' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'புது உடை', term_en: 'New clothes' },
    ],
  },
  Navaratri: {
    name_ta: 'நவராத்திரி',
    info_en: 'Navaratri is a nine-night festival dedicated to the goddess, celebrated across India and in Tamil homes with great devotion. In Tamil Nadu, a central feature is the golu—tiers of steps displaying dolls and figurines representing gods, goddesses, and scenes from mythology. Families invite relatives and friends to view the golu, and guests are welcomed with betel leaves, coconuts, and small gifts. Each evening, lamps are lit and offerings of flowers and fruits are made. Songs and devotional music are sung in praise of the goddess. The nine nights are associated with different forms of the divine feminine, and many observe fasting or dietary restrictions. The tenth day is Vijayadashami, considered highly auspicious. On this day, books and tools are honoured in a ritual that marks the start of new learning—children often begin their first lessons on Vijayadashami. The festival thus combines worship, community, and the celebration of knowledge and the arts.',
    terms: [
      { term_ta: 'நவராத்திரி', term_en: 'Navaratri' },
      { term_ta: 'கொலு', term_en: 'Golu (display of dolls)' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'விளக்கு', term_en: 'Lamp' },
      { term_ta: 'தேங்காய்', term_en: 'Coconut' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'பாட்டு', term_en: 'Song' },
      { term_ta: 'புத்தகம்', term_en: 'Book' },
      { term_ta: 'விருந்து', term_en: 'Feast' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
    ],
  },
  Thaipusam: {
    name_ta: 'தைப்பூசம்',
    info_en: 'Thaipusam is a festival of devotion dedicated to Lord Murugan (Skanda), celebrated in the Tamil month of Thai. It commemorates the day when the goddess Parvati gave Murugan the vel (spear) to defeat the demon Surapadman. Devotees prepare for the festival with fasting and prayer, and many undertake a pilgrimage to Murugan temples. A striking aspect of Thaipusam is the carrying of kavadi—ornate structures borne on the shoulders as offerings. Some devotees also carry pots of milk, flowers, or other offerings. In certain traditions, devotees undergo piercings as an act of faith and penance. Temples are decorated with lights and flowers, and the air is filled with chants and devotional music. The festival is observed with particular fervour at temples such as Palani in Tamil Nadu and at Murugan shrines in other countries. Thaipusam reflects the deep devotion of Tamils to Lord Murugan and the values of discipline, sacrifice, and gratitude.',
    terms: [
      { term_ta: 'தைப்பூசம்', term_en: 'Thaipusam' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'காவடி', term_en: 'Kavadi (offering burden)' },
      { term_ta: 'பால்', term_en: 'Milk' },
      { term_ta: 'பூஜை', term_en: 'Prayer / Worship' },
      { term_ta: 'நோன்பு', term_en: 'Fasting' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'விளக்கு', term_en: 'Lamp' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
      { term_ta: 'தமிழ்', term_en: 'Tamil' },
    ],
  },
  Karthigai: {
    name_ta: 'கார்த்திகை',
    info_en: 'Karthigai Deepam is the festival of lamps, celebrated in the Tamil month of Karthigai (usually November–December). The name "Deepam" means lamp, and the festival is marked by the lighting of countless lamps in and around the home, in temples, and in public spaces. It is believed that lighting lamps on this day dispels darkness and brings peace and prosperity. In some traditions, the festival is associated with Lord Shiva and the appearance of a divine light. Families clean their homes, draw kolam at the entrance, and prepare sweets to offer to the gods and to share with neighbours and relatives. In the evening, rows of clay lamps are lit, creating a beautiful and serene atmosphere. Temples hold special ceremonies, and the lighting of the main lamp at places like Tiruvannamalai is a major event. Karthigai Deepam underscores the Tamil cultural emphasis on light as a symbol of knowledge, hope, and the triumph of good over evil.',
    terms: [
      { term_ta: 'கார்த்திகை', term_en: 'Karthigai (month & festival)' },
      { term_ta: 'விளக்கு', term_en: 'Lamp' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'மிட்டாய்', term_en: 'Sweets' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'அமைதி', term_en: 'Peace' },
      { term_ta: 'இரவு', term_en: 'Night' },
      { term_ta: 'வெயில்', term_en: 'Sun' },
      { term_ta: 'பூ', term_en: 'Flower' },
    ],
  },
  Aadi: {
    name_ta: 'ஆடி',
    info_en: 'Aadi is the fourth month of the Tamil calendar, spanning mid-July to mid-August. It is considered a sacred month, especially for the worship of the goddess in various forms. Aadi Fridays are particularly important: many women observe fasting, wear traditional dress, and visit temples to offer prayers and flowers. The month coincides with the monsoon season, and in agricultural communities it is linked to the rhythms of farming and the anticipation of a good harvest. Aadi Perukku, observed on the 18th day of Aadi, is a festival of thanksgiving for water. Rivers are believed to be in full flow during this period, and Aadi Perukku celebrates the life-giving power of water and the abundance of nature. People gather by rivers and water bodies, offer prayers, and share food. The month thus combines devotion, the importance of water and agriculture, and the strengthening of family and community bonds.',
    terms: [
      { term_ta: 'ஆடி', term_en: 'Aadi (Tamil month)' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'நோன்பு', term_en: 'Fasting' },
      { term_ta: 'மழை', term_en: 'Rain' },
      { term_ta: 'விவசாயம்', term_en: 'Agriculture / Farming' },
      { term_ta: 'நீர்', term_en: 'Water' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'பூஜை', term_en: 'Prayer / Worship' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
      { term_ta: 'பூ', term_en: 'Flower' },
    ],
  },
  Aipasi: {
    name_ta: 'ஐப்பசி',
    info_en: 'Aipasi is the seventh month of the Tamil calendar, from mid-October to mid-November. It is a month rich in festivals and devotion. Deepavali, the festival of lights, often falls in Aipasi, and homes and temples are lit with lamps. The month is also associated with the harvest and with honouring ancestors; many families perform rituals and offer food to departed souls. Temples are busy with special pujas, and devotees wear new clothes and exchange sweets with family and friends. The weather turns cooler, and the period is considered favourable for weddings and other auspicious events in some traditions. Aipasi thus brings together the themes of light, gratitude, remembrance, and community, and remains an important time in the Tamil cultural and religious calendar. In villages, the harvest is brought home and shared, and in cities, people travel to their native places to celebrate with family. The month closes the festive season and prepares the community for the year ahead.',
    terms: [
      { term_ta: 'ஐப்பசி', term_en: 'Aipasi (Tamil month)' },
      { term_ta: 'தீபாவளி', term_en: 'Diwali' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'பூஜை', term_en: 'Prayer / Worship' },
      { term_ta: 'மிட்டாய்', term_en: 'Sweets' },
      { term_ta: 'புது உடை', term_en: 'New clothes' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'விளக்கு', term_en: 'Lamp' },
      { term_ta: 'உணவு', term_en: 'Food' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
    ],
  },
  'Kanda Shashti': {
    name_ta: 'கந்த சஷ்டி',
    info_en: 'Kanda Shashti is a six-day festival dedicated to Lord Murugan (Skanda), observed in the Tamil month of Aipasi. It commemorates the victory of Murugan over the demon Surapadman and the forces of evil. Devotees observe fasting, recite prayers and hymns, and visit Murugan temples daily. The festival builds over the six days, with the final day being the most significant. On that day, Soora Samharam—the slaying of the demon—is re-enacted in many temples with processions and rituals. Offerings of flowers, fruits, and milk are made to the deity, and the vel (sacred spear) of Murugan is honoured as a symbol of divine power and protection. The festival attracts large numbers of devotees and reinforces the importance of Murugan worship in Tamil culture. Palani, Swamimalai, and other Murugan shrines see a surge of pilgrims during this period. The discipline of the six-day observance is seen as a way to cultivate devotion and inner strength.',
    terms: [
      { term_ta: 'கந்த சஷ்டி', term_en: 'Kanda Shashti' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'நோன்பு', term_en: 'Fasting' },
      { term_ta: 'பூஜை', term_en: 'Prayer / Worship' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'பழம்', term_en: 'Fruit' },
      { term_ta: 'பால்', term_en: 'Milk' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
      { term_ta: 'விளக்கு', term_en: 'Lamp' },
      { term_ta: 'வீடு', term_en: 'House' },
    ],
  },
  'Maha Shivaratri': {
    name_ta: 'மகா சிவராத்திரி',
    info_en: 'Maha Shivaratri is the great night of Lord Shiva, observed by Tamils and Hindus worldwide. It falls on the 14th night of the dark fortnight in the Tamil month of Masi or Phanguni. Devotees stay awake through the night, offering bilva leaves, milk, honey, and flowers to the Shiva lingam. Fasting and meditation are common, and many recite the names of Shiva or sing devotional songs. Temples are lit with lamps and filled with the sound of bells and chants. The festival is believed to symbolize the overcoming of darkness and ignorance and the awakening of spiritual consciousness. Observing the night with devotion is said to bring peace and blessings. Maha Shivaratri remains one of the most important festivals in the Tamil and Hindu calendar. Major Shiva temples, including those in Tamil Nadu, hold special abhishekams and ceremonies throughout the night. The collective vigil creates a powerful atmosphere of devotion and unity among devotees.',
    terms: [
      { term_ta: 'மகா சிவராத்திரி', term_en: 'Maha Shivaratri' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'நோன்பு', term_en: 'Fasting' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'பால்', term_en: 'Milk' },
      { term_ta: 'விளக்கு', term_en: 'Lamp' },
      { term_ta: 'இரவு', term_en: 'Night' },
      { term_ta: 'பூஜை', term_en: 'Prayer / Worship' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
    ],
  },
  // Food & Drink
  'South Indian Breakfast': {
    name_ta: 'தென்னிந்திய காலை உணவு',
    info_en: 'South Indian breakfast is a beloved part of Tamil and broader South Indian cuisine. A typical spread includes idli (steamed rice cakes), dosai (fermented rice-and-lentil crepes), vada (savoury lentil doughnuts), and pongal (a rice-and-lentil dish, often seasoned with pepper and cumin). These are served with sambar (a lentil-based vegetable stew) and chutneys made from coconut, tomato, or mint. Coffee or tea often accompanies the meal. The preparation relies on rice and urad dal, which are soaked, ground, and fermented overnight. Many families still make these dishes at home, while street vendors and restaurants serve them from early morning. The meal is light yet filling and is enjoyed across Tamil Nadu and beyond. Breakfast is a time when families sit together before starting the day.',
    terms: [
      { term_ta: 'இட்லி', term_en: 'Idli' },
      { term_ta: 'தோசை', term_en: 'Dosai' },
      { term_ta: 'வடை', term_en: 'Vadai' },
      { term_ta: 'அரிசி', term_en: 'Rice' },
      { term_ta: 'காபி', term_en: 'Coffee' },
      { term_ta: 'தேநீர்', term_en: 'Tea' },
      { term_ta: 'உணவு', term_en: 'Food' },
      { term_ta: 'காலை', term_en: 'Morning' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'வீடு', term_en: 'House' },
    ],
  },
  'Rice Dishes': {
    name_ta: 'அரிசி உணவுகள்',
    info_en: 'Rice is the staple grain of Tamil Nadu and forms the base of countless dishes. Plain steamed rice is eaten with sambar, rasam, and a variety of vegetable curries. Pongal—both the festival dish and the everyday version—is rice cooked with lentils and seasoned with black pepper, cumin, and ghee. Biryani, though influenced by other regions, is popular in Tamil cities. Tamarind rice (puliyodarai) and lemon rice are common packed meals. Rice is also ground into flour for idli and dosai batter. In traditional meals, rice is served on a banana leaf, with each course—rice with ghee, sambar, rasam, curd—adding to the experience. The cultivation of rice is tied to Tamil agriculture and the monsoon, and the grain holds cultural and religious significance in offerings and festivals.',
    terms: [
      { term_ta: 'அரிசி', term_en: 'Rice' },
      { term_ta: 'உணவு', term_en: 'Food' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'காய்', term_en: 'Vegetable' },
      { term_ta: 'விருந்து', term_en: 'Feast' },
      { term_ta: 'பால்', term_en: 'Milk' },
      { term_ta: 'வெல்லம்', term_en: 'Jaggery' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'விவசாயம்', term_en: 'Agriculture' },
      { term_ta: 'மழை', term_en: 'Rain' },
    ],
  },
  Sweets: {
    name_ta: 'மிட்டாய்',
    info_en: 'Sweets hold a special place in Tamil culture and are offered at temples, shared at festivals, and given as gifts. Traditional sweets include mysore pak (gram flour and ghee), laddu (sweet balls made of flour, sugar, and ghee), jangiri (fried batter in syrup), and adhirasam (rice-and-jaggery fritters). Milk-based sweets like payasam (sweetened milk with rice or vermicelli) are prepared for celebrations. Sweets are often offered to gods and then distributed as prasadam. At weddings and festivals, boxes of sweets are exchanged between families. The use of ghee, jaggery, and coconut is common. Modern bakeries and sweet shops offer both traditional and newer varieties, but homemade sweets are still valued for their connection to family recipes and occasions.',
    terms: [
      { term_ta: 'மிட்டாய்', term_en: 'Sweets' },
      { term_ta: 'பால்', term_en: 'Milk' },
      { term_ta: 'வெல்லம்', term_en: 'Jaggery' },
      { term_ta: 'அரிசி', term_en: 'Rice' },
      { term_ta: 'உணவு', term_en: 'Food' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'பரிசு', term_en: 'Gift' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'விருந்து', term_en: 'Feast' },
    ],
  },
  // Family & Home
  'Family Terms': {
    name_ta: 'குடும்பச் சொற்கள்',
    info_en: 'Tamil has a rich set of terms for family members, reflecting the importance of kinship and respect. Parents are amma (mother) and appa (father). Elder brother is annan and elder sister is akka; younger brother is thambi and younger sister is thangai. Grandparents, uncles, aunts, and in-laws each have specific terms that often indicate whether they are from the father’s or mother’s side. Respect is shown through the use of plural or honorific forms. In daily life, these terms are used both for one’s own family and for addressing or referring to others politely. The family is the core unit in Tamil society, and knowing the right term for each relation is part of social etiquette. Many Tamils live in joint or extended families where these terms are used constantly.',
    terms: [
      { term_ta: 'அம்மா', term_en: 'Mother' },
      { term_ta: 'அப்பா', term_en: 'Father' },
      { term_ta: 'அக்கா', term_en: 'Elder sister' },
      { term_ta: 'அண்ணன்', term_en: 'Elder brother' },
      { term_ta: 'தம்பி', term_en: 'Younger brother' },
      { term_ta: 'தங்கை', term_en: 'Younger sister' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'நண்பர்', term_en: 'Friend' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
    ],
  },
  'Home & Rooms': {
    name_ta: 'வீடும் அறைகளும்',
    info_en: 'The Tamil home is the centre of family life. Traditional homes might have a central courtyard, a puja room for worship, and separate areas for cooking and sleeping. The entrance is often marked with a kolam in the morning. Key terms include the main door, the kitchen, the room where guests are received, and the space where the family eats together. In modern apartments, the same words are used for hall, bedroom, and kitchen. The home is kept clean and is the place where festivals are celebrated and guests are welcomed. Many rituals—from daily prayers to wedding ceremonies—take place at home. The concept of the house extends to the idea of lineage and ancestry, with some families maintaining a shared ancestral home in the village or town of origin.',
    terms: [
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'அறை', term_en: 'Room' },
      { term_ta: 'முற்றம்', term_en: 'Courtyard' },
      { term_ta: 'வாசல்', term_en: 'Entrance' },
      { term_ta: 'சமையலறை', term_en: 'Kitchen' },
      { term_ta: 'உணவு', term_en: 'Food' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
      { term_ta: 'விளக்கு', term_en: 'Lamp' },
    ],
  },
  Greetings: {
    name_ta: 'வணக்கம்',
    info_en: 'Greetings in Tamil culture express respect and warmth. Vanakkam is the most common greeting—it can mean hello, welcome, or goodbye, and is often accompanied by a slight bow or folded hands (namaskaram). When meeting elders, one might touch their feet or offer a formal greeting. Thank you is nandri. Asking after someone’s health or family is part of polite conversation. On festivals, people exchange special wishes: for Puthandu (Tamil New Year), "Puthandu vazthukal"; for Deepavali, "Deepavali nalvazhthukal." In formal or religious contexts, greetings may include the other person’s title or relationship. Learning the right way to greet and take leave is an important part of fitting into Tamil social life, whether in the family, at work, or at the temple.',
    terms: [
      { term_ta: 'வணக்கம்', term_en: 'Greetings / Hello' },
      { term_ta: 'நன்றி', term_en: 'Thank you' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'புத்தாண்டு', term_en: 'New Year' },
      { term_ta: 'தீபாவளி', term_en: 'Diwali' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'நண்பர்', term_en: 'Friend' },
      { term_ta: 'அம்மா', term_en: 'Mother' },
      { term_ta: 'அப்பா', term_en: 'Father' },
    ],
  },
  // Nature
  Plants: {
    name_ta: 'மரங்கள் மற்றும் செடிகள்',
    info_en: 'Tamil Nadu is rich in plant life, from coconut and banana palms to neem, tamarind, and flowering trees. The coconut tree is called thennai and is often called the "tree of life" for its many uses—coconut water, oil, and the flesh are used in cooking and rituals. The neem tree is valued for its medicinal properties. Flowers like jasmine (mullai) and marigold are used in temples and for adornment. In villages, people grow vegetables and herbs in their backyards. Trees and plants appear in Tamil literature and in proverbs. Many festivals involve the offering of leaves and flowers to the gods. Knowing the names of common plants and trees is part of everyday vocabulary and connects Tamils to their natural environment and to traditional knowledge about food and medicine.',
    terms: [
      { term_ta: 'மரம்', term_en: 'Tree' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'காய்', term_en: 'Vegetable' },
      { term_ta: 'பழம்', term_en: 'Fruit' },
      { term_ta: 'தேங்காய்', term_en: 'Coconut' },
      { term_ta: 'வாழை', term_en: 'Banana' },
      { term_ta: 'நிலம்', term_en: 'Earth / Land' },
      { term_ta: 'வானம்', term_en: 'Sky' },
      { term_ta: 'வெயில்', term_en: 'Sun' },
      { term_ta: 'மழை', term_en: 'Rain' },
    ],
  },
  Animals: {
    name_ta: 'விலங்குகள்',
    info_en: 'Animals play a significant role in Tamil culture, from the cattle that help in farming to the peacock (the state bird of Tamil Nadu) and the elephant (associated with temples and festivals). Cows are revered and are part of rituals in many households. The Tamil word for cow is pasu (or specifically cattle); the bull is used in traditional sports like jallikattu. Birds such as the crow, sparrow, and parrot appear in folklore and daily life. Snakes are both feared and worshipped, and there are temples dedicated to snake deities. In villages, people live close to animals and know their habits and names. The vocabulary for animals is part of children’s early learning and of the broader Tamil literary and oral tradition.',
    terms: [
      { term_ta: 'விலங்கு', term_en: 'Animal' },
      { term_ta: 'பறவை', term_en: 'Bird' },
      { term_ta: 'மாடு', term_en: 'Cow' },
      { term_ta: 'நிலம்', term_en: 'Earth / Land' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'விவசாயம்', term_en: 'Agriculture' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'மரம்', term_en: 'Tree' },
    ],
  },
  Weather: {
    name_ta: 'வானிலை',
    info_en: 'Weather shapes daily life and agriculture in Tamil Nadu. The monsoon (mazhai) is crucial for farming; the northeast monsoon brings rain to the state from October to December. The sun (veyil) is strong for much of the year, and people avoid the midday heat. Words for hot, cold, wind, and rain are used every day. The monsoon is celebrated in songs and in festivals like Aadi Perukku. Drought and flood are part of collective memory and are reflected in prayers and proverbs. Knowing the weather helps farmers plan sowing and harvest and helps everyone plan travel and outdoor work. The vocabulary of weather is also used in greetings and in describing one’s health and mood.',
    terms: [
      { term_ta: 'வெயில்', term_en: 'Sun' },
      { term_ta: 'மழை', term_en: 'Rain' },
      { term_ta: 'காற்று', term_en: 'Wind' },
      { term_ta: 'சூடான', term_en: 'Hot' },
      { term_ta: 'குளிர்', term_en: 'Cold' },
      { term_ta: 'வானம்', term_en: 'Sky' },
      { term_ta: 'நிலம்', term_en: 'Earth / Land' },
      { term_ta: 'விவசாயம்', term_en: 'Agriculture' },
      { term_ta: 'நீர்', term_en: 'Water' },
      { term_ta: 'வீடு', term_en: 'House' },
    ],
  },
  // Body & Health
  'Body Parts': {
    name_ta: 'உடல் பாகங்கள்',
    info_en: 'Tamil has specific words for body parts that are used in daily speech, in medicine, and in literature. The head is thalai, the face is mugam, and the eyes are kan. The hand is kai and the leg is kaal. The heart is idayam (or idam) and is often used to mean the seat of emotions. The stomach is vayiru. When describing pain or illness, people name the body part. Children learn these terms early. In traditional medicine and in yoga, the names of body parts are important. Gestures—such as touching the head to show respect or pointing with the hand—are part of communication. Knowing the Tamil words for body parts helps in visiting a doctor, in learning songs and stories, and in understanding expressions and idioms.',
    terms: [
      { term_ta: 'தலை', term_en: 'Head' },
      { term_ta: 'முகம்', term_en: 'Face' },
      { term_ta: 'கண்', term_en: 'Eye' },
      { term_ta: 'கை', term_en: 'Hand' },
      { term_ta: 'கால்', term_en: 'Leg' },
      { term_ta: 'வயிறு', term_en: 'Stomach' },
      { term_ta: 'இதயம்', term_en: 'Heart' },
      { term_ta: 'உடல்', term_en: 'Body' },
      { term_ta: 'நடை', term_en: 'Walk' },
      { term_ta: 'ஓடு', term_en: 'Run' },
    ],
  },
  Health: {
    name_ta: 'உடல்நலம்',
    info_en: 'Health is expressed in Tamil through words for wellness, illness, and care. To be healthy is to be hale and fit; to be sick is to have an illness that might affect the body or the mind. Traditional practices include diet based on the body’s balance, use of herbs, and rest. Hospitals and doctors are part of modern life, but many families still use home remedies and consult practitioners of traditional medicine. Eating well (nutritious food, regular meals), sleeping enough, and staying active are discussed in everyday conversation. When someone is unwell, relatives and friends ask after their health and may suggest rest or a visit to the doctor. The vocabulary of health is essential for describing one’s condition and for understanding advice and prescriptions.',
    terms: [
      { term_ta: 'உடல்', term_en: 'Body' },
      { term_ta: 'உணவு', term_en: 'Food' },
      { term_ta: 'நீர்', term_en: 'Water' },
      { term_ta: 'ஓய்வு', term_en: 'Rest' },
      { term_ta: 'தூங்கும்', term_en: 'Sleep' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'கை', term_en: 'Hand' },
      { term_ta: 'கண்', term_en: 'Eye' },
      { term_ta: 'முகம்', term_en: 'Face' },
    ],
  },
  // Time & Numbers
  'Days & Time': {
    name_ta: 'நாட்கள் மற்றும் நேரம்',
    info_en: 'Time in Tamil is expressed through words for the day, week, month, and year, and for parts of the day such as morning, noon, evening, and night. Today is indru, yesterday is netru, and tomorrow is naalai. The days of the week have their own names. The Tamil calendar is used for festivals and auspicious dates. Punctuality and the value of time are often emphasised in proverbs. Appointments, school, and work are organised around the clock and the calendar. Learning the words for time helps in making plans, telling stories, and understanding when events happen. The Tamil New Year (Puthandu) marks the start of a new calendar year and is a major reference point for time in Tamil culture.',
    terms: [
      { term_ta: 'நாள்', term_en: 'Day' },
      { term_ta: 'காலை', term_en: 'Morning' },
      { term_ta: 'மதியம்', term_en: 'Noon' },
      { term_ta: 'மாலை', term_en: 'Evening' },
      { term_ta: 'இரவு', term_en: 'Night' },
      { term_ta: 'இன்று', term_en: 'Today' },
      { term_ta: 'நேற்று', term_en: 'Yesterday' },
      { term_ta: 'நாளை', term_en: 'Tomorrow' },
      { term_ta: 'வாரம்', term_en: 'Week' },
      { term_ta: 'மாதம்', term_en: 'Month' },
    ],
  },
  Numbers: {
    name_ta: 'எண்கள்',
    info_en: 'Numbers in Tamil have their own set of words that are used in counting, in markets, in telling time, and in religious and cultural contexts. One is onru, two is irandu, three is moonru, and so on up to ten (pathu) and beyond. Larger numbers follow a system that is distinct from the English number names. Numbers are used when buying and selling, when giving ages and dates, and when reciting verses or performing rituals. Children learn to count in Tamil at home and at school. In temples, offerings might be counted in a certain way; in festivals, the number of lamps or items might have symbolic meaning. Learning Tamil numbers is essential for basic communication and for participating in daily and ceremonial activities.',
    terms: [
      { term_ta: 'ஒன்று', term_en: 'One' },
      { term_ta: 'இரண்டு', term_en: 'Two' },
      { term_ta: 'மூன்று', term_en: 'Three' },
      { term_ta: 'நான்கு', term_en: 'Four' },
      { term_ta: 'ஐந்து', term_en: 'Five' },
      { term_ta: 'ஆறு', term_en: 'Six' },
      { term_ta: 'ஏழு', term_en: 'Seven' },
      { term_ta: 'எட்டு', term_en: 'Eight' },
      { term_ta: 'ஒன்பது', term_en: 'Nine' },
      { term_ta: 'பத்து', term_en: 'Ten' },
    ],
  },
  // Clothing & Colors
  Clothing: {
    name_ta: 'ஆடை',
    info_en: 'Traditional Tamil clothing for women includes the saree (pudavai or saree) and the half-saree for younger women. Men wear the veshti (dhoti) for formal and religious occasions, often with a shirt or angavastram. In daily life, salwar kameez, churidar, and Western-style clothes are also common. The choice of dress depends on the occasion—festivals, weddings, and temple visits often call for traditional wear. Colors have significance: white is worn for mourning and for some rituals; red and other bright colors are popular for weddings. Clothes are cared for and passed down in some families. Learning the words for clothing and colors helps in shopping, in following dress codes, and in understanding descriptions in stories and songs.',
    terms: [
      { term_ta: 'துணி', term_en: 'Cloth' },
      { term_ta: 'புது உடை', term_en: 'New clothes' },
      { term_ta: 'சிவப்பு', term_en: 'Red' },
      { term_ta: 'வெள்ளை', term_en: 'White' },
      { term_ta: 'கருப்பு', term_en: 'Black' },
      { term_ta: 'மஞ்சள்', term_en: 'Yellow' },
      { term_ta: 'பச்சை', term_en: 'Green' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
    ],
  },
  Colors: {
    name_ta: 'நிறங்கள்',
    info_en: 'Colors in Tamil have names that are used in everyday speech, in art, and in cultural contexts. Red (sivappu) is associated with weddings and festivity; white (vellai) with purity and mourning; yellow (manjal) with turmeric and auspiciousness; green (pachai) with nature and growth. Black (karuppu) and blue (neelam) also have their place in dress and decoration. In kolam and in temple art, colors are used symbolically. When describing objects, people, or nature, the Tamil words for colors are essential. Children learn them early, and they appear in songs, stories, and proverbs. The choice of color for clothes and for rituals is often guided by tradition and by the occasion.',
    terms: [
      { term_ta: 'சிவப்பு', term_en: 'Red' },
      { term_ta: 'வெள்ளை', term_en: 'White' },
      { term_ta: 'மஞ்சள்', term_en: 'Yellow' },
      { term_ta: 'பச்சை', term_en: 'Green' },
      { term_ta: 'நீலம்', term_en: 'Blue' },
      { term_ta: 'கருப்பு', term_en: 'Black' },
      { term_ta: 'துணி', term_en: 'Cloth' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
    ],
  },
  'Traditional Wear': {
    name_ta: 'பாரம்பரிய ஆடை',
    info_en: 'Traditional wear in Tamil Nadu reflects the region’s identity and is worn on festivals, at weddings, and for temple visits. Women wear the saree draped in the Tamil style; the veshti (dhoti) for men is a long piece of cloth wrapped around the waist and legs. The angavastram is a cloth worn over the shoulder. For dance performances such as Bharatanatyam, the costume is elaborate and specific to the art form. Jewelry—necklaces, earrings, bangles—complements traditional dress. The choice of fabric (silk, cotton) and color is often guided by the occasion and by family custom. Many Tamils living abroad keep traditional wear for visits home and for community events. Understanding the vocabulary of traditional clothing helps in appreciating the culture and in participating in ceremonies.',
    terms: [
      { term_ta: 'துணி', term_en: 'Cloth' },
      { term_ta: 'புது உடை', term_en: 'New clothes' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
      { term_ta: 'விருந்து', term_en: 'Feast' },
      { term_ta: 'சிவப்பு', term_en: 'Red' },
      { term_ta: 'மஞ்சள்', term_en: 'Yellow' },
    ],
  },
  // Travel & Places
  Temple: {
    name_ta: 'கோயில்',
    info_en: 'The temple (kovil) is at the heart of Tamil religious and social life. Tamil Nadu has thousands of temples, from small village shrines to large complexes like Madurai Meenakshi and Chidambaram. A visit to the temple involves circumambulation, offering flowers and fruits, and receiving prasadam. Temples are also centres of art, music, and learning. Festivals draw large crowds, and daily rituals are performed by priests. The architecture of Tamil temples—with gopurams (towers), mandapams (halls), and the sanctum—is distinctive. Many Tamils visit the temple on birthdays, after important events, or on festival days. The vocabulary associated with the temple—offerings, prayers, festivals—is part of everyday language for devout families.',
    terms: [
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'பூஜை', term_en: 'Prayer / Worship' },
      { term_ta: 'விளக்கு', term_en: 'Lamp' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
      { term_ta: 'மிட்டாய்', term_en: 'Sweets' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'பரிசு', term_en: 'Gift' },
      { term_ta: 'உணவு', term_en: 'Food' },
    ],
  },
  Village: {
    name_ta: 'கிராமம்',
    info_en: 'The village (gramam or ur) has a special place in Tamil culture. Many Tamils trace their roots to a village where their family has land or an ancestral home. Village life is associated with agriculture, temples, and close-knit communities. Festivals are celebrated with collective participation; marriages and other events bring the village together. In cities, people often refer to their "native place" or "village" when speaking of their origin. Development has changed many villages, but the idea of the village as a place of identity and tradition remains strong. Words for the village, the farm, the well, and the temple are part of the vocabulary of belonging and of Tamil literary and folk traditions.',
    terms: [
      { term_ta: 'கிராமம்', term_en: 'Village' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'விவசாயம்', term_en: 'Agriculture' },
      { term_ta: 'நிலம்', term_en: 'Earth / Land' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'நீர்', term_en: 'Water' },
      { term_ta: 'மழை', term_en: 'Rain' },
      { term_ta: 'வெயில்', term_en: 'Sun' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
    ],
  },
  Pilgrimage: {
    name_ta: 'தீர்த்த யாத்திரை',
    info_en: 'Pilgrimage (thirtha yatrai or yatrai) is an important practice in Tamil religious life. Devotees travel to sacred places—temples, rivers, and hills—to seek blessings and to fulfil vows. Famous pilgrimage sites in Tamil Nadu include Palani (Murugan), Rameswaram (Shiva), Madurai (Meenakshi), and many others. Pilgrims often travel in groups, sometimes walking long distances. The journey is seen as a form of penance and devotion. Accommodation and food are arranged at or near the temple. Pilgrimage vocabulary includes the words for journey, temple, offering, and vow. For many Tamils, undertaking a pilgrimage at least once in a lifetime is a cherished goal. The experience strengthens faith and connects individuals to a larger tradition.',
    terms: [
      { term_ta: 'பயணம்', term_en: 'Travel / Journey' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'பூஜை', term_en: 'Prayer / Worship' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'நோன்பு', term_en: 'Fasting' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'விளக்கு', term_en: 'Lamp' },
      { term_ta: 'உணவு', term_en: 'Food' },
    ],
  },
  // Arts & Music
  Music: {
    name_ta: 'இசை',
    info_en: 'Music is central to Tamil culture, from classical Carnatic music to film songs and folk tunes. Carnatic music has a long tradition in Tamil Nadu, with compositions in Tamil and other languages. The veena, mridangam, violin, and flute are among the instruments used. Concerts and kutcheris are held in temples and halls. Film music has a huge following, and Tamil film songs are known for their lyrics and melody. Devotional songs (bhajans, keerthanai) are sung at home and in temples. Folk music accompanies dance and village festivals. Learning the vocabulary of music—instruments, rhythm, song—helps in appreciating performances and in understanding the role of music in Tamil life and in religious and social events.',
    terms: [
      { term_ta: 'பாட்டு', term_en: 'Song' },
      { term_ta: 'இசை', term_en: 'Music' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'கேட்கும்', term_en: 'Listen' },
      { term_ta: 'பேசும்', term_en: 'Speak' },
      { term_ta: 'விருந்து', term_en: 'Feast' },
    ],
  },
  Dance: {
    name_ta: 'நடனம்',
    info_en: 'Dance in Tamil Nadu includes classical forms like Bharatanatyam and folk dances performed at village festivals. Bharatanatyam originated in the temples of Tamil Nadu and tells stories through gesture, expression, and movement. Dancers train for years and perform to Carnatic music. Folk dances are often performed in groups during harvest festivals and other occasions. Dance is also part of film and stage entertainment. The vocabulary of dance—words for movement, rhythm, and expression—is used when describing performances and when learning or teaching. Dance is seen as an offering to the divine and as a way of preserving and transmitting Tamil culture and mythology.',
    terms: [
      { term_ta: 'நடனம்', term_en: 'Dance' },
      { term_ta: 'பாட்டு', term_en: 'Song' },
      { term_ta: 'இசை', term_en: 'Music' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'நடை', term_en: 'Walk' },
      { term_ta: 'கை', term_en: 'Hand' },
      { term_ta: 'கண்', term_en: 'Eye' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
    ],
  },
  Bharatanatyam: {
    name_ta: 'பரதநாட்டியம்',
    info_en: 'Bharatanatyam is a classical dance form that originated in the temples of Tamil Nadu. It was traditionally performed by devadasis as an offering to the gods. Today it is learned by many as an art and a discipline. The dance combines nritta (pure movement), nritya (expression), and natya (drama). Hand gestures (mudras), facial expressions (abhinaya), and footwork are essential elements. Performances are set to Carnatic music and often depict stories from Hindu mythology. Dancers wear elaborate costume and jewelry. Learning Bharatanatyam requires years of practice and is considered a way of connecting to Tamil heritage. The vocabulary associated with the dance—including the names of items and the stories told—is part of Tamil cultural literacy.',
    terms: [
      { term_ta: 'நடனம்', term_en: 'Dance' },
      { term_ta: 'பாட்டு', term_en: 'Song' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'கை', term_en: 'Hand' },
      { term_ta: 'கண்', term_en: 'Eye' },
      { term_ta: 'துணி', term_en: 'Cloth' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
    ],
  },
  // Traditions
  Customs: {
    name_ta: 'பழக்கவழக்கங்கள்',
    info_en: 'Customs in Tamil culture govern everything from birth and naming to marriage and death. The way one greets elders, the dress worn at festivals, the food offered to guests, and the rituals performed at home and in the temple are all part of custom. Respect (mariyathai) is shown through language, gesture, and adherence to these practices. Customs vary by region and by community but share a common emphasis on family, respect for elders, and the observance of auspicious times. New generations often adapt customs while retaining core values. Learning the vocabulary of customs—rituals, offerings, blessings—helps in participating in family and community life and in understanding the meaning behind the practices.',
    terms: [
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'பூஜை', term_en: 'Prayer / Worship' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'உணவு', term_en: 'Food' },
      { term_ta: 'விருந்து', term_en: 'Feast' },
      { term_ta: 'பரிசு', term_en: 'Gift' },
      { term_ta: 'மிட்டாய்', term_en: 'Sweets' },
    ],
  },
  Rituals: {
    name_ta: 'சடங்குகள்',
    info_en: 'Rituals are an integral part of Tamil religious and social life. They mark birth, puberty, marriage, and death, and are performed on festival days and at the temple. A ritual might involve the lighting of a lamp, the offering of flowers and fruits, the recitation of mantras, and the distribution of prasadam. Priests or elders often lead the ceremonies. Families prepare for rituals by cleaning the house, fasting, or wearing specific clothes. The vocabulary of rituals—offerings, blessings, auspicious time—is used in conversation and in invitations. Understanding these terms helps in participating in ceremonies and in appreciating their significance for the family and the community.',
    terms: [
      { term_ta: 'பூஜை', term_en: 'Prayer / Worship' },
      { term_ta: 'விளக்கு', term_en: 'Lamp' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'நோன்பு', term_en: 'Fasting' },
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
      { term_ta: 'உணவு', term_en: 'Food' },
      { term_ta: 'மிட்டாய்', term_en: 'Sweets' },
    ],
  },
  Blessings: {
    name_ta: 'ஆசீர்வாதம்',
    info_en: 'Blessings (aaseervadam) are sought from elders, from gods, and from teachers in Tamil culture. When setting out on a journey, before an exam, or at a wedding, people touch the feet of elders and receive their blessing. The blessing might be words of good wish or a gesture of the hand. At the temple, devotees receive the blessing of the deity through the priest. Parents bless their children; teachers bless their students. The vocabulary of blessing is used in formal and emotional moments. To give a blessing is to wish someone well and to invoke divine or familial grace. Understanding how to seek and give blessings is part of Tamil social and religious etiquette.',
    terms: [
      { term_ta: 'வணக்கம்', term_en: 'Greetings' },
      { term_ta: 'குடும்பம்', term_en: 'Family' },
      { term_ta: 'கோயில்', term_en: 'Temple' },
      { term_ta: 'பூஜை', term_en: 'Prayer / Worship' },
      { term_ta: 'வீடு', term_en: 'House' },
      { term_ta: 'அம்மா', term_en: 'Mother' },
      { term_ta: 'அப்பா', term_en: 'Father' },
      { term_ta: 'பரிசு', term_en: 'Gift' },
      { term_ta: 'பூ', term_en: 'Flower' },
      { term_ta: 'நன்றி', term_en: 'Thank you' },
    ],
  },
};

const ITEM_NAMES_BY_CATEGORY = {
  0: ['Diwali', 'Pongal', 'Tamil New Year', 'Navaratri', 'Thaipusam', 'Karthigai', 'Aadi', 'Aipasi', 'Kanda Shashti', 'Maha Shivaratri'],
  1: ['South Indian Breakfast', 'Rice Dishes', 'Sweets', 'Curries', 'Snacks', 'Beverages', 'Festival Foods', 'Street Food', 'Temple Prasadam', 'Traditional Meals'],
  2: ['Family Terms', 'Home & Rooms', 'Relations', 'Daily Life', 'Greetings', 'Respect Terms', 'Elders', 'Children', 'Marriage', 'Ancestors'],
  3: ['Plants', 'Animals', 'Weather', 'Landscape', 'Birds', 'Rivers', 'Trees', 'Flowers', 'Seasons', 'Elements'],
  4: ['Body Parts', 'Health', 'Actions', 'Senses', 'Emotions', 'Illness', 'Care', 'Fitness', 'Diet', 'Wellbeing'],
  5: ['Days & Time', 'Numbers', 'Calendar', 'Moments', 'Duration', 'Past & Future', 'Frequency', 'Age', 'Dates', 'Schedule'],
  6: ['Clothing', 'Colors', 'Jewelry', 'Accessories', 'Traditional Wear', 'Materials', 'Patterns', 'Festival Dress', 'Wedding Wear', 'Daily Wear'],
  7: ['Places', 'Travel', 'Temple', 'Market', 'Village', 'City', 'Directions', 'Transport', 'Journey', 'Pilgrimage'],
  8: ['Music', 'Dance', 'Instruments', 'Classical', 'Folk', 'Songs', 'Rhythm', 'Temple Arts', 'Bharatanatyam', 'Carnatic'],
  9: ['Customs', 'Rituals', 'Respect', 'Celebrations', 'Offerings', 'Blessings', 'Ceremonies', 'Proverbs', 'Values', 'Elders'],
};

function generateSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function main() {
  const numCategories = Math.min(MAX_CATEGORIES, CATEGORY_NAMES.length);
  const itemsPerCategory = Math.ceil(MAX_ITEMS_TOTAL / numCategories);
  const categoryIds = {};
  const allItemIds = [];

  for (let i = 0; i < numCategories; i++) {
    const c = CATEGORY_NAMES[i];
    const slug = c.name_en.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { data, error } = await supabase
      .from('culture_categories')
      .upsert({ slug, name_en: c.name_en, name_ta: c.name_ta || null, sort_order: i }, { onConflict: 'slug' })
      .select('id')
      .single();
    if (error) {
      console.error('Category failed:', slug, error.message);
      continue;
    }
    categoryIds[i] = data.id;
    console.log('Category:', c.name_en);
  }

  let itemIndex = 0;
  for (let catIdx = 0; catIdx < numCategories && itemIndex < MAX_ITEMS_TOTAL; catIdx++) {
    const catId = categoryIds[catIdx];
    if (!catId) continue;
    const names = ITEM_NAMES_BY_CATEGORY[catIdx] || [];
    const count = Math.min(itemsPerCategory, MAX_ITEMS_TOTAL - itemIndex, names.length || 10);

    for (let j = 0; j < count && itemIndex < MAX_ITEMS_TOTAL; j++) {
      const name = names[j] || `Topic ${itemIndex + 1}`;
      const slug = generateSlug(name) + '-' + itemIndex;
      const curated = CURATED[name];
      const info_en = LONG_STORIES[name] || (curated ? curated.info_en : null) ||
        `Learn about ${name}. This topic covers related Tamil vocabulary and cultural context. Add a story and key words to see "Words in this story" and take a quiz.`;
      const name_ta = curated?.name_ta ?? null;
      const { data: item, error: itemErr } = await supabase
        .from('culture_items')
        .upsert(
          {
            category_id: catId,
            slug,
            name_en: name,
            name_ta,
            info_en,
            level: 'beginner',
            sort_order: itemIndex,
          },
          { onConflict: 'category_id,slug' }
        )
        .select('id')
        .single();
      if (itemErr) {
        console.error('Item failed:', slug, itemErr.message);
        continue;
      }
      allItemIds.push({ id: item.id, name });
      itemIndex++;
    }
  }

  console.log('Items created:', allItemIds.length);

  let totalTerms = 0;
  let itemNum = 0;
  for (const { id: itemId, name } of allItemIds) {
    const curated = CURATED[name];
    const termsToInsert = [];
    if (curated && Array.isArray(curated.terms) && curated.terms.length > 0) {
      curated.terms.forEach((t, i) => {
        termsToInsert.push({
          item_id: itemId,
          term_ta: t.term_ta,
          term_en: t.term_en,
          sort_order: i,
        });
      });
    }
    // Only curated items get terms; others get none so "Words in this story" and quiz stay story-related

    await supabase.from('culture_terms').delete().eq('item_id', itemId);
    if (termsToInsert.length > 0) {
      const { error } = await supabase.from('culture_terms').insert(termsToInsert);
      if (error) console.error('Terms failed for', name, error.message);
      else totalTerms += termsToInsert.length;
    }
    itemNum++;
    if (curated) console.log('  Curated terms:', name, termsToInsert.length);
  }

  console.log('Culture seed done. Categories:', numCategories, '| Items:', allItemIds.length, '| Terms (curated only):', totalTerms);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
