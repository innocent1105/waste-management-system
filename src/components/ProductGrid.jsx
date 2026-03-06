import { Heart, Star } from 'lucide-react';

const ProductCard = ({ name, price, oldPrice, rating, image }) => {
  return (
    <div className="group bg-white/40 backdrop-blur-md border border-white/40 rounded-[2.5rem] p-5 shadow-sm hover:shadow-xl transition-all">
      <div className="relative aspect-square bg-[#FDFDFB] rounded-[2rem] overflow-hidden mb-4">
        <button className="absolute top-3 left-3 p-1.5 bg-blue-500 rounded-lg text-white">
          <Heart size={14} fill="currentColor" />
        </button>
        <img src={image} alt={name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform" />
      </div>
      
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-[#FF6B4A] font-bold text-xl">${price}</span>
            <span className="text-gray-400 line-through text-sm">${oldPrice}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Star size={14} className="fill-yellow-400 stroke-none" />
            <span>{rating}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="flex-1 py-2 rounded-xl bg-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">Wishlist</button>
        <button className="flex-1 py-2 rounded-xl bg-[#FF6B4A] text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-[#ff5a35]">Order Now</button>
      </div>
    </div>
  );
};

export default ProductCard;