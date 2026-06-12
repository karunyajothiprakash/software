const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const db = require('../db');

// GET /api/quotations/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT q.*, 
              c.name as customer_name, c.address as customer_address, c.phone as customer_phone
       FROM quotations q
       LEFT JOIN customers c ON q.customer_id = c.id
       WHERE q.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    const row = result.rows[0];
    const { customer_name, customer_address, customer_phone, ...quotation } = row;

    res.json({
      ...quotation,
      customers: customer_name ? {
        name: customer_name,
        address: customer_address,
        phone: customer_phone
      } : null
    });
  } catch (err) {
    console.error("DB Error (get quotation):", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/quotations/:id/items
router.get('/:id/items', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY created_at`,
      [req.params.id]
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error("DB Error (get quotation items):", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/quotations
router.post('/', requireAuth, async (req, res) => {
  try {
    const { quotation, items } = req.body;
    
    await db.query('BEGIN');

    // Create quotation
    const qCols = Object.keys(quotation).filter(k => quotation[k] !== undefined);
    const qVals = qCols.map(k => quotation[k]);
    const qPlaceholders = qCols.map((_, i) => `$${i + 1}`).join(', ');

    const qRes = await db.query(
      `INSERT INTO quotations (${qCols.join(', ')}) VALUES (${qPlaceholders}) RETURNING *`,
      qVals
    );
    const qData = qRes.rows[0];

    // Attach items
    if (items && items.length > 0) {
      for (const item of items) {
        const itemCols = Object.keys(item).filter(k => item[k] !== undefined);
        const itemVals = itemCols.map(k => item[k]);
        
        itemCols.push('quotation_id');
        itemVals.push(qData.id);
        
        const itemPlaceholders = itemCols.map((_, i) => `$${i + 1}`).join(', ');

        await db.query(
          `INSERT INTO quotation_items (${itemCols.join(', ')}) VALUES (${itemPlaceholders})`,
          itemVals
        );
      }
    }

    await db.query('COMMIT');
    res.status(201).json(qData);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error("DB Error (create quotation):", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /api/quotations/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { quotation, itemsToUpdate, itemsToInsert } = req.body;

    await db.query('BEGIN');

    // Update quotation
    if (quotation && Object.keys(quotation).length > 0) {
      const setClauses = [];
      const values = [];
      let idx = 1;

      for (const [key, value] of Object.entries(quotation)) {
        setClauses.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
      values.push(req.params.id);

      await db.query(
        `UPDATE quotations SET ${setClauses.join(', ')} WHERE id = $${idx}`,
        values
      );
    }

    // Update items
    if (itemsToUpdate && itemsToUpdate.length > 0) {
      for (const item of itemsToUpdate) {
        const setClauses = [];
        const values = [];
        let idx = 1;
        const itemId = item.id;
        
        const itemCopy = { ...item };
        delete itemCopy.id;

        for (const [key, value] of Object.entries(itemCopy)) {
          setClauses.push(`${key} = $${idx}`);
          values.push(value);
          idx++;
        }
        values.push(itemId);

        await db.query(
          `UPDATE quotation_items SET ${setClauses.join(', ')} WHERE id = $${idx}`,
          values
        );
      }
    }

    // Insert new items
    if (itemsToInsert && itemsToInsert.length > 0) {
      for (const item of itemsToInsert) {
        const itemCols = Object.keys(item).filter(k => item[k] !== undefined);
        const itemVals = itemCols.map(k => item[k]);
        
        itemCols.push('quotation_id');
        itemVals.push(req.params.id);
        
        const itemPlaceholders = itemCols.map((_, i) => `$${i + 1}`).join(', ');

        await db.query(
          `INSERT INTO quotation_items (${itemCols.join(', ')}) VALUES (${itemPlaceholders})`,
          itemVals
        );
      }
    }

    await db.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error("DB Error (update quotation):", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
