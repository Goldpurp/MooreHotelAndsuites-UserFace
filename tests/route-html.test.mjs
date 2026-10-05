import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {routeHtml} from '../scripts/route-html.mjs';
import {PUBLIC_ROUTES} from '../scripts/seo-routes.mjs';
const template=await readFile(new URL('../index.html',import.meta.url),'utf8');
test('static route metadata agrees with public and private indexing policy',()=>{
 assert.ok(!PUBLIC_ROUTES.includes('/contact'));
 const rooms=routeHtml(template,'/rooms');
 assert.match(rooms,/<link rel="canonical" href="https:\/\/moorehotelandsuites.com\/rooms">/);
 assert.match(rooms,/<title>Rooms &amp; Suites/);
 assert.match(rooms,/content="index, follow/);
 for(const route of ['/auth','/reset-password','/profile','/unknown','/booking-confirmation/private-code']){
  const html=routeHtml(template,route);
  assert.match(html,/content="noindex, nofollow"/);
  assert.doesNotMatch(html,/rel="canonical"|property="og:url"/);
 }
});
test('published room routes receive initial room metadata; unknown room paths stay private',()=>{
 const path='/rooms/62d33aaf-c2ee-4d10-819b-b96a4b09f35c';
 assert.match(routeHtml(template,path,[path]),/<title>Hotel Room in Sagamu/);
 assert.match(routeHtml(template,path,[path]),/content="index, follow/);
 assert.match(routeHtml(template,path),/content="noindex, nofollow"/);
});
