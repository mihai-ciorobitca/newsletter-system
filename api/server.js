const express = require('express');
const supabase = require('@supabase/supabase-js');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')) 
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    return res.render('subscribePage', { message: null });
});

app.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    console.log(email);
    const { error } = await supabaseClient
        .from('subscribers')
        .insert({ email: email })
    console.log(error);
    if (error) {
        if (error.code === '23505') {
            return res.render('subscribePage', { message: 'Already subscribed!' });
        }
        return res.render('subscribePage', { message: "Unexpected error" });
    }
    return res.render('subscribePage', { message: "Subscribed!" });
});


app.post('/unsubscribe', (req, res) => {
    const { email } = req.body;
    supabaseClient
        .from('subsribers')
        .delete()
        .eq('email', email)
    return res.send('Unsubscribed!');
});

app.get("/send-newsletter", async (req, res) => {
    const { data, error } = await supabaseClient
        .from('subscribers')
        .select('email');

    if (error) {
        return res.send(error);
    }

    const emails = data.map(subscriber => subscriber.email);

    let transporter = nodemailer.createTransport({
        host: 'smtp.zoho.eu',
        secure: true,
        port: 465,
        auth: {
            user: 'mihai.ciorobitca@networkstudio.store',
            pass: 'R3dwaLL2013star@#'
        }
    });

    let mailOptions = {
        from: {
            name: 'Network Studio',
            address: 'mihai.ciorobitca@networkstudio.store'
        },
        to: emails,
        subject: 'Newsletter 3',
        list: {
            unsubscribe: {
                url: 'http://example.com',
                comment: 'Comment'
            }
        },
        text: 'Hello from Network Studio.\nTo unsubscribe, click here: https://example.com/unsubscribe',
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Message sent');
        return res.send('Emails sent!');
    } catch (error) {
        console.log(error);
        return res.status(500).send('Error sending emails');
    }
});


app.get('*', function (req, res) {
    return res.redirect('/');
});

app.listen(3000, console.log('Server running on port 3000'))