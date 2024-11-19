const mime = require('mime-types');
const archiver = require('archiver');

const fs = require('fs');
const multer = require('multer');
const path = require('path');
const unzipper = require('unzipper');

const userController = require('./user.controllers');
const User = require('../models/users');

const uploadsFolderPath = path.join(__dirname, '../uploads'); // Đường dẫn đến thư mục uploads


console.log(uploadsFolderPath)


const allowedExtensions = ['.jpg', '.jpeg', '.png'];

// Cấu hình Multer để lưu trữ tệp tin trực tiếp trên máy chủ
var maxSize = 20 * 1024 * 1024;
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        const path_to_load = uploadsFolderPath +'/avatars';
        cb(null, path_to_load);
    },
    filename: function (req, file, cb) {
        const originalname = file.originalname;
        const fileExtension = path.extname(originalname).toLowerCase();
        const namefile = req.session.account;

        if (file.size > maxSize || !allowedExtensions.includes(fileExtension)) {
            throw new Error('Only JPG, JPEG and PNG files are allowed');
        } else {
            cb(null, namefile + "@avatar" + fileExtension);
        }
    }
});

const storage2 = multer.diskStorage({

    destination: function (req, file, cb) {
        const path_to_load = uploadsFolderPath;
        cb(null, path_to_load);
    },
    filename: function (req, file, cb) {
        const originalname = file.originalname;
        const fileExtension = path.extname(originalname).toLowerCase();
        const namefile = req.session.product ? req.session.product : "tmp";

        if (file.size > maxSize || !allowedExtensions.includes(fileExtension)) {
            throw new Error('Only JPG, JPEG and PNG files are allowed');
        } else {
            cb(null, "tmp@product.jpg");
        }
    }
});



const upload = multer({ storage: storage });
const upload2 = multer({ storage: storage2 });

function formatSize(size) {
    if (size < 1024) {
        return size + " B";
    } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + " KB";
    } else {
        return (size / (1024 * 1024)).toFixed(2) + " MB";
    }
}


const { promisify } = require('util');
//TODO: sửa lại dùng req gán action 
class FileController {
    async changeAvatar(req , res , next) {
        try {
            // const action = req.body
            // console.log(action)
            const uploadArray = promisify(upload.array('file', 5));
            await uploadArray(req, res);
            const files = req.files;
            // console.log(files[0].filename);


            // const account =  await userController.getAccount(req.session.account)
            // console.log(account);
            
            const find = await User.findById(req.session.account);
            // console.log(find)
            if (find) {
                find.profilePicture = "../../avatars/"+files[0].filename; 
                await find.save(); // Lưu thay đổi
                req.session.flash = {
                    type: 'success',
                    intro: 'Change avatar',
                    message: 'Change avatar successful',
                };
                res.json({ uploaded: true, status: 'success', message: 'Change avatar successful' });
            }
            else{
                req.session.flash = {
                    type: 'warning',
                    intro: 'Change avatar',
                    message: 'Change avatar fail',
                };
                res.json({ uploaded: false, status: 'warning', message: 'Change avatar fail' });
            }

        } catch (error) {
            next(error);
        }
    }
    // async productPicture(req , res , next) {
    //     try {
    //         const curr_product = req.session.product
    //         console.log("ABC##############" + curr_product)
    //         const uploadArray = promisify(upload2.array('file', 5));
    //         await uploadArray(req, res);
    //         const files = req.files;
    //         console.log(files[0].filename);
    //         if(curr_product){
    //             const find = await Product.findById(curr_product);
    //             console.log(find)
    //             if (find) { 
    //                 const imagePath = path.join(__dirname, '../uploads','tmp@product.jpg'); // Đường dẫn của hình ảnh upload

    //                 const newImagePath = path.join(__dirname, '../uploads', find.productPicture); // Đường dẫn mới với tên file tương ứng với productPicture
    //                 console.log(imagePath, newImagePath);
    //                 fs.rename(imagePath, newImagePath, function (err) {
    //                   if (err) {
    //                     console.error('Error renaming image:', err);
    //                   } else {
    //                     console.log('Image renamed successfully');
    //                     req.session.flash = {
    //                         type: 'success',
    //                         intro: 'Change IMAGE product',
    //                         message: 'Change IMAGE product successful',
    //                     };
    //                     res.json({ uploaded: true, status: 'success', message: 'Change IMAGE product successful' });
    //                   }
    //                 });
    //             }
    //             else{
    //                 res.json({ uploaded: false, status: 'warning', message: 'Change product fail' });
    //             }
    //         }
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    
}

module.exports = new FileController();