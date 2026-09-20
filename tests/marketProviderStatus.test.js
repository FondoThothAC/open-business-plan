import test from 'node:test';
import assert from 'node:assert/strict';
import { httpProviderStatus } from '../server/api/providerStatus.js';
import { PerplexitySearchEngine } from '../server/api/perplexitySearchEngine.js';
import { buildMarketReport } from '../server/api/marketResearchService.js';
import { InegiAgebEngine } from '../server/api/inegiAgebEngine.js';
test('missing keys and disabled fallback remain visible in a blocked report', async () => {
 const search = await new PerplexitySearchEngine({}, {allowSharedKeys:false, allowDuckDuckGo:false}).searchMarketContext('test');
 assert.deepEqual(search.attempts.map(a=>a.status), ['missing_key','missing_key','disabled']);
 const report = buildMarketReport({context:{},denue:{}, searches:[search]});
 assert.equal(report.status,'blocked');
 assert.match(report.markdown,/Sin clave configurada/);
});
test('provider HTTP errors distinguish credentials, consumption and availability', () => {
 assert.equal(httpProviderStatus(401),'credential_rejected');
 assert.equal(httpProviderStatus(403),'credential_rejected');
 assert.equal(httpProviderStatus(429),'rate_limited');
 assert.equal(httpProviderStatus(432),'rate_limited');
 assert.equal(httpProviderStatus(500),'unavailable');
});
test('DENUE rejects out of bounds coordinates and radius before network use', async () => {
 const result = await new InegiAgebEngine('').extractDemographicProfile(91,0,3000);
 assert.equal(result.provenance[0].status,'invalid_context');
 const missing = await new InegiAgebEngine('').extractDemographicProfile(29,-110,3000);
 assert.equal(missing.provenance[0].status,'missing_key');
});
test('observed web evidence with missing census remains partial', () => {
 const result = buildMarketReport({context:{}, searches:[{source:'tavily',results:[{url:'https://example.com',snippet:'price'}]}]});
 assert.equal(result.status,'partial');
 assert.equal(result.indicators[0].kind,'pending');
});
