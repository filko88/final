
import { buildTaobaoUrl, buildWeidianUrl, build1688Url } from './marketplace';

export type Marketplace = 'taobao' | 'weidian' | '1688' | '';

export interface AgentInfo {
    isAgent: boolean;
    agentName?: string;
    originalDomain?: string;
}

export interface ConvertedLink {
    rawLink: string;
    marketplace: Marketplace;
    productId: string;
    isValid: boolean;
    agentLink?: string;
    isAgent: boolean;
    agentName?: string;
    originalDomain?: string;
    error?: string;
}

export const SHORTLINK_BASE = (process.env.NEXT_PUBLIC_LINK_SHORTENER_BASE || "https://danodrevo-api.vercel.app").replace(/\/$/, "");

export const DEFAULT_AFFCODES: Record<string, string> = {
    "kakobuy": "peter",
    "hipobuy": "SBCXYTYKF",
    "cnfans": "15340480",
    "acbuy": "VDFVGW",
    "mulebuy": "200311823",
    "oopbuy": "5I6VVS7GI",
    "lovegobuy": "9RN41U",
    "itaobuy": "5E6LZQUE",
    "cssbuy": "",
    "usfans": "GAYXBM",
    "superbuy": "EVZK8D",
    "basetao": "eGREeq3wGLEToq4LAxM",
    "eastmallbuy": "petopagi",
    "pingubuy": "blBaSG5JMTE",
    "hoobuy": "AXnBBwX7",
    "orientdig": "100123295",
    "ootdbuy": "PETER",
    "sugargoo": "2533720779801838919",
    "joyagoo": "",
    "pantherbuy": "MTM0OQ==",
    "ponybuy": "fee1a5754a",
    "bbdbuy": "cGV0b3BhZ2k=",
    "gonestbuy": "",
    "loongbuy": "B28F4ZFN",
};

export function sanitizeProductId(pid: string): string {
    if (!pid) return "";
    let p = pid;
    if (p.includes("/")) p = p.split("/")[0];
    if (p.includes("?")) p = p.split("?")[0];
    return p.replace(/[^\w-]/g, "");
}

export function buildShortAgentLink(agent: string, platform: string, productId: string, affiliateCode?: string): string {
    const agentLower = (agent || "").toLowerCase();
    const mp = (platform || "").toLowerCase();
    const pid = sanitizeProductId(productId);
    const aff = affiliateCode ? `/${encodeURIComponent(affiliateCode)}` : "";
    return `${SHORTLINK_BASE}/${agentLower}/${mp}/${pid}${aff}`;
}

export function buildMarketplaceLink(platform: string, productId: string): string {
    const pLower = (platform || "").toLowerCase();
    const pid = sanitizeProductId(productId);
    if (pLower === 'taobao' || pLower === 'tmall') return buildTaobaoUrl(pid);
    if (pLower === 'weidian') return buildWeidianUrl(pid);
    if (['1688', 'ali_1688', 'alibaba', 'ali1688'].includes(pLower)) return build1688Url(pid);
    return buildTaobaoUrl(pid);
}

