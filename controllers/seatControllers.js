const Seat = require('../models/seatModel');

// Initialize seats if not already initialized
const initializeSeats = async () => {
  const seatCount = await Seat.countDocuments();
  if (seatCount === 0) {
    const seats = [];
    for (let i = 1; i <= 77; i++) {
      seats.push({ number: `S${i}`, isBooked: false });
    }
    for (let i = 78; i <= 80; i++) {
      seats.push({ number: `S${i}`, isBooked: false });
    }
    await Seat.insertMany(seats);
  }
};

// Book seats
const bookSeats = async (req, res) => {
  const { numSeats } = req.body;

  if (numSeats < 1 || numSeats > 7) {
    return res.status(400).json({ message: 'You can book between 1 and 7 seats at a time.' });
  }

  await initializeSeats();

  const availableSeats = await Seat.find({ isBooked: false });

  if (availableSeats.length < numSeats) {
    return res.status(400).json({ message: 'Not enough available seats.' });
  }

  let bookedSeats = [];

  // Try booking seats in one row
  for (let row = 1; row <= 11; row++) {
    const rowSeats = availableSeats.filter(seat => Math.ceil(seat.number.slice(1) / 7) === row);
    if (rowSeats.length >= numSeats) {
      bookedSeats = rowSeats.slice(0, numSeats);
      break;
    }
  }

  // If not enough seats in one row, book nearby seats
  if (bookedSeats.length === 0) {
    bookedSeats = availableSeats.slice(0, numSeats);
  }

  // Mark seats as booked
  const seatIds = bookedSeats.map(seat => seat._id);
  await Seat.updateMany({ _id: { $in: seatIds } }, { $set: { isBooked: true } });

  res.json({
    message: 'Seats booked successfully',
    bookedSeats: bookedSeats.map(seat => seat.number),
  });
};

// Get all seats with their booking status
const getAllSeats = async (req, res) => {
  await initializeSeats();
  const seats = await Seat.find();
  res.json(seats);
};

module.exports = { bookSeats, getAllSeats };
