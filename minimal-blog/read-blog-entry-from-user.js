const functions = require('@google-cloud/functions-framework');
const mongoose = require('mongoose');

functions.http('run', (req, res) => {
    setHttpHeaders(req, res)
    execute(res, req)
});

async function readFromDatabase(email) {
    const blog = new mongoose.Schema({
        email: String,
        createdAt: Date,
        title: String,
        content: String
    });
    const Blog = mongoose.models.Blog || mongoose.model('Blog', blog);


    return res.send(
        Blog
            .find({'email': email})
            .sort({createdAt: -1})
            .select('email createdAt title content')
    )
}

async function execute(res, req) {
    console.log('Connecting to database');
    let url = process.env.DB_URL
    let user = process.env.DB_USER
    let password = process.env.DB_PASSWORD

    let email = req.body.email

    const dbUrl = 'mongodb+srv://' + user + ':' + password + '@' + url + '/minimal-blog'

    await mongoose
        .connect(dbUrl, {autoIndex: false})
        .then(
            () => {
                readFromDatabase(email);
            },
            err => {
                console.log("Encountered error: " + err)
            }
        );
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