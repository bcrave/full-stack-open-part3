import "dotenv/config";
import { mongoose } from "mongoose";

mongoose.set("strictQuery", false);

const url = process.env.MONGO_DB_URI;

console.log("Connecting to", url);

mongoose
  .connect(url)
  .then((result) => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
    unique: true,
  },
  number: {
    type: String,
    minLength: 10,
    required: true,
    validate: {
      validator: (v) => /^(\d{2,3})(-\d+)+$/.test(v),
    },
  },
});

personSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export default mongoose.model("Person", personSchema);
