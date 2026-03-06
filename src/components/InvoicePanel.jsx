const InvoicePanel = () => {
  return (
    <div className="w-80 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 flex flex-col shadow-sm">
      <h2 className="text-xl font-bold mb-6">Invoice</h2>
      
      <div className="flex flex-col gap-4 mb-8">
        {/* Simple list of items */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-50 rounded-xl" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Vegetable Burger</p>
            <p className="text-[#FF6B4A] font-bold text-sm">$25</p>
          </div>
        </div>
        {/* Repeat for other items... */}
      </div>

      <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-gray-500 text-sm">
          <span>Sub Total</span>
          <span>$85</span>
        </div>
        <div className="flex justify-between font-bold text-lg mt-4">
          <span>Total Payment</span>
          <span>$79</span>
        </div>
      </div>

      <button className="w-full bg-[#FF6B4A] text-white py-4 rounded-2xl mt-8 font-bold shadow-lg shadow-orange-100">
        Place An Order Now
      </button>
    </div>
  );
};


export default InvoicePanel;