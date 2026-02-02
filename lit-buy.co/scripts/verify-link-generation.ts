
import { generateAgentLink, buildMarketplaceLink } from '../app/lib/link-converter/index';

// Mock data
const taobaoId = '123456';
const weidianId = '987654';
const _1688Id = '112233';

const taobaoUrl = buildMarketplaceLink('taobao', taobaoId);
const weidianUrl = buildMarketplaceLink('weidian', weidianId);
const _1688Url = buildMarketplaceLink('1688', _1688Id);

const agents = [
    'oopbuy', 'basetao', 'bbdbuy', 'eastmallbuy', 'gonestbuy',
    'itaobuy', 'joyagoo', 'loongbuy', 'lovegobuy', 'ootdbuy',
    'orientdig', 'pantherbuy', 'pingubuy', 'ponybuy', 'usfans'
];

console.log('--- Starting Link Generation Verification ---\n');

function verify(agent: string, platform: string, pid: string, rawUrl: string) {
    const link = generateAgentLink(agent, platform, pid, rawUrl);
    console.log(`[${agent.toUpperCase()}] ${platform} (${pid}) -> ${link}`);

    if (!link) {
        console.error(`FAILED: ${agent} returned null for ${platform}`);
        return;
    }

    // Basic validity checks
    if (!link.startsWith('http')) {
        console.error(`FAILED: ${agent} link is not a valid URL`);
    }

    // Check for affiliate codes (using known defaults from index.ts)
    // "kakobuy": "peter", "cnfans": "15340480", "mulebuy": "200311823"
    if (agent === 'kakobuy' && !link.includes('peter')) console.warn(`WARNING: Kakobuy link missing affcode`);
    if (agent === 'cnfans' && !link.includes('15340480')) console.warn(`WARNING: CNFans link missing affcode`);
    if (agent === 'mulebuy' && !link.includes('200311823')) console.warn(`WARNING: Mulebuy link missing affcode`);

    // Check specific platform params
    if (agent === 'cnfans') {
        if (platform === 'taobao' && !link.includes('platform=TAOBAO')) console.error(`FAILED: CNFans TaoBao platform param incorrect`);
        if (platform === 'weidian' && !link.includes('platform=WEIDIAN')) console.error(`FAILED: CNFans Weidian platform param incorrect`);
        if (platform === '1688' && !link.includes('platform=ALI_1688')) console.error(`FAILED: CNFans 1688 platform param incorrect`);
    }
}

console.log('\nTesting Taobao Links:');
agents.forEach(agent => verify(agent, 'taobao', taobaoId, taobaoUrl));

console.log('\nTesting Weidian Links:');
agents.forEach(agent => verify(agent, 'weidian', weidianId, weidianUrl));

console.log('\nTesting 1688 Links:');
agents.forEach(agent => verify(agent, '1688', _1688Id, _1688Url));


console.log('\n--- Testing Normalization ---');

import { normalizeAgentUrlToRaw } from '../app/lib/link-converter/index';

const testAgentLinks = [
    { name: 'KakoBuy', url: 'https://www.kakobuy.com/item/details?url=https%3A%2F%2Fitem.taobao.com%2Fitem.htm%3Fid%3D123456', expectedHost: 'taobao.com' },
    { name: 'CNFans', url: 'https://cnfans.com/product?id=123456&platform=TAOBAO', expectedHost: 'taobao.com' },
    { name: 'CNFans Weidian', url: 'https://cnfans.com/product?id=987654&platform=WEIDIAN', expectedHost: 'weidian.com' },
    { name: 'MuleBuy', url: 'https://mulebuy.com/product?id=112233&platform=ALI_1688', expectedHost: '1688.com' },
    { name: 'SuperBuy', url: 'https://www.superbuy.com/en/page/buy/?url=https%3A%2F%2Fitem.taobao.com%2Fitem.htm%3Fid%3D123456', expectedHost: 'taobao.com' }
];

testAgentLinks.forEach(test => {
    try {
        const normalized = normalizeAgentUrlToRaw(test.url);
        console.log(`[${test.name}] Normalized: ${normalized}`);
        if (!normalized.includes(test.expectedHost)) {
            console.error(`FAILED: ${test.name} normalized URL does not contain ${test.expectedHost}`);
        }
    } catch (e) {
        console.error(`FAILED: ${test.name} threw error: ${e}`);
    }
});

console.log('\n--- Verification Complete ---');
