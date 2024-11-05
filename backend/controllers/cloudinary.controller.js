class CloudinaryController {
  constructor() {
    this.cloudinary = require("cloudinary").v2;
    this.cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  /**
   * Cloudinary upload file
   * @param {*} file
   * @param {*} folder
   * @param {*} resourceType
   * @returns {Promise<CloudinaryStorage>}
   */

  async uploadFile(file, folder, resourceType) {
    const response = this.cloudinary.uploader.upload(file, { resource_type: resourceType });
    const cloudinaryStorage = await prisma.cloudinaryStorage.create({
      data: {
        url: response.secure_url,
        assetId: response.asset_id,
        publicId: response.public_id,
      },
    });
    return cloudinaryStorage;
  }

  /**
   * Cloudinary destroy file
   * @param {*} publicId
   * @returns
   */
  destroyFile(publicId) {
    return this.cloudinary.uploader.destroy(publicId);
  }
}

module.exports = CloudinaryController;
