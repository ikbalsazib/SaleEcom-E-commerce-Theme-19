export type OrderSource =
    | 'website'
    | 'facebook_page'
    | 'facebook_ads'
    | 'instagram'
    | 'tiktok'
    | 'tiktok_ads'
    | 'whatsapp'
    | 'phone_call'
    | 'affiliate'
    | 'pos'
    | 'other';

const SOURCE_KEY = 'order_source';

export function captureOrderSourceFromUrl(): OrderSource {
    if (typeof window === 'undefined') return 'website';
    const p = new URLSearchParams(window.location.search);

    const utm_source = (p.get('utm_source') || '').toLowerCase();
    const utm_medium = (p.get('utm_medium') || '').toLowerCase();
    const ref = (p.get('ref') || p.get('src') || '').toLowerCase();

    // priority: explicit ref/src
    if (ref === 'whatsapp') return 'whatsapp';
    if (ref === 'facebook_page') return 'facebook_page';
    if (ref === 'instagram') return 'instagram';
    if (ref === 'tiktok') return 'tiktok';

    // utm based
    if (utm_source === 'tiktok') return utm_medium === 'paid' ? 'tiktok_ads' : 'tiktok';
    if (utm_source === 'facebook' || utm_source === 'fb') return 'facebook_ads';
    if (utm_source === 'instagram') return 'instagram';

    return 'website';
}

export function saveOrderSource(source: OrderSource) {
    if (source !== 'website' && typeof localStorage !== 'undefined') {
        localStorage.setItem(SOURCE_KEY, source);
    }
}

export function getSavedOrderSource(): OrderSource {
    if (typeof localStorage !== 'undefined') {
        return (localStorage.getItem(SOURCE_KEY) as OrderSource) || 'website';
    }
    return 'website';
}
