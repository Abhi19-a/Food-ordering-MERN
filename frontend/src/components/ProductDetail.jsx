import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../api";
import { localImageFiles, toSlug } from "../data/localImages";
import { useCart } from "../contexts/CartContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./ProductDetail.css";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    id: '',
    name: '',
    price: 0,
    category: '',
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { getFoods } = useApi();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const foods = await getFoods();
        const foodItem = foods.find(food => {
          const foodSlug = food.name.toLowerCase().replace(/\s+/g, '-');
          return foodSlug === slug;
        });

        if (foodItem) {
          const imageFilename = localImageFiles.find(filename => {
            const name = filename.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return name === slug;
          });
          
          setProduct({
            ...foodItem,
            imageUrl: imageFilename ? `/images/${imageFilename}` : '/placeholder-food.jpg'
          });
        } else {
          // If product not found, redirect to home
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, getFoods, navigate]);

  if (loading) {
    return (
      <div className="product-detail">
        <div className="loading">Loading delicious details...</div>
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="product-detail">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back to Menu
      </button>
      
      <div className="product-container">
        <div className="product-image">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = '/placeholder-food.jpg';
            }} 
          />
        </div>
        
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">₹{product.price}</p>
          <p className={`category ${product.category.toLowerCase().includes('veg') ? 'veg' : ''}`}>
            {product.category}
          </p>
          
          <div className="description">
            <h3>Description</h3>
            <p>{product.description || 'No description available for this item.'}</p>
          </div>
          
          <div className="add-to-cart">
            <div className="quantity-selector">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(prev => Math.max(1, prev - 1));
                }}
                disabled={quantity <= 1}
              >-</button>
              <span>{quantity}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement quantity increase
                  setQuantity(prev => prev + 1);
                }}
              >+</button>
            </div>
            <button 
              className="add-to-cart-button"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, quantity);
                toast.success(`${quantity} ${product.name} added to cart!`, {
                  position: "bottom-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                });
                setQuantity(1);
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
