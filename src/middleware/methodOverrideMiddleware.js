import methodOverride from 'method-override';
const setupMethodOverride = (app) => {
    app.use(methodOverride('_method'));
}

export default setupMethodOverride