export function generateAgentLink(
    agent: string,
    platform: string,
    productId: string,
    rawUrl?: string,
    affiliateCodeOverride?: string
): string | null {
    const agentLower = (agent || "").toLowerCase();
    const pid = sanitizeProductId(productId);
    const mp = (platform || "").toLowerCase();
    const raw = rawUrl || buildMarketplaceLink(mp, pid);
    const override = (affiliateCodeOverride || "").trim();
    if (override) {
        return buildShortAgentLink(agentLower, mp, pid, override);
    }
    const aff = DEFAULT_AFFCODES[agentLower] || "";
    const enc = (val: string) => encodeURIComponent(val);

    if (agentLower === "kakobuy") {
        const affParam = aff ? `&affcode=${enc(aff)}` : "";
        return `https://www.kakobuy.com/item/details?url=${enc(raw)}${affParam}`;
    }
    if (agentLower === "hipobuy") {
        const code = mp === "1688" ? "0" : (mp === "taobao" ? "1" : "weidian");
        const suffix = aff ? `?inviteCode=${enc(aff)}` : "";
        return `https://hipobuy.com/product/${code}/${pid}${suffix}`;
    }
    if (agentLower === "cnfans") {
        const plat = mp === "1688" ? "ALI_1688" : (mp === "weidian" ? "WEIDIAN" : "TAOBAO");
        const ref = aff ? `&ref=${enc(aff)}` : "";
        return `https://cnfans.com/product?id=${pid}&platform=${plat}${ref}`;
    }
    if (agentLower === "mulebuy") {
        const plat = mp === "1688" ? "ALI_1688" : (mp === "weidian" ? "WEIDIAN" : "TAOBAO");
        const ref = aff ? `&ref=${enc(aff)}` : "";
        return `https://mulebuy.com/product?id=${pid}&platform=${plat}${ref}`;
    }
    if (agentLower === "acbuy") {
        const src = mp === "1688" ? "AL" : (mp === "weidian" ? "WD" : "TB");
        const ref = aff ? `&u=${enc(aff)}` : "";
        return `https://www.acbuy.com/product?id=${pid}&source=${src}${ref}`;
    }
    if (agentLower === "oopbuy") {
        const code = mp === "1688" ? "0" : (mp === "taobao" ? "1" : "weidian");
        const ref = aff ? `?inviteCode=${enc(aff)}` : "";
        return `https://oopbuy.com/product/${code}/${pid}${ref}`;
    }
    if (agentLower === "lovegobuy") {
        const shopType = mp === "1688" ? "ali_1688" : mp;
        const ref = aff ? `&invite_code=${enc(aff)}` : "";
        return `https://lovegobuy.com/product?id=${pid}&shop_type=${shopType}${ref}`;
    }
    if (agentLower === "itaobuy") {
        const ref = aff ? `&inviteCode=${enc(aff)}` : "";
        return `https://www.itaobuy.com/product-detail?url=${enc(raw)}${ref}`;
    }
    if (agentLower === "hoobuy") {
        const code = mp === "1688" ? "0" : (mp === "taobao" ? "1" : "2");
        const affQuery = aff ? `?inviteCode=${enc(aff)}` : "";
        return `https://hoobuy.com/product/${code}/${pid}${affQuery}`;
    }
    if (agentLower === "superbuy") {
        const plat = mp === "1688" ? "ALIBABA" : (mp === "weidian" ? "WD" : "TMALL");
        const ref = aff ? `&partnercode=${enc(aff)}` : "";
        return `https://www.superbuy.com/en/page/buy/?platform=${plat}&id=${pid}${ref}`;
    }
    if (agentLower === "sugargoo") {
        const affQuery = aff ? `&memberId=${enc(aff)}` : "";
        return `https://www.sugargoo.com/productDetail?productLink=${enc(raw)}${affQuery}`;
    }
    if (agentLower === "cssbuy") {
        if (mp === "1688") return `https://cssbuy.com/item-1688-${pid}.html`;
        if (mp === "weidian") return `https://cssbuy.com/item-micro-${pid}.html`;
        return `https://cssbuy.com/item-${pid}.html`;
    }
    if (agentLower === "usfans") {
        const code = mp === "1688" ? "1" : (mp === "taobao" ? "2" : "3");
        const ref = aff ? `?ref=${enc(aff)}` : "";
        return `https://usfans.com/product/${code}/${pid}${ref}`;
    }
    if (agentLower === "basetao") {
        return `https://www.basetao.com/best-taobao-agent-service/products/agent/${mp}/${pid}.html`;
    }
    if (agentLower === "eastmallbuy") {
        if (mp === "1688") return `https://eastmallbuy.com/item?tp=1688&tid=${pid}&inviter=${enc(aff)}`;
        if (mp === "weidian") return `https://eastmallbuy.com/item?tp=micro&tid=${pid}&inviter=${enc(aff)}`;
        const affQuery = aff ? `&inviter=${enc(aff)}` : "";
        return `https://eastmallbuy.com/index/item/index.html?tp=taobao&url=${enc(raw)}${affQuery}`;
    }
    if (agentLower === "pingubuy") {
        if (mp === "1688") return `https://pingubuy.com/item-1688-${pid}.html`;
        if (mp === "weidian") return `https://pingubuy.com/item-micro-${pid}.html`;
        const affQuery = aff ? `?promotionCode=${enc(aff)}` : "";
        return `https://pingubuy.com/item-${pid}.html${affQuery}`;
    }
    if (agentLower === "orientdig") {
        const plat = mp === "1688" ? "ALI_1688" : (mp === "weidian" ? "WEIDIAN" : "TAOBAO");
        const ref = aff ? `&ref=${enc(aff)}` : "";
        return `https://orientdig.com/product?id=${pid}&platform=${plat}${ref}`;
    }
    if (agentLower === "ootdbuy") {
        const ch = mp === "taobao" ? "TAOBAO" : mp;
        return `https://www.ootdbuy.com/goods/details?id=${pid}&channel=${ch}`;
    }
    if (agentLower === "joyagoo") {
        const plat = mp === "1688" ? "ALI_1688" : (mp === "weidian" ? "WEIDIAN" : "TAOBAO");
        const ref = aff ? `&ref=${enc(aff)}` : "";
        return `https://joyagoo.com/product?id=${pid}&platform=${plat}${ref}`;
    }
    if (agentLower === "pantherbuy") {
        if (mp === "1688") return `https://pantherbuy.com/item?tp=1688&tid=${pid}`;
        if (mp === "weidian") return `https://pantherbuy.com/item?tp=micro&tid=${pid}`;
        const affQuery = aff ? `&inviteid=${enc(aff)}` : "";
        return `https://pantherbuy.com/index/item/index.html?tp=taobao&url=${enc(raw)}${affQuery}`;
    }
    if (agentLower === "ponybuy") {
        const pcode = mp === "1688" ? "2" : (mp === "taobao" ? "1" : "3");
        const affQuery = aff ? `?inviteCode=${enc(aff)}` : "";
        return `https://www.ponybuy.com/products/${pcode}/${pid}${affQuery}`;
    }
    if (agentLower === "bbdbuy") {
        if (mp === "1688") return `https://bbdbuy.com/index/item1688/index.html?tp=1688&tid=${pid}`;
        if (mp === "weidian") return `https://bbdbuy.com/index/item/index.html?tp=micro&tid=${pid}`;
        return `https://bbdbuy.com/index/item/index.html?tp=taobao&tid=${pid}`;
    }
    if (agentLower === "gonestbuy") {
        if (mp === "1688") return `https://buy.gonest.cn/en/product/${pid}?platform=1688&type=0`;
        if (mp === "taobao") return `https://buy.gonest.cn/en/product/${pid}?platform=taobao&type=1`;
        return `https://buy.gonest.cn/en/product/0?platform=micro&type=2&keyword=${enc(raw)}`;
    }
    if (agentLower === "loongbuy") {
        if (['1688', 'weidian', 'taobao'].includes(mp)) return `https://loongbuy.com/product-details?${mp}=${pid}`;
        return `https://loongbuy.com/product-details?url=${enc(raw)}`;
    }
    if (agentLower === "allchinabuy") {
        return `https://www.allchinabuy.com/en/page/buy/?nTag=Home-search&from=search-input&_search=url&position=&url=${enc(raw)}&partnercode=dkreps`;
    }

    return null;
}

