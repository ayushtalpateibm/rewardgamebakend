import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();



const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGODB_URI;


mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to mongo');
}).catch((err) => {
  console.error( err);
});

// Define Mongoose Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalsPoints: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);



//route for create user
app.post('/api/users', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newUser = new User({ name });
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// route get all user
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

//for claim
app.post('/api/claims', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const randomPoints = Math.floor(Math.random() * 10) + 1;
    user.totalsPoints = randomPoints;
    await user.save();

    const leaderboard = await User.find().sort({ totalsPoints: -1 });

    res.status(200).json({ points: randomPoints, leaderboard });
  } catch (err) {
    console.error('Claim error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`server in on port${PORT}`);
});
