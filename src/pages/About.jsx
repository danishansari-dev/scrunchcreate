const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Our Story
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From a small passion project to creating beautiful hair accessories that bring joy to people's lives
          </p>
        </div>

        {/* Main Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Handmade with Love
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Scrunch & Create was born from a simple love for beautiful hair accessories and the joy of creating something special by hand. What started as a hobby in a small Mumbai apartment has grown into a passion for crafting unique, high-quality scrunchies and bows.
              </p>
              <p>
                Every piece in our collection is carefully handmade using premium fabrics like silk, satin, and organic cotton. We believe that the little details matter - from the perfect stitch to the softest materials, each accessory is crafted with attention to detail and love for the craft.
              </p>
              <p>
                Our mission is simple: to create beautiful, comfortable, and durable hair accessories that make you feel confident and beautiful every day. Whether you're heading to work, a special occasion, or just want to add a touch of elegance to your everyday look, we have something perfect for you.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg transform rotate-3">
                  <img 
                    src="https://images.unsplash.com/photo-1605496036008-38a51ea3ad70?w=300&h=300&fit=crop" 
                    alt="Crafting Process" 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <p className="text-center mt-4 font-semibold text-gray-700">Crafting Process</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg transform -rotate-2">
                  <img 
                    src="https://images.unsplash.com/photo-1605496036008-38a51ea3ad70?w=300&h=300&fit=crop&hue=120" 
                    alt="Premium Materials" 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <p className="text-center mt-4 font-semibold text-gray-700">Premium Materials</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg transform -rotate-1">
                  <img 
                    src="https://images.unsplash.com/photo-1605496036008-38a51ea3ad70?w=300&h=300&fit=crop&hue=240" 
                    alt="Quality Control" 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <p className="text-center mt-4 font-semibold text-gray-700">Quality Control</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg transform rotate-2">
                  <img 
                    src="https://images.unsplash.com/photo-1605496036008-38a51ea3ad70?w=300&h=300&fit=crop&hue=60" 
                    alt="Final Product" 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <p className="text-center mt-4 font-semibold text-gray-700">Final Product</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-20">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blush-pink to-soft-pink rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quality First</h3>
              <p className="text-gray-600">
                We never compromise on quality. Every piece is crafted with the finest materials and attention to detail.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-lavender to-light-lavender rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Handmade</h3>
              <p className="text-gray-600">
                Each piece is lovingly handmade, ensuring unique character and personal touch in every accessory.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-mint-green to-sage rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Sustainability</h3>
              <p className="text-gray-600">
                We're committed to sustainable practices, using eco-friendly materials and minimizing waste.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Meet the Maker
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blush-pink to-soft-pink rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Priya Sharma</h3>
              <p className="text-gray-600 mb-6">
                Founder & Creative Director
              </p>
              <p className="text-gray-600 leading-relaxed">
                "I started Scrunch & Create with a simple dream: to make beautiful, high-quality hair accessories that bring joy to everyday moments. Every piece I create is infused with love and care, and I hope you can feel that when you wear them."
              </p>
            </div>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Our Journey
          </h2>
          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-blush-pink rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                2020
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">The Beginning</h3>
                <p className="text-gray-600">
                  Started as a hobby, making scrunchies for friends and family. The positive feedback and joy these accessories brought inspired us to share them with more people.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-lavender rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                2021
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">First Collection</h3>
                <p className="text-gray-600">
                  Launched our first official collection with 10 unique designs. Started selling at local markets and through social media.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-mint-green rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                2022
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Growing Community</h3>
                <p className="text-gray-600">
                  Expanded our product range to include bows and combo packs. Built a loyal customer base and started receiving orders from across India.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-beige rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                2023
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Online Presence</h3>
                <p className="text-gray-600">
                  Launched our online store to reach more customers nationwide. Introduced premium silk collection and expanded color palette.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Join Our Story
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Be part of our journey and discover the perfect hair accessories that reflect your unique style and personality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/shop" className="btn-primary">
              Shop Our Collection
            </a>
            <a href="/contact" className="btn-secondary">
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
