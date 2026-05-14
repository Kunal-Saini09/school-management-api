const db = require("../config/db");
const calculateDistance = require("../utils/distance");

exports.addSchool = (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validation
    if (!name || !address || latitude == null || longitude == null) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
    }


    if (
        typeof latitude !== "number" ||
        typeof longitude !== "number"
    ) {
        return res.status(400).json({
            success: false,
            message: "Latitude and Longitude must be numbers",
        });
    }

    const sql =
        "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";

    db.query(
        sql,
        [name, address, latitude, longitude],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message,
                });
            }

            res.status(201).json({
                success: true,
                message: "School added successfully",
                schoolId: result.insertId,
            });
        }
    );
};

exports.listSchools = (req, res) => {
    const userLat = parseFloat(req.query.latitude);
    const userLon = parseFloat(req.query.longitude);

    if (isNaN(userLat) || isNaN(userLon)) {
        return res.status(400).json({
            success: false,
            message: "Valid latitude and longitude required",
        });
    }

    db.query("SELECT * FROM schools", (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message,
            });
        }

        const schoolsWithDistance = results.map((school) => {
            const distance = calculateDistance(
                userLat,
                userLon,
                school.latitude,
                school.longitude
            );

            return {
                ...school,
                distance: distance.toFixed(2) + " KM",
            };
        });

        schoolsWithDistance.sort(
            (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
        );

        res.status(200).json({
            success: true,
            count: schoolsWithDistance.length,
            data: schoolsWithDistance,
        });
    });
};