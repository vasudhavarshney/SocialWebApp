const { Op } = require("sequelize");

const Photo = require("../Models/Photo");
const Like = require("../Models/Like");

module.exports = {
  async store(req, res) {
    const { photo: photoId } = req.params;
    const { userId } = req;

    const photo = await Photo.findByPk(photoId);

    if (!photo)
      return res.status(404).send({
        message: "An error has occurred, probably the photo was removed"
      });

    let like = await Like.findOne({
      where: { [Op.and]: [{ photo_id: photo.id }, { user_id: req.userId }] }
    });

    if (!like) {
      let newLike = await Like.create({
        user_id: userId,
        photo_id: photo.id
      });
      return res.json(newLike);
    } else {
      await like.destroy();
      return res.send();
    }
  }
};
