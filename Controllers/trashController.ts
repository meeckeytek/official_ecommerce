import Trash from "../models/trash.model";
import User from "../models/user.model";
import Order from "../models/order.model";
import Product from "../models/product.model";
import msg from "../middlewares/messages";

//Get all deleted items
export const getAllTrash = async (req: any, res: any) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const sortBy = req.query.sortBy || "createdAt";
  const orderBy = req.query.orderBy || "-1";
  const { search } = req.body || "";
  const sortQuery = {
    [sortBy]: orderBy,
  };

  const searchQuery = {
    $or: [{ deleteType: new RegExp(String(search), "i") }],
  };

  const retrievedCounts = await Trash.countDocuments(searchQuery);
  Trash.countDocuments(searchQuery).then((trashesCount: any) => {
    Trash.find(searchQuery)
      .sort(sortQuery)
      .limit(limit)
      .skip(page * limit - limit)
      .then((trashes: any) => {
        return res.json({
          trashes,
          pagination: {
            hasPrevious: page > 1,
            prevPage: page - 1,
            hasNext: page < Math.ceil(trashesCount / limit),
            next: page + 1,
            currentPage: Number(page),
            total: retrievedCounts,
            limit: limit,
            lastPage: Math.ceil(trashesCount / limit),
          },
          links: {
            prevLink: `http://${
              req.headers.host
            }/api/v1/trash/allTrashes?&page=${page - 1}&limit=${limit}`,
            nextLink: `http://${
              req.headers.host
            }/api/v1/trash/allTrashes?&page=${page + 1}&limit=${limit}`,
          },
        });
      })
      .catch((err: any) => res.status(500).json({ message: msg.serverError }));
  });
};

//Get deleted item details
export const getTrashDetails = async (req: any, res: any) => {
  const { trashId } = req.params;
  let trash: any;
  try {
    trash = await Trash.findById(trashId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!trash) {
    return res.status(404).json({ message: msg.notFound });
  }

  res.status(200).json(trash);
};

//Restore
export const restore = async (req: any, res: any) => {
  const { trashId } = req.params;
  let trash: any;
  try {
    trash = await Trash.findById(trashId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!trash) {
    return res.status(404).json({ message: msg.notFound });
  }

  if (trash.deleteType == "User") {
    //Resotre disabled user
    try {
      await User.findByIdAndUpdate(trash.recycleBin.user._id, {
        disabled: false,
      });
    } catch (error) {
      return res.status(500).json({ message: msg.serverError });
    }
  } else if (trash.deleteType == "Product") {
    //Restore deleted product
    const restoreProduct = new Product({
      image: trash.recycleBin.product.image,
      name: trash.recycleBin.product.name,
      price: trash.recycleBin.product.price,
      category: trash.recycleBin.product.category,
      countInStock: trash.recycleBin.product.countInStock,
      description: trash.recycleBin.product.description,
      cloudinary_id: trash.recycleBin.product.cloudinary_id,
      comments: trash.recycleBin.product.comments,
    });
    await restoreProduct.save();
  } else {
    //Restore deleted order
    const restoreOrder = new Order({
      orderedProducts: trash.recycleBin.order.orderedProducts,
      shippingDetails: trash.recycleBin.order.shippingDetails,
      paymentMethod: trash.recycleBin.order.paymentMethod,
      totalPrice: trash.recycleBin.order.totalPrice,
      user: trash.recycleBin.order.user,
      isPaid: trash.recycleBin.order.isPaid,
      paidAt: trash.recycleBin.order.paidAt,
      isDelivered: trash.recycleBin.order.isDelivered,
      deliveredAt: trash.recycleBin.order.deliveredAt,
    });
    await restoreOrder.save();

    for (let i = 0; i < trash.recycleBin.order.orderedProducts.length; i++) {
      let product: any;
      try {
        product = await Product.findById(
          trash.recycleBin.order.orderedProducts[i].product._id
        );
      } catch (error) {
        return res.status(500).json({ message: msg.serverError });
      }
      product.countInStock -=
        trash.recycleBin.order.orderedProducts[i].quantity;
      await product.save();
    }
  }

  try {
    await trash.remove();
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  res.status(200).json({ message: msg.success });
};

//Delete parmanently
export const deleteTrash = async (req: any, res: any) => {
  const { trashId } = req.params;
  let trash: any;
  try {
    trash = await Trash.findById(trashId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!trash) {
    return res.status(404).json({ message: msg.notFound });
  }

  try {
    await trash.remove();
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  res.status(200).json({ message: msg.success });
};
