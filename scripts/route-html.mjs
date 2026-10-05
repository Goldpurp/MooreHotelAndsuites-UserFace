import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {PUBLIC_ROUTE_METADATA,PRIVATE_ROUTE_METADATA,SITE_URL} from './seo-routes.mjs';
const roomMeta={title:'Hotel Room in Sagamu | Moore Hotels & Suites',description:'View room details, amenities and availability, then book your stay directly with Moore Hotels & Suites in Sagamu, Ogun State.'};
const missingMeta={title:'Page Not Found | Moore Hotels & Suites',description:'The requested page could not be found. Explore rooms, services and booking help at Moore Hotels & Suites.'};
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function routeHtml(template, route, publishedRooms=[]) {
 const isPublic=Boolean(PUBLIC_ROUTE_METADATA[route]) || publishedRooms.includes(route);
 const meta=PUBLIC_ROUTE_METADATA[route] || PRIVATE_ROUTE_METADATA[route] || (publishedRooms.includes(route) ? roomMeta : missingMeta);
 let html=template.replace(/<title>[^<]*<\/title>/,'<title>'+escape(meta.title)+'</title>');
 html=html.replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*"/g,'$1'+escape(meta.description)+'"')
 .replace(/(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*"/g,'$1'+escape(meta.title)+'"')
 .replace(/(<meta name="robots" content=")[^"]*"/,'$1'+(isPublic ? 'index, follow, max-image-preview:large':'noindex, nofollow')+'"');
 html=html.replace(/\s*<link rel="canonical"[^>]*>/g,'').replace(/\s*<meta property="og:url"[^>]*>/g,'');
 if(isPublic) html=html.replace('</head>','<link rel="canonical" href="'+SITE_URL+route+'">\n<meta property="og:url" content="'+SITE_URL+route+'">\n</head>');
 return html;
}
/** @returns {import("vite").Plugin} */
export function routeHtmlPlugin() {
 let outDir;
 return {name:'moore-route-metadata',apply:'build',
  configResolved(config){outDir=path.resolve(config.root,config.build.outDir);},
  async closeBundle(){
   const template=await readFile(path.join(outDir,'index.html'),'utf8');
   const sitemap=await readFile(path.join(outDir,'sitemap.xml'),'utf8');
   const rooms=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>new URL(match[1]).pathname).filter(route=>/^\/rooms\/[a-f0-9-]{36}$/i.test(route));
   for(const route of [...Object.keys(PUBLIC_ROUTE_METADATA),...Object.keys(PRIVATE_ROUTE_METADATA),...rooms]){
    const target=path.join(outDir,route.slice(1),'index.html');await mkdir(path.dirname(target),{recursive:true});
    await writeFile(target,routeHtml(template,route,rooms));
   }
   await writeFile(path.join(outDir,'404.html'),routeHtml(template,'/not-found'));
  }
 };
}
