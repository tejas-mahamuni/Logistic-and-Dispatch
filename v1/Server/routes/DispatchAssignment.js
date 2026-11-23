const express = require("express");
const router = express.Router();
const getConnection = require("../db");

router.get("/new-id", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT NVL(MAX(ASSIGNMENTID), 0) + 1 FROM DISPATCHASSIGNMENT`
    );

    res.json({ nextId: result.rows[0][0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error calculating sequence parameters" });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});


router.get("/orders", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    // Query strictly filters by status = 'Pending' as requested
    const query = `
      SELECT ORDERID, CUSTOMERID, TO_CHAR(DISPATCHDATE, 'YYYY-MM-DD'), SOURCE, DESTINATION, STATUS 
      FROM DISPATCHORDER 
      WHERE UPPER(STATUS) = 'PENDING'
      ORDER BY ORDERID
    `;

    const result = await connection.execute(query);

    res.json(
      result.rows.map((row) => ({
        orderId: row[0],
        customerId: row[1],
        dispatchDate: row[2],
        source: row[3],
        destination: row[4],
        status: row[5],
      }))
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load orders" });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});



router.get("/drivers", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT DRIVERID, DRIVERNAME FROM DRIVER ORDER BY DRIVERID`
    );

    res.json(
      result.rows.map((row) => ({ driverId: row[0], driverName: row[1] }))
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load drivers" });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});


router.get("/vehicles", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT VEHICLEID, VEHICLENUMBER, VEHICLETYPE, CAPACITY FROM VEHICLE ORDER BY VEHICLEID`
    );

    res.json(
      result.rows.map((row) => ({
        vehicleId: row[0],
        vehicleNumber: row[1],
        vehicleType: row[2],
        capacity: row[3],
      }))
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load vehicles" });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});



router.get("/", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT a.ASSIGNMENTID, a.ORDERID, a.DRIVERID, a.VEHICLEID, a.ASSIGNEDDATE, o.STATUS
       FROM DISPATCHASSIGNMENT a
       LEFT JOIN DISPATCHORDER o ON a.ORDERID = o.ORDERID
       ORDER BY a.ASSIGNMENTID`
    );

    const assignments = result.rows.map(row => ({
      assignmentId: row[0],
      orderId: row[1],
      driverId: row[2],
      vehicleId: row[3],
      assignedDate: row[4],
      orderStatus: row[5] || "N/A"
    }));

    res.json(assignments);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lookup failure" });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});


router.get("/next/:id", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT a.ASSIGNMENTID, a.ORDERID, a.DRIVERID, a.VEHICLEID, a.ASSIGNEDDATE, o.STATUS
       FROM DISPATCHASSIGNMENT a
       LEFT JOIN DISPATCHORDER o ON a.ORDERID = o.ORDERID
       WHERE a.ASSIGNMENTID = (
         SELECT MIN(ASSIGNMENTID) FROM DISPATCHASSIGNMENT WHERE ASSIGNMENTID > :1
       )`,
      [req.params.id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "No more records" });
    }

    const row = result.rows[0];

    res.json({
      assignmentId: row[0],
      orderId: row[1],
      driverId: row[2],
      vehicleId: row[3],
      assignedDate: row[4],
      orderStatus: row[5] || "N/A"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Pagination error" });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});



router.get("/previous/:id", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT a.ASSIGNMENTID, a.ORDERID, a.DRIVERID, a.VEHICLEID, a.ASSIGNEDDATE, o.STATUS
       FROM DISPATCHASSIGNMENT a
       LEFT JOIN DISPATCHORDER o ON a.ORDERID = o.ORDERID
       WHERE a.ASSIGNMENTID = (
         SELECT MAX(ASSIGNMENTID) FROM DISPATCHASSIGNMENT WHERE ASSIGNMENTID < :1
       )`,
      [req.params.id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "No prior records" });
    }

    const row = result.rows[0];

    res.json({
      assignmentId: row[0],
      orderId: row[1],
      driverId: row[2],
      vehicleId: row[3],
      assignedDate: row[4],
      orderStatus: row[5] || "N/A"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Pagination error" });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});



router.get("/:id", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT a.ASSIGNMENTID, a.ORDERID, a.DRIVERID, a.VEHICLEID, a.ASSIGNEDDATE, o.STATUS
       FROM DISPATCHASSIGNMENT a
       LEFT JOIN DISPATCHORDER o ON a.ORDERID = o.ORDERID
       WHERE a.ASSIGNMENTID = :1`,
      [req.params.id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    const row = result.rows[0];

    res.json({
      assignmentId: row[0],
      orderId: row[1],
      driverId: row[2],
      vehicleId: row[3],
      assignedDate: row[4],
      orderStatus: row[5] || "N/A"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lookup failure" });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});



router.post("/", async (req, res) => {
  let connection;
  const { orderId, driverId, vehicleId, dateTime } = req.body;

  try {
    connection = await getConnection();

    // Insert assignment
    if (!dateTime) {
      await connection.execute(
        `INSERT INTO DISPATCHASSIGNMENT (ORDERID, DRIVERID, VEHICLEID) VALUES (:1, :2, :3)`,
        [orderId, driverId, vehicleId]
      );
    } else {
      await connection.execute(
        `INSERT INTO DISPATCHASSIGNMENT (ORDERID, DRIVERID, VEHICLEID, ASSIGNEDDATE) VALUES (:1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'))`,
        [orderId, driverId, vehicleId, dateTime]
      );
    }

    // Update dispatch order status to 'In Transit'
    await connection.execute(
      `UPDATE DISPATCHORDER SET STATUS = 'In Transit' WHERE ORDERID = :1`,
      [orderId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Assignment Transaction Saved Successfully",
    });

  } catch (err) {
    console.error("Assignment Transaction Failed: ", err);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Transaction Rollback Failed: ", rollbackErr);
      }
    }

    res.status(500).json({ success: false, message: "Insertion failed" });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});



router.put("/:id", async (req, res) => {
  let connection;
  const { orderId, driverId, vehicleId, dateTime } = req.body;

  try {
    connection = await getConnection();

    await connection.execute(
      `UPDATE DISPATCHASSIGNMENT 
       SET ORDERID = :1, 
           DRIVERID = :2, 
           VEHICLEID = :3, 
           ASSIGNEDDATE = CASE WHEN :4 IS NULL THEN NULL ELSE TO_DATE(:4, 'YYYY-MM-DD') END 
       WHERE ASSIGNMENTID = :5`,
      [orderId, driverId, vehicleId, dateTime || null, req.params.id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: `Assignment ID ${req.params.id} updated successfully`,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update declined" });

  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

module.exports = router;
