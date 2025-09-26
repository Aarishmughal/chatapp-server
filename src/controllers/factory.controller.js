const handleAsync = require("../utils/handleAsync");

exports.createOne = (Model) =>
    handleAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                doc,
            },
        });
    });

exports.getAll = (Model) =>
    handleAsync(async (req, res, next) => {
        const docs = await Model.find();
        res.status(200).json({
            status: "success",
            results: docs.length,
            data: {
                docs,
            },
        });
    });

exports.getOne = (Model) =>
    handleAsync(async (req, res, next) => {
        const doc = await Model.findById(req.params.id);
        res.status(200).json({
            status: "success",
            data: {
                doc,
            },
        });
    });

exports.updateOne = (Model) =>
    handleAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: "success",
            data: {
                doc,
            },
        });
    });

exports.deleteOne = (Model) =>
    handleAsync(async (req, res, next) => {
        await Model.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: "success",
            data: null,
        });
    });
