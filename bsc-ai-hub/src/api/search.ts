import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';
import https from 'https';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Credentials', "true");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
     res.status(405).json({ error: 'Method not allowed' });
     return;
  }

  const { query } = req.body;
  if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
  }

  try {
      // DuckDuckGo Lite Version (POST based)
      // This is the most lightweight version, often used by text-based browsers.
      // It handles POST requests and returns very simple HTML.
      const url = "https://lite.duckduckgo.com/lite/";
      
      const body = new URLSearchParams();
      body.append('q', query as string);
      
      const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Origin': 'https://lite.duckduckgo.com',
          'Referer': 'https://lite.duckduckgo.com/'
      };

      const response = await fetch(url, { 
          method: 'POST',
          headers,
          body: body
      });
      
      if (!response.ok) {
          throw new Error(`DDG Lite returned ${response.status}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const results: any[] = [];
      
      // Select results from Lite version table
      // Structure is typically tables with .result-link and .result-snippet
      
      // The structure of Lite is:
      // <tr><td><a href="...">Title</a></td></tr>
      // <tr><td>Snippet</td></tr>
      
      const links = $('a.result-link');
      
      links.each((_, element) => {
          if (results.length >= 6) return;

          const title = $(element).text().trim();
          const href = $(element).attr('href');
          
          // The snippet is usually in the next row's cell
          const snippetRow = $(element).closest('tr').next('tr');
          const snippet = snippetRow.find('.result-snippet').text().trim();
          
          if (title && href && snippet) {
              results.push({
                  title,
                  url: href,
                  content: snippet
              });
          }
      });

      if (results.length === 0) {
          console.log("No results found on DDG Lite. HTML Preview:", html.slice(0, 300));
          // Check for error messages / captchas in html
      }

      res.status(200).json(results);

  } catch (error: any) {
      console.error("Search Error:", error);
      res.status(500).json({ error: 'Search failed', details: error.message });
  }
}
