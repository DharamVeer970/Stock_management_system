"use client"
import Header from '@/components/Header'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Home() {
  const [productForm, setProductForm] = useState({})
  const [products, setProducts] = useState([])
  const [alert, setAlert] = useState("")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingaction, setLoadingaction] = useState(false)

  const [dropdown, setDropdown] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('/api/product')
      let rjson = await response.json()
      setProducts(rjson.products)
    }
    fetchProducts()

  }, [])

  const buttonAction = async (action, name, initialQuantity) => {
    let index = products.findIndex((item) => item.name == name)
    console.log(index)
    let newProducts = JSON.parse(JSON.stringify(products))

    if (action == "plus") {
      newProducts[index].quantity = parseInt(initialQuantity) + 1
      console.log(newProducts[index].quantity)
    }
    else {
      newProducts[index].quantity = parseInt(initialQuantity) - 1
    }
    setProducts(newProducts)


    let indexDrop = dropdown.findIndex((item) => item.name == name)
    console.log(indexDrop, "parse")
    let newDropdown = JSON.parse(JSON.stringify(dropdown))

    if (action == "plus") {
      newDropdown[indexDrop].quantity = parseInt(initialQuantity) + 1
      console.log(newDropdown[indexDrop].quantity)
    }
    else {
      newDropdown[indexDrop].quantity = parseInt(initialQuantity) - 1
    }
    setDropdown(newDropdown)



    console.log(action, name)
    setLoadingaction(true)
    const response = await fetch('/api/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, name, initialQuantity })
    });
    let r = await response.json()
    console.log(r)
    setLoadingaction(false)
  }

  const addProduct = async (e) => {


    try {
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productForm)
      });

      // Check if the response indicates success
      if (response.ok) {
        console.log('Product added successfully');
        setAlert("Your Product has been added!")
        setProductForm({})

      } else {
        console.error('Error adding product');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    const response = await fetch('/api/product')
    let rjson = await response.json()
    setProducts(rjson.products)
    e.preventDefault();
  }


  const handleChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value })
  }

  const onDropdownEdit = async (e) => {
    let value = e.target.value
    setQuery(value)
    if (value.length > 3) {
      setLoading(true)
      setDropdown([])
      const response = await fetch('/api/search?query=' + query)
      let rjson = await response.json()
      setDropdown(rjson.products)
      setLoading(false)
    }
    else {
      setDropdown([])
    }
  }


  return (
    <>
      <Header />
      {/* Search a Product */}
      <div className='text-green-800 text-center'>{alert}</div>
      <div className="container my-6  mx-auto ">
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Search a Product</h1>
          <div className="flex">
            <input
              onBlur={() => { setDropdown([]) }}
              onChange={onDropdownEdit}
              type="text"
              id="searchProduct"
              className="flex-1 border border-gray-300 px-4 py-2 mr-4"
              placeholder="Enter product name"
            />
            <select
              id="searchDropdown"
              className="border border-gray-300 px-4 py-2"
            >
              <option value="">All Categories</option>
              <option value="category1">Category 1</option>
              <option value="category2">Category 2</option>
              {/* Add more categories here */}
            </select>
          </div>
          {loading && <svg className='bg-green-100'

            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 40 40"
          >
            <circle
              cx="20"
              cy="20"
              r="14"
              fill="none"
              stroke="black"
              strokeWidth="3"
              strokeDasharray="60"
              strokeDashoffset="45"
            >
              <animate
                attributeName="strokeDashoffset"
                from="45"
                to="0"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>


          }
          <div className='dropcontainer absolute w-[75vw] border-1 bg-blue-200 rounded-md '>

            {dropdown.map(item => {
              return <div key={item.name} className='container flex justify-between my-1 border-b-2'>
                <span className='name'>{item.name}({item.quantity} available for ₹{item.price})</span>
                <div className='mx-5'>

                  <button onClick={() => { buttonAction("minus", item.name, item.quantity) }} disabled={loadingaction} className='substract inline-block px-2 py-1 cursor-pointer bg-purple-400 text-white font-semibold rounded-lg shadow-md disabled:bg-purple-200'> - </button>
                  <span className='quantity inline-block min-w-3  mx-3'>{item.quantity}</span>

                  <button onClick={() => { buttonAction("plus", item.name, item.quantity) }} disabled={loadingaction} className='add inline-block px-2 py-1 cursor-pointer bg-purple-400 text-white font-semibold rounded-lg shadow-md disabled:bg-purple-200'> + </button>
                </div>
              </div>
            })}
          </div>
        </div>
      </div>


      {/*//Display Current Stock*/}
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add a Product</h1>
        <form>
          <div className="mb-4">
            <label htmlFor='productName' className='block mb-2'>Product Name</label>
            <input value={productForm?.name || ""} name='name' onChange={handleChange} type="text" id="productName" className="w-full border border-gray-300 px-4 py-2" />
          </div>

          <div className="mb-4">
            <label htmlFor='Quantity' className='block mb-2'>Quantity</label>
            <input value={productForm?.quantity || ""} name='quantity' onChange={handleChange} type="number" id="quantity" className="w-full border border-gray-300 px-4 py-2" />
          </div>

          <div className="mb-4">
            <label htmlFor='price' className='block mb-2'>Price</label>
            <input value={productForm?.price || ""} name='price' onChange={handleChange} type="number" id="price" className="w-full border border-gray-300 px-4 py-2" />
          </div>

          <button
            onClick={addProduct}
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Add a Product
          </button>


        </form>
      </div>
      <div className='container my-6  mx-auto'>
        <h1 className="text-2xl font-bold mb-6">Display Current Stock</h1>

        <table className='table-auto w-full'>
          <thead>
            <tr>
              <th className='px-4 py-2'>Product Name</th>
              <th className='px-4 py-2'>Quantity</th>
              <th className='px-4 py-2'>Prices</th>
            </tr>
          </thead>
          <tbody>
            {/* Sample data */}

            {products && products.length > 0 ? (
              products.map(product => (
                <tr key={product.name}>
                  <td className='border px-4 py-2'>{product.name}</td>
                  <td className='border px-4 py-2'>{product.quantity}</td>
                  <td className='border px-4 py-2'>₹{product.price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No products available</td>
              </tr>
            )}
            {/*Add more rows for each product in your stock */}
          </tbody>
        </table>

      </div>
    </>
  )
}
