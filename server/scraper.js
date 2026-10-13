/**
 * Scrapers headless con Puppeteer.
 *
 * [B6] Reestructurado sobre un helper comun `conPagina` porque los 5 exports repetian el
 * mismo patron defectuoso:
 *  - puppeteer.launch() estaba FUERA del try, asi que si el launch fallaba no habia nada
 *    que limpiar y si el catch cerraba sin guard, un close() fallido reemplazaba el error
 *    original (la funcion rechazaba y se perdia la causa real) o dejaba Chromium huerfano.
 *  - page.goto() recibia sin validar URLs que en /api/scrape/social vienen del body del
 *    request: SSRF directo (file://, 127.0.0.1:9229, 169.254.169.254).
 * Ahora: validacion antes de lanzar el navegador, launch dentro del try, cierre en finally
 * y revalidacion de cada request principal/subframe/xhr porque Puppeteer sigue
 * redirecciones por su cuenta.
 */
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { assertSafeExternalUrl, isSafeUrlShapeSync } from './urlSafety.js';

puppeteer.use(StealthPlugin());

const addHumanNoise = async (page) => {
    const scrollAmount = Math.floor(Math.random() * 500) + 100;
    await page.evaluate((scroll) => window.scrollBy(0, scroll), scrollAmount);
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 1500) + 500));
};

/**
 * Ejecuta `trabajo(page)` sobre una página con `url` ya validada. El navegador se crea
 * dentro del try y SIEMPRE se cierra en el finally sin enmascarar el error original.
 * @param {string} url
 * @param {(page: import('puppeteer').Page) => Promise<Object>} trabajo
 * @returns {Promise<Object>} lo que devuelva trabajo(), o { success:false, error } sin
 *   cambiar la forma que ya consumian los llamadores
 */
async function conPagina(url, trabajo) {
    try {
        // Se valida ANTES de lanzar Chromium: fallo rapido y sin proceso.
        await assertSafeExternalUrl(url);
    } catch (error) {
        return { success: false, error: error.message, code: 'URL_NOT_ALLOWED' };
    }

    let browser;
    try {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        // [B6] Puppeteer sigue redirecciones, asi que la validacion previa no cubre un
        // 302 hacia un host interno. Se revalida cada navegacion. Alcance conocido: aqui no
        // se resuelve DNS (el listener no puede aguardar), se chequean esquema, puerto,
        // userinfo, IP literal y nombres internos; queda la ventana de DNS rebinding. Para
        // cerrarla del todo habria que fijar --host-resolver-rules, que romperiria el uso
        // legitimo de dominios con múltiples IPs, asi que se documenta en lugar de hacerse.
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const tipo = req.resourceType();
            if (['main', 'sub_frame', 'xhr', 'fetch'].includes(tipo) && !isSafeUrlShapeSync(req.url())) {
                req.abort().catch(() => {});
            } else {
                req.continue().catch(() => {});
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        return await trabajo(page);
    } catch (e) {
        // Se preserva el error original (antes se reconstruia desde e.message dentro del
        // catch y un close() fallido lo reemplazaba por otro).
        return { success: false, error: e.message };
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
}

// Scraper de Redes Sociales
export const scrapeSocialFollowers = async (url) => {
    return conPagina(url, async (page) => {
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

        return { success: true, followers, rating, metadata, url };
    });
};

// Scraper de Uber Eats / Rappi (Delivery de Comida)
export const scrapeUberEatsRappi = async (url) => {
    return conPagina(url, async (page) => {
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

        return { success: true, platform: url.includes('ubereats.com') ? 'Uber Eats' : 'Rappi', rating, reviewsCount, priceRange, url };
    });
};

// Scraper de Airbnb / TripAdvisor
export const scrapeAirbnbTripAdvisor = async (url) => {
    return conPagina(url, async (page) => {
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

        return { success: true, platform: url.includes('airbnb.com') ? 'Airbnb' : 'TripAdvisor', rating, pricePerNight, reviews, url };
    });
};

// Scraper de MercadoLibre (E-commerce / Retail)
export const scrapeMercadoLibre = async (keyword) => {
    const searchUrl = `https://listado.mercadolibre.com.mx/${encodeURIComponent(keyword)}`;
    return conPagina(searchUrl, async (page) => {
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

        return { success: true, platform: 'MercadoLibre MX', keyword, products };
    });
};

// Scraper de Amazon (E-commerce / Retail)
export const scrapeEcommercePrices = async (keyword) => {
    const searchUrl = `https://www.amazon.com.mx/s?k=${encodeURIComponent(keyword)}`;
    return conPagina(searchUrl, async (page) => {
        await addHumanNoise(page);

        const products = await page.$$eval('[data-component-type="s-search-result"]', items => {
            return items.slice(0, 3).map(item => {
                const title = item.querySelector('h2 a span')?.innerText || 'Desconocido';
                const price = item.querySelector('.a-price-whole')?.innerText || 'No listado';
                const rating = item.querySelector('.a-icon-alt')?.innerText || 'Sin rating';
                return { title, price: `$${price}`, rating };
            });
        });

        return { success: true, platform: 'Amazon MX', keyword, products };
    });
};
