require("dotenv").config()
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');


const Appointment = require('./models/appointment');

const app = express();
const port = process.env.PORT;


app.use(cors());
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.log('MongoDB connection error: ', err));

app.post('/appointments', async (req, res) => {
  const { title, description, date, time } = req.body;
  try {
    const newAppointment = new Appointment({ title, description, date, time });
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


app.get('/appointments', async (req, res) => {
    try {
      const appointments = await Appointment.find();
      const appointmentsWithId = appointments.map((appointment) => ({
        id: appointment._id.toString(),
        ...appointment.toObject(),
      }));
      res.json(appointmentsWithId);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments", error });
    }
});
  
app.delete('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAppointment = await Appointment.findByIdAndDelete(id);
        if (!deletedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
        }
        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting appointment", error });
    }
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