export function extractIdAndMarketplace(rawUrl: string): { productId: string, marketplace: string } {
    try {
        const u = new URL(rawUrl);
        const params = u.searchParams;
        const hostname = u.hostname.toLowerCase();

        if (hostname.includes("taobao.com") || hostname.includes("tmall.com")) {
            return { productId: params.get("id") || "", marketplace: "taobao" };
        }
        if (hostname.includes("weidian.com")) {
            return { productId: params.get("itemID") || params.get("itemId") || "", marketplace: "weidian" };
        }
        if (hostname.includes("1688.com")) {
            const m = u.pathname.match(/\/offer\/(\d+)/);
            if (m) return { productId: m[1], marketplace: "1688" };
        }
        return { productId: "", marketplace: "" };
    } catch {
        return { productId: "", marketplace: "" };
    }
}

export function normalizeAgentUrlToRaw(urlStr: string): string {
    try {
        const u = new URL(urlStr);
        const host = u.hostname.toLowerCase().replace("www.", "");
        const params = u.searchParams;

        // Simple unwraps
        if (host.includes("kakobuy") && params.get("url")) return decodeURIComponent(params.get("url")!);
        if (host.includes("superbuy") && params.get("url")) return decodeURIComponent(params.get("url")!);

        if (host.includes("itaobuy") && params.get("url")) return decodeURIComponent(params.get("url")!);

        if (host.includes("cnfans") || host.includes("mulebuy") || host.includes("orientdig") || host.includes("joyagoo") || host.includes("lovegobuy") || host.includes("ootdbuy")) {
            const id = params.get("id");
            const p1 = params.get("platform") || "";
            const p2 = params.get("shop_type") || "";
            const p3 = params.get("channel") || "";
            const platform = (p1 || p2 || p3).toUpperCase();

            if (id) {
                if (platform.includes("1688")) return buildMarketplaceLink("1688", id);
                if (platform.includes("WEIDIAN") || platform.includes("WD")) return buildMarketplaceLink("weidian", id);
                if (platform.includes("TAOBAO") || platform.includes("TMALL") || platform.includes("TB")) return buildMarketplaceLink("taobao", id);
            }
        }

        if (host.includes("hoobuy") || host.includes("oopbuy") || host.includes("ponybuy") || host.includes("usfans") || host.includes("gonest") || host.includes("hipobuy")) {
            // https://hoobuy.com/product/1/746534604815
            // Also handles oopbuy, ponybuy (products/...), usfans
            const parts = u.pathname.split('/').filter(p => p && p !== 'en'); // filter 'en' for gonest
            // parts usually ['product', '1', '7465...'] or ['products', '1', '...']
            let codeIndex = -1;

            if (parts.includes('product')) codeIndex = parts.indexOf('product') + 1;
            else if (parts.includes('products')) codeIndex = parts.indexOf('products') + 1;
            else if (parts.includes('goods') && parts.includes('details')) {
                // ootdbuy might be here if params failed? No, ootdbuy is query param based.
            }

            if (codeIndex > 0 && codeIndex < parts.length - 1) {
                const code = parts[codeIndex];
                const pid = parts[codeIndex + 1];

                // 1688: 0, 2 (pony)
                // Taobao: 1
                // Weidian: 2, 3 (pony/usf), "weidian" (old oop)

                // PonyBuy: 2=1688, 3=Weidian, 1=Taobao
                // USFans: 1=1688, 2=TB, 3=WD
                // Hoobuy/Oopbuy/Hipo/Gonest: 0=1688, 1=TB, 2=WD

                if (host.includes("ponybuy")) {
                    if (code === '2') return buildMarketplaceLink("1688", pid);
                    if (code === '1') return buildMarketplaceLink("taobao", pid);
                    if (code === '3') return buildMarketplaceLink("weidian", pid);
                }

                if (host.includes("usfans")) {
                    if (code === '1') return buildMarketplaceLink("1688", pid);
                    if (code === '2') return buildMarketplaceLink("taobao", pid);
                    if (code === '3') return buildMarketplaceLink("weidian", pid);
                }

                // Default (Hoobuy/Oopbuy/Hipo/Gonest)
                if (code === '0') return buildMarketplaceLink("1688", pid);
                if (code === '1') return buildMarketplaceLink("taobao", pid);
                if (code === '2') return buildMarketplaceLink("weidian", pid);

                // Fallbacks for text or other variations
                if (code === 'weidian') return buildMarketplaceLink("weidian", pid);
                if (code === 'ali_1688') return buildMarketplaceLink("1688", pid);
                if (code === 'taobao') return buildMarketplaceLink("taobao", pid);
            }
        }

        if (host.includes("basetao") && (params.get("keyword") || params.get("url"))) {
            return decodeURIComponent(params.get("keyword") || params.get("url")!);
        }

        if (host.includes("eastmallbuy") || host.includes("bbdbuy") || host.includes("pantherbuy") || host.includes("loongbuy")) {
            // New format: /index/weidian/itemID=... or /product-details?url=...
            if (params.get("url")) return decodeURIComponent(params.get("url")!);
            if (params.get("weidian")) return buildMarketplaceLink("weidian", params.get("weidian")!);

            // EastMallBuy/BBD new format: /index/weidian/itemID=...
            // pathname: /index/weidian/itemID=123
            const parts = u.pathname.split('/');
            // parts: ['', 'index', 'weidian', 'itemID=123']
            if (parts.length >= 4) {
                const part = parts[parts.length - 1]; // itemID=123
                if (part.startsWith("itemID=")) return buildMarketplaceLink("weidian", part.replace("itemID=", ""));
                if (part.startsWith("id=")) {
                    const pid = part.replace("id=", "");
                    if (parts.includes("1688")) return buildMarketplaceLink("1688", pid);
                    if (parts.includes("taobao")) return buildMarketplaceLink("taobao", pid);
                }
            }
        }

        if (host.includes("cssbuy")) {
            const path = u.pathname;
            const m1688 = path.match(/item-1688-(\d+)\.html/);
            if (m1688) return buildMarketplaceLink("1688", m1688[1]);
            const mWeidian = path.match(/item-micro-(\d+)\.html/);
            if (mWeidian) return buildMarketplaceLink("weidian", mWeidian[1]);
            const mTaobao = path.match(/item-(\d+)\.html/);
            if (mTaobao) return buildMarketplaceLink("taobao", mTaobao[1]);
        }

        // ACBuy
        if (host.includes("acbuy")) {
            const id = params.get("id");
            const src = (params.get("source") || "").toUpperCase(); // AL, WD, TB
            if (id) {
                if (src === "AL") return buildMarketplaceLink("1688", id);
                if (src === "WD") return buildMarketplaceLink("weidian", id);
                return buildMarketplaceLink("taobao", id);
            }
        }

        // OopBuy
        if (host.includes("oopbuy")) {
            const parts = u.pathname.split('/').filter(Boolean);
            if (parts.length >= 3 && parts[0] === 'product') {
                // /product/1/12345
                const code = parts[1];
                const pid = parts[2];
                if (["0", "1688"].includes(code)) return buildMarketplaceLink("1688", pid);
                if (["1", "taobao", "tmall"].includes(code)) return buildMarketplaceLink("taobao", pid);
                return buildMarketplaceLink("weidian", pid);
            }
        }

        return urlStr;
    } catch {
        return urlStr;
    }
}

