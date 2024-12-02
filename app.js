const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ensure `filestorage` directory exists
const uploadDirectory = path.join(__dirname, 'filestorage');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'filestorage/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'filestorage')));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.redirect('/');
});

app.delete('/delete/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filepath = path.join(uploadDirectory, fileName);

  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    res.send(`File "${fileName}" has been deleted.`);
  } else {
    res.status(404).send(`File "${fileName}" not found.`);
  }
});

app.get('/view', (req, res) => {
  fs.readdir(uploadDirectory, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading the upload directory.');
    } else {
      res.json({ files });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
