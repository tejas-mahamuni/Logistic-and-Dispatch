const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");
const router = express.Router();

const getConnection = require("../db");

router.post("/", async (req, res) => {
    try {
        const {driverName, driverPhone, licenseNumber} = req.body;

        const connection = await getConnection();

        await connection.execute(
            `INSERT INTO DRIVER(drivername, phone, licensenumber)
            VALUES(:1, :2, :3)`, 
            [driverName, driverPhone, licenseNumber],
            {autoCommit: true}
        );

        res.json({
            success: true,
            message: "Driver Added"
        });
    }
    catch(err) {
        res.status(500).json({
            success: false,
            message: "An error occured"
        })
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
});

router.get("/:id", async (req, res) => {
    try {
        const connection = await getConnection();

        const result = await connection.execute(
            `SELECT driverName, Phone, licenseNumber FROM DRIVER WHERE DRIVERID = :id`,
            [req.params.id]
        );


        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Record not found"
            })
        }

        const row = result.rows[0];

        res.json({
            driverName: row[0],
            driverPhone: row[1],
            licenseNumber: row[2]
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
                message: "Record not found"
        });
    }
    finally {
        if (connection) {
            await connection.close(); 
        }
    }
});


router.put("/:id", async (req, res) => {

    const {driverName, driverPhone, licenseNumber} = req.body;
    const connection = await getConnection();

    try {
        const result = await connection.execute(
            `UPDATE DRIVER SET DRIVERNAME = :1, PHONE = :2, LICENSENUMBER = :3 WHERE DRIVERID  = :4`,
            [driverName, driverPhone, licenseNumber, req.params.id],
            {autoCommit: true}
        );


        res.json({
            success: true,
            message: `Driver updated with ${req.params.id}`
        });

    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Record not found"
        });
    }
    finally {
        if (connection) {
            await connection.close(); 
        }
    }
});

router.delete("/:id", async(req,res) => {
    try {
        const connection = await getConnection();

        await connection.execute(
            `DELETE FROM DRIVER WHERE DRIVERID = :1`,
            [req.params.id],
            {autoCommit: true}
        );

        res.json({
            success: true,
            message: `Driver deleted with ${req.params.id}`
        });

    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Record not found"
        });
    }
    finally {
        if (connection) {
            await connection.close(); 
        }
    }
});

module.exports = router;