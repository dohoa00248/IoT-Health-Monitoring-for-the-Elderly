import express from 'express';

const parseJson = (app) => {
    // parse json 
    app.use(express.json()); // Để phân tích JSON
    app.use(express.urlencoded({ extended: true })); // Để phân tích x-www-form-urlencoded
}

export default parseJson