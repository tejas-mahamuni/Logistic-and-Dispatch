const express = require("express");
const router = express.Router();
const getConnection = require("../db");


router.get("/kpis", async (req, res) => {

    let connection;

    try {

        connection = await getConnection();

        const result = await connection.execute(`
            SELECT
                (SELECT COUNT(*) FROM CUSTOMER) AS CUSTOMER_COUNT,
                (SELECT COUNT(*) FROM VEHICLE) AS VEHICLE_COUNT,
                (SELECT COUNT(*) FROM DRIVER)  AS DRIVER_COUNT,
                (SELECT COUNT(*) FROM DISPATCHASSIGNMENT)  AS ASSIGNMENT_COUNT,
                (SELECT COUNT(*) FROM DISPATCHORDER)  AS ORDERS_COUNT,
                (SELECT COUNT(*) FROM DELIVERY)  AS DELIVERY_COUNT
            FROM DUAL
        `);

        const row = result.rows[0];

        res.json({ customers: row[0], vehicles: row[1], drivers: row[2], assignments: row[3], orders: row[4], deliveries: row[5] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to compute dashboard KPIs" });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

router.get("/kpis-orders", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(`
      SELECT
        COUNT(CASE WHEN UPPER(STATUS) = 'PENDING' THEN 1 END)    AS PENDING_COUNT,
        COUNT(CASE WHEN UPPER(STATUS) = 'IN TRANSIT' THEN 1 END) AS TRANSIT_COUNT,
        COUNT(CASE WHEN UPPER(STATUS) = 'COMPLETED' THEN 1 END)  AS DELIVERED_COUNT
      FROM DISPATCHORDER
    `);

    const row = result.rows[0];

    // Returns: { pending: 12, transit: 5, completed: 28 }
    res.json({
      pending: row[0] || 0,
      transit: row[1] || 0,
      completed: row[2] || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute dispatch KPIs" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

router.get("/users", async (req, res) => {

    let connection;

    try {

        connection = await getConnection();

        const result = await connection.execute(`
            SELECT USER_ID, USERNAME, PASSWORD, ROLE, STATUS FROM USERS
        `);

        const users = result.rows.map((row) => ({
            userId: row[0],
            userName: row[1],
            password: row[2],
            role: row[3],
            status: row[4]
        }))

        res.json(users);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to compute dashboard KPIs" });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

router.get("/driver/:id", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
         A.ASSIGNMENTID, 
         A.ORDERID, 
         A.VEHICLEID, 
         A.ASSIGNEDDATE, 
         O.STATUS 
       FROM DISPATCHASSIGNMENT A 
       JOIN DISPATCHORDER O ON A.ORDERID = O.ORDERID 
       WHERE A.DRIVERID = :1`,
      [req.params.id]
    );

    const assignments = result.rows.map((row) => ({
      assignmentId: row[0],
      orderId: row[1],
      vehicleId: row[2],
      assignedDate: row[3],
      status: row[4], 
    }));

    res.json(assignments);
  } catch (err) {
    console.error("Error fetching driver assignments:", err);
    res.status(500).json({ message: "Failed to fetch driver assignments" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

router.get("/kpis-driver/:id", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(`
      SELECT
        COUNT(CASE WHEN UPPER(STATUS) = 'PENDING' THEN 1 END)    AS PENDING_COUNT,
        COUNT(CASE WHEN UPPER(STATUS) = 'IN TRANSIT' THEN 1 END) AS TRANSIT_COUNT,
        COUNT(CASE WHEN UPPER(STATUS) = 'COMPLETED' THEN 1 END)  AS DELIVERED_COUNT
      FROM DISPATCHORDER O JOIN DISPATCHASSIGNMENT A ON O.ORDERID = A.ORDERID WHERE A.DRIVERID =:1
    `,[req.params.id]);

    const row = result.rows[0];

    
    res.json({
      pending: row[0] || 0,
      transit: row[1] || 0,
      completed: row[2] || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute dispatch KPIs" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});



router.get("/active-assignments", async (req, res) => {

    let connection;

    try {

        connection = await getConnection();

        const result = await connection.execute(`
            SELECT a.ASSIGNMENTID, a.ORDERID, o.SOURCE, o.DESTINATION, o.STATUS,
                   d.DRIVERNAME, v.VEHICLENUMBER, TO_CHAR(a.ASSIGNEDDATE, 'YYYY-MM-DD')
            FROM DISPATCHASSIGNMENT a
            JOIN DISPATCHORDER o ON a.ORDERID = o.ORDERID
            JOIN DRIVER d ON a.DRIVERID = d.DRIVERID
            JOIN VEHICLE v ON a.VEHICLEID = v.VEHICLEID
            WHERE UPPER(o.STATUS) = 'DISPATCHED'
            ORDER BY a.ASSIGNMENTID DESC
        `);

        const assignments = result.rows.map((row) => ({
            assignmentId: row[0],
            orderId: row[1],
            source: row[2],
            destination: row[3],
            status: row[4],
            driverName: row[5],
            vehicleNumber: row[6],
            assignedDate: row[7],
        }));

        res.json(assignments);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to pull active assignment records" });

    } finally {
        if (connection) {
            await connection.close();
        }
    }

});


router.get("/pending-orders", async (req, res) => {

    let connection;

    try {

        connection = await getConnection();

        const result = await connection.execute(`
            SELECT ORDERID, SOURCE, DESTINATION, TO_CHAR(DISPATCHDATE, 'YYYY-MM-DD')
            FROM DISPATCHORDER
            WHERE UPPER(STATUS) = 'PENDING'
            ORDER BY ORDERID DESC
        `);

        const orders = result.rows.map((row) => ({
            orderId: row[0],
            source: row[1],
            destination: row[2],
            dispatchDate: row[3],
        }));

        res.json(orders);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to pull unassigned order queue" });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
});


//save
router.post("/deliver", async (req, res) => {

    let connection;

    const { orderId, deliveryDate, remarks, proofOfDelivery } = req.body;

    if (!orderId || !deliveryDate) {
        return res.status(400).json({ message: "Order ID and delivery date are required" });
    }

    try {

        connection = await getConnection();

        const orderCheck = await connection.execute(
            `SELECT STATUS FROM DISPATCHORDER WHERE ORDERID = :1`,
            [orderId]
        );

        if (!orderCheck.rows || orderCheck.rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (String(orderCheck.rows[0][0]).toUpperCase() === "DELIVERED") {
            return res.status(409).json({ message: "This order has already been settled as delivered" });
        }

        await connection.execute(
            `INSERT INTO DELIVERY (ORDERID, DELIVERYDATE, REMARKS, PROOFOFDELIVERY)
             VALUES (:1, TO_DATE(:2, 'YYYY-MM-DD'), :3, :4)`,
            [orderId, deliveryDate, remarks || null, proofOfDelivery || null],
            { autoCommit: false }
        );

        await connection.execute(
            `UPDATE DISPATCHORDER SET STATUS = 'Completed' WHERE ORDERID = :1`,
            [orderId],
            { autoCommit: false }
        );

        await connection.commit();

        res.json({ success: true, message: `Order ${orderId} settled as delivered successfully` });

    } catch (err) {
        console.error(err);

        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackErr) {
                console.error("Rollback failed:", rollbackErr);
            }
        }
        res.status(500).json({ message: "Failed to confirm delivery settlement" });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
});


module.exports = router;