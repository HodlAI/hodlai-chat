const s={async searchPublicFree(t){try{const e=await fetch("/api/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:t})});return e.ok?await e.json():[]}catch(e){return console.warn("Public search API failed",e),[]}},formatContext(t){if(t.length===0)return"";const e=`
[System: The following search results were retrieved from the internet. Use them to answer the user's question.]

`,r=t.map((n,o)=>`Source ${o+1}: ${n.title}
URL: ${n.url}
Content: ${n.content}
`).join(`
---
`);return e+r+`

`}},a=()=>localStorage.getItem("bsc_ai_hub_search_key")||"";export{a as getSearchConfig,s as searchService};
