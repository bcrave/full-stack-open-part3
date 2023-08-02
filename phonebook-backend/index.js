import express from "express";
import morgan from "morgan";
import cors from "cors";

import { people, createPerson, deletePerson } from "./data.js";

const app = express();

app.use(express.json());
app.use(cors());
morgan.token("body", (req, res) => JSON.stringify(req.body));
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
  res.json(people);
});

app.post("/api/people", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res
      .status(400)
      .send({ message: "Name or number missing", type: "error" });
  }

  if (
    people.some((person) => {
      return person.name.toLowerCase() === body.name.toLowerCase();
    })
  ) {
    return res
      .status(400)
      .send({ message: "User name already exists", type: "error" });
  }

  const maxId =
    people.length > 0 ? Math.max(...people.map((person) => person.id)) : 0;

  const person = {
    id: maxId + 1,
    ...body,
  };

  createPerson(person);

  res.json(person);
});

app.get("/api/people/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const person = people.find((person) => person.id === id);

  if (!person) return res.status(404).send(`No person with ID ${id}`);

  res.json(person);
});

app.delete("/api/people/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const person = people.find((person) => person.id === id);

  if (!person) return res.status(404).send(`No person with ID ${id}`);

  deletePerson(id);

  res.json(people);
});

app.get("/api/info", (req, res) => {
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

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  `Listening on port ${PORT}`;
});