export class LinkConverter {
    private knownShortenerHosts = new Set([
        "ikako.vip", "sl.kakobuy.com", "k.youshop10.com", "youshop10.com",
        "hipobuy.cn", "link.acbuy.com", "oopbuy.cc", "itaobuy.allapp.link",
        "hoobuy.cc", "s.spblk.com", "e.tb.cn", "m.tb.cn", "l.ponybuy.com",
        "bit.ly", "tinyurl.com", "t.cn", "goo.gl", "is.gd", "v.gd",
        "ow.ly", "rebrand.ly"
    ]);

    private knownAgentOrMarketplaceHosts = [
        "taobao.com", "tmall.com", "1688.com", "weidian.com", "yupoo.com",
        "kakobuy.com", "kakobuy.co", "kabobuy.com", "hipobuy.com",
        "cnfans.com", "acbuy.com", "mulebuy.com", "oopbuy.com",
        "lovegobuy.com", "itaobuy.com", "cssbuy.com", "usfans.com",
        "superbuy.com", "basetao.com", "eastmallbuy.com", "pingubuy.com",
        "hoobuy.com", "orientdig.com", "ootdbuy.com", "sugargoo.com",
        "joyagoo.com", "pantherbuy.com", "ponybuy.com", "bbdbuy.com",
        "gonest.cn", "loongbuy.com", "blikbuy.com", "allchinabuy.com",
        "doppel.fit", "repsheet.net",
    ];

