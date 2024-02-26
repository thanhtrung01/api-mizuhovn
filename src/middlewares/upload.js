const multer = require('multer');
const cloudiness = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudiness.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudiness,
  params: {
    folder: 'api-mizuhogroup',
    // allowed_formats: ['png', 'jpeg', 'jpg', 'gif', 'jpeg'],
  },
});

exports.frontImage = function () {
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  const upload = multer({ storage: storage, fileFilter: fileFilter });
  return upload.array('frontImage', 12);
};

exports.backImage = function () {
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  const upload = multer({ storage: storage, fileFilter: fileFilter });
  return upload.array('backImage', 12);
};

exports.portrait = function () {
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  const upload = multer({ storage: storage, fileFilter: fileFilter });
  return upload.array('portrait', 12);
};

exports.Avatar = function () {
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  const upload = multer({ storage: storage, fileFilter: fileFilter });
  return upload.array('avatar', 12);
};

exports.Image = function () {
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  const upload = multer({ storage: storage, fileFilter: fileFilter });
  return upload.array('images', 12);
};