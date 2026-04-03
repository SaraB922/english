const fs = require('fs');
const https = require('https');

const FILE = 'src/data/words.json';
const SOURCE_URL = 'https://raw.githubusercontent.com/dariusk/corpora/master/data/words/common.json';
const FALLBACK_URL = 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt';

const banned = new Set([
  'the','a','an','this','that','these','those','some','any','each','every','other','another',
  'i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','its','our','their',
  'mine','yours','hers','ours','theirs','myself','yourself','himself','herself','itself','ourselves','themselves',
  'am','is','are','was','were','be','been','being','do','does','did','done','have','has','had','having',
  'can','could','may','might','must','shall','should','will','would',
  'to','of','in','on','at','by','for','from','with','without','into','onto','about','over','under','between','through','during','before','after','around','across','near',
  'and','or','but','if','because','while','than','as','so','then',
  'who','whom','whose','which','what','when','where','why','how',
  'not','no','yes','also','just','very','too','quite','rather','more','most','less','least','only','even','still','yet','again','already','ever','never','all',
  'there','here','now','today','tomorrow','yesterday',
  'one','two','three','four','five','six','seven','eight','nine','ten','first','second','third',
  'out','up','down','off',
  'usa','uk','jan','feb','mar','apr','jun','jul','aug','sep','oct','nov','dec',
  'january','february','march','april','june','july','august','september','october','november','december',
  'monday','tuesday','wednesday','thursday','friday','saturday','sunday',
  'dvd','pdf','html','xml',
  'ebay','yahoo','google','microsoft','linux','nokia','paypal','amazon',
  'texas','london','washington','france','italy','japan','africa','america',
]);

const unsafe = new Set(['sex','nude','naked','lesbian','drug','drugs','weapon','weapons','kill','killing','blood','murder','porn']);

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function translateWord(word) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=cs&dt=t&q=${encodeURIComponent(word)}`;
  return get(url)
    .then((raw) => {
      try {
        const parsed = JSON.parse(raw);
        return parsed?.[0]?.[0]?.[0] || word;
      } catch {
        return word;
      }
    })
    .catch(() => word);
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const i = cursor;
      cursor += 1;
      if (i >= items.length) return;
      results[i] = await mapper(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

function normalizeWord(w) {
  return w.toLowerCase().replace(/_\d+$/, '').trim();
}

function looksGood(w) {
  return /^[a-z]{3,12}$/.test(w) && !banned.has(w) && !unsafe.has(w);
}

function categoryFor(word) {
  if (word.endsWith('ly')) return 'adverb';
  if (word.endsWith('ing') || word.endsWith('ed') || word.endsWith('ize') || word.endsWith('ise')) return 'verb';
  if (word.endsWith('ous') || word.endsWith('ful') || word.endsWith('able') || word.endsWith('ible') || word.endsWith('al') || word.endsWith('ive')) return 'adjective';
  return 'noun';
}

(async () => {
  const current = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const sourceRaw = await get(SOURCE_URL);
  const sourceJson = JSON.parse(sourceRaw);
  const primaryWords = (sourceJson.commonWords || []).map((w) => String(w).trim().toLowerCase()).filter(Boolean);
  const fallbackRaw = await get(FALLBACK_URL);
  const fallbackWords = fallbackRaw.split(/\r?\n/).map((w) => w.trim().toLowerCase()).filter(Boolean);
  const sourceWords = [...primaryWords, ...fallbackWords];

  const replacementPool = [];
  const poolSeen = new Set();
  for (const w of sourceWords) {
    if (!looksGood(w) || poolSeen.has(w)) continue;
    poolSeen.add(w);
    replacementPool.push(w);
    if (replacementPool.length >= 5000) break;
  }

  if (replacementPool.length < 1000) {
    throw new Error(`Not enough source words after filtering: ${replacementPool.length}`);
  }

  const finalWords = replacementPool.slice(0, 1000);

  if (finalWords.length !== 1000) throw new Error(`Expected 1000 words, got ${finalWords.length}`);

  const translations = await mapWithConcurrency(finalWords, 10, translateWord);

  const output = current.map((row, i) => ({
    id: row.id,
    en: finalWords[i],
    cs: translations[i],
    category: categoryFor(finalWords[i]),
    difficulty: row.difficulty,
  }));

  fs.writeFileSync(FILE, `${JSON.stringify(output, null, 2)}\n`);

  console.log('Generated entries:', output.length);
  console.log('Unique words:', new Set(output.map((r) => r.en)).size);
  console.log('Left banned words:', output.filter((r) => banned.has(r.en)).length);
  console.log('First 12:', output.slice(0, 12).map((r) => `${r.en}=${r.cs}`).join(', '));
})();