    private urlParamKeys = ["url", "link", "u", "productLink"];

    constructor() { }

    public async convertLink(encodedUrl: string, preferredAgent?: string): Promise<ConvertedLink> {
        try {
            let sanitizedInput = (encodedUrl || "").trim();
            if (sanitizedInput.startsWith("@")) {
                sanitizedInput = sanitizedInput.replace(/^@+/, "").trim();
            }
            // Basic decode
            sanitizedInput = this.multiDecode(sanitizedInput);

            if (!this.isValidUrl(sanitizedInput)) {
                const extracted = this.extractFirstUrlFromString(sanitizedInput);
                if (extracted) {
                    sanitizedInput = extracted;
                }
            }

            if (!this.isValidUrl(sanitizedInput)) {
                return this.resultInvalid("Invalid URL format");
            }

            let workingUrl = sanitizedInput;
            const probeCandidates: string[] = [workingUrl];

            // 1) Unwrap common query params
            const [newUrl, extractedInner] = this.tryUnwrapCommonParams(workingUrl, probeCandidates);
            workingUrl = newUrl;

            if (!extractedInner) {
                const inner = this.unwrapInnerUrlAnywhere(workingUrl);
                if (inner) {
                    probeCandidates.push(workingUrl);
                    workingUrl = inner;
                }
            }

            // 2) Resolve short links
            if (this.isLikelyShortLink(workingUrl)) {
                const resolved = await this.resolveShortLink(workingUrl);
                if (this.isValidUrl(resolved)) {
                    probeCandidates.push(resolved);
                    workingUrl = resolved;
                }
            }

            // 2b) Handle SPA hash params
            workingUrl = this.handleSpaHash(workingUrl);

            const agentInfo = this.detectAgent(sanitizedInput);

            if (this.isRegistrationOrNonProductLink(workingUrl)) {
                return this.resultInvalid("Not a product link (registration/invite)", agentInfo);
            }

            probeCandidates.push(workingUrl);
            workingUrl = normalizeAgentUrlToRaw(workingUrl);
            const { productId, marketplace } = extractIdAndMarketplace(workingUrl);

            // const { productId, marketplace } = this.extractIdAndMarketplace(workingUrl);

            if (productId && marketplace) {
                return this.resultValid(
                    buildMarketplaceLink(marketplace, productId),
                    marketplace as Marketplace,
                    productId,
                    agentInfo,
                    preferredAgent
                );
            }

            // Fallback: heuristic from text
            const fallback = this.extractPlatformAndIdFromText(workingUrl);
            if (fallback.productId && fallback.marketplace) {
                return this.resultValid(
                    buildMarketplaceLink(fallback.marketplace, fallback.productId),
                    fallback.marketplace as Marketplace,
                    fallback.productId,
                    agentInfo,
                    preferredAgent
                );
            }

            // Probe HTML via HTTP request (simulated via fetch for now, might need server-side proxying if CORS issues arises, but this code runs server-side)
            for (const candidate of probeCandidates) {
                const probed = await this.probeForRawUrlViaHttp(candidate);
                if (this.isValidUrl(probed)) {
                    const normalized = normalizeAgentUrlToRaw(probed);
                    const { productId: pid2, marketplace: mp2 } = extractIdAndMarketplace(normalized);
                    if (pid2 && mp2) {
                        return this.resultValid(
                            buildMarketplaceLink(mp2, pid2),
                            mp2 as Marketplace,
                            pid2,
                            agentInfo,
                            preferredAgent
                        );
                    }
                }
            }

            // Final manual redirect follow
            const finalHop = await this.followRedirectsManually(sanitizedInput);
            if (this.isValidUrl(finalHop)) {
                const info = this.detectAgent(finalHop);
                return {
                    rawLink: finalHop,
                    marketplace: '',
                    productId: '',
                    isValid: true,
                    isAgent: info.isAgent,
                    agentName: info.agentName,
                    originalDomain: info.originalDomain
                };
            }

            return this.resultInvalid("Could not extract product ID or marketplace", agentInfo);

        } catch (exc: any) {
            return {
                rawLink: "",
                marketplace: "",
                productId: "",
                isValid: false,
                error: String(exc),
                isAgent: false,
                originalDomain: "error"
            };
        }
    }

