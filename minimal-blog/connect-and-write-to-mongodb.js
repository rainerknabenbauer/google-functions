const functions = require('@google-cloud/functions-framework');
const mongoose = require('mongoose');

functions.http('helloHttp', (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        // Send response to preflight OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.set('Access-Control-Allow-Headers', '*');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    } else {
        execute(res, req)
    }
});

async function execute(res, req) {
    console.log('Connecting to database');
    let url = process.env.DB_URL
    let user = process.env.DB_USER
    let password = process.env.DB_PASSWORD

    let email = req.body.email
    let title = req.body.title
    let content = req.body.content
    let createdAt = new Date()
    console.log(email + " | " + title + " | " + content + " | " + createdAt)

    console.log('Database connected')

    const dbUrl = "mongodb+srv://" + user + ":" + password + "@" + url + "/minimal-blog"

    await mongoose.connect(dbUrl, {autoIndex: false}).then(
        () => {
            console.log('Connected to mongo server.');

            const blog = new mongoose.Schema({
                email: String,
                createdAt: Date,
                title: String,
                content: String
            });
            const Blog = mongoose.models.Blog || mongoose.model('Blog', blog);

            const blogEntry = new Blog({email: email, createdAt: createdAt, title: title, content: content});
            blogEntry.save()
        },
        err => { /** handle initial connection error */ }
    );
    res.send('blog entry created, connection closed')
}