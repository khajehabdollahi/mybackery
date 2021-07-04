const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.ClaudinaryCloudName,
  api_key: process.env.ClaudinaryKey,
  api_secret: process.env.ClaudinarySecret,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params:{
  folder: 'backery',
  allowedFormats: ['jpeg', 'png', 'gif', 'tiff', 'jpg']
}
})


module.exports = {
  cloudinary,
  storage
}