    public resolveMarketplaceAndId(marketplaceHint: string, itemOrUrl: string): { marketplace: string, productId: string, rawUrl: string } {
        const candidate = (itemOrUrl || "").trim();
        const marketplace = (marketplaceHint || "").toLowerCase().trim();

        if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
            const raw = normalizeAgentUrlToRaw(candidate);
            const { marketplace: mp, productId: pid } = extractIdAndMarketplace(raw);
            if (mp && pid) {
                return { marketplace: mp, productId: sanitizeProductId(pid), rawUrl: buildMarketplaceLink(mp, pid) };
            }
            if (marketplace) {
                const pidFromUrl = sanitizeProductId(candidate.split('/').pop() || "");
                return { marketplace, productId: pidFromUrl, rawUrl: buildMarketplaceLink(marketplace, pidFromUrl) };
            }
            throw new Error("Unable to resolve marketplace and id from URL");
        }

        if (marketplace) {
            const pid = sanitizeProductId(candidate);
            return { marketplace, productId: pid, rawUrl: buildMarketplaceLink(marketplace, pid) };
        }

        const extracted = this.extractFirstUrlFromString(candidate);
        if (extracted) {
            const raw = normalizeAgentUrlToRaw(extracted);
            const { marketplace: mp, productId: pid } = extractIdAndMarketplace(raw);
            if (mp && pid) {
                return { marketplace: mp, productId: sanitizeProductId(pid), rawUrl: buildMarketplaceLink(mp, pid) };
            }
        }

