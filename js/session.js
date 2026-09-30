/* Public static site: no server session or access gate is required. */
(function(root) {
  'use strict';
  async function restore() {
    // Preserve the established group channel and encryption format. These public
    // compatibility values provide synchronization, not access protection.
    const material = await crypto.subtle.importKey('raw',new TextEncoder().encode('AUSROA'),'PBKDF2',false,['deriveKey']);
    const key = await crypto.subtle.deriveKey({name:'PBKDF2',salt:new TextEncoder().encode('aus_roadtrip_salt_2027_secure'),iterations:100000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
    return {key,syncTopic:'aus2027_vault_8f19e4c02ab9',resources:{splitwise:'https://secure.splitwise.com/#/groups/101615495',photos:'https://photos.app.goo.gl/c8Bkr97b1hc8QrKP7'}};
  }
  root.AppSession = {restore};
}(window));
