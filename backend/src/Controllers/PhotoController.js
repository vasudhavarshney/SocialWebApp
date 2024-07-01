const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const Sequelize = require("sequelize");

const Photo = require("../Models/Photo");
const Like = require("../Models/Like");

module.exports = {
  async show(req, res) {
    const { id } = req.params;

    // First, get the count of likes separately
    const photoLikesCount = await Photo.findOne({
      where: { id },
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("getLikes.id")), "likesCount"]
      ],
      include: [
        {
          association: "getLikes",
          attributes: []
        }
      ],
      group: ['Photo.id']
    });

    // Get the photo details along with comments and uploadedBy information
    const photo = await Photo.findByPk(id, {
      attributes: {
        exclude: ["updatedAt"],
        include: [
          [Sequelize.literal(`(${photoLikesCount.get('likesCount')})`), "likesCount"]
        ]
      },
      include: [
        {
          association: "uploadedBy",
          attributes: ["username", "avatar_url"]
        },
        {
          association: "getComments",
          attributes: ["id", "user_id", "body", "createdAt"],
          include: {
            association: "postedBy",
            attributes: ["username", "avatar_url"]
          }
        }
      ]
    });
    if (!photo) return res.status(400).send({ message: "Photo not found" });

    let isAutor = false;
    if (req.userId === photo.user_id) isAutor = true;

    let isLiked = false;
    let like = await Like.findOne({
      where: {
        [Sequelize.Op.and]: [{ photo_id: photo.id }, { user_id: req.userId }]
      }
    });
    if (like) isLiked = true;

    return res.json({ photo, isAutor, isLiked });
  },

  async store(req, res) {
    const { filename: key } = req.file;
    const { body } = req.body;

    const url = `${process.env.APP_URL}/files/${key}`;

    const photoCreated = await Photo.create({
      user_id: req.userId,
      body,
      key,
      photo_url: url
    });

    const photo = await Photo.findByPk(photoCreated.id, {
      attributes: {
        exclude: ["updatedAt"]
      },
      include: [
        {
          association: "uploadedBy",
          attributes: ["username", "avatar_url"]
        },
        {
          association: "getComments",
          attributes: {
            exclude: ["photo_id", "updatedAt"]
          },
          include: {
            association: "postedBy",
            attributes: ["username"]
          },
          limit: 3
        },
        {
          association: "getLikes",
          attributes: ["user_id"]
        }
      ],
      order: [["createdAt", "desc"]]
    });

    let isAutor = false;
    if (photo.user_id === req.userId) isAutor = true;

    let isLiked = false;
    photo.getLikes.map(like => {
      if (like.user_id === req.userId) isLiked = true;
    });

    return res.json({ isAutor, isLiked, photo });
  },

  async destroy(req, res) {
    const { id } = req.params;
    const { key } = req.query;

    const photo = await Photo.findByPk(id);

    if (!photo) return res.status(400).send({ message: "That photo does not exist" });

    if (photo.user_id !== req.userId)
      return res.status(401).send({ message: "You are not authorized" });

    promisify(fs.unlink)(
      path.resolve(__dirname, "..", "..", "tmp", "uploads", key)
    ); // Eliminando el archivo de local

    await photo.destroy();

    return res.send();
  }
};
