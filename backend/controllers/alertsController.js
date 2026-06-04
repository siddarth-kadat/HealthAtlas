import { HealthStat } from '../models/HealthStat.js';
import { withNormalizedHealthStatFields } from '../utils/healthStatFields.js';

const NEWS_CACHE_TTL_MS = 60 * 60 * 1000;

const NEWS_FEEDS = [
  {
    name: 'ECDC News',
    url: 'https://www.ecdc.europa.eu/en/taxonomy/term/1307/feed',
    category: 'Public Health Update',
  },
  {
    name: 'ECDC Threat Reports',
    url: 'https://www.ecdc.europa.eu/en/taxonomy/term/1505/feed',
    category: 'Threat Assessment',
  },
  {
    name: 'MSF',
    url: 'https://www.msf.org/rss/all',
    category: 'Field Response',
  },
];

const newsCache = {
  items: [],
  fetchedAt: 0,
};

const decodeHtml = (value = '') => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const extractXmlValue = (block, tagName) => {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? decodeHtml(match[1]) : '';
};

const inferSeverity = (title, summary) => {
  const text = `${title} ${summary}`.toLowerCase();

  if (/(outbreak|surge|emergency|pandemic|fatal|critical|deaths|epidemic)/.test(text)) {
    return 'Critical';
  }

  if (/(warning|alert|spread|threat|resistant|cholera|measles|influenza|dengue|ebola)/.test(text)) {
    return 'High';
  }

  if (/(vaccine|monitoring|prevention|screening|response|study|report)/.test(text)) {
    return 'Medium';
  }

  return 'Low';
};

const inferCategory = (title, summary, fallbackCategory) => {
  const text = `${title} ${summary}`.toLowerCase();

  if (/(outbreak|surge|epidemic|spread)/.test(text)) return 'Outbreak';
  if (/(vaccine|immuni)/.test(text)) return 'Vaccination';
  if (/(resistan|antimicrobial|drug)/.test(text)) return 'Drug Resistance';
  if (/(surveillance|monitoring|assessment)/.test(text)) return 'Surveillance';
  if (/(climate|heat|flood|rain)/.test(text)) return 'Climate Health';

  return fallbackCategory || 'Healthcare Update';
};

const parseRssItems = (xml, feed) => {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  return blocks.map((block, index) => {
    const title = extractXmlValue(block, 'title');
    const summary = extractXmlValue(block, 'description');
    const url = extractXmlValue(block, 'link');
    const pubDate = extractXmlValue(block, 'pubDate');
    const category = extractXmlValue(block, 'category');
    const date = pubDate ? new Date(pubDate) : new Date();

    return {
      id: `${feed.name.toLowerCase().replace(/\s+/g, '-')}-${index}-${date.getTime()}`,
      title,
      source: feed.name,
      date: Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
      summary,
      category: inferCategory(title, summary, category || feed.category),
      severity: inferSeverity(title, summary),
      url,
    };
  }).filter((item) => item.title && item.url);
};

const dedupeNews = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${item.title}::${item.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const fetchLiveNews = async () => {
  const responses = await Promise.allSettled(
    NEWS_FEEDS.map(async (feed) => {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'HealthAtlas Alerts Feed/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`${feed.name} responded with ${response.status}`);
      }

      const xml = await response.text();
      return parseRssItems(xml, feed);
    })
  );

  const combined = responses.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const deduped = dedupeNews(combined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30);

  if (deduped.length > 0) {
    newsCache.items = deduped;
    newsCache.fetchedAt = Date.now();
  }

  return deduped;
};

const getCachedOrLiveNews = async (forceRefresh = false) => {
  const cacheFresh = Date.now() - newsCache.fetchedAt < NEWS_CACHE_TTL_MS;

  if (!forceRefresh && cacheFresh && newsCache.items.length > 0) {
    return newsCache.items;
  }

  const items = await fetchLiveNews();
  if (items.length > 0) {
    return items;
  }

  return newsCache.items;
};

export const getDynamicAlerts = async (req, res) => {
  try {
    const yearlySeries = await HealthStat.aggregate(withNormalizedHealthStatFields(
      {
        $group: {
          _id: {
            country: '$country',
            disease: '$diseaseName',
            year: '$year',
          },
          prevalenceRate: { $avg: '$prevalenceRate' },
        },
      },
      {
        $project: {
          _id: 0,
          country: '$_id.country',
          disease: '$_id.disease',
          year: '$_id.year',
          prevalenceRate: 1,
        },
      },
      { $sort: { country: 1, disease: 1, year: 1 } },
    ));

    const alerts = [];

    for (let index = 1; index < yearlySeries.length; index += 1) {
      const current = yearlySeries[index];
      const previous = yearlySeries[index - 1];

      const sameSeries = current.country === previous.country && current.disease === previous.disease;
      const sequentialYears = current.year === previous.year + 1;

      if (!sameSeries || !sequentialYears || previous.prevalenceRate <= 0) {
        continue;
      }

      const growth = ((current.prevalenceRate - previous.prevalenceRate) / previous.prevalenceRate) * 100;
      if (growth <= 25) {
        continue;
      }

      alerts.push({
        id: `${current.country}-${current.disease}-${current.year}`,
        type: 'outbreak',
        severity: growth > 50 ? 'Critical' : growth > 35 ? 'High' : 'Medium',
        message: `Rapid increase in ${current.disease} detected in ${current.country}. Prevalence grew by ${growth.toFixed(1)}% year over year.`,
        country: current.country,
        disease: current.disease,
        date: new Date(current.year, 0, 1).toISOString(),
        growth: Number(growth.toFixed(1)),
      });
    }

    alerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(alerts.slice(0, 50));
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getRealtimeNews = async (req, res) => {
  try {
    const forceRefresh = req.query.force === 'true';
    const items = await getCachedOrLiveNews(forceRefresh);

    res.json({
      items,
      lastUpdated: newsCache.fetchedAt ? new Date(newsCache.fetchedAt).toISOString() : new Date().toISOString(),
      autoRefreshMs: NEWS_CACHE_TTL_MS,
      sources: NEWS_FEEDS.map((feed) => feed.name),
    });
  } catch (err) {
    if (newsCache.items.length > 0) {
      return res.json({
        items: newsCache.items,
        lastUpdated: new Date(newsCache.fetchedAt).toISOString(),
        autoRefreshMs: NEWS_CACHE_TTL_MS,
        sources: NEWS_FEEDS.map((feed) => feed.name),
        warning: 'Live sources were temporarily unavailable. Showing the latest cached healthcare headlines.',
      });
    }

    res.status(500).json({ msg: err.message });
  }
};
