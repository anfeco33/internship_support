const multer = require('multer');
const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../public/images/company_image_details')); // Thư mục lưu trữ
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + '-' + file.originalname); // Tên file duy nhất
//   },
// });

// // chỉ cho upload file ảnh
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true); // Cho phép file
//   } else {
//     cb(new Error('Only image files are allowed!'), false); // Từ chối file không phải ảnh
//   }
// };

// const upload = multer({ 
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const uploadPath = isImage
      ? path.join(__dirname, '../public/images/company_image_details')
      : path.join(__dirname, '../public/documents');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// chỉ nhận ảnh hoặc tài liệu
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and document files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn file 10MB
});

module.exports = upload;
