const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const port = 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('doctors'));
app.use(fileUpload());
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.avi8n.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentCollection = client.db("doctorsPortal").collection("appointments");
    const doctorCollection = client.db("doctorsPortal").collection("doctors");

    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body.date;
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctorsDocuments) => {
                const filter = { date: date }
                if (doctorsDocuments.length === 0) {
                    filter.email = email;
                }
                appointmentCollection.find(filter)
                    .toArray((err, documents) => {
                        res.send(documents)
                    })
            })
    })

    app.get('/appointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        doctorCollection.insertOne({ name, email, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, documents) => {
                res.send(documents.length > 0);
            })
    })

});


app.get('/', (req, res) => {
    res.send('Hello duniya');
})

app.listen(process.env.PORT || port);