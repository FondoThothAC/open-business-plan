import { search } from 'duck-duck-scrape';

async function run() {
  try {
    const response = await search('cibercafe hermosillo sonora');
    console.log('Results:', response.results.slice(0, 3));
  } catch (e) {
    console.error('Error:', e);
  }
}
run();
