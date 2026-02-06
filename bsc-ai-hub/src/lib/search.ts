export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

/**
 * Client-side Search Service
 * Uses Public SearXNG Instances for free, privacy-focused search.
 */
export const searchService = {
  
  // Free Public Search (Bing Scraper) - Proxied via Serverless Function
  // Simulates a real browser to fetch Bing results and parses them server-side via Cheerio.
  async searchPublicFree(query: string): Promise<SearchResult[]> {
      try {
          const response = await fetch('/api/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query })
          });

          if (!response.ok) return [];
          return await response.json();
      } catch (e) {
          console.warn("Public search API failed", e);
          return [];
      }
  },

  // Fallback / Helper to format context
  formatContext(results: SearchResult[]): string {
    if (results.length === 0) return "";
    
    const tokenAlert = "\n[System: The following search results were retrieved from the internet. Use them to answer the user's question.]\n\n";
    const snippets = results.map((r, i) => 
      `Source ${i + 1}: ${r.title}\nURL: ${r.url}\nContent: ${r.content}\n`
    ).join("\n---\n");
    
    return tokenAlert + snippets + "\n\n";
  }
};

export const getSearchConfig = () => {
    return localStorage.getItem('bsc_ai_hub_search_key') || '';
};
