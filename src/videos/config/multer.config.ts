import * as multer from 'multer';

export const fileFilter = (req, file, callback) => {
  // Check if the file is a video
  if (file.fieldname === 'video') {
    if (!file.originalname.match(/\.(mp4|mov|avi|wmv|webm)$/)) {
      return callback(new Error('Only video files are allowed!'), false);
    }
  }
  // Check if the file is an image
  else if (file.fieldname === 'cover') {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
  }
  // If the file is neither a video nor an image
  else {
    return callback(new Error('Invalid file type'), false);
  }

  // If the file passes the checks, accept it
  callback(null, true);
};

// Multer upload options
export const multerOptions = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '/tmp/uploads/videos');
    },
    filename: (req, file, cb) => {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      cb(null, `${randomName}${Date.now()}.${file.mimetype.split('/')[1]}`);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // Example: 10MB limit
  },
};
