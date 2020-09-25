const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const url = 'mongodb://127.0.0.1:27017';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const gitWebhookHandler = async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('payloads');
    const collection = db.collection('commits');
    await collection.insertOne(req.body);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
    res.sendStatus(200);
  }
}

app.get('/', (req, res) => {
  res.send('It works!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
