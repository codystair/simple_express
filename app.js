const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const url = 'mongodb://127.0.0.1:27017';
const { Client } = require('pg');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const gitWebhookHandler = async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  const pgdb = new Client({
    database: 'bins'
  });

  try {
    await client.connect();
    const db = client.db('payloads');
    const collection = db.collection('commits');
    const data = await collection.insertOne(req.body);
    const id = data.insertedId;

    console.log(id);
    
    await pgdb.connect();
    await pgdb.query('INSERT INTO events(doc_id) VALUES($1)', [id]);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
    await pgdb.end();
    res.sendStatus(200);
  }
}

app.get('/', (req, res) => {
  res.send('It works!')
})

app.post('/', (req, res) => {
  gitWebhookHandler(req, res);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
