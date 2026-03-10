import Cart from "../models/Cart.js";

// 🛒 Add or update cart
export const addCart = async (req, res) => {
  try {
    const uuid = req.visitorUuid
    const { items } = req.body

    if (!uuid) {
      return res.status(400).json({ message: "Visitor UUID missing" })
    }

    if (!items || !items.length) {
      return res.status(400).json({ message: "Items are required" })
    }

    let cart = await Cart.findOne({ uuid })

    if (!cart) {
      cart = new Cart({ uuid, items: [] })
    }

    items.forEach((newItem) => {
      const existingItem = cart.items.find(
        (i) => i.name === newItem.name
      )

      if (existingItem) {
        existingItem.quantity += newItem.quantity
      } else {
        cart.items.push({
          name: newItem.name,
          price: newItem.price,
          quantity: newItem.quantity,
          image: newItem.image,
        })
      }
    })

    await cart.save()
    res.status(200).json({ cart })
  } catch (err) {
    console.error("Add cart error:", err)
    res.status(500).json({ message: "Server error" })
  }
}


// 🔄 Update quantity (increment/decrement)
export const updateCartItem = async (req, res) => {
  try {
    const uuid = req.visitorUuid
    const { itemId, quantity } = req.body

    if (!uuid) return res.status(400).json({ message: "Visitor UUID missing" })
    if (!itemId) return res.status(400).json({ message: "Item ID required" })

    const cart = await Cart.findOne({ uuid })
    if (!cart) return res.status(404).json({ message: "Cart not found" })

    const item = cart.items.find(
      (i) => i._id.toString() === itemId
    )

    if (!item) return res.status(404).json({ message: "Item not found" })

    // auto remove if quantity <= 0
    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => i._id.toString() !== itemId
      )
    } else {
      item.quantity = quantity
    }

    await cart.save()
    return res.status(200).json({ cart })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}



// 📦 Get cart
export const getCart = async (req, res) => {
  try {
    const uuid = req.visitorUuid;
    if (!uuid) return res.status(400).json({ message: "Visitor UUID missing" });

    const cart = await Cart.findOne({ uuid });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    return res.status(200).json({ cart });
  } catch (error) {
    console.error("Error getting cart:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const uuid = req.visitorUuid;
    if (!uuid) return res.status(400).json({ message: "Visitor UUID missing" });

    await Cart.findOneAndDelete({ uuid });

    return res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// ❌ Remove ONLY ONE item by _id
export const removeItem = async (req, res) => {
  try {
    const uuid = req.visitorUuid
    const { itemId } = req.body

    if (!uuid) return res.status(400).json({ message: "Visitor UUID missing" })
    if (!itemId) return res.status(400).json({ message: "Item ID required" })

    const cart = await Cart.findOne({ uuid })
    if (!cart) return res.status(404).json({ message: "Cart not found" })

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    )

    await cart.save()
    return res.status(200).json({ cart })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}


