const { validationResult } = require("express-validator");

const Comment = require("../Models/Comment");
const Photo = require("../Models/Photo");

module.exports = {
  async store(req, res) {
    const { body } = req.body;
    const { photo: photo_id } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Photo.findByPk(photo_id);

    if (!post)
      return res.status(400).send({ message: "The publication does not exist!" });

    const comment = await Comment.create({
      user_id: req.userId,
      photo_id,
      body
    });

    const newComment = await Comment.findByPk(comment.id, {
      attributes: ["id", "photo_id", "user_id", "body", "createdAt"],
      include: {
        association: "postedBy",
        attributes: ["username", "avatar_url"]
      }
    });

    return res.json(newComment);
  },

  async update(req, res) {
    const { body } = req.body;
    const { id } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findByPk(id);

    if (!comment)
      return res.status(404).send({ message: "The comment does not exist" });
    if (comment.user_id !== req.userId)
      return res.status(401).send({ message: "Not authorized" });

    const newComment = await comment.update({ body });

    return res.json(newComment);
  },

  async destroy(req, res) {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);

    if (!comment)
      return res.status(404).send({ message: "The comment does not exist" });
    if (comment.user_id !== req.userId)
      return res.status(401).send({ message: "Not authorized" });

    await comment.destroy();

    return res.send();
  }
};
