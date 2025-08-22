const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();
app.use(express.json());


const enrollmentSchema = new mongoose.Schema({
  studentId: String,
  courseId: String,
  status: { type: String, default: 'active' },
  paymentStatus: { type: String, default: 'completed' },
  enrolledAt: { type: Date, default: Date.now }
});
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);


function processPayment() {
  return { success: true, transactionId: Math.random().toString(36).slice(2) };
}


app.post('/api/enrollments', async (req, res) => {
  const { studentId, courseId } = req.body;
  try {
    
    const studentRes = await axios.get(`http://localhost:3002/api/students/${studentId}`);
    if (!studentRes.data) return res.status(404).json({ error: 'Student not found' });

    
    const courseRes = await axios.get(`http://localhost:3001/api/courses/${courseId}`);
    if (!courseRes.data) return res.status(404).json({ error: 'Course not found' });

    
    const payment = processPayment();
    if (!payment.success) return res.status(402).json({ error: 'Payment failed' });

    
    const enrollment = new Enrollment({ studentId, courseId, paymentStatus: 'completed' });
    await enrollment.save();
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.get('/api/enrollments/:id', async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
  res.json(enrollment);
});

// View student's enrollment history
app.get('/api/enrollments/student/:studentId', async (req, res) => {
  const enrollments = await Enrollment.find({ studentId: req.params.studentId });
  res.json(enrollments);
});

mongoose.connect('mongodb://localhost:27017/enrollment-service');
app.listen(3003, () => console.log('Enrollment Service running on port 3003'));