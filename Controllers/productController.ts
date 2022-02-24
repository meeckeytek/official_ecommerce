import Product from "../models/product.model";
import Trash from "../models/trash.model";
import msg from "../middlewares/messages";
import cloudinary from "../middlewares/cloudinary";

export const getAllProducts = async (req: any, res: any) => {
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
      { name: new RegExp(String(search), "i") },
      { price: new RegExp(String(search), "i") },
      { category: new RegExp(String(search), "i") },
      { description: new RegExp(String(search), "i") },
    ],
  };

  const retrievedCounts = await Product.countDocuments(searchQuery);
  Product.countDocuments(searchQuery).then((productsCount) => {
    Product.find(searchQuery)
      .sort(sortQuery)
      .limit(limit)
      .skip(page * limit - limit)
      .then((products) => {
        return res.json({
          products,
          pagination: {
            hasPrevious: page > 1,
            prevPage: page - 1,
            hasNext: page < Math.ceil(productsCount / limit),
            next: page + 1,
            currentPage: Number(page),
            total: retrievedCounts,
            limit: limit,
            lastPage: Math.ceil(productsCount / limit),
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

export const newProduct = async (req: any, res: any) => {
  const { name, price, category, countInStock, description } = req.body;

  if (
    !req.file ||
    !name ||
    !price ||
    !category ||
    !countInStock ||
    !description
  ) {
    return res.status(422).json({ message: "msg.inputError" });
  }

  let productImage;

  try {
    productImage = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: "Ecommerce",
    });
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  const product = new Product({
    image: productImage.secure_url,
    name,
    price,
    category,
    countInStock,
    description,
    cloudinary_id: productImage.public_id,
  });

  try {
    await product.save();
  } catch (error) {
    return res.status(200).json({ message: msg.serverError });
  }

  res.status(201).json({ message: msg.newInputSuccess });
};
// export const adminAllProducts = async (req: string, res: any)=>{}
export const getProduct = async (req: any, res: any) => {
  const { productId } = req.params;

  let product;

  try {
    product = await Product.findById(productId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!product) {
    return res.status(404).json({ message: msg.notFound });
  }

  res.status(200).json(product);
};
export const commentProduct = async (req: any, res: any) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  let product;

  try {
    product = await Product.findById(productId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!product) {
    return res.status(404).json({ message: msg.notFound });
  }

  let newComment: any = {
    username: `${req.user.userFirstname} ${req.user.userLastname}`,
    rating,
    comment,
    date: new Date()
  };

  try {
    await Product.findByIdAndUpdate(productId, {
      $push: { comments: newComment },
    });
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }
  res.status(200).json({ message: msg.success });
};
export const editProduct = async (req: any, res: any) => {
  const { productId } = req.params;
  const { name, price, category, countInStock, description } = req.body;

  let product: any;

  try {
    product = await Product.findById(productId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!product) {
    return res.status(404).json({ message: msg.notFound });
  }
  
  product.name = name || product.name;
  product.price = price || product.price;
  product.category = category || product.category;
  product.countInStock = countInStock || product.countInStock;
  product.description = description || product.description;
  
  try {
    await product.save();
    console.log(product)
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  res.status(200).json({ message: msg.success });
};

export const editProductImage = async (req: any, res: any) => {
  const { productId } = req.params;

  let product: any;

  try {
    product = await Product.findById(productId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!product) {
    return res.status(404).json({ message: msg.notFound });
  }

  let productImage;

  try {
    await cloudinary.uploader.destroy(product.cloudinary_id);
    productImage = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: "Ecommerce",
    });
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  product.image = productImage.secure_url || product.image;
  product.cloudinary_id = product.public_id || product.cloudinary_id;

  try {
    await product.save();
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  res.status(200).json({ message: msg.success });
};
export const deleteProduct = async (req: any, res: any) => {
  const { productId } = req.params;

  let product: any;

  try {
    product = await Product.findById(productId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!product) {
    return res.status(404).json({ message: msg.notFound });
  }

  let newDelete = new Trash({
    recycleBin: {
      product
    },
    doneBy: {
      userId: req.user.userId,
      userFullname: `${req.user.userFirstname} ${req.user.userLastname}`,
    },
    deleteType: "Product",
  });

  try {
    await newDelete.save();
    await cloudinary.uploader.destroy(product.cloudinary_id);
    await product.remove();
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  res.status(200).json({ message: msg.success });
};
