import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename);

const configStaticFolders = (app) => {
    // static folder setup
    app.use(express.static(path.join(__dirname, '../../src', 'public')));
    // app.use(express.static(path.join("./src", "public")))
}

export default configStaticFolders