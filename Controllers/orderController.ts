import Order from "../models/order.model";
import Product from "../models/product.model";
import Trash from "../models/trash.model";
import msg from "../middlewares/messages";

//All orders (Admin only)
export const getAllOrder = async (req: any, res: any) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const sortBy = req.query.sortBy || "createdAt";
  const orderBy = req.query.orderBy || "-1";
  const { search } = req.body || "";
  const sortQuery = {
    [sortBy]: orderBy,
  };

  const searchQuery = {
    $or: [
      { paymentMethod: new RegExp(String(search), "i") },
      { totalPrice: new RegExp(String(search), "i") },
      { isPaid: new RegExp(String(search), "i") },
      { isDelivered: new RegExp(String(search), "i") },
    ],
  };

  const retrievedCounts = await Order.countDocuments(searchQuery);
  Order.countDocuments(searchQuery).then((ordersCount:any) => {
    Order.find(searchQuery)
      .sort(sortQuery)
      .limit(limit)
      .skip(page * limit - limit)
      .then((orders:any) => {
        return res.json({
          orders,
          pagination: {
            hasPrevious: page > 1,
            prevPage: page - 1,
            hasNext: page < Math.ceil(ordersCount / limit),
            next: page + 1,
            currentPage: Number(page),
            total: retrievedCounts,
            limit: limit,
            lastPage: Math.ceil(ordersCount / limit),
          },
          links: {
            prevLink: `http://${
              req.headers.host
            }/api/v1/order/allOrders?&page=${page - 1}&limit=${limit}`,
            nextLink: `http://${req.headers.host}/api/v1/order/allOrders?&page=${
              page + 1
            }&limit=${limit}`,
          },
        });
      })
      .catch((err: any) => res.status(500).json({message: msg.serverError}));
  });
};

//Get user orders details
export const getUserOrders = async (req: any, res: any) => {
  let orders: any;
  try {
    orders = await Order.find({ user: req.user.userId });
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!orders) {
    return res.status(404).json({ message: msg.notFound });
  }
  return res.status(200).json(orders);
};

//Get all unpaid orders (Admin only)
export const unpaidOrders = async (req: any, res: any) => {
  let orders: any;
  try {
    orders = await Order.find({ isPaid: "False" });
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!orders) {
    return res.status(404).json({ message: msg.notFound });
  }

  return res.status(200).json(orders);
};

//Get all undelivered orders (Admin only)
export const undeliveredOrders = async (req: string, res: any) => {
  let orders: any;
  try {
    orders = await Order.find({ isDelivered: "False" });
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!orders) {
    return res.status(404).json({ message: msg.notFound });
  }
  return res.status(200).json(orders);
};

//Get order details
export const getOrderDetails = async (req: any, res: any) => {
  const { orderId } = req.params;

  let order: any;

  try {
    order = await Order.findById(orderId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!order) {
    return res.status(404).json({ message: msg.notFound });
  }

  if (req.user.userId != order.user && req.user.isAdmin != true) {
    return res.status(403).json({ message: msg.notAuthorized });
  }

  res.status(200).json(order);
};

// New order
export const newOrder = async (req: any, res: any) => {
  const {
    orderItems,
    paymentMethod,
    firstname,
    lastname,
    address,
    email,
    phone,
    state,
    localGovernmentArea,
  } = req.body;

  //Validating each input
  if (
    !firstname ||
    !lastname ||
    !address ||
    !email ||
    !phone ||
    !state ||
    !localGovernmentArea
  ) {
    return res.status(422).json({ message: msg.inputError });
  }

  let product: any;
  let orderedProducts = [];
  let newQuantity: Number;

  //Fetching each product
  for (let i = 0; i < orderItems.length; i++) {
    try {
      product = await Product.findById(orderItems[i].productId, [
        "-comments",
        "-cloudinary_id",
        "-createdAt",
        "-updatedAt",
        "-__v",
        "-description",
      ]);
    } catch (error) {
      return res.status(500).json({ message: msg.notFound });
    }

    //Validating product
    if (!product) {
      return res.status(404).json({ message: msg.notFound });
    }

    //Reducing the quantity of each product based on the ordered product
    if (orderItems[i].quantity > product.countInStock) {
      return res.status(422).json({
        message: `Available quantity for ${product._id} - ${product.name} is ${product.countInStock}`,
      });
    }
    let productTotal: Number = Number(product.price) * orderItems[i].quantity;
    let quantity: Number = orderItems[i].quantity;
    let newQuantity: Number = product.countInStock - orderItems[i].quantity;

    product.countInStock = newQuantity;

    orderedProducts.push({ product, quantity, productTotal });

    //Saving the new product
    try {
      await product.save();
    } catch (error) {
      return res.status(500).json({ message: msg.serverError });
    }
  }

  //Fetching all ordered product price to calculated total price
  let goodsPrices: any = [];
  orderedProducts.forEach((item) => goodsPrices.push(item.productTotal));
  let totalPrice = goodsPrices.reduce((a: any, b: any) => a + b);

  //Fetching customer shipping details
  let shippingDetails: any = {
    firstname,
    lastname,
    address,
    email,
    phone,
    state,
    localGovernmentArea,
  };

  //Creating new order to save in DB
  const newOrder = new Order({
    orderedProducts,
    shippingDetails,
    paymentMethod,
    totalPrice,
    user: req.user.userId,
  });

  //Saving order into the DB
  try {
    await newOrder.save();
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  res.status(201).json({ message: msg.newInputSuccess });
};

//Mark order as paid
export const isPaid = async (req: any, res: any) => {
  const { orderId } = req.params;

  let order: any;

  try {
    order = await Order.findById(orderId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!order) {
    return res.status(404).json({ message: msg.notFound });
  }

  order.isPaid = "True";
  order.paidAt = new Date();

  try {
    await order.save();
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }
  res.status(200).json({ message: msg.success });
};

//Mark order as delivered
export const isDelivered = async (req: any, res: any) => {
  const { orderId } = req.params;

  let order: any;

  try {
    order = await Order.findById(orderId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!order) {
    return res.status(404).json({ message: msg.notFound });
  }

  order.isDelivered = "True";
  order.deliveredAt = new Date();

  try {
    await order.save();
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }
  res.status(200).json({ message: msg.success });
};

//User delete order
export const deleteOrder = async (req: any, res: any) => {
  const { orderId } = req.params;

  let order: any;

  try {
    order = await Order.findById(orderId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!order) {
    return res.status(404).json({ message: msg.notFound });
  }

  if (req.user.userId != order.user && req.user.isAdmin != true) {
    return res.status(403).json({ message: msg.notAuthorized });
  }

  for(let i = 0;  i < order.orderedProducts.length; i++){
    let product:any;
    try {
      product = await Product.findById(order.orderedProducts[i].product._id)
    } catch (error) {
      return res.status(500).json({message: msg.serverError})
    }
    product.countInStock += order.orderedProducts[i].quantity;
   await product.save()
  }


  //Increase the product count

  const newDelete = new Trash({
    recycleBin: {
      order,
    },
    doneBy: {
      userId: req.user.userId,
      userFullname: `${req.user.userFirstname} ${req.user.userLastname}`,
    },
    deleteType: "Order",
  });

  try {
    // await newDelete.save();
    // await order.remove();
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  res.status(200).json({ message: msg.success });
};
export const payment = async (req: any, res: any) => {};
