import { Link } from 'react-router-dom'
import { products } from '../data/products'

const Home = () => {
  const featuredProducts = products.filter(product => product.featured).slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blush-pink/20 via-white to-light-lavender/20 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                Handmade with Love
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8">
                Scrunchies & Bows for Every Mood
              </p>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                Discover our collection of beautiful, handmade hair accessories crafted with premium fabrics. 
                Each piece is made with love and attention to detail.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/shop" className="btn-primary text-center">
                  Shop Now
                </Link>
                <Link to="/about" className="btn-secondary text-center">
                  Our Story
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1605496036008-38a51ea3ad70?w=300&h=300&fit=crop" 
                      alt="Scrunchies" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <p className="text-center mt-4 font-semibold text-gray-700">Silk Scrunchies</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1605496036008-38a51ea3ad70?w=300&h=300&fit=crop&hue=240" 
                      alt="Bows" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <p className="text-center mt-4 font-semibold text-gray-700">Elegant Bows</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1605496036008-38a51ea3ad70?w=300&h=300&fit=crop&hue=120" 
                      alt="Cotton Scrunchies" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <p className="text-center mt-4 font-semibold text-gray-700">Cotton Comfort</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1605496036008-38a51ea3ad70?w=300&h=300&fit=crop&hue=60" 
                      alt="Combo Packs" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <p className="text-center mt-4 font-semibold text-gray-700">Combo Packs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our most loved pieces, crafted with premium materials and beautiful colors
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="card group">
                <div className="relative overflow-hidden rounded-t-xl">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.originalPrice > product.price && (
                    <div className="absolute top-4 left-4 bg-blush-pink text-white px-2 py-1 rounded-full text-sm font-semibold">
                      Sale
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-800">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      {product.colors.slice(0, 3).map((color) => (
                        <div 
                          key={color}
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <Link 
                    to={`/product/${product.id}`}
                    className="btn-primary w-full text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/shop" className="btn-secondary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-20 bg-gradient-to-r from-blush-pink/10 to-lavender/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  Combo Pack Special
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Get 20% off when you buy any combo pack! Perfect for gifting or treating yourself to a variety of beautiful pieces.
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blush-pink rounded-full"></div>
                    <span className="text-sm text-gray-600">4 pieces per pack</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-lavender rounded-full"></div>
                    <span className="text-sm text-gray-600">Mixed materials</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-mint-green rounded-full"></div>
                    <span className="text-sm text-gray-600">Perfect for gifting</span>
                  </div>
                </div>
                <Link to="/shop?category=combos" className="btn-primary">
                  Shop Combo Packs
                </Link>
              </div>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blush-pink/20 to-soft-pink/20 rounded-xl p-4">
                      <img 
                        src="https://images.unsplash.com/photo-1605496036008-38a51ea3ad70?w=200&h=200&fit=crop" 
                        alt="Combo 1" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-lavender/20 to-light-lavender/20 rounded-xl p-4">
                      <img 
                        src="https://images.unsplash.com/photo-1605496036008-38a51ea3ad70?w=200&h=200&fit=crop&hue=240" 
                        alt="Combo 2" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="bg-gradient-to-br from-mint-green/20 to-sage/20 rounded-xl p-4">
                      <img 
                        src="https://images.unsplash.com/photo-1605496036008-38a51ea3ad70?w=200&h=200&fit=crop&hue=120" 
                        alt="Combo 3" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-beige/20 to-cream/20 rounded-xl p-4">
                      <img 
                        src="https://images.unsplash.com/photo-1605496036008-38a51ea3ad70?w=200&h=200&fit=crop&hue=60" 
                        alt="Combo 4" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose Scrunch & Create?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're passionate about creating beautiful, high-quality hair accessories that you'll love to wear
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blush-pink to-soft-pink rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Handmade with Love</h3>
              <p className="text-gray-600">
                Each piece is carefully crafted by hand with attention to detail and love for the craft.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-lavender to-light-lavender rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Premium Quality</h3>
              <p className="text-gray-600">
                We use only the finest fabrics including silk, satin, and organic cotton for maximum comfort.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-mint-green to-sage rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Beautiful Colors</h3>
              <p className="text-gray-600">
                Our carefully curated color palette features soft pastels and elegant neutrals for every style.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
