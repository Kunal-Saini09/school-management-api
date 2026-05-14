const express = require("express");
const router = express.Router();

const {
    addSchool,
    listSchools,
} = require("../controller/schoolController");

router.post("/addSchool", addSchool);

router.get("/listSchools", listSchools);

module.exports = router;