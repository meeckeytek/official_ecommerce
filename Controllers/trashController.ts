import Trash from "../models/trash.model";
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
  Trash.countDocuments(searchQuery).then((trashesCount) => {
    Trash.find(searchQuery)
      .sort(sortQuery)
      .limit(limit)
      .skip(page * limit - limit)
      .then((trashes) => {
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
            }/api/v1/product/allProducts?&page=${page - 1}&limit=${limit}`,
            nextLink: `http://${
              req.headers.host
            }/api/v1/product/allProducts?&page=${page + 1}&limit=${limit}`,
          },
        });
      })
      .catch((err) => console.log(err));
  });
};

//Get deleted users
export const allDeletedUsers = async (req: any, res: any) => {
  let deletedUsers: any;

  try {
    deletedUsers = await Trash.find({ deleteType: "User" });
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!deletedUsers) {
    return res.status(404).json({ message: msg.notFound });
  }

  res.status(200).json(deletedUsers);
};

//Get deleted products
export const allDeletedProducts = async (req: any, res: any) => {
  let deletedProducts: any;

  try {
    deletedProducts = await Trash.find({ deleteType: "Product" });
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!deletedProducts) {
    return res.status(404).json({ message: msg.notFound });
  }

  res.status(200).json(deletedProducts);
};


//Get deleted orders
export const allDeletedOrders = async (req: any, res: any) => {
    let deletedOrderss: any;
  
    try {
      deletedOrderss = await Trash.find({ deleteType: "Order" });
    } catch (error) {
      return res.status(500).json({ message: msg.serverError });
    }
  
    if (!deletedOrderss) {
      return res.status(404).json({ message: msg.notFound });
    }
  
    res.status(200).json(deletedOrderss);
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
