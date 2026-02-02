from __future__ import annotations

import re
from typing import Dict, List, Optional, Tuple
from urllib.parse import parse_qs, urlencode, urlparse

import httpx

from app.marketplace import (
    build_1688_url,
    build_marketplace_url,
    build_taobao_url,
    build_weidian_url,
)

Marketplace = str
ItemId = str

# Default affiliate/invite codes per agent (ported from link_converter.ts)
DEFAULT_AFFCODES: Dict[str, str] = {
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
}


class LinkConverter:
    """
    Python port of link_converter.ts

    Core responsibilities:
    - convert_link: unwrap/resolve/normalize links to raw marketplace URLs
    - resolve_marketplace_and_id: accept marketplace hints + URLs/IDs
    - build_marketplace_link / build_agent_link / build_all_agent_links
    """

    known_shortener_hosts = {
        "ikako.vip",
        "sl.kakobuy.com",
        "k.youshop10.com",
        "youshop10.com",
        "hipobuy.cn",
        "link.acbuy.com",
        "oopbuy.cc",
        "itaobuy.allapp.link",
        "hoobuy.cc",
        "s.spblk.com",
        "e.tb.cn",
        "m.tb.cn",
        "l.ponybuy.com",
        "bit.ly",
        "tinyurl.com",
        "t.cn",
        "goo.gl",
        "is.gd",
        "v.gd",
        "ow.ly",
        "rebrand.ly",
    }

    known_agent_or_marketplace_hosts = [
        "taobao.com",
        "tmall.com",
        "1688.com",
        "weidian.com",
        "yupoo.com",
        "kakobuy.com",
        "kakobuy.co",
        "kabobuy.com",
        "hipobuy.com",
        "cnfans.com",
        "acbuy.com",
        "mulebuy.com",
        "oopbuy.com",
        "lovegobuy.com",
        "itaobuy.com",
        "cssbuy.com",
        "usfans.com",
        "superbuy.com",
        "basetao.com",
        "eastmallbuy.com",
        "pingubuy.com",
        "hoobuy.com",
        "orientdig.com",
        "ootdbuy.com",
        "sugargoo.com",
        "joyagoo.com",
        "pantherbuy.com",
        "ponybuy.com",
        "bbdbuy.com",
        "gonest.cn",
        "loongbuy.com",
        "blikbuy.com",
        "allchinabuy.com",
        "doppel.fit",
        "repsheet.net",
    ]

    _url_param_keys = ("url", "link", "u", "productLink")

    # ------------------------------------------------------------------ #
    # Public API                                                         #
    # ------------------------------------------------------------------ #
    def convert_link(
        self, encoded_url: str, preferred_agent: Optional[str] = None
    ) -> Dict[str, object]:
        """
        Best-effort conversion of an arbitrary URL/text to a raw marketplace link.
        Returns a ConvertedLink-like dict.
        """
        try:
            sanitized_input = (encoded_url or "").strip()
            if sanitized_input.startswith("@"):
                sanitized_input = re.sub(r"^@+", "", sanitized_input).strip()
            sanitized_input = self.multi_decode(sanitized_input)

            if not self.is_valid_url(sanitized_input):
                extracted = self.extract_first_url_from_string(sanitized_input)
                if extracted:
                    sanitized_input = extracted

            if not self.is_valid_url(sanitized_input):
                return self._result_invalid("Invalid URL format")

            working_url = sanitized_input
            probe_candidates: List[str] = [working_url]

            # 1) unwrap query params
            working_url, extracted_inner = self._try_unwrap_common_params(
                working_url, probe_candidates
            )
            if not extracted_inner:
                inner = self.unwrap_inner_url_anywhere(working_url)
                if inner:
                    probe_candidates.append(working_url)
                    working_url = inner

            # 2) resolve short links
            if self.is_likely_short_link(working_url):
                resolved = self.resolve_short_link_via_api(working_url)
                if self.is_valid_url(resolved):
                    probe_candidates.append(resolved)
                    working_url = resolved

            # 2b) handle SPA hash params
            working_url = self._handle_spa_hash(working_url)

            agent_info = self.detect_agent(sanitized_input)

            if self.is_registration_or_non_product_link(working_url):
                return self._result_invalid(
                    "Not a product link (registration/invite)",
                    agent_info=agent_info,
                )

            probe_candidates.append(working_url)
            working_url = self.normalize_agent_url_to_raw(working_url)

            product_id, marketplace = self.extract_id_and_marketplace(working_url)
            if not product_id or not marketplace:
                # fallback: heuristic
                fallback = self.extract_platform_and_id_from_text(working_url)
                if fallback["productId"] and fallback["marketplace"]:
                    return self._result_valid(
                        raw=self.build_marketplace_link(
                            fallback["marketplace"], fallback["productId"]
                        ),
                        marketplace=fallback["marketplace"],
                        product_id=fallback["productId"],
                        agent_info=agent_info,
                        preferred_agent=preferred_agent,
                    )

                # probe HTML
                for candidate in probe_candidates:
                    probed = self.probe_for_raw_url_via_http(candidate)
                    if self.is_valid_url(probed):
                        normalized = self.normalize_agent_url_to_raw(probed)
                        pid2, mp2 = self.extract_id_and_marketplace(normalized)
                        if pid2 and mp2:
                            return self._result_valid(
                                raw=self.build_marketplace_link(mp2, pid2),
                                marketplace=mp2,
                                product_id=pid2,
                                agent_info=agent_info,
                                preferred_agent=preferred_agent,
                            )

                final_hop = self.follow_redirects_manually(sanitized_input)
                if self.is_valid_url(final_hop):
                    info = self.detect_agent(final_hop)
                    return {
                        "rawLink": final_hop,
                        "marketplace": "",
                        "productId": "",
                        "isValid": True,
                        "isAgent": info["isAgent"],
                        "agentName": info.get("agentName"),
                        "originalDomain": info.get("originalDomain"),
                    }

                return self._result_invalid(
                    "Could not extract product ID or marketplace",
                    agent_info=agent_info,
                )

            return self._result_valid(
                raw=working_url,
                marketplace=marketplace,
                product_id=product_id,
                agent_info=agent_info,
                preferred_agent=preferred_agent,
            )
        except Exception as exc:  # pragma: no cover - defensive
            return {
                "rawLink": "",
                "marketplace": "",
                "productId": "",
                "isValid": False,
                "error": str(exc),
                "isAgent": False,
                "originalDomain": "error",
            }

    def resolve_marketplace_and_id(
        self, marketplace_hint: str, item_or_url: str
    ) -> Tuple[str, str, str]:
        """Resolve marketplace + id and return (marketplace, product_id, raw_url)."""
        candidate = (item_or_url or "").strip()
        marketplace = (marketplace_hint or "").lower().strip()

        if candidate.startswith(("http://", "https://")):
            raw = self.normalize_agent_url_to_raw(candidate)
            mp, pid = self.extract_marketplace_and_id(raw)
            if mp and pid:
                return mp, self.sanitize_product_id(pid), self.build_marketplace_link(
                    mp, pid
                )
            if marketplace:
                pid = self.sanitize_product_id(candidate.rsplit("/", 1)[-1])
                return marketplace, pid, self.build_marketplace_link(marketplace, pid)
            raise ValueError("Unable to resolve marketplace and id from URL")

        if marketplace:
            pid = self.sanitize_product_id(candidate)
            return marketplace, pid, self.build_marketplace_link(marketplace, pid)

        extracted = self.extract_first_url_from_string(candidate)
        if extracted:
            raw = self.normalize_agent_url_to_raw(extracted)
            mp, pid = self.extract_marketplace_and_id(raw)
            if mp and pid:
                return mp, self.sanitize_product_id(pid), self.build_marketplace_link(
                    mp, pid
                )

        raise ValueError("Unable to resolve marketplace and id from input")

    # ------------------------------------------------------------------ #
    # Helpers used by main.py                                            #
    # ------------------------------------------------------------------ #
    def build_marketplace_link(self, platform: str, product_id: str) -> str:
        platform_lower = (platform or "").lower()
        pid = self.sanitize_product_id(product_id)
        if platform_lower in ("taobao", "tmall"):
            return build_taobao_url(pid)
        if platform_lower == "weidian":
            return build_weidian_url(pid)
        if platform_lower in ("1688", "ali_1688", "alibaba", "ali1688"):
            return build_1688_url(pid)
        return build_taobao_url(pid)

    def build_agent_link(
        self, agent: str, platform: str, product_id: str, raw_url: Optional[str] = None
    ) -> Optional[str]:
        agent_lower = (agent or "").lower()
        pid = self.sanitize_product_id(product_id)
        mp = (platform or "").lower()
        raw = raw_url or self.build_marketplace_link(mp, pid)
        aff = DEFAULT_AFFCODES.get(agent_lower, "")

        def enc(val: str) -> str:
            return urlencode({"": val})[1:] if val else ""

        if agent_lower == "kakobuy":
            aff_param = f"&affcode={enc(aff)}" if aff else ""
            return f"https://www.kakobuy.com/item/details?url={enc(raw)}{aff_param}"
        if agent_lower == "hipobuy":
            code = "0" if mp == "1688" else "1" if mp == "taobao" else "weidian"
            suffix = f"?inviteCode={enc(aff)}" if aff else ""
            return f"https://hipobuy.com/product/{code}/{pid}{suffix}"
        if agent_lower == "cnfans":
            plat = "ALI_1688" if mp == "1688" else "WEIDIAN" if mp == "weidian" else "TAOBAO"
            ref = f"&ref={enc(aff)}" if aff else ""
            return f"https://cnfans.com/product?id={pid}&platform={plat}{ref}"
        if agent_lower == "acbuy":
            src = "AL" if mp == "1688" else "WD" if mp == "weidian" else "TB"
            ref = f"&u={enc(aff)}" if aff else ""
            return f"https://www.acbuy.com/product?id={pid}&source={src}{ref}"
        if agent_lower == "mulebuy":
            plat = "ALI_1688" if mp == "1688" else "WEIDIAN" if mp == "weidian" else "TAOBAO"
            ref = f"&ref={enc(aff)}" if aff else ""
            return f"https://mulebuy.com/product?id={pid}&platform={plat}{ref}"
        if agent_lower == "oopbuy":
            code = "0" if mp == "1688" else "1" if mp == "taobao" else "weidian"
            ref = f"?inviteCode={enc(aff)}" if aff else ""
            return f"https://oopbuy.com/product/{code}/{pid}{ref}"
        if agent_lower == "lovegobuy":
            shop_type = "ali_1688" if mp == "1688" else mp
            ref = f"&invite_code={enc(aff)}" if aff else ""
            return f"https://lovegobuy.com/product?id={pid}&shop_type={shop_type}{ref}"
        if agent_lower == "itaobuy":
            ref = f"&inviteCode={enc(aff)}" if aff else ""
            return f"https://www.itaobuy.com/product-detail?url={enc(raw)}{ref}"
        if agent_lower == "cssbuy":
            if mp == "1688":
                return f"https://cssbuy.com/item-1688-{pid}.html"
            if mp == "weidian":
                return f"https://cssbuy.com/item-micro-{pid}.html"
            return f"https://cssbuy.com/item-{pid}.html"
        if agent_lower == "usfans":
            code = "1" if mp == "1688" else "2" if mp == "taobao" else "3"
            ref = f"?ref={enc(aff)}" if aff else ""
            return f"https://usfans.com/product/{code}/{pid}{ref}"
        if agent_lower == "superbuy":
            plat = "ALIBABA" if mp == "1688" else "WD" if mp == "weidian" else "TMALL"
            ref = f"&partnercode={enc(aff)}" if aff else ""
            return f"https://www.superbuy.com/en/page/buy/?platform={plat}&id={pid}{ref}"
        if agent_lower == "basetao":
            return f"https://www.basetao.com/best-taobao-agent-service/products/agent/{mp}/{pid}.html"
        if agent_lower == "eastmallbuy":
            if mp == "1688":
                return f"https://eastmallbuy.com/item?tp=1688&tid={pid}&inviter={enc(aff or '')}"
            if mp == "weidian":
                return f"https://eastmallbuy.com/item?tp=micro&tid={pid}&inviter={enc(aff or '')}"
            aff_query = f"&inviter={enc(aff)}" if aff else ""
            return f"https://eastmallbuy.com/index/item/index.html?tp=taobao&url={enc(raw)}{aff_query}"
        if agent_lower == "pingubuy":
            if mp == "1688":
                return f"https://pingubuy.com/item-1688-{pid}.html"
            if mp == "weidian":
                return f"https://pingubuy.com/item-micro-{pid}.html"
            aff_query = f"?promotionCode={enc(aff)}" if aff else ""
            return f"https://pingubuy.com/item-{pid}.html{aff_query}"
        if agent_lower == "hoobuy":
            code = "0" if mp == "1688" else "1" if mp == "taobao" else "2"
            aff_query = f"?inviteCode={enc(aff)}" if aff else ""
            return f"https://hoobuy.com/product/{code}/{pid}{aff_query}"
        if agent_lower == "orientdig":
            plat = "ALI_1688" if mp == "1688" else "WEIDIAN" if mp == "weidian" else "TAOBAO"
            ref = f"&ref={enc(aff)}" if aff else ""
            return f"https://orientdig.com/product?id={pid}&platform={plat}{ref}"
        if agent_lower == "ootdbuy":
            ch = "TAOBAO" if mp == "taobao" else mp
            return f"https://www.ootdbuy.com/goods/details?id={pid}&channel={ch}"
        if agent_lower == "sugargoo":
            aff_query = f"&memberId={enc(aff)}" if aff else ""
            return f"https://www.sugargoo.com/productDetail?productLink={enc(raw)}{aff_query}"
        if agent_lower == "joyagoo":
            plat = "ALI_1688" if mp == "1688" else "WEIDIAN" if mp == "weidian" else "TAOBAO"
            ref = f"&ref={enc(aff)}" if aff else ""
            return f"https://joyagoo.com/product?id={pid}&platform={plat}{ref}"
        if agent_lower == "pantherbuy":
            if mp == "1688":
                return f"https://pantherbuy.com/item?tp=1688&tid={pid}"
            if mp == "weidian":
                return f"https://pantherbuy.com/item?tp=micro&tid={pid}"
            aff_query = f"&inviteid={enc(aff)}" if aff else ""
            return f"https://pantherbuy.com/index/item/index.html?tp=taobao&url={enc(raw)}{aff_query}"
        if agent_lower == "ponybuy":
            pcode = "2" if mp == "1688" else "1" if mp == "taobao" else "3"
            aff_query = f"?inviteCode={enc(aff)}" if aff else ""
            return f"https://www.ponybuy.com/products/{pcode}/{pid}{aff_query}"
        if agent_lower == "bbdbuy":
            if mp == "1688":
                return f"https://bbdbuy.com/index/item1688/index.html?tp=1688&tid={pid}"
            if mp == "weidian":
                return f"https://bbdbuy.com/index/item/index.html?tp=micro&tid={pid}"
            return f"https://bbdbuy.com/index/item/index.html?tp=taobao&tid={pid}"
        if agent_lower == "gonestbuy":
            if mp == "1688":
                return f"https://buy.gonest.cn/en/product/{pid}?platform=1688&type=0"
            if mp == "taobao":
                return f"https://buy.gonest.cn/en/product/{pid}?platform=taobao&type=1"
            return f"https://buy.gonest.cn/en/product/0?platform=micro&type=2&keyword={enc(raw)}"
        if agent_lower == "loongbuy":
            if mp in ("1688", "weidian", "taobao"):
                return f"https://loongbuy.com/product-details?{mp}={pid}"
            return f"https://loongbuy.com/product-details?url={enc(raw)}"

        return None

    def build_all_agent_links(
        self, marketplace: str, product_id: str, raw_url: Optional[str] = None
    ) -> Dict[str, str]:
        links: Dict[str, str] = {}
        for agent in DEFAULT_AFFCODES.keys():
            link = self.build_agent_link(agent, marketplace, product_id, raw_url)
            if link:
                links[agent] = link
        return links

    # ------------------------------------------------------------------ #
    # Internal helpers                                                   #
    # ------------------------------------------------------------------ #
    def _result_invalid(
        self, msg: str, agent_info: Optional[Dict[str, object]] = None
    ) -> Dict[str, object]:
        agent_info = agent_info or {"isAgent": False, "originalDomain": "invalid-url"}
        return {
            "rawLink": "",
            "marketplace": "",
            "productId": "",
            "isValid": False,
            "error": msg,
            "isAgent": agent_info.get("isAgent", False),
            "agentName": agent_info.get("agentName"),
            "originalDomain": agent_info.get("originalDomain", "invalid-url"),
        }

    def _result_valid(
        self,
        raw: str,
        marketplace: str,
        product_id: str,
        agent_info: Dict[str, object],
        preferred_agent: Optional[str] = None,
    ) -> Dict[str, object]:
        agent = (preferred_agent or "").lower()
        agent_link = (
            self.build_agent_link(agent, marketplace, product_id, raw)
            if agent
            else None
        )
        return {
            "rawLink": raw,
            "marketplace": marketplace,
            "productId": product_id,
            "isValid": True,
            "agentLink": agent_link,
            "isAgent": agent_info.get("isAgent", False),
            "agentName": agent_info.get("agentName"),
            "originalDomain": agent_info.get("originalDomain"),
        }

    # Agent detection
    def detect_agent(self, original_url: str) -> Dict[str, object]:
        try:
            url_obj = urlparse(original_url)
            domain = url_obj.netloc.lower().replace("www.", "")
            agent_map: Dict[str, str] = {
                "cnfans.com": "CNFans",
                "pandabuy.com": "PandaBuy",
                "wegobuy.com": "WegoBuy",
                "superbuy.com": "SuperBuy",
                "cssbuy.com": "CSSBuy",
                "sugargoo.com": "SugarGoo",
                "acbuy.com": "ACBuy",
                "kakobuy.com": "KakoBuy",
                "oopbuy.com": "OopBuy",
                "hipobuy.com": "HipoBuy",
                "mulebuy.com": "MuleBuy",
                "lovegobuy.com": "LoveGoBuy",
                "itaobuy.com": "ItaoBuy",
                "usfans.com": "USFans",
                "basetao.com": "BaseTao",
                "eastmallbuy.com": "EastMallBuy",
                "pingubuy.com": "PinguBuy",
                "hoobuy.com": "HooBuy",
                "orientdig.com": "OrientDig",
                "ootdbuy.com": "OotdBuy",
                "joyagoo.com": "JoyaGoo",
                "pantherbuy.com": "PantherBuy",
                "ponybuy.com": "PonyBuy",
                "bbdbuy.com": "BBDBuy",
                "gonest.cn": "GonestBuy",
                "loongbuy.com": "LoongBuy",
            }

            for agent_domain, agent_name in agent_map.items():
                if domain == agent_domain or domain.endswith(f".{agent_domain}"):
                    return {
                        "isAgent": True,
                        "agentName": agent_name,
                        "originalDomain": domain,
                    }

            for agent_domain, agent_name in agent_map.items():
                if agent_domain.split(".")[0] in domain:
                    return {
                        "isAgent": True,
                        "agentName": agent_name,
                        "originalDomain": domain,
                    }

            return {"isAgent": False, "originalDomain": domain}
        except Exception:
            return {"isAgent": False, "originalDomain": "invalid-url"}

    # ID + marketplace extraction
    def extract_id_and_marketplace(self, raw_url: str) -> Tuple[str, str]:
        try:
            url = urlparse(raw_url)
            hostname = url.netloc.lower().replace("www.", "")

            if "taobao.com" in hostname or "tmall.com" in hostname:
                params = parse_qs(url.query)
                return params.get("id", [""])[0], "taobao"

            if "weidian.com" in hostname:
                params = parse_qs(url.query)
                id_ = params.get("itemID", [""])[0] or params.get("itemId", [""])[0]
                return id_, "weidian"

            if "1688.com" in hostname:
                m = re.search(r"/offer/(\d+)", url.path)
                if m:
                    return m.group(1), "1688"

            return "", ""
        except Exception:
            return "", ""

    # Network helpers
    def probe_for_raw_url_via_http(self, url_str: str) -> str:
        try:
            resp = httpx.get(
                url_str,
                follow_redirects=True,
                timeout=6.0,
                headers={"User-Agent": "python-link-converter"},
            )
            final_url = str(resp.url) if resp.url else ""
            if final_url and self.is_valid_url(final_url):
                host = urlparse(final_url).netloc.lower()
                if re.search(r"(taobao|tmall|weidian|1688)\.com$", host) or "kakobuy" in host or "cnfans" in host:
                    return final_url

            if isinstance(resp.text, str):
                html = resp.text
                enc_match = re.search(
                    r"https%3A%2F%2F(?:weidian\.com%2Fitem\.html%3FitemID%3D\d+|item\.taobao\.com%2Fitem\.htm%3Fid%3D\d+|detail\.1688\.com%2Foffer%2F\d+\.html)",
                    html,
                    re.IGNORECASE,
                )
                if enc_match:
                    decoded = self.safe_decode(enc_match.group(0))
                    if self.is_valid_url(decoded):
                        return decoded

                plain_match = re.search(
                    r"https?://(?:weidian\.com/item\.html\?itemID=\d+|item\.taobao\.com/item\.htm\?id=\d+|detail\.1688\.com/offer/\d+\.html)",
                    html,
                    re.IGNORECASE,
                )
                if plain_match and self.is_valid_url(plain_match.group(0)):
                    return plain_match.group(0)

                id_in_html = self.extract_platform_and_id_from_text(html)
                if id_in_html["productId"] and id_in_html["marketplace"]:
                    return self.build_marketplace_link(
                        id_in_html["marketplace"], id_in_html["productId"]
                    )

            return ""
        except Exception:
            return ""

    def is_likely_short_link(self, url_str: str) -> bool:
        try:
            u = urlparse(url_str)
            host = u.netloc.lower().replace("www.", "")
            if host in self.known_shortener_hosts:
                return True
            if any(host.endswith(h) for h in self.known_agent_or_marketplace_hosts):
                return False
            path_compact_length = len(u.path.replace("/", ""))
            has_query = bool(u.query)
            return path_compact_length > 0 and path_compact_length <= 8 and not has_query
        except Exception:
            return False

    def resolve_short_link_via_api(self, url_str: str) -> str:
        # Best-effort; falls back to manual redirect follow
        try:
            api_url = f"https://api.redirect-checker.net/?url={url_str}"
            resp = httpx.get(api_url, timeout=6.0)
            body = resp.json()
            if not body or body.get("error") or not isinstance(body.get("data"), list):
                return url_str
            final_url: Optional[str] = None
            for step in body["data"]:
                redirect_url = (
                    step.get("response", {})
                    .get("info", {})
                    .get("redirect_url")
                )
                http_code = (
                    step.get("response", {})
                    .get("info", {})
                    .get("http_code")
                )
                current_url = (
                    step.get("response", {}).get("info", {}).get("url")
                    or step.get("request", {}).get("info", {}).get("url")
                )
                if redirect_url:
                    final_url = redirect_url
                elif http_code and 200 <= http_code < 400:
                    final_url = current_url or final_url
            return final_url or url_str
        except Exception:
            try:
                manual = self.follow_redirects_manually(url_str)
                if self.is_valid_url(manual) and manual != url_str:
                    return manual
            except Exception:
                pass
            try:
                resp = httpx.get(
                    url_str,
                    follow_redirects=True,
                    timeout=6.0,
                    headers={"User-Agent": "python-link-converter"},
                )
                possible = str(resp.url) if resp.url else ""
                if possible and self.is_valid_url(possible):
                    return possible
                if isinstance(resp.text, str):
                    m = re.search(
                        r'(?:http-equiv="refresh" content="\d+;\s*url=|href=")(https?://[^"\' >\s]+)',
                        resp.text,
                        re.IGNORECASE,
                    )
                    if m and self.is_valid_url(m.group(1)):
                        return m.group(1)
                return url_str
            except Exception:
                return url_str

    def follow_redirects_manually(self, start_url: str, max_hops: int = 5) -> str:
        current = start_url
        for _ in range(max_hops):
            resp = httpx.get(
                current,
                follow_redirects=False,
                timeout=6.0,
                headers={"User-Agent": "python-link-converter"},
            )
            status = resp.status_code
            if 300 <= status < 400:
                location = resp.headers.get("location")
                if not location:
                    return current
                try:
                    absolute = httpx.URL(location, base=current).human_repr()
                    current = absolute
                    continue
                except Exception:
                    return current
            return current
        return current

    # Normalization
    def normalize_agent_url_to_raw(self, url_str: str) -> str:
        try:
            u = urlparse(url_str)
            host = u.netloc.lower().replace("www.", "")
            hash_query = self.parse_hash_query(u)

            if self.is_registration_or_non_product_link(url_str):
                return url_str

            if host.endswith("picks.ly"):
                m = re.search(r"/item/([A-Z_]+)/(\d+)", u.path)
                if m:
                    plat_raw, pid = m.group(1), m.group(2)
                    platform = (
                        "1688"
                        if plat_raw.upper() == "1688"
                        else "weidian"
                        if plat_raw.upper() == "WEIDIAN"
                        else "taobao"
                    )
                    return self.build_marketplace_link(platform, pid)

            # Broad agent normalization (subset of TS logic focusing on main patterns)
            if host.endswith(("kakobuy.com", "kakobuy.co", "kabobuy.com")):
                inner = parse_qs(u.query).get("url", [None])[0]
                if inner:
                    return self.safe_decode(inner)

            if host.endswith(("hipobuy.com", "oopbuy.com")):
                parts = [p for p in u.path.split("/") if p]
                if len(parts) >= 3 and parts[0] == "product":
                    channel = parts[1].lower()
                    pid = parts[2]
                    platform = (
                        "1688"
                        if channel in ("0", "ali", "ali_1688", "1688")
                        else "taobao"
                        if channel in ("1", "tb", "tmall")
                        else "weidian"
                    )
                    return self.build_marketplace_link(platform, pid)

            if host.endswith("superbuy.com"):
                qs = parse_qs(u.query)
                inner = qs.get("url", [None])[0] or (hash_query.get("url") if hash_query else None)
                if inner:
                    return self.safe_decode(inner)
                platform_raw = qs.get("platform", [None])[0] or (hash_query.get("platform") if hash_query else "")
                pid = qs.get("id", [None])[0] or (hash_query.get("id") if hash_query else "")
                plat = (platform_raw or "").upper()
                platform = (
                    "1688"
                    if plat == "ALIBABA"
                    else "weidian"
                    if plat == "WD"
                    else "taobao"
                    if plat in ("TMALL", "TAOBAO")
                    else ""
                )
                if platform and pid:
                    return self.build_marketplace_link(platform, pid)

            if host.endswith("cssbuy.com"):
                m1688 = re.search(r"item-1688-(\d+)\.html", u.path)
                mw = re.search(r"item-micro-(\d+)\.html", u.path)
                mtb = re.search(r"item-(\d+)\.html", u.path)
                if m1688:
                    return self.build_marketplace_link("1688", m1688.group(1))
                if mw:
                    return self.build_marketplace_link("weidian", mw.group(1))
                if mtb:
                    return self.build_marketplace_link("taobao", mtb.group(1))

            if host.endswith("pingubuy.com"):
                m1688 = re.search(r"item-1688-(\d+)\.html", u.path)
                mw = re.search(r"item-micro-(\d+)\.html", u.path)
                mtb = re.search(r"item-(\d+)\.html", u.path)
                if m1688:
                    return self.build_marketplace_link("1688", m1688.group(1))
                if mw:
                    return self.build_marketplace_link("weidian", mw.group(1))
                if mtb:
                    return self.build_marketplace_link("taobao", mtb.group(1))

            if host.endswith(("bbdbuy.com", "pantherbuy.com")):
                qs = parse_qs(u.query)
                inner = qs.get("url", [None])[0] or (hash_query.get("url") if hash_query else None)
                if inner:
                    return self.safe_decode(inner)
                tid = qs.get("tid", [None])[0] or (hash_query.get("tid") if hash_query else "")
                tp_raw = (qs.get("tp", [None])[0] or (hash_query.get("tp") if hash_query else "") or "").lower()
                platform = (
                    "1688"
                    if "1688" in tp_raw
                    else "weidian"
                    if "micro" in tp_raw
                    else "taobao"
                    if "taobao" in tp_raw
                    else ""
                )
                if tid and platform:
                    return self.build_marketplace_link(platform, tid)

            if host.endswith("eastmallbuy.com"):
                qs = parse_qs(u.query)
                inner = qs.get("url", [None])[0]
                if inner:
                    return self.safe_decode(inner)
                href = url_str
                m_any = re.search(r"(?:1688ID|itemID)=(\d+)", href)
                if m_any:
                    platform = "1688" if "1688ID" in href else "weidian"
                    return self.build_marketplace_link(platform, m_any.group(1))
                tid = qs.get("tid", [""])[0]
                tp = (qs.get("tp", [""])[0]).lower()
                platform = (
                    "1688"
                    if "1688" in tp
                    else "weidian"
                    if "micro" in tp
                    else "taobao"
                    if "taobao" in tp
                    else ""
                )
                if tid and platform:
                    return self.build_marketplace_link(platform, tid)

            if host.endswith("loongbuy.com"):
                qs = parse_qs(u.query)
                inner = qs.get("url", [None])[0]
                if inner:
                    return self.safe_decode(inner)
                id1688 = qs.get("1688", [None])[0]
                idtb = qs.get("taobao", [None])[0]
                idwd = qs.get("weidian", [None])[0]
                if id1688:
                    return self.build_marketplace_link("1688", id1688)
                if idtb:
                    return self.build_marketplace_link("taobao", idtb)
                if idwd:
                    return self.build_marketplace_link("weidian", idwd)

            return url_str
        except Exception:
            return url_str

    # SPA hash parse
    def parse_hash_query(self, u) -> Optional[Dict[str, str]]:
        try:
            hash_part = u.fragment or u.fragment
            if not hash_part:
                return None
            q_index = hash_part.find("?")
            if q_index == -1:
                return None
            query = hash_part[q_index + 1 :]
            parsed = parse_qs(query)
            return {k: v[0] for k, v in parsed.items() if v}
        except Exception:
            return None

    def _handle_spa_hash(self, working_url: str) -> str:
        try:
            mobile_url = urlparse(working_url)
            hash_params = self.parse_hash_query(mobile_url)
            host = mobile_url.netloc.lower().replace("www.", "")
            if hash_params:
                inner_from_hash = hash_params.get("url")
                if inner_from_hash and self.is_valid_url(self.safe_decode(inner_from_hash)):
                    return self.safe_decode(inner_from_hash)
                if host.endswith("superbuy.com"):
                    platform_raw = hash_params.get("platform") or ""
                    pid = hash_params.get("id") or ""
                    platform_map = {
                        "ALIBABA": "1688",
                        "WD": "weidian",
                        "TMALL": "taobao",
                        "TAOBAO": "taobao",
                    }
                    platform = platform_map.get(platform_raw.upper(), "")
                    if platform and pid:
                        return self.build_marketplace_link(platform, pid)
                if host.endswith("pantherbuy.com") or host.endswith("bbdbuy.com"):
                    tid = hash_params.get("tid") or ""
                    tp = (hash_params.get("tp") or "").lower()
                    platform = (
                        "1688"
                        if "1688" in tp
                        else "weidian"
                        if "micro" in tp
                        else "taobao"
                        if "taobao" in tp
                        else ""
                    )
                    if tid and platform:
                        return self.build_marketplace_link(platform, tid)
        except Exception:
            pass
        return working_url

    # Registration / non-product detection
    def is_registration_or_non_product_link(self, url_str: str) -> bool:
        try:
            u = urlparse(url_str)
            host = u.netloc.lower().replace("www.", "")
            path = u.path.lower()
            if "/register" in path or "/login" in path:
                return True
            if host == "ikako.vip" and path.startswith("/r/"):
                return True
            if host == "hoobuy.com" and "inviteCode" in u.query and "/product" not in path:
                return True
            if host == "ponybuy.com" and "inviteCode" in u.query and "/products" not in path:
                return True
            if host == "basetao.com" and u.query and "/products/agent" not in path:
                return True
            if host == "sugargoo.com" and "/mobile" in path:
                return True
            return False
        except Exception:
            return False

    # Decoders / parsers
    def safe_decode(self, s: str) -> str:
        try:
            return httpx.URL(s).raw_path.decode()
        except Exception:
            try:
                return httpx.URL(f"http://x{s}").raw_path.decode()[1:]
            except Exception:
                try:
                    return httpx.URL(s).human_repr()
                except Exception:
                    try:
                        return httpx.URL("http://dummy?" + s).query.decode()
                    except Exception:
                        try:
                            return s.encode().decode("utf-8")
                        except Exception:
                            return s

    def multi_decode(self, s: str) -> str:
        prev = s
        for _ in range(3):
            try:
                next_val = httpx.URL(prev).decode()
            except Exception:
                next_val = prev
            if next_val == prev:
                break
            prev = next_val
        return prev

    def extract_first_url_from_string(self, text: str) -> Optional[str]:
        if not text:
            return None
        decoded = self.multi_decode(text)
        idx = max(decoded.rfind("https://"), decoded.rfind("http://"))
        if idx != -1:
            candidate = re.split(r"[\s\]\)<>'\"]+", decoded[idx:])[0]
            trimmed = re.sub(r"[.,;:!?)+\]]+$", "", candidate)
            if self.is_valid_url(trimmed):
                return trimmed
        m = re.search(r"https?://[^\s\"')<>]+", decoded, re.IGNORECASE)
        return m.group(0) if m and self.is_valid_url(m.group(0)) else None

    def unwrap_inner_url_anywhere(self, text: str) -> Optional[str]:
        if not text:
            return None
        decoded = self.multi_decode(text)
        re_obj = re.compile(r"(?:^|[?&#])(?:url|link|u|productLink)=([^&#\s]+)", re.IGNORECASE)
        for match in re_obj.finditer(decoded):
            raw = match.group(1)
            candidate = self.multi_decode(raw)
            if not self.is_valid_url(candidate):
                inner = self.extract_first_url_from_string(candidate)
                if inner:
                    candidate = inner
            if self.is_valid_url(candidate):
                return candidate
        return None

    def extract_platform_and_id_from_text(self, text: str) -> Dict[str, str]:
        decoded = self.multi_decode(text or "")
        m = re.search(r"offer/(\d+)\.html", decoded)
        if m:
            return {"productId": m.group(1), "marketplace": "1688"}
        m = re.search(r"(?:itemID|itemId)=(\d{6,})", decoded)
        if m:
            return {"productId": m.group(1), "marketplace": "weidian"}
        m = re.search(r"[?&]id=(\d{6,})", decoded)
        if m:
            return {"productId": m.group(1), "marketplace": "taobao"}
        m = re.search(r"/item/(TAOBAO|TMALL|WEIDIAN|ALIBABA|1688)/(\d+)", decoded, re.IGNORECASE)
        if m:
            plat = m.group(1).upper()
            pid = m.group(2)
            marketplace = (
                "1688"
                if plat in ("ALIBABA", "1688")
                else "weidian"
                if plat == "WEIDIAN"
                else "taobao"
            )
            return {"productId": pid, "marketplace": marketplace}
        return {"productId": "", "marketplace": ""}

    def sanitize_product_id(self, product_id: str) -> str:
        if not product_id:
            return ""
        pid = product_id
        if "/" in pid:
            pid = pid.split("/")[0]
        if "?" in pid:
            pid = pid.split("?")[0]
        return re.sub(r"[^\w\-]", "", pid)

    def is_valid_url(self, url: str) -> bool:
        try:
            parsed = urlparse(url)
            return bool(parsed.scheme and parsed.netloc)
        except Exception:
            return False

    # Unwrap helper
    def _try_unwrap_common_params(
        self, working_url: str, probe_candidates: List[str]
    ) -> Tuple[str, bool]:
        extracted_inner = False
        try:
            u = urlparse(working_url)
            qs = parse_qs(u.query)
            for key in self._url_param_keys:
                if key in qs and qs[key]:
                    inner = qs[key][0]
                    decoded = self.multi_decode(inner)
                    if not self.is_valid_url(decoded):
                        inner_extracted = self.extract_first_url_from_string(decoded)
                        if inner_extracted:
                            decoded = inner_extracted
                    if self.is_valid_url(decoded):
                        probe_candidates.append(working_url)
                        return decoded, True
        except Exception:
            pass
        return working_url, extracted_inner


