const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// server starts

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qbyf5is.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // server code
    // create data
    const toysCollection = client.db("kidsToyUser").collection("toys");

    app.post("/toys", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toysCollection.insertOne(newToy);
      res.send(result);
    });

    // read data
    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // read data for all toys
    app.get("/all-toys", async (req, res) => {
      const cursor = toysCollection.find().sort({ $natural: -1 }).limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    // query data for view details
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { email: id };
      const cursor = toysCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // delete a collection
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // update a collection
    app.get('/update-toys/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toysCollection.findOne(query);
      res.send(result);
    })

    // app.get("/update-toys/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const cursor = toysCollection.findOne(query);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    app.put("/update-toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          toyName: updatedToy.toyName,
          photo: updatedToy.photo,
          sellerName: updatedToy.sellerName,
          email: updatedToy.email,
          category: updatedToy.category,
          price: updatedToy.price,
          ratting: updatedToy.ratting,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      };
      const result = await toysCollection.updateOne(filter, toy, options);
      res.send(result);
    });
    // server code end

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// server ends

app.get("/", (req, res) => {
  res.send("KidsToy server is running");
});

app.listen(port, () => {
  console.log(`KidsToy Server is running on port ${port}`);
});
