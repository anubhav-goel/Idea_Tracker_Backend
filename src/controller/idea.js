const { validateRequest } = require("../utils/validateRequest");
const Idea = require("../model/Idea");
const moment = require("moment");

const getIdeas = async (req, res) => {
  try {
    const page = Math.abs(req.query.page) || 1;
    const limit = Math.abs(req.query.limit) || 1000000;
    const availableSortKeys = [
      "dateSort",
      "nameSort" /* , 'user.nameSort', 'user.emailSort' */,
    ];
    const sortKeys = getSortKeys(req.query, availableSortKeys) || { date: -1 };
    const query = { deleted: false };
    if (req.query.user) {
      query.user = req.query.user;
    }
    if (req.query.filterIdeaName) {
      // query.name = { $regex: new RegExp(`/^${req.query.filterIdeaName}/i`), $options: "i" };
      // query.name = new RegExp(`^${req.query.filterIdeaName}`, "i"); // starts with
      // query.name = new RegExp(`${req.query.filterIdeaName}$`, "i"); // ends with
      // query.name = new RegExp(`^${req.query.filterIdeaName}$`, "i"); // exact match
      query.name = new RegExp(`${req.query.filterIdeaName}`, "i"); // exact match
    }
    if (req.query.filterDate) {
      const dateObject = JSON.parse(req.query.filterDate);
      if (!dateObject.from || !dateObject.to) {
        return res.status(400).json([{ msg: "Bad Request for filter date." }]);
      }
      query.date = {
        $gte: moment(dateObject.from).startOf("day").toString(),
        $lte: moment(dateObject.to).endOf("day").endOf("day").toString(),
      };
    }
    const ideas = await Idea.find(query)
      /* .populate(
                { path: 'ideaStatus', select: 'status', model: "idea_statuses" },
                // { path: 'user', select: 'name email', model: "users" }
			) */
      .collation({ locale: "en" })
      .limit(limit)
      .skip(limit * (page - 1))
      .populate("user", "name email")
      .populate("ideaStatus", "status")
      .populate("likes.user", "name email")
      .sort({ ...sortKeys });
    const totalCount = await Idea.countDocuments(query);
    return res.json({
      page,
      pageSize: ideas.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      data: ideas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json([{ msg: "Internal Server Error" }]);
  }
};

const getIdea = async (req, res) => {
  try {
    const idea = await getIdeaById(req.params.id);
    if (!idea) {
      return res.status(404).json({ msg: "Idea not found!" });
    }
    return res.json(idea);
  } catch (error) {
    console.error(error);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Idea not found!" });
    }
    res.status(500).json([{ msg: "Internal Server Error" }]);
  }
};

const getIdeaById = async (id) => {
  return await Idea.findById(id)
    .populate("user", "name email")
    .populate("ideaStatus", "status")
    .populate("likes.user", "name email");
};

const createIdea = async (req, res) => {
  try {
    const validationErrors = validateRequest(req, res);
    if (validationErrors) {
      return res.status(400).json({ errors: validationErrors.errors });
    }
    const { name, description } = req.body;
    let newIdea = new Idea({
      user: req.user.id,
      name,
      description,
      ideaStatus: "5ec682982843d74cf00664a8",
    });
    const createdIdea = await newIdea.save();
    const idea = await Idea.findById(createdIdea.id)
      .populate("user", "name email")
      .populate("ideaStatus", "status");
    res.json(idea);
  } catch (error) {
    console.error(error);
    res.status(500).json([{ msg: "Internal Server Error" }]);
  }
};

const updateIdea = async (req, res) => {
  try {
    const validationErrors = validateRequest(req, res);
    if (validationErrors) {
      return res.status(400).json({ errors: validationErrors.errors });
    }
    const { name, description, ideaStatus } = req.body;
    const idea = await Idea.findById(req.params.id);
    if (req.user.id !== idea.user.toString()) {
      return res
        .status(401)
        .json({ msg: "User not authorized to update idea" });
    }
    if (!idea) {
      return res.status(404).json({ msg: "Idea not found!" });
    }
    await idea.updateOne({ name, description, ideaStatus });
    const updatedIdea = await Idea.findById(req.params.id)
      .populate("user", "name email")
      .populate("ideaStatus", "status");
    // .populate("status");
    /* .populate(
            {
                path: "status",
                select: [""]
            },
            {
                path: "user",
                select: ["name", "email"]
            }
        ) */
    return res.send(updatedIdea);
  } catch (error) {
    console.error(error);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Idea not found!" });
    }
    res.status(500).json([{ msg: "Internal Server Error" }]);
  }
};

const deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (req.user.id !== idea.user.toString()) {
      return res
        .status(401)
        .json({ msg: "User not authorized to delete idea" });
    }
    if (!idea) {
      return res.status(404).json({ msg: "Idea not found!" });
    }
    await idea.updateOne({ deleted: true });
    return res.send({ msg: "Idea Deleted." });
  } catch (error) {
    console.error(error);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Idea not found!" });
    }
    res.status(500).json([{ msg: "Internal Server Error" }]);
  }
};

const getSortKeys = (params, availableSortKeys) => {
  try {
    const sortKeys = Object.entries(params)
      .filter(([key, value]) => {
        return availableSortKeys.includes(key);
      })
      .reduce((result, [key, value]) => {
        result[key.replace("Sort", "")] = value;
        return result;
      }, {});
    return Object.keys(sortKeys).length === 0 ? null : sortKeys;
  } catch (error) {
    console.error(error);
    res.status(500).json([{ msg: "Internal Server Error" }]);
  }
};

const likeIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea || idea.deleted) {
      return res.status(404).json({ msg: "Idea not found!" });
    }

    let alreadyLiked = idea.likes.find(
      (like) => like.user.toString() === req.user.id
    );

    if (alreadyLiked) {
      return res.status(400).json({ msg: "Idea already liked." });
    }
    const likes = idea.likes;
    likes.push({ user: req.user.id });
    await idea.updateOne({ likes });

    const updatedIdea = await Idea.findById(req.params.id);
    // return res.send(updatedIdea.likes);
    const ideaInfo = await getIdeaById(req.params.id);
    return res.send(ideaInfo.likes);
  } catch (error) {
    console.error(error);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Idea not found!" });
    }
    res.status(500).json([{ msg: "Internal Server Error" }]);
  }
};

const unlikeIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea || idea.deleted) {
      return res.status(404).json({ msg: "Idea not found!" });
    }

    let isideaLiked = idea.likes.find(
      (like) => like.user.toString() === req.user.id
    );

    if (!isideaLiked) {
      return res.status(400).json({ msg: "Idea has not yet been liked!" });
    }
    const updatedLikes = idea.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );
    idea.likes = updatedLikes;
    await idea.save();
    // return res.send(idea.likes);
    const ideaInfo = await getIdeaById(req.params.id);
    return res.send(ideaInfo.likes);
  } catch (error) {
    console.error(error);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Idea not found!" });
    }
    res.status(500).json([{ msg: "Internal Server Error" }]);
  }
};

module.exports = {
  getIdeas,
  getIdea,
  createIdea,
  updateIdea,
  deleteIdea,
  likeIdea,
  unlikeIdea,
};
