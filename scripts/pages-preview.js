/* Serve the production export beneath a GitHub project prefix, without APIs. */
import express from 'express';
import path from 'node:path';
const app=express();
app.get('/Australien-Reiseplan/js/session.js',(req,res)=>res.type('js').send("window.AppSession={restore:async()=>({resources:{photos:'https://example.com/photos',splitwise:'https://example.com/splitwise'},key:null,syncTopic:''})};"));
app.use('/Australien-Reiseplan',express.static(path.resolve('dist'),{index:'index.html',dotfiles:'deny'}));
app.use((req,res)=>res.status(404).send('Static preview: no backend'));
app.listen(8767,'127.0.0.1',()=>console.log('Static preview: http://127.0.0.1:8767/Australien-Reiseplan/'));
