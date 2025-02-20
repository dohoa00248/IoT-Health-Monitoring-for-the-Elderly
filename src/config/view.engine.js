import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

//config đưa tên file name đang đứng -> url
const __filename = fileURLToPath(import.meta.url)
// console.log(__filename);
// get name_url chứa file đó
const __dirname = dirname(__filename);
// console.log(__dirname);

const configViewEngine = (app) => {
    // view engine setup
    app.set('views', path.join(__dirname, '../../src', 'views'));
    app.set('view engine', 'ejs');
}
export default configViewEngine;