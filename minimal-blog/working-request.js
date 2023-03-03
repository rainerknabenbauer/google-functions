const functions = require('@google-cloud/functions-framework');
const mongoose = require('mongoose');

functions.http('helloHttp', (req, res) => {
    setHttpHeaders(req, res)
    execute(res, req)
});

function saveToDatabase(email, createdAt, title, content) {
    const blog = new mongoose.Schema({
        email: String,
        createdAt: Date,
        title: String,
        content: String
    });
    const Blog = mongoose.models.Blog || mongoose.model('Blog', blog);

    const blogEntry = new Blog({email: email, createdAt: createdAt, title: title, content: content});
    blogEntry.save()
}

async function execute(res, req) {
    console.log('Connecting to database');
    let url = process.env.DB_URL
    let user = process.env.DB_USER
    let password = process.env.DB_PASSWORD

    let email = req.body.email
    let title = req.body.title
    let content = req.body.content
    let createdAt = new Date()

    const dbUrl = 'mongodb+srv://' + user + ':' + password + '@' + url + '/minimal-blog'
    const endOfTransactionMessage = 'blog entry created with title ' + title

    await mongoose
        .connect(dbUrl, {autoIndex: false})
        .then(
            () => {
                saveToDatabase(email, createdAt, title, content);
            },
            err => {
                console.log("Encountered error: " + err)
            }
        );
    res.send(endOfTransactionMessage)
}

// pre-flight OPTIONS request will terminate before 'execute' runs
function setHttpHeaders(req, res) {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        // Send response to preflight OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.set('Access-Control-Allow-Headers', '*');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }
}