import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
//config đưa tên file name đang đứng -> url
const __filename = fileURLToPath(import.meta.url)
// console.log(__filename);
// get name_url chứa file đó
const __dirname = dirname(__filename);
// console.log(__dirname);
const configStaticFolders = (app) => {
    // static folder setup
    app.use(express.static(path.join(__dirname, '../../src', 'public')));
    // app.use(express.static(path.join("./src", "public")))
}

export default configStaticFolders