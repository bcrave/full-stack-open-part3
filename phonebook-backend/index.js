import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";

import Person from "./models/person.js";

const app = express();
morgan.token("body", (req, res) => JSON.stringify(req.body));

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use("/api/info", (req, res, next) => {
  res.set({
    Date: new Date(),
  });
  next();
});

app.get("/api/people", (req, res) => {
  Person.find({}).then((people) => {
    res.json(people);
  });
});

app.post("/api/people", async (req, res, next) => {
  const { body } = req;

  const person = new Person({
    ...body,
  });

  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((err) => next(err));
});

app.get("/api/people/:id", async (req, res, next) => {
  const { id } = req.params;

  Person.findById(id)
    .then((person) => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch((error) => next(error));
});

app.put("/api/people/:id", (req, res, next) => {
  const { id } = req.params;
  const { name, number } = req.body;

  Person.findByIdAndUpdate(
    id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((err) => next(err));
});

app.delete("/api/people/:id", (req, res, next) => {
  const { id } = req.params;

  Person.findByIdAndRemove(id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((err) => next(err));
});

app.get("/api/info", async (req, res) => {
  const people = await Person.find({});

  const numOfPeople = people.length;
  const date = res.get("Date");

  res.send(`
    <p>Phonebook has info for ${numOfPeople} people</p>
    <p>${date}</p>
  `);
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.name === "CastError")
    return res.status(400).send({ error: "Malformatted id" });
  else if (err.name === "ValidationError")
    return res.status(400).json({ error: err.message });
  else if (err.name === "MongoServerError" && err.code === 11000)
    return res.status(400).json({ error: "Name already exists in phonebook" });

  next(err);
};

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  `Listening on port ${PORT}`;
});
