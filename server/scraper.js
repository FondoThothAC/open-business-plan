import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const addHumanNoise = async (page) => {
    const scrollAmount = Math.floor(Math.random() * 500) + 100;
    await page.evaluate((scroll) => window.scrollBy(0, scroll), scrollAmount);
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 1500) + 500));
};

// Scraper de Redes Sociales
export const scrapeSocialFollowers = async (url) => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await addHumanNoise(page);

        let followers = 'No detectado';
        let rating = 'N/D';
        let metadata = '';

        if (url.includes('instagram.com')) {
            const metaContent = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => null);
            if (metaContent && metaContent.includes('Followers')) {
                followers = metaContent.split('Followers')[0].trim() + ' Followers';
            }
            metadata = metaContent || '';
        } else if (url.includes('facebook.com')) {
            const metaContent = await page.$eval('meta[name="description"]', el => el.content).catch(() => null);
            metadata = metaContent || '';
            if (metadata.includes('likes') || metadata.includes('me gusta')) {
                followers = metadata.split('·')[0]?.trim() || 'Ver descripción';
            } else {
                followers = 'Ver descripción pública';
            }
        } else if (url.includes('linkedin.com')) {
            const followersText = await page.evaluate(() => {
                const els = Array.from(document.querySelectorAll('span, div, p'));
                const found = els.find(el => el.innerText && el.innerText.includes('followers'));
                return found ? found.innerText : null;
            }).catch(() => null);
            followers = followersText || 'Requiere login / Perfil de Empresa';
        } else if (url.includes('tiktok.com')) {
            const metaContent = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => null);
            metadata = metaContent || '';
            followers = 'Ver perfil público';
        }

        await browser.close();
        return { success: true, followers, rating, metadata, url };
    } catch (e) {
        await browser.close();
        return { success: false, error: e.message };
    }
};

// Scraper de Uber Eats / Rappi (Delivery de Comida)
export const scrapeUberEatsRappi = async (url) => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await addHumanNoise(page);

        let rating = 'N/D';
        let reviewsCount = 'N/D';
        let priceRange = 'N/D';

        if (url.includes('ubereats.com')) {
            // Extraer calificación y rango de precios de la metadata de Uber Eats
            const ldJson = await page.evaluate(() => {
                const script = document.querySelector('script[type="application/ld+json"]');
                return script ? JSON.parse(script.innerText) : null;
            }).catch(() => null);

            if (ldJson) {
                rating = ldJson.aggregateRating?.ratingValue || 'N/D';
                reviewsCount = ldJson.aggregateRating?.reviewCount || 'N/D';
                priceRange = ldJson.priceRange || 'N/D';
            } else {
                rating = await page.evaluate(() => {
                    const el = document.querySelector('div[data-testid="restaurant-rating"]');
                    return el ? el.innerText.split('(')[0].trim() : 'N/D';
                }).catch(() => 'N/D');
            }
        } else if (url.includes('rappi.com')) {
            rating = await page.evaluate(() => {
                const el = document.querySelector('[data-testid="rating-value"]');
                return el ? el.innerText.trim() : 'N/D';
            }).catch(() => 'N/D');
        }

        await browser.close();
        return { success: true, platform: url.includes('ubereats.com') ? 'Uber Eats' : 'Rappi', rating, reviewsCount, priceRange, url };
    } catch (e) {
        await browser.close();
        return { success: false, error: e.message };
    }
};

// Scraper de Airbnb / TripAdvisor
export const scrapeAirbnbTripAdvisor = async (url) => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await addHumanNoise(page);

        let rating = 'N/D';
        let pricePerNight = 'N/D';
        let reviews = 'N/D';

        if (url.includes('airbnb.com')) {
            rating = await page.$eval('[data-testid="relative-link-to-reviews"]', el => el.innerText).catch(() => 'N/D');
            pricePerNight = await page.evaluate(() => {
                const el = document.querySelector('span._1y74zjx');
                return el ? el.innerText : 'N/D';
            }).catch(() => 'N/D');
        } else if (url.includes('tripadvisor.com')) {
            rating = await page.$eval('.ui_bubble_rating', el => el.getAttribute('alt') || el.innerText).catch(() => 'N/D');
            reviews = await page.$eval('.reviewCount', el => el.innerText).catch(() => 'N/D');
        }

        await browser.close();
        return { success: true, platform: url.includes('airbnb.com') ? 'Airbnb' : 'TripAdvisor', rating, pricePerNight, reviews, url };
    } catch (e) {
        await browser.close();
        return { success: false, error: e.message };
    }
};

// Scraper de MercadoLibre (E-commerce / Retail)
export const scrapeMercadoLibre = async (keyword) => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        
        const searchUrl = `https://listado.mercadolibre.com.mx/${encodeURIComponent(keyword)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await addHumanNoise(page);

        const products = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.ui-search-result__wrapper, .ui-search-result'));
            return items.slice(0, 3).map(item => {
                const title = item.querySelector('.ui-search-item__title')?.innerText || 'Desconocido';
                const priceFraction = item.querySelector('.poly-price__current .andes-money-amount__fraction, .price-tag-fraction')?.innerText || '';
                const rating = item.querySelector('.ui-search-reviews__rating, .poly-reviews__rating-number')?.innerText || 'Sin rating';
                return { title, price: priceFraction ? `$${priceFraction}` : 'No listado', rating };
            });
        });

        await browser.close();
        return { success: true, platform: 'MercadoLibre MX', keyword, products };
    } catch (e) {
        await browser.close();
        return { success: false, error: e.message };
    }
};

// Scraper de Amazon (E-commerce / Retail)
export const scrapeEcommercePrices = async (keyword) => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        
        const searchUrl = `https://www.amazon.com.mx/s?k=${encodeURIComponent(keyword)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await addHumanNoise(page);

        const products = await page.$$eval('[data-component-type="s-search-result"]', items => {
            return items.slice(0, 3).map(item => {
                const title = item.querySelector('h2 a span')?.innerText || 'Desconocido';
                const price = item.querySelector('.a-price-whole')?.innerText || 'No listado';
                const rating = item.querySelector('.a-icon-alt')?.innerText || 'Sin rating';
                return { title, price: `$${price}`, rating };
            });
        });

        await browser.close();
        return { success: true, platform: 'Amazon MX', keyword, products };
    } catch (e) {
        await browser.close();
        return { success: false, error: e.message };
    }
};