        throw new Error("Unable to resolve marketplace and id from input");
    }


    // --- Helpers ---

    public buildMarketplaceLink(platform: string, productId: string): string {
        return buildMarketplaceLink(platform, productId);
    }

    public buildAgentLink(agent: string, platform: string, productId: string, rawUrl?: string): string | null {
        return generateAgentLink(agent, platform, productId, rawUrl);
    }

    private sanitizeProductId(pid: string): string {
        return sanitizeProductId(pid);
    }

    // --- Internal ---

    private resultInvalid(msg: string, agentInfo?: any): ConvertedLink {
        const info = agentInfo || { isAgent: false, originalDomain: "invalid-url" };
        return {
            rawLink: "",
            marketplace: '' as Marketplace,
            productId: "",
            isValid: false,
            error: msg,
            isAgent: info.isAgent,
            agentName: info.agentName,
            originalDomain: info.originalDomain
        };
    }

    private resultValid(raw: string, marketplace: Marketplace, productId: string, agentInfo: any, preferredAgent?: string): ConvertedLink {
        const agent = (preferredAgent || "").toLowerCase();
        const agentLink = agent ? (this.buildAgentLink(agent, marketplace, productId, raw) || undefined) : undefined;
        return {
            rawLink: raw,
            marketplace,
            productId,
            isValid: true,
            agentLink,
            isAgent: agentInfo.isAgent,
            agentName: agentInfo.agentName,
            originalDomain: agentInfo.originalDomain
        };
    }

    private detectAgent(originalUrl: string): AgentInfo {
        try {
            const u = new URL(originalUrl);
            const domain = u.hostname.toLowerCase().replace("www.", "");

            // Simple mapping
            if (domain.includes("cnfans")) return { isAgent: true, agentName: "CNFans", originalDomain: domain };
            if (domain.includes("hoobuy")) return { isAgent: true, agentName: "HooBuy", originalDomain: domain };
            if (domain.includes("mulebuy")) return { isAgent: true, agentName: "MuleBuy", originalDomain: domain };
            if (domain.includes("superbuy")) return { isAgent: true, agentName: "SuperBuy", originalDomain: domain };
            if (domain.includes("cssbuy")) return { isAgent: true, agentName: "CSSBuy", originalDomain: domain };
            if (domain.includes("sugargoo")) return { isAgent: true, agentName: "SugarGoo", originalDomain: domain };
            if (domain.includes("kakobuy")) return { isAgent: true, agentName: "KakoBuy", originalDomain: domain };
            if (domain.includes("joyagoo")) return { isAgent: true, agentName: "JoyaGoo", originalDomain: domain };
            if (domain.includes("orientdig")) return { isAgent: true, agentName: "OrientDig", originalDomain: domain };
            if (domain.includes("ponybuy")) return { isAgent: true, agentName: "PonyBuy", originalDomain: domain };
            if (domain.includes("allchinabuy")) return { isAgent: true, agentName: "AllChinaBuy", originalDomain: domain };

            return { isAgent: false, originalDomain: domain };
        } catch {
            return { isAgent: false, originalDomain: "invalid-url" };
        }
    }

    private extractIdAndMarketplace(rawUrl: string): { productId: string, marketplace: string } {
        return extractIdAndMarketplace(rawUrl);
    }


    // Basic implementation of network helpers

    private async probeForRawUrlViaHttp(urlStr: string): Promise<string> {
        try {
            const res = await fetch(urlStr, {
                redirect: 'follow',
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
                signal: AbortSignal.timeout(5000)
            });
            const endUrl = res.url;
            if (this.isValidUrl(endUrl)) {
                if (endUrl.includes("taobao.com") || endUrl.includes("weidian.com") || endUrl.includes("1688.com")) {
                    return endUrl;
                }
            }
            // Simple regex search in body
            const text = await res.text();
            const p = this.extractPlatformAndIdFromText(text);
            if (p.productId && p.marketplace) {
                return buildMarketplaceLink(p.marketplace, p.productId);
            }
            return "";
        } catch {
            return "";
        }
    }

    private async followRedirectsManually(urlStr: string): Promise<string> {
        try {
            // In Node fetch follows redirects by default generally, but we can double check
            const res = await fetch(urlStr, {
                method: 'HEAD',
                redirect: 'follow',
                signal: AbortSignal.timeout(5000)
            });
            return res.url;
        } catch {
            return urlStr;
        }
    }

    private async resolveShortLink(urlStr: string): Promise<string> {
        // Just resolve via fetch follow
        return this.followRedirectsManually(urlStr);
    }

    private isLikelyShortLink(urlStr: string): boolean {
        try {
            const u = new URL(urlStr);
            const host = u.hostname.toLowerCase().replace("www.", "");
            if (this.knownShortenerHosts.has(host)) return true;
            if (this.knownAgentOrMarketplaceHosts.some(h => host.endsWith(h))) return false;
            const path = u.pathname.replace("/", "");
            // Short path, no query
            if (path.length > 0 && path.length <= 8 && !u.search) return true;
            return false;
        } catch {
            return false;
        }
    }

    private handleSpaHash(urlStr: string): string {
        // Basic SPA hash handling if URL is embedded in fragment
        try {
            const u = new URL(urlStr);
            if (u.hash && u.hash.includes("?")) {
                const query = u.hash.split("?")[1];
                const params = new URLSearchParams(query);
                if (params.get("url")) return decodeURIComponent(params.get("url")!);
            }
        } catch { }
        return urlStr;
    }

    private isRegistrationOrNonProductLink(urlStr: string): boolean {
        try {
            const u = new URL(urlStr);
            const path = u.pathname.toLowerCase();
            if (path.includes("/register") || path.includes("/login")) return true;
            if (u.hostname.includes("hoobuy") && u.searchParams.has("inviteCode") && !path.includes("/product")) return true;
            return false;
        } catch { return false; }
    }

    // String / Regex

    private isValidUrl(s: string): boolean {
        try {
            new URL(s);
            return true;
        } catch { return false; }
    }

    private multiDecode(s: string): string {
        let prev = s;
        for (let i = 0; i < 3; i++) {
            try {
                const next = decodeURIComponent(prev);
                if (next === prev) break;
                prev = next;
            } catch { break; }
        }
        return prev;
    }

    private extractFirstUrlFromString(text: string): string | null {
        if (!text) return null;
        const decoded = this.multiDecode(text);
        const match = decoded.match(/https?:\/\/[^\s"'<>]+/i);
        return match ? match[0] : null;
    }

    private unwrapInnerUrlAnywhere(text: string): string | null {
        // simplistic port
        if (!text) return null;
        const decoded = this.multiDecode(text);
        const m = decoded.match(/[?&](?:url|link|u|productLink)=([^&#\s]+)/i);
        if (m) {
            let candidate = this.multiDecode(m[1]);
            if (this.isValidUrl(candidate)) return candidate;
        }
        return null;
    }

    private tryUnwrapCommonParams(workingUrl: string, probeCandidates: string[]): [string, boolean] {
        try {
            const u = new URL(workingUrl);
            const params = u.searchParams;
            for (const k of this.urlParamKeys) {
                if (params.has(k)) {
                    const inner = this.multiDecode(params.get(k)!);
                    if (this.isValidUrl(inner)) {
                        probeCandidates.push(workingUrl);
                        return [inner, true];
                    }
                }
            }
        } catch { }
        return [workingUrl, false];
    }

    private extractPlatformAndIdFromText(text: string): { productId: string, marketplace: string } {
        const decoded = this.multiDecode(text || "");
        let m = decoded.match(/offer\/(\d+)\.html/);
        if (m) return { productId: m[1], marketplace: "1688" };

        m = decoded.match(/(?:itemID|itemId)=(\d{6,})/);
        if (m) return { productId: m[1], marketplace: "weidian" };

        m = decoded.match(/[?&]id=(\d{6,})/);
        if (m) return { productId: m[1], marketplace: "taobao" };

        return { productId: "", marketplace: "" };
    }
}
