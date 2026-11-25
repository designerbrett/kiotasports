// Content the practice edits in the Practice Lobby Hub, fetched once at build time.
// The Hub calls this site's Netlify deploy hook whenever that content changes.

export type HubContent = {
  domain: string;
  timezone: string;
  generatedOn: string;
  items: { kind: string; title: string; body: string | null; price: string | null; expiresOn: string | null }[];
  hours: { day: string; ranges: { opens: string; closes: string }[] }[];
  closures: { label: string; startsOn: string; endsOn: string; opens: string | null; closes: string | null; closed: boolean }[];
};

const HUB_URL = process.env.HUB_URL ?? 'https://app.practicelobby.com';

// HUB_DOMAIN overrides; otherwise Netlify's URL (the site's primary domain).
function siteDomain(): string | null {
  const explicit = process.env.HUB_DOMAIN;
  if (explicit) return explicit;
  try {
    return process.env.URL ? new URL(process.env.URL).hostname : null;
  } catch {
    return null;
  }
}

let cached: Promise<HubContent | null> | undefined;

export function getHubContent(): Promise<HubContent | null> {
  cached ??= load();
  return cached;
}

async function load(): Promise<HubContent | null> {
  const domain = siteDomain();
  if (!domain) return null;
  try {
    const res = await fetch(`${HUB_URL}/api/sites/${domain}/content.json`);
    if (!res.ok) {
      console.warn(`[hub] ${res.status} for ${domain}; building without Hub content`);
      return null;
    }
    return (await res.json()) as HubContent;
  } catch (err) {
    console.warn(`[hub] unreachable; building without Hub content`, err);
    return null;
  }
}
