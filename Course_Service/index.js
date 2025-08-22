const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());


const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructor: String,
  category: String,
  price: Number,
  syllabus: String,
  difficulty: String,
  seats: { type: Number, default: 50 }
});
const Course = mongoose.model('Course', courseSchema);


app.post('/api/courses', async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.get('/api/courses', async (req, res) => {
  const { category, difficulty } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  const courses = await Course.find(filter);
  res.json(courses);
});

mongoose.connect('mongodb://localhost:27017/course-service');
app.listen(3001, () => console.log('Course Service running on port 3001'));