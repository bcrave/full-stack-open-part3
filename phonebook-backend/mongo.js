import { mongoose } from "mongoose";

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://brennycode:${password}@cluster0.xhuaqvn.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (name && number) {
  const person = new Person({
    name,
    number,
  });

  person.save().then((result) => {
    console.log(`Added ${name} with number ${number} to phonebook!`);
    mongoose.connection.close();
  });
} else {
  Person.find({}).then((result) => {
    result.forEach((result) => {
      const { name, number } = result;
      console.log(name, number);
    });
    mongoose.connection.close();
  });
}
