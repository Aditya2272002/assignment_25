import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = "APPOINTMENT";
const BACKEND_URI = "https://backend-appointment-vi50.onrender.com"

const DraggableAppointment = ({ appointment, index, moveAppointment, deleteAppointment }) => {
  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveAppointment(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      className="bg-gray-100 shadow p-4 rounded flex justify-between items-center cursor-move"
    >
      <span>
        {appointment.title} - {appointment.time}
      </span>
      <button
        onClick={() => deleteAppointment(appointment._id)}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  );
};

const App = () => {
  const [appointments, setAppointments] = useState([]);
  const [summaryView, setSummaryView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${BACKEND_URI}/appointments`);
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const moveAppointment = (fromIndex, toIndex) => {
    const updatedAppointments = Array.from(appointments);
    const [movedItem] = updatedAppointments.splice(fromIndex, 1);
    updatedAppointments.splice(toIndex, 0, movedItem);
    setAppointments(updatedAppointments);
  };

  const deleteAppointment = (id) => {
    if (id) {
      fetch(`${BACKEND_URI}/appointments/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            setAppointments((prev) => prev.filter((appointment) => appointment._id !== id));
          } else {
            console.error("Error deleting appointment");
          }
        })
        .catch((error) => console.error("Error:", error));
    } else {
      console.error("Invalid appointment ID");
    }
  };

  const addAppointment = async () => {
    try {
      const response = await fetch(`${BACKEND_URI}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAppointment),
      });
      const addedAppointment = await response.json();
      setAppointments((prev) => [...prev, addedAppointment]);
      setIsModalOpen(false); // Close the modal after adding
    } catch (error) {
      console.error("Error adding appointment:", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Appointment Calendar</h1>
        <div className="flex justify-between mb-4">
          <button
            onClick={() => setIsModalOpen(true)} // Open modal to add appointment
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Appointment
          </button>
          <button
            onClick={() => setSummaryView(!summaryView)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {summaryView ? "Back to Calendar" : "View Summary"}
          </button>
        </div>

        {/* Add Appointment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-xl w-96">
              <h2 className="text-xl font-semibold mb-4">Add Appointment</h2>
              <input
                type="text"
                placeholder="Title"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                className="mb-4 p-2 w-full border rounded"
              />
              <input
                type="text"
                placeholder="Description"
                value={newAppointment.description}
                onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                className="mb-4 p-2 w-full border rounded"
              />
              <input
                type="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                className="mb-4 p-2 w-full border rounded"
              />
              <input
                type="time"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                className="mb-4 p-2 w-full border rounded"
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={addAppointment}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {summaryView ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
            <ul className="space-y-2">
              {appointments.map((appointment) => (
                <li
                  key={appointment._id} // Use _id for the key
                  className="bg-white shadow p-4 rounded flex justify-between items-center"
                >
                  <span>
                    {appointment.title} - {appointment.time}
                  </span>
                  <button
                    onClick={() => deleteAppointment(appointment._id)} // Use _id from MongoDB
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow p-4 rounded space-y-2">
            {appointments.map((appointment, index) => (
              <DraggableAppointment
                key={appointment._id} // Use _id for the key
                index={index}
                appointment={appointment}
                moveAppointment={moveAppointment}
                deleteAppointment={deleteAppointment}
              />
            ))}
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default App;
