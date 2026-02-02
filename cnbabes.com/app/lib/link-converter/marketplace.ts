
export function buildTaobaoUrl(id: string): string {
    return `https://item.taobao.com/item.htm?id=${id}`;
}

export function buildWeidianUrl(id: string): string {
    return `https://weidian.com/item.html?itemID=${id}`;
}

export function build1688Url(id: string): string {
    return `https://detail.1688.com/offer/${id}.html`;
}
